import {expect} from 'chai';

import {mungeLocalSdp} from './utils';
import {SDP_WITH_PORT_9_VALUE, SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0} from './utils.test-fixtures';

describe('mungeLocalSdp', () => {
  it('replaces port 9 with 0 when convertPort9to0 config is enabled', () => {
    expect(mungeLocalSdp({convertPort9to0: true}, SDP_WITH_PORT_9_VALUE)).to.equal(
      SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0,
    );
  });
  it('does not replace port 9 with 0 when convertPort9to0 config is disabled', () => {
    expect(mungeLocalSdp({convertPort9to0: false}, SDP_WITH_PORT_9_VALUE)).to.equal(
      SDP_WITH_PORT_9_VALUE,
    );
  });
});
