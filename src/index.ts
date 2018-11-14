import * as utils from './utils';
import { ReturnAny } from './utils';
import penderReducer, { PenderState } from './penderReducer';
import middleware, { CancellablePromise } from './middleware';

export default middleware;

const { pender, applyPenders, resetPender, createPenderAction } = utils;

export { pender, applyPenders, resetPender, createPenderAction, penderReducer };

// types
export { PenderState, ReturnAny, CancellablePromise };
