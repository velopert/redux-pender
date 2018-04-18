import actionTypes from './actionTypes';

/**
 * action creator for reset
 *
 * @export
 * @returns redux action
 */
export default function resetPender() {
  return {
    type: actionTypes.RESET,
  };
}
