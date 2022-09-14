import {EventMap} from 'typed-emitter';

/**
 * All possible event types that can be emitted by RoapMediaConnection,
 * see AllEvents for details about the event data.
 */
export enum Event {
  CONNECTION_STATE_CHANGED = 'connectionState:changed', // connection state has changed
  REMOTE_TRACK_ADDED = 'remoteTrack:added', // new remote track has been added
  ROAP_MESSAGE_TO_SEND = 'roap:messageToSend', // a ROAP message needs to be sent to the backend
  ROAP_STARTED = 'roap:started', // a new SDP exchange has just started
  ROAP_FAILURE = 'roap:failure', // Roap state machine reached an unrecoverable error state
  ROAP_DONE = 'roap:done', // indicates that a full OFFER-ANSWER-OK ROAP sequence has been completed
  DTMF_TONE_CHANGED = 'dtmfTone:changed', // DTMF tone finished playing
}

// Overall connection state (based on the ICE and DTLS connection states)
export enum ConnectionState {
  NEW = 'NEW', // connection attempt has not been started
  CLOSED = 'CLOSED', // connection closed, there is no way to move out of this state
  CONNECTED = 'CONNECTED', // both ICE and DTLS connections are established, media is flowing
  CONNECTING = 'CONNECTING', // initial connection attempt in progress
  DISCONNECTED = 'DISCONNECTED', // connection lost temporarily, the browser is trying to re-establish it automatically
  FAILED = 'FAILED', // connection failed, a call to reconnect() is required to try again
}

export interface ConnectionStateChangedEvent {
  state: ConnectionState; // current connection state
}

export enum RemoteTrackType {
  AUDIO = 'audio',
  VIDEO = 'video',
  SCREENSHARE_VIDEO = 'screenShareVideo',
}

export interface RemoteTrackAddedEvent {
  type: RemoteTrackType;
  track: MediaStreamTrack;
}

export enum ErrorType {
  DOUBLECONFLICT = 'DOUBLECONFLICT',
  CONFLICT = 'CONFLICT',
  FAILED = 'FAILED',
  INVALID_STATE = 'INVALID_STATE',
  NOMATCH = 'NOMATCH', // not used
  OUT_OF_ORDER = 'OUT_OF_ORDER',
  REFUSED = 'REFUSED', // not used
  RETRY = 'RETRY',
  TIMEOUT = 'TIMEOUT', // not used
}

// TODO: create separate type for each roap message type

/**
 * see https://tools.ietf.org/id/draft-jennings-rtcweb-signaling-01.html for details
 */
export interface RoapMessage {
  seq: number;
  messageType: 'OFFER' | 'OFFER_REQUEST' | 'OFFER_RESPONSE' | 'ANSWER' | 'OK' | 'ERROR';
  sdp?: string;
  tieBreaker?: number;
  errorCause?: string; // used only if messageType==='ERROR'
  errorType?: ErrorType; // used only if messageType==='ERROR'
  retryAfter?: number; // in seconds, used only with some errors (messageType==='ERROR')
}

export interface RoapMessageEvent {
  roapMessage: RoapMessage; // roap message that needs to be sent to the backend as soon as possible
}

/**
 * Wrapper over RTCDTMFToneChangeEvent
 */
export interface DtmfToneChangedEvent {
  tone: string;
}

export interface MediaConnectionEvents extends EventMap {
  [Event.CONNECTION_STATE_CHANGED]: (event: ConnectionStateChangedEvent) => void;
  [Event.REMOTE_TRACK_ADDED]: (event: RemoteTrackAddedEvent) => void;
  [Event.DTMF_TONE_CHANGED]: (event: DtmfToneChangedEvent) => void;
}

export interface RoapEvents extends EventMap {
  [Event.ROAP_DONE]: () => void;
  [Event.ROAP_MESSAGE_TO_SEND]: (event: RoapMessageEvent) => void;
  [Event.ROAP_FAILURE]: () => void;
}

export type AllEvents = MediaConnectionEvents | RoapEvents;

export type AnyEvent =
  | ConnectionStateChangedEvent
  | RemoteTrackAddedEvent
  | RoapMessageEvent
  | DtmfToneChangedEvent
  | undefined;
