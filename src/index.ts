import {MEDIA} from './constants';
import logger from './Logger';

import * as MediaCore from './Media';
import * as MediaConnections from './MediaConnection';

// Could not make ES6 import as the library's typescript definition file is corrupt #108 issue raised
// Todo: Convert to ES6 import once this issue gets resolved -> https://github.com/muaz-khan/DetectRTC/issues/108
// eslint-disable-next-line
// const DetectRTC = require('detectrtc');
/*
 * Returns `true` if current Browser is supported, `false` otherwise.
 */
export function isBrowserSupported(): boolean {
  const isSupported = true;

  logger.info({
    mediaType: MEDIA,
    action: 'isBrowserSupported()',
    description: 'Checking is current browser supported by webrtc',
  });
  // if (
  //   (DetectRTC.browser.isChrome ||
  //     DetectRTC.browser.isFirefox ||
  //     DetectRTC.browser.isSafari ||
  //     DetectRTC.browser.isEdge) &&
  //   DetectRTC.isWebRTCSupported
  // ) {
  //   isSupported = true;
  // }

  return isSupported;
}

// TODO: we should be exporting * from Media in this file as well as for MediaConnection
export const Media = {
  createAudioTrack: MediaCore.createAudioTrack,
  createVideoTrack: MediaCore.createVideoTrack,
  getCameras: MediaCore.getCameras,
  getMicrophones: MediaCore.getMicrophones,
  getSpeakers: MediaCore.getSpeakers,
  subscribe: MediaCore.subscribe,
  subscribe: MediaCore.unsubscribe,
  // isBrowserSupported,
};

// TODO: need to filter this based on utility/ROAP/Peerconnection if needed
export const MediaConnection = MediaConnections;
