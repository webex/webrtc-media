/* eslint-disable no-console */ // todo
import 'webrtc-adapter';
import EventEmitter from 'events';
import {AnyEventObject, assign, createMachine, interpret} from 'xstate';

import logger from '../Logger';
import {ROAP} from '../constants';
import {isSdpInvalid, mungeLocalSdp} from './utils';
import {Event, RoapMessage} from './eventTypes';

import {MediaConnectionConfig} from './config';

// todo don't bother sending out offers with all m-lines inactive, because backend will fail with NO_ACTIVE_STREAMS roap error

// todo: some example test cases we need:
// verify that we send the ERROR with correct seq (matching received OFFER seq) when glare happens

const WEB_TIEBREAKER_VALUE = 0xfffffffe;
const MAX_RETRIES = 2;

/** Finite state machine (FSM) context - this is additional data associated with the state of the state machine */
interface FsmContext {
  seq: number;
  pendingLocalOffer: boolean;
  isHandlingOfferRequest: boolean; // true means that we received an OFFER_REQUEST and need to send an OFFER_RESPONSE
  retryCounter: number; // number of conescutive attempts we've tried to send our offer and got ERROR back
}
// eslint-disable-next-line import/prefer-default-export
export class Roap extends EventEmitter {
  private id: string; // used just for logging

  private pc: RTCPeerConnection;

  private config: MediaConnectionConfig;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stateMachine: any; // todo: type

