/**
 * Creates a pender action
 * @param {*} actionType type of the action
 * @param {*} promiseCreator function that creates promise
 * @param {func} [metaCreator] function that creates meta
 */
export default function createPenderAction(actionType, promiseCreator, metaCreator = payload => payload) {
    return function(payload) {

        // generate the pend and meta
        const pend = promiseCreator(payload);
        const meta = metaCreator(payload);

        return {
            type: actionType,
            payload: {
                pend
            },
            ...(meta ? {meta: meta} : {}) // insert meta here when it is not undefined
        }
    }
}

createPenderAction