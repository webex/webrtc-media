import {ConnectionState, MediaConnection, MediaConnectionConfig} from './index';

describe('MediaConnection', () => {
  it('initial media connection state is NEW', () => {
    const mediaConnection = new MediaConnection(
      {
        iceServers: [],
        skipInactiveTransceivers: false,
        sdpMunging: {convertPort9to0: false},
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

    expect(mediaConnection.getConnectionState()).toEqual(ConnectionState.NEW);
  });

  describe('skipInactiveTransceivers config entry', () => {
    let FAKE_PC: RTCPeerConnection;
    let fakeLocalAudioTrack: MediaStreamTrack;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let prevRTCPeerConnection: any;

    beforeEach(() => {
      fakeLocalAudioTrack = {} as MediaStreamTrack;

      FAKE_PC = {
        addTransceiver: jest.fn(),
        getTransceivers: jest.fn().mockReturnValue([]),
        createOffer: jest.fn().mockResolvedValue({sdp: '', type: 'offer'}),
        setLocalDescription: jest.fn().mockResolvedValue({}),
        iceGatheringState: 'complete',
        localDescription: {sdp: 'fake'},
      } as unknown as RTCPeerConnection;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prevRTCPeerConnection = (global as any).RTCPeerConnection;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).RTCPeerConnection = jest.fn().mockReturnValue(FAKE_PC);
    });

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).RTCPeerConnection = prevRTCPeerConnection;
    });

    const createMediaConnectionWithOnlyAudio = (
      receiveAudio: boolean,
      sendAudio: boolean,
      config: MediaConnectionConfig
    ) => {
      return new MediaConnection(config, {
        send: {
          audio: sendAudio ? fakeLocalAudioTrack : undefined,
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

        await mediaConnection.initiateOffer();

        expect(FAKE_PC.addTransceiver).toBeCalledOnceWith(
          sendAudio ? fakeLocalAudioTrack : 'audio',
          {
            direction,
          }
        );
      });
    });

    it('creates 3 transceivers if only audio is used and skipInactiveTransceivers=false', async () => {
      const mediaConnection = createMediaConnectionWithOnlyAudio(true, true, {
        iceServers: [],
        skipInactiveTransceivers: false,
        sdpMunging: {},
      });

      await mediaConnection.initiateOffer();

      expect(FAKE_PC.addTransceiver).toBeCalledTimes(3);
      expect(FAKE_PC.addTransceiver).nthCalledWith(1, fakeLocalAudioTrack, {
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
