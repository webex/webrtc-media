import {setupTestLogger, teardownTestLogger} from './testUtils';
import {ConnectionState, MediaConnectionConfig} from './index';
import {MediaConnection} from './MediaConnection';
import {AnyEvent, Event} from './eventTypes';
import * as utils from './utils';

describe('MediaConnection', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let previousRTCPeerConnection: any;

  const DEFAULT_CONFIG = {
    iceServers: [],
    skipInactiveTransceivers: false,
    requireH264: false,
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
    createOffer: jest.fn().mockResolvedValue({sdp: 'fake local offer', type: 'offer'}),
    createAnswer: jest.fn().mockResolvedValue({sdp: 'fake local answer', type: 'answer'}),
    setLocalDescription: jest.fn().mockResolvedValue({}),
    setRemoteDescription: jest.fn().mockResolvedValue({}),
    iceGatheringState: 'complete',
    localDescription: {sdp: 'fake pc.localDescription.sdp'},
    getStats: jest.fn(),
    close: jest.fn(),
    ontrack: null,
  };

  beforeAll(() => {
    setupTestLogger();
  });

  afterAll(() => {
    teardownTestLogger();
  });

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

  it('getStats() calls getStats() on the RTCPeerConnection', async () => {
    const FAKE_STATS = {anyKey: 'any value'};

    FAKE_PC.getStats.mockResolvedValue(FAKE_STATS);

    const mediaConnection = new MediaConnection(DEFAULT_CONFIG, {
      send: {},
      receive: {
        audio: true,
        video: true,
        screenShareVideo: true,
      },
    });

    const stats = await mediaConnection.getStats();

    expect(FAKE_PC.getStats).toBeCalledOnceWith();
    expect(stats).toEqual(FAKE_STATS);

    FAKE_PC.getStats.mockReset();
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

  it('close() closes the RTCPeerConnection', () => {
    const mediaConnection = new MediaConnection(DEFAULT_CONFIG, {
      send: {},
      receive: {
        audio: true,
        video: true,
        screenShareVideo: true,
      },
    });

    mediaConnection.close();

    expect(FAKE_PC.close).toBeCalledOnceWith();
  });

  describe('insertDTMF', () => {
    beforeEach(() => {
      FAKE_PC.addTransceiver.mockReturnValue({});
    });

    afterEach(() => {
      FAKE_PC.addTransceiver.mockReset();
    });

    it('fails if audio transceivers are not initialised', async () => {
      const mc = new MediaConnection(DEFAULT_CONFIG, {
        send: {audio: FAKE_AUDIO_TRACK},
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });

      // we're not calling mc.initializeTransceivers()

      expect(() => mc.insertDTMF('000')).toThrow(new Error('audio transceiver missing'));
    });

    it('fails if audio transceiver is missing', async () => {
      const mc = new MediaConnection(
        {...DEFAULT_CONFIG, skipInactiveTransceivers: true},
        {
          send: {},
          receive: {
            audio: false,
            video: true,
            screenShareVideo: true,
          },
        }
      );

      mc.initializeTransceivers(false);

      expect(() => mc.insertDTMF('000')).toThrow(new Error('audio transceiver missing'));
    });

    const setupMediaConnWithFakeAudioTransceiver = (fakeTransceiver: unknown) => {
      FAKE_PC.addTransceiver.mockImplementation((trackOrKind) => {
        if (trackOrKind === 'audio') {
          return fakeTransceiver;
        }

        // return a transceiver with insertDTMF() method
        return {sender: {dtmf: {insertDTMF: jest.fn()}}};
      });

      const mc = new MediaConnection(DEFAULT_CONFIG, {
        send: {},
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });

      return mc;
    };

    it('fails if audio transceiver is missing sender', async () => {
      // use a fake transceiver with no sender
      const mc = setupMediaConnWithFakeAudioTransceiver({sender: null});

      mc.initializeTransceivers(false);

      expect(() => mc.insertDTMF('000')).toThrow(
        new Error('this.transceivers.audio.sender is null')
      );
    });

    it('fails if audio transceiver is missing sender.dtmf', async () => {
      // use a fake transceiver with no sender.dtmf
      const mc = setupMediaConnWithFakeAudioTransceiver({sender: {dtmf: null}});

      mc.initializeTransceivers(false);

      expect(() => mc.insertDTMF('000')).toThrow(
        new Error('this.transceivers.audio.sender.dtmf is null')
      );
    });

    describe('calls insertDTMF() with the right arguments', () => {
      let mc: MediaConnection;
      const insertDtmfSpy = jest.fn();

      beforeEach(() => {
        FAKE_PC.addTransceiver.mockImplementation((trackOrKind, {direction}) => {
          if (trackOrKind === FAKE_AUDIO_TRACK && direction === 'sendrecv') {
            return {
              sender: {
                dtmf: {
                  insertDTMF: insertDtmfSpy,
                },
              },
            };
          }

          return {};
        });

        mc = new MediaConnection(DEFAULT_CONFIG, {
          send: {audio: FAKE_AUDIO_TRACK},
          receive: {
            audio: true,
            video: false,
            screenShareVideo: false,
          },
        });

        mc.initializeTransceivers(false);
      });

      it('without optional parameters', () => {
        mc.insertDTMF('123');
        expect(insertDtmfSpy).toBeCalledOnceWith('123', undefined, undefined);
      });

      it('with only the 1st optional parameter', () => {
        mc.insertDTMF('ABC', 100);
        expect(insertDtmfSpy).toBeCalledOnceWith('ABC', 100, undefined);
      });

      it('with all parameters', () => {
        mc.insertDTMF('#0A*', 200, 500);
        expect(insertDtmfSpy).toBeCalledOnceWith('#0A*', 200, 500);
      });

      it('converts tone to upper case', () => {
        mc.insertDTMF('01abcd*,#', 200, 500);
        expect(insertDtmfSpy).toBeCalledOnceWith('01ABCD*,#', 200, 500);
      });
    });
  });
  describe('DTMF tone change event', () => {
    let fakeDtmfSender: {
      dtmf: {
        ontonechange?: (data: AnyEvent) => void;
      };
    };
    let mc: MediaConnection;

    beforeEach(() => {
      fakeDtmfSender = {
        dtmf: {},
      };

      FAKE_PC.addTransceiver.mockImplementation((trackOrKind) => {
        if (trackOrKind === FAKE_AUDIO_TRACK) {
          return {sender: fakeDtmfSender};
        }

        return {};
      });

      mc = new MediaConnection(DEFAULT_CONFIG, {
        send: {audio: FAKE_AUDIO_TRACK},
        receive: {
          audio: false,
          video: false,
          screenShareVideo: false,
        },
      });
    });

    afterEach(() => {
      FAKE_PC.addTransceiver.mockReset();
    });

    it('listens for it (outgoing call)', () => {
      // for outgoing calls, the ontonechange listener is setup when initializeTransceivers() is called
      mc.initializeTransceivers(false);

      expect(fakeDtmfSender.dtmf.ontonechange).toBeTruthy();
    });

    it('listens for it (incoming call)', () => {
      // this call is redundant for this test, but normally is always done
      // for incoming calls, so we do it here for completeness
      mc.initializeTransceivers(true);

      // in incoming calls we don't explicitly create transceivers, but instead
      // get them from RTCPeerConnection after ontrack listener is called
      // so we setup the mock to return at least the audio transceiver
      const oldMock = FAKE_PC.getTransceivers;

      FAKE_PC.getTransceivers = jest.fn().mockReturnValue([
        {
          sender: fakeDtmfSender,
        },
      ]);

      // confirm MediaConnection is listenening for ontrack
      expect(FAKE_PC.ontrack).toBeTruthy();

      // for incoming calls, the ontonechange listener is setup only when ontrack listener is called
      if (FAKE_PC.ontrack) {
        // trigger the ontrack listener in MediaConnection
        (FAKE_PC.ontrack as (e: RTCTrackEvent) => void)({
          track: {id: 'fake'},
        } as RTCTrackEvent);
      }

      // confirm that MediaConnection has set up the ontonechange listener
      expect(fakeDtmfSender.dtmf.ontonechange).toBeTruthy();

      FAKE_PC.getTransceivers = oldMock;
    });

    it('is forwarded from RTCPeerConnnections dtmf sender', () => {
      const FAKE_TONE_EVENT = {tone: '2468#'};
      let toneChangeEventFired = false;

      mc.on(Event.DTMF_TONE_CHANGED, (data) => {
        expect(data).toEqual(FAKE_TONE_EVENT);
        toneChangeEventFired = true;
      });
      mc.initializeTransceivers(false);

      // verify that we've started listening for tone change notifications
      expect(fakeDtmfSender.dtmf.ontonechange).toBeTruthy();

      // call the event listener
      if (fakeDtmfSender.dtmf.ontonechange) {
        fakeDtmfSender.dtmf.ontonechange(FAKE_TONE_EVENT);
      }

      expect(toneChangeEventFired).toEqual(true);
    });
  });

  describe('handling of SDPs', () => {
    let mungeRemoteSdpSpy: jest.SpyInstance;
    let mungeLocalSdpSpy: jest.SpyInstance;
    let mungeLocalSdpForBrowserSpy: jest.SpyInstance;

    const sdpMungingConfig = {startBitrate: 2000};
    let mc: MediaConnection;

    beforeEach(() => {
      mungeRemoteSdpSpy = jest.spyOn(utils, 'mungeRemoteSdp').mockReturnValue('munged remote sdp');
      mungeLocalSdpSpy = jest.spyOn(utils, 'mungeLocalSdp').mockReturnValue('munged local sdp');
      mungeLocalSdpForBrowserSpy = jest
        .spyOn(utils, 'mungeLocalSdpForBrowser')
        .mockReturnValue('munged local sdp for browser');
      jest.spyOn(utils, 'isSdpInvalid').mockReturnValue('');

      mc = new MediaConnection(
        {
          iceServers: [],
          skipInactiveTransceivers: false,
          requireH264: false,
          sdpMunging: sdpMungingConfig,
        },
        {
          send: {},
          receive: {
            audio: true,
            video: true,
            screenShareVideo: true,
          },
        }
      );
    });

    it('handleRemoteOffer() works as expected', async () => {
      const answer = await mc.handleRemoteOffer('fake remote sdp');

      expect(mungeRemoteSdpSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake remote sdp');
      expect(FAKE_PC.setRemoteDescription).toBeCalledOnceWith({
        type: 'offer',
        sdp: 'munged remote sdp',
      });
      expect(FAKE_PC.createAnswer).toBeCalledOnceWith();
      expect(mungeLocalSdpForBrowserSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake local answer');
      expect(FAKE_PC.setLocalDescription).toBeCalledOnceWith({
        type: 'answer',
        sdp: 'munged local sdp for browser',
      });
      expect(mungeLocalSdpSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake pc.localDescription.sdp');
      expect(answer).toEqual({sdp: 'munged local sdp'});
    });

    it('handleRemoteAnswer() works as expected', async () => {
      await mc.handleRemoteAnswer('fake remote answer');

      expect(mungeRemoteSdpSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake remote answer');
      expect(FAKE_PC.setRemoteDescription).toBeCalledOnceWith({
        type: 'answer',
        sdp: 'munged remote sdp',
      });
    });

    it('createLocalOffer() works as expected', async () => {
      const offer = await mc.createLocalOffer();

      expect(FAKE_PC.createOffer).toBeCalledOnceWith();
      expect(mungeLocalSdpForBrowserSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake local offer');
      expect(FAKE_PC.setLocalDescription).toBeCalledOnceWith({
        type: 'offer',
        sdp: 'munged local sdp for browser',
      });
      expect(mungeLocalSdpSpy).toBeCalledOnceWith(sdpMungingConfig, 'fake pc.localDescription.sdp');
      expect(offer).toEqual({sdp: 'munged local sdp'});
    });
  });

  describe('getTransceiverStats', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeTransceivers: Array<any> = [];

    beforeEach(() => {
      fakeTransceivers.length = 0; // this clears the array

      // setup the mocks so that we have mocked transceivers with:
      // mocked getStats, currentDirection and sender track with a label
      FAKE_PC.addTransceiver.mockImplementation(() => {
        const idx = fakeTransceivers.length;
        const fakeTransceiver = {
          currentDirection: `fake direction for transceiver index ${idx}`,
          sender: {
            getStats: jest.fn().mockResolvedValue({
              fakeStats: `fake sender stats for transceiver index ${idx}`,
            }),
            track: {
              label: `fake track label for transceiver index ${idx}`,
            },
          },
          receiver: {
            getStats: jest.fn().mockResolvedValue({
              fakeStats: `fake receiver stats for transceiver index ${idx}`,
            }),
          },
        };

        fakeTransceivers.push(fakeTransceiver);

        return fakeTransceiver;
      });
    });

    afterEach(() => {
      FAKE_PC.addTransceiver.mockReset();
    });

    it('returns defaults if transceivers are not created', async () => {
      // create a media connection and call getTransceiverStats()
      // without calling initializeTransceivers()
      const mediaConnection = new MediaConnection(DEFAULT_CONFIG, {
        send: {},
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });

      const stats = await mediaConnection.getTransceiverStats();

      expect(stats).toEqual({
        audio: {
          sender: new Map(),
          receiver: new Map(),
        },
        video: {
          sender: new Map(),
          receiver: new Map(),
        },
        screenShareVideo: {
          sender: new Map(),
          receiver: new Map(),
        },
      });
    });

    it('calls getStats() on all of the transceivers', async () => {
      const mediaConnection = new MediaConnection(DEFAULT_CONFIG, {
        send: {},
        receive: {
          audio: true,
          video: true,
          screenShareVideo: true,
        },
      });

      mediaConnection.initializeTransceivers(false);

      const stats = await mediaConnection.getTransceiverStats();

      expect(fakeTransceivers.length).toBe(3);
      expect(fakeTransceivers[0].sender.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[0].receiver.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[1].sender.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[1].receiver.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[2].sender.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[2].receiver.getStats).toBeCalledOnceWith();
      expect(stats).toEqual({
        audio: {
          currentDirection: 'fake direction for transceiver index 0',
          localTrackLabel: 'fake track label for transceiver index 0',
          sender: {fakeStats: 'fake sender stats for transceiver index 0'},
          receiver: {fakeStats: 'fake receiver stats for transceiver index 0'},
        },
        video: {
          currentDirection: 'fake direction for transceiver index 1',
          localTrackLabel: 'fake track label for transceiver index 1',
          sender: {fakeStats: 'fake sender stats for transceiver index 1'},
          receiver: {fakeStats: 'fake receiver stats for transceiver index 1'},
        },
        screenShareVideo: {
          currentDirection: 'fake direction for transceiver index 2',
          localTrackLabel: 'fake track label for transceiver index 2',
          sender: {fakeStats: 'fake sender stats for transceiver index 2'},
          receiver: {fakeStats: 'fake receiver stats for transceiver index 2'},
        },
      });
    });

    it('calls getStats() only on the created transceivers', async () => {
      // create a media connection without main video and with
      // skipInactiveTransceivers enabled, so that we won't have
      // the main video transceiver created
      const mediaConnection = new MediaConnection(
        {...DEFAULT_CONFIG, skipInactiveTransceivers: true},
        {
          send: {},
          receive: {
            audio: true,
            video: false,
            screenShareVideo: true,
          },
        }
      );

      mediaConnection.initializeTransceivers(false);

      const stats = await mediaConnection.getTransceiverStats();

      expect(fakeTransceivers.length).toBe(2);
      expect(fakeTransceivers[0].sender.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[0].receiver.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[1].sender.getStats).toBeCalledOnceWith();
      expect(fakeTransceivers[1].receiver.getStats).toBeCalledOnceWith();
      expect(stats).toEqual({
        audio: {
          currentDirection: 'fake direction for transceiver index 0',
          localTrackLabel: 'fake track label for transceiver index 0',
          sender: {fakeStats: 'fake sender stats for transceiver index 0'},
          receiver: {fakeStats: 'fake receiver stats for transceiver index 0'},
        },
        video: {
          sender: new Map(),
          receiver: new Map(),
        },
        screenShareVideo: {
          currentDirection: 'fake direction for transceiver index 1',
          localTrackLabel: 'fake track label for transceiver index 1',
          sender: {fakeStats: 'fake sender stats for transceiver index 1'},
          receiver: {fakeStats: 'fake receiver stats for transceiver index 1'},
        },
      });
    });
  });
});
