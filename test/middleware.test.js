import { createStore, applyMiddleware } from 'redux';
import middleware from '../lib/middleware';
import reducer from '../lib/penderReducer';

let store = null;

describe('middleware', () => {
  it('successfully initializes store with middleware', () => {
    store = createStore(reducer, applyMiddleware(middleware()));

    expect(store.getState()).toBeTruthy();
  });
});
