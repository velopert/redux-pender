import { handleActions } from 'redux-actions';
import { applyPenders } from 'redux-pender';

import * as actionTypes from '../actions/actionTypes';

const { LOAD_POST, SHOW_NEXT, SHOW_PREV } = actionTypes;

const initialState = {
  id: 1,
  post: {}
};

const reducer = handleActions({
  [SHOW_NEXT]: (state, action) => ({
    ...state,
    id: state.id + 1
  }),
  [SHOW_PREV]: (state, action) => ({
    ...state,
    id: state.id - 1
  })
}, initialState);

export default applyPenders(reducer, [
  {
    type: LOAD_POST,
    onSuccess: (state, action) => ({
      ...state,
      post: action.payload.data
    }),
    onCancel: (state, action) => ({
      ...state,
      post: {
        title: 'cancelled',
        body: 'cancelled'
      }
    })
  }
]);