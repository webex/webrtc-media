export interface SdpMungingConfig {
  convertPort9to0: boolean /* when enabled, m-line port value of 9 is converted to value 0 */;
}

export interface MediaConnectionConfig {
  /** ICE servers */
  iceServers: Array<RTCIceServer>;
  sdpMunging: SdpMungingConfig;
}
