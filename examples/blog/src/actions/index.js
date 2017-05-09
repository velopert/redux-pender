import { createAction } from 'redux-actions';
import * as api from '../lib/api';

import * as actionTypes from './actionTypes';

const { LOAD_POST, SHOW_NEXT, SHOW_PREV } = actionTypes;

export const loadPost = createAction(LOAD_POST, api.loadPost);
export const showNext = createAction(SHOW_NEXT);
export const showPrev = createAction(SHOW_PREV);