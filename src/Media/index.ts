/* eslint no-underscore-dangle: ["error", { "allow": ["_streams"] }] */
import {v4 as uuidv4} from 'uuid';
import {Device, DeviceKinds, DeviceInterface} from './Device';
import {Track, TrackInterface} from './Track';
import {
  subscriptions,
  deviceChangePublisher,
  deviceList,
} from './Events';
import {subscription} from './Events/Subscription';
import logger from '../Logger';
import {DEVICE, MEDIA} from '../constants';

const _streams: WeakMap<MediaStream, string> = new WeakMap();

/**
   * Requests a list of the available media input and output devices, such as microphones and cameras.
   *
   * @returns Promise Array of MediaDeviceInfo objects
   */
const getDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn('navigator.mediaDevices.enumerateDevices() is not supported.');

    return [];
  }
  logger.info({
    mediaType: DEVICE,
    action: 'getDevices()',
    description: 'Requesting list of available media input and output devices',
  });

  return navigator.mediaDevices.enumerateDevices();
};

/**
 * Handles getting a list of video input devices
 *
 * @returns Promise Array of MediaDeviceInfo objects
 * @public
 */
const getCameras = async (): Promise<Device[]> => {
  const devices = await getDevices();

  logger.info({
    mediaType: DEVICE,
    action: 'getCameras()',
    description: 'Filtering camera devices from all available media devices',
  });

  return devices
    .filter(({kind}) => kind === DeviceKinds.VIDEO_INPUT)
    .map((device) => new Device(device));
};

/**
 * Handles getting a list of audio input devices
 *
 * @returns Promise Array of MediaDeviceInfo objects
 * @public
 */
const getMicrophones = async (): Promise<Device[]> => {
  const devices = await getDevices();

  logger.info({
    mediaType: DEVICE,
    action: 'getMicrophones()',
    description:
      'Filtering microphones devices from all available media devices',
  });

  return devices
    .filter(({kind}) => kind === DeviceKinds.AUDIO_INPUT)
    .map((device) => new Device(device));
};

/**
 * Handles getting a list of audio output devices
 *
 * @returns Promise Array of MediaDeviceInfo objects
 * @public
 */
const getSpeakers = async (): Promise<Device[]> => {
  const devices = await getDevices();

  logger.info({
    mediaType: DEVICE,
    action: 'getSpeakers()',
    description: 'Filtering speaker devices from all available media devices',
  });

  return devices
    .filter(({kind}) => kind === DeviceKinds.AUDIO_OUTPUT)
    .map((device) => new Device(device));
};

/**
 * Match passed constraints with supported constraints
 * and return all unsupported constraints
 *
 * @param mediaConstraints - Contraints passed by caller
 * @returns
 */
function getUnsupportedConstraints(mediaConstraints: MediaTrackConstraints): Array<string> {
  logger.info({
    mediaType: MEDIA,
    action: 'getUnsupportedConstraints()',
    description: 'Filtering list of media track unsupported constraints',
  });
  // eslint-disable-next-line max-len
  const supportedConstraints: MediaTrackSupportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  const unsupportedConstraints: Array<string> = [];

  Object.keys(mediaConstraints).forEach((constraint: string) => {
    if (!(
      Object.prototype.hasOwnProperty.call(supportedConstraints, constraint)
      && supportedConstraints[constraint as keyof MediaTrackSupportedConstraints]
    )) {
      unsupportedConstraints.push(constraint);
    }
  });

  return unsupportedConstraints;
}

/**
 * Handles getting a track from either a provided device or a default device
 *
 * @param device - device object where the track will be retrieved from (optional)
 * @returns Promise of Track object
 */
async function createAudioTrack(device?: DeviceInterface): Promise<TrackInterface> {
  if (device && device.kind !== DeviceKinds.AUDIO_INPUT) {
    const error = new Error('Given device is not an audio type');

    logger.error({
      ID: device.ID,
      mediaType: 'DEVICE',
      action: 'createAudioTrack()',
      description: error.message,
      error,
    });

    throw error;
  }
  logger.info({
    ID: device?.ID,
    mediaType: DEVICE,
    action: 'createAudioTrack()',
    description: 'Creating audio track',
  });

  const deviceConfig = device
    ? {audio: {deviceId: {exact: device.ID}}}
    : {audio: true, video: false};
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(deviceConfig);
  const track: MediaStreamTrack = stream.getAudioTracks()[0];

  if (track) {
    _streams.set(stream, stream.id);

    return new Track(track);
  }

  const error = new Error(`Device could not obtain an audio track of kind ${device?.kind}`);

  logger.error({
    ID: device?.ID,
    mediaType: 'DEVICE',
    action: 'createAudioTrack()',
    description: error.message,
    error,
  });

  throw error;
}

/**
 * Handles getting a track from either a provided device or a default device
 *
 * @param device - device object where the track will be retrieved from (optional)
 * @returns Promise of Track object
 */
