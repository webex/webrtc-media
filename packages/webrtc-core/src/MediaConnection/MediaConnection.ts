import EventEmitter from './EventEmitter';

import {getLogger, getErrorDescription} from './logger';
import {
  isSdpInvalid,
  getLocalTrackInfo,
  mungeLocalSdp,
  mungeLocalSdpForBrowser,
  mungeRemoteSdp,
  TrackKind,
} from './utils';
import {Event, ConnectionState, MediaConnectionEvents, RemoteTrackType} from './eventTypes';

import {MediaConnectionConfig} from './config';

export interface LocalTracks {
  audio?: MediaStreamTrack | null;
  video?: MediaStreamTrack | null;
  screenShareVideo?: MediaStreamTrack | null;
}

export interface ReceiveOptions {
  audio: boolean;
  video: boolean;
  screenShareVideo: boolean;
}
interface Transceivers {
  audio?: RTCRtpTransceiver;
  video?: RTCRtpTransceiver;
  screenShareVideo?: RTCRtpTransceiver;
}

export interface TransceiverStats {
  audio: {
    localTrackLabel?: string;
    currentDirection?: RTCRtpTransceiverDirection;
    sender: RTCStatsReport;
    receiver: RTCStatsReport;
  };
  video: {
    localTrackLabel?: string;
    currentDirection?: RTCRtpTransceiverDirection;
    sender: RTCStatsReport;
    receiver: RTCStatsReport;
  };
  screenShareVideo: {
    localTrackLabel?: string;
    currentDirection?: RTCRtpTransceiverDirection;
    sender: RTCStatsReport;
    receiver: RTCStatsReport;
  };
}

const localTrackTypes = [
  {type: 'audio', kind: 'audio'},
  {type: 'video', kind: 'video'},
  {type: 'screenShareVideo', kind: 'video'},
];

// eslint-disable-next-line import/prefer-default-export
export class MediaConnection extends EventEmitter<MediaConnectionEvents> {
  private id?: string; // used just for logging

  private config: MediaConnectionConfig;

  private pc: RTCPeerConnection;

  private localTracks: LocalTracks;

  private transceivers: Transceivers;

  private receiveOptions: ReceiveOptions;

  private mediaConnectionState: ConnectionState;

