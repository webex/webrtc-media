import {RoapMessage} from './eventTypes';
import {RoapMediaConnection} from './index';
import * as roap from './roap';
import * as mediaConnection from './MediaConnection';

describe('MediaConnection', () => {
  const DEFAULT_CONFIG = {
    iceServers: [],
    skipInactiveTransceivers: false,
    sdpMunging: {},
  };

  const FAKE_AUDIO_TRACK = {
    kind: 'audio',
  } as MediaStreamTrack;

  const FAKE_VIDEO_TRACK = {
    kind: 'video',
  } as MediaStreamTrack;

  const FAKE_SCREENSHARE_TRACK = {
    kind: 'video',
  } as MediaStreamTrack;

  const FAKE_MC = {
    initializeTransceivers: jest.fn(),
    on: jest.fn(),
    getConnectionState: jest.fn(),
  };

  const FAKE_ROAP = {
    initiateOffer: jest.fn(),
    roapMessageReceived: jest.fn(),
    on: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(roap, 'Roap').mockImplementation(() => FAKE_ROAP as unknown as roap.Roap);
    jest
      .spyOn(mediaConnection, 'MediaConnection')
      .mockImplementation(() => FAKE_MC as unknown as mediaConnection.MediaConnection);
  });

  it('getConnectionState() calls getConnectionState() on the media connection', () => {
    const mc = new RoapMediaConnection(DEFAULT_CONFIG, {
      send: {},
      receive: {
        audio: true,
        video: true,
        screenShareVideo: true,
      },
    });

    mc.getConnectionState();

    expect(FAKE_MC.getConnectionState).toBeCalledOnceWith();
  });

  describe('outgoing call/joining a meeting', () => {
    let mc: RoapMediaConnection;

    beforeEach(() => {
      mc = new RoapMediaConnection(DEFAULT_CONFIG, {
        send: {
          audio: FAKE_AUDIO_TRACK,
          video: FAKE_VIDEO_TRACK,
          screenShareVideo: FAKE_SCREENSHARE_TRACK,
        },
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });
    });

    it('initializes transceivers when initiateOffer() is called', async () => {
      await mc.initiateOffer();

      expect(FAKE_MC.initializeTransceivers).toBeCalledOnceWith(false);
      expect(FAKE_ROAP.initiateOffer).toBeCalledOnceWith();
    });

    it('fails if initiateOffer() is called for a second time', async () => {
      await mc.initiateOffer();

      FAKE_ROAP.initiateOffer.mockClear();

      // call it again
      await expect(mc.initiateOffer()).rejects.toThrow(
        new Error('SDP negotiation already started')
      );
      expect(FAKE_ROAP.initiateOffer).not.toBeCalled();
    });

    it('does not call initializeTransceivers() on remote offer', async () => {
      await mc.initiateOffer();

      FAKE_MC.initializeTransceivers.mockClear();

      // now simulate an offer coming from the backend
      mc.roapMessageReceived({messageType: 'OFFER', sdp: 'fake', seq: 2});

      expect(FAKE_MC.initializeTransceivers).not.toBeCalled();
    });
  });

  describe('incoming call', () => {
    const FAKE_OFFER: RoapMessage = {messageType: 'OFFER', sdp: 'fake', seq: 1};

    it('calls initializeTransceivers(true) when first incoming offer arrives', () => {
      const mc = new RoapMediaConnection(DEFAULT_CONFIG, {
        send: {
          audio: FAKE_AUDIO_TRACK,
          video: FAKE_VIDEO_TRACK,
          screenShareVideo: FAKE_SCREENSHARE_TRACK,
        },
        receive: {
          audio: false,
          video: false,
          screenShareVideo: false,
        },
      });

      mc.roapMessageReceived(FAKE_OFFER);

      expect(FAKE_MC.initializeTransceivers).toBeCalledOnceWith(true);
      expect(FAKE_ROAP.roapMessageReceived).toBeCalledOnceWith(FAKE_OFFER);
    });

    it('calls initializeTransceivers(true) only once for incoming calls', () => {
      const mc = new RoapMediaConnection(DEFAULT_CONFIG, {
        send: {
          audio: FAKE_AUDIO_TRACK,
          video: FAKE_VIDEO_TRACK,
        },
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });

      // when the incoming offer comes for the first time, initializeTransceivers() should be called
      mc.roapMessageReceived(FAKE_OFFER);

      expect(FAKE_ROAP.roapMessageReceived).toBeCalledOnceWith(FAKE_OFFER);
      expect(FAKE_MC.initializeTransceivers).toBeCalledOnceWith(true);

      FAKE_MC.initializeTransceivers.mockClear();
      FAKE_ROAP.roapMessageReceived.mockClear();

      // simulate a second incoming offer, this time initializeTransceivers() should not be called
      mc.roapMessageReceived({messageType: 'OFFER', sdp: 'fake', seq: 2});

      expect(FAKE_ROAP.roapMessageReceived).toBeCalledOnceWith({
        messageType: 'OFFER',
        sdp: 'fake',
        seq: 2,
      });

      expect(FAKE_MC.initializeTransceivers).not.toBeCalled();
    });
  });
});
