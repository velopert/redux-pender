import actionTypes from './action-types';

const [ PENDING, SUCCESS, FAILURE ] = actionTypes;

/* 
    reducer that manages the penders
    state[PENDER_ACTION] is true when promise is pending,
    when it resolves or rejects, it will turn false 
*/

export default function penderReducer(state = {} , action) {
    switch(action.type) {
        case PENDING:
            return {
                ...state,
                [action.payload]: true
            }
        case SUCCESS:
            return {
                ...state,
                [action.payload]: false
            };
        case FAILURE:
            return {
                ...state,
                [action.payload]: false
            }
        default:
            return state;
    }
}