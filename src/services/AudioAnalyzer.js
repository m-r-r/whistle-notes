// @flow
import {Yin} from 'yin-pitch';

// A sample rate in Hertz
type SampleRate = number;

// A frequency in Hertz
type Hz = number;

// A number of samples
type SamplesCount = number;

const MIN_FREQUENCY: Hz = 261.626; // C4
const MAX_FREQUENCY: Hz = 2000; // G5
const MIN_VOLUME = 0.03;
const MIN_FREQ_DELTA = 20;
const MIN_SILENCE_DURATION = 300;

const bufferLength = (sampleRate: number): number => {
  let minSamples = frequencyToSamplesCount(MIN_FREQUENCY, sampleRate);
  // Find the next highest power of two
  minSamples--;
  minSamples |= minSamples >> 1;
  minSamples |= minSamples >> 2;
  minSamples |= minSamples >> 4;
  minSamples |= minSamples >> 8;
  minSamples |= minSamples >> 16;
  minSamples++;
  return minSamples;
};

/**
 * Given the frequency of a periodic signal, calculates the length in samples of the signal's period
 *
 * @param {number} f The signal's frequency, in Hz
 * @param {number} sampleRate The sample rate, in Hz
 * @return {number} The number of samples in one period
 */
const frequencyToSamplesCount = (
  f: Hz,
  sampleRate: SampleRate
): SamplesCount => {
  const periodMs = 1000 / f; // Calculate the period from the frequency
  return Math.ceil(periodMs * sampleRate / 1000); // The number of samples can be determined by using a cross-multiplication
};

export default class AudioAnalyzer {
  _yin: Yin;
  _isSilence: boolean = true;
  _listener: ?Function;
  _currentEvent = {
    type: "start",
    timestamp: 0,
    value: null
  };
  _isStarted: boolean = false;
  _silenceDuration = 0;

  _currentFrequency: ?Hz = null;

  constructor(stream: MediaStream) {
    const context = new AudioContext();
    // $FlowFixMe
    const inputSource = context.createMediaStreamSource(stream);

    const passBandFilter = context.createBiquadFilter();
    passBandFilter.type = "bandpass";
    const centerFrequency = (MAX_FREQUENCY + MIN_FREQUENCY) / 2;
    const q = centerFrequency / (MAX_FREQUENCY - MIN_FREQUENCY);
    passBandFilter.frequency.value = centerFrequency;
    passBandFilter.Q.value = q;
    passBandFilter.gain.value = 1;

    let channelMerger = null;
    if (inputSource.channelCount > 1) {
      channelMerger = context.createChannelMerger(inputSource.channelCount);
      inputSource.connect(channelMerger);
      channelMerger.connect(passBandFilter);
    } else {
      inputSource.connect(passBandFilter);
    }

    const scriptProcessor = context.createScriptProcessor(
      bufferLength(context.sampleRate),
      1,
      0
    );
    this._yin = new Yin(scriptProcessor.bufferSize, context.sampleRate);

    console.info("Audio analyzer buffer size : " + scriptProcessor.bufferSize);
    scriptProcessor.onaudioprocess = this._handleAudioProcess.bind(this);
    passBandFilter.connect(scriptProcessor);

    stream.onactive = ev => console.debug("active", ev);
    stream.oninactive = ev => console.debug("inactive", ev);
    stream.onended = () => {
      inputSource.disconnect();
      if (channelMerger) {
        channelMerger.disconnect();
      }
      scriptProcessor.disconnect();
      passBandFilter.disconnect();
      context.close();
    };
  }

  _handleAudioProcess(event: any) {
    const inputBuffer: AudioBuffer = event.inputBuffer;
    const data = inputBuffer.getChannelData(0);

    if (!this._isStarted) {
      this._isStarted = true;
      this._emit("start");
    }

    let noiseVolume = volume(data);
    const isSilence = noiseVolume < MIN_VOLUME;
    if (isSilence) {
      this._silenceDuration += data.length * 1000 / inputBuffer.sampleRate;
      if (this._silenceDuration < MIN_SILENCE_DURATION) {
        return;
      }
    }

    if (isSilence !== this._isSilence) {
      this._isSilence = isSilence;
      this._emit(isSilence ? "silenceStart" : "silenceStop", noiseVolume);
    }

    if (isSilence) {
      // If there is no sound, the frequency is set to null
      this._currentFrequency = null;
    } else {
      const currentFrequency = this._yin.getPitch(data);
      if (
        !this._currentFrequency ||
        Math.abs(this._currentFrequency - currentFrequency) > MIN_FREQ_DELTA
      ) {
        this._currentFrequency = currentFrequency;
        this._emit("frequencyChange", currentFrequency);
      }
    }
  }

  _emit(event: string, value: any = null) {
    this._currentEvent.type = event;
    this._currentEvent.timestamp = performance.now();
    this._currentEvent.value = value;
    try {
      this._listener && this._listener(this._currentEvent);
    } catch (err) {}
  }

  setListener(callback: Function) {
    this._listener = callback;
  }
}

function volume(samples: Float32Array): number {
  let total = 0;
  for (let i = 0; i < samples.length; i++) {
    total += Math.abs(samples[i]);
  }
  return total / samples.length;
}
