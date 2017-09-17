import actionTypes from './action-types';
import penderize from './penderize';
import EventEmitter from 'eventemitter3';

const EE = new EventEmitter();

const { PENDING, SUCCESS, FAILURE, CANCEL } = actionTypes;

let _id = 0;
function generatePenderId() {
    return _id++
}

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
        let cancelled = false;
        const penderId = generatePenderId();

        let handleCancel = null;
        let handleResolve = null;

        const unsubscribe = () => {
            EE.removeListener('cancel', handleCancel);
            EE.removeListener('resolve', handleResolve);
        };

        const cancel = () => {
            EE.emit('cancel', penderId);
        };

        const resolveCancellation = () => {
            EE.emit('resolve', penderId);
        }
        
        const cancellation = (type) => {
            return new Promise((resolve, reject) => {
                handleCancel = (id) => {
                    if(id === penderId) {
                        cancelled = true;
                        unsubscribe();
                        store.dispatch({
                            type: CANCEL,
                            payload: type
                        })
                        store.dispatch({
                            type: penderized.CANCEL,
                            meta
                        });
                        reject(new Error(`${type}(${id}) is cancelled`));
                    }
                };

                handleResolve = (id) => {
                    if(id === penderId) {
                        unsubscribe();
                        resolve();
                    }
                };


                EE.once('cancel', handleCancel);
                EE.once('resolve', handleResolve);
            })
        };

        
        const p = promise.then(
            (result) => {
                if(cancelled) return;
                resolveCancellation();

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
                if(cancelled) return;
                resolveCancellation();

                if(process.env.NODE_ENV === 'development') {
                    // print error in development environment
                    console.error(error);
                }
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

        const cancellablePromise = Promise.race([promise, cancellation(type)]);
        cancellablePromise.cancel = cancel;

        return cancellablePromise;
    }
}