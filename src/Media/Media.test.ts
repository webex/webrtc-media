import {expect} from 'chai';
import Sinon, {SinonSpy} from 'sinon';

import {Track, TrackKind, TrackStatus} from './Track';
import {DeviceInterface, DeviceKinds} from './Device';

import {
  setupMediaTrackMocks,
  setupEmptyMediaTrackMocks,
  resetMediaTrackMocks,
  fakeAudioTracks,
  fakeVideoTracks,
} from './Track/TrackMock';
import {setupMediaDeviceMocks, resetMediaDeviceMocks, fakeDevices} from './Device/DeviceMocks';

import {
  getCameras,
  getSpeakers,
  getMicrophones,
  createAudioTrack,
  createVideoTrack,
  createContentTrack,
  subscribe,
  unsubscribe,
  isCodecAvailable,
  hasH264Codec,
} from './index';
import * as pcMock from '../common/peerConnectionMock';


import {subscriptions, deviceList} from './Events';

import {subscription as subscriptionType} from './Events/Subscription';
import {isBrowserSupported} from '../index';

// Could not make ES6 import as the library's typescript definition file is corrupt #108 issue raised
// Todo: Convert to ES6 import once this issue gets resolved -> https://github.com/muaz-khan/DetectRTC/issues/108
// eslint-disable-next-line
const DetectRTC = require('detectrtc');

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

  xdescribe('isBrowserSupported()', () => {
    it('should check if the current Browser Supported', () => {
      const isSupported = isBrowserSupported();

      expect(isSupported).to.eq(true);
    });

    it('should check if current Browser is not supported', () => {
      DetectRTC.browser.isChrome = false;
      DetectRTC.browser.isFirefox = false;
      DetectRTC.browser.isEdge = false;
      DetectRTC.browser.isSafari = false;
      DetectRTC.browser.isIE = true;
      const isSupported = isBrowserSupported();

      expect(isSupported).to.eq(false);
    });

    it('should check if current Browser is supported but WebRTC not Supported', () => {
      DetectRTC.isWebRTCSupported = false;
      const isSupported = isBrowserSupported();

      expect(isSupported).to.eq(false);
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
      const track = await createAudioTrack(mockDevice as unknown as DeviceInterface);

      expect(track.ID).to.eq('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).to.eq(TrackKind.AUDIO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Audio Input 1');
      expect(track.stop).to.be.a('function');
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(
        await createAudioTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property(
              'message',
              `Device could not obtain an audio track of kind ${mockDevice?.kind}`
            )
        )
      );
    });

    it('should throw error as given device.kind is VIDEO_INPUT', () => {
      mockDevice.kind = DeviceKinds.VIDEO_INPUT;
      expect(
        createAudioTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property('message', `Device ${mockDevice.ID} is not of kind AUDIO_INPUT`)
        )
      );
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
      const track = await createVideoTrack(mockDevice as unknown as DeviceInterface);

      expect(track.ID).to.eq('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).to.eq(TrackKind.VIDEO);
      expect(track.status).to.eq(TrackStatus.LIVE);
      expect(track.muted).to.eq(true);
      expect(track.label).to.eq('Fake Video Input 1');
      expect(track.stop).to.be.a('function');
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(
        await createVideoTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property(
              'message',
              `Device could not obtain a video track of kind ${mockDevice?.kind}`
            )
        )
      );
    });

    it('should throw error as given device.kind is AUDIO_INPUT', () => {
      mockDevice.kind = DeviceKinds.AUDIO_INPUT;
      expect(
        createVideoTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error)
            .to.be.an('error')
            .with.property('message', `Device ${mockDevice.ID} is not of kind VIDEO_INPUT`)
        )
      );
    });
  });

  describe('createContentTrack() Without Constraints', () => {
    before(() => {
      setupMediaTrackMocks();
    });
    after(() => {
      resetMediaTrackMocks();
    });
    describe('success', () => {
      it('should resolve to default content track on success', async () => {
        const contentTrack = await createContentTrack();

        expect(contentTrack.ID).to.eq('default');
        expect(contentTrack.kind).to.eq(TrackKind.VIDEO);
        expect(contentTrack.status).to.eq(TrackStatus.LIVE);
        expect(contentTrack.muted).to.eq(true);
        expect(contentTrack.label).to.eq('Fake Default Video Input');
        expect(contentTrack.stop).to.be.a('function');
      });
    });
  });

  describe('createContentTrack() With Constraints', () => {
    describe('success', () => {
      it('should resolve to passed constraints content track on success', async () => {
        const contentTrack = await createContentTrack({
          frameRate: 10,
          width: 320,
          height: 180,
          deviceId: '3786a0243c13d1bc4f39b8091b468f43b14a35315ecd4e878268f095a9d3ba94',
        });

        expect(contentTrack.getSettings().frameRate).to.eq(10);
        expect(contentTrack.getSettings().width).to.eq(320);
        expect(contentTrack.getSettings().height).to.eq(180);
      });
    });

    describe('failure', () => {
      it('should throw error for unsupported constraints', async () =>
        createContentTrack({
          // @ts-expect-error apply unsupported constraints in order to expect error
          unsupported: 'test',
          unsupported2: 'testagain',
          width: 1024,
          deviceId: '3786a0243c13d1bc4f39b8091b468f43b14a35315ecd4e878268f076979d3ba94',
        }).catch((error) => {
          expect(error.toString()).to.eq(
            'Error: unsupported, unsupported2 constraint is not supported by browser'
          );
        }));
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
      expect(
        await createContentTrack().catch((error: Error) =>
          expect(error).to.be.an('error').with.property('message', error.message)
        )
      );
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
      expect(subscriptions.events['device:changed'].get(subscription.listener.id)).to.be.equal(
        eventCallbackSpy
      );
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
          fakeDevices.push(
            ...[
              {
                deviceId: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a3',
                kind: 'audioinput',
                label: 'Fake Default Audio Input 2',
                groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c2',
              },
              {
                deviceId: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a5',
                kind: 'audiooutput',
                label: 'Fake Default Audio Output',
                groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c2',
              },
            ]
          );
          navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
          Sinon.assert.called(eventCallbackSpy);
          Sinon.assert.called(eventCallbackSpy2);
          expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('added');
        }
      });
    });

    describe('track mute event & publisher', () => {
      const mockDeviceAudio = {
        ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
        groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
        kind: DeviceKinds.AUDIO_INPUT,
        label: 'Fake Audio Input 1',
        mediaDeviceInfo: null,
      };

      const mockDeviceVideo = {
        ID: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
        groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
        kind: DeviceKinds.VIDEO_INPUT,
        label: 'Fake Video Input 1',
        mediaDeviceInfo: null,
      };

      before(async () => {
        setupMediaTrackMocks();
        subscription = await subscribe('track:mute', eventCallbackSpy);
      });

      after(() => {
        resetMediaTrackMocks();
      });

      it('should have subscribe, track mute event available', () => {
        expect(subscription.listener.method).to.be.equal(eventCallbackSpy);
        expect(subscriptions.events['track:mute'].get(subscription.listener.id)).to.be.equal(
          eventCallbackSpy
        );
      });

      it('should have onmute event on audio tracks for unmuted', async () => {
        eventCallbackSpy = Sinon.spy();
        subscriptions.events['track:mute'].set(subscription.listener.id, eventCallbackSpy);

        await createAudioTrack(mockDeviceAudio as unknown as DeviceInterface);
        const filteredTrackByID = fakeAudioTracks.filter((val) => val.id === mockDeviceAudio.ID);

        filteredTrackByID[0].enabled = false;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('unmuted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).to.be.an.instanceof(Track);
      });

      it('should have onmute event on audio tracks for muted', async () => {
        eventCallbackSpy = Sinon.spy();
        subscriptions.events['track:mute'].set(subscription.listener.id, eventCallbackSpy);

        await createAudioTrack(mockDeviceAudio as unknown as DeviceInterface);
        const filteredTrackByID = fakeAudioTracks.filter((val) => val.id === mockDeviceAudio.ID);

        filteredTrackByID[0].enabled = true;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('muted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).to.be.an.instanceof(Track);
      });

      it('should have onmute event on video tracks for unmuted', async () => {
        eventCallbackSpy = Sinon.spy();
        subscriptions.events['track:mute'].set(subscription.listener.id, eventCallbackSpy);

        await createVideoTrack(mockDeviceVideo as unknown as DeviceInterface);
        const filteredTrackByID = fakeVideoTracks.filter((val) => val.id === mockDeviceVideo.ID);

        filteredTrackByID[0].enabled = false;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('unmuted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).to.be.an.instanceof(Track);
      });

      it('should have onmute event on vedio tracks for muted', async () => {
        eventCallbackSpy = Sinon.spy();
        subscriptions.events['track:mute'].set(subscription.listener.id, eventCallbackSpy);

        await createVideoTrack(mockDeviceVideo as unknown as DeviceInterface);
        const filteredTrackByID = fakeVideoTracks.filter((val) => val.id === mockDeviceVideo.ID);

        filteredTrackByID[0].enabled = true;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).to.be.equal('muted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).to.be.an.instanceof(Track);
      });
    });
  });
  describe('unsubscribe()', () => {
    const eventCallbackSpy: SinonSpy = Sinon.spy();
    let mockSubscription: subscriptionType;

    before(async () => {
      setupMediaDeviceMocks();
      mockSubscription = await subscribe('device:changed', eventCallbackSpy);
    });

    it('should unsubscribe event if subscription event is passed', () => {
      const initialSize = subscriptions.events[mockSubscription.type].size;

      if (initialSize > 0) {
        const isUnsubscribed = unsubscribe(mockSubscription);

        expect(initialSize).not.to.eq(subscriptions.events[mockSubscription.type].size);
        expect(isUnsubscribed).to.be.eq(true);
      }
    });

    it('will return false  if passed event subscription is not found ', () => {
      const initialSize = subscriptions.events[mockSubscription.type].size;

      mockSubscription.listener.id = 'somerandomnumber';
      if (initialSize > 0) {
        const isUnsubscribed = unsubscribe(mockSubscription);

        expect(initialSize).to.eq(subscriptions.events[mockSubscription.type].size);
        expect(isUnsubscribed).to.eq(false);
      }
    });

    it('should unsubscribe  all event if no subscription event is passed', () => {
      const isUnsubscribed = unsubscribe();

      expect(0).to.eq(subscriptions.events[mockSubscription.type].size);
      expect(isUnsubscribed).to.eq(false);
    });
  });
  describe('checkH264Support()', () => {
    it('check for codec if no notifications needed', async () => {
      const isCodec = await isCodecAvailable();
  
      describe('hasH264Codec  returns true', () => {
        before(() => {
          pcMock.setupRTCPeerConnectionMockOne();
        });
  
        after(() => {
          pcMock.resetRTCPeerConnection();
        });
  
        it('if codec is loaded in browser', async () => {
          expect(await hasH264Codec()).to.eq(true);
        });
      });
  
      expect(typeof isCodec === 'boolean');
    });
  
    describe('hasH264Codec  returns false', () => {
      before(() => {
        pcMock.setupRTCPeerConnectionMockTwo();
      });
  
      after(() => {
        pcMock.resetRTCPeerConnection();
      });
  
      it('if codec is not loaded in browser', async () => {
        expect(await hasH264Codec()).to.eq(false);
      });
    });
  
    it('check for codec if notifications is needed', async () => {
      const isCodec = await isCodecAvailable();
  
      describe('hasH264Codec  returns true', () => {
        before(() => {
          pcMock.setupRTCPeerConnectionMockThree();
        });
  
        after(() => {
          pcMock.resetRTCPeerConnection();
        });
  
        it('if codec is delayed while loading in browser ', async () => {
          expect(await hasH264Codec()).to.eq(true);
        });
      });
  
      expect(typeof isCodec === 'boolean');
    });
  });
});

