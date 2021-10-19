import {Device, DeviceKinds} from './Device';

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
export const getCameras = async (): Promise<Device[]> => {
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
export const getMicrophones = async (): Promise<Device[]> => {
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
export const getSpeakers = async (): Promise<Device[]> => {
  const devices = await getDevices();

  return devices
    .filter(({kind}) => kind === DeviceKinds.AUDIO_OUTPUT)
    .map((device) => new Device(device));
};

export * from './Device';
export * from './Track';
