import {CustomConsole, LogType, LogMessage} from '@jest/console';
import {StateValue} from 'xstate';
import {Roap} from './roap';
import {Event, ErrorType, RoapMessage} from './eventTypes';
import {createControlledPromise, IControlledPromise, flushPromises} from './testUtils';
import logger from '../Logger';

describe('Roap', () => {
  let previousConsole: Console;
  let roap: Roap;

  const FAKE_LOCAL_SDP = 'some local SDP';
  const MUNGED_LOCAL_SDP = 'munged local SDP';
  const FAKE_REMOTE_SDP = 'some remote SDP';

  let peerConnection: RTCPeerConnection;
  let processLocalSdp: jest.Mock<Promise<{sdp: string}>, []>;

  const log = (action: string, description: string) =>
    logger.info({ID: 'Test', mediaType: 'Test', action, description});

  const resetPeerConnectionMocks = () => {
    (peerConnection.createOffer as jest.Mock).mockClear();
    (peerConnection.setLocalDescription as jest.Mock).mockClear();
    (peerConnection.setRemoteDescription as jest.Mock).mockClear();
    // whenever we set local description we also call the processLocalSdp callback,
    // so we need to reset it here too
    processLocalSdp.mockClear();
  };

  let receivedRoapMessages: Array<RoapMessage>;
  let expectedNextRoap: {
    message?: RoapMessage;
    resolve?: () => void;
    reject?: (e: unknown) => void;
  };

  let roapStateMachineState: string;
  let waitingForState: {
    state?: string;
    resolve?: () => void;
  };

  beforeAll(() => {
    previousConsole = global.console;
    // make the console logs shown by jest more concise (1 line instead of 5 for each console.log call)
    global.console = new CustomConsole(
      process.stdout,
      process.stderr,
      (_type: LogType, message: LogMessage) => message
    );
  });

  afterAll(() => {
    global.console = previousConsole;
  });

  beforeEach(() => {
    // reset all the variables, so that each test is independent from previous test runs
    receivedRoapMessages = [];
    expectedNextRoap = {};
    roapStateMachineState = '';
    waitingForState = {};

    // also reset the mock, because it is changed in some of the tests
    peerConnection = {
      createOffer: jest.fn().mockResolvedValue({type: 'offer', sdp: FAKE_LOCAL_SDP}),
      setLocalDescription: jest.fn().mockResolvedValue({}),
      setRemoteDescription: jest.fn().mockResolvedValue({}),
      createAnswer: jest.fn().mockResolvedValue({type: 'answer', sdp: FAKE_LOCAL_SDP}),
      iceGatheringState: 'complete',
      localDescription: {sdp: FAKE_LOCAL_SDP},
    } as unknown as RTCPeerConnection;

    processLocalSdp = jest.fn().mockResolvedValue({sdp: MUNGED_LOCAL_SDP});

    // create the roap instance and setup listeners
    roap = new Roap(peerConnection, processLocalSdp);
    roap.on(Event.ROAP_MESSAGE_TO_SEND, ({roapMessage}) => {
      log('Event.ROAP_MESSAGE_TO_SEND', `${JSON.stringify(roapMessage)}`);

      if (expectedNextRoap.resolve && expectedNextRoap.reject) {
        try {
          // we were already waiting for a message, so check if it matches what we're waiting for
          expect(roapMessage).toEqual(expectedNextRoap.message);
          log('waitForRoapMessage()', 'expected roapMessage received');
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

    roap.getStateMachine().onTransition((state: {value: StateValue}) => {
      roapStateMachineState = state.value as string;

      if (waitingForState.resolve && state.value === waitingForState.state) {
        waitingForState.resolve();
        waitingForState.resolve = undefined;
        waitingForState.state = undefined;
      }
    });

    // eslint-disable-next-line no-console
    console.log(`======================== TEST: ${expect.getState().currentTestName}`);
  });

  const waitForRoapMessage = (expectedMessage: RoapMessage): Promise<void> => {
    log('waitForRoapMessage()', `test expecting roapMessage ${JSON.stringify(expectedMessage)}`);

    return new Promise((resolve, reject) => {
      if (receivedRoapMessages.length > 0) {
        // we've already received some messages, so check the first one
        expect(receivedRoapMessages[0]).toEqual(expectedMessage);

        // it matched the expected one so we can remove it from receivedRoapMessages
        receivedRoapMessages.shift();
        log('waitForRoapMessage()', 'expected roapMessage has already been received');
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
      log('waitForState()', `state already matching expectedState ${expectedState}`);

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      log('waitForState()', `waiting for roap state machine to reach ${expectedState}`);
      waitingForState.state = expectedState;
      waitingForState.resolve = resolve;
    });
  };

  // goes through the flow from the point where we receive a remote answer
  const checkRemoteAnswerOkFlow = async (seq: number) => {
    roap.roapMessageReceived({
      messageType: 'ANSWER',
      seq,
      sdp: FAKE_REMOTE_SDP,
    });

    await waitForRoapMessage({
      messageType: 'OK',
      seq,
    });

    await waitForState('idle');
  };

  // goes through a flow that starts with a local OFFER being created,
  // followed by remote ANSWER simulated, then local OK generated
  // and finally state machine going to idle state
  const checkLocalOfferAnswerOkFlow = async (seq: number) => {
    await waitForRoapMessage({
      messageType: 'OFFER',
      seq,
      sdp: MUNGED_LOCAL_SDP,
      tieBreaker: 0xfffffffe,
    });

    // now proceed with the rest of the flow
    await checkRemoteAnswerOkFlow(seq);
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

  /** verifies that the correct calls were made to the browser
   *  to trigger an SDP answer
   */
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
          errorType: ErrorType.CONFLICT,
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
          errorType: ErrorType.CONFLICT,
          seq: 1,
        });
      }

      // now proceed with the rest of the flow (backend should still send us an answer because we won the conflict)
      await checkRemoteAnswerOkFlow(1);
    };

    it('works correctly when remote OFFER arrives AFTER our offer got created', async () =>
      runTest('OFFER'));
    it('works correctly when remote OFFER_REQUEST arrives AFTER our offer got created', async () =>
      runTest('OFFER_REQUEST'));
    it('works correctly when remote OFFER arrives BEFORE our offer got created', async () =>
      runTest('OFFER', true));
    it('works correctly when remote OFFER_REQUEST arrives BEFORE our offer got created', async () =>
      runTest('OFFER_REQUEST', true));

    describe('queueing when initiateOffer() is called', () => {
      const testInitiateOffer = async (
        whenToCallInitiateOffer: 'WHILE_PROCESSING_REMOTE_OFFER' | 'WHILE_WAITING_FOR_OK'
      ) => {
        const remoteOfferMessageType = 'OFFER';
        const setRemoteDescriptionPromise = createControlledPromise();

        peerConnection.setRemoteDescription = jest
          .fn()
          .mockReturnValue(setRemoteDescriptionPromise);

        // simulate an offer/offer request from the backend
        roap.roapMessageReceived({
          messageType: remoteOfferMessageType,
          seq: 1,
          sdp: remoteOfferMessageType === 'OFFER' ? FAKE_REMOTE_SDP : undefined,
          tieBreaker: 0x100,
        });

        if (whenToCallInitiateOffer === 'WHILE_PROCESSING_REMOTE_OFFER') {
          // start an offer from our side
          // (it should be queued and the processing of remote offer should just continue)
          roap.initiateOffer();
        }

        setRemoteDescriptionPromise.resolve({});

        await waitForRoapMessage({
          messageType: 'ANSWER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
        });

        expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP, FAKE_LOCAL_SDP);

        if (whenToCallInitiateOffer === 'WHILE_WAITING_FOR_OK') {
          // start an offer from our side
          // (it should be queued and processed after we receive OK for the last answer we've sent)
          roap.initiateOffer();
        }

        // simulate ok coming from the backend
        roap.roapMessageReceived({
          messageType: 'OK',
          seq: 1,
        });

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await checkLocalOfferAnswerOkFlow(2);
      };

      it('queues another SDP exchange if initiateOffer() is called after receiving remote offer', async () => {
        testInitiateOffer('WHILE_PROCESSING_REMOTE_OFFER');
      });
      it('queues another SDP exchange if initiateOffer() is when waiting for OK message', async () => {
        testInitiateOffer('WHILE_WAITING_FOR_OK');
      });

      it('restarts SDP exchange if initiateOffer() is called while creating a local offer', async () => {
        const setLocalDescriptionPromise = createControlledPromise();

        peerConnection.setLocalDescription = jest.fn().mockReturnValue(setLocalDescriptionPromise);

        roap.initiateOffer();

        await flushPromises();

        // call it again, while we're already setting a local offer
        roap.initiateOffer();

        // now let setting of local offer to complete
        setLocalDescriptionPromise.resolve({});

        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        // all the browser APIs related to local SDP should have been called twice because of the second initiateOffer()
        expect(peerConnection.createOffer).toBeCalledTimes(2);
        expect(peerConnection.setLocalDescription).toBeCalledTimes(2);
        expect(processLocalSdp).toBeCalledTimes(2);

        // simulate answer coming from the backend
        await checkRemoteAnswerOkFlow(1);
      });

      it('restarts SDP exchange if initiateOffer() is called while handling OFFER_REQUEST message', async () => {
        const setLocalDescriptionPromise = createControlledPromise();

        peerConnection.setLocalDescription = jest.fn().mockReturnValue(setLocalDescriptionPromise);

        // simulate offer requst coming from the backend
        roap.roapMessageReceived({
          messageType: 'OFFER_REQUEST',
          seq: 1,
        });

        await flushPromises();

        // call initiateOffer() while we're already setting a local offer
        roap.initiateOffer();

        // now let setting of local offer to complete
        setLocalDescriptionPromise.resolve({});

        await waitForRoapMessage({
          messageType: 'OFFER_RESPONSE',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
        });

        // all the browser APIs related to local SDP should have been called twice because of the second initiateOffer()
        expect(peerConnection.createOffer).toBeCalledTimes(2);
        expect(peerConnection.setLocalDescription).toBeCalledTimes(2);
        expect(processLocalSdp).toBeCalledTimes(2);

        // simulate answer coming from the backend
        await checkRemoteAnswerOkFlow(1);
      });

      it('queues another SDP exchange if initiateOffer() is called while waiting for answer', async () => {
        roap.initiateOffer();

        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        // call initiateOffer() again, before we got the answer
        roap.initiateOffer();

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

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await checkLocalOfferAnswerOkFlow(2);
      });

      it('queues another SDP exchange if initiateOffer() is called while processing an answer', async () => {
        const setRemoteDescriptionPromise = createControlledPromise();

        peerConnection.setRemoteDescription = jest
          .fn()
          .mockReturnValue(setRemoteDescriptionPromise);

        roap.initiateOffer();

        await waitForRoapMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        // simulate answer coming from the backend
        roap.roapMessageReceived({
          messageType: 'ANSWER',
          seq: 1,
          sdp: FAKE_REMOTE_SDP,
        });

        // call initiateOffer() again, before the remote answer was fully processed
        roap.initiateOffer();

        // now let the answer processing finish
        setRemoteDescriptionPromise.resolve({});

        await waitForRoapMessage({
          messageType: 'OK',
          seq: 1,
        });

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await checkLocalOfferAnswerOkFlow(2);
      });
    });
  });

  describe('Error messages', () => {
    let roapFailurePromise: IControlledPromise<unknown>;

    beforeEach(() => {
      roapFailurePromise = createControlledPromise();

      roap.on(Event.ROAP_FAILURE, () => {
        log('Event.ROAP_FAILURE', 'got ROAP_FAILURE event');
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
        errorType: ErrorType.DOUBLECONFLICT,
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
      await checkRemoteAnswerOkFlow(2);
    });

    const retryableErrors = [
      ErrorType.DOUBLECONFLICT,
      ErrorType.INVALID_STATE,
      ErrorType.OUT_OF_ORDER,
      ErrorType.RETRY,
    ];

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

        // simulate error from the backend instead of the answer
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

        // simulate a second error from the backend instead of the answer
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

        // simulate a third error from the backend instead of the answer
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
        errorType: ErrorType.CONFLICT,
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
        errorType: ErrorType.FAILED,
        seq: 1,
      });

      await waitForState('browserError');
      await roapFailurePromise;
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
        errorType: ErrorType.FAILED,
        seq: 1,
      });

      await waitForState('browserError');
      await roapFailurePromise;
    });

    it('sends FAILED error if browser fails to create a local SDP offer', async () => {
      processLocalSdp.mockRejectedValue(new Error('local SDP rejected'));

      roap.initiateOffer();

      await waitForState('browserError');
      await roapFailurePromise;
    });
  });

  describe('Unexpected messages', () => {
    /** Sends a message and expects INVALID_STATE error in response
     *  (does this twice: first with the correct seq, second with a higher seq)
     */
    const checkInvalidStateError = async (
      messageType: 'ANSWER' | 'OK' | 'OFFER' | 'OFFER_REQUEST',
      seq: number
    ) => {
      // simulate message arriving with the correct seq
      roap.roapMessageReceived({messageType, seq, sdp: FAKE_REMOTE_SDP});

      await waitForRoapMessage({messageType: 'ERROR', errorType: ErrorType.INVALID_STATE, seq});

      // and with a higher seq
      roap.roapMessageReceived({messageType, seq: seq + 10, sdp: FAKE_REMOTE_SDP});

      await waitForRoapMessage({
        messageType: 'ERROR',
        errorType: ErrorType.INVALID_STATE,
        seq: seq + 10,
      });
    };

    it('sends INVALID_STATE error when receiving messages in wrong state (client initiates the offer)', async () => {
      const setLocalDescriptionPromise = createControlledPromise();
      const setRemoteDescriptionPromise = createControlledPromise();

      peerConnection.setLocalDescription = jest.fn().mockReturnValue(setLocalDescriptionPromise);
      peerConnection.setRemoteDescription = jest.fn().mockReturnValue(setRemoteDescriptionPromise);

      // first check in idle state, before we do anything
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OK', 1);

      roap.initiateOffer();

      await flushPromises();

      // now check again while we're creating the local offer
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OK', 1);

      // now let setting of local offer to complete
      setLocalDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

      // check that we send error for OK arriving while we're waiting for an ANSWER
      await checkInvalidStateError('OK', 1);

      // simulate answer coming from the backend
      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      // check that we send error for unexpected messages while we're processing the ANSWER
      await checkInvalidStateError('OFFER', 1);
      await checkInvalidStateError('OFFER_REQUEST', 1);
      await checkInvalidStateError('OK', 1);

      // now let the answer processing finish
      setRemoteDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'OK',
        seq: 1,
      });

      // we should be back to idle now (with increased seq), so ANSWER and OK should trigger "invalid state" error again
      await checkInvalidStateError('ANSWER', 2);
      await checkInvalidStateError('OK', 2);

      await waitForState('idle');
    });

    it('sends INVALID_STATE error when receiving messages in wrong state (server initiates the offer)', async () => {
      const setRemoteDescriptionPromise = createControlledPromise();

      peerConnection.setRemoteDescription = jest.fn().mockReturnValue(setRemoteDescriptionPromise);

      // simulate offer coming from the backend
      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
        tieBreaker: 0x100,
      });

      // check that we send error for unexpected messages while we're processing the remote OFFER
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OK', 1);
      await checkInvalidStateError('OFFER_REQUEST', 1);

      // now let the offer processing finish
      setRemoteDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP, FAKE_LOCAL_SDP);

      // check that we send error for unexpected messages while we're waiting for OK from the server
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OFFER_REQUEST', 1);

      // simulate ok coming from the backend
      roap.roapMessageReceived({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    });
  });

  describe('Duplicate messages from server', () => {
    /** Sends a message and expects INVALID_STATE error in response
     *  (does this twice: first with the correct seq, second with a higher seq)
     */
    const checkDuplicateIgnored = async (
      messageType: 'ANSWER' | 'OFFER' | 'OFFER_REQUEST',
      seq: number
    ) => {
      const stateBeforeMessageReceived = roapStateMachineState;

      // simulate a message arriving
      roap.roapMessageReceived({messageType, seq, sdp: FAKE_REMOTE_SDP});

      await flushPromises();

      // there should be no new notification as the message was ignored
      expect(receivedRoapMessages.length).toEqual(0);
      // and the state should not have changed either
      expect(stateBeforeMessageReceived).toEqual(roapStateMachineState);
    };

    it('ignores duplicate ANSWER from the server', async () => {
      const setRemoteDescriptionPromise = createControlledPromise();

      peerConnection.setRemoteDescription = jest.fn().mockReturnValue(setRemoteDescriptionPromise);

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

      // check that a second one is ignored
      await checkDuplicateIgnored('ANSWER', 1);

      // now let the answer processing finish
      setRemoteDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'OK',
        seq: 1,
      });

      await checkDuplicateIgnored('ANSWER', 1);

      await waitForState('idle');

      await checkDuplicateIgnored('ANSWER', 1);
    });

    it('ignores duplicate OFFER from the server', async () => {
      const setRemoteDescriptionPromise = createControlledPromise();

      peerConnection.setRemoteDescription = jest.fn().mockReturnValue(setRemoteDescriptionPromise);

      // simulate offer coming from the backend
      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
        tieBreaker: 0x100,
      });

      // check that a second one is ignored
      await checkDuplicateIgnored('OFFER', 1);

      // now let the offer processing finish
      setRemoteDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP, FAKE_LOCAL_SDP);

      await checkDuplicateIgnored('OFFER', 1);

      // simulate ok coming from the backend
      roap.roapMessageReceived({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    });

    it('ignores duplicate OFFER_REQUEST from the server', async () => {
      const setLocalDescriptionPromise = createControlledPromise();

      peerConnection.setLocalDescription = jest.fn().mockReturnValue(setLocalDescriptionPromise);

      roap.roapMessageReceived({
        messageType: 'OFFER_REQUEST',
        seq: 1,
      });

      // check that a second one is ignored
      await checkDuplicateIgnored('OFFER_REQUEST', 1);

      setLocalDescriptionPromise.resolve({});

      await waitForRoapMessage({
        messageType: 'OFFER_RESPONSE',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalOfferToBeCreated(FAKE_LOCAL_SDP);

      await checkDuplicateIgnored('OFFER_REQUEST', 1);

      // let the flow finish
      await checkRemoteAnswerOkFlow(1);
    });
  });
});
