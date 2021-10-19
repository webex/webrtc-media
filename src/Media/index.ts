import {DeviceKinds} from './Devices/Devices';

/**
   * Requests a list of the available media input and output devices, such as microphones and cameras.
   *
   * @returns Promise Array of MediaDeviceInfo objects
   * @public
   */
export const getDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn('nativator.mediaDevices.enumerateDevices() is not supported.');

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
export const getCameras = async (): Promise<MediaDeviceInfo[]> => {
  const devices = await getDevices();

  return devices.filter(({kind}) => kind === DeviceKinds.VideoInput);
};

/**
 * Handles getting a list of audio output devices
 *
 * @returns Promise Array of MediaDeviceInfo objects
 * @public
 */
export const getSpeakers = async (): Promise<MediaDeviceInfo[]> => {
  const devices = await getDevices();

  return devices.filter(({kind}) => kind === DeviceKinds.AudioOutput);
};

/**
 * Handles getting a list of audio input devices
 *
 * @returns Promise Array of MediaDeviceInfo objects
 * @public
 */
export const getMicrophones = async (): Promise<MediaDeviceInfo[]> => {
  const devices = await getDevices();

  return devices.filter(({kind}) => kind === DeviceKinds.AudioInput);
};

export {default} from './Devices';
export * from './Track';
