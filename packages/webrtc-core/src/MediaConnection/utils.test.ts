/* eslint-disable no-console */
import {isSdpInvalid, mungeLocalSdp, mungeLocalSdpForBrowser, mungeRemoteSdp} from './utils';
import {
  SDP_MULTIPLE_VIDEO_CODECS,
  SDP_MULTIPLE_VIDEO_CODECS_WITH_MAX_FS,
  SDP_MULTIPLE_VIDEO_CODECS_WITH_START_BITRATE,
  SDP_MULTIPLE_VIDEO_CODECS_WITHOUT_RTX,
  SDP_WITH_EXTMAP,
  SDP_WITH_EXTMAP_REMOVED,
  SDP_WITH_PORT_9_VALUE,
  SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0,
  SDP_WITH_2_VIDEO_M_LINES,
  SDP_WITH_2_VIDEO_M_LINES_AND_BANDWIDTH_LIMITS,
  SDP_WITH_2_VIDEO_M_LINES_AND_CONTENT_SLIDES,
  SDP_WITH_2_VIDEO_M_LINES_AND_NO_H264,
  SDP_WITH_1_VIDEO_M_LINE,
  SDP_WITH_IPV6_C_LINES,
  SDP_WITH_IPV4_C_LINES,
} from './utils.test-fixtures';

describe('mungeLocalSdpForBrowser', () => {
  it('does not change anything with empty munging config', () => {
    expect(mungeLocalSdpForBrowser({}, SDP_MULTIPLE_VIDEO_CODECS)).toEqual(
      SDP_MULTIPLE_VIDEO_CODECS
    );
  });

  it('removes rtx when disableRtx is set', () => {
    expect(mungeLocalSdpForBrowser({disableRtx: true}, SDP_MULTIPLE_VIDEO_CODECS)).toEqual(
      SDP_MULTIPLE_VIDEO_CODECS_WITHOUT_RTX
    );
  });
});

describe('mungeLocalSdp', () => {
  it('does not change anything with empty munging config', () => {
    expect(mungeLocalSdp({}, SDP_MULTIPLE_VIDEO_CODECS)).toEqual(SDP_MULTIPLE_VIDEO_CODECS);
  });

  it('replaces port 9 with 0 when convertPort9to0 config is enabled', () => {
    expect(mungeLocalSdp({convertPort9to0: true}, SDP_WITH_PORT_9_VALUE)).toEqual(
      SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0
    );
  });

  it('does not replace port 9 with 0 when convertPort9to0 config is disabled', () => {
    expect(mungeLocalSdp({convertPort9to0: false}, SDP_WITH_PORT_9_VALUE)).toEqual(
      SDP_WITH_PORT_9_VALUE
    );
  });

  it('adds a=content:slides line to the 2nd video m-line when addContentSlides config is enabled', () => {
    expect(mungeLocalSdp({addContentSlides: true}, SDP_WITH_2_VIDEO_M_LINES)).toEqual(
      SDP_WITH_2_VIDEO_M_LINES_AND_CONTENT_SLIDES
    );
  });

  it('does not add a=content:slides line if only 1 video m-line present when addContentSlides config is enabled', () => {
    expect(mungeLocalSdp({addContentSlides: true}, SDP_WITH_1_VIDEO_M_LINE)).toEqual(
      SDP_WITH_1_VIDEO_M_LINE
    );
  });

  it('does not add a=content:slides line to the 2nd video m-line when addContentSlides config is disabled', () => {
    expect(mungeLocalSdp({addContentSlides: false}, SDP_WITH_2_VIDEO_M_LINES)).toEqual(
      SDP_WITH_2_VIDEO_M_LINES
    );
  });

  it('replaces IPv6 with IPv4 0.0.0.0 when convertCLineToIPv4 is enabled', () => {
    expect(mungeLocalSdp({convertCLineToIPv4: true}, SDP_WITH_IPV6_C_LINES)).toEqual(
      SDP_WITH_IPV4_C_LINES
    );
  });

  it('does not replace IPv6 with IPv4 0.0.0.0 when convertCLineToIPv4 is disabled', () => {
    expect(mungeLocalSdp({convertCLineToIPv4: false}, SDP_WITH_IPV6_C_LINES)).toEqual(
      SDP_WITH_IPV6_C_LINES
    );
  });

  it('adds bandwidth lines and periodic keyframes if they are configured', () => {
    expect(
      mungeLocalSdp(
        {
          bandwidthLimits: {
            audio: 1024,
            video: 4096,
          },
          periodicKeyframes: 20,
        },
        SDP_WITH_2_VIDEO_M_LINES
      )
    ).toEqual(SDP_WITH_2_VIDEO_M_LINES_AND_BANDWIDTH_LIMITS);
  });

  it('removes extmap lines when disableExtmap is set', () => {
    expect(
      mungeLocalSdp(
        {
          disableExtmap: true,
        },
        SDP_WITH_EXTMAP
      )
    ).toEqual(SDP_WITH_EXTMAP_REMOVED);
  });

  it('adds fs-max to h264 fmtp lines when h264MaxFs is enabled', () => {
    expect(
      mungeLocalSdp(
        {
          h264MaxFs: 8192,
        },
        SDP_MULTIPLE_VIDEO_CODECS
      )
    ).toEqual(SDP_MULTIPLE_VIDEO_CODECS_WITH_MAX_FS);
  });
});

describe('mungeRemoteSdp', () => {
  it('does not change anything with empty munging config', () => {
    expect(mungeRemoteSdp({}, SDP_MULTIPLE_VIDEO_CODECS)).toEqual(SDP_MULTIPLE_VIDEO_CODECS);
  });

  it('adds x-google-start-bitrate when startBitrate is configured', () => {
    expect(
      mungeRemoteSdp(
        {
          startBitrate: 1000,
        },
        SDP_MULTIPLE_VIDEO_CODECS
      )
    ).toEqual(SDP_MULTIPLE_VIDEO_CODECS_WITH_START_BITRATE);
  });

  it('removes extmap lines when disableExtmap is set', () => {
    expect(
      mungeRemoteSdp(
        {
          disableExtmap: true,
        },
        SDP_WITH_EXTMAP
      )
    ).toEqual(SDP_WITH_EXTMAP_REMOVED);
  });
});

describe('isSdpInvalid', () => {
  const runCheck = (requireH264: boolean, useSdpWithH264: boolean, expectedResult: string) => {
    const errorLog = jest.fn();

    expect(
      isSdpInvalid(
        {
          allowPort0: true,
          requireH264,
        },
        errorLog,
        useSdpWithH264
          ? SDP_MULTIPLE_VIDEO_CODECS // this SDP has H264
          : SDP_WITH_2_VIDEO_M_LINES_AND_NO_H264 // this one doesn't
      )
    ).toEqual(expectedResult);

    if (!expectedResult) {
      // if isSdpInvalid() returns falsy value it means everything is OK,
      // so there should be no calls to error log
      expect(errorLog).not.toBeCalled();
    } else {
      expect(errorLog).toBeCalled();
    }
  };

  it('fails if requireH264===true and SDP is missing H264', () => {
    runCheck(true, false, 'isSdpInvalid: H264 codec is missing');
  });

  it('does not fail if requireH264===false and SDP is missing H264', () => {
    runCheck(false, false, '');
  });

  it('does not fail if requireH264===true and SDP has H264', () => {
    runCheck(true, true, '');
  });

  it('does not fail if requireH264===false and SDP has H264', () => {
    runCheck(false, true, '');
  });
});
