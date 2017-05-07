import middleware from '../src/middleware';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../src/reducer';

let store = null;

test('successfully initializes store with middleware', () => {
    store = createStore(
        reducer,
        applyMiddleware(middleware)
    );

    expect(store.getState()).toBeTruthy();
})