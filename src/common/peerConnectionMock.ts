/* eslint-disable no-console */
/**
 * checks for peer connection and lets you know if codec has been loaded or not
 * @returns boolean if H26codec has been loaded
 */

const mockObjectOne = {
  type: 'offer',
  sdp: 'v=0\r\no=- 7587832100734610826 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 125 35 36 124 123 107 108 109 122 119 102 121 127 37\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:gQnm\r\na=ice-pwd:n72tKpDGJqsGj5B70QkG35L8\r\na=ice-options:trickle\r\na=fingerprint:sha-256 E0:D5:30:99:50:F4:B8:60:FF:31:CC:44:A3:62:30:D3:51:B5:4A:D6:0D:73:95:61:C8:78:28:CB:FF:3D:28:94\r\na=setup:actpass\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 urn:3gpp:video-orientation\r\na=extmap:4 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\r\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\r\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=recvonly\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:98 VP9/90000\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=fmtp:98 profile-id=0\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:100 VP9/90000\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=fmtp:100 profile-id=2\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100\r\na=rtpmap:125 VP9/90000\r\na=rtcp-fb:125 goog-remb\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 profile-id=1\r\na=rtpmap:35 AV1X/90000\r\na=rtcp-fb:35 goog-remb\r\na=rtcp-fb:35 transport-cc\r\na=rtcp-fb:35 ccm fir\r\na=rtcp-fb:35 nack\r\na=rtcp-fb:35 nack pli\r\na=rtpmap:36 rtx/90000\r\na=fmtp:36 apt=35\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 goog-remb\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 goog-remb\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=123\r\na=rtpmap:108 H264/90000\r\na=rtcp-fb:108 goog-remb\r\na=rtcp-fb:108 transport-cc\r\na=rtcp-fb:108 ccm fir\r\na=rtcp-fb:108 nack\r\na=rtcp-fb:108 nack pli\r\na=fmtp:108 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:109 rtx/90000\r\na=fmtp:109 apt=108\r\na=rtpmap:122 H264/90000\r\na=rtcp-fb:122 goog-remb\r\na=rtcp-fb:122 transport-cc\r\na=rtcp-fb:122 ccm fir\r\na=rtcp-fb:122 nack\r\na=rtcp-fb:122 nack pli\r\na=fmtp:122 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=122\r\na=rtpmap:102 red/90000\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:127 ulpfec/90000\r\na=rtpmap:37 flexfec-03/90000\r\na=rtcp-fb:37 goog-remb\r\na=rtcp-fb:37 transport-cc\r\na=fmtp:37 repair-window=10000000\r\n\r\n​ ---------\r\n​ v=0\r\no=- 9027079147394920569 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 125 35 36 124 123 107 108 109 122 119 102 121 127 37\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:TviS\r\na=ice-pwd:pyK7drUKaenz9FnZ8eumFk7C\r\na=ice-options:trickle\r\na=fingerprint:sha-256 B2:84:CA:60:13:DA:54:BB:AD:CE:D9:4D:02:FB:ED:B0:2F:44:2F:DD:DB:F3:01:9D:2C:8D:61:2B:2A:48:BA:A8\r\na=setup:actpass\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 urn:3gpp:video-orientation\r\na=extmap:4 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\r\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\r\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=recvonly\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:98 VP9/90000\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=fmtp:98 profile-id=0\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:100 VP9/90000\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=fmtp:100 profile-id=2\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100\r\na=rtpmap:125 VP9/90000\r\na=rtcp-fb:125 goog-remb\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 profile-id=1\r\na=rtpmap:35 AV1X/90000\r\na=rtcp-fb:35 goog-remb\r\na=rtcp-fb:35 transport-cc\r\na=rtcp-fb:35 ccm fir\r\na=rtcp-fb:35 nack\r\na=rtcp-fb:35 nack pli\r\na=rtpmap:36 rtx/90000\r\na=fmtp:36 apt=35\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 goog-remb\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 goog-remb\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=123\r\na=rtpmap:108 H264/90000\r\na=rtcp-fb:108 goog-remb\r\na=rtcp-fb:108 transport-cc\r\na=rtcp-fb:108 ccm fir\r\na=rtcp-fb:108 nack\r\na=rtcp-fb:108 nack pli\r\na=fmtp:108 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:109 rtx/90000\r\na=fmtp:109 apt=108\r\na=rtpmap:122 H264/90000\r\na=rtcp-fb:122 goog-remb\r\na=rtcp-fb:122 transport-cc\r\na=rtcp-fb:122 ccm fir\r\na=rtcp-fb:122 nack\r\na=rtcp-fb:122 nack pli\r\na=fmtp:122 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=122\r\na=rtpmap:102 red/90000\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:127 ulpfec/90000\r\na=rtpmap:37 flexfec-03/90000\r\na=rtcp-fb:37 goog-remb\r\na=rtcp-fb:37 transport-cc\r\na=fmtp:37 repair-window=10000000',
};

const mockObjectTwo = {
  type: 'offer',
  sdp: 'hello world',
};
const mockData = new Promise((resolve) => {
  setTimeout(() => {
    resolve(mockObjectOne);
  }, 1000);
});

class RTCPeerConnectionMock {
  public static fakeIdentifier = 'one';

  // due to an error -Expected 'this' to be used by class async method 'createOffer' we created this id
  public id = 'one';

  async createOffer() {
    this.id = 'something';
    switch (RTCPeerConnectionMock.fakeIdentifier) {
      case 'one':
        return mockObjectOne;

      case 'two':
        return mockObjectTwo;

      case 'three':
        return mockData;

      default:
        return mockObjectOne;
    }
  }
}

const RTCPeerConnectionOriginal = window.RTCPeerConnection;

const setupRTCPeerConnectionMockOne = (): void => {
  RTCPeerConnectionMock.fakeIdentifier = 'one';
  Object.defineProperty(window, 'RTCPeerConnection', {
    value: RTCPeerConnectionMock,
  });
};
const setupRTCPeerConnectionMockTwo = (): void => {
  RTCPeerConnectionMock.fakeIdentifier = 'two';
  Object.defineProperty(window, 'RTCPeerConnection', {
    value: RTCPeerConnectionMock,
  });
};

const setupRTCPeerConnectionMockThree = (): void => {
  RTCPeerConnectionMock.fakeIdentifier = 'three';
  Object.defineProperty(window, 'RTCPeerConnection', {
    value: RTCPeerConnectionMock,
  });
};

const resetRTCPeerConnection = (): void => {
  Object.defineProperty(window, 'RTCPeerConnection', {
    value: RTCPeerConnectionOriginal,
  });
};

export {
  setupRTCPeerConnectionMockTwo,
  setupRTCPeerConnectionMockOne,
  resetRTCPeerConnection,
  setupRTCPeerConnectionMockThree,
};
