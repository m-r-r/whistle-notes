// @flow

export type ErrorCode = "BROWSER_UNSUPPORTED" | "UNKNOWN_ERROR";

export type Action =
  | { type: "GLOBAL_ERROR", errorCode: ErrorCode }
  | { type: "START_LISTENING" }
  | { type: "START_LISTENING_DONE" }
  | { type: "STOP_LISTENING" };

export type State = {
  error?: ErrorCode,
  isStarting: boolean,
  isListening: boolean
};
