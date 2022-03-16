/* eslint-disable no-console */
import {expect} from 'chai';

import {mungeLocalSdp} from './utils';
import {
  SDP_WITH_PORT_9_VALUE,
  SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0,
  SDP_WITH_2_VIDEO_M_LINES,
  SDP_WITH_2_VIDEO_M_LINES_AND_CONTENT_SLIDES,
  SDP_WITH_1_VIDEO_M_LINE,
} from './utils.test-fixtures';

describe('mungeLocalSdp', () => {
  it('replaces port 9 with 0 when convertPort9to0 config is enabled', () => {
    expect(mungeLocalSdp({convertPort9to0: true}, SDP_WITH_PORT_9_VALUE)).to.equal(
      SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0
    );
  });

  it('does not replace port 9 with 0 when convertPort9to0 config is disabled', () => {
    expect(mungeLocalSdp({convertPort9to0: false}, SDP_WITH_PORT_9_VALUE)).to.equal(
      SDP_WITH_PORT_9_VALUE
    );
  });

  it('adds a=content:slides line to the 2nd video m-line when addContentSlides config is enabled', () => {
    expect(mungeLocalSdp({addContentSlides: true}, SDP_WITH_2_VIDEO_M_LINES)).to.equal(
      SDP_WITH_2_VIDEO_M_LINES_AND_CONTENT_SLIDES
    );
  });

  it('does not add a=content:slides line if only 1 video m-line present when addContentSlides config is enabled', () => {
    expect(mungeLocalSdp({addContentSlides: true}, SDP_WITH_1_VIDEO_M_LINE)).to.equal(
      SDP_WITH_1_VIDEO_M_LINE
    );
  });

  it('does not add a=content:slides line to the 2nd video m-line when addContentSlides config is disabled', () => {
    expect(mungeLocalSdp({addContentSlides: false}, SDP_WITH_2_VIDEO_M_LINES)).to.equal(
      SDP_WITH_2_VIDEO_M_LINES
    );
  });
});
