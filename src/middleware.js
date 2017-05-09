import actionTypes from './action-types';
import penderize from './penderize';

const { PENDING, SUCCESS, FAILURE } = actionTypes;

/**
 * Middleware that pends and handles the promises
 * @param {object} config
 * @returns {function} middleware
 */
export default function penderMiddleware(config = { major: true }) {
    
    return store => next => action => {


        /**
         * checks whether the given parameter is a promise
         * 
         * @param {object} promise 
         * @returns {boolean} 
         */
        function isPromise(promise) {
            if(!promise) return false;
            return promise.then && promise.catch;
        }

        /**
         * extracts promise from the action
         * 
         * @param {object} action 
         * @returns {Promise} promise
         */
        function getPromise(action) {
            const { payload } = action;

            if(!payload) return null;  // there is no payload
            
            // when 'major' option is true
            if(config.major === true) {
                if(isPromise(payload)) return payload;
            }

            // case when major is false
            const { pend } = action.payload;
            if(isPromise(pend)) return pend;

            return null;
        }

        
        const promise = getPromise(action); // get the promise from the action
        if(!promise) return next(action); // if there is no promise, skip this action


        
        const { type, meta } = action; // get the details of the action

        const penderized = penderize(type); // create the penderized action types


        // inform that the promise has started
        store.dispatch({
            type: penderized.PENDING,
            meta
        });

        // log this in pender reducer
        store.dispatch({
            type: PENDING,
            payload: type
        })



        // handle the promise

        promise.then(
            (result) => {
                // promise is resolved
                // result will be assigned as payload
                store.dispatch({
                    type: penderized.SUCCESS,
                    payload: result,
                    meta
                });

                // log this in pender reducer
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
                    meta,
                    error: true
                });

                // log this in pender reducer
                store.dispatch({
                    type: FAILURE,
                    payload: type
                })
            }
        );

        return promise;
    }
}