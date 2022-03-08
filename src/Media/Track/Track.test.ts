import {expect} from 'chai';
import Sinon, {SinonSpy} from 'sinon';
import {Track} from './Track';
import {setupMediaTrackMocks, resetMediaTrackMocks} from './TrackMock';

import {subscriptions} from '../Events';
import {subscription as subscriptionType, subscriptionListener} from '../Events/Subscription';

import {} from '../index';

describe('Track', () => {
  const mockMediaStreamTrack = {
    id: '04b14bc2-2c0e-4c54-9e9d-1d52f7a34c5f',
    kind: 'audio',
    muted: true,
    label: 'sample',
    contentHint: 'sample',
    enabled: true,
    readyState: 'live',
    stop: (): void => {
      /* placeholder */
    },
  };

  describe('stop()', () => {
    let track: Track;

    beforeEach(() => {
      track = new Track(mockMediaStreamTrack as unknown as MediaStreamTrack);
    });

    it('should update the track status to ended', () => {
      expect(track.status).to.eq('live');
      track.stop();
      expect(track.status).to.eq('ended');
    });
  });

  describe('applyConstraints()', () => {
    let track: Track;
    let videoTrack: MediaStreamTrack;

    beforeEach(async () => {
      [videoTrack] = (await navigator.mediaDevices.getUserMedia({video: true})).getVideoTracks();
      track = new Track(videoTrack as MediaStreamTrack);
    });

    it('should have applyConstraints method', () => {
      expect(typeof track.applyConstraints).to.eq('function');
    });

    describe('success', () => {
      it('should apply given constraints', async () => {
        const isApplied: boolean = await track.applyConstraints({
          frameRate: 20,
          width: 500,
        });

        expect(isApplied).to.eq(true);
        expect(videoTrack.getSettings().frameRate).to.eq(20);
        expect(videoTrack.getSettings().width).to.eq(500);
      });

      it("should not apply constraints beyond the track's capabilities", async () => {
        const trackCapabilities: MediaTrackCapabilities = videoTrack.getCapabilities();

        const isApplied: boolean = await track.applyConstraints({
          aspectRatio: trackCapabilities.aspectRatio?.max,
        });
        const trackAspectRatio = videoTrack.getSettings().aspectRatio;

        expect(isApplied).to.eq(true);
        expect(trackAspectRatio).to.be.lessThan(trackCapabilities.aspectRatio?.max || 1);
      });
    });

    describe('failure', () => {
      it('should not apply constraints and return false for unsupported constraints', () =>
        track
          .applyConstraints({
            // @ts-expect-error apply unsupported constraints in order to expect error
            unsupported: 'test',
            unsupported2: 'testagain',
            width: 1024,
          })
          .then((isApplied) => expect(isApplied).to.be.false));
    });
  });

  describe('getMediaStreamTrack()', () => {
    let videoTrack: MediaStreamTrack;
    let track: Track;

    before(async () => {
      [videoTrack] = (await navigator.mediaDevices.getUserMedia({video: true})).getVideoTracks();
      track = new Track(videoTrack as MediaStreamTrack);
    });

    it('should have getMediaStream method', () => {
      expect(typeof track.getMediaStreamTrack).to.eq('function');
    });

    it('should return underlying mediaStream', () => {
      const receivedTrack = track.getMediaStreamTrack();

      expect(receivedTrack).to.eq(videoTrack);
    });
  });

  describe('subscribe()', () => {
    let subscription: subscriptionType;
    let subscription2: subscriptionType;
    let eventCallbackSpyTrack: SinonSpy = Sinon.spy();
    const eventCallbackSpyTrack2: SinonSpy = Sinon.spy();
    let track: Track;
    let videoTrack: MediaStreamTrack;

    describe('track mute event & publisher', () => {
      before(async () => {
        [videoTrack] = (await navigator.mediaDevices.getUserMedia({video: true})).getVideoTracks();
        track = new Track(videoTrack as MediaStreamTrack);
        setupMediaTrackMocks();
        subscription = await track.subscribe('track:mute', eventCallbackSpyTrack);
        subscription2 = await track.subscribe('track:mute', eventCallbackSpyTrack2);
      });

      after(() => {
        resetMediaTrackMocks();
      });

      it('should have subscribe, track mute event available', () => {
        expect(subscription.listener.method).to.be.equal(eventCallbackSpyTrack);
        expect(
          subscriptions.events['track:mute'].get(subscription.listener.id)?.method
        ).to.be.equal(eventCallbackSpyTrack);
        expect(subscription2.listener.method).to.be.equal(eventCallbackSpyTrack2);
        expect(
          subscriptions.events['track:mute'].get(subscription2.listener.id)?.method
        ).to.be.equal(eventCallbackSpyTrack2);
      });

      it('should have called the callback once', () => {
        track.getMediaStreamTrack().dispatchEvent(new Event('mute'));
        Sinon.assert.called(eventCallbackSpyTrack);
        expect(eventCallbackSpyTrack.calledOnce).to.eq(true);
      });

      it('should have onmute event on track for unmuted', () => {
        eventCallbackSpyTrack = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpyTrack;

        track.getMediaStreamTrack().enabled = false;
        track.getMediaStreamTrack().dispatchEvent(new Event('mute'));
        Sinon.assert.called(eventCallbackSpyTrack);

        expect(eventCallbackSpyTrack.getCall(0).args[0].action).to.be.equal('unmuted');
        expect(eventCallbackSpyTrack.getCall(0).args[0].track).to.eq(track);
      });

      it('should have onmute event on track for muted', async () => {
        eventCallbackSpyTrack = Sinon.spy();
        const trackSubscriptionListener: subscriptionListener = subscriptions.events[
          'track:mute'
        ].get(subscription.listener.id) as subscriptionListener;

        trackSubscriptionListener.method = eventCallbackSpyTrack;

        track.getMediaStreamTrack().enabled = true;
        track.getMediaStreamTrack().dispatchEvent(new Event('mute'));
        Sinon.assert.called(eventCallbackSpyTrack);

        expect(eventCallbackSpyTrack.getCall(0).args[0].action).to.be.equal('muted');
        expect(eventCallbackSpyTrack.getCall(0).args[0].track).to.eq(track);
      });
    });
  });
});
