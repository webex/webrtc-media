// eslint-disable-next-line no-shadow
enum DeviceKinds {
  VideoInput = 'videoinput',
  AudioInput = 'audioinput',
  AudioOutput = 'audiooutput'
}

/** @public */
export default class Devices {
  /**
   * Requests a list of the available media input and output devices, such as microphones and cameras.
   *
   * @returns Promise Array of MediaDeviceInfo objects
   * @public
   */
  static async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.warn('nativator.mediaDevices.enumerateDevices() is not supported.');

      return [];
    }

    return navigator.mediaDevices.enumerateDevices();
  }

  /**
   * Handles getting a list of video input devices
   *
   * @returns Promise Array of MediaDeviceInfo objects
   * @public
   */
  static async getCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await Devices.getDevices();

    return devices.filter(({kind}) => kind === DeviceKinds.VideoInput);
  }

  /**
   * Handles getting a list of audio output devices
   *
   * @returns Promise Array of MediaDeviceInfo objects
   * @public
   */
  static async getSpeakers(): Promise<MediaDeviceInfo[]> {
    const devices = await Devices.getDevices();

    return devices.filter(({kind}) => kind === DeviceKinds.AudioOutput);
  }

  /**
   * Handles getting a list of audio input devices
   *
   * @returns Promise Array of MediaDeviceInfo objects
   * @public
   */
  static async getMicrophones(): Promise<MediaDeviceInfo[]> {
    const devices = await Devices.getDevices();

    return devices.filter(({kind}) => kind === DeviceKinds.AudioInput);
  }
}
