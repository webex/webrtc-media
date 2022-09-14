// eslint-disable-next-line import/no-extraneous-dependencies
import {CustomConsole} from '@jest/console';
// import {fakeDevices, mockMediaStreamTrack} from './src/Media/Device/DeviceMocks.ts';

window.RTCSessionDescription = jest.fn().mockImplementation((desc) => ({
  type: desc.type,
  sdp: desc.sdp || '',
}));

window.RTCPeerConnection = jest.fn();

// make the console logs shown by jest more concise (1 line instead of 5 for each console.log call)
global.console = new CustomConsole(process.stdout, process.stderr, (_type, message) => message);
