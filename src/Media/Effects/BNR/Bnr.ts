import {MEDIA_STREAM_TRACK} from '../../../constants';
import logger from '../../../Logger';
import {getTrackSettings} from '../../Track/Utils';

/**
 * This function is to check if the audio track's sample rate is supported by BNR library
 * Currently supported sample rates are 16 kHz, 32 kHz, and 48 kHz
 * @param track - MediaStreamTrack to check if it is valid track
 * @returns true if track is valid
 * @throws Error if track is not valid
 */
function isValidTrack(track: MediaStreamTrack): boolean {
  // getSupportedConstraints() returns an object with all the supported constraints
  // for the current browser
  // for mozilla, it returns an object with all the supported constraints where sampleRate is not available(supported)
  const supportedConstraints: MediaTrackSupportedConstraints =
    navigator.mediaDevices.getSupportedConstraints();
  const supportedSampleRates = [16000, 32000, 48000];

  if (supportedConstraints.sampleRate) {
    const settings = getTrackSettings(track);
    const {sampleRate} = settings;

    if (sampleRate && !supportedSampleRates.includes(sampleRate)) {
      const error = new Error(`Sample rate of ${sampleRate} is not supported.`);

      logger.error({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'isValidTrack()',
        description: error.message,
        error,
      });
      throw error;
    } else {
      return true;
    }
  } else {
    const error = new Error('Not supported');

    logger.info({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'isValidTrack()',
      description: error.message,
      error,
    });
    // We are logging info and returning true

    return true;
  }
}

export {isValidTrack};
