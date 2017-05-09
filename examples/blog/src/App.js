import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions';


class App extends Component {
    componentDidMount() {
        const { Actions } = this.props;
        Actions.loadPost(1);
    }
    
    handlePrev = () => {
        const { Actions, id } = this.props;

        try {
            Actions.showPrev();
            Actions.loadPost(id + 1);
        } catch (e) {
            console.log(e);
        }
    }

    handleNext = () => {
        const { Actions, id } = this.props;

        try {
            Actions.showNext();
            Actions.loadPost(id + 1);
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { post, id, loading, error } = this.props;
        const { handlePrev, handleNext } = this;

        return (
            <div>
                <button onClick={handlePrev}>prev</button>
                {id}
                <button onClick={handleNext}>next</button>

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