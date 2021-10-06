import {expect} from 'chai';
import Devices from './Devices';

describe('Devices Integration Test - use-fake-ui-for-media-stream', () => {
  const {
    getCameras, getMicrophones, getSpeakers,
  } = Devices;

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

  // Test is skipped due to firefox not implementing fake audio output.
  describe('getSpeakers', () => {
    xit('should return Fake Audio Output', async () => {
      const [speakers] = await getSpeakers();

      expect(speakers.kind).to.eq('audiooutput');
    });
  });
});
