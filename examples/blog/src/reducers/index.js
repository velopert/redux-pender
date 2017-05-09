import { combineReducers } from 'redux';

import { penderReducer } from 'redux-pender';
import blog from './blog';

const reducers = combineReducers({
    blog,
    pender: penderReducer
});

export default reducers;