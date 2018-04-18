import pender from "./pender";

/**
 * Applys penders to the reducer
 * @param {*} reducer original reducer
 * @param {*} penders array of penders
 */
export default function applyPenders(reducer, penders) {
  const updaters = Object.assign({}, ...penders.map(pender));
  const enhancedReducer = (state, action) => {
    if (updaters[action.type]) {
      return updaters[action.type](state, action);
    }
    return reducer(state, action);
  };
  return enhancedReducer;
}
