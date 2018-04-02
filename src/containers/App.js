// @flow
import React, { PureComponent } from "react";
import "./App.css";
import PlayPauseButton from "../components/PlayPauseButton";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";
import * as actions from "../actions";
import type { Action, State } from "../types.flow";

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(actions, dispatch);

type Props = State & typeof actions;

class App extends PureComponent<*, Props, *> {
  render() {
    const { isListening, isStarting } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title" lang="en">
            Whistle Notes
          </h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <PlayPauseButton
          playing={isListening}
          disabled={isStarting}
          onClick={this._handleToggleListening}
        />
      </div>
    );
  }

  _handleToggleListening = () => {
    const { startListening, stopListening, isListening } = this.props;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
}

export default connect(state => state, mapDispatchToProps)(App);
