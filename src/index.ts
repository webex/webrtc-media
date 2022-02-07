export * from './Media';
// Could not make ES6 import as the library's typescript definition file is corrupt #108 issue raised
// Todo: Convert to ES6 import once this issue gets resolved -> https://github.com/muaz-khan/DetectRTC/issues/108
// eslint-disable-next-line
const DetectRTC = require('detectrtc');
/*
* Returns `true` if current Browser is supported, `false` otherwise.
*/
export function isBrowserSupported(): boolean {
  let isSupported = false;

  if ((DetectRTC.browser.isChrome
    || DetectRTC.browser.isFirefox
    || DetectRTC.browser.isSafari
    || DetectRTC.browser.isEdge)
    && DetectRTC.isWebRTCSupported
  ) {
    isSupported = true;
  }

  return isSupported;
}
