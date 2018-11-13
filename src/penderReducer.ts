import { actionTypes } from './utils';

const { PENDING, SUCCESS, FAILURE, RESET, CANCEL } = actionTypes;

const initialState = {
  pending: {},
  success: {},
  failure: {},
};

type StatusMap = {
  [type: string]: boolean;
};

export type PenderState = {
  pending: StatusMap;
  success: StatusMap;
  failure: StatusMap;
};

type PenderAction = {
  type: string;
  payload: string;
};

export default function penderReducer(
  state = initialState,
  action: PenderAction
) {
  switch (action.type) {
    case PENDING:
      return {
        pending: {
          ...state.pending,
          [action.payload]: true,
        },
        success: {
          ...state.success,
          [action.payload]: false,
        },
        failure: {
          ...state.failure,
          [action.payload]: false,
        },
      };
    case SUCCESS:
      return {
        pending: {
          ...state.pending,
          [action.payload]: false,
        },
        success: {
          ...state.success,
          [action.payload]: true,
        },
        failure: {
          ...state.failure,
          [action.payload]: false,
        },
      };
    case FAILURE:
      return {
        pending: {
          ...state.pending,
          [action.payload]: false,
        },
        success: {
          ...state.success,
          [action.payload]: false,
        },
        failure: {
          ...state.failure,
          [action.payload]: true,
        },
      };
    case CANCEL:
      return {
        pending: {
          ...state.pending,
          [action.payload]: false,
        },
        success: {
          ...state.success,
          [action.payload]: false,
        },
        failure: {
          ...state.failure,
          [action.payload]: false,
        },
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
}
