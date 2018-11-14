export const actionTypes = {
  PENDING: '@@redux-pender/PENDING',
  SUCCESS: '@@redux-pender/SUCCESS',
  FAILURE: '@@redux-pender/FAILURE',
  CANCEL: '@@redux-pender/CANCEL',
  RESET: '@@redux-pender/RESET',
};

export function penderize(type: string) {
  return {
    PENDING: `${type}_PENDING`,
    SUCCESS: `${type}_SUCCESS`,
    FAILURE: `${type}_FAILURE`,
    CANCEL: `${type}_CANCEL`,
  };
}

type AnyReducer<S> = ((state: S, action: any) => S) | ((state: S) => S);

interface PendInfo<S> {
  type: string;
  onPending?: AnyReducer<S>;
  onSuccess?: AnyReducer<S>;
  onFailure?: AnyReducer<S>;
  onError?: AnyReducer<S>; // alias of onFailure
  onCancel?: AnyReducer<S>;
}

export function pender<S>(pendInfo: PendInfo<S>) {
  const defaultUpdater = (s: S) => s;
  const { type, onPending, onSuccess, onFailure, onError, onCancel } = pendInfo;
  const actions = penderize(type);
  const updaters = {
    pending: onPending || defaultUpdater,
    success: onSuccess || defaultUpdater,
    failure: onFailure || onError || defaultUpdater,
    cancel: onCancel || defaultUpdater,
  };

  return {
    [actions.PENDING]: updaters.pending,
    [actions.SUCCESS]: updaters.success,
    [actions.FAILURE]: updaters.failure,
    [actions.CANCEL]: updaters.cancel,
  };
}

type Reducer<S> = (state: S | undefined, action: any) => S;

export function applyPenders<S>(
  reducer: (state: S | undefined, action: any) => S,
  penderInfos: PendInfo<S>[]
) {
  const penders = penderInfos.map(pender);
  const updaters: {
    [x: string]: (state: S, action: any) => S;
  } = {};
  penders.forEach(p => {
    const keys = Object.keys(p);
    keys.forEach(key => {
      updaters[key] = p[key];
    });
  });
  const enhancedReducer: Reducer<S> = (state: S | undefined, action: any) => {
    if (!action || state === undefined) return reducer(state, action);
    if (updaters[action.type]) {
      return updaters[action.type](state, action);
    }
    return reducer(state, action);
  };
  return enhancedReducer;
}

export function resetPender() {
  return {
    type: actionTypes.RESET,
  };
}

type PromiseCreator = (...params: any[]) => Promise<any>;
type MetaCreator = (...params: any[]) => any;

export function createPenderAction(
  type: string,
  promiseCreator: PromiseCreator,
  metaCreator?: MetaCreator
) {
  return function(...params: any[]) {
    const defaultMetaCreator = (payload: any) => payload;
    const pend = promiseCreator(...params);
    const meta = (metaCreator || defaultMetaCreator)(...params);
    return {
      type,
      payload: {
        pend,
      },
      meta,
    };
  };
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
export type ReturnAny<F> = (...args: ArgumentsType<F>) => any;
