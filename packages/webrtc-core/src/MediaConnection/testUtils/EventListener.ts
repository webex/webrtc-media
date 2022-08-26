import { expect as chaiExpect } from 'chai';
import { EventMap } from 'typed-emitter';

import EventEmitter from '../EventEmitter';
import { AnyEvent, Event } from '../eventTypes';

export type LogFn = (action: string, description: string) => void;

const DEFAULT_OPTIONS = {useChaiExpect: false, strict: true};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AnyValue = 'ANY VALUE' as any;

export type Options = {
  useChaiExpect?: boolean; // if false, then jest expect() is used
  strict?: boolean; // when false, the order of events doesn't matter
  debug?: string; // string displayed in all the logs, useful when you have mutliple EventListeners for multiple emitters
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

  constructor(
    emitter: EventEmitter<EventMap>,
    eventType: Event,
    logFn: LogFn,
    options: Options = {}
  ) {
    this.receivedEvents = [];
    this.expectedNextEvent = {};
    this.options = {...DEFAULT_OPTIONS, ...options};
    this.log = (action, message) =>
      logFn(this.options.debug ? `${this.options.debug}:${action}` : action, message);

    emitter.on(eventType, this.onEvent.bind(this));
  }

  private checkExpectation(event?: AnyEvent, expectedEvent?: AnyEvent) {
    if (this.options.useChaiExpect) {
      // chai's expect doesn't allow skipping some of the object fields in the deep equal check
      // like jest does with expect.any(type) syntax, so we use our own AnyValue to achieve this
      if (expectedEvent && event) {
        Object.keys(expectedEvent).forEach((propertyName) => {
          if (expectedEvent[propertyName] === AnyValue) {
            // eslint-disable-next-line no-param-reassign
            event[propertyName] = AnyValue;
          }
        });
      }

      chaiExpect(event).to.deep.equal(expectedEvent);
    } else {
      // jest
      expect(event).toEqual(expectedEvent);
    }
  }

  private onEvent(event: AnyEvent) {
    this.log('EventListener.onEvent()', `${JSON.stringify(event)}`);

    if (this.expectedNextEvent.resolve && this.expectedNextEvent.reject) {
      let keepWaiting = true;

      try {
        // we were already waiting for an event, so check if it matches what we're waiting for
        this.checkExpectation(event, this.expectedNextEvent.event);
        this.log('EventListener.onEvent()', 'expected event received');
        this.expectedNextEvent.resolve();
        keepWaiting = false;
      } catch (e) {
        if (this.options.strict) {
          this.expectedNextEvent.reject(e);
          keepWaiting = false;
        } else {
          // event doesn't match the expected one, it's OK in non-strict mode,
          // store the new event and keep waiting for the one we want
          this.receivedEvents.push(event);
        }
      }
      if (!keepWaiting) {
        this.expectedNextEvent.resolve = undefined;
        this.expectedNextEvent.reject = undefined;
      }
    } else {
      this.receivedEvents.push(event);
    }
  }

  public waitForEvent = (expectedEvent: AnyEvent): Promise<void> => {
    this.log('EventListener.waitForEvent()', `test expecting ${JSON.stringify(expectedEvent)}`);

    return new Promise((resolve, reject) => {
      if (this.receivedEvents.length > 0) {
        // we've already received some messages, so check them
        if (this.options.strict) {
          // in strict mode we only check the first one
          this.checkExpectation(this.receivedEvents[0], expectedEvent);
          // it matched the expected one so we can remove it from this.receivedEvents
          this.receivedEvents.shift();
          this.log('EventListener.waitForEvent()', 'expected event has already been received');
          resolve();
        } else {
          let foundMatchAtIndex = -1;

          // in non-strict mode we check all received events to see if any of them match
          this.receivedEvents.forEach((receivedEvent, idx) => {
            // call expect() but catch it so when it fails it won't cause a test failure
            try {
              this.checkExpectation(receivedEvent, expectedEvent);

              foundMatchAtIndex = idx;
            } catch (e) {
              // expect call has thrown so it doesn't match, try next one
            }
          });

          if (foundMatchAtIndex === -1) {
            // match not found, so we will wait for the message...
            this.expectedNextEvent.event = expectedEvent;
            this.expectedNextEvent.resolve = resolve;
            this.expectedNextEvent.reject = reject;
          } else {
            // it matched the expected one so we can remove it from this.receivedEvents
            this.log(
              'EventListener.waitForEvent()',
              `expected event has already been received (${foundMatchAtIndex}/${this.receivedEvents.length})`
            );
            this.receivedEvents.splice(foundMatchAtIndex, 1);
            resolve();
          }
        }
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
