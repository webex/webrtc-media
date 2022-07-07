export interface SdpMungingConfig {
  convertPort9to0?: boolean /* when enabled, m-line port value of 9 is converted to value 0 */;
  addContentSlides?: boolean /* when enabled, a=content:slides is added to the 2nd video m-line */;
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
                                        When using this option, changing the number of m-lines later on is not allwed, so for example calling
                                        mediaConnection.updateReceiveOptions({
                                          audio: true,
                                          video: true,
                                          screenShareVideo: false,
                                        })
                                        for the media connection from the example above is not supported as it would require a new m-line for video
                                      */;
  sdpMunging: SdpMungingConfig;
}
