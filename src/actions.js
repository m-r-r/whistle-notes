// @flow
import type { Action } from "./types.flow";
import { getErrorCode } from "./errors";

export const globalError = (err: Error): Action => {
  if (process.env.NODE_ENVIRONMENT !== "production") {
    console.error(err);
  }
  return {
    type: "GLOBAL_ERROR",
    errorCode: getErrorCode(err)
  };
};

export const startListening = (): Action => ({
  type: "START_LISTENING"
});

export const startListeningDone = (): Action => ({
  type: "START_LISTENING_DONE"
});

export const stopListening = (): Action => ({
  type: "STOP_LISTENING"
});
