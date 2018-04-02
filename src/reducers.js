// @flow
import type { Action, State } from "./types.flow";

export const DEFAULT_STATE: State = {
  isListening: false,
  isStarting: false
};

export default function rootReducer(
  state: State = DEFAULT_STATE,
  action: Action
) {
  switch (action.type) {
    case "START_LISTENING": {
      return {
        ...state,
        isStarting: true
      };
    }
    case "START_LISTENING_DONE": {
      return { ...state, isStarting: false, isListening: true };
    }
    case "STOP_LISTENING": {
      return { ...state, isListening: false };
    }
    default:
      return state;
  }
}
