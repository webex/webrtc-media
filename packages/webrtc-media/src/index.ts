import * as MediaCore from './Media';
import * as BNR from './Media/Effects/BNR';

// TODO: we should be exporting * from Media in this file as well as for MediaConnection
export const Media = {
  createAudioTrack: MediaCore.createAudioTrack,
  createVideoTrack: MediaCore.createVideoTrack,
  createContentTrack: MediaCore.createContentTrack,
  getCameras: MediaCore.getCameras,
  getMicrophones: MediaCore.getMicrophones,
  getSpeakers: MediaCore.getSpeakers,
  on: MediaCore.on,
  off: MediaCore.off,
  Effects: {
    BNR: {
      enableBNR: BNR.enableBNR,
      disableBNR: BNR.disableBNR,
    },
  },
};
