import {expect} from 'chai';
import {Media} from './index';

describe('Exported Media Module', () => {
  it('should resolve if all required function are exposed', async () => {
    expect(Media.getCameras).to.be.a('function');
    expect(Media.getSpeakers).to.be.a('function');
    expect(Media.getMicrophones).to.be.a('function');
    expect(Media.createAudioTrack).to.be.a('function');
    expect(Media.createVideoTrack).to.be.a('function');
    expect(Media.createContentTrack).to.be.a('function');
    expect(Media.subscribe).to.be.a('function');
    expect(Media.unsubscribe).to.be.a('function');
  });
});
