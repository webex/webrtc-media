/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
import {
  AvMediaDescription,
  BandwidthLine,
  ContentLine,
  Line,
  parse,
  Sdp,
  SessionDescription,
} from '@webex/ts-sdp';

import {SdpMungingConfig} from './config';

export type TrackKind = 'audio' | 'video';

export function getLocalTrackInfo(
  kind: TrackKind,
  receive: boolean,
  localTrack?: MediaStreamTrack | null
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

function hasH264Codec(mediaLine: AvMediaDescription): boolean {
  for (const codec of mediaLine.codecs.values()) {
    if (codec.name?.toUpperCase() === 'H264') {
      return true;
    }
  }

  return false;
}

// TODO: this function has been copied from the SDK (see isSdpInvalid() in peer-connection-manager), it needs refactoring
export function isSdpInvalid(
  options: {
    allowPort0: boolean;
    requireH264: boolean;
  },
  errorLog: (action: string, description: string) => void,
  sdp?: string
): string {
  if (!sdp) {
    return 'iceCandidate: SDP missing';
  }

  const parsedSdp = parse(sdp);

  for (const mediaLine of parsedSdp.avMedia) {
    if (!mediaLine.iceInfo.candidates.length) {
      errorLog('isSdpInvalid', `ice candidates missing for m-line with mid=${mediaLine.mid}`);

      return 'isSdpInvalid: ice candidates missing';
    }

    if (!options.allowPort0 && mediaLine.port === 0) {
      errorLog('isSdpInvalid', `Found invalid port number 0 at m-line with mid=${mediaLine.mid}`);

      return 'isSdpInvalid: Found invalid port number 0';
    }
    if (!mediaLine.iceInfo.pwd || !mediaLine.iceInfo.ufrag) {
      errorLog(
        'isSdpInvalid',
        `ice ufrag and password not found for m-line with mid=${mediaLine.mid}`
      );

      return 'isSdpInvalid: ice ufrag and password not found';
    }

    if (options.requireH264 && mediaLine.type === 'video' && !hasH264Codec(mediaLine)) {
      errorLog(
        'isSdpInvalid',
        `H264 codec is missing for video media description with mid=${mediaLine.mid}`
      );

      return 'isSdpInvalid: H264 codec is missing';
    }
  }

  return '';
}

/**
 * Convert C line in the SDP to IPv4
 *
 * @param sdp - sdp as a string
 */
function convertCLineToIPv4(sdp: Sdp): void {
  // TODO: update this comment below... is there a Linus Jira for this?

  // TODO: remove this once linus supports Ipv6 c-line. Currently linus rejects SDPs with c-line having ipv6 candidates.
  // https://jira-eng-gpk2.cisco.com/jira/browse/SPARK-299232

  const convertConnectionProp = (connection: SessionDescription['connection']) => {
    if (connection?.addrType === 'IP6') {
      connection.addrType = 'IP4';
      connection.ipAddr = '0.0.0.0';
    }
  };

  // do the conversion at session level
  convertConnectionProp(sdp.session.connection);

  // and at each media session level
  sdp.media.forEach((media) => {
    convertConnectionProp(media.connection);
  });
}

function convertPort9to0(sdp: Sdp): void {
  sdp.media.forEach((media) => {
    if (media.port === 9) {
      media.port = 0;
    }
  });
}

/**
 * Adds to the SDP the indication which m-line contains the screen share
 *
 * @param sdp - SDP to modify
 */
function setContentSlides(sdp: Sdp): void {
  const videoMediaDescriptions = sdp.avMedia.filter((media) => media.type === 'video');

  if (videoMediaDescriptions.length === 2) {
    videoMediaDescriptions[1].addLine(new ContentLine(['slides']));
  }
}

/**
 * Model for any arbitrary line that we want to add to the SDP
 */
class AnyLine extends Line {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  static fromSdpLine(): undefined {
    return undefined;
  }

  toSdpLine(): string {
    return `a=${this.value}`;
  }
}

function addBandwidthLimits(sdp: Sdp, limits: {audio: number; video: number}): void {
  sdp.avMedia.forEach((media) => {
    if (media.type === 'audio') {
      media.addLine(new BandwidthLine('TIAS', limits.audio));
    } else if (media.type === 'video') {
      media.addLine(new BandwidthLine('TIAS', limits.video));
    }
  });
}

function addPeriodicKeyframes(sdp: Sdp, value: number): void {
  sdp.avMedia.forEach((media) => {
    if (media.type === 'video') {
      media.addLine(new AnyLine(`periodic-keyframes:${value}`));
    }
  });
}

function disableExtmap(sdp: Sdp): void {
  sdp.avMedia.forEach((media) => {
    media.extMaps.length = 0;
  });
}

function appendToH264fmtpParams(sdp: Sdp, paramsToAppend: string) {
  sdp.avMedia.forEach((media) => {
    if (media.type === 'video') {
      media.codecs.forEach((codec) => {
        if (codec.name?.toUpperCase() === 'H264') {
          // there should really be just 1 fmtp line, but just in case, we add it to all of them
          codec.fmtParams = codec.fmtParams.map((fmtp) => `${fmtp};${paramsToAppend}`);
        }
      });
    }
  });
}

function setH264MaxFs(sdp: Sdp, maxFsValue: number) {
  appendToH264fmtpParams(sdp, `max-fs=${maxFsValue}`);
}

function disableRtx(sdp: Sdp) {
  sdp.avMedia.forEach((media) => {
    const payloadTypesToRemove: Array<number> = [];

    media.codecs.forEach((codec, codecPt) => {
      if (codec.name === 'rtx' && codec.primaryCodecPt) {
        payloadTypesToRemove.push(codecPt);
      }
    });

    // remove all the lines associated with the rtx payload types
    payloadTypesToRemove.forEach((pt) => media.codecs.delete(pt));

    // and remove the payload types themselves
    media.pts = media.pts.filter((pt) => !payloadTypesToRemove.includes(pt));
  });
}

/**
 * Modifies the local SDP according to the configuration.
 * This function MUST be called before calling setLocalDescription() so that
 * the browser uses the munged SDP.
 *
 * @param sdp - sdp as a string
 */
export function mungeLocalSdpForBrowser(config: SdpMungingConfig, sdp: string): string {
  const parsedSdp = parse(sdp);

  if (config.disableRtx) {
    disableRtx(parsedSdp);
  }

  return parsedSdp.toString();
}

/**
 * Modifies the local SDP according to the configuration.
 * This munging should be done AFTER the call to setLocalDescription() so that
 * the browser is not aware of the changes being done to its SDP.
 *
 * @param sdp - sdp as a string
 */
export function mungeLocalSdp(config: SdpMungingConfig, sdp: string): string {
  const parsedSdp = parse(sdp);

  if (config.convertCLineToIPv4) {
    convertCLineToIPv4(parsedSdp);
  }

  if (config.bandwidthLimits) {
    addBandwidthLimits(parsedSdp, config.bandwidthLimits);
  }
  if (config.periodicKeyframes) {
    addPeriodicKeyframes(parsedSdp, config.periodicKeyframes);
  }
  if (config.convertPort9to0) {
    convertPort9to0(parsedSdp);
  }
  if (config.addContentSlides) {
    setContentSlides(parsedSdp);
  }
  if (config.disableExtmap) {
    disableExtmap(parsedSdp);
  }
  if (config.h264MaxFs) {
    setH264MaxFs(parsedSdp, config.h264MaxFs);
  }

  return parsedSdp.toString();
}

function setStartBitrate(sdp: Sdp, startBitrate: number): void {
  appendToH264fmtpParams(sdp, `x-google-start-bitrate=${startBitrate}`);
}

export function mungeRemoteSdp(config: SdpMungingConfig, sdp: string): string {
  const parsedSdp = parse(sdp);

  if (config.startBitrate) {
    setStartBitrate(parsedSdp, config.startBitrate);
  }

  if (config.disableExtmap) {
    disableExtmap(parsedSdp);
  }

  return parsedSdp.toString();
}
