import * as DetectRTC from 'detectrtc';
import {MEDIA} from './constants';
import logger from './Logger';

import * as MediaCore from './Media';
import * as MediaConnections from './MediaConnection';
import * as BNR from './Media/Effects/BNR';

/*
 * Returns `true` if current Browser is supported, `false` otherwise.
 */
export function isBrowserSupported(): boolean {
  let isSupported = false;

  logger.info({
    mediaType: MEDIA,
    action: 'isBrowserSupported()',
    description: 'Checking is current browser supported by webrtc',
  });
  if (
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isFirefox ||
      DetectRTC.browser.isSafari ||
      DetectRTC.browser.isEdge) &&
    DetectRTC.isWebRTCSupported
  ) {
    isSupported = true;
  }

  return isSupported;
}

// TODO: we should be exporting * from Media in this file as well as for MediaConnection
export const Media = {
  createAudioTrack: MediaCore.createAudioTrack,
  createVideoTrack: MediaCore.createVideoTrack,
  createContentTrack: MediaCore.createContentTrack,
  getCameras: MediaCore.getCameras,
  getMicrophones: MediaCore.getMicrophones,
  getSpeakers: MediaCore.getSpeakers,
  on: MediaCore.on,
  off: MediaCore.off,
  Effects: {
    BNR: {
      enableBNR: BNR.enableBNR,
    },
  },
  isBrowserSupported,
};

// TODO: need to filter this based on utility/ROAP/Peerconnection if needed
export const MediaConnection = MediaConnections;
