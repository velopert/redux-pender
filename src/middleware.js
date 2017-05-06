import actionTypes from './action-types';
import penderize from './penderize';

const [ PENDING, SUCCESS, FAILURE ] = actionTypes;

/**
 * Middleware that pends and handles the promises
 * @param {*} store 
 */
export default function penderMiddleware(store) {
    return next => action => {
        /* 
            Check whether the middleware should handle this action
            action.payload.pend should be assigned as a Promise instance
        */

        const { payload } = action;
        if(!payload) return next(action);

        const pend = action.payload.pend;
        const isPromise = Promise.resolve(pend) === pend;
        
        if(!isPromise) {
            // not a promise
            return next(action);
        }

        const { type, meta } = action;
        const penderized = penderize(type);


        // inform that the promise has started
        store.dispatch({
            type: penderized.PENDING,
            meta
        });

        store.dispatch({
            type: PENDING,
            payload: type
        })

        // handles the promise
        pend.then(
            (result) => {
                // promise is resolved
                // result will be assigned as payload
                store.dispatch({
                    type: penderized.SUCCESS,
                    payload: result,
                    meta
                });

                store.dispatch({
                    type: SUCCESS,
                    payload: type
                })
            }
        ).catch(
            (error) => {
                // promise is rejected
                // error will be assigned as payload
                store.dispatch({
                    type: penderized.FAILURE,
                    payload: error,
                    meta
                });

                store.dispatch({
                    type: FALURE,
                    payload: type
                })
            }
        );
    }
}