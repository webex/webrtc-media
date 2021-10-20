import {expect} from 'chai';

import {TrackKind, TrackStatus} from './Track';
import {DeviceInterface, DeviceKinds} from './Device';

import {setupMediaTrackMocks, resetMediaTrackMocks} from './Track/TrackMock';
import {setupMediaDeviceMocks, resetMediaDeviceMocks} from './Device/DeviceMocks';

import {
  getCameras,
  getSpeakers,
  getMicrophones,
  createAudioTrack,
  createVideoTrack,
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

  describe('createAudioTrack()', () => {
    let mockDevice = {
      ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
      groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
      kind: DeviceKinds.AUDIO_INPUT,
      label: 'Fake Audio Input 1',
      mediaDeviceInfo: null,
    };

    before(() => {
      setupMediaTrackMocks();
    });

    after(() => {
      resetMediaTrackMocks();
    });

    afterEach(() => {
      mockDevice = {
        ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
        groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
        kind: DeviceKinds.AUDIO_INPUT,
        label: 'Fake Audio Input 1',
        mediaDeviceInfo: null,
      };
    });

    it('should resolve to default audio track on success', async () => {
      const track = await createAudioTrack();

      expect(track.ID).to.eq('default');
      expect(track.kind).to.eq(TrackKind.AUDIO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Default Audio Input');
      expect(track.stop).to.be.a('function');
    });

    it('should resolve to given device audio track on success', async () => {
      const track = await createAudioTrack((mockDevice as unknown) as DeviceInterface);

      expect(track.ID).to.eq('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).to.eq(TrackKind.AUDIO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Audio Input 1');
      expect(track.stop).to.be.a('function');
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(await createAudioTrack((mockDevice as unknown) as DeviceInterface)
        .catch((error: Error) => expect(error).to.be.an('error')
          .with.property('message', 'Could not obtain an audio track')));
    });

    it('should throw error as given device.kind is VIDEO_INPUT', () => {
      mockDevice.kind = DeviceKinds.VIDEO_INPUT;
      expect(createAudioTrack((mockDevice as unknown) as DeviceInterface)
        .catch((error: Error) => expect(error).to.be.an('error')
          .with.property('message', `Device ${mockDevice.ID} is not of kind AUDIO_INPUT`)));
    });
  });

  describe('createVideoTrack()', () => {
    let mockDevice = {
      ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
      groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
      kind: DeviceKinds.VIDEO_INPUT,
      label: 'Fake Video Input 1',
      mediaDeviceInfo: null,
    };

    before(() => {
      setupMediaTrackMocks();
    });

    after(() => {
      resetMediaTrackMocks();
    });

    afterEach(() => {
      mockDevice = {
        ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
        groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
        kind: DeviceKinds.VIDEO_INPUT,
        label: 'Fake Video Input 1',
        mediaDeviceInfo: null,
      };
    });

    it('should resolve to default video track on success', async () => {
      const track = await createVideoTrack();

      expect(track.ID).to.eq('default');
      expect(track.kind).to.eq(TrackKind.VIDEO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Default Video Input');
      expect(track.stop).to.be.a('function');
    });

    it('should resolve to given device video track on success', async () => {
      const track = await createVideoTrack((mockDevice as unknown) as DeviceInterface);

      expect(track.ID).to.eq('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).to.eq(TrackKind.VIDEO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Video Input 1');
      expect(track.stop).to.be.a('function');
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(await createVideoTrack((mockDevice as unknown) as DeviceInterface)
        .catch((error: Error) => expect(error).to.be.an('error')
          .with.property('message', 'Could not obtain a video track')));
    });

    it('should throw error as given device.kind is AUDIO_INPUT', () => {
      mockDevice.kind = DeviceKinds.AUDIO_INPUT;
      expect(createVideoTrack((mockDevice as unknown) as DeviceInterface)
        .catch((error: Error) => expect(error).to.be.an('error')
          .with.property('message', `Device ${mockDevice.ID} is not of kind VIDEO_INPUT`)));
    });
  });
});
