import Sinon, {SinonSpy} from 'sinon';

import {DeviceInterface, DeviceKinds} from './Device';
import {Track, TrackKind, TrackStatus} from './Track';

import {fakeDevices, setupMediaDeviceMocks} from './Device/DeviceMocks';
import {
  fakeAudioTracks,
  fakeVideoTracks,
  setupEmptyMediaTrackMocks,
  setupMediaTrackMocks,
} from './Track/TrackMock';

import * as pcMock from '../common/peerConnectionMock';
import {
  createAudioTrack,
  createContentTrack,
  createVideoTrack,
  getCameras,
  getMicrophones,
  getSpeakers,
  isCodecAvailable,
  subscribe,
  unsubscribe,
} from './index';

import {deviceList, subscriptions} from './Events';

import {isBrowserSupported} from '../index';
import {subscriptionListener, subscription as subscriptionType} from './Events/Subscription';

// Could not make ES6 import as the library's typescript definition file is corrupt #108 issue raised
// Todo: Convert to ES6 import once this issue gets resolved -> https://github.com/muaz-khan/DetectRTC/issues/108
// eslint-disable-next-line
const DetectRTC = require('detectrtc');

describe('Media', () => {
  beforeAll(() => {
    setupMediaDeviceMocks();
  });

  beforeEach(() => {
    const mockMediaStreamTrack = {
      kind: 'video',
      muted: true,
      label: 'Fake Default Video Input',
      contentHint: 'sample',
      enabled: true,
      readyState: 'live',
      stop: (): void => {
        /* placeholder */
      },
      applyConstraints: (): void => {
        /* placeholder */
      },
      getSettings: (): MediaTrackSettings => {
        return {
          frameRate: 10,
          width: 320,
          height: 180,
        };
      },
    };

    Object.defineProperty(window.navigator.mediaDevices, 'getDisplayMedia', {
      writable: true,
      value: jest.fn(() =>
        Promise.resolve({
          getVideoTracks: () => [mockMediaStreamTrack],
        })
      ),
    });

    const mockConstraint = {
      frameRate: true,
      width: true,
      height: true,
      deviceId: true,
    };

    Object.defineProperty(window.navigator.mediaDevices, 'getSupportedConstraints', {
      writable: true,
      value: jest.fn(() => mockConstraint),
    });
  });

  describe('getCameras', () => {
    it('should resolve array of cameras on success', async () => {
      const [device] = await getCameras();

      expect(device.kind).toEqual('videoinput');
    });
  });

  describe('getMicrophones', () => {
    it('should resolve array of mics on success', async () => {
      const [device] = await getMicrophones();

      expect(device.kind).toEqual('audioinput');
    });
  });

  describe('getSpeakers', () => {
    it('should resolve array of speakers on success', async () => {
      const [device] = await getSpeakers();

      expect(device.kind).toEqual('audiooutput');
    });
  });

  xdescribe('isBrowserSupported()', () => {
    it('should check if the current Browser Supported', () => {
      const isSupported = isBrowserSupported();

      expect(isSupported).toEqual(true);
    });

    it('should check if current Browser is not supported', () => {
      DetectRTC.browser.isChrome = false;
      DetectRTC.browser.isFirefox = false;
      DetectRTC.browser.isEdge = false;
      DetectRTC.browser.isSafari = false;
      DetectRTC.browser.isIE = true;
      const isSupported = isBrowserSupported();

      expect(isSupported).toEqual(false);
    });

    it('should check if current Browser is supported but WebRTC not Supported', () => {
      DetectRTC.isWebRTCSupported = false;
      const isSupported = isBrowserSupported();

      expect(isSupported).toEqual(false);
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

    beforeAll(() => {
      setupMediaTrackMocks();
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

      expect(track.ID).toEqual('default');
      expect(track.kind).toEqual(TrackKind.AUDIO);
      expect(track.status).toEqual(TrackStatus.LIVE);
      expect(track.muted).toEqual(true);
      expect(track.label).toEqual('Fake Default Audio Input');
      expect(track.stop).toBeInstanceOf(Function);
    });

    it('should resolve to given device audio track on success', async () => {
      const track = await createAudioTrack(mockDevice as unknown as DeviceInterface);

      expect(track.ID).toEqual('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).toEqual(TrackKind.AUDIO);
      expect(track.status).toEqual(TrackStatus.LIVE);
      expect(track.muted).toEqual(true);
      expect(track.label).toEqual('Fake Audio Input 1');
      expect(track.stop).toBeInstanceOf(Function);
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(
        await createAudioTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error).toHaveProperty(
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
          expect(error).toHaveProperty(
            'message',
            `Device ${mockDevice.ID} is not of kind AUDIO_INPUT`
          )
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

    beforeAll(() => {
      setupMediaTrackMocks();
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

      expect(track.ID).toEqual('default');
      expect(track.kind).toEqual(TrackKind.VIDEO);
      expect(track.status).toEqual(TrackStatus.LIVE);
      expect(track.muted).toEqual(true);
      expect(track.label).toEqual('Fake Default Video Input');
      expect(track.stop).toBeInstanceOf(Function);
    });

    it('should resolve to given device video track on success', async () => {
      const track = await createVideoTrack(mockDevice as unknown as DeviceInterface);

      expect(track.ID).toEqual('47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4');
      expect(track.kind).toEqual(TrackKind.VIDEO);
      expect(track.status).toEqual(TrackStatus.LIVE);
      expect(track.muted).toEqual(true);
      expect(track.label).toEqual('Fake Video Input 1');
      expect(track.stop).toBeInstanceOf(Function);
    });

    it('should throw error as given device does not exist', async () => {
      mockDevice.ID = 'i dont exist';

      expect(
        await createVideoTrack(mockDevice as unknown as DeviceInterface).catch((error: Error) =>
          expect(error).toHaveProperty(
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
          expect(error).toHaveProperty(
            'message',
            `Device ${mockDevice.ID} is not of kind VIDEO_INPUT`
          )
        )
      );
    });
  });

  describe('createContentTrack() Without Constraints', () => {
    beforeAll(() => {
      setupMediaTrackMocks();
    });

    describe('success', () => {
      it('should resolve to default content track on success', async () => {
        const contentTrack = await createContentTrack();

        expect(contentTrack.kind).toEqual(TrackKind.VIDEO);
        expect(contentTrack.status).toEqual(TrackStatus.LIVE);
        expect(contentTrack.muted).toEqual(true);
        expect(contentTrack.label).toEqual('Fake Default Video Input');
        expect(contentTrack.stop).toBeInstanceOf(Function);
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

        expect(contentTrack.getSettings().frameRate).toEqual(10);
        expect(contentTrack.getSettings().width).toEqual(320);
        expect(contentTrack.getSettings().height).toEqual(180);
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
          expect(error.toString()).toEqual(
            'Error: unsupported, unsupported2 constraint is not supported by browser'
          );
        }));
    });
  });

  describe('createContentTrack() if stream is empty', () => {
    beforeAll(() => {
      setupEmptyMediaTrackMocks();
    });

    it('should throw error if content track is empty', async () => {
      expect(
        await createContentTrack().catch((error: Error) =>
          expect(error).toHaveProperty('message', error.message)
        )
      );
    });
  });

  describe('subscribe()', () => {
    let subscription: subscriptionType;
    let subscription2: subscriptionType;
    let eventCallbackSpy: SinonSpy = Sinon.spy();
    let eventCallbackSpy2: SinonSpy = Sinon.spy();

    beforeAll(async () => {
      setupMediaDeviceMocks();
      subscription = await subscribe('device:changed', eventCallbackSpy);
      subscription2 = await subscribe('device:changed', eventCallbackSpy2);
    });

    it('should have subscribe, return subscription, have it available in subscriptions', () => {
      expect(subscription.listener.method).toEqual(eventCallbackSpy);
      expect(subscriptions.events['device:changed'].get(subscription.listener.id)?.method).toEqual(
        eventCallbackSpy
      );
    });

    it('should get device list when the first subscription happens', () => {
      expect(deviceList.length).toBeGreaterThan(0);
    });

    describe('deviceChange event & publisher', () => {
      it('should trigger multiple device:changed events on device removal', () => {
        expect(navigator.mediaDevices).toHaveProperty('ondevicechange');
        if (navigator.mediaDevices.ondevicechange) {
          eventCallbackSpy = Sinon.spy();
          eventCallbackSpy2 = Sinon.spy();
          const deviceSubscriptionListener: subscriptionListener = subscriptions.events[
            'device:changed'
          ].get(subscription.listener.id) as subscriptionListener;
          const deviceSubscriptionListener2: subscriptionListener = subscriptions.events[
            'device:changed'
          ].get(subscription2.listener.id) as subscriptionListener;

          deviceSubscriptionListener.method = eventCallbackSpy;
          deviceSubscriptionListener2.method = eventCallbackSpy2;

          fakeDevices.splice(0, 1);
          fakeDevices.splice(3, 1);
          navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
          Sinon.assert.called(eventCallbackSpy);
          Sinon.assert.called(eventCallbackSpy2);
          expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('removed');
        }
      });

      it('should trigger multiple device:changed events on device addition', () => {
        expect(navigator.mediaDevices).toHaveProperty('ondevicechange');
        if (navigator.mediaDevices.ondevicechange) {
          eventCallbackSpy = Sinon.spy();
          eventCallbackSpy2 = Sinon.spy();
          const deviceSubscriptionListener: subscriptionListener = subscriptions.events[
            'device:changed'
          ].get(subscription.listener.id) as subscriptionListener;
          const deviceSubscriptionListener2: subscriptionListener = subscriptions.events[
            'device:changed'
          ].get(subscription2.listener.id) as subscriptionListener;

          deviceSubscriptionListener.method = eventCallbackSpy;
          deviceSubscriptionListener2.method = eventCallbackSpy2;
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
          expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('added');
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

      beforeAll(async () => {
        setupMediaTrackMocks();
        subscription = await subscribe('track:mute', eventCallbackSpy);
      });

      it('should have subscribe, track mute event available', () => {
        expect(subscription.listener.method).toEqual(eventCallbackSpy);
        expect(subscriptions.events['track:mute'].get(subscription.listener.id)?.method).toEqual(
          eventCallbackSpy
        );
      });

      it('should have onmute event on audio tracks for unmuted', async () => {
        eventCallbackSpy = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpy;

        await createAudioTrack(mockDeviceAudio as unknown as DeviceInterface);
        const filteredTrackByID = fakeAudioTracks.filter((val) => val.id === mockDeviceAudio.ID);

        filteredTrackByID[0].enabled = false;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('unmuted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).toBeInstanceOf(Track);
      });

      it('should have onmute event on audio tracks for muted', async () => {
        eventCallbackSpy = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpy;

        await createAudioTrack(mockDeviceAudio as unknown as DeviceInterface);
        const filteredTrackByID = fakeAudioTracks.filter((val) => val.id === mockDeviceAudio.ID);

        filteredTrackByID[0].enabled = true;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('muted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).toBeInstanceOf(Track);
      });

      it('should have onmute event on video tracks for unmuted', async () => {
        eventCallbackSpy = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpy;

        await createVideoTrack(mockDeviceVideo as unknown as DeviceInterface);
        const filteredTrackByID = fakeVideoTracks.filter((val) => val.id === mockDeviceVideo.ID);

        filteredTrackByID[0].enabled = false;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('unmuted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).toBeInstanceOf(Track);
      });

      it('should have onmute event on vedio tracks for muted', async () => {
        eventCallbackSpy = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpy;

        await createVideoTrack(mockDeviceVideo as unknown as DeviceInterface);
        const filteredTrackByID = fakeVideoTracks.filter((val) => val.id === mockDeviceVideo.ID);

        filteredTrackByID[0].enabled = true;
        const fakeObjForTrack = {target: filteredTrackByID[0]};

        filteredTrackByID[0].onmute(fakeObjForTrack);

        Sinon.assert.called(eventCallbackSpy);
        expect(eventCallbackSpy.getCall(0).args[0].action).toEqual('muted');
        // making sure track object from the library(instanceof Track)
        expect(eventCallbackSpy.getCall(0).args[0].track).toBeInstanceOf(Track);
      });
    });
  });
  describe('unsubscribe()', () => {
    const eventCallbackSpy: SinonSpy = Sinon.spy();
    let mockSubscription: subscriptionType;

    beforeAll(async () => {
      setupMediaDeviceMocks();
      mockSubscription = await subscribe('device:changed', eventCallbackSpy);
    });

    it('should unsubscribe event if subscription event is passed', () => {
      const initialSize = subscriptions.events[mockSubscription.type].size;

      if (initialSize > 0) {
        const isUnsubscribed = unsubscribe(mockSubscription);

        expect(initialSize).not.toEqual(subscriptions.events[mockSubscription.type].size);
        expect(isUnsubscribed).toBeTruthy();
      }
    });

    it('will return false  if passed event subscription is not found ', () => {
      const initialSize = subscriptions.events[mockSubscription.type].size;

      mockSubscription.listener.id = 'somerandomnumber';
      if (initialSize > 0) {
        const isUnsubscribed = unsubscribe(mockSubscription);

        expect(initialSize).toEqual(subscriptions.events[mockSubscription.type].size);
        expect(isUnsubscribed).toEqual(false);
      }
    });

    it('should unsubscribe  all event if no subscription event is passed', () => {
      const isUnsubscribed = unsubscribe();

      expect(0).toEqual(subscriptions.events[mockSubscription.type].size);
      expect(isUnsubscribed).toEqual(false);
    });
  });
});
describe('isCodecAvailable()', () => {
  describe('media codec is loaded in browser but returns valid offer', () => {
    beforeAll(() => {
      pcMock.setupRTCPeerConnectionMockOne();
    });

    it('isCodecAvailable returns true', async () => {
      expect(await isCodecAvailable()).toEqual(true);
    });
  });

  describe('media codec is loaded in browser but returns invalid offer', () => {
    beforeAll(() => {
      pcMock.setupRTCPeerConnectionMockTwo();
    });

    it('isCodecAvailable returns false', async () => {
      expect(await isCodecAvailable()).toEqual(false);
    });
  });

  xdescribe('media codec is delayed while loading browser', () => {
    beforeAll(() => {
      pcMock.setupRTCPeerConnectionMockThree();
    });

    it('isCodecAvailable returns true', async () => {
      expect(await isCodecAvailable()).toEqual(true);
    });
  });
});
