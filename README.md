# redux-pender

[![Build Status](https://travis-ci.org/velopert/redux-pender.svg?branch=master)](https://travis-ci.org/velopert/redux-pender)
[![npm version](https://img.shields.io/npm/v/redux-pender.svg)](https://badge.fury.io/js/redux-pender)

## Introduction 

Redux pender is a middleware that helps you to manage asynchronous actions based on promise. It comes with useful tools that help you to handle this even more easier. 

This library is inspired from [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware). The difference between redux-promise-middleware and this library is that this comes with some handy utils. Additionally, it also handles the cancellation of the promise-based action. To check out detailed comparisons between other libraries, please check [Comparisons](docs/Comparison.md) document


## Installation

``` sh
npm i --save redux-pender
```

## Usage

### Configure Store

``` javascript
import { applyMiddleware, createStore, combineReducers } from 'redux';
import penderMiddleware, { penderReducer } from 'redux-pender';

const reducers = {
    /*
        ...your other reducers...
    */
    pender: penderReducer
};

const store = createStore(
    reducers,
    applyMiddleware(penderMiddleware())
);
```

`penderReducer` is the reducer that tracks the status of your asynchronous actions. 

- When your request is pending, `store.getState().pender.pending[ACTION_NAME]` will turn true. It will set to false when it succeeds or fails.
- When your request succeeds, `store.getState().pender.success[ACTION_NAME]` will turn true.
- When your request fails, `store.getState().pender.failure[ACTION_NAME]` will turn true.

If you are currently using `redux-promise` or `redux-promise-middleware` in your project, there will be a collision. To avoid the collision without uninstalling existing library, pass `{ major: false }` when you initialize the middleware:

```javascript
penderMiddleware({ major: false })
```



### Actions
pender middleware will process the action when a `Promise` is given as the `payload` of the action:
```javascript
{
    type: 'ACTION_TYPE',
    payload: Promise.resolve()
}
```

If you have set `major` to `false` when you initialize the middleware to avoid the collision with `redux-promise` or `redux-promise-middleware`, the middleware will only accept following action:

```javascript
{
    type: 'ACTION_TYPE',
    payload: {
        pend: Promise.resolve()
    }
}
```

By default, middleware will accept both of the kinds of actions above.

### Dispatching actions

Since it supports [FSA actions](https://github.com/acdlite/flux-standard-action), you can use `createAction` of [redux-actions](https://github.com/acdlite/redux-actions).
The second parameter of `createAction` should be a function that returns a Promise.

```javascript
import axios from 'axios';
import { createAction } from 'redux-actions';

const loadPostApi = (postId) => axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}`);
const LOAD_POST = 'LOAD_POST';
const loadPost = createAction(LOAD_POST, loadPostApi);
store.dispatch(loadPost(1));
```

If you are using this middleware as `{major: false}`, you have to use `createPenderAction`

```javascript
import { createPenderAction } from 'redux-pender';
const loadPost = createPenderAction(LOAD_POST, loadPostApi);
```

It pretty much works quite the same, but it puts the Promise at `action.payload.pend`. 

### Reducer - handling actions

When you are making your reducer, it works the best when you are using `handleActions` of [redux-actions](https://github.com/acdlite/redux-actions).
Handling action is done by using `pender`. 

> For people who don't know what `handleActions` does, it handles action by creating an object, rather than a `switch`.

```javascript

import { handleActions } from 'redux-actions';
import { pender } from 'redux-pender';

const initialState = { 
    post: {}
}
export default handleActions({
    ...pender({
        type: LOAD_POST,
        onSuccess: (state, action) => {
            return {
                post: action.payload.data
            };
        }
    }),
    // ... other action handlers...
}, initialState);
```

Do you want to do something when the action starts or fails? It is simple.

```javascript
...pender({
    type: LOAD_POST,
    onPending: (state, action) => {
        return state; // do something
    },
    onSuccess: (state, action) => {
        return {
            post: action.payload.data
        }
    },
    onFailure: (state, action) => {
        return state; // do something
    }
}, initialState)
```

When you omit one of those function, `(state, action) => state` will be the default value.
Additionally, it is not recommended to manage the status of request in your own reducer, because the penderReducer will do this for you. You just need to care about the result of your task in your reducer.

#### applyPenders - helper function that allows you to apply penders super easily.

```javascript

import { handleActions } from 'redux-actions';
import { pender, applyPenders } from 'redux-pender';

const initialState = { 
    post: {}
}

const reducer = handleActions({
    // ... some other action handlers...
}, initialState);

export default applyPenders(reducer, [
    {
        type: LOAD_POST,
        onPending: (state, action) => {
            return state; // do something
        },
        onSuccess: (state, action) => {
            return {
                post: action.payload.data
            }
        },
        onFailure: (state, action) => {
            return state; // do something
        }
    }
])
```

### Cancellation
Cancelling the promise based action is very simple in redux-pender. You just have to call `.cancel()` from the returned value of your promise based action creator.

```javascript
const p = loadPost(1);
p.cancel();
```

When `cancel` is executed, redux-pender middleware will dispatch `ACTION_TYPE_CANCEL`. You can handle that action manually or configure `onCancel` in the action pender.

```javascript
...pender({
    type: LOAD_POST,
    onCancel: (state, action) => {
        return state; // do something
    }
}, initialState)
```

### Using in your React Component

```javascript
import React, { Component } from 'react';
import * as actions from './actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Example extends Component {

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const { Actions } = this.props;
        try {
            await Actions.loadPost(1);
            console.log('data is fetched!');
        } catch(e) {
            console.log(e);
        }
    }

    render() {
        const { loading, post } = this.props;

        return (
            <div>
                { loading && 'Loading...' }
                <div>
                    <h1>{post.title}</h1>
                    <p>{post.body}</p>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        post: state.blog.post,
        loading: state.pender.pending['LOAD_POST']
    }),
    dispatch => ({
        Actions: bindActionCreators(actions, dispatch)
    })
)(Example)
```


## Examples

An example project of using this library is provided in [examples](examples/) directory.
If you want to see some more complex example, check out [do-chat](https://github.com/velopert/do-chat). It is a ChatApp project that uses firebase as backend.

## Contributing

Contributions, questions and pull requests are all welcomed.

## License

Copyright (c) 2017. [Velopert](https://velopert.com/) [Licensed with The MIT License (MIT)](http://opensource.org/licenses/MIT)