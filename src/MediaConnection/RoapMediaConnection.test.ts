import EventEmitter from 'events';
import {
  RoapMessage,
  Event,
  AnyEvent,
  ConnectionState,
  RemoteTrackType,
  ErrorType,
} from './eventTypes';
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
    insertDTMF: jest.fn(),
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

  describe('insertDTMF()', () => {
    describe('calls insertDTMF() on the mediaConnection', () => {
      let mc: RoapMediaConnection;

      beforeEach(() => {
        // insertDTMF is just a passthrough - it always calls
        // the mediaConnection without checking anything (it relies
        // on the MediaConnection to do the checks),
        // so we can configure RoapMediaConnection even without any audio
        mc = new RoapMediaConnection(DEFAULT_CONFIG, {
          send: {},
          receive: {
            audio: false,
            video: false,
            screenShareVideo: false,
          },
        });
      });

      it('without optional parameters', () => {
        mc.insertDTMF('ABCD');
        expect(FAKE_MC.insertDTMF).toBeCalledOnceWith('ABCD', undefined, undefined);
      });

      it('with only the 1st optional parameter', () => {
        mc.insertDTMF('2468', 500);
        expect(FAKE_MC.insertDTMF).toBeCalledOnceWith('2468', 500, undefined);
      });

      it('with all parameters', () => {
        mc.insertDTMF('#A123*', 300, 600);
        expect(FAKE_MC.insertDTMF).toBeCalledOnceWith('#A123*', 300, 600);
      });
    });
  });

  describe('Events', () => {
    let mc: RoapMediaConnection;

    const setup = () => {
      mc = new RoapMediaConnection(DEFAULT_CONFIG, {
        send: {},
        receive: {
          audio: false,
          video: false,
          screenShareVideo: false,
        },
      });
    };

    it('registers for the correct MediaConnection events', () => {
      setup();
      expect(FAKE_MC.on).toBeCalledTimes(3);
      expect(FAKE_MC.on).toBeCalledWith(Event.REMOTE_TRACK_ADDED, expect.any(Function));
      expect(FAKE_MC.on).toBeCalledWith(Event.CONNECTION_STATE_CHANGED, expect.any(Function));
      expect(FAKE_MC.on).toBeCalledWith(Event.DTMF_TONE_CHANGED, expect.any(Function));
    });

    /**
     * It simulates an event coming from either MediaConnection or Roap and checks
     * that this event (along with the event data) is forwared by the RoapMediaConnection
     * to the client.
     *
     * @param from - which dependency will the simulated event come from: MediaConnection or Roap
     * @param eventType - event type to test
     * @param eventData - event data to be sent with the event during the test
     */
    const testEvent = (from: 'mc' | 'roap', eventType: Event, eventData: AnyEvent) => {
      const emitter = new EventEmitter();

      // setup the mock so that it returns our fake emitter when RoapMediaConnection
      // creates a MediaConnection or Roap instance
      if (from === 'mc') {
        jest
          .spyOn(mediaConnection, 'MediaConnection')
          .mockImplementation(() => emitter as mediaConnection.MediaConnection);
      } else if (from === 'roap') {
        jest.spyOn(roap, 'Roap').mockImplementation(() => emitter as roap.Roap);
      }

      setup();

      let eventListenerCalled = false;

      // set a test listener on RoapMediaConnection that verifies the event is received
      // and that the event data is correct
      mc.on(eventType, (data) => {
        expect(data).toEqual(eventData);
        eventListenerCalled = true;
      });

      // simulate the event being emitted by MediaConnection or Roap
      emitter.emit(eventType, eventData);

      // verify that the test listener was called
      expect(eventListenerCalled).toEqual(true);
    };

    it('forwards the DTMF_TONE_CHANGED event', () => {
      testEvent('mc', Event.DTMF_TONE_CHANGED, {tone: 'abc123456*#'});
    });

    it('forwards the REMOTE_TRACK_ADDED event', () => {
      testEvent('mc', Event.REMOTE_TRACK_ADDED, {
        track: FAKE_AUDIO_TRACK,
        type: RemoteTrackType.AUDIO,
      });
    });

    it('forwards the CONNECTION_STATE_CHANGED event', () => {
      testEvent('mc', Event.CONNECTION_STATE_CHANGED, {state: ConnectionState.CONNECTING});
    });

    it('registers for the correct Roap events', () => {
      setup();
      expect(FAKE_ROAP.on).toBeCalledTimes(2);
      expect(FAKE_ROAP.on).toBeCalledWith(Event.ROAP_MESSAGE_TO_SEND, expect.any(Function));
      expect(FAKE_ROAP.on).toBeCalledWith(Event.ROAP_FAILURE, expect.any(Function));
    });

    it('forwards the ROAP_MESSAGE_TO_SEND event', () => {
      testEvent('roap', Event.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {messageType: 'OFFER', seq: 100, sdp: 'fake', tieBreaker: 123},
      });
      testEvent('roap', Event.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {messageType: 'ERROR', seq: 100, errorType: ErrorType.FAILED, retryAfter: 10},
      });
    });

    it('forwards the ROAP_FAILURE event', () => {
      testEvent('roap', Event.ROAP_FAILURE, undefined);
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
      expect(FAKE_MC.on).toBeCalledTimes(3);
      expect(FAKE_MC.on).toBeCalledWith(Event.REMOTE_TRACK_ADDED, expect.any(Function));
      expect(FAKE_MC.on).toBeCalledWith(Event.CONNECTION_STATE_CHANGED, expect.any(Function));
      expect(FAKE_MC.on).toBeCalledWith(Event.DTMF_TONE_CHANGED, expect.any(Function));
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
