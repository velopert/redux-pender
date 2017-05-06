/**
 * Creates a pender action
 * @param {*} actionType 
 * @param {*} promiseCreator 
 */
export default function createPenderAction(actionType, promiseCreator) {
    return function(payload, meta) {
        return {
            type: actionType,
            payload: {
                pend: promiseCreator(payload),
            },
            meta
        }
    }
}