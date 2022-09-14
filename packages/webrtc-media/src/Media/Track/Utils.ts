import { MEDIA_STREAM_TRACK } from '../../constants';
import logger from '../../Logger';

/**
 * Util function `getTrackSettings` returns the settings of media track
 * @param track - MediaStreamTrack to get settings of the media track
 * @returns MediaTrackSettings - settings of media track
 * @throws empty object if unable to get settings
 */
function getTrackSettings(track: MediaStreamTrack): MediaTrackSettings {
  logger.debug({
    ID: track.id,
    mediaType: MEDIA_STREAM_TRACK,
    action: 'getTrackSettings()',
    description: 'Called',
  });

  const settings = track.getSettings();

  if (settings) {
    logger.debug({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'getTrackSettings()',
      description: `Returning track settings ${JSON.stringify(settings)}`,
    });

    return settings;
  }
  const error = new Error('Unable to get track settings');

  logger.info({
    ID: track.id,
    mediaType: MEDIA_STREAM_TRACK,
    action: 'getTrackSettings()',
    description: error.message,
    error,
  });
  // not throwing error simply returning empty object based on review comment

  return {};
}

export {getTrackSettings};
