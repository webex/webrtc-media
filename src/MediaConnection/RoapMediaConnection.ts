import EventEmitter from 'events';

import logger from '../Logger';
import {ROAP_MEDIA_CONNECTION} from '../constants';
import {MediaConnection} from './MediaConnection';
import {Roap} from './roap';
import {
  Event,
  ConnectionState,
  ConnectionStateChangedEvent,
  RemoteTrackAddedEvent,
  RoapMessage,
  RoapMessageEvent,
} from './eventTypes';

import {MediaConnectionConfig} from './config';

interface LocalTracks {
  audio?: MediaStreamTrack | null;
  video?: MediaStreamTrack | null;
  screenShareVideo?: MediaStreamTrack | null;
}

// eslint-disable-next-line import/prefer-default-export
export class RoapMediaConnection extends EventEmitter {
  private id?: string; // used just for logging

  private mediaConnection: MediaConnection;

  private roap: Roap;

  private sdpNegotiationStarted = false;

  /**
   * Class that provides a simple high level API for creating
   * and managing a media connection (using webrtc RTCPeerConnection).
   *
   * @param MediaConnectionConfig - configuration for the media connection
   * @param send - local tracks that are going to be sent our
   * @param receive - options choosing which remote tracks will be received
   * @param debugId - optional string to identify the media connection in the logs
   */
  constructor(
    mediaConnectionConfig: MediaConnectionConfig,
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
    debugId?: string
  ) {
    super();

    this.id = debugId || 'RoapMediaConnection';

    this.mediaConnection = new MediaConnection(mediaConnectionConfig, options, debugId);
    this.mediaConnection.on(Event.REMOTE_TRACK_ADDED, this.onRemoteTrack.bind(this));
    this.mediaConnection.on(
      Event.CONNECTION_STATE_CHANGED,
      this.onConnectionStateChanged.bind(this)
    );

    this.roap = new Roap(
      this.createLocalOffer.bind(this),
      this.handleRemoteOffer.bind(this),
      this.handleRemoteAnswer.bind(this),
      debugId
    );
    this.roap.on(Event.ROAP_MESSAGE_TO_SEND, this.onRoapMessageToSend.bind(this));
    this.roap.on(Event.ROAP_FAILURE, this.onRoapFailure.bind(this));

    this.log(
      'constructor()',
      `config: ${JSON.stringify(mediaConnectionConfig)}, options: ${JSON.stringify(options)}`
    );
  }

  private log(action: string, description: string) {
    logger.info({
      ID: this.id,
      mediaType: ROAP_MEDIA_CONNECTION,
      action,
      description,
    });
  }

  private error(action: string, description: string) {
    logger.error({
      ID: this.id,
      mediaType: ROAP_MEDIA_CONNECTION,
      action,
      description,
    });
  }

  /**
   * Starts the process of establishing the connection by creating a local SDP offer.
   *
   * Use Event.CONNECTION_STATE_CHANGED to know when connection has been established.
   * Use Event.ROAP_MESSAGE_TO_SEND to know the local SDP offer created.
   * Use Event.REMOTE_TRACK_ADDED to know about the remote tracks being received.
   *
   * @returns Promise - promise that's resolved once the local offer has been created
   */
  public initiateOffer(): Promise<void> {
    this.log('initiateOffer()', 'called');

    if (this.sdpNegotiationStarted) {
      this.error('initiateOffer()', 'SDP negotiation already started');

      return Promise.reject(new Error('SDP negotiation already started'));
    }

    this.mediaConnection.initializeTransceivers(false);
    this.sdpNegotiationStarted = true;

    return this.roap.initiateOffer();
  }

  /**
   * Destroys the media connection.
   */
  // eslint-disable-next-line class-methods-use-this
  public close(): void {
    this.log('close()', 'called');

    this.mediaConnection.close();
    // todo
  }

  /**
   * Restarts the ICE connection.
   */
  // eslint-disable-next-line class-methods-use-this
  public reconnect(): void {
    this.log('reconnect()', 'called');

    this.mediaConnection.reconnect();
    // todo
  }

