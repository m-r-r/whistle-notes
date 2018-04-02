export class NotSupportedError extends Error {}

export default class AudioCaptureService {
  _currentStream: ?MediaStream = null;
  getStream() {
    this.stop();
    return new Promise((done, fail) => {
      try {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: { channels: 1 } })
          .then(stream => {
            this._currentStream = stream;
            done(stream);
          }, fail);
      } catch (_err) {
        fail(new NotSupportedError());
      }
    });
  }

  stop() {
    if (this._currentStream) {
      this._currentStream.getTracks().forEach(track => track.stop());
      this._currentStream = null;
    }
  }
}
