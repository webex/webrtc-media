import 'webrtc-adapter';
import EventEmitter from 'events';

import {log, error} from './logger';
import {isSdpInvalid, mungeLocalSdp} from './utils';
import {Event, RoapMessage} from './eventTypes';

import {MediaConnectionConfig} from './config';

// TODO: use a state machine engine for managing this state
export enum NegotiationState {
  IDLE = 'idle',
  CREATING_OFFER = 'creating_offer',
  SETTING_LOCAL_OFFER = 'setting_local_offer',
  WAITING_FOR_REMOTE_ANSWER = 'waiting_for_remote_answer',
  SETTING_REMOTE_ANSWER = 'setting_remote_answer',
  SETTING_REMOTE_OFFER = 'setting_remote_offer',
  CREATING_ANSWER = 'creating_answer',
  SETTING_LOCAL_ANSWER = 'setting_local_answer',
}

export class Roap extends EventEmitter {
  public negotiationState: NegotiationState;

  private seq: number;

  private id: string; // used just for logging

  private pc: RTCPeerConnection;

  private config: MediaConnectionConfig;

  constructor(pc: RTCPeerConnection, config: MediaConnectionConfig, debugId?: string) {
    super();

    this.id = debugId || 'ROAP';
    this.config = config;
    this.seq = 0;
    this.pc = pc;
    this.negotiationState = NegotiationState.IDLE;
  }

  /**
   * Starts SDP negotiation by creating a local offer.
   *
   * @returns Promise<void>
   */
  public initiateOffer(): Promise<void> {
    if (this.negotiationState !== NegotiationState.IDLE) {
      return Promise.reject(
        new Error(`cannot start new negotiation in state ${this.negotiationState}`),
      );
    }

    this.seq += 1;
    this.negotiationState = NegotiationState.CREATING_OFFER;

    return this.pc
      .createOffer()
      .then((description: RTCSessionDescriptionInit) => {
        log(`[${this.id}] local SDP offer created`);
        this.negotiationState = NegotiationState.SETTING_LOCAL_OFFER;

        return this.pc.setLocalDescription(description);
      })
      .then(() => this.checkIceCandidates())
      .then(() => {
        log(`[${this.id}] local SDP offer set`);
        this.negotiationState = NegotiationState.WAITING_FOR_REMOTE_ANSWER;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription!.sdp);

        this.emit(Event.ROAP_MESSAGE_TO_SEND, {
          roapMessage: {
            seq: this.seq,
            messageType: 'OFFER',
            sdp: mungedSdp,
            tieBreaker: 4294967294, // TODO
          },
        });
      });
  }

  /**
   * This function should be called whenever a ROAP message is received from the backend.
   *
   * @param roapMessage - ROAP message received
   */
  public roapMessageReceived(roapMessage: RoapMessage): Promise<void> {
    const {messageType, sdp} = roapMessage;

    if (!this.pc) {
      return Promise.reject(new Error('RTCPeerConnection object is missing'));
    }

    // for now we're doing just these basic checks of state and fail, TODO: improve this and handle glare
    if (messageType === 'OFFER' && this.negotiationState !== NegotiationState.IDLE) {
      return Promise.reject(
        new Error(`received SDP offer in the wrong state: ${this.pc.signalingState}`),
      );
    }

    if (
      messageType === 'ANSWER' &&
      this.negotiationState !== NegotiationState.WAITING_FOR_REMOTE_ANSWER
    ) {
      return Promise.reject(
        new Error(`received SDP answer in the wrong state: ${this.pc.signalingState}`),
      );
    }
    // TODO: check if seq matches when receiving ANSWER

    switch (messageType) {
      case 'ANSWER':
        return this.handleRoapAnswer(sdp);

      case 'OFFER':
        return this.handleRoapOffer(sdp);

      case 'OK':
        // TODO
        return Promise.resolve();

      case 'ERROR':
        // TODO
        return Promise.resolve();

      default:
        error(`[${this.id}] unsupported messageType: ${messageType}`);

        return Promise.reject(new Error('unhandled messageType'));
    }
  }

  private handleRoapOffer(sdp?: string): Promise<void> {
    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }

    this.negotiationState = NegotiationState.SETTING_REMOTE_OFFER;
    this.seq += 1;
    log(`[${this.id}] handling ROAP offer`);

    return this.pc
      .setRemoteDescription(
        new window.RTCSessionDescription({
          type: 'offer',
          sdp,
        }),
      )
      .then(() => {
        this.negotiationState = NegotiationState.CREATING_ANSWER;

        return this.pc.createAnswer();
      })
      .then((answer: RTCSessionDescriptionInit) => {
        this.negotiationState = NegotiationState.SETTING_LOCAL_ANSWER;

        return this.pc.setLocalDescription(answer);
      })
      .then(() => this.checkIceCandidates())
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription!.sdp);

        this.negotiationState = NegotiationState.IDLE;

        this.emit(Event.ROAP_MESSAGE_TO_SEND, {
          roapMessage: {
            seq: this.seq,
            messageType: 'ANSWER',
            sdp: mungedSdp,
          },
        });
      });
  }

  private handleRoapAnswer(sdp?: string): Promise<void> {
    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }
    this.negotiationState = NegotiationState.SETTING_REMOTE_ANSWER;

    return this.pc
      .setRemoteDescription(
        new window.RTCSessionDescription({
          type: 'answer',
          sdp,
        }),
      )
      .then(() => {
        this.negotiationState = NegotiationState.IDLE;

        this.emit(Event.ROAP_MESSAGE_TO_SEND, {
          roapMessage: {
            seq: this.seq,
            messageType: 'OK',
          },
        });
      });
  }

  // todo: this logic and also SDP munging don't really belong to ROAP so should probably be done through callbacks back in MediaConnection
  private checkIceCandidates(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startTime = performance.now();

      let done = false;

      const doneGatheringIceCandidates = () => {
        if (!done) {
          const miliseconds = performance.now() - startTime;

          log(`[${this.id}] checking SDP...`);

          const invalidSdpPresent = isSdpInvalid(
            {
              allowPort0: !!this.config.sdpMunging.convertPort9to0,
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.pc.localDescription!.sdp,
          );

          if (invalidSdpPresent) {
            error(`[${this.id}] SDP not valid after waiting.`);
            reject(new Error('SDP not valid'));
          }
          // todo: show this log only the first time:
          log(`[${this.id}] It took ${miliseconds} miliseconds to gather ice candidates`);

          done = true;
          resolve();
        }
      };

      if (this.pc.iceGatheringState === 'complete') {
        log(`[${this.id}] iceGatheringState is already "complete"`);
        doneGatheringIceCandidates();
      }

      this.pc.onicegatheringstatechange = () => {
        log(`[${this.id}] iceGatheringState changed to ${this.pc.iceGatheringState}`);
        if (this.pc.iceGatheringState === 'complete') {
          doneGatheringIceCandidates();
        }
      };

      this.pc.onicecandidate = (evt) => {
        if (evt.candidate === null) {
          log(`[${this.id}] evt.candidate === null received`);
          doneGatheringIceCandidates();
        } else {
          log(`[${this.id}] ICE Candidate: ${evt.candidate?.candidate}`);
        }
      };

      this.pc.onicecandidateerror = (event) => {
        error(`[${this.id}] onicecandidateerror: ${event}`);
        reject(new Error('Error gathering ICE candidates'));
      };
    });
  }
}
