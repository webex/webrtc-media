import {expect} from 'chai';
import {getCameras, getMicrophones, getSpeakers} from './index';
import {isBrowserSupported} from '../index';

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

  xdescribe('isBrowserSupported()', () => {
    it('should check is Browser Supported', () => {
      const isSupported = isBrowserSupported();

      expect(isSupported).to.eq(true);
    });
  });

  // Test is skipped due to firefox not implementing fake audio output.
  describe('getSpeakers', () => {
    xit('should return Fake Audio Output', async () => {
      const [speakers] = await getSpeakers();

      expect(speakers.kind).to.eq('audiooutput');
    });
  });
});
