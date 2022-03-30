import {fakeDevices, mockMediaStreamTrack} from './src/Media/Device/DeviceMocks';

window.RTCSessionDescription = jest.fn().mockImplementation((desc) => ({
  type: desc.type,
  sdp: desc.sdp || '',
}));

window.RTCPeerConnection = jest.fn();

const map = {};

window.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
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
};
