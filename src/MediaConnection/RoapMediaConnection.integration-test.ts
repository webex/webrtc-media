/* eslint-disable no-console */
import {expect} from 'chai';
import {RemoteTrackType} from './eventTypes';

import {
  ConnectionState,
  ConnectionStateChangedEvent,
  Event,
  RoapMediaConnection,
  RemoteTrackAddedEvent,
  RoapMessage,
  RoapMessageEvent,
} from './index';

import {createControlledPromise, IControlledPromise, EventListener} from './testUtils';

describe('2 RoapMediaConnections connected to each other', () => {
  let localStream: MediaStream;
  let lastRoapOfferMessage: RoapMessage | undefined;

  let testConnections: Array<{
    mc: RoapMediaConnection;
    debug: string;
    connectionEstablished: IControlledPromise<unknown>;
    audioRemoteTrackAdded: IControlledPromise<unknown>;
    videoRemoteTrackAdded: IControlledPromise<unknown>;
  }>;

  const setupConnectionEventHandlers = () => {
    // eslint-disable-next-line arrow-body-style
    const getOtherConnection = (connection: RoapMediaConnection): RoapMediaConnection => {
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
              lastRoapOfferMessage = message;

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

    const createTestConnection = (debug: string) => {
      return {
        mc: new RoapMediaConnection(
          {
            iceServers: [],
            skipInactiveTransceivers: false,
            sdpMunging: {convertPort9to0: false},
            ...configOverrides,
          },
          {send, receive},
          debug
        ),
        debug,
        connectionEstablished: createControlledPromise(),
        audioRemoteTrackAdded: createControlledPromise(),
        videoRemoteTrackAdded: createControlledPromise(),
      };
    };

    testConnections = [createTestConnection('mc1'), createTestConnection('mc2')];

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
    expect(lastRoapOfferMessage?.sdp?.match(/^m=audio/gm)?.length).to.equal(1);
    expect(lastRoapOfferMessage?.sdp?.match(/^m=video/gm)?.length).to.equal(2);
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
    expect(lastRoapOfferMessage?.sdp?.match(/^m=audio/gm)?.length).to.equal(1);
    expect(lastRoapOfferMessage?.sdp?.match(/^m=video/gm)).to.equal(null);
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

  describe('reconnect() method', () => {
    let connectionStateListener: EventListener;

    const getIceDetails = (sdp?: string) => {
      return {
        ufrag: sdp?.match(/^a=ice-ufrag:.*$/gm),
        pwd: sdp?.match(/^a=ice-pwd:.*$/gm),
      };
    };

    interface IceDetails {
      ufrag?: Array<string> | null;
      pwd?: Array<string> | null;
    }
    const checkIceDetailsChanged = (before: IceDetails, after: IceDetails) => {
      // check the amount of ice ufrags and passwords hasn't changed before and after
      expect(before.ufrag?.length).to.equal(after.ufrag?.length);
      expect(before.pwd?.length).to.equal(after.pwd?.length);

      // also check that we have same amount of ufrags as passwords - this then allows us to check them all in 1 loop
      expect(before.ufrag?.length).to.equal(before.pwd?.length);

      if (before.ufrag && after.ufrag && before.pwd && after.pwd) {
        for (let i = 0; i < before.ufrag?.length; i += 1) {
          expect(before.ufrag[i]).not.to.equal(after.ufrag[i]);
          expect(before.pwd[i]).not.to.equal(after.pwd[i]);
        }
      }
    };

    beforeEach(async () => {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      // create the test connections and wait for them to be fully established
      createTestConnections({
        send: {
          audio: audioTrack,
          video: videoTrack,
        },
        receive: {audio: true, video: true, screenShareVideo: true},
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

      connectionStateListener = new EventListener(
        testConnections[0].mc,
        Event.CONNECTION_STATE_CHANGED,
        (action, message) => console.log(`TEST: ${action}: ${message}`),
        {useChaiExpect: true}
      );
    });

    it('starts a new ICE connection with increased Roap seq', async () => {
      const before = {
        ice: getIceDetails(lastRoapOfferMessage?.sdp),
        seq: lastRoapOfferMessage?.seq || 0,
      };

      // now trigger a reconnection
      console.log('TEST: triggering reconnection...');
      await testConnections[0].mc.reconnect();

      await connectionStateListener.waitForEvent({state: ConnectionState.CONNECTING});
      await connectionStateListener.waitForEvent({state: ConnectionState.CONNECTED});

      const after = {
        ice: getIceDetails(lastRoapOfferMessage?.sdp),
        seq: lastRoapOfferMessage?.seq || 0,
      };

      // check that Roap seq has continued and has not been reset
      expect(before.seq).lessThan(after.seq);

      // verify that a new ICE connection has been established (ICE username and password changed)
      checkIceDetailsChanged(before.ice, after.ice);
    });

    it('starts a new ICE connection with increased Roap seq (incoming call)', async () => {
      // now trigger a reconnection without automatic new offer creation (that's how it is for incoming calls)
      console.log('TEST: triggering reconnection...');
      await testConnections[0].mc.reconnect(false);

      // trigger the offer from the other side (the 2nd RoapMediaConnection)
      // we do this by calling reconnect() as calling initiateOffer() more than once is not allowed
      testConnections[1].mc.reconnect(true);

      await connectionStateListener.waitForEvent({state: ConnectionState.CONNECTING});
      await connectionStateListener.waitForEvent({state: ConnectionState.CONNECTED});
    });
  });
});

describe('1 RoapMediaConnection connected to a raw RTCPeerConnection', () => {
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

    const mc = new RoapMediaConnection(
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

    // setup the RoapMediaConnection callbacks
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

    console.log(`TEST: sending SDP offer to RoapMediaConnection: ${sdp}`);

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
