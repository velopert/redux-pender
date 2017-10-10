import Fetcher from '../src/Fetcher';

test('Fetcher', () => {
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

  const fetcher = new Fetcher(fetchConfig);
  
  fetcher.process('/item/1/hello');
  expect(state.params.itemId).toBe('1');
  expect(state.params.name).toBe('hello');

  fetcher.process('/themes');
  expect(state.params).toEqual({});

  fetcher.process('/theme/basic/123');
  expect(state.params.id).toBe('123');

  fetcher.process('/themes?test=hello');
  expect(state.query.test).toBe('hello');
})