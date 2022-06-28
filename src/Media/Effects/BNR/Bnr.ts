import {MEDIA_STREAM_TRACK} from '../../../constants';
import logger from '../../../Logger';
import {getTrackSettings} from '../../Track/Utils';

interface BNRProcessor {
  isModuleAdded: boolean;
  audioContext?: AudioContext;
  workletProcessorUrl: URL;
  sourceNode?: MediaStreamAudioSourceNode;
  destinationStream?: MediaStreamAudioDestinationNode;
}

const bnrProcessor: BNRProcessor = {
  isModuleAdded: false,
  workletProcessorUrl: process.env.NOISE_REDUCTION_PROCESSOR_URL as unknown as URL,
};

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

/**
 * Creates new AudioContext & adds BNR module to it
 * @returns worklet module (NOISE_REDUCTION_PROCESSOR) added audioContext
 */
async function loadProcessor(): Promise<AudioContext> {
  logger.info({
    mediaType: MEDIA_STREAM_TRACK,
    action: 'loadProcessor()',
    description: 'Creating and loading BNR module',
  });

  const audioContext: AudioContext = new AudioContext();

  bnrProcessor.isModuleAdded = true;
  bnrProcessor.audioContext = audioContext;

  await audioContext.audioWorklet.addModule(bnrProcessor.workletProcessorUrl);

  return audioContext;
}

/**
 * Loads BNR processor if not already loaded
 * Applies BNR to input MediaStreamTrack by converting it into MediaStream
 *
 * @param track - MediaStreamTrack object that will be processed for noise reduction
 * @returns MediaStreamTrack that is noise reduced
 */
async function enableBNR(track: MediaStreamTrack): Promise<MediaStreamTrack> {
  logger.debug({
    ID: track.id,
    mediaType: MEDIA_STREAM_TRACK,
    action: 'enableBNR()',
    description: 'Called',
  });

  try {
    isValidTrack(track);

    const streamFromTrack: MediaStream = new MediaStream();

    streamFromTrack.addTrack(track);
    let audioContext: AudioContext;

    logger.info({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'enableBNR()',
      description: 'Checking if BNR module is present already',
    });

    if (!bnrProcessor.isModuleAdded) {
      logger.debug({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'enableBNR()',
        description: 'BNR module is not present already',
      });

      audioContext = await loadProcessor();
    } else {
      logger.debug({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'enableBNR()',
        description: 'BNR module is present already',
      });

      logger.info({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'enableBNR()',
        description: 'Using existing AudioContext',
      });

      audioContext = bnrProcessor.audioContext as AudioContext;
    }

    logger.info({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'enableBNR()',
      description: 'Creating worklet node, connecting source and destination streams',
    });

    const workletNode: AudioWorkletNode = new AudioWorkletNode(
      audioContext,
      'noise-reduction-worklet-processor'
    );

    workletNode.port.postMessage('ENABLE');

    bnrProcessor.sourceNode = audioContext.createMediaStreamSource(streamFromTrack);
    bnrProcessor.sourceNode.connect(workletNode);

    bnrProcessor.destinationStream = audioContext.createMediaStreamDestination();
    workletNode.connect(bnrProcessor.destinationStream as MediaStreamAudioDestinationNode);

    logger.info({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'enableBNR()',
      description: 'Obtaining noise reduced track and returning',
    });

    const destinationStream: MediaStream = (
      bnrProcessor.destinationStream as MediaStreamAudioDestinationNode
    ).stream;

    const [destinationTrack] = destinationStream.getAudioTracks();

    return destinationTrack;
  } catch (error) {
    logger.error({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'enableBNR()',
      description: 'Error in enableBNR',
      error: error as Error,
    });

    throw error;
  }
}

export {isValidTrack, enableBNR};