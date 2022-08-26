import {expect} from 'chai';
import {TrackInterface} from '../../Track';
import {isValidTrack} from './index';
import {getTrackSettings} from '../../Track/Utils';
import {createAudioTrack} from '../../index';

describe('BNR', () => {
  describe('isValidTrack()', () => {
    let track: TrackInterface;

    beforeEach(async () => {
      track = await createAudioTrack();
    });

    afterEach(() => {
      if (track) {
        track.stop();
      }
    });

    it('should have isValidTrack method', () => {
      expect(typeof isValidTrack).to.eq('function');
    });

    it('should return true if track is valid', () => {
      const receivedTrack = track.getMediaStreamTrack();
      const result: boolean = isValidTrack(receivedTrack);

      expect(result).to.eq(true);
    });

    /*
    TODO: Negative test
    Test: Need to check how to create a track with bad sample rate and test
    Test: should throw error if sample rate is not supported
    Test: should return false if track is not valid for all browser other than mozila
    */
  });

  describe('getTrackSettings()', () => {
    let track: TrackInterface;

    beforeEach(async () => {
      track = await createAudioTrack();
    });

    afterEach(() => {
      if (track) {
        track.stop();
      }
    });

    it('should have getTrackSettings method', () => {
      expect(typeof getTrackSettings).to.eq('function');
    });

    // Test is skipped if browser does not support sampleRate property
    if (navigator.mediaDevices.getSupportedConstraints().sampleRate) {
      it('should return settings of track', () => {
        const receivedTrack = track.getMediaStreamTrack();
        const result: MediaTrackSettings = getTrackSettings(receivedTrack);

        expect(result).to.have.property('sampleRate');
      });
    }
  });
});
