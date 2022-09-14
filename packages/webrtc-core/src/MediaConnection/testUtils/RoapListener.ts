import EventEmitter from '../EventEmitter';
import {EventListener, LogFn, Options} from './EventListener';
import {Event, RoapEvents, RoapMessage, RoapMessageEvent} from '../eventTypes';

/** Helper class that allows a test to wait for a specific Roap message
 *  to be emitted with the Event.ROAP_MESSAGE_TO_SEND event
 *
 * @example
 * Example usage:
 * ```
 * // instantiate the listener
 * const listener = new RoapListener(mediaConn, log);
 * // from now on it will listen for all ROAP_MESSAGE_TO_SEND events
 *
 * // verify that a roap offer is emitted
 * await listener.waitForMessage({
        messageType: 'OFFER',
        seq: 1,
        sdp: MUNGED_LOCAL_SDP,
        tieBreaker: 0xfffffffe,
      });
 * ```
 */
export class RoapListener extends EventListener {
  constructor(emitter: EventEmitter<RoapEvents>, logFn: LogFn, options: Options = {}) {
    super(emitter, Event.ROAP_MESSAGE_TO_SEND, logFn, options);
  }

  public waitForMessage(roapMessage: RoapMessage) {
    return this.waitForEvent({roapMessage});
  }

  public getReceivedMessages(): Array<RoapMessage> {
    // all received events will be of type RoapMessageEvent, because that's the only thing
    // we listen on (see the constructor)
    const roapMessages = this.getReceivedEvents().map(
      (event) => (event as RoapMessageEvent).roapMessage
    );

    return roapMessages;
  }
}
