/* eslint no-underscore-dangle: ["error", { "allow": ["_streams"] }] */
import {v4 as uuidv4} from 'uuid';
import {Device, DeviceKinds, DeviceInterface} from './Device';
import {Track, TrackInterface} from './Track';
import {
  subscriptions,
  deviceChangePublisher,
  deviceList,
} from '../Events';
import {subscription} from '../Events/Subscription';

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

  return devices
    .filter(({kind}) => kind === DeviceKinds.AUDIO_OUTPUT)
    .map((device) => new Device(device));
};

/**
 * Handles getting a track from either a provided device or a default device
 *
 * @param device - device object where the track will be retrieved from (optional)
 * @returns Promise of Track object
 */
async function createAudioTrack(device?: DeviceInterface) : Promise<TrackInterface> {
  if (device && device.kind !== DeviceKinds.AUDIO_INPUT) {
    throw new Error(`Device ${device.ID} is not of kind AUDIO_INPUT`);
  }

  const deviceConfig = device
    ? {audio: {deviceId: {exact: device.ID}}}
    : {audio: true, video: false};
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(deviceConfig);
  const track: MediaStreamTrack = stream.getAudioTracks()[0];

  return new Promise((resolve, reject) => {
    if (track) {
      _streams.set(stream, stream.id);

      return resolve(new Track(track));
    }

    return reject(Error('Could not obtain an audio track'));
  });
}

/**
 * Handles getting a track from either a provided device or a default device
 *
 * @param device - device object where the track will be retrieved from (optional)
 * @returns Promise of Track object
 */
async function createVideoTrack(device?: DeviceInterface) : Promise<TrackInterface> {
  if (device && device.kind !== DeviceKinds.VIDEO_INPUT) {
    throw new Error(`Device ${device.ID} is not of kind VIDEO_INPUT`);
  }

  const deviceConfig = device
    ? {video: {deviceId: {exact: device.ID}}}
    : {audio: false, video: true};
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(deviceConfig);
  const track: MediaStreamTrack = stream.getVideoTracks()[0];

  return new Promise((resolve, reject) => {
    if (track) {
      _streams.set(stream, stream.id);

      return resolve(new Track(track));
    }

    return reject(Error('Could not obtain a video track'));
  });
}

/**
 * Handles getting a content track a default device
 *
 * @returns Promise of Track object
 */
async function createContentTrack(): Promise<TrackInterface> {
  const deviceConfig = {audio: false, video: true};

  try {
    // Typescript Compiler is not able find Definition of getDisplayMedia in mediaDevices interface.
    // That is the reason we are using ts-ignore here for ignoring this open issue in mediaDevices
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia(deviceConfig);
    const track: MediaStreamTrack = stream.getVideoTracks()[0];

    return new Promise((resolve, reject) => {
      if (track) {
        _streams.set(stream, stream.id);

        return resolve(new Track(track));
      }

      return reject(Error('Could not obtain a content track'));
    });
  } catch {
    return Promise.reject(new Error('Could not obtain a content track'));
  }
}

/**
 * Obtains multiple subscriptions for various media events and stores listeners
 * Also sets appropriate browser event listeners
 *
 * @param eventName - event name to subscribe to (device:changed | track:muted)
 * @param listener - callback method to call when an event occurs
 * @returns promise that resolves with subscription object that can be used to unsubscribe
*/
async function subscribe(eventName: string, listener: () => void) : Promise<subscription> {
  const subscriptionListener = {
    id: uuidv4(),
    method: listener,
  };

  subscriptions.events[eventName].set(subscriptionListener.id, subscriptionListener.method);

  switch (eventName) {
    case 'device:changed': {
      const thisEventListeners = subscriptions.events[eventName];

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
const unsubscribe = (subscriptionInstance?:subscription) => {
  let isUnsubscribed = false;

  if (subscriptionInstance) {
    isUnsubscribed = subscriptions.events[subscriptionInstance.type]
      .delete(subscriptionInstance.listener.id);
  } else {
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
