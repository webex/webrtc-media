/* eslint-disable class-methods-use-this, max-classes-per-file */
class FakeMediaStream {
  active: boolean;

  id: string;

  constructor() {
    this.active = false;
    this.id = '5146425f-c240-48cc-b86b-27d422988fb7';
  }

  addTrack = () => undefined;
}

class FakeAudioContext {
  baseLatency: number;

  currentTime: number;

  destination?: AudioDestinationNode;

  listener?: AudioListener;

  sampleRate: number;

  state: string;

  audioWorklet: AudioWorklet;

  constructor() {
    this.state = 'running';
    this.baseLatency = 0.005333333333333333;
    this.currentTime = 2.7946666666666666;
    this.sampleRate = 48000;
    this.audioWorklet = {
      addModule: async () => undefined,
    };
  }

  onstatechange = null;

  createMediaStreamSource() {
    return {
      connect: () => undefined,
      mediaStream: {
        getAudioTracks() {
          return [new MediaStreamTrack()];
        },
      },
    };
  }

  createMediaStreamDestination() {
    return {
      stream: {
        getAudioTracks() {
          return [new MediaStreamTrack()];
        },
      },
    };
  }
}

class FakeAudioWorkletNode {
  port: object;

  constructor() {
    this.port = {
      postMessage: () => undefined,
    };
  }

  connect() {
    /* placeholder method */
  }
}

class FakeMediaStreamTrack {
  id: string;

  kind: string;

  enabled: boolean;

  label: string;

  muted: boolean;

  contentHint: string;

  readyState: string;

  constructor() {
    this.id = Date.now().toString();
    this.kind = 'audio';
    this.enabled = true;
    this.label = 'Default - MacBook Pro Microphone (Built-in)';
    this.muted = false;
    this.readyState = 'live';
    this.contentHint = '';
  }

  getSettings() {
    return {
      frameRate: 10,
      width: 320,
      height: 180,
      sampleRate: 48000,
    };
  }
}

export default () => {
  Object.defineProperty(window, 'MediaStream', {
    writable: true,
    value: FakeMediaStream,
  });

  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: FakeAudioContext,
  });

  Object.defineProperty(window, 'AudioWorkletNode', {
    writable: true,
    value: FakeAudioWorkletNode,
  });

  Object.defineProperty(window, 'MediaStreamTrack', {
    writable: true,
    value: FakeMediaStreamTrack,
  });
};
