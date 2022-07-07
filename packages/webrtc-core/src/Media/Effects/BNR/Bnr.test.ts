import {disableBNR, enableBNR} from './index';
import SetupBNRMocks from './BnrMock';

describe('BNR', () => {
  beforeAll(() => {
    SetupBNRMocks();
  });

  describe('enableBNR()', () => {
    it('returns MediaStreamTrack', async () => {
      const [inputTrack] = (
        await navigator.mediaDevices.getUserMedia({audio: true})
      ).getAudioTracks();

      const outputTrack: MediaStreamTrack = await enableBNR(inputTrack);

      expect(outputTrack).toBeInstanceOf(MediaStreamTrack);
    });

    it('throws error for invalid sample rate', async () => {
      const [inputTrack] = (
        await navigator.mediaDevices.getUserMedia({audio: true})
      ).getAudioTracks();

      inputTrack.getSettings = jest.fn().mockReturnValueOnce({sampleRate: 49000});

      enableBNR(inputTrack).catch((error) => {
        expect(error.message).toBe('Sample rate of 49000 is not supported.');
      });
    });
  });

  describe('disableBNR()', () => {
    it('returns MediaStreamTrack', () => {
      const outputTrack: MediaStreamTrack = disableBNR();

      expect(outputTrack).toBeInstanceOf(MediaStreamTrack);
    });

    it('throws error when BNR is not already enabled before disabling', () => {
      try {
        disableBNR();
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).toBe('Can not disable as BNR is not enabled');
      }
    });
  });
});
