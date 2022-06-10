import {RoapMessage, Event} from './eventTypes';
import {RoapMediaConnection} from './index';
import * as roap from './roap';
import * as mediaConnection from './MediaConnection';

describe('RoapMediaConnection', () => {
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
    getConfig: jest.fn(),
    getSendReceiveOptions: jest.fn(),
    getConnectionState: jest.fn(),
    getStats: jest.fn(),
    close: jest.fn(),
    removeAllListeners: jest.fn(),
  };

  const FAKE_ROAP = {
    getSeq: jest.fn(),
    initiateOffer: jest.fn(),
    roapMessageReceived: jest.fn(),
    on: jest.fn(),
    stop: jest.fn(),
    removeAllListeners: jest.fn(),
  };

  let mediaConnectionCtorSpy: jest.SpyInstance;
  let roapCtorSpy: jest.SpyInstance;

  beforeEach(() => {
    roapCtorSpy = jest
      .spyOn(roap, 'Roap')
      .mockImplementation(() => FAKE_ROAP as unknown as roap.Roap);
    mediaConnectionCtorSpy = jest
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

  it('getStats() calls getStats() on the media connection', async () => {
    const FAKE_STATS = {someStats: 'any value'};

    FAKE_MC.getStats.mockResolvedValue(FAKE_STATS);

    const mc = new RoapMediaConnection(DEFAULT_CONFIG, {
      send: {},
      receive: {
        audio: true,
        video: true,
        screenShareVideo: true,
      },
    });

    const stats = await mc.getStats();

    expect(FAKE_MC.getStats).toBeCalledOnceWith();
    expect(stats).toEqual(FAKE_STATS);

    FAKE_MC.getStats.mockReset();
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

  describe('reconnect()', () => {
    let mc: RoapMediaConnection;

    const DEBUG_ID = 'some debug id';

    beforeEach(() => {
      mc = new RoapMediaConnection(
        DEFAULT_CONFIG,
        {
          send: {},
          receive: {
            audio: true,
            video: true,
            screenShareVideo: true,
          },
        },
        DEBUG_ID
      );
    });

    it('closes the media connection and stops the roap session', () => {
      mc.reconnect();

      expect(FAKE_MC.close).toBeCalledOnceWith();
      expect(FAKE_ROAP.stop).toBeCalledOnceWith();
    });

    it('creates a new media connection with same config, options and debugId', () => {
      const FAKE_CONFIG = {anyField: 'any value'};
      const FAKE_OPTIONS = {send: {audio: FAKE_AUDIO_TRACK}, receive: {audio: false, video: true}};

      FAKE_MC.getConfig.mockReturnValue(FAKE_CONFIG);
      FAKE_MC.getSendReceiveOptions.mockReturnValue(FAKE_OPTIONS);

      mediaConnectionCtorSpy.mockClear();
      FAKE_MC.on.mockClear();

      mc.reconnect();

      expect(mediaConnectionCtorSpy).toBeCalledOnceWith(FAKE_CONFIG, FAKE_OPTIONS, DEBUG_ID);
      expect(FAKE_MC.on).toBeCalledTimes(2);
      expect(FAKE_MC.on).toBeCalledWith(Event.REMOTE_TRACK_ADDED, expect.any(Function));
      expect(FAKE_MC.on).toBeCalledWith(Event.CONNECTION_STATE_CHANGED, expect.any(Function));
    });

    it('creates a new roap session, maintaining the seq from the old one', () => {
      const FAKE_SEQ = 100;

      FAKE_ROAP.getSeq.mockReturnValue(FAKE_SEQ);

      roapCtorSpy.mockClear();
      FAKE_ROAP.on.mockClear();

      mc.reconnect();

      expect(roapCtorSpy).toBeCalledOnceWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        DEBUG_ID,
        FAKE_SEQ
      );
      expect(FAKE_ROAP.on).toBeCalledTimes(2);
      expect(FAKE_ROAP.on).toBeCalledWith(Event.ROAP_MESSAGE_TO_SEND, expect.any(Function));
      expect(FAKE_ROAP.on).toBeCalledWith(Event.ROAP_FAILURE, expect.any(Function));
    });

    it('initiates new offer by default', () => {
      mc.reconnect();

      expect(FAKE_ROAP.initiateOffer).toBeCalledOnceWith();
    });

    it('does not initiate new offer when initiateOffer argument is false', () => {
      FAKE_MC.initializeTransceivers.mockClear();

      mc.reconnect(false);

      expect(FAKE_ROAP.initiateOffer).not.toBeCalled();

      // also check that an incoming offer should now trigger initialization
      // of transceivers just like the "first ever" offer does
      mc.roapMessageReceived({messageType: 'OFFER', sdp: 'fake remote offer', seq: 2});

      expect(FAKE_MC.initializeTransceivers).toBeCalledOnceWith(true);
      expect(FAKE_ROAP.roapMessageReceived).toBeCalledOnceWith({
        messageType: 'OFFER',
        sdp: 'fake remote offer',
        seq: 2,
      });
    });
  });
});
