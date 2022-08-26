import { expect } from 'chai';
// import * as DetectRTC from 'detectrtc';

import { getCameras, getMicrophones, getSpeakers } from '.';
// import { isBrowserSupported } from '../../../webrtc-media/src';

describe('Media Integration Test - use-fake-ui-for-media-stream', () => {
  describe('getCameras', () => {
    it('should return Fake Video Input (1)', async () => {
      const [cameras] = await getCameras();

      expect(cameras.kind).to.eq('videoinput');
    });
  });

  describe('getMicrophones', () => {
    it('should return Fake Audio Input (3)', async () => {
      const [mics] = await getMicrophones();

      expect(mics.kind).to.eq('audioinput');
    });
  });

  // describe('isBrowserSupported()', () => {
  //   it('should check is Browser not Supported', () => {
  //     DetectRTC.browser.isChrome = false;
  //     DetectRTC.browser.isFirefox = false;
  //     DetectRTC.browser.isEdge = false;
  //     DetectRTC.browser.isSafari = false;
  //     const isSupported = isBrowserSupported();

  //     expect(isSupported).to.eq(false);
  //   });

  //   it('should check is Browser Supported', () => {
  //     DetectRTC.browser.isChrome = true;
  //     const isSupported = isBrowserSupported();

  //     expect(isSupported).to.eq(true);
  //   });
  // });

  // Test is skipped due to firefox not implementing fake audio output.
  describe('getSpeakers', () => {
    xit('should return Fake Audio Output', async () => {
      const [speakers] = await getSpeakers();

      expect(speakers.kind).to.eq('audiooutput');
    });
  });
});
