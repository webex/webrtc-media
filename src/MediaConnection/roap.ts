import 'webrtc-adapter';
import EventEmitter from 'events';
import {assign, createMachine, ErrorPlatformEvent, interpret} from 'xstate';

import {getLogger, getErrorDescription} from './logger';
import {Event, ErrorType, RoapMessage} from './eventTypes';

/*  WARNING:
 *  this module uses an xstate state machine, which depends on an auto-generated file roap.typegen.ts for
 *  correct typescript types. When you modify the state machine, you need to regenerate the roap.typegen.ts file.
 *
 *  The simplest way of doing this is to install the XState VsCode extension from Stately:
 *  https://marketplace.visualstudio.com/items?itemName=statelyai.stately-vscode
 *  Then, the file will be automatically generated for you when you make any changes.
 *
 *  Alternatively you can install @xstate/cli package and run "xstate typegen <filename>" with <filename>
 *  pointing to this file
 */

// todo don't bother sending out offers with all m-lines inactive, because backend will fail with NO_ACTIVE_STREAMS roap error

const WEB_TIEBREAKER_VALUE = 0xfffffffe;
const MAX_RETRIES = 2;

type MUNGED_LOCAL_SDP = {sdp: string}; // output of the processing of local SDP (this may be an offer or answer)

/** All events supported by the Roap finite state machine (FSM) */
type FsmEvent =
  | {
      type: 'INITIATE_OFFER';
    }
  | {
      type: 'REMOTE_OFFER_ARRIVED';
      sdp: string;
      seq: number;
      tieBreaker: number;
    }
  | {
      type: 'REMOTE_OFFER_REQUEST_ARRIVED';
      seq: number;
      tieBreaker: number;
    }
  | {
      type: 'REMOTE_ANSWER_ARRIVED';
      sdp: string;
      seq: number;
    }
  | {
      type: 'REMOTE_OK_ARRIVED';
      sdp: string;
      seq: number;
    }
  | {
      type: 'ERROR_ARRIVED';
      errorType: ErrorType;
      seq: number;
    };

/** Finite state machine (FSM) context - this is additional data associated with the state of the state machine */
interface FsmContext {
  seq: number;
  pendingLocalOffer: boolean;
  isHandlingOfferRequest: boolean; // true means that we received an OFFER_REQUEST and need to send an OFFER_RESPONSE
  retryCounter: number; // number of conescutive attempts we've tried to send our offer and got ERROR back
}

/**
 * Callback that gets called whenever a new local SDP offer needs to be created (createOffer and setLocalDescription
 * need to be called on the RTCPeerConnection). The callback should resolve with an object that contains the SDP
 * (it can be munged) - that's the SDP that will be sent out with the ROAP_MESSAGE_TO_SEND event
 */
type CreateLocalOfferCallback = () => Promise<MUNGED_LOCAL_SDP>;

/**
 * Callback that gets called whenever a remote offer SDP needs to be handled (setRemoteDescription, createAnswer
 * and setLocalDescription need to be called on the RTCPeerConnection). The callback should resolve with an object
 * that contains the answer SDP (it can be munged) - that's the SDP that will be sent out with
 * the ROAP_MESSAGE_TO_SEND event as the answer to the remote offer
 */
type HandleRemoteOfferCallback = (sdp?: string) => Promise<{sdp: string}>;

/**
 * Callback that gets called whenever a remote answer SDP needs to be handled (setRemoteDescription needs to be called
 * on the RTCPeerConnection).
 */
type HandleRemoteAnswerCallback = (sdp?: string) => Promise<void>;

// eslint-disable-next-line import/prefer-default-export
export class Roap extends EventEmitter {
  private id?: string; // used just for logging

  private createLocalOfferCallback: CreateLocalOfferCallback;

  private handleRemoteOfferCallback: HandleRemoteOfferCallback;

  private handleRemoteAnswerCallback: HandleRemoteAnswerCallback;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stateMachine: any;

  private initiateOfferPromises: Array<{resolve: () => void; reject: (error: Error) => void}>;

