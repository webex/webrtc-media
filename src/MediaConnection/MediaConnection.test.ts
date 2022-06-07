import {ConnectionState, MediaConnectionConfig} from './index';
import {MediaConnection} from './MediaConnection';

describe('MediaConnection', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let previousRTCPeerConnection: any;

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

  const FAKE_PC = {
    addTrack: jest.fn(),
    getTransceivers: jest.fn().mockReturnValue([]),
    addTransceiver: jest.fn(),
    createOffer: jest.fn().mockResolvedValue({sdp: '', type: 'offer'}),
    setLocalDescription: jest.fn().mockResolvedValue({}),
    iceGatheringState: 'complete',
    localDescription: {sdp: 'fake'},
  };

  beforeEach(() => {
    previousRTCPeerConnection = window.RTCPeerConnection;

    Object.defineProperty(window, 'RTCPeerConnection', {
      writable: true,
      value: jest.fn().mockImplementation(() => FAKE_PC),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'RTCPeerConnection', {
      writable: true,
      value: previousRTCPeerConnection,
    });
  });

  it('initial media connection state is NEW', () => {
    const mediaConnection = new MediaConnection(DEFAULT_CONFIG, {
      send: {},
      receive: {
        audio: true,
        video: true,
        screenShareVideo: true,
      },
    });

    expect(mediaConnection.getConnectionState()).toEqual(ConnectionState.NEW);
  });

  describe('outgoing call/joining a meeting', () => {
    let mc: MediaConnection;

    beforeEach(() => {
      mc = new MediaConnection(DEFAULT_CONFIG, {
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

    it('creates transceivers and does not call addTrack() when initializeTransceivers() is called', async () => {
      await mc.initializeTransceivers(false);

      expect(FAKE_PC.addTrack).not.toBeCalled();

      expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
      expect(FAKE_PC.addTransceiver).nthCalledWith(1, FAKE_AUDIO_TRACK, {direction: 'sendrecv'});
      expect(FAKE_PC.addTransceiver).nthCalledWith(2, FAKE_VIDEO_TRACK, {direction: 'sendrecv'});
      expect(FAKE_PC.addTransceiver).nthCalledWith(3, FAKE_SCREENSHARE_TRACK, {
        direction: 'sendrecv',
      });
    });

    it('fails if any transceiver already exists when initializeTransceivers() is called', () => {
      const originalMock = FAKE_PC.getTransceivers;

      FAKE_PC.getTransceivers = jest.fn().mockReturnValue([{id: 'fake_transceiver'}]);

      expect(() => mc.initializeTransceivers(false)).toThrow(
        new Error('SDP negotiation already started')
      );

      // try again with a different argument value - should give same result as above
      expect(() => mc.initializeTransceivers(true)).toThrow(
        new Error('SDP negotiation already started')
      );

      FAKE_PC.getTransceivers = originalMock;
    });

    describe('creates transceivers correctly', () => {
      [
        {localTrack: true, receive: true, expectedDirection: 'sendrecv'},
        {localTrack: true, receive: false, expectedDirection: 'sendonly'},
        {localTrack: false, receive: false, expectedDirection: 'inactive'},
        {localTrack: false, receive: true, expectedDirection: 'recvonly'},
      ].forEach(({localTrack, receive, expectedDirection}) => {
        it(`creates AUDIO transceiver with the right direction (${expectedDirection})`, async () => {
          const track = localTrack ? FAKE_AUDIO_TRACK : undefined;

          mc = new MediaConnection(DEFAULT_CONFIG, {
            send: {
              audio: track,
            },
            receive: {
              audio: receive,
              video: false,
              screenShareVideo: false,
            },
          });

          await mc.initializeTransceivers(false);

          expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
          expect(FAKE_PC.addTransceiver).nthCalledWith(1, track || 'audio', {
            direction: expectedDirection,
          });
          expect(FAKE_PC.addTransceiver).nthCalledWith(2, 'video', {direction: 'inactive'});
          expect(FAKE_PC.addTransceiver).nthCalledWith(3, 'video', {direction: 'inactive'});
        });

        it(`creates 1st VIDEO transceiver with the right direction (${expectedDirection})`, async () => {
          const track = localTrack ? FAKE_VIDEO_TRACK : undefined;

          mc = new MediaConnection(DEFAULT_CONFIG, {
            send: {
              video: track,
            },
            receive: {
              audio: false,
              video: receive,
              screenShareVideo: false,
            },
          });

          await mc.initializeTransceivers(false);

          expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
          expect(FAKE_PC.addTransceiver).nthCalledWith(1, 'audio', {direction: 'inactive'});
          expect(FAKE_PC.addTransceiver).nthCalledWith(2, track || 'video', {
            direction: expectedDirection,
          });
          expect(FAKE_PC.addTransceiver).nthCalledWith(3, 'video', {direction: 'inactive'});
        });

        it(`creates 2nd VIDEO transceiver with the right direction (${expectedDirection})`, async () => {
          const track = localTrack ? FAKE_VIDEO_TRACK : undefined;

          mc = new MediaConnection(DEFAULT_CONFIG, {
            send: {
              screenShareVideo: track,
            },
            receive: {
              audio: false,
              video: false,
              screenShareVideo: receive,
            },
          });

          await mc.initializeTransceivers(false);

          expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
          expect(FAKE_PC.addTransceiver).nthCalledWith(1, 'audio', {direction: 'inactive'});
          expect(FAKE_PC.addTransceiver).nthCalledWith(2, 'video', {direction: 'inactive'});
          expect(FAKE_PC.addTransceiver).nthCalledWith(3, track || 'video', {
            direction: expectedDirection,
          });
        });
      });
    });
  });

  describe('incoming call', () => {
    it('calls addTrack() for each sent track when initializeTransceivers(true) is called', () => {
      const mc = new MediaConnection(DEFAULT_CONFIG, {
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

      // tracks are added on first incoming offer
      mc.initializeTransceivers(true);

      expect(FAKE_PC.addTrack).toBeCalledTimes(3);
      expect(FAKE_PC.addTrack).toBeCalledWith(FAKE_AUDIO_TRACK);
      expect(FAKE_PC.addTrack).toBeCalledWith(FAKE_VIDEO_TRACK);
      expect(FAKE_PC.addTrack).toBeCalledWith(FAKE_SCREENSHARE_TRACK);
    });
  });

  describe('skipInactiveTransceivers config entry', () => {
    const createMediaConnectionWithOnlyAudio = (
      receiveAudio: boolean,
      sendAudio: boolean,
      config: MediaConnectionConfig
    ) => {
      return new MediaConnection(config, {
        send: {
          audio: sendAudio ? FAKE_AUDIO_TRACK : undefined,
        },
        receive: {
          audio: receiveAudio,
          video: false,
          screenShareVideo: false,
        },
      });
    };

    [
      {direction: 'sendrecv', receiveAudio: true, sendAudio: true},
      {direction: 'sendonly', receiveAudio: false, sendAudio: true},
      {direction: 'recvonly', receiveAudio: true, sendAudio: false},
    ].forEach(({direction, receiveAudio, sendAudio}) => {
      it(`creates only a single transceiver if only audio is used (${direction}) and skipInactiveTransceivers=true`, async () => {
        const mediaConnection = createMediaConnectionWithOnlyAudio(receiveAudio, sendAudio, {
          iceServers: [],
          skipInactiveTransceivers: true,
          sdpMunging: {},
        });

        await mediaConnection.initializeTransceivers(false);

        expect(FAKE_PC.addTransceiver).toBeCalledOnceWith(sendAudio ? FAKE_AUDIO_TRACK : 'audio', {
          direction,
        });
      });
    });

    it('creates 3 transceivers if only audio is used and skipInactiveTransceivers=false', async () => {
      const mediaConnection = createMediaConnectionWithOnlyAudio(true, true, {
        iceServers: [],
        skipInactiveTransceivers: false,
        sdpMunging: {},
      });

      await mediaConnection.initializeTransceivers(false);

      expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
      expect(FAKE_PC.addTransceiver).nthCalledWith(1, FAKE_AUDIO_TRACK, {
        direction: 'sendrecv',
      });
      expect(FAKE_PC.addTransceiver).nthCalledWith(2, 'video', {
        direction: 'inactive',
      });
      expect(FAKE_PC.addTransceiver).nthCalledWith(3, 'video', {
        direction: 'inactive',
      });
    });
  });
});
