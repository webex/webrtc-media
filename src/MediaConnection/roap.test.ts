import {CustomConsole, LogType, LogMessage} from '@jest/console';
import {StateValue} from 'xstate';
import {Roap} from './roap';
import {Event, ErrorType} from './eventTypes';
import {
  createControlledPromise,
  IControlledPromise,
  flushPromises,
  RoapListener,
} from './testUtils';
import logger from '../Logger';

describe('Roap', () => {
  let previousConsole: Console;
  let roap: Roap;

  const MUNGED_LOCAL_SDP = 'munged local SDP';
  const FAKE_REMOTE_SDP = 'some remote SDP';

  let createLocalOffer: jest.Mock<Promise<{sdp: string}>, []>;
  let handleRemoteOffer: jest.Mock<Promise<{sdp: string}>, [sdp: string | undefined]>;
  let handleRemoteAnswer: jest.Mock<Promise<void>, [sdp: string | undefined]>;

  const log = (action: string, description: string) =>
    logger.info({ID: 'Test', mediaType: 'Test', action, description});

  const resetCallbackMocks = () => {
    createLocalOffer.mockClear();
    handleRemoteOffer.mockClear();
    handleRemoteAnswer.mockClear();
  };

  let roapListener: RoapListener;
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
    roapStateMachineState = '';
    waitingForState = {};

    // also reset the mock callbacks, because they get changed in some of the tests
    createLocalOffer = jest.fn().mockResolvedValue({sdp: MUNGED_LOCAL_SDP});
    handleRemoteOffer = jest.fn().mockResolvedValue({sdp: MUNGED_LOCAL_SDP});
    handleRemoteAnswer = jest.fn().mockResolvedValue({});

    // create the roap instance and setup listeners
    roap = new Roap(
      () => createLocalOffer(),
      (sdp: string | undefined) => handleRemoteOffer(sdp),
      (sdp: string | undefined) => handleRemoteAnswer(sdp)
    );

    roapListener = new RoapListener(roap, log);

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

    await roapListener.waitForMessage({
      messageType: 'OK',
      seq,
    });

    await waitForState('idle');
  };

  // goes through a flow that starts with a local OFFER being created,
  // followed by remote ANSWER simulated, then local OK generated
  // and finally state machine going to idle state
  const checkLocalOfferAnswerOkFlow = async (seq: number) => {
    await roapListener.waitForMessage({
      messageType: 'OFFER',
      seq,
      sdp: MUNGED_LOCAL_SDP,
      tieBreaker: 0xfffffffe,
    });

    // now proceed with the rest of the flow
    await checkRemoteAnswerOkFlow(seq);
  };

  /** verifies that the correct callback was called
   *  to trigger a new SDP offer
   */
  const expectLocalOfferToBeCreated = () => {
    expect(createLocalOffer).toBeCalledOnceWith();
  };

  /** verifies that the correct callback was called
   *  to trigger an SDP answer
   */
  const expectLocalAnswerToBeCreated = (remoteOffer: string) => {
    expect(handleRemoteOffer).toBeCalledOnceWith(remoteOffer);
  };

  /** verifies that the correct callback was called
   *  to handle a remote SDP offer
   */
  const expectRemoteAnswerToBeHandled = (remoteAnswer: string) => {
    expect(handleRemoteAnswer).toBeCalledOnceWith(remoteAnswer);
  };

  it('handles OFFER_REQUEST correctly', async () => {
    const FAKE_SEQ = 10;

    // simulate offer requst coming from the backend
    roap.roapMessageReceived({
      messageType: 'OFFER_REQUEST',
      seq: FAKE_SEQ,
    });

    await roapListener.waitForMessage({
      messageType: 'OFFER_RESPONSE',
      seq: FAKE_SEQ,
      sdp: MUNGED_LOCAL_SDP,
    });

    expectLocalOfferToBeCreated();

    // simulate answer from the backend
    roap.roapMessageReceived({
      messageType: 'ANSWER',
      seq: FAKE_SEQ,
      sdp: FAKE_REMOTE_SDP,
    });

    await roapListener.waitForMessage({
      messageType: 'OK',
      seq: FAKE_SEQ,
    });

    expectRemoteAnswerToBeHandled(FAKE_REMOTE_SDP);

    await waitForState('idle');
  });

  it('works correctly when client initiates the offer', async () => {
    roap.initiateOffer();

    await roapListener.waitForMessage({
      messageType: 'OFFER',
      seq: 1,
      sdp: MUNGED_LOCAL_SDP,
      tieBreaker: 0xfffffffe,
    });

    expectLocalOfferToBeCreated();

    // simulate answer coming from the backend
    roap.roapMessageReceived({
      messageType: 'ANSWER',
      seq: 1,
      sdp: FAKE_REMOTE_SDP,
    });

    await roapListener.waitForMessage({
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

    await roapListener.waitForMessage({
      messageType: 'ANSWER',
      seq: 1,
      sdp: MUNGED_LOCAL_SDP,
    });

    expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP);

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
      const createLocalOfferPromise = createControlledPromise();

      if (remoteOfferBeforeOurs) {
        createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);
      }

      // start an offer from our side
      roap.initiateOffer();

      if (remoteOfferBeforeOurs) {
        // simulate an offer/offer request from the backend before createLocalOffer() resolves
        roap.roapMessageReceived({
          messageType: remoteOfferMessageType,
          seq: 1,
          sdp: remoteOfferMessageType === 'OFFER' ? FAKE_REMOTE_SDP : undefined,
          tieBreaker: 0x100,
        });

        createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

        // glare has happened - this should trigger an ERROR CONFLICT
        await roapListener.waitForMessage({
          messageType: 'ERROR',
          errorType: ErrorType.CONFLICT,
          seq: 1,
        });

        // eventually our offer is ready to be sent out
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });
      } else {
        // wait for our local offer to be created
        await roapListener.waitForMessage({
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
        await roapListener.waitForMessage({
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
        let initiateOfferResolved = false;
        const remoteOfferMessageType = 'OFFER';
        const handleRemoteOfferPromise = createControlledPromise();

        handleRemoteOffer = jest.fn().mockReturnValue(handleRemoteOfferPromise);

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
          roap.initiateOffer().then(() => {
            initiateOfferResolved = true;
          });
        }

        handleRemoteOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

        await roapListener.waitForMessage({
          messageType: 'ANSWER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
        });

        expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP);

        if (whenToCallInitiateOffer === 'WHILE_WAITING_FOR_OK') {
          // start an offer from our side
          // (it should be queued and processed after we receive OK for the last answer we've sent)
          roap.initiateOffer().then(() => {
            initiateOfferResolved = true;
          });
        }

        await flushPromises();

        // promise returned by initiateOffer should not be resolved yet
        expect(initiateOfferResolved).toEqual(false);

        // simulate ok coming from the backend
        roap.roapMessageReceived({
          messageType: 'OK',
          seq: 1,
        });

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 2,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        await flushPromises();

        // and only now the promise returned by initiateOffer should be resolved
        expect(initiateOfferResolved).toEqual(true);

        // proceed with the rest of the flow
        await checkRemoteAnswerOkFlow(2);
      };

      it('queues another SDP exchange if initiateOffer() is called after receiving remote offer', async () => {
        await testInitiateOffer('WHILE_PROCESSING_REMOTE_OFFER');
      });
      it('queues another SDP exchange if initiateOffer() is when waiting for OK message', async () => {
        await testInitiateOffer('WHILE_WAITING_FOR_OK');
      });

      it('restarts SDP exchange if initiateOffer() is called while creating a local offer', async () => {
        const createLocalOfferPromise = createControlledPromise();
        const initiateOfferResolved = [false, false];

        createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);

        roap.initiateOffer().then(() => {
          initiateOfferResolved[0] = true;
        });

        await flushPromises();

        // call it again, while we're already setting a local offer
        roap.initiateOffer().then(() => {
          initiateOfferResolved[1] = true;
        });

        await flushPromises();

        // at this point both promises should not be resolved yet
        expect(initiateOfferResolved).toEqual([false, false]);

        // now let setting of local offer to complete
        createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        await flushPromises();

        // now both promises should be resolved
        expect(initiateOfferResolved).toEqual([true, true]);

        // create local offer callback should have been called twice because of the second initiateOffer()
        expect(createLocalOffer).toBeCalledTimes(2);

        // simulate answer coming from the backend
        await checkRemoteAnswerOkFlow(1);
      });

      it('restarts SDP exchange if initiateOffer() is called while handling OFFER_REQUEST message', async () => {
        const createLocalOfferPromise = createControlledPromise();
        let initiateOfferResolved = false;

        createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);

        // simulate offer requst coming from the backend
        roap.roapMessageReceived({
          messageType: 'OFFER_REQUEST',
          seq: 1,
        });

        await flushPromises();

        // call initiateOffer() while we're already setting a local offer
        roap.initiateOffer().then(() => {
          initiateOfferResolved = true;
        });

        await flushPromises();

        // at this point both promises should not be resolved yet
        expect(initiateOfferResolved).toEqual(false);

        // now let setting of local offer to complete
        createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

        await roapListener.waitForMessage({
          messageType: 'OFFER_RESPONSE',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
        });

        await flushPromises();

        // now the promise should be resolved
        expect(initiateOfferResolved).toEqual(true);

        // create local offer callback should have been called twice because of the second initiateOffer()
        expect(createLocalOffer).toBeCalledTimes(2);

        // simulate answer coming from the backend
        await checkRemoteAnswerOkFlow(1);
      });

      it('queues another SDP exchange if initiateOffer() is called while waiting for answer', async () => {
        const initiateOfferResolved = [false, false];

        roap.initiateOffer().then(() => {
          initiateOfferResolved[0] = true;
        });

        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        // call initiateOffer() again, before we got the answer
        roap.initiateOffer().then(() => {
          initiateOfferResolved[1] = true;
        });

        await flushPromises();

        // at this point only the first promise should be resolved
        expect(initiateOfferResolved).toEqual([true, false]);

        // simulate answer coming from the backend
        roap.roapMessageReceived({
          messageType: 'ANSWER',
          seq: 1,
          sdp: FAKE_REMOTE_SDP,
        });

        await roapListener.waitForMessage({
          messageType: 'OK',
          seq: 1,
        });

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 2,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        await flushPromises();

        // finally both promises should be resolved now
        expect(initiateOfferResolved).toEqual([true, true]);

        // now proceed with the rest of the flow
        await checkRemoteAnswerOkFlow(2);
      });

      it('queues another SDP exchange if initiateOffer() is called while processing an answer', async () => {
        const initiateOfferResolved = [false, false];
        const handleRemoteAnswerPromise = createControlledPromise();

        handleRemoteAnswer = jest.fn().mockReturnValue(handleRemoteAnswerPromise);

        roap.initiateOffer().then(() => {
          initiateOfferResolved[0] = true;
        });

        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        await flushPromises();

        // at this point only the first promise should be resolved (the second one doesn't even exist yet)
        expect(initiateOfferResolved).toEqual([true, false]);

        // simulate answer coming from the backend
        roap.roapMessageReceived({
          messageType: 'ANSWER',
          seq: 1,
          sdp: FAKE_REMOTE_SDP,
        });

        // call initiateOffer() again, before the remote answer was fully processed
        roap.initiateOffer().then(() => {
          initiateOfferResolved[1] = true;
        });

        await flushPromises();

        // still only the first promise should be resolved
        expect(initiateOfferResolved).toEqual([true, false]);

        // now let the answer processing finish
        handleRemoteAnswerPromise.resolve({sdp: MUNGED_LOCAL_SDP});

        await roapListener.waitForMessage({
          messageType: 'OK',
          seq: 1,
        });

        // now instead of just staying in "idle" state, we should proceed to create a new local offer (with increased seq)
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 2,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        await flushPromises();

        // finally both promises should be resolved now
        expect(initiateOfferResolved).toEqual([true, true]);

        // now proceed with the rest of the flow
        await checkRemoteAnswerOkFlow(2);
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

      await roapListener.waitForMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated();

      resetCallbackMocks();

      // simulate DOUBLECONFLICT from the backend
      roap.roapMessageReceived({
        messageType: 'ERROR',
        errorType: ErrorType.DOUBLECONFLICT,
        seq: 1,
      });

      // it should trigger a new offer with increased seq and same sdp and tieBreaker
      await roapListener.waitForMessage({
        messageType: 'OFFER',
        seq: 2,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated();

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

        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 1,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated();
        resetCallbackMocks();

        // simulate error from the backend instead of the answer
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 1,
        });

        // it should trigger a new offer with increased seq and same sdp and tieBreaker
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 2,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated();
        resetCallbackMocks();

        // simulate a second error from the backend instead of the answer
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 2,
        });

        // it should trigger a second retry of the offer with increased seq and same sdp and tieBreaker
        await roapListener.waitForMessage({
          messageType: 'OFFER',
          seq: 3,
          sdp: MUNGED_LOCAL_SDP,
          tieBreaker: 0xfffffffe,
        });

        expectLocalOfferToBeCreated();
        resetCallbackMocks();

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

      await roapListener.waitForMessage({
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

      await roapListener.waitForMessage({
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
      handleRemoteOffer = jest.fn().mockRejectedValue(new Error('fake browser failure'));

      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      await roapListener.waitForMessage({
        messageType: 'ERROR',
        errorType: ErrorType.FAILED,
        seq: 1,
      });

      await waitForState('browserError');
      await roapFailurePromise;
    });

    it('sends FAILED error if browser rejects the remote SDP answer', async () => {
      handleRemoteAnswer = jest.fn().mockRejectedValue(new Error('fake browser failure'));

      roap.initiateOffer();

      await roapListener.waitForMessage({
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

      await roapListener.waitForMessage({
        messageType: 'ERROR',
        errorType: ErrorType.FAILED,
        seq: 1,
      });

      await waitForState('browserError');
      await roapFailurePromise;
    });

    it('sends FAILED error if browser fails to create a local SDP offer', async () => {
      const fakeError = new Error('local SDP rejected');

      createLocalOffer.mockRejectedValue(fakeError);

      await expect(roap.initiateOffer()).rejects.toEqual(fakeError);

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

      await roapListener.waitForMessage({
        messageType: 'ERROR',
        errorType: ErrorType.INVALID_STATE,
        seq,
      });

      // and with a higher seq
      roap.roapMessageReceived({messageType, seq: seq + 10, sdp: FAKE_REMOTE_SDP});

      await roapListener.waitForMessage({
        messageType: 'ERROR',
        errorType: ErrorType.INVALID_STATE,
        seq: seq + 10,
      });
    };

    it('sends INVALID_STATE error when receiving messages in wrong state (client initiates the offer)', async () => {
      const createLocalOfferPromise = createControlledPromise();
      const handleRemoteAnswerPromise = createControlledPromise();

      createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);
      handleRemoteAnswer = jest.fn().mockReturnValue(handleRemoteAnswerPromise);

      // first check in idle state, before we do anything
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OK', 1);

      roap.initiateOffer();

      await flushPromises();

      // now check again while we're creating the local offer
      await checkInvalidStateError('ANSWER', 1);
      await checkInvalidStateError('OK', 1);

      // now let setting of local offer to complete
      createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated();

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
      handleRemoteAnswerPromise.resolve({});

      await roapListener.waitForMessage({
        messageType: 'OK',
        seq: 1,
      });

      // we should be back to idle now (with increased seq), so ANSWER and OK should trigger "invalid state" error again
      await checkInvalidStateError('ANSWER', 2);
      await checkInvalidStateError('OK', 2);

      await waitForState('idle');
    });

    it('sends INVALID_STATE error when receiving messages in wrong state (server initiates the offer)', async () => {
      const handleRemoteOfferPromise = createControlledPromise();

      handleRemoteOffer = jest.fn().mockReturnValue(handleRemoteOfferPromise);

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
      handleRemoteOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP);

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
      expect(roapListener.getReceivedMessages().length).toEqual(0);
      // and the state should not have changed either
      expect(stateBeforeMessageReceived).toEqual(roapStateMachineState);
    };

    it('ignores duplicate ANSWER from the server', async () => {
      const handleRemoteAnswerPromise = createControlledPromise();

      handleRemoteAnswer = jest.fn().mockReturnValue(handleRemoteAnswerPromise);

      roap.initiateOffer();

      await roapListener.waitForMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated();

      // simulate answer coming from the backend
      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      // check that a second one is ignored
      await checkDuplicateIgnored('ANSWER', 1);

      // now let the answer processing finish
      handleRemoteAnswerPromise.resolve({});

      await roapListener.waitForMessage({
        messageType: 'OK',
        seq: 1,
      });

      await checkDuplicateIgnored('ANSWER', 1);

      await waitForState('idle');

      await checkDuplicateIgnored('ANSWER', 1);
    });

    it('ignores duplicate OFFER from the server', async () => {
      const handleRemoteOfferPromise = createControlledPromise();

      handleRemoteOffer = jest.fn().mockReturnValue(handleRemoteOfferPromise);

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
      handleRemoteOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP);

      await checkDuplicateIgnored('OFFER', 1);

      // simulate ok coming from the backend
      roap.roapMessageReceived({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    });

    it('ignores duplicate OFFER_REQUEST from the server', async () => {
      const createLocalOfferPromise = createControlledPromise();

      createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);

      roap.roapMessageReceived({
        messageType: 'OFFER_REQUEST',
        seq: 1,
      });

      // check that a second one is ignored
      await checkDuplicateIgnored('OFFER_REQUEST', 1);

      createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'OFFER_RESPONSE',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalOfferToBeCreated();

      await checkDuplicateIgnored('OFFER_REQUEST', 1);

      // let the flow finish
      await checkRemoteAnswerOkFlow(1);
    });
  });

  describe('messages with old seq are rejected with OUT_OF_ORDER error or ignored', () => {
    /** Sends a message and expects OUT_OF_ORDER error in response
     */
    const checkOutOfOrderError = async (
      messageType: 'ANSWER' | 'OK' | 'OFFER' | 'OFFER_REQUEST',
      seq: number
    ) => {
      // simulate message arriving with the correct seq
      roap.roapMessageReceived({messageType, seq, sdp: FAKE_REMOTE_SDP});

      await roapListener.waitForMessage({
        messageType: 'ERROR',
        errorType: ErrorType.OUT_OF_ORDER,
        seq,
      });
    };

    /** Sends ERROR messages with old seq (0) and checks that
     *  there is no message in response and that the state doesn't change
     */
    const checkOldErrorsAreIgnored = async () => {
      // do this for all possible error types
      for (const errorType of Object.values(ErrorType)) {
        const stateBeforeMessageReceived = roapStateMachineState;

        // simulate a message arriving
        roap.roapMessageReceived({
          messageType: 'ERROR',
          errorType,
          seq: 0,
        });

        // eslint-disable-next-line no-await-in-loop
        await flushPromises();

        // there should be no new notification as the message was ignored
        expect(roapListener.getReceivedMessages().length).toEqual(0);
        // and the state should not have changed either
        expect(stateBeforeMessageReceived).toEqual(roapStateMachineState);
      }
    };

    it('in idle state', async () => {
      roap.initiateOffer();

      await checkLocalOfferAnswerOkFlow(1);

      // now, as we've done 1 full offer-answer-ok flow, we are back in idle state and seq is set to 1
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER', 1);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 1);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();
    });

    it('during the flow where client initiates the offer', async () => {
      const createLocalOfferPromise = createControlledPromise();
      const handleRemoteAnswerPromise = createControlledPromise();

      createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);
      handleRemoteAnswer = jest.fn().mockReturnValue(handleRemoteAnswerPromise);

      roap.initiateOffer();

      await flushPromises();

      // check while we're creating the local offer
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // now let setting of local offer to complete
      createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });

      expectLocalOfferToBeCreated();

      // now check that we send right error while we're waiting for an ANSWER
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // simulate answer coming from the backend
      roap.roapMessageReceived({
        messageType: 'ANSWER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
      });

      // now check that we send right error while we're processing the ANSWER
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // now let the answer processing finish
      handleRemoteAnswerPromise.resolve({});

      await roapListener.waitForMessage({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    });

    it('during the flow where server initiates the offer', async () => {
      const handleRemoteOfferPromise = createControlledPromise();

      handleRemoteOffer = jest.fn().mockReturnValue(handleRemoteOfferPromise);

      // simulate offer coming from the backend
      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
        tieBreaker: 0x100,
      });

      // check while we're processing the remote offer
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // now let the offer processing finish
      handleRemoteOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'ANSWER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalAnswerToBeCreated(FAKE_REMOTE_SDP);

      // check while we're waiting for OK from the server
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // simulate ok coming from the backend
      roap.roapMessageReceived({
        messageType: 'OK',
        seq: 1,
      });

      await waitForState('idle');
    });

    it('during the flow where server sends OFFER_REQUEST', async () => {
      const createLocalOfferPromise = createControlledPromise();

      createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);

      roap.roapMessageReceived({
        messageType: 'OFFER_REQUEST',
        seq: 1,
      });

      // check while we're processing the remote offer request
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      createLocalOfferPromise.resolve({sdp: MUNGED_LOCAL_SDP});

      await roapListener.waitForMessage({
        messageType: 'OFFER_RESPONSE',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
      });

      expectLocalOfferToBeCreated();

      // check while we're waiting for the remote answer
      await checkOutOfOrderError('OFFER', 0);
      await checkOutOfOrderError('OFFER_REQUEST', 0);
      await checkOutOfOrderError('ANSWER', 0);
      await checkOutOfOrderError('OK', 0);
      await checkOldErrorsAreIgnored();

      // let the flow finish
      await checkRemoteAnswerOkFlow(1);
    });
  });

  describe('stop() method', () => {
    it('calls stop() on the state machine interpreter', () => {
      const stateMachineInterpreter = roap.getStateMachine();

      const stopSpy = jest.spyOn(stateMachineInterpreter, 'stop');

      roap.stop();

      expect(stopSpy).toBeCalledOnceWith();
    });

    it('stops events that are sent from service onDone handler from firing', async () => {
      const createLocalOfferPromise = createControlledPromise();

      // make sure offer creation doesn't complete
      createLocalOffer = jest.fn().mockReturnValue(createLocalOfferPromise);

      // start the process of creating a local offer
      roap.initiateOffer();
      await flushPromises();

      // stop it before it fully completed
      roap.stop();

      // now let it complete
      createLocalOfferPromise.resolve({sdp: 'fake sdp'});
      await flushPromises();

      // check that we didn't get any ROAP_MESSAGE_TO_SEND event
      expect(roapListener.getReceivedMessages().length).toEqual(0);

      await new Promise((resolve) => {
        setTimeout(() => resolve({}), 2000);
      });
    });

    it('stops the state machine from handling any more requests', async () => {
      roap.stop();

      // now try to initiate an offer, it should do nothing
      roap.initiateOffer();
      await flushPromises();

      expect(roapListener.getReceivedMessages().length).toEqual(0);
    });

    it('stops handling any more remote messages', async () => {
      roap.stop();

      roap.roapMessageReceived({
        messageType: 'OFFER',
        seq: 1,
        sdp: FAKE_REMOTE_SDP,
        tieBreaker: 0x100,
      });

      await flushPromises();

      expect(handleRemoteOffer).not.toBeCalled();
      expect(roapListener.getReceivedMessages().length).toEqual(0);
    });
  });
});