  /**
   * Updates the local tracks to be sent by the RTCPeerConnection.
   *
   *
   * @param tracks - specifies which local tracks to update:
   *                 each track (audio, video, screenShareVideo) can have one of these values:
   *                 - undefined - means "no change"
   *                 - null - means "stop using the current track"
   *                 - a MediaStreamTrack reference - means "replace the current track with this new one"
   *
   * @returns Promise - promise that's resolved once the new SDP exchange is initiated
   *                    or immediately if no new SDP exchange is needed
   */
  public updateSendOptions(tracks: LocalTracks): Promise<void> {
    this.log('updateSendOptions()', `called with ${JSON.stringify(tracks)}`);

    // todo: maybe instead of returning a boolean here the MediaConnection should just fire an event like "negotiationNeeded"
    const newOfferNeeded = this.mediaConnection.updateSendOptions(tracks);

    if (newOfferNeeded) {
      this.log('updateSendOptions()', 'triggering offer...');

      return this.roap.initiateOffer();
    }

    return Promise.resolve();
  }

  /**
   * Updates the choice of which tracks we want to receive
   *
   * @param options - specifies which remote tracks to receieve (audio, video, screenShareVideo)
   *
   * @returns Promise - promise that's resolved once the new SDP exchange is initiated
   *                    or immediately if no new SDP exchange is needed
   */
  public updateReceiveOptions(options: {
    audio: boolean;
    video: boolean;
    screenShareVideo: boolean;
  }): Promise<void> {
    this.log('updateReceiveOptions()', `called with ${JSON.stringify(options)}`);

    const newOfferNeeded = this.mediaConnection.updateReceiveOptions(options);

    if (newOfferNeeded) {
      this.log('updateReceiveOptions()', 'triggering offer...');

      return this.roap.initiateOffer();
    }

    return Promise.resolve();
  }

  /**
   * Updates the choice of which tracks we want to receive
   * and the local tracks to be sent by the RTCPeerConnection
   *
   * @param options - specifies which remote tracks to receieve (audio, video, screenShareVideo)
   *                  and which local tracks to update:
   *                  each local track (audio, video, screenShareVideo) can have one of these values:
   *                  - undefined - means "no change"
   *                  - null - means "stop using the current track"
   *                  - a MediaStreamTrack reference - means "replace the current track with this new one"
   *
   * @returns Promise - promise that's resolved once the new SDP exchange is initiated
   *                    or immediately if no new SDP exchange is needed
   */
  public updateSendReceiveOptions(options: {
    send: LocalTracks;
    receive: {
      audio: boolean;
      video: boolean;
      screenShareVideo: boolean;
    };
  }): Promise<void> {
    this.log('updateSendReceiveOptions()', `called with ${JSON.stringify(options)}`);

    const newOfferNeeded = this.mediaConnection.updateSendReceiveOptions(options);

    if (newOfferNeeded) {
      this.log('updateSendReceiveOptions()', 'triggering offer...');

      return this.roap.initiateOffer();
    }

    return Promise.resolve();
  }

  /**
   * @public Returns information about current connection state
   *
   * @returns ConnectionState
   */
  public getConnectionState(): ConnectionState {
    return this.mediaConnection.getConnectionState();
  }

  /** Returns the curent value of WebRTC stats of the media connection.
   */
  public getStats(): Promise<RTCStatsReport> {
    return this.mediaConnection.getStats();
  }

  /**
   * This function should be called whenever a ROAP message is received from the backend.
   *
   * @param roapMessage - ROAP message received
   */
  public roapMessageReceived(roapMessage: RoapMessage): void {
    this.log(
      'roapMessageReceived()',
      `called with messageType=${roapMessage.messageType}, seq=${roapMessage.seq}`
    );

    if (!this.sdpNegotiationStarted && roapMessage.messageType === 'OFFER') {
      // this is the first SDP exchange, with an offer coming from the backend
      this.sdpNegotiationStarted = true;
      this.mediaConnection.initializeTransceivers(true);
    }

    this.roap.roapMessageReceived(roapMessage);
  }

  private onRoapMessageToSend(event: RoapMessageEvent) {
    this.emit(Event.ROAP_MESSAGE_TO_SEND, event);
  }

  private onRoapFailure() {
    this.emit(Event.ROAP_FAILURE);
  }

  private onRemoteTrack(event: RemoteTrackAddedEvent) {
    this.emit(Event.REMOTE_TRACK_ADDED, event);
  }

  private onConnectionStateChanged(event: ConnectionStateChangedEvent) {
    this.emit(Event.CONNECTION_STATE_CHANGED, event);
  }

  private createLocalOffer(): Promise<{sdp: string}> {
    return this.mediaConnection.createLocalOffer();
  }

  private handleRemoteOffer(sdp?: string): Promise<{sdp: string}> {
    return this.mediaConnection.handleRemoteOffer(sdp);
  }

  private handleRemoteAnswer(sdp?: string): Promise<void> {
    return this.mediaConnection.handleRemoteAnswer(sdp);
  }
}
