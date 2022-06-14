import {enableBNR} from './index';
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

      inputTrack.getSettings = jest.fn().mockReturnValueOnce(() => {
        return {
          sampleRate: 49000,
        };
      });

      enableBNR(inputTrack).catch((error) => {
        expect(error.message).toBe('Sample rate of 49000 is not supported.');
      });
    });
  });
});
