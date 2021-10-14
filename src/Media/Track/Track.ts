// eslint-disable-next-line no-shadow
export enum TrackStatus {
  ENDED = 'ended',
  LIVE = 'live',
}

// eslint-disable-next-line no-shadow
export enum TrackKind {
  AUDIO = 'audio',
  VIDEO = 'video',
}

interface TrackInterface {
  ID: string;
  kind: TrackKind;
  status: TrackStatus;
  muted: boolean;
  label: string;
  stop(): void;
}

/** @public */
export class Track implements TrackInterface {
  ID: string;

  kind: TrackKind;

  status: TrackStatus;

  muted: boolean;

  label: string;

  #mediaStreamTrack: MediaStreamTrack;

  constructor(mediaStreamTrack: MediaStreamTrack) {
    this.ID = mediaStreamTrack.id;
    this.kind = mediaStreamTrack.kind as TrackKind;
    this.status = mediaStreamTrack.readyState as TrackStatus;
    this.muted = mediaStreamTrack.muted;
    this.label = mediaStreamTrack.label;
    this.#mediaStreamTrack = mediaStreamTrack;
  }

  /**
   * Tells the browser that the track source is no longer needed. Updates status to ENDED.
   *
   * @public
   */
  stop(): void {
    this.#mediaStreamTrack.stop();
    this.status = TrackStatus.ENDED;
  }
}
