// eslint-disable-next-line import/no-extraneous-dependencies
import {CustomConsole} from '@jest/console';
import {fakeDevices, mockMediaStreamTrack} from './src/Media/Device/DeviceMocks';

window.RTCSessionDescription = jest.fn().mockImplementation((desc) => ({
  type: desc.type,
  sdp: desc.sdp || '',
}));

window.RTCPeerConnection = jest.fn();

const map = {};
const mediConstraints = {
  frameRate: true,
  width: true,
  height: true,
  deviceId: true,
  sampleRate: true
};

window.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getVideoTracks: () => [mockMediaStreamTrack],
    getAudioTracks: () => [mockMediaStreamTrack],
  }),
  getDisplayMedia: jest.fn().mockResolvedValue({
    getVideoTracks: () => [mockMediaStreamTrack],
  }),
  addEventListener: jest.fn().mockImplementation((event, cb) => {
    map[event] = cb;
  }),
  removeEventListener: jest.fn().mockImplementation((event, cb) => {
    delete map[event];
  }),
  ondevicechange: null,
  enumerateDevices: jest.fn().mockResolvedValue(fakeDevices),
  getSupportedConstraints: jest.fn(() => mediConstraints),
};

// make the console logs shown by jest more concise (1 line instead of 5 for each console.log call)
global.console = new CustomConsole(process.stdout, process.stderr, (_type, message) => message);
