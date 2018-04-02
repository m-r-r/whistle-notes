// @flow
import type { Store } from "redux";
import { createStore, applyMiddleware } from "redux";
import rootReducer from "../reducers";
import type { Action, State } from "../types.flow";
import middleware from "./middleware";

export default function configureStore(): Store<State, Action> {
  let enhancer = applyMiddleware(middleware);
  if (
    process.env.NODE_ENVIRONMENT !== "production" &&
    window.__REDUX_DEVTOOLS_EXTENSION
  ) {
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION(enhancer);
  }
  return createStore(rootReducer, enhancer);
}
