import {expect} from 'chai';

import {setupMediaDeviceMocks, resetMediaDeviceMocks} from './DeviceMocks';
import Devices from './Devices';

const {
  getDevices, getCameras, getSpeakers, getMicrophones,
} = Devices;

describe('Devices', () => {
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

  describe('getDevices', () => {
    it('should resolve array of devices on success', async () => {
      const devices = await getDevices();

      expect(Array.isArray(devices));
      devices.forEach((device) => {
        expect(device.kind);
        expect(device.label);
        expect(device.deviceId);
      });
    });

    it('should resolve array if no devices', async () => {
      const {enumerateDevices} = navigator.mediaDevices;

      Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
        value: null,
      });

      const devices = await getDevices();

      expect(devices.length).to.eq(0);

      Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
        value: enumerateDevices,
      });
    });
  });
});
