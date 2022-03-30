import EventEmitter from 'events';

import {DEVICE, MEDIA} from '../../constants';
import logger from '../../Logger';

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
export class Track extends EventEmitter implements TrackInterface {
  ID: string;

  kind: TrackKind;

  status: TrackStatus;

  muted: boolean;

  label: string;

  #mediaStreamTrack: MediaStreamTrack;

  constructor(mediaStreamTrack: MediaStreamTrack) {
    super();
    this.ID = mediaStreamTrack.id;
    this.kind = mediaStreamTrack.kind as TrackKind;
    this.status = mediaStreamTrack.readyState as TrackStatus;
    this.muted = mediaStreamTrack.muted;
    this.label = mediaStreamTrack.label;
    this.#mediaStreamTrack = mediaStreamTrack;
    this.#mediaStreamTrack.onmute = () => {
      // using arrow function which should bind to this from outer scope track
      const action = this.#mediaStreamTrack.enabled ? 'muted' : 'unmuted';
      // TODO:  Move this logic else where

      this.emit('track:mute', {
        action,
      });
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
    logger.debug({
      ID: constraints?.deviceId?.toString(),
      mediaType: DEVICE,
      action: 'applyConstraints()',
      description: `Called with ${JSON.stringify(constraints)}`,
    });
    logger.info({
      ID: constraints?.deviceId?.toString(),
      mediaType: DEVICE,
      action: 'applyConstraints()',
      description: 'Applying constraints to track objects',
    });

    const supportedConstraints: MediaTrackSupportedConstraints =
      navigator.mediaDevices.getSupportedConstraints();
    const notSupportedConstraints = [];

    for (const thisConstraint of Object.keys(constraints)) {
      if (!supportedConstraints[thisConstraint as keyof MediaTrackSupportedConstraints]) {
        logger.debug({
          ID: constraints?.deviceId?.toString(),
          mediaType: DEVICE,
          action: 'applyConstraints()',
          description: `Not suported constraint tracked ${thisConstraint}`,
        });
        notSupportedConstraints.push(thisConstraint);
      }
    }

    if (notSupportedConstraints.length > 0) {
      console.warn(`#TrackObject Unsupported constraints - ${notSupportedConstraints.join(', ')}`);
      logger.debug({
        ID: constraints?.deviceId?.toString(),
        mediaType: DEVICE,
        action: 'applyConstraints()',
        description: 'Constraints not applied',
      });

      return false;
    }

    await this.#mediaStreamTrack.applyConstraints(constraints);
    logger.debug({
      ID: constraints?.deviceId?.toString(),
      mediaType: DEVICE,
      action: 'applyConstraints()',
      description: 'Constraints applied successfully',
    });

    return true;
  }

  /**
   * This function gets the constraint applied on the track
   *
   * @returns MediaTrackSettings - settings of media track
   */
  getSettings(): MediaTrackSettings {
    logger.debug({
      mediaType: MEDIA,
      action: 'getSettings()',
      description: 'Called',
    });
    logger.info({
      mediaType: MEDIA,
      action: 'getSettings()',
      description: 'Fetching constraints properties for the current media stream track',
    });
    const settings = this.#mediaStreamTrack.getSettings();

    logger.debug({
      mediaType: MEDIA,
      action: 'getSettings()',
      description: `Received settings ${JSON.stringify(settings)}`,
    });

    return settings;
  }

  /**
   * This method returns the underlying MediaStreamTrack
   *
   * @returns #mediaStreamTrack of type MediaStreamTrack
   */
  getMediaStreamTrack(): MediaStreamTrack {
    logger.debug({
      mediaType: MEDIA,
      action: 'getMediaStreamTrack()',
      description: 'Called',
    });
    const mediaStreamTrack = this.#mediaStreamTrack;

    logger.debug({
      mediaType: MEDIA,
      action: 'getMediaStreamTrack()',
      description: `Received media stream track ${JSON.stringify(mediaStreamTrack)}`,
    });

    return mediaStreamTrack;
  }
}
