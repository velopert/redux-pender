import 'proxy-polyfill';
import { actionTypes, penderize } from './utils';
import { Dispatch, AnyAction, MiddlewareAPI, Middleware } from 'redux';

export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

const { PENDING, SUCCESS, FAILURE, CANCEL } = actionTypes;

let _id = 0;

function generatePenderId() {
  _id += 1;
  return _id;
}

function isPromise(promise: Promise<any>) {
  if (!promise) return false;
  return promise.then && promise.catch;
}

function getPromise(action: any, major: boolean): Promise<any> | null {
  const { payload } = action;
  if (!payload) return null;

  if (major) {
    if (isPromise(payload)) return payload;
  }

  const { pend } = action.payload;
  if (isPromise(pend)) return pend;
  return null;
}

type MiddlewareConfig = {
  major: boolean;
  raw: boolean;
};

export default function penderMiddleware(
  config: MiddlewareConfig = { major: true, raw: false }
): Middleware<any, any, any> {
  const major = config.major === undefined ? true : config.major;
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (
    action: AnyAction
  ) => {
    // retrieve Promise if possible
    const promise = getPromise(action, major);
    if (!promise) return next(action); // skip if no promise found

    const { type, meta } = action;
    const actions = penderize(type);

    let cancelled = false;

    // promise start
    store.dispatch({
      type: actions.PENDING,
      meta,
    });

    // inform pender reducer
    store.dispatch({
      type: PENDING,
      payload: type,
    });

    // use proxy to handle promise cancellation
    const origin = {
      cancel: false,
      resolve: false,
    };
    let proxy: typeof origin | null = null;
    const cancelPromise = new Promise<void>((resolve, reject) => {
      const handler = {
        set(target: any, key: string, value: any): boolean {
          if (key === 'cancel') {
            cancelled = true;
            store.dispatch({
              type: CANCEL,
              payload: type,
            });
            store.dispatch({
              type: actions.CANCEL,
              meta,
            });
            reject(new Error(`${type} is cancelled`));
            proxy = null;
            return true;
          }
          if (key === 'resolve') {
            resolve();
            return true;
          }
          return true;
        },
      };
      proxy = new Proxy<any>(origin, handler);
    });

    const cancel = () => {
      if (!proxy) return;
      proxy.cancel = true;
    };

    promise
      .then((result: any) => {
        if (cancelled) return; // do nothing if cancelled
        if (!proxy) return;
        proxy.resolve = true;
        proxy = null;

        // promise resolved
        store.dispatch({
          type: actions.SUCCESS,
          payload: result,
          meta,
        });
        // inform pender reducer
        store.dispatch({
          type: SUCCESS,
          payload: type,
        });
      })
      .catch((e: Error) => {
        if (cancelled) return; // do nothing if cancelled
        if (!proxy) return;
        proxy.resolve = true;
        proxy = null;

        // promise rejected
        store.dispatch({
          type: actions.FAILURE,
          payload: e,
          error: true,
          meta,
        });
        // inform pender reducer
        store.dispatch({
          type: FAILURE,
          payload: type,
        });
      });

    const cancellablePromise: CancellablePromise<any> = Promise.race([
      promise,
      cancelPromise,
    ]) as CancellablePromise<any>;
    cancellablePromise.cancel = cancel;

    if (config.raw) {
      return {
        type,
        meta,
        payload: cancellablePromise,
      };
    }

    return cancellablePromise;
  };
}
