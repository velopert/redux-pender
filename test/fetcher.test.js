import fetcher from '../src/fetcher';

test('fetcher', () => {
  let state = {
    params: null,
    query: null
  };

  function updateState(params, query) {
    state = {
      params, query
    };
  }

  const fetchConfig = [
    {
      path: '/item/:itemId/:name?',
      resolve: updateState
    },
    {
      path: '/themes',
      resolve: updateState
    },
    {
      path: '/theme/:type/:id?/:name?',
      resolve: updateState
    }
  ];

  fetcher.init(fetchConfig);

  fetcher.process('/item/1/hello');
  expect(state.params.itemId).toBe('1');
  expect(state.params.name).toBe('hello');

  fetcher.process('/themes');
  expect(state.params).toEqual({});

  fetcher.process('/theme/basic/123');
  expect(state.params.id).toBe('123');
})