  constructor(pc: RTCPeerConnection, config: MediaConnectionConfig, debugId?: string) {
    super();

    this.id = debugId || 'ROAP';
    this.config = config;
    this.pc = pc;

    const fsm = createMachine(
      {
        schema: {
          context: {} as FsmContext,
        },
        id: 'roap',
        initial: 'idle',
        context: {
          seq: 0,
          pendingLocalOffer: false,
          isHandlingOfferRequest: false,
          retryCounter: 0,
        },
        states: {
          /**
           * Error state - we get here if one of browser API calls failed
           */
          browserError: {
            onEntry: (context, event) =>
              this.error(
                'FSM',
                `browserError state onEntry: context=${JSON.stringify(context)}:`,
                event.data
              ),
          },
          /**
           * Error state - we get here if we receive an ERROR message from the server in reply to one of our Roap messages
           * and there is nothing more we can do about it (or we've already attempted offer retries and they still failed).
           */
          remoteError: {
            onEntry: () => {
              this.log('FSM', 'remoteError state onEntry called, emitting Event.ROAP_FAILURE');
              this.emit(Event.ROAP_FAILURE);
            },
          },
          idle: {
            on: {
              always: {
                cond: 'isPendingLocalOffer',
                actions: 'increaseSeq',
                target: 'creatingLocalOffer',
              },
              INITIATE_OFFER: {actions: 'increaseSeq', target: 'creatingLocalOffer'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerOrEqualSeq', actions: 'sendOutOfOrderError'},
                {actions: 'updateSeq', target: 'settingRemoteOffer'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerOrEqualSeq', actions: 'sendOutOfOrderError'},
                {actions: ['updateSeq', 'setOfferRequestFlag'], target: 'creatingLocalOffer'},
              ],
              // unexpected events:
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              // error messages are ignored as we don't expect any in this state and there is nothing we need to do in response to them
            },
          },
          creatingLocalOffer: {
            invoke: {
              src: this.createLocalOffer.bind(this),
              onDone: [
                // if a new local offer was requested while we were doing this one, go back and start again
                {cond: 'isPendingLocalOffer', target: 'creatingLocalOffer'},
                // otherwise continue to 'waitingForAnswer'
                {
                  cond: 'isHandlingOfferRequest',
                  actions: 'sendRoapOfferResponseMessage',
                  target: 'waitingForAnswer',
                },
                {actions: 'sendRoapOfferMessage', target: 'waitingForAnswer'},
              ],
              onError: 'browserError',
            },
            onEntry: ['resetPendingLocalOffer'],
            on: {
              // unexpected events:
              INIITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'handleGlare'}, // if this results in us sending DOUBLECONFLICT, we continue as normal and rely on the other side to send us DOUBLECONFLICT too
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isHandlingOfferRequest', actions: 'ignoreDuplicate'}, // todo: in theory we should ignore only if seq is same and do sendInvalidStateError otherwise, but for now we don't bother
                {actions: 'handleGlare'}, // if this results in us sending DOUBLECONFLICT, we continue as normal and rely on the other side to send us DOUBLECONFLICT too
              ],
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              // error messages are ignored as we don't expect any in this state
            },
          },
          waitingForAnswer: {
            on: {
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: ['resetRetryCounter', 'updateSeq'], target: 'settingRemoteAnswer'}, // if we get ANSWER with higher seq, we just update our seq (this is what Edonus seems to be doing in such case)
              ],
              // unexpected events:
              INIITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'handleGlare'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isHandlingOfferRequest', actions: 'ignoreDuplicate'}, // todo: in theory we should ignore only if seq is same and do sendInvalidStateError otherwise, but for now we don't bother
                {actions: 'handleGlare'},
              ],
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              ERROR_ARRIVED: [
                {
                  cond: 'shouldErrorTriggerOfferRetry',
                  actions: ['increaseSeq', 'increaseRetryCounter'],
                  target: 'creatingLocalOffer',
                },
                {cond: 'isSameSeq', target: 'remoteError'},
              ],
            },
          },
          settingRemoteAnswer: {
            invoke: {
              src: this.handleRemoteAnswer.bind(this),
              onDone: {actions: ['sendRoapOKMessage', 'resetOfferRequestFlag'], target: 'idle'},
              onError: {actions: 'sendGenericError', target: 'browserError'},
            },
            on: {
              // unexpected events:
              INIITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              // error messages are ignored as we don't expect any in this state
            },
          },
          settingRemoteOffer: {
            invoke: {
              src: this.handleRemoteOffer.bind(this),
              onDone: {
                actions: ['sendRoapAnswerMessage'],
                target: 'waitingForOK',
              },
              onError: {actions: 'sendGenericError', target: 'browserError'},
            },
            on: {
              // unexpected events:
              INIITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendRetryAfterError'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              // error messages are ignored as we don't expect any in this state
            },
          },
          waitingForOK: {
            on: {
              REMOTE_OK_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'updateSeq', target: 'idle'}, // if we get OK with higher seq, we just update our seq (this is what Edonus seems to be doing in such case)
              ],
              // unexpected events:
              INIITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'}, // if seq is the same it means they haven't received our answer yet and are just resending the offer
                {actions: 'sendInvalidStateError'}, // todo: we could assume here that OK was lost and just process this new offer
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'}, // todo: we could assume here that if seq is new, then OK was lost and just process this new offer request (only send invalid state error for same seq)
              ],
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isLowerSeq', actions: 'sendOutOfOrderError'},
                {actions: 'sendInvalidStateError'},
              ],
              ERROR_ARRIVED: {cond: 'isSameSeq', target: 'remoteError'},
            },
          },
        },
      },
      {
        actions: {
          enqueueNewOfferCreation: assign((context) => ({...context, pendingLocalOffer: true})),
          resetPendingLocalOffer: assign((context) => ({...context, pendingLocalOffer: false})),

          increaseSeq: assign((context) => ({...context, seq: context.seq + 1})),
          updateSeq: assign((context, event: AnyEventObject) => ({...context, seq: event.seq})),

          increaseRetryCounter: assign((context) => ({
            ...context,
            retryCounter: context.retryCounter + 1,
          })),
          resetRetryCounter: assign((context) => ({...context, retryCounter: 0})),

          setOfferRequestFlag: assign((context) => ({...context, isHandlingOfferRequest: true})),
          resetOfferRequestFlag: assign((context) => ({
            ...context,
            isHandlingOfferRequest: false,
          })),

          // because we can't do rollback on safari (only supported from iOS 15.4),
          // we always have to win the glare conflict (see WEB_TIEBREAKER_VALUE)
          handleGlare: (_context, event: AnyEventObject) => {
            if (event.tieBreaker === WEB_TIEBREAKER_VALUE) {
              this.sendErrorMessage(event.seq, 'DOUBLECONFLICT');
              // we should also receive DOUBLECONFLICT, so just sit and wait
            } else {
              this.sendErrorMessage(event.seq, 'CONFLICT');
            }
          },

          sendRoapOfferMessage: this.sendRoapOfferMessage.bind(this),
          sendRoapOfferResponseMessage: this.sendRoapOfferResponseMessage.bind(this),
          sendRoapOKMessage: this.sendRoapOkMessage.bind(this),
          sendRoapAnswerMessage: this.sendRoapAnswerMessage.bind(this),
          sendGenericError: (context) => this.sendErrorMessage(context.seq, 'FAILED'),
          sendInvalidStateError: (_context, event) =>
            this.sendErrorMessage(event.seq, 'INVALID_STATE'),
          sendOutOfOrderError: (_context, event) =>
            this.sendErrorMessage(event.seq, 'OUT_OF_ORDER'),
          sendRetryAfterError: (_context, event) =>
            this.sendErrorMessage(event.seq, 'FAILED', {
              retryAfter: Math.floor(Math.random() * 11),
            }),

          ignoreDuplicate: (_context, event) =>
            this.log('FSM', `ignoring duplicate roap message ${event.type} with seq=${event.seq}`),
        },
        guards: {
          isPendingLocalOffer: (context) => context.pendingLocalOffer,

          isHandlingOfferRequest: (context) => context.isHandlingOfferRequest,

          isLowerSeq: (context, event) => {
            if (event.seq < context.seq) {
              this.log('FSM', `incoming roap message seq too small: ${event.seq} < ${context.seq}`);

              return true;
            }

            return false;
          },
          isSameSeq: (context, event) => {
            if (event.seq === context.seq) {
              this.log(
                'FSM',
                `incoming roap message seq is same as current context seq: ${event.seq}`
              );

              return true;
            }

            return false;
          },
          isLowerOrEqualSeq: (context, event) => {
            if (event.seq <= context.seq) {
              this.log(
                'FSM',
                `incoming roap message seq too small: ${event.seq} <= ${context.seq}`
              );

              return true;
            }

            return false;
          },

          shouldErrorTriggerOfferRetry: (context, event) => {
            const retryableErrorTypes = [
              'DOUBLECONFLICT',
              'INVALID_STATE',
              'OUT_OF_ORDER',
              'RETRY',
            ];

            if (retryableErrorTypes.includes(event.errorType)) {
              if (event.seq === context.seq && context.retryCounter < MAX_RETRIES) {
                this.log(
                  'FSM',
                  `retryable error message received with matching seq and retryCounter ${context.retryCounter} < ${MAX_RETRIES}`
                );

                return true;
              }

              if (event.seq !== context.seq) {
                this.log(
                  'FSM',
                  `ignoring error message with wrong seq: ${event.seq} !== ${context.seq}`
                );
              } else {
                this.log('FSM', `reached max retries: retryCounter=${context.retryCounter}`);
              }
            }

            return false;
          },
        },
      }
    );

    this.stateMachine = interpret(fsm)
      .onTransition((state, event) =>
        this.log('onTransition', `state=${state.value}, event=${JSON.stringify(event)}`)
      )
      .start();
  }

  private log(action: string, description: string) {
    logger.info({
      ID: this.id,
      mediaType: ROAP,
      action,
      description,
    });
  }

  private error(action: string, description: string, error?: Error) {
    logger.error({
      ID: this.id,
      mediaType: ROAP,
      action,
      description,
      error,
    });
  }

  private sendRoapOfferMessage(context: FsmContext, event: AnyEventObject) {
    this.log('sendRoapOfferMessage', 'emitting ROAP OFFER');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq: context.seq,
        messageType: 'OFFER',
        sdp: event.data.sdp,
        tieBreaker: WEB_TIEBREAKER_VALUE,
      },
    });
  }

  private sendRoapOfferResponseMessage(context: FsmContext, event: AnyEventObject) {
    this.log('sendRoapOfferResponseMessage', 'emitting ROAP OFFER RESPONSE');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq: context.seq,
        messageType: 'OFFER_RESPONSE',
        sdp: event.data.sdp,
      },
    });
  }

  private sendRoapOkMessage(context: FsmContext) {
    this.log('sendRoapOkMessage', 'emitting ROAP OK');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq: context.seq,
        messageType: 'OK',
      },
    });
  }

  private sendRoapAnswerMessage(context: FsmContext, event: AnyEventObject) {
    this.log('sendRoapAnswerMessage', 'emitting ROAP ANSWER');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq: context.seq,
        messageType: 'ANSWER',
        sdp: event.data.sdp,
      },
    });
  }

  private sendErrorMessage(seq: number, errorType: string, options: {retryAfter?: number} = {}) {
    const {retryAfter} = options;

    // todo enum for errorTypes
    this.log('sendErrorMessage', `emitting ROAP ERROR (${errorType})`);
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq,
        messageType: 'ERROR',
        errorType,
        retryAfter,
      },
    });
  }

  /** only to be used by tests */
  public getStateMachine() {
    return this.stateMachine;
  }

  /**
   * Starts SDP negotiation by creating a local offer.
   *
   * @returns Promise<void>
   */
  public initiateOffer(): Promise<void> {
    this.stateMachine.send('INITIATE_OFFER');

    return Promise.resolve(); // todo: this is just a temp hack for now
  }

  private createLocalOffer(): Promise<{sdp: string}> {
    return this.pc
      .createOffer()
      .then((description: RTCSessionDescriptionInit) => {
        this.log('createLocalOffer', 'local SDP offer created');

        return this.pc.setLocalDescription(description);
      })
      .then(() => this.checkIceCandidates())
      .then(() => {
        this.log('createLocalOffer', 'local SDP offer set, checkIceCandidates() passed');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription!.sdp);

        return {sdp: mungedSdp};
      });
  }

  /**
   * This function should be called whenever a ROAP message is received from the backend.
   *
   * @param roapMessage - ROAP message received
   */
  public roapMessageReceived(roapMessage: RoapMessage): Promise<void> {
    const {errorType, messageType, sdp, seq, tieBreaker} = roapMessage;

    if (!this.pc) {
      return Promise.reject(new Error('RTCPeerConnection object is missing'));
    }

    switch (messageType) {
      case 'ANSWER':
        this.stateMachine.send('REMOTE_ANSWER_ARRIVED', {sdp, seq});
        break;

      case 'OFFER':
        this.stateMachine.send('REMOTE_OFFER_ARRIVED', {sdp, seq, tieBreaker});
        break;

      case 'OFFER_REQUEST':
        this.stateMachine.send('REMOTE_OFFER_REQUEST_ARRIVED', {seq, tieBreaker});
        break;

      case 'OK':
        this.stateMachine.send('REMOTE_OK_ARRIVED', {sdp, seq});
        break;

      case 'ERROR':
        // TODO
        this.error('roapMessageReceived', `Error received: seq=${seq} type=${errorType}`);

        if (errorType === 'CONFLICT') {
          this.error(
            'roapMessageReceived',
            `CONFLICT error type received - this should never happen, because we use the tieBreaker value ${WEB_TIEBREAKER_VALUE}`
          );
        }

        this.stateMachine.send('ERROR_ARRIVED', {seq, errorType});
        break;

      case 'OFFER_RESPONSE':
        // we never send OFFER_REQUEST, so we should also never receive OFFER_RESPONSE
        this.error('roapMessageReceived', `Received unexpected OFFER_RESPONSE: seq=${seq}`);
        break;

      default:
        this.error('roapMessageReceived()', `unsupported messageType: ${messageType}`);

        return Promise.reject(new Error('unhandled messageType'));
    }

    return Promise.resolve(); // todo return the promise that resolves at the right time
  }

  private handleRemoteOffer(_context: FsmContext, event: AnyEventObject): Promise<{sdp: string}> {
    const {sdp} = event;

    this.log('handleRemoteOffer', 'called');

    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }

    return this.pc
      .setRemoteDescription(
        new window.RTCSessionDescription({
          type: 'offer',
          sdp,
        })
      )
      .then(() => this.pc.createAnswer())
      .then((answer: RTCSessionDescriptionInit) => this.pc.setLocalDescription(answer))
      .then(() => this.checkIceCandidates())
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription!.sdp);

        return {sdp: mungedSdp};
      });
  }

  // todo type for event
  private handleRemoteAnswer(_context: FsmContext, event: AnyEventObject): Promise<void> {
    const {sdp} = event;

    this.log('handleRemoteAnswer', 'called');

    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }

    return this.pc.setRemoteDescription(
      new window.RTCSessionDescription({
        type: 'answer',
        sdp,
      })
    );
  }

  // todo: this logic and also SDP munging don't really belong to ROAP so should probably be done through callbacks back in MediaConnection
  private checkIceCandidates(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startTime = performance.now();

      let done = false;

      const doneGatheringIceCandidates = () => {
        if (!done) {
          const miliseconds = performance.now() - startTime;

          this.log('checkIceCandidates()', 'checking SDP...');

          const invalidSdpPresent = isSdpInvalid(
            {
              allowPort0: !!this.config.sdpMunging.convertPort9to0,
            },
            this.error.bind(this),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.pc.localDescription!.sdp
          );

          if (invalidSdpPresent) {
            this.error('checkIceCandidates()', 'SDP not valid after waiting.');
            reject(new Error('SDP not valid'));
          }
          // todo: show this log only the first time:
          this.log(
            'checkIceCandidates()',
            `It took ${miliseconds} miliseconds to gather ice candidates`
          );

          done = true;
          resolve();
        }
      };

      if (this.pc.iceGatheringState === 'complete') {
        this.log('checkIceCandidates()', 'iceGatheringState is already "complete"');
        doneGatheringIceCandidates();
      }

      this.pc.onicegatheringstatechange = () => {
        this.log(
          'checkIceCandidates()',
          `iceGatheringState changed to ${this.pc.iceGatheringState}`
        );
        if (this.pc.iceGatheringState === 'complete') {
          doneGatheringIceCandidates();
        }
      };

      this.pc.onicecandidate = (evt) => {
        if (evt.candidate === null) {
          this.log('checkIceCandidates()', 'evt.candidate === null received');
          doneGatheringIceCandidates();
        } else {
          this.log(
            'checkIceCandidates()',
            `ICE Candidate(${evt.candidate?.sdpMLineIndex}): ${evt.candidate?.candidate}`
          );
        }
      };

      this.pc.onicecandidateerror = (event) => {
        this.error('checkIceCandidates()', `onicecandidateerror: ${event}`);
        reject(new Error('Error gathering ICE candidates'));
      };
    });
  }
}
