import {Roap} from './roap';
import {Event, RoapMessage} from './eventTypes';
import {createControlledPromise} from './testUtils';

describe('Roap', () => {
  let roap: Roap;

  const FAKE_LOCAL_SDP = 'some local SDP';
  const MUNGED_LOCAL_SDP = 'munged local SDP';
  const FAKE_REMOTE_SDP = 'some remote SDP';

  const peerConnection = {
    createOffer: jest.fn().mockResolvedValue({type: 'offer', sdp: FAKE_LOCAL_SDP}),
    setLocalDescription: jest.fn().mockResolvedValue({}),
    setRemoteDescription: jest.fn().mockResolvedValue({}),
    createAnswer: jest.fn().mockResolvedValue({type: 'answer', sdp: FAKE_LOCAL_SDP}),
    iceGatheringState: 'complete',
    localDescription: {sdp: FAKE_LOCAL_SDP},
  } as unknown as RTCPeerConnection;

  const processLocalSdp = jest.fn().mockResolvedValue({sdp: MUNGED_LOCAL_SDP});

  const resetPeerConnectionMocks = () => {
    (peerConnection.createOffer as jest.Mock).mockClear();
    (peerConnection.setLocalDescription as jest.Mock).mockClear();
    (peerConnection.setRemoteDescription as jest.Mock).mockClear();
    // whenever we set local description we also call the processLocalSdp callback,
    // so we need to reset it here too
    processLocalSdp.mockClear();
  };

  const {log} = console;

  const receivedRoapMessages: Array<RoapMessage> = [];
  const expectedNextRoap: {
    message?: RoapMessage;
    resolve?: () => void;
    reject?: (e: unknown) => void;
  } = {};

  let roapStateMachineState: string;
  const waitingForState: {
    state?: string;
    resolve?: () => void;
  } = {};

  beforeEach(() => {
    roap = new Roap(peerConnection, processLocalSdp);
    roap.on(Event.ROAP_MESSAGE_TO_SEND, ({roapMessage}) => {
      log(`Event.ROAP_MESSAGE_TO_SEND: ${JSON.stringify(roapMessage)}`);

      if (expectedNextRoap.resolve && expectedNextRoap.reject) {
        try {
          // we were already waiting for a message, so check if it matches what we're waiting for
          expect(roapMessage).toEqual(expectedNextRoap.message);
          log('waitForRoapMessage(): expected roapMessage received');
          expectedNextRoap.resolve();
        } catch (e) {
          expectedNextRoap.reject(e);
        }
        expectedNextRoap.resolve = undefined;
        expectedNextRoap.reject = undefined;
      } else {
        receivedRoapMessages.push(roapMessage);
      }
    });

    roap.getStateMachine().onTransition((state: {value: string}) => {
      roapStateMachineState = state.value;

      if (waitingForState.resolve && state.value === waitingForState.state) {
        waitingForState.resolve();
        waitingForState.resolve = undefined;
        waitingForState.state = undefined;
      }
    });
  });

  const waitForRoapMessage = (expectedMessage: RoapMessage): Promise<void> => {
    log(`waitForRoapMessage(): test expecting roapMessage ${JSON.stringify(expectedMessage)}`);

    return new Promise((resolve, reject) => {
      if (receivedRoapMessages.length > 0) {
        // we've already received some messages, so check the first one
        expect(receivedRoapMessages[0]).toEqual(expectedMessage);

        // it matched the expected one so we can remove it from receivedRoapMessages
        receivedRoapMessages.shift();
        log('waitForRoapMessage(): expected roapMessage has already been received');
        resolve();
      } else {
        // we will wait for the message...
        expectedNextRoap.message = expectedMessage;
        expectedNextRoap.resolve = resolve;
        expectedNextRoap.reject = reject;
      }
    });
  };

  const waitForState = (expectedState: string): Promise<void> => {
    if (roapStateMachineState === expectedState) {
      log(`state already matching expectedState ${expectedState}`);

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      log(`waiting for roap state machine to reach ${expectedState}`);
      waitingForState.state = expectedState;
      waitingForState.resolve = resolve;
    });
  };

  /** verifies that the correct calls were made to the browser
   *  to trigger a new SDP offer
   */
  const expectLocalOfferToBeCreated = (sdp: string) => {
    expect(peerConnection.createOffer).toBeCalledOnceWith();
    expect(peerConnection.setLocalDescription).toBeCalledOnceWith({
      type: 'offer',
      sdp,
    });
    expect(processLocalSdp).toBeCalledOnceWith();
  };

  const expectLocalAnswerToBeCreated = (remoteOffer: string, localAnswer: string) => {
    expect(peerConnection.setRemoteDescription).toBeCalledOnceWith({
      type: 'offer',
      sdp: remoteOffer,
    });

    expect(peerConnection.createAnswer).toBeCalledOnceWith();
    expect(peerConnection.setLocalDescription).toBeCalledOnceWith({
      type: 'answer',
      sdp: localAnswer,
    });
    expect(processLocalSdp).toBeCalledOnceWith();
  };

  it('handles OFFER_REQUEST correctly', async () => {
    const FAKE_SEQ = 10;

    // simulate offer requst coming from the backend
    roap.roapMessageReceived({
      messageType: 'OFFER_REQUEST',
      seq: FAKE_SEQ,
    });

    await waitForRoapMessage({
      messageType: 'OFFER_RESPONSE',
      seq: FAKE_SEQ,
      sdp: MUNGED_LOCAL_SDP,
    });

    expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

    // simulate answer from the backend
    roap.roapMessageReceived({
      messageType: 'ANSWER',
      seq: FAKE_SEQ,
      sdp: FAKE_REMOTE_SDP,
    });

    await waitForRoapMessage({
      messageType: 'OK',
      seq: FAKE_SEQ,
    });

    expect(peerConnection.setRemoteDescription).toBeCalledOnceWith({
      type: 'answer',
      sdp: FAKE_REMOTE_SDP,
    });

    await waitForState('idle');
  });

  it('works correctly when client initiates the offer', async () => {
    roap.initiateOffer();

    await waitForRoapMessage({
      messageType: 'OFFER',
      seq: 1,
      sdp: MUNGED_LOCAL_SDP,
      tieBreaker: 0xfffffffe,
    });

    expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

    // simulate answer coming from the backend
    roap.roapMessageReceived({
      messageType: 'ANSWER',
      seq: 1,
      sdp: FAKE_REMOTE_SDP,
    });

    await waitForRoapMessage({
      messageType: 'OK',
      seq: 1,
    });

    await waitForState('idle');
  });

  it('works correctly when backend initiates the offer', async () => {
    // simulate offer coming from the backend
    roap.roapMessageReceived({
      messageType: 'OFFER',
      seq: 1,
      sdp: FAKE_REMOTE_SDP,
      tieBreaker: 0x100,
    });

    await waitForRoapMessage({
      messageType: 'ANSWER',
      seq: 1,
      sdp: MUNGED_LOCAL_SDP,
    });

    expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP, FAKE_LOCAL_SDP);

    // simulate ok coming from the backend
    roap.roapMessageReceived({
      messageType: 'OK',
      seq: 1,
    });

    await waitForState('idle');
  });

  describe('glare handling', () => {
    const runTest = async (
      remoteOfferMessageType: 'OFFER' | 'OFFER_REQUEST',
      remoteOfferBeforeOurs = false
    ) => {
      const createofferPromise = createControlledPromise();

      if (remoteOfferBeforeOurs) {
        peerConnection.createOffer = jest.fn().mockReturnValue(createofferPromise);
      }

      // start an offer from our side
      roap.initiateOffer();

      if (remoteOfferBeforeOurs) {
        // simulate an offer/offer request from the backend before createOffer() resolves
        roap.roapMessageReceived({
          messageType: remoteOfferMessageType,
          seq: 1,
          sdp: remoteOfferMessageType === 'OFFER' ? FAKE_REMOTE_SDP : undefined,
          tieBreaker: 0x100,
        });

        createofferPromise.resolve({type: 'offer', sdp: FAKE_LOCAL_SDP});

        // glare has happened - this should trigger an ERROR CONFLICT
        await waitForRoapMessage({
          messageType: 'ERROR',
          errorType: 'CONFLICT',
          seq: 1,
        });

        // eventually our offer is ready to be sent out
        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });
      } else {
        // wait for our local offer to be created
        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        // simulate an offer/offer request from the backend
        roap.roapMessageReceived({
          messageType: remoteOfferMessageType,
          seq: 1,
          sdp: remoteOfferMessageType === 'OFFER' ? FAKE_REMOTE_SDP : undefined,
          tieBreaker: 0x100,
        });

        // glare has happened - this should trigger an ERROR CONFLICT
        await waitForRoapMessage({
          messageType: 'ERROR',
          errorType: 'CONFLICT',
          seq: 1,
        });
      }

      // now proceed with the rest of the flow (backend should still send us an answer because we won the conflict)
      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      await waitForRoapMessage({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    };

    it('works correctly when remote OFFER arrives AFTER our offer got created', async () =>
      runTest('OFFER'));
    it('works correctly when remote OFFER_REQUEST arrives AFTER our offer got created', async () =>
      runTest('OFFER_REQUEST'));
    it('works correctly when remote OFFER arrives BEFORE our offer got created', async () =>
      runTest('OFFER', true));
    it('works correctly when remote OFFER_REQUEST arrives BEFORE our offer got created', async () =>
      runTest('OFFER_REQUEST', true));
  });

  describe('Error messages', () => {
    const roapFailurePromise = createControlledPromise();

    beforeEach(() => {
      roap.on(Event.ROAP_FAILURE, () => {
        log('got ROAP_FAILURE event');
        roapFailurePromise.resolve({});
      });
    });

    it('DOUBLECONFLICT handled correctly when received after initiating an offer', async () => {
      roap.initiateOffer();

      await waitForRoapMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

      resetPeerConnectionMocks();

      // simulate DOUBLECONFLICT from the backend
      roap.roapMessageReceived({
        messageType: 'ERROR',
        errorType: 'DOUBLECONFLICT',
        seq: 1,
      });

      // it should trigger a new offer with increased seq and same sdp and tieBreaker
      await waitForRoapMessage({
        messageType: 'OFFER',
        seq: 2,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

      // check the rest of the sequence succeeds
      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 2,
        sdp: FAKE_REMOTE_SDP,
      });

      await waitForRoapMessage({
        messageType: 'OK',
        seq: 2,
      });

      await waitForState('idle');
    });

    const retryableErrors = ['DOUBLECONFLICT', 'INVALID_STATE', 'OUT_OF_ORDER', 'RETRY'];

    retryableErrors.map((errorType) =>
      it(`${errorType} triggers no more than 2 offer retries`, async () => {
        roap.initiateOffer();

        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);
        resetPeerConnectionMocks();

        // simulate error from the backend
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 1,
        });

        // it should trigger a new offer with increased seq and same sdp and tieBreaker
        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 2,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);
        resetPeerConnectionMocks();

        // simulate a second error from the backend
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 2,
        });

        // it should trigger a second retry of the offer with increased seq and same sdp and tieBreaker
        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 3,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);
        resetPeerConnectionMocks();

        // simulate a third error from the backend
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 3,
        });

        // this time the state machine should give up and report a failure
        await waitForState('remoteError');
        await roapFailurePromise;
      })
    );

    it('fails if unrecoverable error is received while waiting for SDP answer', async () => {
      roap.initiateOffer();

      await waitForRoapMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      // simulate unrecoverable error from the backend
      roap.roapMessageReceived({
        messageType: 'ERROR',
        errorType: 'CONFLICT',
        seq: 1,
      });

      // this time the state machine should give up and report a failure
      await waitForState('remoteError');
      await roapFailurePromise;
    });

    it('fails if error is received while waiting for OK message', async () => {
      // simulate offer coming from the backend
      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
        tieBreaker: 0x100,
      });

      await waitForRoapMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      // simulate error coming coming from the backend instead of OK
      roap.roapMessageReceived({
        messageType: 'ERROR',
        seq: 1,
      });

      await waitForState('remoteError');
      await roapFailurePromise;
    });

    it('sends FAILED error if browser rejects the remote SDP offer', async () => {
      peerConnection.setRemoteDescription = jest
        .fn()
        .mockRejectedValue(new Error('fake browser failure'));

      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      await waitForRoapMessage({
        messageType: 'ERROR',
        errorType: 'FAILED',
        seq: 1,
      });
    });

    it('sends FAILED error if browser rejects the remote SDP answer', async () => {
      peerConnection.setRemoteDescription = jest
        .fn()
        .mockRejectedValue(new Error('fake browser failure'));

      roap.initiateOffer();

      await waitForRoapMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      await waitForRoapMessage({
        messageType: 'ERROR',
        errorType: 'FAILED',
        seq: 1,
      });
    });
  });
});
