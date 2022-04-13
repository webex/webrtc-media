import {Media} from './index';

describe('Exported Media Module', () => {
  it('should resolve if all required function are exposed', async () => {
    expect(Media.getCameras).toBeInstanceOf(Function);
    expect(Media.getSpeakers).toBeInstanceOf(Function);
    expect(Media.getMicrophones).toBeInstanceOf(Function);
    expect(Media.createAudioTrack).toBeInstanceOf(Function);
    expect(Media.createVideoTrack).toBeInstanceOf(Function);
    expect(Media.createContentTrack).toBeInstanceOf(Function);
    expect(Media.subscribe).toBeInstanceOf(Function);
    expect(Media.unsubscribe).toBeInstanceOf(Function);
  });
});
