import penderize from './penderize';

/**
 * Creates the pend handlers
 * @param {object} pendInfo actionType and handlers { type, onPending, onSuccess, onFailure }
 */
export default function pender(pendInfo) {
    let {
        type,
        onPending = state => state,
        onSuccess = state => state,
        onFailure = state => state,
        onCancel = state => state,
        onError,
    } = pendInfo
    const penderized = penderize(type);
    // sets alias for onFailure
    if(onError) onFailure = onError;
    
    return {
        [penderized.PENDING]: (state, action) => onPending(state, action),
        [penderized.SUCCESS]: (state, action) => onSuccess(state, action),
        [penderized.FAILURE]: (state, action) => onFailure(state, action),
        [penderized.CANCEL]: (state, action) => onCancel(state, action)
    }
}

/*
    pender should be used with handleActions of redux-actions.

    Usage:

    const reducer = handleActions({
        ...pender({
            type: 'DO_SOMETHING',
            onPending: (state, action) => state,
            onSuccess: (state, action) => state,
            onFailure: (state, action) => state
        }),
        ...pender({
            type: 'ANOTHER_ACTION',
            onSuccess: (state, action) => {
                return {
                    ...state,
                    data: action.payload.data
                }
            }
        })
    })
*/
