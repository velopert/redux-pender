import actionTypes from './actionTypes';

const { PENDING, SUCCESS, FAILURE, RESET, CANCEL } = actionTypes;

/* 
    reducer that manages the penders
    state[PENDER_ACTION] is true when promise is pending,
    when it resolves or rejects, it will turn false 
*/

const initialState = {
    pending: {},
    success: {},
    failure: {}
};

export default function penderReducer(state = initialState, action) {
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
            };
        case CANCEL: 
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
                    [action.payload]: false
                }
            };
        case RESET: 
            return initialState;
        default:
            return state;
    }
}