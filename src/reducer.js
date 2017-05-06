import actionTypes from './action-types';

const { PENDING, SUCCESS, FAILURE } = actionTypes;

/* 
    reducer that manages the penders
    state[PENDER_ACTION] is true when promise is pending,
    when it resolves or rejects, it will turn false 
*/

export default function penderReducer(state = {
    pending: {},
    success: {},
    failure: {}
} , action) {
    switch(action.type) {
        case PENDING:
            return {
                pending: {
                    ...state.pending,
                    [action.payload]: true
                },
                success: {
                    ...state.success,
                    [action.payload]: false
                },
                failure: {
                    ...state.failure,
                    [action.payload]: false
                }
            }
        case SUCCESS:
            return {
                pending: {
                    ...state.pending,
                    [action.payload]: false
                },
                success: {
                    ...state.success,
                    [action.payload]: true
                },
                failure: {
                    ...state.failure,
                    [action.payload]: false
                }
            };
        case FAILURE:
            return {
                pending: {
                    ...state.pending,
                    [action.payload]: false
                },
                success: {
                    ...state.success,
                    [action.payload]: false
                },
                failure: {
                    ...state.failure,
                    [action.payload]: true
                }
            }
        default:
            return state;
    }
}