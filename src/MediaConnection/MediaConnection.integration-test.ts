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

import {createControlledPromise, IControlledPromise} from './testUtils';

describe('2 MediaConnections connected to each other', () => {
  let localStream: MediaStream;
  let createdSdpOffer: string | undefined;

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

              // store the offer so that tests can do some further checks on it
              createdSdpOffer = message.sdp;

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

  const createTestConnections = (
    options: {
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
    },
    configOverrides?: Record<string, unknown>
  ) => {
    const {send, receive} = options;

    testConnections = [
      {
        mc: new MediaConnection(
          {
            iceServers: [],
            skipInactiveTransceivers: false,
            sdpMunging: {convertPort9to0: false},
            ...configOverrides,
          },
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
          {iceServers: [], skipInactiveTransceivers: false, sdpMunging: {convertPort9to0: false}},
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
    testConnections?.forEach((testConnection) => {
      testConnection.mc.close();
    });

    localStream?.getTracks().forEach((track) => track.stop());
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

    // because the test connections are configured with skipInactiveTransceivers=false, we should still see 3 m-lines in the SDP
    expect(createdSdpOffer?.match(/^m=audio/gm)?.length).to.equal(1);
    expect(createdSdpOffer?.match(/^m=video/gm)?.length).to.equal(2);
  });

  it('audio only (both ways) with skipInactiveTransceivers=true', async () => {
    const audioTrack = localStream.getAudioTracks()[0];

    createTestConnections(
      {
        send: {
          audio: audioTrack,
        },
        receive: {audio: true, video: false, screenShareVideo: false},
      },
      {skipInactiveTransceivers: true}
    );

    await testConnections[0].mc.initiateOffer();

    await Promise.all(
      testConnections
        .map(({connectionEstablished, audioRemoteTrackAdded}) => [
          connectionEstablished,
          audioRemoteTrackAdded,
        ])
        .flat()
    );

    // only 1 audio m-line should have been put into the SDP offer
    expect(createdSdpOffer?.match(/^m=audio/gm)?.length).to.equal(1);
    expect(createdSdpOffer?.match(/^m=video/gm)).to.equal(null);
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

describe('1 MediaConnection connected to a raw RTCPeerConnection', () => {
  let localStream: MediaStream;

  beforeEach(async () => {
    localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});

    expect(localStream.getAudioTracks().length).to.equal(1);
    expect(localStream.getVideoTracks().length).to.equal(1);
  });

  afterEach(() => {
    localStream?.getTracks().forEach((track) => track.stop());
  });

  it('incoming audio call (with a single m-line)', async () => {
    let failMessage;
    const audioTrack = localStream.getAudioTracks()[0];

    const pc = new RTCPeerConnection();

    const mc = new MediaConnection(
      {iceServers: [], skipInactiveTransceivers: true, sdpMunging: {convertPort9to0: false}},
      {
        send: {
          audio: audioTrack,
        },
        receive: {
          audio: true,
          video: false,
          screenShareVideo: false,
        },
      },
      'mc'
    );

    const expectingRoapFromMc = {
      OFFER: false,
      OFFER_REQUEST: false,
      OFFER_RESPONSE: false,
      ANSWER: false,
      OK: false,
      ERROR: false,
    };

    // setup the MediaConnection callbacks
    const connectionEstablished = createControlledPromise();
    const audioRemoteTrackAdded = createControlledPromise();

    const roapOkSent = createControlledPromise();

    mc.on(Event.CONNECTION_STATE_CHANGED, (e: ConnectionStateChangedEvent) => {
      console.log('TEST: got CONNECTION_STATE_CHANGED:', e);
      if (e.state === ConnectionState.CONNECTED) {
        connectionEstablished.resolve({});
      }
    });

    mc.on(Event.REMOTE_TRACK_ADDED, (e: RemoteTrackAddedEvent) => {
      console.log('TEST: got REMOTE_TRACK_ADDED:', JSON.stringify(e));
      if (e.type === RemoteTrackType.AUDIO) {
        audioRemoteTrackAdded.resolve({});
      }
    });

    mc.on(Event.ROAP_MESSAGE_TO_SEND, async (e: RoapMessageEvent) => {
      console.log(
        `TEST: got ROAP_MESSAGE_TO_SEND: ${e.roapMessage.messageType}, ${e.roapMessage.sdp}`
      );

      if (expectingRoapFromMc[e.roapMessage.messageType]) {
        if (e.roapMessage.messageType === 'ANSWER') {
          await pc.setRemoteDescription({type: 'answer', sdp: e.roapMessage.sdp});
          mc.roapMessageReceived({messageType: 'OK', seq: e.roapMessage.seq});
        } else if (e.roapMessage.messageType === 'OFFER') {
          await pc.setRemoteDescription({type: 'offer', sdp: e.roapMessage.sdp});

          const answer = await pc.createAnswer();

          await pc.setLocalDescription(answer);
          mc.roapMessageReceived({messageType: 'ANSWER', seq: e.roapMessage.seq, sdp: answer.sdp});
        } else if (e.roapMessage.messageType === 'OK') {
          roapOkSent.resolve({});
        }
      } else {
        // fail() or expect() in the callback here doesn't cause the test to fail when
        // the condition is not met, so we have to store it in this helper variable
        failMessage = `unexpected roap message received: ${JSON.stringify(e.roapMessage)}`;
      }
    });

    // start the connection from pc to mc
    pc.addTransceiver(audioTrack);
    await pc.setLocalDescription();

    // to make it look more like the SDP from Mobius, remove the a=mid line
    // and the BUNDLE line (because Firefox doesn't allow SDP with BUNDLE referencing non-existent MIDs)
    const sdp = pc.localDescription?.sdp.replaceAll(/\r\n(a=mid:.*|a=group:BUNDLE.*)/g, '');

    console.log(`TEST: sending SDP offer to MediaConnection: ${sdp}`);

    expectingRoapFromMc.ANSWER = true;

    mc.roapMessageReceived({
      messageType: 'OFFER',
      seq: 1,
      sdp,
    });

    await Promise.all([connectionEstablished, audioRemoteTrackAdded]);
    expect(failMessage).to.equal(undefined);

    // now check also that updates work
    expectingRoapFromMc.OFFER = true;
    expectingRoapFromMc.ANSWER = false;
    expectingRoapFromMc.OK = true;

    mc.updateReceiveOptions({audio: false, video: false, screenShareVideo: false});

    await roapOkSent;
    expect(failMessage).to.equal(undefined);
  });
});
