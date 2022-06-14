import {expect as chaiExpect} from 'chai';

import EventEmitter from 'events';
import {Event, AnyEvent} from '../eventTypes';

export type LogFn = (action: string, description: string) => void;

const DEFAULT_OPTIONS = {useChaiExpect: false};

export type Options = {
  useChaiExpect?: boolean; // if false, then jest expect() is used
};
/** Helper class that allows a test to wait for a event
 *  to be emitted by a given instance of EventEmitter.
 *
 * @example
 * Example usage:
 * ```
 * // instantiate the listener
 * const listener = new EventListener(mediaConn, Event.CONNECTION_STATE_CHANGED, log);
 * // from now on it will listen for all CONNECTION_STATE_CHANGED events
 *
 * // verify that a specific event is emitted
 * await listener.waitForEvent({state: ConnectionState.CONNECTING});
 * ```
 */
export class EventListener {
  private receivedEvents: Array<AnyEvent>;

  private expectedNextEvent: {
    event?: AnyEvent;
    resolve?: () => void;
    reject?: (e: unknown) => void;
  };

  private log: LogFn;

  private options: Options;

  constructor(emitter: EventEmitter, eventType: Event, logFn: LogFn, options: Options = {}) {
    this.receivedEvents = [];
    this.expectedNextEvent = {};
    this.log = logFn;
    this.options = {...DEFAULT_OPTIONS, ...options};

    emitter.on(eventType, this.onEvent.bind(this));
  }

  private checkExpectation(event?: AnyEvent, expectedEvent?: AnyEvent) {
    if (this.options.useChaiExpect) {
      chaiExpect(event).to.deep.equal(expectedEvent);
    } else {
      // jest
      expect(event).toEqual(expectedEvent);
    }
  }

  private onEvent(event: AnyEvent) {
    this.log('EventListener.onEvent()', `${JSON.stringify(event)}`);

    if (this.expectedNextEvent.resolve && this.expectedNextEvent.reject) {
      try {
        // we were already waiting for an event, so check if it matches what we're waiting for
        this.checkExpectation(event, this.expectedNextEvent.event);
        this.log('EventListener.onEvent()', 'expected event received');
        this.expectedNextEvent.resolve();
      } catch (e) {
        this.expectedNextEvent.reject(e);
      }
      this.expectedNextEvent.resolve = undefined;
      this.expectedNextEvent.reject = undefined;
    } else {
      this.receivedEvents.push(event);
    }
  }

  public waitForEvent = (expectedEvent: AnyEvent): Promise<void> => {
    this.log('EventListener.waitForEvent()', `test expecting ${JSON.stringify(expectedEvent)}`);

    return new Promise((resolve, reject) => {
      if (this.receivedEvents.length > 0) {
        // we've already received some messages, so check the first one
        this.checkExpectation(this.receivedEvents[0], expectedEvent);

        // it matched the expected one so we can remove it from this.receivedEvents
        this.receivedEvents.shift();
        this.log('EventListener.waitForEvent()', 'expected event has already been received');
        resolve();
      } else {
        // we will wait for the message...
        this.expectedNextEvent.event = expectedEvent;
        this.expectedNextEvent.resolve = resolve;
        this.expectedNextEvent.reject = reject;
      }
    });
  };

  public getReceivedEvents() {
    return this.receivedEvents;
  }
}
