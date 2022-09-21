export interface SdpMungingConfig {
  convertPort9to0?: boolean /* when enabled, m-line port value of 9 is converted to value 0 */;
  addContentSlides?: boolean /* when enabled, a=content:slides is added to the 2nd video m-line */;
  convertCLineToIPv4?: boolean /* when enabled, all IPv6 c-lines are converted to IPv4 0.0.0.0 */;
  bandwidthLimits?: {
    audio: number /* TIAS bandwidth for each audio m-line, in bits per second, see rfc3890 */;
    video: number /* TIAS bandwidth for each video m-line, in bits per second, see rfc3890 */;
  };
  startBitrate?: number /* force starting with specific bitrate when doing bandwidth estimation 
                           for video being sent to the server (in kilobits per second) */;
  periodicKeyframes?: number /* time between key frames in video from the server (in seconds) */;
  disableExtmap?: boolean /* when set to true, all rtp extension header lines are removed
                             from local and remote SDPs */;
  disableRtx?: boolean /* when set to true, all RTX payload types and lines associated 
                          with them are removed from local SDP */;
  h264MaxFs?: number /* if set, the max-fs (max frame size) parameter will be appended
                        to H264 fmtp lines in local SDP */;
}

export interface MediaConnectionConfig {
  /** ICE servers */
  iceServers: Array<RTCIceServer>;
  skipInactiveTransceivers: boolean /* when enabled, initiateOffer() will result in an SDP without any "inactive" m-lines, so for example
                                        creating a MediaConnection with options like this:
                                        send: {
                                          audio: someAudioTrack,
                                        },
                                        receive: {
                                          audio: true,
                                          video: false,
                                          screenShareVideo: false,
                                        },
                                        and calling initiateOffer() will result in an SDP with just a single m-line (just for the audio) when
                                        skipInactiveTransceivers is true.
                                        When using this option, changing the number of m-lines later on is not allowed, so for example calling
                                        mediaConnection.updateReceiveOptions({
                                          audio: true,
                                          video: true,
                                          screenShareVideo: false,
                                        })
                                        for the media connection from the example above is not supported as it would require a new m-line for video
                                      */;
  requireH264?: boolean; // if enabled, the browser's SDP will be rejected if it doesn't have H264 codec in all video m-lines
  sdpMunging: SdpMungingConfig;
}
