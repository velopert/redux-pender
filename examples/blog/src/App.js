import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions';


class App extends Component {

    cancel = null

    loadPost = (id) => {
        const { Actions } = this.props;
        const p = Actions.loadPost(id);
        this.cancel = p.cancel;
        return p;
    }

    componentDidMount() {
        this.loadPost(1);
    }

    handleCancel = () => {
        if(this.cancel) {
            this.cancel();
            this.cancel = null;
        }
    }
    
    handlePrev = async () => {
        const { Actions, id } = this.props;

        try {
            Actions.showPrev();
            await this.loadPost(id - 1);
        } catch (e) {
            console.log(e);
        }
    }

    handleNext = async () => {
        const { Actions, id } = this.props;

        try {
            Actions.showNext();
            await this.loadPost(id + 1);
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { post, id, loading, error } = this.props;
        const { handlePrev, handleNext, handleCancel } = this;

        return (
            <div>
                <button onClick={handlePrev}>prev</button>
                {id}
                <button onClick={handleNext}>next</button>
                <button onClick={handleCancel}>cancel</button>

                {
                    loading && 'Loading...'
                }

                {
                    error ? <h1>FAILED!</h1> : (
                        <div>
                            <h1>
                                {post.title}
                            </h1>
                            <p>
                                {post.body}
                            </p>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default connect(
    state => ({
        post: state.blog.post,
        id: state.blog.id,
        loading: state.pender.pending['LOAD_POST'],
        error: state.pender.failure['LOAD_POST']
    }),
    dispatch => ({
        Actions: bindActionCreators(actions, dispatch)
    })
)(App);