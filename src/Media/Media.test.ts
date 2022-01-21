import {expect} from 'chai';
import Sinon, {SinonSpy} from 'sinon';

import {TrackKind, TrackStatus} from './Track';
import {DeviceInterface, DeviceKinds} from './Device';

import {setupMediaTrackMocks, setupEmptyMediaTrackMocks, resetMediaTrackMocks} from './Track/TrackMock';
import {setupMediaDeviceMocks, resetMediaDeviceMocks, fakeDevices} from './Device/DeviceMocks';

import {
  getCameras,
  getSpeakers,
  getMicrophones,
  createAudioTrack,
  createVideoTrack,
  createContentTrack,
  subscribe,
} from './index';

import {subscriptions, deviceList} from '../Events';

import {subscription as subscriptionType} from '../Events/Subscription';

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

  describe('createContentTrack()', () => {
    before(() => {
      setupMediaTrackMocks();
    });

    after(() => {
      resetMediaTrackMocks();
    });

    it('should resolve to default video track on success', async () => {
      const track = await createContentTrack();

      expect(track.ID).to.eq('default');
      expect(track.kind).to.eq(TrackKind.VIDEO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Default Video Input');
      expect(track.stop).to.be.a('function');
    });
  });

  describe('createContentTrack() if stream is empty', () => {
    before(() => {
      setupEmptyMediaTrackMocks();
    });

    after(() => {
      resetMediaTrackMocks();
    });

    it('should throw error if content track is empty', async () => {
      expect(await createContentTrack()
        .catch((error: Error) => expect(error).to.be.an('error')
          .with.property('message', 'Could not obtain a content track')));
    });
  });

  describe('subscribe()', () => {
    let subscription: subscriptionType;
    let subscription2: subscriptionType;
    let eventCallbackSpy: SinonSpy = Sinon.spy();
    let eventCallbackSpy2: SinonSpy = Sinon.spy();

    before(async () => {
      setupMediaDeviceMocks();
      subscription = await subscribe('device:changed', eventCallbackSpy);
      subscription2 = await subscribe('device:changed', eventCallbackSpy2);
    });

    after(() => {
      resetMediaDeviceMocks();
    });

    it('should have subscribe, return subscription, have it available in subscriptions', () => {
      expect(subscription.listener.method).to.be.equal(eventCallbackSpy);
      expect(subscriptions.events['device:changed'].get(subscription.listener.id)).to.be.equal(eventCallbackSpy);
    });

    it('should get device list when the first subscription happens', () => {
      expect(deviceList).to.have.lengthOf.above(0);
    });

    describe('deviceChange event & publisher', () => {
      it('should trigger multiple device:changed events on device removal', () => {
        expect(navigator.mediaDevices).to.have.property('ondevicechange');
        if (navigator.mediaDevices.ondevicechange) {
          eventCallbackSpy = Sinon.spy();
          eventCallbackSpy2 = Sinon.spy();
          subscriptions.events['device:changed'].set(subscription.listener.id, eventCallbackSpy);
          subscriptions.events['device:changed'].set(subscription2.listener.id, eventCallbackSpy2);
          fakeDevices.splice(0, 1);
          fakeDevices.splice(3, 1);
          navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
          Sinon.assert.called(eventCallbackSpy);
          Sinon.assert.called(eventCallbackSpy2);
          expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('removed');
        }
      });

      it('should trigger multiple device:changed events on device addition', () => {
        expect(navigator.mediaDevices).to.have.property('ondevicechange');
        if (navigator.mediaDevices.ondevicechange) {
          eventCallbackSpy = Sinon.spy();
          eventCallbackSpy2 = Sinon.spy();
          subscriptions.events['device:changed'].set(subscription.listener.id, eventCallbackSpy);
          subscriptions.events['device:changed'].set(subscription2.listener.id, eventCallbackSpy2);
          fakeDevices.push(...[{
            deviceId: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a3',
            kind: 'audioinput',
            label: 'Fake Default Audio Input 2',
            groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c2',
          }, {
            deviceId: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a5',
            kind: 'audiooutput',
            label: 'Fake Default Audio Output',
            groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c2',
          }]);
          navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
          Sinon.assert.called(eventCallbackSpy);
          Sinon.assert.called(eventCallbackSpy2);
          expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('added');
        }
      });
    });
  });
});
