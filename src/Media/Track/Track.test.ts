import {expect} from 'chai';
import {Track} from './Track';

describe('Track', () => {
  const mockMediaStreamTrack = {
    id: '04b14bc2-2c0e-4c54-9e9d-1d52f7a34c5f',
    kind: 'audio',
    muted: true,
    label: 'sample',
    contentHint: 'sample',
    enabled: true,
    readyState: 'live',
    stop: () : void => { /* placeholder */ },
  };

  describe('stop()', () => {
    let track : Track;

    beforeEach(() => {
      track = new Track((mockMediaStreamTrack as unknown) as MediaStreamTrack);
    });

    it('should update the track status to ended', () => {
      expect(track.status).to.eq('live');
      track.stop();
      expect(track.status).to.eq('ended');
    });
  });
});
