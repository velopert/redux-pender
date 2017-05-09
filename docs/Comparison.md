## Comparison

When it comes to asynchronous actions, some of the solutions that you might think of are:
 - [redux-thunk](#redux-thunk)
 - [redux-saga](#redux-saga)
 - [redux-promise](#redux-promise)
 - [redux-promise-middleware](#redux-promise-middleware)

Each these library tries to solve the similar issue - asynchronous actions.
Comparisons among libraries above and redux-pender will be illustrated in this document.

### redux-thunk

`redux-thunk` allows you to dispatch a function. It is intuitive and simple.
You can handle the asynchronous actions like this:

```javascript
const REQUEST_PENDING = 'REQUEST_PENDING';
const REQUEST_SUCCESS = 'REQUEST_SUCCESS';
const REQUEST_FAILURE = 'REQUEST_FAILURE';

function request() {
    return dispatch => {
        // inform that request has started
        dispatch({type: REQUEST_PENDING});
        setTimeout(() => {
            // this is processed 1s later
            dispatch({type: REQUEST_SUCCESS});
        }, 1000)
    }
}

dispatch(request);
```

```javascript
const initialState = {
    fetching: false
    fetched: true
}
const reducer = (state, action) => {
    switch(action.type) {
        case REQUEST_PENDING:
            return { ...state, fetching: true };
        case REQUEST_SUCCESS:
            return { ...state, fetching: false, fetched: true }
    }
}
```

But, what if there is numerous asynchronous actions to handle? You have to create x3 amount of action types.

[This code](https://github.com/velopert/react-codelab-project/blob/master/src/actions/memo.js) is a sample code when I tried to handle asynchronous actions by using `redux-thunk` last year. (I was kind of a beginner back then)
```javascript
export function memoStarRequest(id, index) {
    return (dispatch) => {
        dispatch(memoStar());

        return axios.post('/api/memo/star/' + id)
        .then((response) => {
            dispatch(memoStarSuccess(index, response.data.memo));
        }).catch((error) => {
            console.log(error);
            dispatch(memoStarFailure());
        });
    };
}

export function memoStar() {
    return {
        type: MEMO_STAR
    };
}

export function memoStarSuccess(index, memo) {
    return {
        type: MEMO_STAR_SUCCESS,
        index,
        memo
    };
}

export function memoStarFailure(error) {
    return {
        type: MEMO_STAR_FAILURE,
        error
    };
}
```

And obviously, reducer will also get complicated too because you need to handle `PENDING`, `SUCCESS`, `FAILURE` actions for each request.

As you see, you have to write down some long codes for a single request.

### redux-saga

`redux-saga` is a library that aims to make side effects. This library is powerful indeed. This library handles the asynchronous actions by using ES6 generator functions.

This is how you handle the asynchronous actions in saga

```javascript
const WRITE_MEMO = 'WRITE_MEMO';
const WRITE_MEMO_SUCCESS = 'WRITE_MEMO_SUCCESS';
const WRITE_MEMO_FAILURE = 'WRITE_MEMO_FAILURE';

const writeMemo = memo => ({ type: WRITE_MEMO, memo });
const writeMemoSuccess = memo => ({type: WRITE_MEMO_SUCCESS});
const writeMemoFailure = memo => ({type: WRITE_MEMO_FAILURE});

const fakeRequest = (memo) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true});
        }, 1000)
    });
}

function *writeMemoSaga() {
    // wait for every WRITE_MEMO action
    takeEvery(WRITE_MEMO, write);
}

function *write({memo}) {
    try {
        yield call(fakeRequest, memo);
        yield put(writeMemoSuccess());
    } catch(e) {
        yield put (writeMemoFailure());
    }
}

const sagaMiddleware = createSagaMiddleware()
const createStoreWithSagas = createStore(reducer, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(saveScore)
```

This solution is elegant. If you dispatch the `writeMemo` action, saga middleware will do rest of the things for you. Especially when you are dealing with sockets, it is even better.

 However, the learning curve of it is steep. Some people might need to spend extra time to understand how all things work. Additionally, `call`, `put`, `takeEvery`, `takeLatest`, `fork`, `throttle` ... ? It provides too many APIs. It depends what kind of task you are working, but it is possible that your code will get more complex than necessary.

Also, you still have to manually create and call action creators for success and failure situation. Oh, and don't forget, you also need to handle three action types in reducer per a request.

If you know what you are doing, and you feel `redux-saga` actually makes your tasks easier, this might already be the perfect solution for you. However, if you are doing some simple REST API calls, I believe using this might be an overengineering.

### redux-promise

This is a simple middleware that handles the asynchronous actions based on `Promise`. Yes, this is VERY simple that its [code](https://github.com/acdlite/redux-promise/blob/master/src/index.js) is only 25 lines long.

When you use this middleware, you can handle asynchronous actions as:

```javascript
const fakeRequest = (memo) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(memo==='error') reject(new Error('hi'));
            resolve({ success: true });
        }, 1000)
    });
}

const WRITE_MEMO = 'WRITE_MEMO';

const writeMemo = (memo) => ({
  type: WRITE_MEMO,
  payload: fakeRequest(memo)
});

store.dispatch(writeMemo('hi'));
store.dispatch(writeMemo('error'))
```
[(Check out the codes from webpackbin)](https://www.webpackbin.com/bins/-KjgFFtgCtQ3oVGDaxfQ)

If the promise successfully resolves, it will dispatch following action:
```json
{
  "type": "WRITE_MEMO",
  "payload": {
    "success": true
  }
}
```

When rejects, the action will contain rejected value as `error`

```json
{
  "type": "WRITE_MEMO",
  "payload": "there was an error",
  "error": true
}
```

It supports FSA actions so you can do this if you are using `redux-actions`

```javascript
createAction('FETCH_THING', async id => {
  const result = await somePromise;
  return result.someValue;
});
```

Simple, isn't it? But, there is a problem: there is no way to inform that the request is pending. It only dispatches action after the promise, and it does not dispatch anything before that.

Unless your server is super-fast, you have to indicate the user that they are waiting for the request.

### redux-promise-middleware

This is one of my favorite library, and this has inspired me to make `redux-pender`. `redux-promise-middleware` is similar to `redux-promise`. The difference between them, is that this one allows you to handle **pending** situation.

When a action with a promise is dispatched, `redux-promise-middleware` will automatically attach the suffixes (`_PENDING`, `_FULFILLED`, `_REJECTED`) and dispatch the actions accordingly.

[((Check the codes from webpackbin)](https://www.webpackbin.com/bins/-KjgFSXHPnc0OOj6fErw)

Same codes used in `redux-promise` will also work in `redux-promise-middleware`. You just need to change the logic in the reducer.

This middleware accepts two kinds of actions. 

```javascript
// type 1
{ 
    type: 'ACTION_TYPE',
    payload: Promise.resolve()
}

//type 2
{
    type: 'ACTION_TYPE',
    payload {
        promise: Promise.resolve()
    }
}
```

When the action with promise dispatches, this middleware will dispatch a `PENDING` action first.

```javascript
{
    type: 'ACTION_TYPE_PENDING'
}
```

when the promise resolves:

```javascript
{
  "type": "WRITE_MEMO_FULFILLED",
  "payload": {
    "success": true
  }
}
```

when the promise rejects:
```javascript
{
  "type": "WRITE_MEMO_REJECTED",
  "payload": "there was an error",
  "error": true
}
```

### Problems of using redux-promise-middleware

This middleware is good enough. But, while working on a project using this library, I found out some problems that I could fix. Full version of codes used in this section are available at [here](https://github.com/velopert/whotalk.us/blob/master/whotalk-frontend/src/reducers/mypage.js)


**1) Creating four action types for one request**

```javascript
// action types
const INITIAL_SETTING_GET = "mypage/INITIAL_SETTING_GET";
const INITIAL_SETTING_GET_PENDING = "mypage/INITIAL_SETTING_GET_PENDING";
const INITIAL_SETTING_GET_FULFILLED = "mypage/INITIAL_SETTING_GET_FULFILLED";
const INITIAL_SETTING_GET_REJECTED = "mypage/INITIAL_SETTING_GET_REJECTED";

// action creator
export const getInitialSetting = () => ({
    type: INITIAL_SETTING_GET,
    payload: {
        promise: service.getInitialSetting()
    }
});

// reducer part (using handleActions)
    [INITIAL_SETTING_GET_PENDING]: (state, action) => ({
        // update the state
    }),

    [INITIAL_SETTING_GET_FULFILLED]: (state, action) => ({
        // update the state
    }),

    [INITIAL_SETTING_GET_REJECTED]: (state, action) => ({
        // update the state
    }),
```

For each of the requests, you have to create four different action types, and create three action handlers in the reducer. (the original action will not be dispatched to store).


**2) Similar codes used over and over**
To indicate that the request is pending and fulfilled, I had to write down similar codes over and over. I created [object with request status information](https://github.com/velopert/whotalk.us/blob/master/whotalk-frontend/src/helpers/requestStatus.js) in it, and did something like this:

```javascript
    [MESSAGE_CLEAR_PENDING]: (state, action) => ({
        ...state,
        requests: {
            ...state.requests,
            clearMessage: {
                ...rs.pending
            }
        }
    }),

    [MESSAGE_CLEAR_FULFILLED]: (state, action) => ({
        ...state,
        requests: {
            ...state.requests,
            clearMessage: {
                ...rs.fulfilled
            }
        }
    }),

    [MESSAGE_CLEAR_REJECTED]: (state, action) => ({
        ...state,
        requests: {
            ...state.requests,
            clearMessage: {
                ...rs.rejected,
                error: action.payload
            }
        }
    }),
```

These are action handlers for clearing the message list. In this request, I did not need any data from its response. I just had to check whether the request is pending, succeed or failed. But still, I had to write down more than 30 lines of codes for a simple request. (I know that using ImmutableJS will shorten the codes though.)

I did not like the fact that I had to manage the request status manually for every request. 

### Solutions

Problems above are solved by making 
 - reducer that manages request status
 - helper function that allows you to handle asynchronous actions without creating suffixed action types
 - middleware to make all the things work; this middleware works pretty much the same as `redux-promise-middleware`. The difference is that it will dispatch a extra action to the pender reducer to track the status of the request.


By using `redux-pender`, asynchronous actions can be handled as:

```javascript
const FETCH_INITIAL_MESSAGES = 'chat/FETCH_INITIAL_MESSAGES';

export const fetchInitialMessages = createAction(FETCH_INITIAL_MESSAGES, firebaseApp.fetchInitialMessages);

export default handleActions({
    ...pender({
        type: FETCH_INITIAL_MESSAGES,
        onSuccess: (state, action) => {
            const messages = fromJS(convertSnapshotToArray(action.payload))
            return state.set('messages', messages);
        }
    })
    // more update handlers
}, initialState)
```

If you need to do something when the request starts (rather than changing the request status; pender reducer will do that for you), or handle errors, you just need to add implement `onPending` or `onFailure`.

```javascript
pender({
    type: 'ACTION_TYPE',
    onPending: (state, action) => state, 
    onSuccess: (state, action) => state,
    onFailure: (state, action) => state
})
```

To get whether the request is pending or not, you can access the state of pender reducer.

```javascript
const fetching = store.getState().pender.pending['chat/FETCH_INITIAL_MESSAGES'];
```

By using this, you don't have to manage the request status manually. The middleware and the reducer will do it for you. And, when it comes to declaring action types, you just have to declare one per each request. The `pender` function will do the rest.

This library works the best if you are using `redux-actions`, but you can still use without it.

Does this solution look appealing to you? Read out the instruction and start using it! You can apply this library to your project even if you are using `redux-promise` or `redux-promise-middleware` by setting config to `{major: false}` when you initialize the middleware.