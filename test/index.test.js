import { createStore, applyMiddleware, combineReducers } from 'redux';
import { handleActions, createAction } from 'redux-actions';
import penderMiddleware, {
  penderReducer,
  createPenderAction,
  pender,
  resetPender,
  applyPenders,
} from '../lib';

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

test('entire flow is working (major)', async () => {
  const promiseCreator = ({ triggerError, value }) => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (triggerError) {
          reject(value);
        } else {
          resolve(value);
        }
      }, 100);
    });

    return p;
  };

  const ACTION_TYPE = 'ACTION_TYPE';
  const actionCreator = createAction(ACTION_TYPE, promiseCreator);

  const myReducer = handleActions(
    {
      ...pender({
        type: ACTION_TYPE,
        onSuccess: (state, action) => {
          return action.payload;
        },
        onCancel: (state, action) => {
          return 'cancelled';
        },
      }),
    },
    null
  );

  const reducers = combineReducers({
    myReducer,
    pender: penderReducer,
  });

  const store = createStore(reducers, applyMiddleware(penderMiddleware()));

  expect(store).toBeTruthy();

  const promise = store.dispatch(
    actionCreator({ triggerError: false, value: true })
  );

  await sleep(50);

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(true);

  const r = await promise;

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(false);
  expect(store.getState().pender.success[ACTION_TYPE]).toBe(true);
  expect(store.getState().myReducer).toBe(true);

  // test reset
  await store.dispatch(resetPender());
  expect(Object.keys(store.getState().pender.success).length).toBe(0);

  /* test promise rejection */
  try {
    await store.dispatch(actionCreator({ triggerError: true, value: true }));
  } catch (e) {}

  await sleep(0);
  expect(store.getState().pender.failure[ACTION_TYPE]).toBe(true);

  await store.dispatch(resetPender());

  // test promise cancellation
  const promise3 = store.dispatch(
    actionCreator({ triggerError: false, value: true })
  );
  await sleep(10);
  promise3.cancel();
  try {
    await promise3;
  } catch (e) {}

  await sleep(100);

  expect(store.getState().myReducer).toBe('cancelled');
});

test('entire flow is working (major), with applyPenders', async () => {
  const promiseCreator = ({ triggerError, value }) => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (triggerError) {
          reject(value);
        } else {
          resolve(value);
        }
      }, 100);
    });

    return p;
  };

  const ACTION_TYPE = 'ACTION_TYPE';
  const SET = 'SET';
  const actionCreator = createAction(ACTION_TYPE, promiseCreator);
  const set = createAction(SET);

  const myReducer = handleActions(
    {
      [SET]: (state, action) => action.payload,
    },
    null
  );

  const enhanced = applyPenders(myReducer, [
    {
      type: ACTION_TYPE,
      onSuccess: (state, action) => {
        return action.payload;
      },
      onCancel: (state, action) => {
        return 'cancelled';
      },
    },
  ]);

  const reducers = combineReducers({
    myReducer: enhanced,
    pender: penderReducer,
  });

  const store = createStore(reducers, applyMiddleware(penderMiddleware()));

  expect(store).toBeTruthy();

  const promise = store.dispatch(
    actionCreator({ triggerError: false, value: true })
  );

  await sleep(50);

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(true);

  const r = await promise;

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(false);
  expect(store.getState().pender.success[ACTION_TYPE]).toBe(true);
  expect(store.getState().myReducer).toBe(true);

  // test reset
  await store.dispatch(resetPender());
  expect(Object.keys(store.getState().pender.success).length).toBe(0);

  /* test promise rejection */
  try {
    await store.dispatch(actionCreator({ triggerError: true, value: true }));
  } catch (e) {}

  await sleep(0);
  expect(store.getState().pender.failure[ACTION_TYPE]).toBe(true);

  await store.dispatch(resetPender());

  // test promise cancellation
  const promise3 = store.dispatch(
    actionCreator({ triggerError: false, value: true })
  );
  await sleep(10);
  promise3.cancel();
  try {
    await promise3;
  } catch (e) {}

  await sleep(100);

  expect(store.getState().myReducer).toBe('cancelled');
  store.dispatch(set('value'));

  expect(store.getState().myReducer).toBe('value');
});

test('entire flow is working (!major)', async () => {
  const promiseCreator = ({ triggerError, value }) => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (triggerError) {
          reject(value);
        } else {
          resolve(value);
        }
      }, 100);
    });

    return p;
  };

  const ACTION_TYPE = 'ACTION_TYPE';
  const actionCreator = createPenderAction(ACTION_TYPE, promiseCreator);

  const myReducer = handleActions(
    {
      ...pender({
        type: ACTION_TYPE,
        onSuccess: (state, action) => {
          return action.payload;
        },
      }),
    },
    null
  );

  const reducers = combineReducers({
    myReducer,
    pender: penderReducer,
  });

  const store = createStore(
    reducers,
    applyMiddleware(penderMiddleware({ major: false }))
  );

  expect(store).toBeTruthy();

  const promise = store.dispatch(
    actionCreator({ triggerError: false, value: true })
  );

  // sleep 50ms
  await new Promise(resolve => {
    setTimeout(resolve, 50);
  });

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(true);

  const r = await promise;

  expect(store.getState().pender.pending[ACTION_TYPE]).toBe(false);
  expect(store.getState().pender.success[ACTION_TYPE]).toBe(true);
  expect(store.getState().myReducer).toBe(true);

  // test reset
  await store.dispatch(resetPender());
  expect(Object.keys(store.getState().pender.success).length).toBe(0);
});
