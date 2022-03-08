import sdpTransform from 'sdp-transform';

import {SdpMungingConfig} from './config';

const SDP_CARRIAGE_RETURN = '\r\n';

export type TrackKind = 'audio' | 'video';

export function getLocalTrackInfo(
  kind: TrackKind,
  receive: boolean,
  localTrack?: MediaStreamTrack | null,
): {trackOrKind: MediaStreamTrack | TrackKind; direction: RTCRtpTransceiverDirection} {
  const direction = (() => {
    const send = !!localTrack;

    if (send && receive) return 'sendrecv';
    if (send && !receive) return 'sendonly';
    if (!send && receive) return 'recvonly';

    return 'inactive';
  })();

  return {trackOrKind: localTrack || kind, direction};
}

// TODO: this function has been copied from the SDK (see isSdpInvalid() in peer-connection-manager), it needs refactoring
export function isSdpInvalid(
  options: {
    allowPort0: boolean;
  },
  errorLog: (action: string, description: string) => void,
  sdp?: string,
): string {
  if (!sdp) {
    return 'iceCandidate: SDP missing';
  }

  const parsedSdp = sdpTransform.parse(sdp);

  for (const mediaLine of parsedSdp.media) {
    if (!mediaLine.candidates || mediaLine.candidates?.length === 0) {
      errorLog('isSdpInvalid', 'ice candidates missing');

      return 'isSdpInvalid: ice candidates missing';
    }

    if (!options.allowPort0 && mediaLine.port === 0) {
      errorLog('isSdpInvalid', 'Found invalid port number 0');

      return 'isSdpInvalid: Found invalid port number 0';
    }
    if (!mediaLine.icePwd || !mediaLine.iceUfrag) {
      errorLog('isSdpInvalid', 'ice ufrag and password not found');

      return 'isSdpInvalid: ice ufrag and password not found';
    }
  }

  return '';
}

/**
 * Convert C line in the SDP to IPv4
 *
 * @param sdp - sdp as a string
 */
function convertCLineToIpv4(sdp: string): string {
  // TODO: update this comment below... is there a Linus Jira for this?

  // TODO: remove this once linus supports Ipv6 c-line. Currently linus rejects SDPs with c-line having ipv6 candidates.
  // https://jira-eng-gpk2.cisco.com/jira/browse/SPARK-299232
  return sdp.replace(/c=IN IP6 .*/gi, 'c=IN IP4 0.0.0.0');
}

function convertPort9to0(sdp: string): string {
  return sdp.replace(/^m=(audio|video) 9 /gim, 'm=$1 0 ');
}

function getNumOfOccurences(string: string, subString: string) {
  let n = 0;
  let pos = 0;

  while (pos >= 0) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      n += 1;
      pos += subString.length;
    }
  }

  return n;
}

/**
 * Adds to the SDP the indication which m-line contains the screen share
 *
 * @param sdp - SDP to modify
 * @returns modified SDP
 */
function setContentSlides(sdp: string): string {
  // we only do this if SDP has 2 video m-lines and in that case the 2nd video m-line is always the screen share
  if (getNumOfOccurences(sdp, 'm=video ') === 2) {
    return `${sdp}a=content:slides${SDP_CARRIAGE_RETURN}`;
  }

  return sdp;
}

/**
 * Modifies the local SDP so that the backend is happy with it
 *
 * @param sdp - sdp as a string
 */
export function mungeLocalSdp(config: SdpMungingConfig, sdp: string): string {
  /* TODO: SDK meetings plugin is doing:
    - limitBandwidth()
    - setMaxFs()
    - checkH264Support()
    - enableExtmap
    - enableRtx - done before calling setLocalDescription()
    - setContentSlides
    - setStartBitrateOnRemoteSdp

    check if we still need this and if calling project needs any of this
  */

  let mungedSdp = convertCLineToIpv4(sdp);

  if (config.convertPort9to0) {
    mungedSdp = convertPort9to0(mungedSdp);
  }

  if (config.addContentSlides) {
    mungedSdp = setContentSlides(mungedSdp);
  }

  return mungedSdp;
}
