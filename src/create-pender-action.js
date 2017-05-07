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
            meta: {
                // puts copy of the payload in meta
                _payload: payload,
                // if meta parameter exists, put it in here
                ...(typeof meta === 'object' ? meta : { value: meta })
            }
        }
    }
}