  private lastEmittedMediaConnectionState?: ConnectionState;

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
      send: LocalTracks;
      receive: ReceiveOptions;
    },
    debugId?: string
  ) {
    super();

    this.config = mediaConnectionConfig;
    this.receiveOptions = options.receive;
    this.localTracks = options.send;
    this.id = debugId || 'MediaConnection';
    this.transceivers = {};
    this.mediaConnectionState = ConnectionState.NEW;

    this.pc = new window.RTCPeerConnection({
      iceServers: this.config.iceServers,
      bundlePolicy: 'max-compat', // needed for Firefox to create ICE candidates for each m-line
    });

    this.pc.ontrack = this.onTrack.bind(this);
    this.pc.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
    this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this);
  }

  private log(action: string, description: string) {
    getLogger().info(`${this.id}:${action} ${description}`);
  }

  private error(action: string, description: string, error?: Error) {
    getLogger().error(`${this.id}:${action} ${description} ${getErrorDescription(error)}`);
  }

  private createTransceivers() {
    localTrackTypes.forEach(({type, kind}) => {
      const trackType = type as keyof LocalTracks;
      const transceiverType = type as keyof Transceivers;

      const trackInfo = getLocalTrackInfo(
        kind as TrackKind,
        this.receiveOptions[trackType],
        this.localTracks[trackType]
      );

      if (!this.config.skipInactiveTransceivers || trackInfo.direction !== 'inactive') {
        this.transceivers[transceiverType] = this.pc.addTransceiver(trackInfo.trackOrKind, {
          direction: trackInfo.direction,
        });
      }
    });

    this.setupTransceiverListeners();
  }

  /**
   * Makes sure that transceivers are created and local tracks are added to the RTCPeerConnection
   *
   * @param incomingOffer - should be true if this MediaConnection is for an incoming call
   */
  public initializeTransceivers(incomingOffer: boolean): void {
    if (this.pc.getTransceivers().length > 0) {
      this.error('initiateOffer()', 'SDP negotiation already started');

      throw new Error('SDP negotiation already started');
    }

    if (incomingOffer) {
      // for incoming offers we cannot explicitly add transceivers - it would result in extra m-lines that we don't want
      this.addLocalTracks();
    } else {
      this.createTransceivers();
    }
  }

  /**
   * Destroys the media connection.
   */
  // eslint-disable-next-line class-methods-use-this
  public close(): void {
    this.pc.close();

    // clear all the listeners (just in case if we get called on any of them)
    this.pc.ontrack = null;
    this.pc.oniceconnectionstatechange = null;
    this.pc.onconnectionstatechange = null;
    this.pc.onicegatheringstatechange = null;
    this.pc.onicecandidate = null;
    this.pc.onicecandidateerror = null;
  }

  /** Gets the configuration */
  public getConfig(): MediaConnectionConfig {
    return this.config;
  }

  /** Gets the current send and receive options */
  public getSendReceiveOptions() {
    return {send: this.localTracks, receive: this.receiveOptions};
  }

  /**
   * @param options - send and receive options
   *
   * @returns true if a new local SDP offer is needed for the changes to take effect
   */
  private updateTransceivers(options: {send: LocalTracks; receive: ReceiveOptions}): boolean {
    let newOfferNeeded = false;

    this.receiveOptions = options.receive;

    this.identifyTransceivers(); // this is needed here only for the case of update*Options() being called on incoming call after the initial offer came with no remote tracks at all

    localTrackTypes.forEach(({type, kind}) => {
      const trackType = type as keyof LocalTracks;
      const transceiverType = type as keyof Transceivers;

      const track = options.send[trackType];
      const transceiver = this.transceivers[transceiverType];

      if (track !== undefined && track !== this.localTracks[trackType]) {
        this.localTracks[trackType] = track;
        if (transceiver) {
          this.log('updateTransceivers()', `replacing sender track on "${type}" transceiver`);
          transceiver.sender.replaceTrack(track);
        }
      }

      if (transceiver) {
        const trackInfo = getLocalTrackInfo(
          kind as TrackKind,
          this.receiveOptions[trackType],
          this.localTracks[trackType]
        );

        if (transceiver.direction !== trackInfo.direction) {
          this.log(
            'updateTransceivers()',
            `updating direction to ${trackInfo.direction} on "${type}" transceiver`
          );
          transceiver.direction = trackInfo.direction;
          newOfferNeeded = true;
        }
      }
    });

    return newOfferNeeded;
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
   * @returns boolean - true if a new SDP negotiation is required as a result of the update
   */
  public updateSendOptions(tracks: LocalTracks): boolean {
    return this.updateTransceivers({
      send: tracks,
      receive: {
        ...this.receiveOptions,
      },
    });
  }

  /**
   * Updates the choice of which tracks we want to receive
   *
   * @param options - specifies which remote tracks to receive (audio, video, screenShareVideo)
   *
   * @returns boolean - true if a new SDP negotiation is required as a result of the update
   */
  public updateReceiveOptions(options: ReceiveOptions): boolean {
    return this.updateTransceivers({
      send: this.localTracks,
      receive: options,
    });
  }

  /**
   * Updates the choice of which tracks we want to receive
   * and the local tracks to be sent by the RTCPeerConnection
   *
   * @param options - specifies which remote tracks to receive (audio, video, screenShareVideo)
   *                  and which local tracks to update:
   *                  each local track (audio, video, screenShareVideo) can have one of these values:
   *                  - undefined - means "no change"
   *                  - null - means "stop using the current track"
   *                  - a MediaStreamTrack reference - means "replace the current track with this new one"
   *
   * @returns boolean - true if a new SDP negotiation is required as a result of the update
   */
  public updateSendReceiveOptions(options: {send: LocalTracks; receive: ReceiveOptions}): boolean {
    return this.updateTransceivers(options);
  }

  /**
   * @public Returns information about current connection state
   *
   * @returns ConnectionState
   */
  public getConnectionState(): ConnectionState {
    this.log('getConnectionState()', `called, returning ${this.mediaConnectionState}`);

    return this.mediaConnectionState;
  }

  /** Returns the WebRTC stats.
   */
  public getStats(): Promise<RTCStatsReport> {
    return this.pc.getStats();
  }

  /** Returns the WebRTC stats grouped by transceivers.
   */
  public async getTransceiverStats(): Promise<TransceiverStats> {
    // initialize empty result
    const result = {
      audio: {
        sender: new Map(),
        receiver: new Map(),
      },
      video: {
        sender: new Map(),
        receiver: new Map(),
      },
      screenShareVideo: {
        sender: new Map(),
        receiver: new Map(),
      },
    };

    // try to populate the result with stats from the transceivers that we have
    for (const {type} of localTrackTypes) {
      const transceiver = this.transceivers[type as keyof Transceivers];

      if (transceiver) {
        result[type].currentDirection = transceiver.currentDirection;
        result[type].localTrackLabel = transceiver.sender?.track?.label;

        // eslint-disable-next-line no-await-in-loop
        await transceiver.sender.getStats().then((statsReport) => {
          result[type].sender = statsReport;
        });

        // eslint-disable-next-line no-await-in-loop
        await transceiver.receiver.getStats().then((statsReport) => {
          result[type].receiver = statsReport;
        });
      }
    }

    return result;
  }

  /**
   * Calls RTCDTMFSender.insertDTMF() on the main audio sender.
   *
   * @param tones - string of valid DTMF codes to be transmitted
   * @param duration - (optional) duration for each character (in milliseconds)
   * @param interToneGap - (optional) the length of time, in milliseconds, to wait between tones
   * */
  public insertDTMF(tones: string, duration?: number, interToneGap?: number): void {
    if (!this.transceivers.audio) {
      // most likely, the SDP negotiation hasn't been done yet, or audio is not configured at all
      throw new Error('audio transceiver missing');
    }

    if (!this.transceivers.audio.sender) {
      throw new Error('this.transceivers.audio.sender is null');
    }

    if (!this.transceivers.audio.sender.dtmf) {
      // this should never happen as it can be null only for non-audio tracks
      throw new Error('this.transceivers.audio.sender.dtmf is null');
    }

    // the webrtc spec only allows upper case letters, but most browsers (except some older
    // safari like 14.1) work fine also with lower case, so for consistency and ease
    // of use we make sure that it works on any browser by converting tone to upper case
    this.transceivers.audio.sender.dtmf.insertDTMF(tones.toUpperCase(), duration, interToneGap);
  }

  private setupTransceiverListeners() {
    if (this.transceivers.audio?.sender?.dtmf) {
      this.transceivers.audio.sender.dtmf.ontonechange = this.onToneChange.bind(this);
    }
  }

  private onToneChange(event: RTCDTMFToneChangeEvent) {
    this.log('onToneChange()', `emitting Event.DTMF_TONE_CHANGED with tone="${event.tone}"`);
    this.emit(Event.DTMF_TONE_CHANGED, {tone: event.tone});
  }

  private identifyTransceivers() {
    /* this is needed only in case of an incoming call where the first SDP offer comes from the far end */
    if (
      !this.transceivers.audio &&
      !this.transceivers.video &&
      !this.transceivers.screenShareVideo
    ) {
      const transceivers = this.pc.getTransceivers();

      this.log('identifyTransceivers()', `transceivers.length=${transceivers.length}`);
      transceivers.forEach((transceiver, idx) => {
        this.log('identifyTransceivers()', `transceiver[${idx}].mid=${transceiver.mid}`);
      });

      // todo: check if transceivers order always matches the m-lines in remote SDP offer in all the browsers
      [this.transceivers.audio, this.transceivers.video, this.transceivers.screenShareVideo] =
        transceivers;

      this.setupTransceiverListeners();
    }
  }

  private onTrack(event: RTCTrackEvent) {
    this.log('onTrack()', `callback called: event=${JSON.stringify(event)}`);

    // TODO: this code is copied from the SDK, it relies on hardcoded MID values 0,1,2 later on we can look into improving this
    const MEDIA_ID = {
      AUDIO_TRACK: '0',
      VIDEO_TRACK: '1',
      SHARE_TRACK: '2',
    };

    const {track} = event;
    let trackMediaID = null;

    this.identifyTransceivers();

    // In case of safari on some os versions the transceiver is not present in the event,
    // so fall back to using the track id
    if (event.transceiver?.mid) {
      this.log('onTrack()', 'identifying track by event.transceiver.mid');
      trackMediaID = event.transceiver.mid; // todo: this might not work for "calling" project incoming calls
    } else if (track.id === this.transceivers.audio?.receiver?.track?.id) {
      trackMediaID = MEDIA_ID.AUDIO_TRACK;
    } else if (track.id === this.transceivers.video?.receiver?.track?.id) {
      trackMediaID = MEDIA_ID.VIDEO_TRACK;
    } else if (track.id === this.transceivers.screenShareVideo?.receiver?.track?.id) {
      trackMediaID = MEDIA_ID.SHARE_TRACK;
    } else {
      trackMediaID = null;
    }

    this.log('onTrack()', `trackMediaID=${trackMediaID}`);
    switch (trackMediaID) {
      case MEDIA_ID.AUDIO_TRACK:
        this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=AUDIO');
        this.emit(Event.REMOTE_TRACK_ADDED, {
          type: RemoteTrackType.AUDIO,
          track,
        });
        break;
      case MEDIA_ID.VIDEO_TRACK:
        this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=VIDEO');
        this.emit(Event.REMOTE_TRACK_ADDED, {
          type: RemoteTrackType.VIDEO,
          track,
        });
        break;
      case MEDIA_ID.SHARE_TRACK:
        this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=SCREENSHARE_VIDEO');
        this.emit(Event.REMOTE_TRACK_ADDED, {
          type: RemoteTrackType.SCREENSHARE_VIDEO,
          track,
        });
        break;
      default: {
        this.error('onTrack()', `failed to match remote track media id: ${trackMediaID}`);
      }
    }
  }

  private addLocalTracks() {
    this.log('addLocalTracks()', `adding tracks ${JSON.stringify(this.localTracks)}`);

    if (this.localTracks.audio) {
      this.pc.addTrack(this.localTracks.audio);
    }
    /* todo: this won't work correctly if we have a screenshare track but no video track (screenshare will be added to the wrong transceiver)
     * we will need to create some dummy video track and add it before adding screenshare */
    if (this.localTracks.video) {
      this.pc.addTrack(this.localTracks.video);
    }
    if (this.localTracks.screenShareVideo) {
      this.pc.addTrack(this.localTracks.screenShareVideo);
    }
  }

  private onConnectionStateChange() {
    this.log(
      'onConnectionStateChange()',
      `callback called: connectionState=${this.pc.connectionState}`
    );

    this.evaluateMediaConnectionState();
  }

  private onIceConnectionStateChange() {
    this.log(
      'onIceConnectionStateChange()',
      `callback called: iceConnectionState=${this.pc.iceConnectionState}`
    );

    this.evaluateMediaConnectionState();
  }

  private evaluateMediaConnectionState() {
    const rtcPcConnectionState = this.pc.connectionState;
    const iceState = this.pc.iceConnectionState;

    const connectionStates = [rtcPcConnectionState, iceState];

    if (connectionStates.some((value) => value === 'closed')) {
      this.mediaConnectionState = ConnectionState.CLOSED;
    } else if (connectionStates.some((value) => value === 'failed')) {
      this.mediaConnectionState = ConnectionState.FAILED;
    } else if (connectionStates.some((value) => value === 'disconnected')) {
      this.mediaConnectionState = ConnectionState.DISCONNECTED;
    } else if (connectionStates.every((value) => value === 'connected' || value === 'completed')) {
      this.mediaConnectionState = ConnectionState.CONNECTED;
    } else {
      this.mediaConnectionState = ConnectionState.CONNECTING;
    }

    this.log(
      'evaluateConnectionState',
      `iceConnectionState=${iceState} rtcPcConnectionState=${rtcPcConnectionState} => mediaConnectionState=${this.mediaConnectionState}`
    );

    if (this.lastEmittedMediaConnectionState !== this.mediaConnectionState) {
      this.emit(Event.CONNECTION_STATE_CHANGED, {state: this.mediaConnectionState});
      this.lastEmittedMediaConnectionState = this.mediaConnectionState;
    }
  }

  public createLocalOffer(): Promise<{sdp: string}> {
    return this.pc
      .createOffer()
      .then((description: RTCSessionDescriptionInit) => {
        this.log('createLocalOffer', 'local SDP offer created');

        const mungedDescription = {
          type: description.type,
          sdp: mungeLocalSdpForBrowser(this.config.sdpMunging, description?.sdp || ''),
        };

        return this.pc.setLocalDescription(mungedDescription);
      })
      .then(() => this.waitForIceCandidates())
      .then(() => {
        const mungedSdp = mungeLocalSdp(
          this.config.sdpMunging,
          this.pc.localDescription?.sdp || ''
        );

        return {sdp: mungedSdp};
      });
  }

  public handleRemoteOffer(sdp?: string): Promise<{sdp: string}> {
    this.log('handleRemoteOffer', 'called');

    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }

    const mungedRemoteSdp = mungeRemoteSdp(this.config.sdpMunging, sdp);

    return this.pc
      .setRemoteDescription(
        new window.RTCSessionDescription({
          type: 'offer',
          sdp: mungedRemoteSdp,
        })
      )
      .then(() => this.pc.createAnswer())
      .then((answer: RTCSessionDescriptionInit) => {
        const mungedAnswer = {
          type: answer.type,
          sdp: mungeLocalSdpForBrowser(this.config.sdpMunging, answer?.sdp || ''),
        };

        return this.pc.setLocalDescription(mungedAnswer);
      })
      .then(() => this.waitForIceCandidates())
      .then(() => {
        const mungedLocalSdp = mungeLocalSdp(
          this.config.sdpMunging,
          this.pc.localDescription?.sdp || ''
        );

        return {sdp: mungedLocalSdp};
      });
  }

  public handleRemoteAnswer(sdp?: string): Promise<void> {
    this.log('handleRemoteAnswer', 'called');

    if (!sdp) {
      return Promise.reject(new Error('SDP missing'));
    }

    const mungedRemoteSdp = mungeRemoteSdp(this.config.sdpMunging, sdp);

    return this.pc.setRemoteDescription(
      new window.RTCSessionDescription({
        type: 'answer',
        sdp: mungedRemoteSdp,
      })
    );
  }

  private waitForIceCandidates(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startTime = performance.now();

      let done = false;

      const isLocalSdpValid = () =>
        !isSdpInvalid(
          {
            allowPort0: !!this.config.sdpMunging.convertPort9to0,
            requireH264: !!this.config.requireH264,
          },
          this.error.bind(this),
          this.pc.localDescription?.sdp
        );

      const doneGatheringIceCandidates = () => {
        if (!done) {
          const miliseconds = performance.now() - startTime;

          this.log('waitForIceCandidates()', `checking SDP...`);

          if (!isLocalSdpValid()) {
            this.error('waitForIceCandidates()', 'SDP not valid after waiting.');
            reject(new Error('SDP not valid'));
          }
          this.log(
            'waitForIceCandidates()',
            `It took ${miliseconds} miliseconds to gather ice candidates`
          );

          done = true;
          // clear the callbacks, as we don't need them anymore
          this.pc.onicegatheringstatechange = null;
          this.pc.onicecandidate = null;
          this.pc.onicecandidateerror = null;
          resolve();
        }
      };

      // even if gathering state says "complete", the SDP might be missing candidates,
      // this can happen when ICE restart is being done (triggered by us or the far end)
      if (this.pc.iceGatheringState === 'complete' && isLocalSdpValid()) {
        this.log(
          'waitForIceCandidates()',
          'iceGatheringState is already "complete" and local SDP is valid'
        );
        resolve();

        return;
      }

      this.log('waitForIceCandidates()', 'waiting for ICE candidates to be gathered...');

      this.pc.onicegatheringstatechange = () => {
        this.log(
          'waitForIceCandidates()',
          `iceGatheringState changed to ${this.pc.iceGatheringState}`
        );
        if (this.pc.iceGatheringState === 'complete') {
          doneGatheringIceCandidates();
        }
      };

      this.pc.onicecandidate = (evt) => {
        if (evt.candidate === null) {
          this.log('waitForIceCandidates()', 'evt.candidate === null received');
          doneGatheringIceCandidates();
        } else {
          this.log(
            'waitForIceCandidates()',
            `ICE Candidate(${evt.candidate?.sdpMLineIndex}): ${evt.candidate?.candidate}`
          );
        }
      };

      this.pc.onicecandidateerror = (event) => {
        this.error('waitForIceCandidates()', `onicecandidateerror: ${event}`);
        reject(new Error('Error gathering ICE candidates'));
      };
    });
  }
}
