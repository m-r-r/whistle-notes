// @flow
import { globalError, startListeningDone } from "../actions";
import type { Action, State } from "../types.flow";
import type { Dispatch, MiddlewareAPI } from "redux";
import AudioCaptureService from "../services/AudioCapture";
import AudioAnalyzer from "../services/AudioAnalyzer";

export default ({ dispatch }: MiddlewareAPI<State, Action>) => (
  next: Dispatch<Action>
) => {
  const audioCapture = new AudioCaptureService();
  return (action: Action) => {
    action = next(action);
    switch (action.type) {
      case "START_LISTENING": {
        console.debug(action);
        audioCapture
          .getStream()
          .then(stream => {
            console.debug("stream", stream);
            const analyser = new AudioAnalyzer(stream);
            analyser.setListener(event => {
              switch (event.type) {
                case "start":
                  return dispatch(startListeningDone());
                default:
                  return console.log({ ...event });
              }
            });
          })
          .catch(error => dispatch(globalError(error)));
        break;
      }
      case "STOP_LISTENING":
        audioCapture.stop();
        break;
    }
    return action;
  };
};
