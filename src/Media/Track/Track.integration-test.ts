import {expect} from 'chai';
import Sinon, {SinonSpy} from 'sinon';
import {Track} from './Track';

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

  // TODO: currently fails on firefox as applyConstraints is not avaliable we need to rewrite it
  xdescribe('applyConstraints()', () => {
    let track: Track;
    let videoTrack: MediaStreamTrack;

    beforeEach(async () => {
      [videoTrack] = (
        await navigator.mediaDevices.getUserMedia({
          video: true,
        })
      ).getVideoTracks();
      track = new Track(videoTrack as MediaStreamTrack);
    });

    it('should have applyConstraints method', () => {
      expect(typeof track.applyConstraints).to.eq('function');
    });

    xdescribe('success', () => {
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

    xdescribe('failure', () => {
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

    beforeEach(async () => {
      [videoTrack] = (
        await navigator.mediaDevices.getUserMedia({
          video: true,
        })
      ).getVideoTracks();
      track = new Track(videoTrack as MediaStreamTrack);
    });

    afterEach(() => {
      if (track) {
        track.stop();
      }
    });

    it('should have getMediaStream method', () => {
      expect(typeof track.getMediaStreamTrack).to.eq('function');
    });

    it('should return underlying mediaStream', () => {
      const receivedTrack = track.getMediaStreamTrack();

      expect(receivedTrack).to.eq(videoTrack);
    });
  });

  // Re Write after adding event emitter
  describe('Track Muted event()', () => {
    const eventCallbackSpyTrack: SinonSpy = Sinon.spy();
    let track: Track;
    let audioTrack: MediaStreamTrack;

    describe('track mute event & publisher', () => {
      beforeEach(async () => {
        [audioTrack] = (
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
        ).getAudioTracks();
        track = new Track(audioTrack as MediaStreamTrack);
        await track.on('track:mute', eventCallbackSpyTrack);
      });

      it('should trigger`track:mute` event with muted value', () => {
        track.getMediaStreamTrack().enabled = false;
        track.getMediaStreamTrack().dispatchEvent(new Event('mute'));
        Sinon.assert.called(eventCallbackSpyTrack);

        expect(eventCallbackSpyTrack.getCall(0).args[0].action).to.be.equal('unmuted');
      });

      it('should trigger`track:mute` event with unmuted value', async () => {
        track.getMediaStreamTrack().enabled = true;
        track.getMediaStreamTrack().dispatchEvent(new Event('mute'));
        Sinon.assert.called(eventCallbackSpyTrack);

        expect(eventCallbackSpyTrack.getCall(1).args[0].action).to.be.equal('muted');
      });
    });
  });
});
