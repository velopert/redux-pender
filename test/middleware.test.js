import { createStore, applyMiddleware } from 'redux';
import middleware from '../src/middleware';
import reducer from '../src/reducer';

let store = null;

describe('middleware', () => {
  it('successfully initializes store with middleware', () => {
    store = createStore(reducer, applyMiddleware(middleware()));

    expect(store.getState()).toBeTruthy();
  });
});
