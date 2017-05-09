import { createStore, applyMiddleware } from 'redux';

import penderMiddleware from 'redux-pender';
import { createLogger } from 'redux-logger';

import reducers from './reducers';

const logger = createLogger();

const store = createStore(
    reducers,
    applyMiddleware(logger, penderMiddleware())
);

export default store;