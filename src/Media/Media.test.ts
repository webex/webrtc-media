import {expect} from 'chai';

import {setupMediaDeviceMocks, resetMediaDeviceMocks} from './Device/DeviceMocks';
import {
  getCameras,
  getSpeakers,
  getMicrophones,
} from './index';

describe('Media', () => {
  before(() => {
    setupMediaDeviceMocks();
  });

  after(() => {
    resetMediaDeviceMocks();
  });

  describe('getCameras', () => {
    it('should resolve array of cameras on success', async () => {
      const [device] = await getCameras();

      expect(device.kind).to.eq('videoinput');
    });
  });

  describe('getMicrophones', () => {
    it('should resolve array of mics on success', async () => {
      const [device] = await getMicrophones();

      expect(device.kind).to.eq('audioinput');
    });
  });

  describe('getSpeakers', () => {
    it('should resolve array of speakers on success', async () => {
      const [device] = await getSpeakers();

      expect(device.kind).to.eq('audiooutput');
    });
  });
});