async function createVideoTrack(device?: DeviceInterface): Promise<TrackInterface> {
  if (device && device.kind !== DeviceKinds.VIDEO_INPUT) {
    const error = new Error('Given device is not a video type');

    logger.error({
      ID: device.ID,
      mediaType: 'DEVICE',
      action: 'createVideoTrack()',
      description: error.message,
      error,
    });

    throw error;
  }
  logger.info({
    ID: device?.ID,
    mediaType: DEVICE,
    action: 'createVideoTrack()',
    description: 'Creating video track',
  });

  const deviceConfig = device
    ? {video: {deviceId: {exact: device.ID}}}
    : {audio: false, video: true};
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(deviceConfig);
  const track: MediaStreamTrack = stream.getVideoTracks()[0];

  if (track) {
    _streams.set(stream, stream.id);

    return new Track(track);
  }

  const error = new Error(`Device could not obtain a video track of kind ${device?.kind}`);

  logger.error({
    ID: device?.ID,
    mediaType: 'DEVICE',
    action: 'createVideoTrack()',
    description: error.message,
    error,
  });

  throw error;
}

/**
 * Handles getting a content track with passed constraints
 *
 * @param mediaConstraints - passed constraints for content track
 *
 * @returns Promise of Track object
 *
 * @throws - Could not obtain a content track
 * Thrown if stream is empty or track is null
 *
 * @throws - Constraint is not supported by browser
 * Thrown if unsupported constraint is being passed to the function
 */
async function createContentTrack(
  mediaConstraints?: MediaTrackConstraints,
): Promise<TrackInterface> {
  logger.info({
    ID: mediaConstraints?.deviceId?.toString(),
    mediaType: MEDIA,
    action: 'createContentTrack()',
    description: 'Creating content track',
  });

  const deviceConfig = {audio: false, video: true};

  let track: MediaStreamTrack;
  let stream: MediaStream;

  try {
    // Typescript Compiler is not able find Definition of getDisplayMedia in mediaDevices interface.
    // That is the reason we are using ts-ignore here for ignoring this open issue in mediaDevices
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stream = await navigator.mediaDevices.getDisplayMedia(deviceConfig);
    [track] = stream.getVideoTracks();
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        ID: mediaConstraints?.deviceId?.toString(),
        mediaType: 'DEVICE',
        action: 'createContentTrack()',
        description: error.message,
        error,
      });
    }

    throw error;
  }

  if (mediaConstraints) {
    const unsupportedConstraints: Array<string> = getUnsupportedConstraints(mediaConstraints);

    if (unsupportedConstraints.length <= 0) {
      track.applyConstraints(mediaConstraints);
    } else {
      const error = new Error(`${unsupportedConstraints.join(', ')} constraint is not supported by browser`);

      logger.error({
        ID: mediaConstraints?.deviceId?.toString(),
        mediaType: 'DEVICE',
        action: 'createContentTrack()',
        description: error.message,
        error,
      });

      throw error;
    }
  }

  if (track) {
    _streams.set(stream, stream.id);

    return new Track(track);
  }

  const error = new Error('Could not obtain a content track');

  logger.error({
    ID: mediaConstraints?.deviceId?.toString(),
    mediaType: 'DEVICE',
    action: 'createContentTrack()',
    description: error.message,
    error,
  });

  throw error;
}

/**
 * Obtains multiple subscriptions for various media events and stores listeners
 * Also sets appropriate browser event listeners
 *
 * @param eventName - event name to subscribe to (device:changed | track:mute)
 * @param listener - callback method to call when an event occurs
 * @returns promise that resolves with subscription object that can be used to unsubscribe
*/
async function subscribe(eventName: string, listener: () => void): Promise<subscription> {
  logger.info({
    mediaType: MEDIA,
    action: 'subscribe()',
    description: 'Subscribing to an event',
  });
  const subscriptionListener = {
    id: uuidv4(),
    method: listener,
  };

  subscriptions.events[eventName].set(subscriptionListener.id, subscriptionListener.method);
  const thisEventListeners = subscriptions.events[eventName];

  switch (eventName) {
    case 'device:changed': {
      if (thisEventListeners.size === 1) {
        const thisDeviceList = await getDevices();

        deviceList.push(...thisDeviceList);
        navigator.mediaDevices.addEventListener('devicechange', deviceChangePublisher);
      }
      break;
    }

    default:
      break;
  }

  return new Promise((resolve) => {
    resolve({
      type: eventName,
      listener: subscriptionListener,
    });
  });
}

/**
 * Returns true when unsubscriptions happened successfully, `false` otherwise
 * When a `Subscription` object is pass only that subscription will be removed
 * If no subscriptions are given, all current subscription will be unsubscribed

 * @param subscriptionInstance -optional subscription object that has property type and has a method that needs to be deleted from subscriptions state
 * @returns `true` when subscription is found and unsubscribed, `false` otherwise
 */
const unsubscribe = (subscriptionInstance?:subscription): boolean => {
  let isUnsubscribed = false;

  if (subscriptionInstance) {
    logger.info({
      mediaType: MEDIA,
      action: 'unsubscribe()',
      description: 'Unsubscribing to an event',
    });
    isUnsubscribed = subscriptions.events[subscriptionInstance.type].delete(
      subscriptionInstance.listener.id,
    );
  } else {
    logger.info({
      mediaType: MEDIA,
      action: 'unsubscribe()',
      description: 'Unsubscribing to all current subscription',
    });
    subscriptions.events['device:changed'].clear();
  }

  if (subscriptions.events['device:changed'].size === 0) {
    navigator.mediaDevices.removeEventListener('devicechange', deviceChangePublisher);
  }

  return isUnsubscribed;
};

export * from './Device';
export * from './Track';
export {
  getCameras,
  getMicrophones,
  getSpeakers,
  createAudioTrack,
  createVideoTrack,
  createContentTrack,
  subscribe,
  unsubscribe,
};
