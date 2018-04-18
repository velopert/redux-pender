import penderize from './penderize';

/**
 * Creates the pend handlers
 * @param {object} pendInfo actionType and handlers { type, onPending, onSuccess, onFailure }
 */
export default function pender(pendInfo) {
  const {
    type,
    onPending = state => state,
    onSuccess = state => state,
    onFailure = state => state,
    onCancel = state => state,
    onError,
  } = pendInfo;
  const penderized = penderize(type);
  // sets alias for onFailure
  const failure = onFailure || onError;

  return {
    [penderized.PENDING]: (state, action) => onPending(state, action),
    [penderized.SUCCESS]: (state, action) => onSuccess(state, action),
    [penderized.FAILURE]: (state, action) => failure(state, action),
    [penderized.CANCEL]: (state, action) => onCancel(state, action),
  };
}
