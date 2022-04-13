/* eslint-disable no-console */ // TODO: remove this (it's only temporary)
import {expect} from 'chai';
import {RemoteTrackType} from './eventTypes';

import {
  ConnectionState,
  ConnectionStateChangedEvent,
  Event,
  MediaConnection,
  RemoteTrackAddedEvent,
  RoapMessageEvent,
} from './index';

interface IControlledPromise<T> extends Promise<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

const createControlledPromise = (): IControlledPromise<unknown> => {
  let resolvePromise;
  let rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  }) as IControlledPromise<unknown>;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.resolve = resolvePromise;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.reject = rejectPromise;

  return promise;
};

xdescribe('2 MediaConnections connected to each other', () => {
  let localStream: MediaStream;

  let testConnections: Array<{
    mc: MediaConnection;
    debug: string;
    connectionEstablished: IControlledPromise<unknown>;
    audioRemoteTrackAdded: IControlledPromise<unknown>;
    videoRemoteTrackAdded: IControlledPromise<unknown>;
  }>;

  const setupConnectionEventHandlers = () => {
    // eslint-disable-next-line arrow-body-style
    const getOtherConnection = (connection: MediaConnection): MediaConnection => {
      // return the other connection of the two
      return connection === testConnections[0].mc ? testConnections[1].mc : testConnections[0].mc;
    };

    testConnections.forEach(
      ({mc, debug, connectionEstablished, audioRemoteTrackAdded, videoRemoteTrackAdded}) => {
        if (mc) {
          mc.on(Event.CONNECTION_STATE_CHANGED, (e: ConnectionStateChangedEvent) => {
            console.log(`TEST: got CONNECTION_STATE_CHANGED from ${debug}:`, e);
            if (e.state === ConnectionState.CONNECTED) {
              connectionEstablished.resolve(undefined);
            }
          });

          mc.on(Event.REMOTE_TRACK_ADDED, (e: RemoteTrackAddedEvent) => {
            console.log(`TEST: got REMOTE_TRACK_ADDED from ${debug}:`, JSON.stringify(e));
            if (e.type === RemoteTrackType.AUDIO) {
              audioRemoteTrackAdded.resolve(undefined);
            }
            if (e.type === RemoteTrackType.VIDEO) {
              videoRemoteTrackAdded.resolve(undefined);
            }
          });

          // setup roap message event handlers so that we pass the SDPs between the 2 media connections
          mc.on(Event.ROAP_MESSAGE_TO_SEND, (e: RoapMessageEvent) => {
            console.log(`TEST: got ROAP_MESSAGE_TO_SEND from ${debug}: ${e.roapMessage.sdp}`);

            if (e.roapMessage.messageType === 'OFFER') {
              const message = e.roapMessage;

              // we need to remove the bundling, otherwise browser puts ICE candidates only in 1 m-line and the checks in isSdpInvalid() fail
              message.sdp = message.sdp?.replace(/\r\na=group:BUNDLE 0 1 2/gi, '');

              getOtherConnection(mc).roapMessageReceived(message);
            } else {
              getOtherConnection(mc).roapMessageReceived(e.roapMessage);
            }
          });
        }
      }
    );
  };

  const createTestConnections = (options: {
    send: {
      audio?: MediaStreamTrack;
      video?: MediaStreamTrack;
      screenShareVideo?: MediaStreamTrack;
    };
    receive: {
      audio: boolean;
      video: boolean;
      screenShareVideo: boolean;
    };
  }) => {
    const {send, receive} = options;

    testConnections = [
      {
        mc: new MediaConnection(
          {iceServers: [], sdpMunging: {convertPort9to0: false}},
          {send, receive},
          'mc1'
        ),
        debug: 'mc1',
        connectionEstablished: createControlledPromise(),
        audioRemoteTrackAdded: createControlledPromise(),
        videoRemoteTrackAdded: createControlledPromise(),
      },
      {
        mc: new MediaConnection(
          {iceServers: [], sdpMunging: {convertPort9to0: false}},
          {send, receive},
          'mc2'
        ),
        debug: 'mc2',
        connectionEstablished: createControlledPromise(),
        audioRemoteTrackAdded: createControlledPromise(),
        videoRemoteTrackAdded: createControlledPromise(),
      },
    ];

    setupConnectionEventHandlers();
  };

  beforeEach(async () => {
    localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});

    expect(localStream.getAudioTracks().length).to.equal(1);
    expect(localStream.getVideoTracks().length).to.equal(1);
  });

  afterEach(() => {
    testConnections.forEach((testConnection) => {
      testConnection.mc.close();
    });
  });

  it('audio only (both ways)', async () => {
    const audioTrack = localStream.getAudioTracks()[0];

    createTestConnections({
      send: {
        audio: audioTrack,
      },
      receive: {audio: true, video: false, screenShareVideo: false},
    });

    await testConnections[0].mc.initiateOffer();

    await Promise.all(
      testConnections
        .map(({connectionEstablished, audioRemoteTrackAdded}) => [
          connectionEstablished,
          audioRemoteTrackAdded,
        ])
        .flat()
    );
  });

  it('audio and video both ways', async () => {
    const audioTrack = localStream.getAudioTracks()[0];
    const videoTrack = localStream.getVideoTracks()[0];

    createTestConnections({
      send: {
        audio: audioTrack,
        video: videoTrack,
      },
      receive: {audio: true, video: true, screenShareVideo: false},
    });

    await testConnections[0].mc.initiateOffer();

    await Promise.all(
      testConnections
        .map(({connectionEstablished, audioRemoteTrackAdded, videoRemoteTrackAdded}) => [
          connectionEstablished,
          audioRemoteTrackAdded,
          videoRemoteTrackAdded,
        ])
        .flat()
    );
  });

  it('updateLocalTracks() should add an audio track (outgoing call)', async () => {
    // start with no audio or video tracks
    createTestConnections({
      send: {},
      receive: {audio: true, video: true, screenShareVideo: true},
    });

    await testConnections[0].mc.initiateOffer();

    await Promise.all(
      testConnections.map(({connectionEstablished}) => [connectionEstablished]).flat()
    );

    // add audio track to the first connection (that's the outgoing one)
    testConnections[0].mc.updateSendOptions({audio: localStream.getAudioTracks()[0]});

    // we should receive that track in the second connection
    await testConnections[1].audioRemoteTrackAdded;
  });

  it('updateLocalTracks() should add an audio track (incoming call)', async () => {
    // start with no audio or video tracks
    createTestConnections({
      send: {},
      receive: {audio: true, video: true, screenShareVideo: true},
    });

    await testConnections[0].mc.initiateOffer();

    await Promise.all(
      testConnections.map(({connectionEstablished}) => [connectionEstablished]).flat()
    );

    // add audio track to the second connection (the incoming one)
    testConnections[1].mc.updateSendOptions({audio: localStream.getAudioTracks()[0]});

    // we should receive that track in the first connection
    await testConnections[0].audioRemoteTrackAdded;
  });
});
