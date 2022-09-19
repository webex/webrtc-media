// eslint-disable-next-line no-shadow
export enum DeviceKinds {
  AUDIO_INPUT = 'audioinput',
  AUDIO_OUTPUT = 'audiooutput',
  VIDEO_INPUT = 'videoinput',
}

export interface DeviceInterface {
  ID: string;
  groupID: string;
  label: string;
  kind: MediaDeviceKind;
  // permissions: string;
}

/** @public */
export class Device implements DeviceInterface {
  ID: string;

  groupID: string;

  label: string;

  kind: MediaDeviceKind;

  // permissions: string;

  #mediaDeviceInfo: MediaDeviceInfo;

  constructor(mediaDeviceInfo: MediaDeviceInfo) {
    this.#mediaDeviceInfo = mediaDeviceInfo;

    // Grab from #mediaDeviceInfo to avoid TS error
    this.ID = this.#mediaDeviceInfo.deviceId;
    this.groupID = this.#mediaDeviceInfo.groupId;
    this.label = this.#mediaDeviceInfo.label;
    this.kind = this.#mediaDeviceInfo.kind;
    // this.permission
  }
}