  constructor(
    createLocalOfferCallback: CreateLocalOfferCallback,
    handleRemoteOfferCallback: HandleRemoteOfferCallback,
    handleRemoteAnswerCallback: HandleRemoteAnswerCallback,
    debugId?: string,
    initialSeq?: number
  ) {
    super();

    this.id = debugId || 'ROAP';
    this.createLocalOfferCallback = createLocalOfferCallback;
    this.handleRemoteOfferCallback = handleRemoteOfferCallback;
    this.handleRemoteAnswerCallback = handleRemoteAnswerCallback;
    this.initiateOfferPromises = [];

    const fsm = createMachine(
      {
        tsTypes: {} as import('./roap.typegen').Typegen0,
        schema: {
          context: {} as FsmContext,
          events: {} as FsmEvent,
          services: {} as {
            createLocalOffer: {data: MUNGED_LOCAL_SDP};
            handleRemoteAnswer: {data: void};
            handleRemoteOffer: {data: MUNGED_LOCAL_SDP};
          },
        },
        preserveActionOrder: true,
        id: 'roap',
        initial: 'idle', // initial state
        context: {
          // initial context value
          seq: initialSeq || 0,
          pendingLocalOffer: false,
          isHandlingOfferRequest: false,
          retryCounter: 0,
        },
        states: {
          /**
           * Error state - we get here if one of browser API calls failed, we don't get out of it
           */
          browserError: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onEntry: (context, event) => {
              this.error(
                'FSM',
                `browserError state onEntry: context=${JSON.stringify(context)}:`,
                (event as ErrorPlatformEvent).data
              );
              this.emit(Event.ROAP_FAILURE);
            },
          },
          /**
           * Error state - we get here if we receive an ERROR message from the server in reply to one of our Roap messages
           * and there is nothing more we can do about it (or we've already attempted offer retries and they still failed).
           * We don't get out of it.
           */
          remoteError: {
            onEntry: () => {
              this.log('FSM', 'remoteError state onEntry called, emitting Event.ROAP_FAILURE');
              this.emit(Event.ROAP_FAILURE);
            },
          },
          /**
           * Idle state - this is where we start and go back to it after SDP exchange is completed
           */
          idle: {
            always: {
              cond: 'isPendingLocalOffer',
              actions: 'increaseSeq',
              target: 'creatingLocalOffer',
            },
            on: {
              INITIATE_OFFER: {actions: 'increaseSeq', target: 'creatingLocalOffer'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isSameSeq', actions: 'sendOutOfOrderError'},
                {actions: 'updateSeq', target: 'settingRemoteOffer'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isSameSeq', actions: 'sendOutOfOrderError'},
                {actions: ['updateSeq', 'setOfferRequestFlag'], target: 'creatingLocalOffer'},
              ],
              // unexpected events:
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: {actions: 'sendInvalidStateError'},
              // error messages are ignored as we don't expect any in this state and there is nothing we need to do in response to them
            },
          },
          creatingLocalOffer: {
            invoke: {
              src: 'createLocalOffer',
              onDone: [
                // if a new local offer was requested while we were doing this one, go back and start again
                {cond: 'isPendingLocalOffer', target: 'creatingLocalOffer'},
                // otherwise continue to 'waitingForAnswer'
                {
                  cond: 'isHandlingOfferRequest',
                  actions: ['sendRoapOfferResponseMessage', 'resolvePendingInitiateOfferPromises'],
                  target: 'waitingForAnswer',
                },
                {
                  actions: ['sendRoapOfferMessage', 'resolvePendingInitiateOfferPromises'],
                  target: 'waitingForAnswer',
                },
              ],
              onError: {actions: 'rejectPendingInitiateOfferPromises', target: 'browserError'},
            },
            onEntry: ['resetPendingLocalOffer'],
            on: {
              // unexpected events:
              INITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {actions: 'handleGlare'}, // if this results in us sending DOUBLECONFLICT, we continue as normal and rely on the other side to send us DOUBLECONFLICT too
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isHandlingOfferRequest', actions: 'ignoreDuplicate'}, // todo: in theory we should ignore only if seq is same and do sendInvalidStateError otherwise, but for now we don't bother
                {actions: 'handleGlare'}, // if this results in us sending DOUBLECONFLICT, we continue as normal and rely on the other side to send us DOUBLECONFLICT too
              ],
              REMOTE_ANSWER_ARRIVED: {actions: 'sendInvalidStateError'},
              REMOTE_OK_ARRIVED: {actions: 'sendInvalidStateError'},
              // error messages are ignored as we don't expect any in this state
            },
          },
          waitingForAnswer: {
            on: {
              REMOTE_ANSWER_ARRIVED: [
                {actions: ['resetRetryCounter', 'updateSeq'], target: 'settingRemoteAnswer'}, // if we get ANSWER with higher seq, we just update our seq (this is what Edonus seems to be doing in such case)
              ],
              // unexpected events:
              INITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: {actions: 'handleGlare'},
              REMOTE_OFFER_REQUEST_ARRIVED: [
                {cond: 'isHandlingOfferRequest', actions: 'ignoreDuplicate'}, // todo: in theory we should ignore only if seq is same and do sendInvalidStateError otherwise, but for now we don't bother
                {actions: 'handleGlare'},
              ],
              REMOTE_OK_ARRIVED: {actions: 'sendInvalidStateError'},
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
              src: 'handleRemoteAnswer',
              onDone: {actions: ['sendRoapOKMessage', 'resetOfferRequestFlag'], target: 'idle'},
              onError: {actions: 'sendGenericError', target: 'browserError'},
            },
            on: {
              // unexpected events:
              INITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: {actions: 'sendInvalidStateError'},
              REMOTE_OFFER_REQUEST_ARRIVED: {actions: 'sendInvalidStateError'},
              REMOTE_ANSWER_ARRIVED: [
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendInvalidStateError'},
              ],
              REMOTE_OK_ARRIVED: {actions: 'sendInvalidStateError'},
              // error messages are ignored as we don't expect any in this state
            },
          },
          settingRemoteOffer: {
            invoke: {
              src: 'handleRemoteOffer',
              onDone: {
                actions: ['sendRoapAnswerMessage'],
                target: 'waitingForOK',
              },
              onError: {actions: 'sendGenericError', target: 'browserError'},
            },
            on: {
              // unexpected events:
              INITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'},
                {actions: 'sendRetryAfterError'},
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: {actions: 'sendInvalidStateError'},
              REMOTE_ANSWER_ARRIVED: {actions: 'sendInvalidStateError'},
              REMOTE_OK_ARRIVED: {actions: 'sendInvalidStateError'},
              // error messages are ignored as we don't expect any in this state
            },
          },
          waitingForOK: {
            on: {
              REMOTE_OK_ARRIVED: [
                {actions: 'updateSeq', target: 'idle'}, // if we get OK with higher seq, we just update our seq (this is what Edonus seems to be doing in such case)
              ],
              // unexpected events:
              INITIATE_OFFER: {actions: 'enqueueNewOfferCreation'},
              REMOTE_OFFER_ARRIVED: [
                {cond: 'isSameSeq', actions: 'ignoreDuplicate'}, // if seq is the same it means they haven't received our answer yet and are just resending the offer
                {actions: 'sendInvalidStateError'}, // todo: we could assume here that OK was lost and just process this new offer
              ],
              REMOTE_OFFER_REQUEST_ARRIVED: {actions: 'sendInvalidStateError'}, // todo: we could assume here that if seq is new, then OK was lost and just process this new offer request (only send invalid state error for same seq)
              REMOTE_ANSWER_ARRIVED: {actions: 'sendInvalidStateError'},
              ERROR_ARRIVED: {cond: 'isSameSeq', target: 'remoteError'},
            },
          },
        },
      },
      {
        services: {
          createLocalOffer: () => this.createLocalOfferCallback(),
          handleRemoteAnswer: (_context, event) => this.handleRemoteAnswerCallback(event.sdp),
          handleRemoteOffer: (_context, event) => this.handleRemoteOfferCallback(event.sdp),
        },
        actions: {
          enqueueNewOfferCreation: assign((context) => ({...context, pendingLocalOffer: true})),
          resetPendingLocalOffer: assign((context) => ({...context, pendingLocalOffer: false})),

          increaseSeq: assign((context) => ({...context, seq: context.seq + 1})),
          updateSeq: assign((context, event) => ({...context, seq: event.seq})),

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
          handleGlare: (_context, event) => {
            if (event.tieBreaker === WEB_TIEBREAKER_VALUE) {
              this.sendErrorMessage(event.seq, 'DOUBLECONFLICT');
              // we should also receive DOUBLECONFLICT, so just sit and wait
            } else {
              this.sendErrorMessage(event.seq, 'CONFLICT');
            }
          },

          sendRoapOfferMessage: (context, event) =>
            this.sendRoapOfferMessage(context.seq, event.data.sdp),
          sendRoapOfferResponseMessage: (context, event) =>
            this.sendRoapOfferResponseMessage(context.seq, event.data.sdp),
          sendRoapOKMessage: (context) => this.sendRoapOkMessage(context.seq),
          sendRoapAnswerMessage: (context, event) =>
            this.sendRoapAnswerMessage(context.seq, event.data.sdp),

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

          resolvePendingInitiateOfferPromises: () => this.resolvePendingInitiateOfferPromises(),
          rejectPendingInitiateOfferPromises: (_context, event) =>
            this.rejectPendingInitiateOfferPromises((event as ErrorPlatformEvent).data),
        },
        guards: {
          isPendingLocalOffer: (context) => context.pendingLocalOffer,

          isHandlingOfferRequest: (context) => context.isHandlingOfferRequest,

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

          shouldErrorTriggerOfferRetry: (context, event) => {
            const retryableErrorTypes = [
              ErrorType.DOUBLECONFLICT,
              ErrorType.INVALID_STATE,
              ErrorType.OUT_OF_ORDER,
              ErrorType.RETRY,
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
    getLogger().info(`${this.id}:${action} ${description}`);
  }

  private error(action: string, description: string, error?: Error) {
    getLogger().error(`${this.id}:${action} ${description} ${getErrorDescription(error)}`);
  }

  private sendRoapOfferMessage(seq: number, sdp: string) {
    this.log('sendRoapOfferMessage', 'emitting ROAP OFFER');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq,
        messageType: 'OFFER',
        sdp,
        tieBreaker: WEB_TIEBREAKER_VALUE,
      },
    });
  }

  private sendRoapOfferResponseMessage(seq: number, sdp: string) {
    this.log('sendRoapOfferResponseMessage', 'emitting ROAP OFFER RESPONSE');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq,
        messageType: 'OFFER_RESPONSE',
        sdp,
      },
    });
  }

  private sendRoapOkMessage(seq: number) {
    this.log('sendRoapOkMessage', 'emitting ROAP OK');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq,
        messageType: 'OK',
      },
    });
  }

  private sendRoapAnswerMessage(seq: number, sdp: string) {
    this.log('sendRoapAnswerMessage', 'emitting ROAP ANSWER');
    this.emit(Event.ROAP_MESSAGE_TO_SEND, {
      roapMessage: {
        seq,
        messageType: 'ANSWER',
        sdp,
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
    return new Promise((resolve, reject) => {
      this.initiateOfferPromises.push({resolve, reject});
      this.stateMachine.send('INITIATE_OFFER');
    });
  }

  private resolvePendingInitiateOfferPromises() {
    while (this.initiateOfferPromises.length > 0) {
      const promise = this.initiateOfferPromises.shift();

      promise?.resolve();
    }
  }

  private rejectPendingInitiateOfferPromises(error: Error) {
    while (this.initiateOfferPromises.length > 0) {
      const promise = this.initiateOfferPromises.shift();

      promise?.reject(error);
    }
  }

  private validateIncomingRoapMessage(roapMessage: RoapMessage): {
    isValid: boolean;
    errorToSend?: string;
  } {
    const {errorType, messageType, seq} = roapMessage;
    let isValid = true;
    let errorToSend;

    if (seq < this.stateMachine.state.context.seq) {
      isValid = false;

      // we don't want to send an error response to an error
      if (messageType !== 'ERROR') {
        errorToSend = 'OUT_OF_ORDER';

        this.error(
          'validateIncomingRoapMessage',
          `received roap message ${messageType} with seq too low: ${seq} < ${this.stateMachine.state.context.seq}`
        );
      } else {
        this.error(
          'validateIncomingRoapMessage',
          `received ERROR message ${errorType} with seq too low: ${seq} < ${this.stateMachine.state.context.seq}, ignoring it`
        );
      }
    }

    return {isValid, errorToSend};
  }

  /**
   * This function should be called whenever a ROAP message is received from the backend.
   *
   * @param roapMessage - ROAP message received
   */
  public roapMessageReceived(roapMessage: RoapMessage): void {
    const {errorType, messageType, sdp, seq, tieBreaker} = roapMessage;

    // do initial validation on the message before we send it to the state machine
    const {isValid, errorToSend} = this.validateIncomingRoapMessage(roapMessage);

    if (!isValid) {
      if (errorToSend) {
        this.sendErrorMessage(seq, errorToSend);
      }

      // message not valid, so stop any further processing
      return;
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
        this.error('roapMessageReceived', `Error received: seq=${seq} type=${errorType}`);

        if (errorType === ErrorType.CONFLICT) {
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

        throw new Error('unhandled messageType');
    }
  }

  public stop() {
    this.stateMachine.stop();
  }

  public getSeq() {
    return this.stateMachine.state.context.seq;
  }
}
