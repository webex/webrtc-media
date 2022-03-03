import {trackMutePublisher} from '../Events/index';
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

export interface TrackInterface {
  ID: string;
  kind: TrackKind;
  status: TrackStatus;
  muted: boolean;
  label: string;
  stop(): void;
  getSettings(): MediaTrackSettings;
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
    this.#mediaStreamTrack.onmute = (event) => {
      // using arrow function which should bind to this from outer scope track
      trackMutePublisher(event, this);
    };
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

  /**
   * Handles applying constraints for MediaStreamTrack objects
   *
   * @param constraints - Object to apply constraints
   * @returns boolean that is `true` if constraints are successfully applied, `false` otherwise
  */
  async applyConstraints(constraints: MediaTrackConstraints): Promise<boolean> {
    const supportedConstraints: MediaTrackSupportedConstraints = (
      navigator.mediaDevices.getSupportedConstraints()
    );
    const notSupportedConstraints = [];

    for (const thisConstraint of Object.keys(constraints)) {
      if (!supportedConstraints[thisConstraint as keyof MediaTrackSupportedConstraints]) {
        notSupportedConstraints.push(thisConstraint);
      }
    }

    if (notSupportedConstraints.length > 0) {
      console.warn(`#TrackObject Unsupported constraints - ${notSupportedConstraints.join(', ')}`);

      return false;
    }

    await this.#mediaStreamTrack.applyConstraints(constraints);

    return true;
  }

  /**
   * This function gets the constraint applied on the track
   *
   * @returns MediaTrackSettings - settings of media track
  */
  getSettings(): MediaTrackSettings {
    return this.#mediaStreamTrack.getSettings();
  }

  /**
   * This method returns the underlying MediaStreamTrack
   *
   * @returns #mediaStreamTrack of type MediaStreamTrack
  */
  getMediaStreamTrack(): MediaStreamTrack {
    return this.#mediaStreamTrack;
  }
}
