(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.webrtcCore = {}));
})(this, (function (exports) { 'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

    const MEDIA = 'MEDIA';
    const DEVICE = 'DEVICE';
    const TRACK = 'TRACK';
    const MEDIA_CONNECTION = 'MEDIA_CONNECTION';
    const ROAP = 'ROAP';

    const LEVELS = {
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
    };
    const logFormat = (level, logDetails) => {
        const { ID, mediaType, action, description, error } = logDetails;
        const timestamp = new Date().toISOString();
        return `${timestamp} ${level} ${ID ?? ''} ${mediaType} ${action} ${description} ${error ? `${error.stack || error}` : ''}`
            .replace(/\s+/g, ' ')
            .trim();
    };
    let currentLevel = 'error';
    const log$1 = (level, args) => {
        if (LEVELS[level] <= LEVELS[currentLevel]) {
            console.log(logFormat(level, args));
        }
    };
    const logger = {
        info: (args) => log$1('info', args),
        warn: (args) => log$1('warn', args),
        error: (args) => log$1('error', args),
        debug: (args) => log$1('debug', args),
    };
    for (const level of ['info', 'warn', 'error', 'debug']) {
        logger[level] = (logInfo) => {
            const { ID, mediaType, action, description, error } = logInfo;
            currentLevel = level;
            return log$1(level, {
                ID,
                mediaType,
                action,
                description,
                error,
            });
        };
    }

    var DeviceKinds;
    (function (DeviceKinds) {
        DeviceKinds["AUDIO_INPUT"] = "audioinput";
        DeviceKinds["AUDIO_OUTPUT"] = "audiooutput";
        DeviceKinds["VIDEO_INPUT"] = "videoinput";
    })(DeviceKinds || (DeviceKinds = {}));

    const subscriptions = {
        events: {
            'device:changed': new Map(),
            'track:mute': new Map(),
        },
    };
    function trackMutePublisher(event, track) {
        logger.info({
            ID: track.ID,
            mediaType: TRACK,
            action: 'trackMutePublisher()',
            description: 'Calling track subscription listener obtained by track mute event',
        });
        const onmuteListeners = subscriptions.events['track:mute'];
        const currentTrack = event.target;
        for (const entry of onmuteListeners) {
            const listener = entry[1];
            const action = currentTrack.enabled ? 'muted' : 'unmuted';
            if (listener) {
                listener({
                    action,
                    track: track,
                });
            }
        }
    }

    var TrackStatus;
    (function (TrackStatus) {
        TrackStatus["ENDED"] = "ended";
        TrackStatus["LIVE"] = "live";
    })(TrackStatus || (TrackStatus = {}));
    var TrackKind;
    (function (TrackKind) {
        TrackKind["AUDIO"] = "audio";
        TrackKind["VIDEO"] = "video";
    })(TrackKind || (TrackKind = {}));
    class Track {
        ID;
        kind;
        status;
        muted;
        label;
        #mediaStreamTrack;
        constructor(mediaStreamTrack) {
            this.ID = mediaStreamTrack.id;
            this.kind = mediaStreamTrack.kind;
            this.status = mediaStreamTrack.readyState;
            this.muted = mediaStreamTrack.muted;
            this.label = mediaStreamTrack.label;
            this.#mediaStreamTrack = mediaStreamTrack;
            this.#mediaStreamTrack.onmute = (event) => {
                trackMutePublisher(event, this);
            };
        }
        stop() {
            this.#mediaStreamTrack.stop();
            this.status = TrackStatus.ENDED;
        }
        async applyConstraints(constraints) {
            logger.info({
                ID: constraints?.deviceId?.toString(),
                mediaType: DEVICE,
                action: 'applyConstraints()',
                description: 'Applying constraints to track objects',
            });
            const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
            const notSupportedConstraints = [];
            for (const thisConstraint of Object.keys(constraints)) {
                if (!supportedConstraints[thisConstraint]) {
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
        getSettings() {
            logger.info({
                mediaType: MEDIA,
                action: 'getSettings()',
                description: 'Fetching constraints properties for the current media stream track',
            });
            return this.#mediaStreamTrack.getSettings();
        }
        getMediaStreamTrack() {
            return this.#mediaStreamTrack;
        }
    }

    const _streams = new WeakMap();
    async function createAudioTrack(device) {
        if (device && device.kind !== DeviceKinds.AUDIO_INPUT) {
            const error = new Error('Given device is not an audio type');
            logger.error({
                ID: device.ID,
                mediaType: 'DEVICE',
                action: 'createAudioTrack()',
                description: error.message,
                error,
            });
            throw error;
        }
        logger.info({
            ID: device?.ID,
            mediaType: DEVICE,
            action: 'createAudioTrack()',
            description: 'Creating audio track',
        });
        const deviceConfig = device
            ? { audio: { deviceId: { exact: device.ID } } }
            : { audio: true, video: false };
        const stream = await navigator.mediaDevices.getUserMedia(deviceConfig);
        const track = stream.getAudioTracks()[0];
        if (track) {
            _streams.set(stream, stream.id);
            return new Track(track);
        }
        const error = new Error(`Device could not obtain an audio track of kind ${device?.kind}`);
        logger.error({
            ID: device?.ID,
            mediaType: 'DEVICE',
            action: 'createAudioTrack()',
            description: error.message,
            error,
        });
        throw error;
    }
    async function createVideoTrack(device) {
        if (device && device.kind !== DeviceKinds.VIDEO_INPUT) {
            const error = new Error('Given device is not a video type');
            logger.error({
                ID: device.ID,
                mediaType: 'DEVICE',
                action: 'createVideoTrack()',
                description: error.message,
                error,
            });
            throw error;
        }
        logger.info({
            ID: device?.ID,
            mediaType: DEVICE,
            action: 'createVideoTrack()',
            description: 'Creating video track',
        });
        const deviceConfig = device
            ? { video: { deviceId: { exact: device.ID } } }
            : { audio: false, video: true };
        const stream = await navigator.mediaDevices.getUserMedia(deviceConfig);
        const track = stream.getVideoTracks()[0];
        if (track) {
            _streams.set(stream, stream.id);
            return new Track(track);
        }
        const error = new Error(`Device could not obtain a video track of kind ${device?.kind}`);
        logger.error({
            ID: device?.ID,
            mediaType: 'DEVICE',
            action: 'createVideoTrack()',
            description: error.message,
            error,
        });
        throw error;
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function() {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active ) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n))
        throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn)
        handler.call(self);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self);
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn)
        handler.call(self, arg1);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1);
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn)
        handler.call(self, arg1, arg2);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2);
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn)
        handler.call(self, arg1, arg2, arg3);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2, arg3);
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn)
        handler.apply(self, args);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].apply(self, args);
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = (type === 'error');

      events = this._events;
      if (events)
        doError = (doError && events.error == null);
      else if (!doError)
        return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er)
            er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler)
        return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] :
                                              [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + type + ' listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = this._events;
          if (!events)
            return this;

          list = events[type];
          if (!list)
            return this;

          if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length; i-- > 0;) {
              if (list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (list.length === 1) {
              list[0] = undefined;
              if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
              } else {
                delete events[type];
              }
            } else {
              spliceOne(list, position);
            }

            if (events.removeListener)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };
        
    // Alias for removeListener added in NodeJS 10.0
    // https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
    EventEmitter.prototype.off = function(type, listener){
        return this.removeListener(type, listener);
    };

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events;

          events = this._events;
          if (!events)
            return this;

          // not listening for removeListener, no need to emit
          if (!events.removeListener) {
            if (arguments.length === 0) {
              this._events = new EventHandlers();
              this._eventsCount = 0;
            } else if (events[type]) {
              if (--this._eventsCount === 0)
                this._events = new EventHandlers();
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            for (var i = 0, key; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = new EventHandlers();
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners) {
            // LIFO order
            do {
              this.removeListener(type, listeners[listeners.length - 1]);
            } while (listeners[0]);
          }

          return this;
        };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events)
        ret = [];
      else {
        evlistener = events[type];
        if (!evlistener)
          ret = [];
        else if (typeof evlistener === 'function')
          ret = [evlistener.listener || evlistener];
        else
          ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
        list[i] = list[k];
      list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--)
        copy[i] = arr[i];
      return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    let logDisabled_ = true;
    let deprecationWarnings_ = true;

    /**
     * Extract browser version out of the provided user agent string.
     *
     * @param {!string} uastring userAgent string.
     * @param {!string} expr Regular expression used as match criteria.
     * @param {!number} pos position in the version string to be returned.
     * @return {!number} browser version.
     */
    function extractVersion(uastring, expr, pos) {
      const match = uastring.match(expr);
      return match && match.length >= pos && parseInt(match[pos], 10);
    }

    // Wraps the peerconnection event eventNameToWrap in a function
    // which returns the modified event object (or false to prevent
    // the event).
    function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
      if (!window.RTCPeerConnection) {
        return;
      }
      const proto = window.RTCPeerConnection.prototype;
      const nativeAddEventListener = proto.addEventListener;
      proto.addEventListener = function(nativeEventName, cb) {
        if (nativeEventName !== eventNameToWrap) {
          return nativeAddEventListener.apply(this, arguments);
        }
        const wrappedCallback = (e) => {
          const modifiedEvent = wrapper(e);
          if (modifiedEvent) {
            if (cb.handleEvent) {
              cb.handleEvent(modifiedEvent);
            } else {
              cb(modifiedEvent);
            }
          }
        };
        this._eventMap = this._eventMap || {};
        if (!this._eventMap[eventNameToWrap]) {
          this._eventMap[eventNameToWrap] = new Map();
        }
        this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
        return nativeAddEventListener.apply(this, [nativeEventName,
          wrappedCallback]);
      };

      const nativeRemoveEventListener = proto.removeEventListener;
      proto.removeEventListener = function(nativeEventName, cb) {
        if (nativeEventName !== eventNameToWrap || !this._eventMap
            || !this._eventMap[eventNameToWrap]) {
          return nativeRemoveEventListener.apply(this, arguments);
        }
        if (!this._eventMap[eventNameToWrap].has(cb)) {
          return nativeRemoveEventListener.apply(this, arguments);
        }
        const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
        this._eventMap[eventNameToWrap].delete(cb);
        if (this._eventMap[eventNameToWrap].size === 0) {
          delete this._eventMap[eventNameToWrap];
        }
        if (Object.keys(this._eventMap).length === 0) {
          delete this._eventMap;
        }
        return nativeRemoveEventListener.apply(this, [nativeEventName,
          unwrappedCb]);
      };

      Object.defineProperty(proto, 'on' + eventNameToWrap, {
        get() {
          return this['_on' + eventNameToWrap];
        },
        set(cb) {
          if (this['_on' + eventNameToWrap]) {
            this.removeEventListener(eventNameToWrap,
                this['_on' + eventNameToWrap]);
            delete this['_on' + eventNameToWrap];
          }
          if (cb) {
            this.addEventListener(eventNameToWrap,
                this['_on' + eventNameToWrap] = cb);
          }
        },
        enumerable: true,
        configurable: true
      });
    }

    function disableLog(bool) {
      if (typeof bool !== 'boolean') {
        return new Error('Argument type: ' + typeof bool +
            '. Please use a boolean.');
      }
      logDisabled_ = bool;
      return (bool) ? 'adapter.js logging disabled' :
          'adapter.js logging enabled';
    }

    /**
     * Disable or enable deprecation warnings
     * @param {!boolean} bool set to true to disable warnings.
     */
    function disableWarnings(bool) {
      if (typeof bool !== 'boolean') {
        return new Error('Argument type: ' + typeof bool +
            '. Please use a boolean.');
      }
      deprecationWarnings_ = !bool;
      return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
    }

    function log() {
      if (typeof window === 'object') {
        if (logDisabled_) {
          return;
        }
        if (typeof console !== 'undefined' && typeof console.log === 'function') {
          console.log.apply(console, arguments);
        }
      }
    }

    /**
     * Shows a deprecation warning suggesting the modern and spec-compatible API.
     */
    function deprecated(oldMethod, newMethod) {
      if (!deprecationWarnings_) {
        return;
      }
      console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
          ' instead.');
    }

    /**
     * Browser detector.
     *
     * @return {object} result containing browser and version
     *     properties.
     */
    function detectBrowser(window) {
      // Returned result object.
      const result = {browser: null, version: null};

      // Fail early if it's not a browser
      if (typeof window === 'undefined' || !window.navigator) {
        result.browser = 'Not a browser.';
        return result;
      }

      const {navigator} = window;

      if (navigator.mozGetUserMedia) { // Firefox.
        result.browser = 'firefox';
        result.version = extractVersion(navigator.userAgent,
            /Firefox\/(\d+)\./, 1);
      } else if (navigator.webkitGetUserMedia ||
          (window.isSecureContext === false && window.webkitRTCPeerConnection &&
           !window.RTCIceGatherer)) {
        // Chrome, Chromium, Webview, Opera.
        // Version matches Chrome/WebRTC version.
        // Chrome 74 removed webkitGetUserMedia on http as well so we need the
        // more complicated fallback to webkitRTCPeerConnection.
        result.browser = 'chrome';
        result.version = extractVersion(navigator.userAgent,
            /Chrom(e|ium)\/(\d+)\./, 2);
      } else if (window.RTCPeerConnection &&
          navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
        result.browser = 'safari';
        result.version = extractVersion(navigator.userAgent,
            /AppleWebKit\/(\d+)\./, 1);
        result.supportsUnifiedPlan = window.RTCRtpTransceiver &&
            'currentDirection' in window.RTCRtpTransceiver.prototype;
      } else { // Default fallthrough: not supported.
        result.browser = 'Not a supported browser.';
        return result;
      }

      return result;
    }

    /**
     * Checks if something is an object.
     *
     * @param {*} val The something you want to check.
     * @return true if val is an object, false otherwise.
     */
    function isObject(val) {
      return Object.prototype.toString.call(val) === '[object Object]';
    }

    /**
     * Remove all empty objects and undefined values
     * from a nested object -- an enhanced and vanilla version
     * of Lodash's `compact`.
     */
    function compactObject(data) {
      if (!isObject(data)) {
        return data;
      }

      return Object.keys(data).reduce(function(accumulator, key) {
        const isObj = isObject(data[key]);
        const value = isObj ? compactObject(data[key]) : data[key];
        const isEmptyObject = isObj && !Object.keys(value).length;
        if (value === undefined || isEmptyObject) {
          return accumulator;
        }
        return Object.assign(accumulator, {[key]: value});
      }, {});
    }

    /* iterates the stats graph recursively. */
    function walkStats(stats, base, resultSet) {
      if (!base || resultSet.has(base.id)) {
        return;
      }
      resultSet.set(base.id, base);
      Object.keys(base).forEach(name => {
        if (name.endsWith('Id')) {
          walkStats(stats, stats.get(base[name]), resultSet);
        } else if (name.endsWith('Ids')) {
          base[name].forEach(id => {
            walkStats(stats, stats.get(id), resultSet);
          });
        }
      });
    }

    /* filter getStats for a sender/receiver track. */
    function filterStats(result, track, outbound) {
      const streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
      const filteredResult = new Map();
      if (track === null) {
        return filteredResult;
      }
      const trackStats = [];
      result.forEach(value => {
        if (value.type === 'track' &&
            value.trackIdentifier === track.id) {
          trackStats.push(value);
        }
      });
      trackStats.forEach(trackStat => {
        result.forEach(stats => {
          if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
            walkStats(result, stats, filteredResult);
          }
        });
      });
      return filteredResult;
    }

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */
    const logging = log;

    function shimGetUserMedia$2(window, browserDetails) {
      const navigator = window && window.navigator;

      if (!navigator.mediaDevices) {
        return;
      }

      const constraintsToChrome_ = function(c) {
        if (typeof c !== 'object' || c.mandatory || c.optional) {
          return c;
        }
        const cc = {};
        Object.keys(c).forEach(key => {
          if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
            return;
          }
          const r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
          if (r.exact !== undefined && typeof r.exact === 'number') {
            r.min = r.max = r.exact;
          }
          const oldname_ = function(prefix, name) {
            if (prefix) {
              return prefix + name.charAt(0).toUpperCase() + name.slice(1);
            }
            return (name === 'deviceId') ? 'sourceId' : name;
          };
          if (r.ideal !== undefined) {
            cc.optional = cc.optional || [];
            let oc = {};
            if (typeof r.ideal === 'number') {
              oc[oldname_('min', key)] = r.ideal;
              cc.optional.push(oc);
              oc = {};
              oc[oldname_('max', key)] = r.ideal;
              cc.optional.push(oc);
            } else {
              oc[oldname_('', key)] = r.ideal;
              cc.optional.push(oc);
            }
          }
          if (r.exact !== undefined && typeof r.exact !== 'number') {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_('', key)] = r.exact;
          } else {
            ['min', 'max'].forEach(mix => {
              if (r[mix] !== undefined) {
                cc.mandatory = cc.mandatory || {};
                cc.mandatory[oldname_(mix, key)] = r[mix];
              }
            });
          }
        });
        if (c.advanced) {
          cc.optional = (cc.optional || []).concat(c.advanced);
        }
        return cc;
      };

      const shimConstraints_ = function(constraints, func) {
        if (browserDetails.version >= 61) {
          return func(constraints);
        }
        constraints = JSON.parse(JSON.stringify(constraints));
        if (constraints && typeof constraints.audio === 'object') {
          const remap = function(obj, a, b) {
            if (a in obj && !(b in obj)) {
              obj[b] = obj[a];
              delete obj[a];
            }
          };
          constraints = JSON.parse(JSON.stringify(constraints));
          remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
          remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
          constraints.audio = constraintsToChrome_(constraints.audio);
        }
        if (constraints && typeof constraints.video === 'object') {
          // Shim facingMode for mobile & surface pro.
          let face = constraints.video.facingMode;
          face = face && ((typeof face === 'object') ? face : {ideal: face});
          const getSupportedFacingModeLies = browserDetails.version < 66;

          if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                        face.ideal === 'user' || face.ideal === 'environment')) &&
              !(navigator.mediaDevices.getSupportedConstraints &&
                navigator.mediaDevices.getSupportedConstraints().facingMode &&
                !getSupportedFacingModeLies)) {
            delete constraints.video.facingMode;
            let matches;
            if (face.exact === 'environment' || face.ideal === 'environment') {
              matches = ['back', 'rear'];
            } else if (face.exact === 'user' || face.ideal === 'user') {
              matches = ['front'];
            }
            if (matches) {
              // Look for matches in label, or use last cam for back (typical).
              return navigator.mediaDevices.enumerateDevices()
              .then(devices => {
                devices = devices.filter(d => d.kind === 'videoinput');
                let dev = devices.find(d => matches.some(match =>
                  d.label.toLowerCase().includes(match)));
                if (!dev && devices.length && matches.includes('back')) {
                  dev = devices[devices.length - 1]; // more likely the back cam
                }
                if (dev) {
                  constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                            {ideal: dev.deviceId};
                }
                constraints.video = constraintsToChrome_(constraints.video);
                logging('chrome: ' + JSON.stringify(constraints));
                return func(constraints);
              });
            }
          }
          constraints.video = constraintsToChrome_(constraints.video);
        }
        logging('chrome: ' + JSON.stringify(constraints));
        return func(constraints);
      };

      const shimError_ = function(e) {
        if (browserDetails.version >= 64) {
          return e;
        }
        return {
          name: {
            PermissionDeniedError: 'NotAllowedError',
            PermissionDismissedError: 'NotAllowedError',
            InvalidStateError: 'NotAllowedError',
            DevicesNotFoundError: 'NotFoundError',
            ConstraintNotSatisfiedError: 'OverconstrainedError',
            TrackStartError: 'NotReadableError',
            MediaDeviceFailedDueToShutdown: 'NotAllowedError',
            MediaDeviceKillSwitchOn: 'NotAllowedError',
            TabCaptureError: 'AbortError',
            ScreenCaptureError: 'AbortError',
            DeviceCaptureError: 'AbortError'
          }[e.name] || e.name,
          message: e.message,
          constraint: e.constraint || e.constraintName,
          toString() {
            return this.name + (this.message && ': ') + this.message;
          }
        };
      };

      const getUserMedia_ = function(constraints, onSuccess, onError) {
        shimConstraints_(constraints, c => {
          navigator.webkitGetUserMedia(c, onSuccess, e => {
            if (onError) {
              onError(shimError_(e));
            }
          });
        });
      };
      navigator.getUserMedia = getUserMedia_.bind(navigator);

      // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
      // function which returns a Promise, it does not accept spec-style
      // constraints.
      if (navigator.mediaDevices.getUserMedia) {
        const origGetUserMedia = navigator.mediaDevices.getUserMedia.
            bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(cs) {
          return shimConstraints_(cs, c => origGetUserMedia(c).then(stream => {
            if (c.audio && !stream.getAudioTracks().length ||
                c.video && !stream.getVideoTracks().length) {
              stream.getTracks().forEach(track => {
                track.stop();
              });
              throw new DOMException('', 'NotFoundError');
            }
            return stream;
          }, e => Promise.reject(shimError_(e))));
        };
      }
    }

    /*
     *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */
    function shimGetDisplayMedia$1(window, getSourceId) {
      if (window.navigator.mediaDevices &&
        'getDisplayMedia' in window.navigator.mediaDevices) {
        return;
      }
      if (!(window.navigator.mediaDevices)) {
        return;
      }
      // getSourceId is a function that returns a promise resolving with
      // the sourceId of the screen/window/tab to be shared.
      if (typeof getSourceId !== 'function') {
        console.error('shimGetDisplayMedia: getSourceId argument is not ' +
            'a function');
        return;
      }
      window.navigator.mediaDevices.getDisplayMedia =
        function getDisplayMedia(constraints) {
          return getSourceId(constraints)
            .then(sourceId => {
              const widthSpecified = constraints.video && constraints.video.width;
              const heightSpecified = constraints.video &&
                constraints.video.height;
              const frameRateSpecified = constraints.video &&
                constraints.video.frameRate;
              constraints.video = {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sourceId,
                  maxFrameRate: frameRateSpecified || 3
                }
              };
              if (widthSpecified) {
                constraints.video.mandatory.maxWidth = widthSpecified;
              }
              if (heightSpecified) {
                constraints.video.mandatory.maxHeight = heightSpecified;
              }
              return window.navigator.mediaDevices.getUserMedia(constraints);
            });
        };
    }

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimMediaStream(window) {
      window.MediaStream = window.MediaStream || window.webkitMediaStream;
    }

    function shimOnTrack$1(window) {
      if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
          window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
          get() {
            return this._ontrack;
          },
          set(f) {
            if (this._ontrack) {
              this.removeEventListener('track', this._ontrack);
            }
            this.addEventListener('track', this._ontrack = f);
          },
          enumerable: true,
          configurable: true
        });
        const origSetRemoteDescription =
            window.RTCPeerConnection.prototype.setRemoteDescription;
        window.RTCPeerConnection.prototype.setRemoteDescription =
          function setRemoteDescription() {
            if (!this._ontrackpoly) {
              this._ontrackpoly = (e) => {
                // onaddstream does not fire when a track is added to an existing
                // stream. But stream.onaddtrack is implemented so we use that.
                e.stream.addEventListener('addtrack', te => {
                  let receiver;
                  if (window.RTCPeerConnection.prototype.getReceivers) {
                    receiver = this.getReceivers()
                      .find(r => r.track && r.track.id === te.track.id);
                  } else {
                    receiver = {track: te.track};
                  }

                  const event = new Event('track');
                  event.track = te.track;
                  event.receiver = receiver;
                  event.transceiver = {receiver};
                  event.streams = [e.stream];
                  this.dispatchEvent(event);
                });
                e.stream.getTracks().forEach(track => {
                  let receiver;
                  if (window.RTCPeerConnection.prototype.getReceivers) {
                    receiver = this.getReceivers()
                      .find(r => r.track && r.track.id === track.id);
                  } else {
                    receiver = {track};
                  }
                  const event = new Event('track');
                  event.track = track;
                  event.receiver = receiver;
                  event.transceiver = {receiver};
                  event.streams = [e.stream];
                  this.dispatchEvent(event);
                });
              };
              this.addEventListener('addstream', this._ontrackpoly);
            }
            return origSetRemoteDescription.apply(this, arguments);
          };
      } else {
        // even if RTCRtpTransceiver is in window, it is only used and
        // emitted in unified-plan. Unfortunately this means we need
        // to unconditionally wrap the event.
        wrapPeerConnectionEvent(window, 'track', e => {
          if (!e.transceiver) {
            Object.defineProperty(e, 'transceiver',
              {value: {receiver: e.receiver}});
          }
          return e;
        });
      }
    }

    function shimGetSendersWithDtmf(window) {
      // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
      if (typeof window === 'object' && window.RTCPeerConnection &&
          !('getSenders' in window.RTCPeerConnection.prototype) &&
          'createDTMFSender' in window.RTCPeerConnection.prototype) {
        const shimSenderWithDtmf = function(pc, track) {
          return {
            track,
            get dtmf() {
              if (this._dtmf === undefined) {
                if (track.kind === 'audio') {
                  this._dtmf = pc.createDTMFSender(track);
                } else {
                  this._dtmf = null;
                }
              }
              return this._dtmf;
            },
            _pc: pc
          };
        };

        // augment addTrack when getSenders is not available.
        if (!window.RTCPeerConnection.prototype.getSenders) {
          window.RTCPeerConnection.prototype.getSenders = function getSenders() {
            this._senders = this._senders || [];
            return this._senders.slice(); // return a copy of the internal state.
          };
          const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
          window.RTCPeerConnection.prototype.addTrack =
            function addTrack(track, stream) {
              let sender = origAddTrack.apply(this, arguments);
              if (!sender) {
                sender = shimSenderWithDtmf(this, track);
                this._senders.push(sender);
              }
              return sender;
            };

          const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
          window.RTCPeerConnection.prototype.removeTrack =
            function removeTrack(sender) {
              origRemoveTrack.apply(this, arguments);
              const idx = this._senders.indexOf(sender);
              if (idx !== -1) {
                this._senders.splice(idx, 1);
              }
            };
        }
        const origAddStream = window.RTCPeerConnection.prototype.addStream;
        window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
          this._senders = this._senders || [];
          origAddStream.apply(this, [stream]);
          stream.getTracks().forEach(track => {
            this._senders.push(shimSenderWithDtmf(this, track));
          });
        };

        const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
        window.RTCPeerConnection.prototype.removeStream =
          function removeStream(stream) {
            this._senders = this._senders || [];
            origRemoveStream.apply(this, [stream]);

            stream.getTracks().forEach(track => {
              const sender = this._senders.find(s => s.track === track);
              if (sender) { // remove sender
                this._senders.splice(this._senders.indexOf(sender), 1);
              }
            });
          };
      } else if (typeof window === 'object' && window.RTCPeerConnection &&
                 'getSenders' in window.RTCPeerConnection.prototype &&
                 'createDTMFSender' in window.RTCPeerConnection.prototype &&
                 window.RTCRtpSender &&
                 !('dtmf' in window.RTCRtpSender.prototype)) {
        const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          const senders = origGetSenders.apply(this, []);
          senders.forEach(sender => sender._pc = this);
          return senders;
        };

        Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
          get() {
            if (this._dtmf === undefined) {
              if (this.track.kind === 'audio') {
                this._dtmf = this._pc.createDTMFSender(this.track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          }
        });
      }
    }

    function shimGetStats(window) {
      if (!window.RTCPeerConnection) {
        return;
      }

      const origGetStats = window.RTCPeerConnection.prototype.getStats;
      window.RTCPeerConnection.prototype.getStats = function getStats() {
        const [selector, onSucc, onErr] = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats.apply(this, arguments);
        }

        // When spec-style getStats is supported, return those when called with
        // either no arguments or the selector argument is null.
        if (origGetStats.length === 0 && (arguments.length === 0 ||
            typeof selector !== 'function')) {
          return origGetStats.apply(this, []);
        }

        const fixChromeStats_ = function(response) {
          const standardReport = {};
          const reports = response.result();
          reports.forEach(report => {
            const standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: {
                localcandidate: 'local-candidate',
                remotecandidate: 'remote-candidate'
              }[report.type] || report.type
            };
            report.names().forEach(name => {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        // shim getStats with maplike support
        const makeMapStats = function(stats) {
          return new Map(Object.keys(stats).map(key => [key, stats[key]]));
        };

        if (arguments.length >= 2) {
          const successCallbackWrapper_ = function(response) {
            onSucc(makeMapStats(fixChromeStats_(response)));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
            selector]);
        }

        // promise-support
        return new Promise((resolve, reject) => {
          origGetStats.apply(this, [
            function(response) {
              resolve(makeMapStats(fixChromeStats_(response)));
            }, reject]);
        }).then(onSucc, onErr);
      };
    }

    function shimSenderReceiverGetStats(window) {
      if (!(typeof window === 'object' && window.RTCPeerConnection &&
          window.RTCRtpSender && window.RTCRtpReceiver)) {
        return;
      }

      // shim sender stats.
      if (!('getStats' in window.RTCRtpSender.prototype)) {
        const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
        if (origGetSenders) {
          window.RTCPeerConnection.prototype.getSenders = function getSenders() {
            const senders = origGetSenders.apply(this, []);
            senders.forEach(sender => sender._pc = this);
            return senders;
          };
        }

        const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        if (origAddTrack) {
          window.RTCPeerConnection.prototype.addTrack = function addTrack() {
            const sender = origAddTrack.apply(this, arguments);
            sender._pc = this;
            return sender;
          };
        }
        window.RTCRtpSender.prototype.getStats = function getStats() {
          const sender = this;
          return this._pc.getStats().then(result =>
            /* Note: this will include stats of all senders that
             *   send a track with the same id as sender.track as
             *   it is not possible to identify the RTCRtpSender.
             */
            filterStats(result, sender.track, true));
        };
      }

      // shim receiver stats.
      if (!('getStats' in window.RTCRtpReceiver.prototype)) {
        const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
        if (origGetReceivers) {
          window.RTCPeerConnection.prototype.getReceivers =
            function getReceivers() {
              const receivers = origGetReceivers.apply(this, []);
              receivers.forEach(receiver => receiver._pc = this);
              return receivers;
            };
        }
        wrapPeerConnectionEvent(window, 'track', e => {
          e.receiver._pc = e.srcElement;
          return e;
        });
        window.RTCRtpReceiver.prototype.getStats = function getStats() {
          const receiver = this;
          return this._pc.getStats().then(result =>
            filterStats(result, receiver.track, false));
        };
      }

      if (!('getStats' in window.RTCRtpSender.prototype &&
          'getStats' in window.RTCRtpReceiver.prototype)) {
        return;
      }

      // shim RTCPeerConnection.getStats(track).
      const origGetStats = window.RTCPeerConnection.prototype.getStats;
      window.RTCPeerConnection.prototype.getStats = function getStats() {
        if (arguments.length > 0 &&
            arguments[0] instanceof window.MediaStreamTrack) {
          const track = arguments[0];
          let sender;
          let receiver;
          let err;
          this.getSenders().forEach(s => {
            if (s.track === track) {
              if (sender) {
                err = true;
              } else {
                sender = s;
              }
            }
          });
          this.getReceivers().forEach(r => {
            if (r.track === track) {
              if (receiver) {
                err = true;
              } else {
                receiver = r;
              }
            }
            return r.track === track;
          });
          if (err || (sender && receiver)) {
            return Promise.reject(new DOMException(
              'There are more than one sender or receiver for the track.',
              'InvalidAccessError'));
          } else if (sender) {
            return sender.getStats();
          } else if (receiver) {
            return receiver.getStats();
          }
          return Promise.reject(new DOMException(
            'There is no sender or receiver for the track.',
            'InvalidAccessError'));
        }
        return origGetStats.apply(this, arguments);
      };
    }

    function shimAddTrackRemoveTrackWithNative(window) {
      // shim addTrack/removeTrack with native variants in order to make
      // the interactions with legacy getLocalStreams behave as in other browsers.
      // Keeps a mapping stream.id => [stream, rtpsenders...]
      window.RTCPeerConnection.prototype.getLocalStreams =
        function getLocalStreams() {
          this._shimmedLocalStreams = this._shimmedLocalStreams || {};
          return Object.keys(this._shimmedLocalStreams)
            .map(streamId => this._shimmedLocalStreams[streamId][0]);
        };

      const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addTrack =
        function addTrack(track, stream) {
          if (!stream) {
            return origAddTrack.apply(this, arguments);
          }
          this._shimmedLocalStreams = this._shimmedLocalStreams || {};

          const sender = origAddTrack.apply(this, arguments);
          if (!this._shimmedLocalStreams[stream.id]) {
            this._shimmedLocalStreams[stream.id] = [stream, sender];
          } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
            this._shimmedLocalStreams[stream.id].push(sender);
          }
          return sender;
        };

      const origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};

        stream.getTracks().forEach(track => {
          const alreadyExists = this.getSenders().find(s => s.track === track);
          if (alreadyExists) {
            throw new DOMException('Track already exists.',
                'InvalidAccessError');
          }
        });
        const existingSenders = this.getSenders();
        origAddStream.apply(this, arguments);
        const newSenders = this.getSenders()
          .filter(newSender => existingSenders.indexOf(newSender) === -1);
        this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
      };

      const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream =
        function removeStream(stream) {
          this._shimmedLocalStreams = this._shimmedLocalStreams || {};
          delete this._shimmedLocalStreams[stream.id];
          return origRemoveStream.apply(this, arguments);
        };

      const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
      window.RTCPeerConnection.prototype.removeTrack =
        function removeTrack(sender) {
          this._shimmedLocalStreams = this._shimmedLocalStreams || {};
          if (sender) {
            Object.keys(this._shimmedLocalStreams).forEach(streamId => {
              const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
              if (idx !== -1) {
                this._shimmedLocalStreams[streamId].splice(idx, 1);
              }
              if (this._shimmedLocalStreams[streamId].length === 1) {
                delete this._shimmedLocalStreams[streamId];
              }
            });
          }
          return origRemoveTrack.apply(this, arguments);
        };
    }

    function shimAddTrackRemoveTrack(window, browserDetails) {
      if (!window.RTCPeerConnection) {
        return;
      }
      // shim addTrack and removeTrack.
      if (window.RTCPeerConnection.prototype.addTrack &&
          browserDetails.version >= 65) {
        return shimAddTrackRemoveTrackWithNative(window);
      }

      // also shim pc.getLocalStreams when addTrack is shimmed
      // to return the original streams.
      const origGetLocalStreams = window.RTCPeerConnection.prototype
          .getLocalStreams;
      window.RTCPeerConnection.prototype.getLocalStreams =
        function getLocalStreams() {
          const nativeStreams = origGetLocalStreams.apply(this);
          this._reverseStreams = this._reverseStreams || {};
          return nativeStreams.map(stream => this._reverseStreams[stream.id]);
        };

      const origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        this._streams = this._streams || {};
        this._reverseStreams = this._reverseStreams || {};

        stream.getTracks().forEach(track => {
          const alreadyExists = this.getSenders().find(s => s.track === track);
          if (alreadyExists) {
            throw new DOMException('Track already exists.',
                'InvalidAccessError');
          }
        });
        // Add identity mapping for consistency with addTrack.
        // Unless this is being used with a stream from addTrack.
        if (!this._reverseStreams[stream.id]) {
          const newStream = new window.MediaStream(stream.getTracks());
          this._streams[stream.id] = newStream;
          this._reverseStreams[newStream.id] = stream;
          stream = newStream;
        }
        origAddStream.apply(this, [stream]);
      };

      const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream =
        function removeStream(stream) {
          this._streams = this._streams || {};
          this._reverseStreams = this._reverseStreams || {};

          origRemoveStream.apply(this, [(this._streams[stream.id] || stream)]);
          delete this._reverseStreams[(this._streams[stream.id] ?
              this._streams[stream.id].id : stream.id)];
          delete this._streams[stream.id];
        };

      window.RTCPeerConnection.prototype.addTrack =
        function addTrack(track, stream) {
          if (this.signalingState === 'closed') {
            throw new DOMException(
              'The RTCPeerConnection\'s signalingState is \'closed\'.',
              'InvalidStateError');
          }
          const streams = [].slice.call(arguments, 1);
          if (streams.length !== 1 ||
              !streams[0].getTracks().find(t => t === track)) {
            // this is not fully correct but all we can manage without
            // [[associated MediaStreams]] internal slot.
            throw new DOMException(
              'The adapter.js addTrack polyfill only supports a single ' +
              ' stream which is associated with the specified track.',
              'NotSupportedError');
          }

          const alreadyExists = this.getSenders().find(s => s.track === track);
          if (alreadyExists) {
            throw new DOMException('Track already exists.',
                'InvalidAccessError');
          }

          this._streams = this._streams || {};
          this._reverseStreams = this._reverseStreams || {};
          const oldStream = this._streams[stream.id];
          if (oldStream) {
            // this is using odd Chrome behaviour, use with caution:
            // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
            // Note: we rely on the high-level addTrack/dtmf shim to
            // create the sender with a dtmf sender.
            oldStream.addTrack(track);

            // Trigger ONN async.
            Promise.resolve().then(() => {
              this.dispatchEvent(new Event('negotiationneeded'));
            });
          } else {
            const newStream = new window.MediaStream([track]);
            this._streams[stream.id] = newStream;
            this._reverseStreams[newStream.id] = stream;
            this.addStream(newStream);
          }
          return this.getSenders().find(s => s.track === track);
        };

      // replace the internal stream id with the external one and
      // vice versa.
      function replaceInternalStreamId(pc, description) {
        let sdp = description.sdp;
        Object.keys(pc._reverseStreams || []).forEach(internalId => {
          const externalStream = pc._reverseStreams[internalId];
          const internalStream = pc._streams[externalStream.id];
          sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
              externalStream.id);
        });
        return new RTCSessionDescription({
          type: description.type,
          sdp
        });
      }
      function replaceExternalStreamId(pc, description) {
        let sdp = description.sdp;
        Object.keys(pc._reverseStreams || []).forEach(internalId => {
          const externalStream = pc._reverseStreams[internalId];
          const internalStream = pc._streams[externalStream.id];
          sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
              internalStream.id);
        });
        return new RTCSessionDescription({
          type: description.type,
          sdp
        });
      }
      ['createOffer', 'createAnswer'].forEach(function(method) {
        const nativeMethod = window.RTCPeerConnection.prototype[method];
        const methodObj = {[method]() {
          const args = arguments;
          const isLegacyCall = arguments.length &&
              typeof arguments[0] === 'function';
          if (isLegacyCall) {
            return nativeMethod.apply(this, [
              (description) => {
                const desc = replaceInternalStreamId(this, description);
                args[0].apply(null, [desc]);
              },
              (err) => {
                if (args[1]) {
                  args[1].apply(null, err);
                }
              }, arguments[2]
            ]);
          }
          return nativeMethod.apply(this, arguments)
          .then(description => replaceInternalStreamId(this, description));
        }};
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      });

      const origSetLocalDescription =
          window.RTCPeerConnection.prototype.setLocalDescription;
      window.RTCPeerConnection.prototype.setLocalDescription =
        function setLocalDescription() {
          if (!arguments.length || !arguments[0].type) {
            return origSetLocalDescription.apply(this, arguments);
          }
          arguments[0] = replaceExternalStreamId(this, arguments[0]);
          return origSetLocalDescription.apply(this, arguments);
        };

      // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

      const origLocalDescription = Object.getOwnPropertyDescriptor(
          window.RTCPeerConnection.prototype, 'localDescription');
      Object.defineProperty(window.RTCPeerConnection.prototype,
          'localDescription', {
            get() {
              const description = origLocalDescription.get.apply(this);
              if (description.type === '') {
                return description;
              }
              return replaceInternalStreamId(this, description);
            }
          });

      window.RTCPeerConnection.prototype.removeTrack =
        function removeTrack(sender) {
          if (this.signalingState === 'closed') {
            throw new DOMException(
              'The RTCPeerConnection\'s signalingState is \'closed\'.',
              'InvalidStateError');
          }
          // We can not yet check for sender instanceof RTCRtpSender
          // since we shim RTPSender. So we check if sender._pc is set.
          if (!sender._pc) {
            throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
                'does not implement interface RTCRtpSender.', 'TypeError');
          }
          const isLocal = sender._pc === this;
          if (!isLocal) {
            throw new DOMException('Sender was not created by this connection.',
                'InvalidAccessError');
          }

          // Search for the native stream the senders track belongs to.
          this._streams = this._streams || {};
          let stream;
          Object.keys(this._streams).forEach(streamid => {
            const hasTrack = this._streams[streamid].getTracks()
              .find(track => sender.track === track);
            if (hasTrack) {
              stream = this._streams[streamid];
            }
          });

          if (stream) {
            if (stream.getTracks().length === 1) {
              // if this is the last track of the stream, remove the stream. This
              // takes care of any shimmed _senders.
              this.removeStream(this._reverseStreams[stream.id]);
            } else {
              // relying on the same odd chrome behaviour as above.
              stream.removeTrack(sender.track);
            }
            this.dispatchEvent(new Event('negotiationneeded'));
          }
        };
    }

    function shimPeerConnection$1(window, browserDetails) {
      if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
        // very basic support for old versions.
        window.RTCPeerConnection = window.webkitRTCPeerConnection;
      }
      if (!window.RTCPeerConnection) {
        return;
      }

      // shim implicit creation of RTCSessionDescription/RTCIceCandidate
      if (browserDetails.version < 53) {
        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
            .forEach(function(method) {
              const nativeMethod = window.RTCPeerConnection.prototype[method];
              const methodObj = {[method]() {
                arguments[0] = new ((method === 'addIceCandidate') ?
                    window.RTCIceCandidate :
                    window.RTCSessionDescription)(arguments[0]);
                return nativeMethod.apply(this, arguments);
              }};
              window.RTCPeerConnection.prototype[method] = methodObj[method];
            });
      }
    }

    // Attempt to fix ONN in plan-b mode.
    function fixNegotiationNeeded(window, browserDetails) {
      wrapPeerConnectionEvent(window, 'negotiationneeded', e => {
        const pc = e.target;
        if (browserDetails.version < 72 || (pc.getConfiguration &&
            pc.getConfiguration().sdpSemantics === 'plan-b')) {
          if (pc.signalingState !== 'stable') {
            return;
          }
        }
        return e;
      });
    }

    var chromeShim = /*#__PURE__*/Object.freeze({
        __proto__: null,
        shimMediaStream: shimMediaStream,
        shimOnTrack: shimOnTrack$1,
        shimGetSendersWithDtmf: shimGetSendersWithDtmf,
        shimGetStats: shimGetStats,
        shimSenderReceiverGetStats: shimSenderReceiverGetStats,
        shimAddTrackRemoveTrackWithNative: shimAddTrackRemoveTrackWithNative,
        shimAddTrackRemoveTrack: shimAddTrackRemoveTrack,
        shimPeerConnection: shimPeerConnection$1,
        fixNegotiationNeeded: fixNegotiationNeeded,
        shimGetUserMedia: shimGetUserMedia$2,
        shimGetDisplayMedia: shimGetDisplayMedia$1
    });

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimGetUserMedia$1(window, browserDetails) {
      const navigator = window && window.navigator;
      const MediaStreamTrack = window && window.MediaStreamTrack;

      navigator.getUserMedia = function(constraints, onSuccess, onError) {
        // Replace Firefox 44+'s deprecation warning with unprefixed version.
        deprecated('navigator.getUserMedia',
            'navigator.mediaDevices.getUserMedia');
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
      };

      if (!(browserDetails.version > 55 &&
          'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
        const remap = function(obj, a, b) {
          if (a in obj && !(b in obj)) {
            obj[b] = obj[a];
            delete obj[a];
          }
        };

        const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
            bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(c) {
          if (typeof c === 'object' && typeof c.audio === 'object') {
            c = JSON.parse(JSON.stringify(c));
            remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
            remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
          }
          return nativeGetUserMedia(c);
        };

        if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
          const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
          MediaStreamTrack.prototype.getSettings = function() {
            const obj = nativeGetSettings.apply(this, arguments);
            remap(obj, 'mozAutoGainControl', 'autoGainControl');
            remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
            return obj;
          };
        }

        if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
          const nativeApplyConstraints =
            MediaStreamTrack.prototype.applyConstraints;
          MediaStreamTrack.prototype.applyConstraints = function(c) {
            if (this.kind === 'audio' && typeof c === 'object') {
              c = JSON.parse(JSON.stringify(c));
              remap(c, 'autoGainControl', 'mozAutoGainControl');
              remap(c, 'noiseSuppression', 'mozNoiseSuppression');
            }
            return nativeApplyConstraints.apply(this, [c]);
          };
        }
      }
    }

    /*
     *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimGetDisplayMedia(window, preferredMediaSource) {
      if (window.navigator.mediaDevices &&
        'getDisplayMedia' in window.navigator.mediaDevices) {
        return;
      }
      if (!(window.navigator.mediaDevices)) {
        return;
      }
      window.navigator.mediaDevices.getDisplayMedia =
        function getDisplayMedia(constraints) {
          if (!(constraints && constraints.video)) {
            const err = new DOMException('getDisplayMedia without video ' +
                'constraints is undefined');
            err.name = 'NotFoundError';
            // from https://heycam.github.io/webidl/#idl-DOMException-error-names
            err.code = 8;
            return Promise.reject(err);
          }
          if (constraints.video === true) {
            constraints.video = {mediaSource: preferredMediaSource};
          } else {
            constraints.video.mediaSource = preferredMediaSource;
          }
          return window.navigator.mediaDevices.getUserMedia(constraints);
        };
    }

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimOnTrack(window) {
      if (typeof window === 'object' && window.RTCTrackEvent &&
          ('receiver' in window.RTCTrackEvent.prototype) &&
          !('transceiver' in window.RTCTrackEvent.prototype)) {
        Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
          get() {
            return {receiver: this.receiver};
          }
        });
      }
    }

    function shimPeerConnection(window, browserDetails) {
      if (typeof window !== 'object' ||
          !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
        return; // probably media.peerconnection.enabled=false in about:config
      }
      if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
        // very basic support for old versions.
        window.RTCPeerConnection = window.mozRTCPeerConnection;
      }

      if (browserDetails.version < 53) {
        // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
            .forEach(function(method) {
              const nativeMethod = window.RTCPeerConnection.prototype[method];
              const methodObj = {[method]() {
                arguments[0] = new ((method === 'addIceCandidate') ?
                    window.RTCIceCandidate :
                    window.RTCSessionDescription)(arguments[0]);
                return nativeMethod.apply(this, arguments);
              }};
              window.RTCPeerConnection.prototype[method] = methodObj[method];
            });
      }

      const modernStatsTypes = {
        inboundrtp: 'inbound-rtp',
        outboundrtp: 'outbound-rtp',
        candidatepair: 'candidate-pair',
        localcandidate: 'local-candidate',
        remotecandidate: 'remote-candidate'
      };

      const nativeGetStats = window.RTCPeerConnection.prototype.getStats;
      window.RTCPeerConnection.prototype.getStats = function getStats() {
        const [selector, onSucc, onErr] = arguments;
        return nativeGetStats.apply(this, [selector || null])
          .then(stats => {
            if (browserDetails.version < 53 && !onSucc) {
              // Shim only promise getStats with spec-hyphens in type names
              // Leave callback version alone; misc old uses of forEach before Map
              try {
                stats.forEach(stat => {
                  stat.type = modernStatsTypes[stat.type] || stat.type;
                });
              } catch (e) {
                if (e.name !== 'TypeError') {
                  throw e;
                }
                // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                stats.forEach((stat, i) => {
                  stats.set(i, Object.assign({}, stat, {
                    type: modernStatsTypes[stat.type] || stat.type
                  }));
                });
              }
            }
            return stats;
          })
          .then(onSucc, onErr);
      };
    }

    function shimSenderGetStats(window) {
      if (!(typeof window === 'object' && window.RTCPeerConnection &&
          window.RTCRtpSender)) {
        return;
      }
      if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
        return;
      }
      const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          const senders = origGetSenders.apply(this, []);
          senders.forEach(sender => sender._pc = this);
          return senders;
        };
      }

      const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window.RTCPeerConnection.prototype.addTrack = function addTrack() {
          const sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window.RTCRtpSender.prototype.getStats = function getStats() {
        return this.track ? this._pc.getStats(this.track) :
            Promise.resolve(new Map());
      };
    }

    function shimReceiverGetStats(window) {
      if (!(typeof window === 'object' && window.RTCPeerConnection &&
          window.RTCRtpSender)) {
        return;
      }
      if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
        return;
      }
      const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
          const receivers = origGetReceivers.apply(this, []);
          receivers.forEach(receiver => receiver._pc = this);
          return receivers;
        };
      }
      wrapPeerConnectionEvent(window, 'track', e => {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window.RTCRtpReceiver.prototype.getStats = function getStats() {
        return this._pc.getStats(this.track);
      };
    }

    function shimRemoveStream(window) {
      if (!window.RTCPeerConnection ||
          'removeStream' in window.RTCPeerConnection.prototype) {
        return;
      }
      window.RTCPeerConnection.prototype.removeStream =
        function removeStream(stream) {
          deprecated('removeStream', 'removeTrack');
          this.getSenders().forEach(sender => {
            if (sender.track && stream.getTracks().includes(sender.track)) {
              this.removeTrack(sender);
            }
          });
        };
    }

    function shimRTCDataChannel(window) {
      // rename DataChannel to RTCDataChannel (native fix in FF60):
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
      if (window.DataChannel && !window.RTCDataChannel) {
        window.RTCDataChannel = window.DataChannel;
      }
    }

    function shimAddTransceiver(window) {
      // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
      // Firefox ignores the init sendEncodings options passed to addTransceiver
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
      if (!(typeof window === 'object' && window.RTCPeerConnection)) {
        return;
      }
      const origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
      if (origAddTransceiver) {
        window.RTCPeerConnection.prototype.addTransceiver =
          function addTransceiver() {
            this.setParametersPromises = [];
            const initParameters = arguments[1];
            const shouldPerformCheck = initParameters &&
                                      'sendEncodings' in initParameters;
            if (shouldPerformCheck) {
              // If sendEncodings params are provided, validate grammar
              initParameters.sendEncodings.forEach((encodingParam) => {
                if ('rid' in encodingParam) {
                  const ridRegex = /^[a-z0-9]{0,16}$/i;
                  if (!ridRegex.test(encodingParam.rid)) {
                    throw new TypeError('Invalid RID value provided.');
                  }
                }
                if ('scaleResolutionDownBy' in encodingParam) {
                  if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
                    throw new RangeError('scale_resolution_down_by must be >= 1.0');
                  }
                }
                if ('maxFramerate' in encodingParam) {
                  if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                    throw new RangeError('max_framerate must be >= 0.0');
                  }
                }
              });
            }
            const transceiver = origAddTransceiver.apply(this, arguments);
            if (shouldPerformCheck) {
              // Check if the init options were applied. If not we do this in an
              // asynchronous way and save the promise reference in a global object.
              // This is an ugly hack, but at the same time is way more robust than
              // checking the sender parameters before and after the createOffer
              // Also note that after the createoffer we are not 100% sure that
              // the params were asynchronously applied so we might miss the
              // opportunity to recreate offer.
              const {sender} = transceiver;
              const params = sender.getParameters();
              if (!('encodings' in params) ||
                  // Avoid being fooled by patched getParameters() below.
                  (params.encodings.length === 1 &&
                   Object.keys(params.encodings[0]).length === 0)) {
                params.encodings = initParameters.sendEncodings;
                sender.sendEncodings = initParameters.sendEncodings;
                this.setParametersPromises.push(sender.setParameters(params)
                  .then(() => {
                    delete sender.sendEncodings;
                  }).catch(() => {
                    delete sender.sendEncodings;
                  })
                );
              }
            }
            return transceiver;
          };
      }
    }

    function shimGetParameters(window) {
      if (!(typeof window === 'object' && window.RTCRtpSender)) {
        return;
      }
      const origGetParameters = window.RTCRtpSender.prototype.getParameters;
      if (origGetParameters) {
        window.RTCRtpSender.prototype.getParameters =
          function getParameters() {
            const params = origGetParameters.apply(this, arguments);
            if (!('encodings' in params)) {
              params.encodings = [].concat(this.sendEncodings || [{}]);
            }
            return params;
          };
      }
    }

    function shimCreateOffer(window) {
      // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
      // Firefox ignores the init sendEncodings options passed to addTransceiver
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
      if (!(typeof window === 'object' && window.RTCPeerConnection)) {
        return;
      }
      const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
      window.RTCPeerConnection.prototype.createOffer = function createOffer() {
        if (this.setParametersPromises && this.setParametersPromises.length) {
          return Promise.all(this.setParametersPromises)
          .then(() => {
            return origCreateOffer.apply(this, arguments);
          })
          .finally(() => {
            this.setParametersPromises = [];
          });
        }
        return origCreateOffer.apply(this, arguments);
      };
    }

    function shimCreateAnswer(window) {
      // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
      // Firefox ignores the init sendEncodings options passed to addTransceiver
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
      if (!(typeof window === 'object' && window.RTCPeerConnection)) {
        return;
      }
      const origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
      window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
        if (this.setParametersPromises && this.setParametersPromises.length) {
          return Promise.all(this.setParametersPromises)
          .then(() => {
            return origCreateAnswer.apply(this, arguments);
          })
          .finally(() => {
            this.setParametersPromises = [];
          });
        }
        return origCreateAnswer.apply(this, arguments);
      };
    }

    var firefoxShim = /*#__PURE__*/Object.freeze({
        __proto__: null,
        shimOnTrack: shimOnTrack,
        shimPeerConnection: shimPeerConnection,
        shimSenderGetStats: shimSenderGetStats,
        shimReceiverGetStats: shimReceiverGetStats,
        shimRemoveStream: shimRemoveStream,
        shimRTCDataChannel: shimRTCDataChannel,
        shimAddTransceiver: shimAddTransceiver,
        shimGetParameters: shimGetParameters,
        shimCreateOffer: shimCreateOffer,
        shimCreateAnswer: shimCreateAnswer,
        shimGetUserMedia: shimGetUserMedia$1,
        shimGetDisplayMedia: shimGetDisplayMedia
    });

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimLocalStreamsAPI(window) {
      if (typeof window !== 'object' || !window.RTCPeerConnection) {
        return;
      }
      if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.getLocalStreams =
          function getLocalStreams() {
            if (!this._localStreams) {
              this._localStreams = [];
            }
            return this._localStreams;
          };
      }
      if (!('addStream' in window.RTCPeerConnection.prototype)) {
        const _addTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
          if (!this._localStreams) {
            this._localStreams = [];
          }
          if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
          // Try to emulate Chrome's behaviour of adding in audio-video order.
          // Safari orders by track id.
          stream.getAudioTracks().forEach(track => _addTrack.call(this, track,
            stream));
          stream.getVideoTracks().forEach(track => _addTrack.call(this, track,
            stream));
        };

        window.RTCPeerConnection.prototype.addTrack =
          function addTrack(track, ...streams) {
            if (streams) {
              streams.forEach((stream) => {
                if (!this._localStreams) {
                  this._localStreams = [stream];
                } else if (!this._localStreams.includes(stream)) {
                  this._localStreams.push(stream);
                }
              });
            }
            return _addTrack.apply(this, arguments);
          };
      }
      if (!('removeStream' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.removeStream =
          function removeStream(stream) {
            if (!this._localStreams) {
              this._localStreams = [];
            }
            const index = this._localStreams.indexOf(stream);
            if (index === -1) {
              return;
            }
            this._localStreams.splice(index, 1);
            const tracks = stream.getTracks();
            this.getSenders().forEach(sender => {
              if (tracks.includes(sender.track)) {
                this.removeTrack(sender);
              }
            });
          };
      }
    }

    function shimRemoteStreamsAPI(window) {
      if (typeof window !== 'object' || !window.RTCPeerConnection) {
        return;
      }
      if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.getRemoteStreams =
          function getRemoteStreams() {
            return this._remoteStreams ? this._remoteStreams : [];
          };
      }
      if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
          get() {
            return this._onaddstream;
          },
          set(f) {
            if (this._onaddstream) {
              this.removeEventListener('addstream', this._onaddstream);
              this.removeEventListener('track', this._onaddstreampoly);
            }
            this.addEventListener('addstream', this._onaddstream = f);
            this.addEventListener('track', this._onaddstreampoly = (e) => {
              e.streams.forEach(stream => {
                if (!this._remoteStreams) {
                  this._remoteStreams = [];
                }
                if (this._remoteStreams.includes(stream)) {
                  return;
                }
                this._remoteStreams.push(stream);
                const event = new Event('addstream');
                event.stream = stream;
                this.dispatchEvent(event);
              });
            });
          }
        });
        const origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
        window.RTCPeerConnection.prototype.setRemoteDescription =
          function setRemoteDescription() {
            const pc = this;
            if (!this._onaddstreampoly) {
              this.addEventListener('track', this._onaddstreampoly = function(e) {
                e.streams.forEach(stream => {
                  if (!pc._remoteStreams) {
                    pc._remoteStreams = [];
                  }
                  if (pc._remoteStreams.indexOf(stream) >= 0) {
                    return;
                  }
                  pc._remoteStreams.push(stream);
                  const event = new Event('addstream');
                  event.stream = stream;
                  pc.dispatchEvent(event);
                });
              });
            }
            return origSetRemoteDescription.apply(pc, arguments);
          };
      }
    }

    function shimCallbacksAPI(window) {
      if (typeof window !== 'object' || !window.RTCPeerConnection) {
        return;
      }
      const prototype = window.RTCPeerConnection.prototype;
      const origCreateOffer = prototype.createOffer;
      const origCreateAnswer = prototype.createAnswer;
      const setLocalDescription = prototype.setLocalDescription;
      const setRemoteDescription = prototype.setRemoteDescription;
      const addIceCandidate = prototype.addIceCandidate;

      prototype.createOffer =
        function createOffer(successCallback, failureCallback) {
          const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
          const promise = origCreateOffer.apply(this, [options]);
          if (!failureCallback) {
            return promise;
          }
          promise.then(successCallback, failureCallback);
          return Promise.resolve();
        };

      prototype.createAnswer =
        function createAnswer(successCallback, failureCallback) {
          const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
          const promise = origCreateAnswer.apply(this, [options]);
          if (!failureCallback) {
            return promise;
          }
          promise.then(successCallback, failureCallback);
          return Promise.resolve();
        };

      let withCallback = function(description, successCallback, failureCallback) {
        const promise = setLocalDescription.apply(this, [description]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.setLocalDescription = withCallback;

      withCallback = function(description, successCallback, failureCallback) {
        const promise = setRemoteDescription.apply(this, [description]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.setRemoteDescription = withCallback;

      withCallback = function(candidate, successCallback, failureCallback) {
        const promise = addIceCandidate.apply(this, [candidate]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.addIceCandidate = withCallback;
    }

    function shimGetUserMedia(window) {
      const navigator = window && window.navigator;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // shim not needed in Safari 12.1
        const mediaDevices = navigator.mediaDevices;
        const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
        navigator.mediaDevices.getUserMedia = (constraints) => {
          return _getUserMedia(shimConstraints(constraints));
        };
      }

      if (!navigator.getUserMedia && navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }

    function shimConstraints(constraints) {
      if (constraints && constraints.video !== undefined) {
        return Object.assign({},
          constraints,
          {video: compactObject(constraints.video)}
        );
      }

      return constraints;
    }

    function shimRTCIceServerUrls(window) {
      if (!window.RTCPeerConnection) {
        return;
      }
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      const OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection =
        function RTCPeerConnection(pcConfig, pcConstraints) {
          if (pcConfig && pcConfig.iceServers) {
            const newIceServers = [];
            for (let i = 0; i < pcConfig.iceServers.length; i++) {
              let server = pcConfig.iceServers[i];
              if (!server.hasOwnProperty('urls') &&
                  server.hasOwnProperty('url')) {
                deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                server = JSON.parse(JSON.stringify(server));
                server.urls = server.url;
                delete server.url;
                newIceServers.push(server);
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
          return new OrigPeerConnection(pcConfig, pcConstraints);
        };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if ('generateCertificate' in OrigPeerConnection) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get() {
            return OrigPeerConnection.generateCertificate;
          }
        });
      }
    }

    function shimTrackEventTransceiver(window) {
      // Add event.transceiver member over deprecated event.receiver
      if (typeof window === 'object' && window.RTCTrackEvent &&
          'receiver' in window.RTCTrackEvent.prototype &&
          !('transceiver' in window.RTCTrackEvent.prototype)) {
        Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
          get() {
            return {receiver: this.receiver};
          }
        });
      }
    }

    function shimCreateOfferLegacy(window) {
      const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
      window.RTCPeerConnection.prototype.createOffer =
        function createOffer(offerOptions) {
          if (offerOptions) {
            if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
              // support bit values
              offerOptions.offerToReceiveAudio =
                !!offerOptions.offerToReceiveAudio;
            }
            const audioTransceiver = this.getTransceivers().find(transceiver =>
              transceiver.receiver.track.kind === 'audio');
            if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
              if (audioTransceiver.direction === 'sendrecv') {
                if (audioTransceiver.setDirection) {
                  audioTransceiver.setDirection('sendonly');
                } else {
                  audioTransceiver.direction = 'sendonly';
                }
              } else if (audioTransceiver.direction === 'recvonly') {
                if (audioTransceiver.setDirection) {
                  audioTransceiver.setDirection('inactive');
                } else {
                  audioTransceiver.direction = 'inactive';
                }
              }
            } else if (offerOptions.offerToReceiveAudio === true &&
                !audioTransceiver) {
              this.addTransceiver('audio', {direction: 'recvonly'});
            }

            if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
              // support bit values
              offerOptions.offerToReceiveVideo =
                !!offerOptions.offerToReceiveVideo;
            }
            const videoTransceiver = this.getTransceivers().find(transceiver =>
              transceiver.receiver.track.kind === 'video');
            if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
              if (videoTransceiver.direction === 'sendrecv') {
                if (videoTransceiver.setDirection) {
                  videoTransceiver.setDirection('sendonly');
                } else {
                  videoTransceiver.direction = 'sendonly';
                }
              } else if (videoTransceiver.direction === 'recvonly') {
                if (videoTransceiver.setDirection) {
                  videoTransceiver.setDirection('inactive');
                } else {
                  videoTransceiver.direction = 'inactive';
                }
              }
            } else if (offerOptions.offerToReceiveVideo === true &&
                !videoTransceiver) {
              this.addTransceiver('video', {direction: 'recvonly'});
            }
          }
          return origCreateOffer.apply(this, arguments);
        };
    }

    function shimAudioContext(window) {
      if (typeof window !== 'object' || window.AudioContext) {
        return;
      }
      window.AudioContext = window.webkitAudioContext;
    }

    var safariShim = /*#__PURE__*/Object.freeze({
        __proto__: null,
        shimLocalStreamsAPI: shimLocalStreamsAPI,
        shimRemoteStreamsAPI: shimRemoteStreamsAPI,
        shimCallbacksAPI: shimCallbacksAPI,
        shimGetUserMedia: shimGetUserMedia,
        shimConstraints: shimConstraints,
        shimRTCIceServerUrls: shimRTCIceServerUrls,
        shimTrackEventTransceiver: shimTrackEventTransceiver,
        shimCreateOfferLegacy: shimCreateOfferLegacy,
        shimAudioContext: shimAudioContext
    });

    var sdp$1 = {exports: {}};

    /* eslint-env node */

    (function (module) {

    // SDP helpers.
    const SDPUtils = {};

    // Generate an alphanumeric identifier for cname or mids.
    // TODO: use UUIDs instead? https://gist.github.com/jed/982883
    SDPUtils.generateIdentifier = function() {
      return Math.random().toString(36).substr(2, 10);
    };

    // The RTCP CNAME used by all peerconnections from the same JS.
    SDPUtils.localCName = SDPUtils.generateIdentifier();

    // Splits SDP into lines, dealing with both CRLF and LF.
    SDPUtils.splitLines = function(blob) {
      return blob.trim().split('\n').map(line => line.trim());
    };
    // Splits SDP into sessionpart and mediasections. Ensures CRLF.
    SDPUtils.splitSections = function(blob) {
      const parts = blob.split('\nm=');
      return parts.map((part, index) => (index > 0 ?
        'm=' + part : part).trim() + '\r\n');
    };

    // Returns the session description.
    SDPUtils.getDescription = function(blob) {
      const sections = SDPUtils.splitSections(blob);
      return sections && sections[0];
    };

    // Returns the individual media sections.
    SDPUtils.getMediaSections = function(blob) {
      const sections = SDPUtils.splitSections(blob);
      sections.shift();
      return sections;
    };

    // Returns lines that start with a certain prefix.
    SDPUtils.matchPrefix = function(blob, prefix) {
      return SDPUtils.splitLines(blob).filter(line => line.indexOf(prefix) === 0);
    };

    // Parses an ICE candidate line. Sample input:
    // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
    // rport 55996"
    // Input can be prefixed with a=.
    SDPUtils.parseCandidate = function(line) {
      let parts;
      // Parse both variants.
      if (line.indexOf('a=candidate:') === 0) {
        parts = line.substring(12).split(' ');
      } else {
        parts = line.substring(10).split(' ');
      }

      const candidate = {
        foundation: parts[0],
        component: {1: 'rtp', 2: 'rtcp'}[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4], // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7],
      };

      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case 'raddr':
            candidate.relatedAddress = parts[i + 1];
            break;
          case 'rport':
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case 'tcptype':
            candidate.tcpType = parts[i + 1];
            break;
          case 'ufrag':
            candidate.ufrag = parts[i + 1]; // for backward compatibility.
            candidate.usernameFragment = parts[i + 1];
            break;
          default: // extension handling, in particular ufrag. Don't overwrite.
            if (candidate[parts[i]] === undefined) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };

    // Translates a candidate object into SDP candidate attribute.
    // This does not include the a= prefix!
    SDPUtils.writeCandidate = function(candidate) {
      const sdp = [];
      sdp.push(candidate.foundation);

      const component = candidate.component;
      if (component === 'rtp') {
        sdp.push(1);
      } else if (component === 'rtcp') {
        sdp.push(2);
      } else {
        sdp.push(component);
      }
      sdp.push(candidate.protocol.toUpperCase());
      sdp.push(candidate.priority);
      sdp.push(candidate.address || candidate.ip);
      sdp.push(candidate.port);

      const type = candidate.type;
      sdp.push('typ');
      sdp.push(type);
      if (type !== 'host' && candidate.relatedAddress &&
          candidate.relatedPort) {
        sdp.push('raddr');
        sdp.push(candidate.relatedAddress);
        sdp.push('rport');
        sdp.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
        sdp.push('tcptype');
        sdp.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp.push('ufrag');
        sdp.push(candidate.usernameFragment || candidate.ufrag);
      }
      return 'candidate:' + sdp.join(' ');
    };

    // Parses an ice-options line, returns an array of option tags.
    // Sample input:
    // a=ice-options:foo bar
    SDPUtils.parseIceOptions = function(line) {
      return line.substr(14).split(' ');
    };

    // Parses a rtpmap line, returns RTCRtpCoddecParameters. Sample input:
    // a=rtpmap:111 opus/48000/2
    SDPUtils.parseRtpMap = function(line) {
      let parts = line.substr(9).split(' ');
      const parsed = {
        payloadType: parseInt(parts.shift(), 10), // was: id
      };

      parts = parts[0].split('/');

      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      // legacy alias, got renamed back to channels in ORTC.
      parsed.numChannels = parsed.channels;
      return parsed;
    };

    // Generates a rtpmap line from RTCRtpCodecCapability or
    // RTCRtpCodecParameters.
    SDPUtils.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
          (channels !== 1 ? '/' + channels : '') + '\r\n';
    };

    // Parses a extmap line (headerextension from RFC 5285). Sample input:
    // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
    // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
    SDPUtils.parseExtmap = function(line) {
      const parts = line.substr(9).split(' ');
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
        uri: parts[1],
      };
    };

    // Generates an extmap line from RTCRtpHeaderExtensionParameters or
    // RTCRtpHeaderExtension.
    SDPUtils.writeExtmap = function(headerExtension) {
      return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
          (headerExtension.direction && headerExtension.direction !== 'sendrecv'
            ? '/' + headerExtension.direction
            : '') +
          ' ' + headerExtension.uri + '\r\n';
    };

    // Parses a fmtp line, returns dictionary. Sample input:
    // a=fmtp:96 vbr=on;cng=on
    // Also deals with vbr=on; cng=on
    SDPUtils.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substr(line.indexOf(' ') + 1).split(';');
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split('=');
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };

    // Generates a fmtp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
    SDPUtils.writeFmtp = function(codec) {
      let line = '';
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach(param => {
          if (codec.parameters[param] !== undefined) {
            params.push(param + '=' + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
      }
      return line;
    };

    // Parses a rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
    // a=rtcp-fb:98 nack rpsi
    SDPUtils.parseRtcpFb = function(line) {
      const parts = line.substr(line.indexOf(' ') + 1).split(' ');
      return {
        type: parts.shift(),
        parameter: parts.join(' '),
      };
    };

    // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
    SDPUtils.writeRtcpFb = function(codec) {
      let lines = '';
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        // FIXME: special handling for trr-int?
        codec.rtcpFeedback.forEach(fb => {
          lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
          (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
              '\r\n';
        });
      }
      return lines;
    };

    // Parses a RFC 5576 ssrc media attribute. Sample input:
    // a=ssrc:3735928559 cname:something
    SDPUtils.parseSsrcMedia = function(line) {
      const sp = line.indexOf(' ');
      const parts = {
        ssrc: parseInt(line.substr(7, sp - 7), 10),
      };
      const colon = line.indexOf(':', sp);
      if (colon > -1) {
        parts.attribute = line.substr(sp + 1, colon - sp - 1);
        parts.value = line.substr(colon + 1);
      } else {
        parts.attribute = line.substr(sp + 1);
      }
      return parts;
    };

    // Parse a ssrc-group line (see RFC 5576). Sample input:
    // a=ssrc-group:semantics 12 34
    SDPUtils.parseSsrcGroup = function(line) {
      const parts = line.substr(13).split(' ');
      return {
        semantics: parts.shift(),
        ssrcs: parts.map(ssrc => parseInt(ssrc, 10)),
      };
    };

    // Extracts the MID (RFC 5888) from a media section.
    // Returns the MID or undefined if no mid line was found.
    SDPUtils.getMid = function(mediaSection) {
      const mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
      if (mid) {
        return mid.substr(6);
      }
    };

    // Parses a fingerprint line for DTLS-SRTP.
    SDPUtils.parseFingerprint = function(line) {
      const parts = line.substr(14).split(' ');
      return {
        algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase(), // the definition is upper-case in RFC 4572.
      };
    };

    // Extracts DTLS parameters from SDP media section or sessionpart.
    // FIXME: for consistency with other functions this should only
    //   get the fingerprint line as input. See also getIceParameters.
    SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
        'a=fingerprint:');
      // Note: a=setup line is ignored since we use the 'auto' role in Edge.
      return {
        role: 'auto',
        fingerprints: lines.map(SDPUtils.parseFingerprint),
      };
    };

    // Serializes DTLS parameters to SDP.
    SDPUtils.writeDtlsParameters = function(params, setupType) {
      let sdp = 'a=setup:' + setupType + '\r\n';
      params.fingerprints.forEach(fp => {
        sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
      });
      return sdp;
    };

    // Parses a=crypto lines into
    //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
    SDPUtils.parseCryptoLine = function(line) {
      const parts = line.substr(9).split(' ');
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3),
      };
    };

    SDPUtils.writeCryptoLine = function(parameters) {
      return 'a=crypto:' + parameters.tag + ' ' +
        parameters.cryptoSuite + ' ' +
        (typeof parameters.keyParams === 'object'
          ? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
          : parameters.keyParams) +
        (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') +
        '\r\n';
    };

    // Parses the crypto key parameters into
    //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
    SDPUtils.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf('inline:') !== 0) {
        return null;
      }
      const parts = keyParams.substr(7).split('|');
      return {
        keyMethod: 'inline',
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
        mkiLength: parts[2] ? parts[2].split(':')[1] : undefined,
      };
    };

    SDPUtils.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ':'
        + keyParams.keySalt +
        (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') +
        (keyParams.mkiValue && keyParams.mkiLength
          ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength
          : '');
    };

    // Extracts all SDES parameters.
    SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
        'a=crypto:');
      return lines.map(SDPUtils.parseCryptoLine);
    };

    // Parses ICE information from SDP media section or sessionpart.
    // FIXME: for consistency with other functions this should only
    //   get the ice-ufrag and ice-pwd lines as input.
    SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart,
        'a=ice-ufrag:')[0];
      const pwd = SDPUtils.matchPrefix(mediaSection + sessionpart,
        'a=ice-pwd:')[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substr(12),
        password: pwd.substr(10),
      };
    };

    // Serializes ICE parameters to SDP.
    SDPUtils.writeIceParameters = function(params) {
      let sdp = 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
          'a=ice-pwd:' + params.password + '\r\n';
      if (params.iceLite) {
        sdp += 'a=ice-lite\r\n';
      }
      return sdp;
    };

    // Parses the SDP media section and returns RTCRtpParameters.
    SDPUtils.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: [],
      };
      const lines = SDPUtils.splitLines(mediaSection);
      const mline = lines[0].split(' ');
      for (let i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
        const pt = mline[i];
        const rtpmapline = SDPUtils.matchPrefix(
          mediaSection, 'a=rtpmap:' + pt + ' ')[0];
        if (rtpmapline) {
          const codec = SDPUtils.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils.matchPrefix(
            mediaSection, 'a=fmtp:' + pt + ' ');
          // Only the first a=fmtp:<pt> is considered.
          codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils.matchPrefix(
            mediaSection, 'a=rtcp-fb:' + pt + ' ')
            .map(SDPUtils.parseRtcpFb);
          description.codecs.push(codec);
          // parse FEC mechanisms from rtpmap lines.
          switch (codec.name.toUpperCase()) {
            case 'RED':
            case 'ULPFEC':
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
          }
        }
      }
      SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(line => {
        description.headerExtensions.push(SDPUtils.parseExtmap(line));
      });
      // FIXME: parse rtcp.
      return description;
    };

    // Generates parts of the SDP media section describing the capabilities /
    // parameters.
    SDPUtils.writeRtpDescription = function(kind, caps) {
      let sdp = '';

      // Build the mline.
      sdp += 'm=' + kind + ' ';
      sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
      sdp += ' UDP/TLS/RTP/SAVPF ';
      sdp += caps.codecs.map(codec => {
        if (codec.preferredPayloadType !== undefined) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(' ') + '\r\n';

      sdp += 'c=IN IP4 0.0.0.0\r\n';
      sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

      // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
      caps.codecs.forEach(codec => {
        sdp += SDPUtils.writeRtpMap(codec);
        sdp += SDPUtils.writeFmtp(codec);
        sdp += SDPUtils.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach(codec => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp += 'a=maxptime:' + maxptime + '\r\n';
      }

      if (caps.headerExtensions) {
        caps.headerExtensions.forEach(extension => {
          sdp += SDPUtils.writeExtmap(extension);
        });
      }
      // FIXME: write fecMechanisms.
      return sdp;
    };

    // Parses the SDP media section and returns an array of
    // RTCRtpEncodingParameters.
    SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf('RED') !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

      // filter a=ssrc:... cname:, ignore PlanB-msid
      const ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
        .map(line => SDPUtils.parseSsrcMedia(line))
        .filter(parts => parts.attribute === 'cname');
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;

      const flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
        .map(line => {
          const parts = line.substr(17).split(' ');
          return parts.map(part => parseInt(part, 10));
        });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }

      description.codecs.forEach(codec => {
        if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10),
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = {ssrc: secondarySsrc};
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? 'red+ulpfec' : 'red',
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc,
        });
      }

      // we support both b=AS and b=TIAS but interpret AS as TIAS.
      let bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
      if (bandwidth.length) {
        if (bandwidth[0].indexOf('b=TIAS:') === 0) {
          bandwidth = parseInt(bandwidth[0].substr(7), 10);
        } else if (bandwidth[0].indexOf('b=AS:') === 0) {
          // use formula from JSEP to convert b=AS to TIAS value.
          bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
              - (50 * 40 * 8);
        } else {
          bandwidth = undefined;
        }
        encodingParameters.forEach(params => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };

    // parses http://draft.ortc.org/#rtcrtcpparameters*
    SDPUtils.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};

      // Gets the first SSRC. Note that with RTX there might be multiple
      // SSRCs.
      const remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
        .map(line => SDPUtils.parseSsrcMedia(line))
        .filter(obj => obj.attribute === 'cname')[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }

      // Edge uses the compound attribute instead of reducedSize
      // compound is !reducedSize
      const rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;

      // parses the rtcp-mux attrіbute.
      // Note that Edge does not support unmuxed RTCP.
      const mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
      rtcpParameters.mux = mux.length > 0;

      return rtcpParameters;
    };

    SDPUtils.writeRtcpParameters = function(rtcpParameters) {
      let sdp = '';
      if (rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
      if (rtcpParameters.mux) {
        sdp += 'a=rtcp-mux\r\n';
      }
      if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
        sdp += 'a=ssrc:' + rtcpParameters.ssrc +
          ' cname:' + rtcpParameters.cname + '\r\n';
      }
      return sdp;
    };


    // parses either a=msid: or a=ssrc:... msid lines and returns
    // the id of the MediaStream and MediaStreamTrack.
    SDPUtils.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
      if (spec.length === 1) {
        parts = spec[0].substr(7).split(' ');
        return {stream: parts[0], track: parts[1]};
      }
      const planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
        .map(line => SDPUtils.parseSsrcMedia(line))
        .filter(msidParts => msidParts.attribute === 'msid');
      if (planB.length > 0) {
        parts = planB[0].value.split(' ');
        return {stream: parts[0], track: parts[1]};
      }
    };

    // SCTP
    // parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
    // to draft-ietf-mmusic-sctp-sdp-05
    SDPUtils.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substr(12), 10),
          protocol: mline.fmt,
          maxMessageSize,
        };
      }
      const sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0]
          .substr(10)
          .split(' ');
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize,
        };
      }
    };

    // SCTP
    // outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
    // support by now receiving in this format, unless we originally parsed
    // as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
    // protocol of DTLS/SCTP -- without UDP/ or TCP/)
    SDPUtils.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== 'DTLS/SCTP') {
        output = [
          'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n',
          'c=IN IP4 0.0.0.0\r\n',
          'a=sctp-port:' + sctp.port + '\r\n',
        ];
      } else {
        output = [
          'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n',
          'c=IN IP4 0.0.0.0\r\n',
          'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n',
        ];
      }
      if (sctp.maxMessageSize !== undefined) {
        output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
      }
      return output.join('');
    };

    // Generate a session ID for SDP.
    // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
    // recommends using a cryptographically random +ve 64-bit value
    // but right now this should be acceptable and within the right range
    SDPUtils.generateSessionId = function() {
      return Math.random().toString().substr(2, 21);
    };

    // Write boiler plate for start of SDP
    // sessId argument is optional - if not supplied it will
    // be generated randomly
    // sessVersion is optional and defaults to 2
    // sessUser is optional and defaults to 'thisisadapterortc'
    SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== undefined ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils.generateSessionId();
      }
      const user = sessUser || 'thisisadapterortc';
      // FIXME: sess-id should be an NTP timestamp.
      return 'v=0\r\n' +
          'o=' + user + ' ' + sessionId + ' ' + version +
            ' IN IP4 127.0.0.1\r\n' +
          's=-\r\n' +
          't=0 0\r\n';
    };

    // Gets the direction from the mediaSection or the sessionpart.
    SDPUtils.getDirection = function(mediaSection, sessionpart) {
      // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
      const lines = SDPUtils.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case 'a=sendrecv':
          case 'a=sendonly':
          case 'a=recvonly':
          case 'a=inactive':
            return lines[i].substr(2);
            // FIXME: What should happen here?
        }
      }
      if (sessionpart) {
        return SDPUtils.getDirection(sessionpart);
      }
      return 'sendrecv';
    };

    SDPUtils.getKind = function(mediaSection) {
      const lines = SDPUtils.splitLines(mediaSection);
      const mline = lines[0].split(' ');
      return mline[0].substr(2);
    };

    SDPUtils.isRejected = function(mediaSection) {
      return mediaSection.split(' ', 2)[1] === '0';
    };

    SDPUtils.parseMLine = function(mediaSection) {
      const lines = SDPUtils.splitLines(mediaSection);
      const parts = lines[0].substr(2).split(' ');
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(' '),
      };
    };

    SDPUtils.parseOLine = function(mediaSection) {
      const line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
      const parts = line.substr(2).split(' ');
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5],
      };
    };

    // a very naive interpretation of a valid SDP.
    SDPUtils.isValidSDP = function(blob) {
      if (typeof blob !== 'string' || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
          return false;
        }
        // TODO: check the modifier a bit more.
      }
      return true;
    };

    // Expose public methods.
    {
      module.exports = SDPUtils;
    }
    }(sdp$1));

    var SDPUtils = sdp$1.exports;

    var sdp = /*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': SDPUtils
    }, [sdp$1.exports]);

    /*
     *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    function shimRTCIceCandidate(window) {
      // foundation is arbitrarily chosen as an indicator for full support for
      // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
      if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
          window.RTCIceCandidate.prototype)) {
        return;
      }

      const NativeRTCIceCandidate = window.RTCIceCandidate;
      window.RTCIceCandidate = function RTCIceCandidate(args) {
        // Remove the a= which shouldn't be part of the candidate string.
        if (typeof args === 'object' && args.candidate &&
            args.candidate.indexOf('a=') === 0) {
          args = JSON.parse(JSON.stringify(args));
          args.candidate = args.candidate.substr(2);
        }

        if (args.candidate && args.candidate.length) {
          // Augment the native candidate with the parsed fields.
          const nativeCandidate = new NativeRTCIceCandidate(args);
          const parsedCandidate = SDPUtils.parseCandidate(args.candidate);
          const augmentedCandidate = Object.assign(nativeCandidate,
              parsedCandidate);

          // Add a serializer that does not serialize the extra attributes.
          augmentedCandidate.toJSON = function toJSON() {
            return {
              candidate: augmentedCandidate.candidate,
              sdpMid: augmentedCandidate.sdpMid,
              sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
              usernameFragment: augmentedCandidate.usernameFragment,
            };
          };
          return augmentedCandidate;
        }
        return new NativeRTCIceCandidate(args);
      };
      window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

      // Hook up the augmented candidate in onicecandidate and
      // addEventListener('icecandidate', ...)
      wrapPeerConnectionEvent(window, 'icecandidate', e => {
        if (e.candidate) {
          Object.defineProperty(e, 'candidate', {
            value: new window.RTCIceCandidate(e.candidate),
            writable: 'false'
          });
        }
        return e;
      });
    }

    function shimMaxMessageSize(window, browserDetails) {
      if (!window.RTCPeerConnection) {
        return;
      }

      if (!('sctp' in window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
          get() {
            return typeof this._sctp === 'undefined' ? null : this._sctp;
          }
        });
      }

      const sctpInDescription = function(description) {
        if (!description || !description.sdp) {
          return false;
        }
        const sections = SDPUtils.splitSections(description.sdp);
        sections.shift();
        return sections.some(mediaSection => {
          const mLine = SDPUtils.parseMLine(mediaSection);
          return mLine && mLine.kind === 'application'
              && mLine.protocol.indexOf('SCTP') !== -1;
        });
      };

      const getRemoteFirefoxVersion = function(description) {
        // TODO: Is there a better solution for detecting Firefox?
        const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
        if (match === null || match.length < 2) {
          return -1;
        }
        const version = parseInt(match[1], 10);
        // Test for NaN (yes, this is ugly)
        return version !== version ? -1 : version;
      };

      const getCanSendMaxMessageSize = function(remoteIsFirefox) {
        // Every implementation we know can send at least 64 KiB.
        // Note: Although Chrome is technically able to send up to 256 KiB, the
        //       data does not reach the other peer reliably.
        //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
        let canSendMaxMessageSize = 65536;
        if (browserDetails.browser === 'firefox') {
          if (browserDetails.version < 57) {
            if (remoteIsFirefox === -1) {
              // FF < 57 will send in 16 KiB chunks using the deprecated PPID
              // fragmentation.
              canSendMaxMessageSize = 16384;
            } else {
              // However, other FF (and RAWRTC) can reassemble PPID-fragmented
              // messages. Thus, supporting ~2 GiB when sending.
              canSendMaxMessageSize = 2147483637;
            }
          } else if (browserDetails.version < 60) {
            // Currently, all FF >= 57 will reset the remote maximum message size
            // to the default value when a data channel is created at a later
            // stage. :(
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
            canSendMaxMessageSize =
              browserDetails.version === 57 ? 65535 : 65536;
          } else {
            // FF >= 60 supports sending ~2 GiB
            canSendMaxMessageSize = 2147483637;
          }
        }
        return canSendMaxMessageSize;
      };

      const getMaxMessageSize = function(description, remoteIsFirefox) {
        // Note: 65536 bytes is the default value from the SDP spec. Also,
        //       every implementation we know supports receiving 65536 bytes.
        let maxMessageSize = 65536;

        // FF 57 has a slightly incorrect default remote max message size, so
        // we need to adjust it here to avoid a failure when sending.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
        if (browserDetails.browser === 'firefox'
             && browserDetails.version === 57) {
          maxMessageSize = 65535;
        }

        const match = SDPUtils.matchPrefix(description.sdp,
          'a=max-message-size:');
        if (match.length > 0) {
          maxMessageSize = parseInt(match[0].substr(19), 10);
        } else if (browserDetails.browser === 'firefox' &&
                    remoteIsFirefox !== -1) {
          // If the maximum message size is not present in the remote SDP and
          // both local and remote are Firefox, the remote peer can receive
          // ~2 GiB.
          maxMessageSize = 2147483637;
        }
        return maxMessageSize;
      };

      const origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription =
        function setRemoteDescription() {
          this._sctp = null;
          // Chrome decided to not expose .sctp in plan-b mode.
          // As usual, adapter.js has to do an 'ugly worakaround'
          // to cover up the mess.
          if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
            const {sdpSemantics} = this.getConfiguration();
            if (sdpSemantics === 'plan-b') {
              Object.defineProperty(this, 'sctp', {
                get() {
                  return typeof this._sctp === 'undefined' ? null : this._sctp;
                },
                enumerable: true,
                configurable: true,
              });
            }
          }

          if (sctpInDescription(arguments[0])) {
            // Check if the remote is FF.
            const isFirefox = getRemoteFirefoxVersion(arguments[0]);

            // Get the maximum message size the local peer is capable of sending
            const canSendMMS = getCanSendMaxMessageSize(isFirefox);

            // Get the maximum message size of the remote peer.
            const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

            // Determine final maximum message size
            let maxMessageSize;
            if (canSendMMS === 0 && remoteMMS === 0) {
              maxMessageSize = Number.POSITIVE_INFINITY;
            } else if (canSendMMS === 0 || remoteMMS === 0) {
              maxMessageSize = Math.max(canSendMMS, remoteMMS);
            } else {
              maxMessageSize = Math.min(canSendMMS, remoteMMS);
            }

            // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
            // attribute.
            const sctp = {};
            Object.defineProperty(sctp, 'maxMessageSize', {
              get() {
                return maxMessageSize;
              }
            });
            this._sctp = sctp;
          }

          return origSetRemoteDescription.apply(this, arguments);
        };
    }

    function shimSendThrowTypeError(window) {
      if (!(window.RTCPeerConnection &&
          'createDataChannel' in window.RTCPeerConnection.prototype)) {
        return;
      }

      // Note: Although Firefox >= 57 has a native implementation, the maximum
      //       message size can be reset for all data channels at a later stage.
      //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

      function wrapDcSend(dc, pc) {
        const origDataChannelSend = dc.send;
        dc.send = function send() {
          const data = arguments[0];
          const length = data.length || data.size || data.byteLength;
          if (dc.readyState === 'open' &&
              pc.sctp && length > pc.sctp.maxMessageSize) {
            throw new TypeError('Message too large (can send a maximum of ' +
              pc.sctp.maxMessageSize + ' bytes)');
          }
          return origDataChannelSend.apply(dc, arguments);
        };
      }
      const origCreateDataChannel =
        window.RTCPeerConnection.prototype.createDataChannel;
      window.RTCPeerConnection.prototype.createDataChannel =
        function createDataChannel() {
          const dataChannel = origCreateDataChannel.apply(this, arguments);
          wrapDcSend(dataChannel, this);
          return dataChannel;
        };
      wrapPeerConnectionEvent(window, 'datachannel', e => {
        wrapDcSend(e.channel, e.target);
        return e;
      });
    }


    /* shims RTCConnectionState by pretending it is the same as iceConnectionState.
     * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
     * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
     * since DTLS failures would be hidden. See
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
     * for the Firefox tracking bug.
     */
    function shimConnectionState(window) {
      if (!window.RTCPeerConnection ||
          'connectionState' in window.RTCPeerConnection.prototype) {
        return;
      }
      const proto = window.RTCPeerConnection.prototype;
      Object.defineProperty(proto, 'connectionState', {
        get() {
          return {
            completed: 'connected',
            checking: 'connecting'
          }[this.iceConnectionState] || this.iceConnectionState;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(proto, 'onconnectionstatechange', {
        get() {
          return this._onconnectionstatechange || null;
        },
        set(cb) {
          if (this._onconnectionstatechange) {
            this.removeEventListener('connectionstatechange',
                this._onconnectionstatechange);
            delete this._onconnectionstatechange;
          }
          if (cb) {
            this.addEventListener('connectionstatechange',
                this._onconnectionstatechange = cb);
          }
        },
        enumerable: true,
        configurable: true
      });

      ['setLocalDescription', 'setRemoteDescription'].forEach((method) => {
        const origMethod = proto[method];
        proto[method] = function() {
          if (!this._connectionstatechangepoly) {
            this._connectionstatechangepoly = e => {
              const pc = e.target;
              if (pc._lastConnectionState !== pc.connectionState) {
                pc._lastConnectionState = pc.connectionState;
                const newEvent = new Event('connectionstatechange', e);
                pc.dispatchEvent(newEvent);
              }
              return e;
            };
            this.addEventListener('iceconnectionstatechange',
              this._connectionstatechangepoly);
          }
          return origMethod.apply(this, arguments);
        };
      });
    }

    function removeExtmapAllowMixed(window, browserDetails) {
      /* remove a=extmap-allow-mixed for webrtc.org < M71 */
      if (!window.RTCPeerConnection) {
        return;
      }
      if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
        return;
      }
      if (browserDetails.browser === 'safari' && browserDetails.version >= 605) {
        return;
      }
      const nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription(desc) {
        if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
          const sdp = desc.sdp.split('\n').filter((line) => {
            return line.trim() !== 'a=extmap-allow-mixed';
          }).join('\n');
          // Safari enforces read-only-ness of RTCSessionDescription fields.
          if (window.RTCSessionDescription &&
              desc instanceof window.RTCSessionDescription) {
            arguments[0] = new window.RTCSessionDescription({
              type: desc.type,
              sdp,
            });
          } else {
            desc.sdp = sdp;
          }
        }
        return nativeSRD.apply(this, arguments);
      };
    }

    function shimAddIceCandidateNullOrEmpty(window, browserDetails) {
      // Support for addIceCandidate(null or undefined)
      // as well as addIceCandidate({candidate: "", ...})
      // https://bugs.chromium.org/p/chromium/issues/detail?id=978582
      // Note: must be called before other polyfills which change the signature.
      if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
        return;
      }
      const nativeAddIceCandidate =
          window.RTCPeerConnection.prototype.addIceCandidate;
      if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
        return;
      }
      window.RTCPeerConnection.prototype.addIceCandidate =
        function addIceCandidate() {
          if (!arguments[0]) {
            if (arguments[1]) {
              arguments[1].apply(null);
            }
            return Promise.resolve();
          }
          // Firefox 68+ emits and processes {candidate: "", ...}, ignore
          // in older versions.
          // Native support for ignoring exists for Chrome M77+.
          // Safari ignores as well, exact version unknown but works in the same
          // version that also ignores addIceCandidate(null).
          if (((browserDetails.browser === 'chrome' && browserDetails.version < 78)
               || (browserDetails.browser === 'firefox'
                   && browserDetails.version < 68)
               || (browserDetails.browser === 'safari'))
              && arguments[0] && arguments[0].candidate === '') {
            return Promise.resolve();
          }
          return nativeAddIceCandidate.apply(this, arguments);
        };
    }

    // Note: Make sure to call this ahead of APIs that modify
    // setLocalDescription.length
    function shimParameterlessSetLocalDescription(window, browserDetails) {
      if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
        return;
      }
      const nativeSetLocalDescription =
          window.RTCPeerConnection.prototype.setLocalDescription;
      if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
        return;
      }
      window.RTCPeerConnection.prototype.setLocalDescription =
        function setLocalDescription() {
          let desc = arguments[0] || {};
          if (typeof desc !== 'object' || (desc.type && desc.sdp)) {
            return nativeSetLocalDescription.apply(this, arguments);
          }
          // The remaining steps should technically happen when SLD comes off the
          // RTCPeerConnection's operations chain (not ahead of going on it), but
          // this is too difficult to shim. Instead, this shim only covers the
          // common case where the operations chain is empty. This is imperfect, but
          // should cover many cases. Rationale: Even if we can't reduce the glare
          // window to zero on imperfect implementations, there's value in tapping
          // into the perfect negotiation pattern that several browsers support.
          desc = {type: desc.type, sdp: desc.sdp};
          if (!desc.type) {
            switch (this.signalingState) {
              case 'stable':
              case 'have-local-offer':
              case 'have-remote-pranswer':
                desc.type = 'offer';
                break;
              default:
                desc.type = 'answer';
                break;
            }
          }
          if (desc.sdp || (desc.type !== 'offer' && desc.type !== 'answer')) {
            return nativeSetLocalDescription.apply(this, [desc]);
          }
          const func = desc.type === 'offer' ? this.createOffer : this.createAnswer;
          return func.apply(this)
            .then(d => nativeSetLocalDescription.apply(this, [d]));
        };
    }

    var commonShim = /*#__PURE__*/Object.freeze({
        __proto__: null,
        shimRTCIceCandidate: shimRTCIceCandidate,
        shimMaxMessageSize: shimMaxMessageSize,
        shimSendThrowTypeError: shimSendThrowTypeError,
        shimConnectionState: shimConnectionState,
        removeExtmapAllowMixed: removeExtmapAllowMixed,
        shimAddIceCandidateNullOrEmpty: shimAddIceCandidateNullOrEmpty,
        shimParameterlessSetLocalDescription: shimParameterlessSetLocalDescription
    });

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    // Shimming starts here.
    function adapterFactory({window} = {}, options = {
      shimChrome: true,
      shimFirefox: true,
      shimSafari: true,
    }) {
      // Utils.
      const logging = log;
      const browserDetails = detectBrowser(window);

      const adapter = {
        browserDetails,
        commonShim,
        extractVersion: extractVersion,
        disableLog: disableLog,
        disableWarnings: disableWarnings,
        // Expose sdp as a convenience. For production apps include directly.
        sdp,
      };

      // Shim browser if found.
      switch (browserDetails.browser) {
        case 'chrome':
          if (!chromeShim || !shimPeerConnection$1 ||
              !options.shimChrome) {
            logging('Chrome shim is not included in this adapter release.');
            return adapter;
          }
          if (browserDetails.version === null) {
            logging('Chrome shim can not determine version, not shimming.');
            return adapter;
          }
          logging('adapter.js shimming chrome.');
          // Export to the adapter global object visible in the browser.
          adapter.browserShim = chromeShim;

          // Must be called before shimPeerConnection.
          shimAddIceCandidateNullOrEmpty(window, browserDetails);
          shimParameterlessSetLocalDescription(window);

          shimGetUserMedia$2(window, browserDetails);
          shimMediaStream(window);
          shimPeerConnection$1(window, browserDetails);
          shimOnTrack$1(window);
          shimAddTrackRemoveTrack(window, browserDetails);
          shimGetSendersWithDtmf(window);
          shimGetStats(window);
          shimSenderReceiverGetStats(window);
          fixNegotiationNeeded(window, browserDetails);

          shimRTCIceCandidate(window);
          shimConnectionState(window);
          shimMaxMessageSize(window, browserDetails);
          shimSendThrowTypeError(window);
          removeExtmapAllowMixed(window, browserDetails);
          break;
        case 'firefox':
          if (!firefoxShim || !shimPeerConnection ||
              !options.shimFirefox) {
            logging('Firefox shim is not included in this adapter release.');
            return adapter;
          }
          logging('adapter.js shimming firefox.');
          // Export to the adapter global object visible in the browser.
          adapter.browserShim = firefoxShim;

          // Must be called before shimPeerConnection.
          shimAddIceCandidateNullOrEmpty(window, browserDetails);
          shimParameterlessSetLocalDescription(window);

          shimGetUserMedia$1(window, browserDetails);
          shimPeerConnection(window, browserDetails);
          shimOnTrack(window);
          shimRemoveStream(window);
          shimSenderGetStats(window);
          shimReceiverGetStats(window);
          shimRTCDataChannel(window);
          shimAddTransceiver(window);
          shimGetParameters(window);
          shimCreateOffer(window);
          shimCreateAnswer(window);

          shimRTCIceCandidate(window);
          shimConnectionState(window);
          shimMaxMessageSize(window, browserDetails);
          shimSendThrowTypeError(window);
          break;
        case 'safari':
          if (!safariShim || !options.shimSafari) {
            logging('Safari shim is not included in this adapter release.');
            return adapter;
          }
          logging('adapter.js shimming safari.');
          // Export to the adapter global object visible in the browser.
          adapter.browserShim = safariShim;

          // Must be called before shimCallbackAPI.
          shimAddIceCandidateNullOrEmpty(window, browserDetails);
          shimParameterlessSetLocalDescription(window);

          shimRTCIceServerUrls(window);
          shimCreateOfferLegacy(window);
          shimCallbacksAPI(window);
          shimLocalStreamsAPI(window);
          shimRemoteStreamsAPI(window);
          shimTrackEventTransceiver(window);
          shimGetUserMedia(window);
          shimAudioContext(window);

          shimRTCIceCandidate(window);
          shimMaxMessageSize(window, browserDetails);
          shimSendThrowTypeError(window);
          removeExtmapAllowMixed(window, browserDetails);
          break;
        default:
          logging('Unsupported browser!');
          break;
      }

      return adapter;
    }

    /*
     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
     *
     *  Use of this source code is governed by a BSD-style license
     *  that can be found in the LICENSE file in the root of the source
     *  tree.
     */

    adapterFactory({window: typeof window === 'undefined' ? undefined : window});

    var parser$1 = {};

    var grammar$1 = {exports: {}};

    var grammar = grammar$1.exports = {
      v: [{
        name: 'version',
        reg: /^(\d*)$/
      }],
      o: [{
        // o=- 20518 0 IN IP4 203.0.113.1
        // NB: sessionId will be a String in most cases because it is huge
        name: 'origin',
        reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
        names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
        format: '%s %s %d %s IP%d %s'
      }],
      // default parsing of these only (though some of these feel outdated)
      s: [{ name: 'name' }],
      i: [{ name: 'description' }],
      u: [{ name: 'uri' }],
      e: [{ name: 'email' }],
      p: [{ name: 'phone' }],
      z: [{ name: 'timezones' }], // TODO: this one can actually be parsed properly...
      r: [{ name: 'repeats' }],   // TODO: this one can also be parsed properly
      // k: [{}], // outdated thing ignored
      t: [{
        // t=0 0
        name: 'timing',
        reg: /^(\d*) (\d*)/,
        names: ['start', 'stop'],
        format: '%d %d'
      }],
      c: [{
        // c=IN IP4 10.47.197.26
        name: 'connection',
        reg: /^IN IP(\d) (\S*)/,
        names: ['version', 'ip'],
        format: 'IN IP%d %s'
      }],
      b: [{
        // b=AS:4000
        push: 'bandwidth',
        reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
        names: ['type', 'limit'],
        format: '%s:%s'
      }],
      m: [{
        // m=video 51744 RTP/AVP 126 97 98 34 31
        // NB: special - pushes to session
        // TODO: rtp/fmtp should be filtered by the payloads found here?
        reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
        names: ['type', 'port', 'protocol', 'payloads'],
        format: '%s %d %s %s'
      }],
      a: [
        {
          // a=rtpmap:110 opus/48000/2
          push: 'rtp',
          reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
          names: ['payload', 'codec', 'rate', 'encoding'],
          format: function (o) {
            return (o.encoding)
              ? 'rtpmap:%d %s/%s/%s'
              : o.rate
                ? 'rtpmap:%d %s/%s'
                : 'rtpmap:%d %s';
          }
        },
        {
          // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
          // a=fmtp:111 minptime=10; useinbandfec=1
          push: 'fmtp',
          reg: /^fmtp:(\d*) ([\S| ]*)/,
          names: ['payload', 'config'],
          format: 'fmtp:%d %s'
        },
        {
          // a=control:streamid=0
          name: 'control',
          reg: /^control:(.*)/,
          format: 'control:%s'
        },
        {
          // a=rtcp:65179 IN IP4 193.84.77.194
          name: 'rtcp',
          reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
          names: ['port', 'netType', 'ipVer', 'address'],
          format: function (o) {
            return (o.address != null)
              ? 'rtcp:%d %s IP%d %s'
              : 'rtcp:%d';
          }
        },
        {
          // a=rtcp-fb:98 trr-int 100
          push: 'rtcpFbTrrInt',
          reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
          names: ['payload', 'value'],
          format: 'rtcp-fb:%s trr-int %d'
        },
        {
          // a=rtcp-fb:98 nack rpsi
          push: 'rtcpFb',
          reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
          names: ['payload', 'type', 'subtype'],
          format: function (o) {
            return (o.subtype != null)
              ? 'rtcp-fb:%s %s %s'
              : 'rtcp-fb:%s %s';
          }
        },
        {
          // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
          // a=extmap:1/recvonly URI-gps-string
          // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
          push: 'ext',
          reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
          names: ['value', 'direction', 'encrypt-uri', 'uri', 'config'],
          format: function (o) {
            return (
              'extmap:%d' +
              (o.direction ? '/%s' : '%v') +
              (o['encrypt-uri'] ? ' %s' : '%v') +
              ' %s' +
              (o.config ? ' %s' : '')
            );
          }
        },
        {
          // a=extmap-allow-mixed
          name: 'extmapAllowMixed',
          reg: /^(extmap-allow-mixed)/
        },
        {
          // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
          push: 'crypto',
          reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
          names: ['id', 'suite', 'config', 'sessionConfig'],
          format: function (o) {
            return (o.sessionConfig != null)
              ? 'crypto:%d %s %s %s'
              : 'crypto:%d %s %s';
          }
        },
        {
          // a=setup:actpass
          name: 'setup',
          reg: /^setup:(\w*)/,
          format: 'setup:%s'
        },
        {
          // a=connection:new
          name: 'connectionType',
          reg: /^connection:(new|existing)/,
          format: 'connection:%s'
        },
        {
          // a=mid:1
          name: 'mid',
          reg: /^mid:([^\s]*)/,
          format: 'mid:%s'
        },
        {
          // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
          name: 'msid',
          reg: /^msid:(.*)/,
          format: 'msid:%s'
        },
        {
          // a=ptime:20
          name: 'ptime',
          reg: /^ptime:(\d*(?:\.\d*)*)/,
          format: 'ptime:%d'
        },
        {
          // a=maxptime:60
          name: 'maxptime',
          reg: /^maxptime:(\d*(?:\.\d*)*)/,
          format: 'maxptime:%d'
        },
        {
          // a=sendrecv
          name: 'direction',
          reg: /^(sendrecv|recvonly|sendonly|inactive)/
        },
        {
          // a=ice-lite
          name: 'icelite',
          reg: /^(ice-lite)/
        },
        {
          // a=ice-ufrag:F7gI
          name: 'iceUfrag',
          reg: /^ice-ufrag:(\S*)/,
          format: 'ice-ufrag:%s'
        },
        {
          // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
          name: 'icePwd',
          reg: /^ice-pwd:(\S*)/,
          format: 'ice-pwd:%s'
        },
        {
          // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
          name: 'fingerprint',
          reg: /^fingerprint:(\S*) (\S*)/,
          names: ['type', 'hash'],
          format: 'fingerprint:%s %s'
        },
        {
          // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
          // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
          // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
          push:'candidates',
          reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
          names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
          format: function (o) {
            var str = 'candidate:%s %d %s %d %s %d typ %s';

            str += (o.raddr != null) ? ' raddr %s rport %d' : '%v%v';

            // NB: candidate has three optional chunks, so %void middles one if it's missing
            str += (o.tcptype != null) ? ' tcptype %s' : '%v';

            if (o.generation != null) {
              str += ' generation %d';
            }

            str += (o['network-id'] != null) ? ' network-id %d' : '%v';
            str += (o['network-cost'] != null) ? ' network-cost %d' : '%v';
            return str;
          }
        },
        {
          // a=end-of-candidates (keep after the candidates line for readability)
          name: 'endOfCandidates',
          reg: /^(end-of-candidates)/
        },
        {
          // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
          name: 'remoteCandidates',
          reg: /^remote-candidates:(.*)/,
          format: 'remote-candidates:%s'
        },
        {
          // a=ice-options:google-ice
          name: 'iceOptions',
          reg: /^ice-options:(\S*)/,
          format: 'ice-options:%s'
        },
        {
          // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
          push: 'ssrcs',
          reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
          names: ['id', 'attribute', 'value'],
          format: function (o) {
            var str = 'ssrc:%d';
            if (o.attribute != null) {
              str += ' %s';
              if (o.value != null) {
                str += ':%s';
              }
            }
            return str;
          }
        },
        {
          // a=ssrc-group:FEC 1 2
          // a=ssrc-group:FEC-FR 3004364195 1080772241
          push: 'ssrcGroups',
          // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
          reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
          names: ['semantics', 'ssrcs'],
          format: 'ssrc-group:%s %s'
        },
        {
          // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
          name: 'msidSemantic',
          reg: /^msid-semantic:\s?(\w*) (\S*)/,
          names: ['semantic', 'token'],
          format: 'msid-semantic: %s %s' // space after ':' is not accidental
        },
        {
          // a=group:BUNDLE audio video
          push: 'groups',
          reg: /^group:(\w*) (.*)/,
          names: ['type', 'mids'],
          format: 'group:%s %s'
        },
        {
          // a=rtcp-mux
          name: 'rtcpMux',
          reg: /^(rtcp-mux)/
        },
        {
          // a=rtcp-rsize
          name: 'rtcpRsize',
          reg: /^(rtcp-rsize)/
        },
        {
          // a=sctpmap:5000 webrtc-datachannel 1024
          name: 'sctpmap',
          reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
          names: ['sctpmapNumber', 'app', 'maxMessageSize'],
          format: function (o) {
            return (o.maxMessageSize != null)
              ? 'sctpmap:%s %s %s'
              : 'sctpmap:%s %s';
          }
        },
        {
          // a=x-google-flag:conference
          name: 'xGoogleFlag',
          reg: /^x-google-flag:([^\s]*)/,
          format: 'x-google-flag:%s'
        },
        {
          // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
          push: 'rids',
          reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
          names: ['id', 'direction', 'params'],
          format: function (o) {
            return (o.params) ? 'rid:%s %s %s' : 'rid:%s %s';
          }
        },
        {
          // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
          // a=imageattr:* send [x=800,y=640] recv *
          // a=imageattr:100 recv [x=320,y=240]
          push: 'imageattrs',
          reg: new RegExp(
            // a=imageattr:97
            '^imageattr:(\\d+|\\*)' +
            // send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
            '[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' +
            // recv [x=330,y=250]
            '(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'
          ),
          names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
          format: function (o) {
            return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
          }
        },
        {
          // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
          // a=simulcast:recv 1;4,5 send 6;7
          name: 'simulcast',
          reg: new RegExp(
            // a=simulcast:
            '^simulcast:' +
            // send 1,2,3;~4,~5
            '(send|recv) ([a-zA-Z0-9\\-_~;,]+)' +
            // space + recv 6;~7,~8
            '(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' +
            // end
            '$'
          ),
          names: ['dir1', 'list1', 'dir2', 'list2'],
          format: function (o) {
            return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
          }
        },
        {
          // old simulcast draft 03 (implemented by Firefox)
          //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
          // a=simulcast: recv pt=97;98 send pt=97
          // a=simulcast: send rid=5;6;7 paused=6,7
          name: 'simulcast_03',
          reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
          names: ['value'],
          format: 'simulcast: %s'
        },
        {
          // a=framerate:25
          // a=framerate:29.97
          name: 'framerate',
          reg: /^framerate:(\d+(?:$|\.\d+))/,
          format: 'framerate:%s'
        },
        {
          // RFC4570
          // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
          name: 'sourceFilter',
          reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
          names: ['filterMode', 'netType', 'addressTypes', 'destAddress', 'srcList'],
          format: 'source-filter: %s %s %s %s %s'
        },
        {
          // a=bundle-only
          name: 'bundleOnly',
          reg: /^(bundle-only)/
        },
        {
          // a=label:1
          name: 'label',
          reg: /^label:(.+)/,
          format: 'label:%s'
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
          name: 'sctpPort',
          reg: /^sctp-port:(\d+)$/,
          format: 'sctp-port:%s'
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
          name: 'maxMessageSize',
          reg: /^max-message-size:(\d+)$/,
          format: 'max-message-size:%s'
        },
        {
          // RFC7273
          // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
          push:'tsRefClocks',
          reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
          names: ['clksrc', 'clksrcExt'],
          format: function (o) {
            return 'ts-refclk:%s' + (o.clksrcExt != null ? '=%s' : '');
          }
        },
        {
          // RFC7273
          // a=mediaclk:direct=963214424
          name:'mediaClk',
          reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
          names: ['id', 'mediaClockName', 'mediaClockValue', 'rateNumerator', 'rateDenominator'],
          format: function (o) {
            var str = 'mediaclk:';
            str += (o.id != null ? 'id=%s %s' : '%v%s');
            str += (o.mediaClockValue != null ? '=%s' : '');
            str += (o.rateNumerator != null ? ' rate=%s' : '');
            str += (o.rateDenominator != null ? '/%s' : '');
            return str;
          }
        },
        {
          // a=keywds:keywords
          name: 'keywords',
          reg: /^keywds:(.+)$/,
          format: 'keywds:%s'
        },
        {
          // a=content:main
          name: 'content',
          reg: /^content:(.+)/,
          format: 'content:%s'
        },
        // BFCP https://tools.ietf.org/html/rfc4583
        {
          // a=floorctrl:c-s
          name: 'bfcpFloorCtrl',
          reg: /^floorctrl:(c-only|s-only|c-s)/,
          format: 'floorctrl:%s'
        },
        {
          // a=confid:1
          name: 'bfcpConfId',
          reg: /^confid:(\d+)/,
          format: 'confid:%s'
        },
        {
          // a=userid:1
          name: 'bfcpUserId',
          reg: /^userid:(\d+)/,
          format: 'userid:%s'
        },
        {
          // a=floorid:1
          name: 'bfcpFloorId',
          reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
          names: ['id', 'mStream'],
          format: 'floorid:%s mstrm:%s'
        },
        {
          // any a= that we don't understand is kept verbatim on media.invalid
          push: 'invalid',
          names: ['value']
        }
      ]
    };

    // set sensible defaults to avoid polluting the grammar with boring details
    Object.keys(grammar).forEach(function (key) {
      var objs = grammar[key];
      objs.forEach(function (obj) {
        if (!obj.reg) {
          obj.reg = /(.*)/;
        }
        if (!obj.format) {
          obj.format = '%s';
        }
      });
    });

    (function (exports) {
    var toIntIfInt = function (v) {
      return String(Number(v)) === v ? Number(v) : v;
    };

    var attachProperties = function (match, location, names, rawName) {
      if (rawName && !names) {
        location[rawName] = toIntIfInt(match[1]);
      }
      else {
        for (var i = 0; i < names.length; i += 1) {
          if (match[i+1] != null) {
            location[names[i]] = toIntIfInt(match[i+1]);
          }
        }
      }
    };

    var parseReg = function (obj, location, content) {
      var needsBlank = obj.name && obj.names;
      if (obj.push && !location[obj.push]) {
        location[obj.push] = [];
      }
      else if (needsBlank && !location[obj.name]) {
        location[obj.name] = {};
      }
      var keyLocation = obj.push ?
        {} :  // blank object that will be pushed
        needsBlank ? location[obj.name] : location; // otherwise, named location or root

      attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);

      if (obj.push) {
        location[obj.push].push(keyLocation);
      }
    };

    var grammar = grammar$1.exports;
    var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);

    exports.parse = function (sdp) {
      var session = {}
        , media = []
        , location = session; // points at where properties go under (one of the above)

      // parse lines we understand
      sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
        var type = l[0];
        var content = l.slice(2);
        if (type === 'm') {
          media.push({rtp: [], fmtp: []});
          location = media[media.length-1]; // point at latest media line
        }

        for (var j = 0; j < (grammar[type] || []).length; j += 1) {
          var obj = grammar[type][j];
          if (obj.reg.test(content)) {
            return parseReg(obj, location, content);
          }
        }
      });

      session.media = media; // link it up
      return session;
    };

    var paramReducer = function (acc, expr) {
      var s = expr.split(/=(.+)/, 2);
      if (s.length === 2) {
        acc[s[0]] = toIntIfInt(s[1]);
      } else if (s.length === 1 && expr.length > 1) {
        acc[s[0]] = undefined;
      }
      return acc;
    };

    exports.parseParams = function (str) {
      return str.split(/;\s?/).reduce(paramReducer, {});
    };

    // For backward compatibility - alias will be removed in 3.0.0
    exports.parseFmtpConfig = exports.parseParams;

    exports.parsePayloads = function (str) {
      return str.toString().split(' ').map(Number);
    };

    exports.parseRemoteCandidates = function (str) {
      var candidates = [];
      var parts = str.split(' ').map(toIntIfInt);
      for (var i = 0; i < parts.length; i += 3) {
        candidates.push({
          component: parts[i],
          ip: parts[i + 1],
          port: parts[i + 2]
        });
      }
      return candidates;
    };

    exports.parseImageAttributes = function (str) {
      return str.split(' ').map(function (item) {
        return item.substring(1, item.length-1).split(',').reduce(paramReducer, {});
      });
    };

    exports.parseSimulcastStreamList = function (str) {
      return str.split(';').map(function (stream) {
        return stream.split(',').map(function (format) {
          var scid, paused = false;

          if (format[0] !== '~') {
            scid = toIntIfInt(format);
          } else {
            scid = toIntIfInt(format.substring(1, format.length));
            paused = true;
          }

          return {
            scid: scid,
            paused: paused
          };
        });
      });
    };
    }(parser$1));

    var parser = parser$1;
    var parse = parser.parse;

    const SDP_CARRIAGE_RETURN = '\r\n';
    function getLocalTrackInfo(kind, receive, localTrack) {
        const direction = (() => {
            const send = !!localTrack;
            if (send && receive)
                return 'sendrecv';
            if (send && !receive)
                return 'sendonly';
            if (!send && receive)
                return 'recvonly';
            return 'inactive';
        })();
        return { trackOrKind: localTrack || kind, direction };
    }
    function isSdpInvalid(options, errorLog, sdp) {
        if (!sdp) {
            return 'iceCandidate: SDP missing';
        }
        const parsedSdp = parse(sdp);
        for (const mediaLine of parsedSdp.media) {
            if (!mediaLine.candidates || mediaLine.candidates?.length === 0) {
                errorLog('isSdpInvalid', 'ice candidates missing');
                return 'isSdpInvalid: ice candidates missing';
            }
            if (!options.allowPort0 && mediaLine.port === 0) {
                errorLog('isSdpInvalid', 'Found invalid port number 0');
                return 'isSdpInvalid: Found invalid port number 0';
            }
            if (!mediaLine.icePwd || !mediaLine.iceUfrag) {
                errorLog('isSdpInvalid', 'ice ufrag and password not found');
                return 'isSdpInvalid: ice ufrag and password not found';
            }
        }
        return '';
    }
    function convertCLineToIpv4(sdp) {
        return sdp.replace(/c=IN IP6 .*/gi, 'c=IN IP4 0.0.0.0');
    }
    function convertPort9to0(sdp) {
        return sdp.replace(/^m=(audio|video) 9 /gim, 'm=$1 0 ');
    }
    function getNumOfOccurences(string, subString) {
        let n = 0;
        let pos = 0;
        while (pos >= 0) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                n += 1;
                pos += subString.length;
            }
        }
        return n;
    }
    function setContentSlides(sdp) {
        if (getNumOfOccurences(sdp, 'm=video ') === 2) {
            return `${sdp}a=content:slides${SDP_CARRIAGE_RETURN}`;
        }
        return sdp;
    }
    function mungeLocalSdp(config, sdp) {
        let mungedSdp = convertCLineToIpv4(sdp);
        if (config.convertPort9to0) {
            mungedSdp = convertPort9to0(mungedSdp);
        }
        if (config.addContentSlides) {
            mungedSdp = setContentSlides(mungedSdp);
        }
        return mungedSdp;
    }

    var Event$1;
    (function (Event) {
        Event["CONNECTION_STATE_CHANGED"] = "connectionState:changed";
        Event["REMOTE_TRACK_ADDED"] = "remoteTrack:added";
        Event["ROAP_MESSAGE_TO_SEND"] = "roap:messageToSend";
    })(Event$1 || (Event$1 = {}));
    var ConnectionState;
    (function (ConnectionState) {
        ConnectionState["NEW"] = "NEW";
        ConnectionState["CLOSED"] = "CLOSED";
        ConnectionState["CONNECTED"] = "CONNECTED";
        ConnectionState["CONNECTING"] = "CONNECTING";
        ConnectionState["DISCONNECTED"] = "DISCONNECTED";
        ConnectionState["FAILED"] = "FAILED";
    })(ConnectionState || (ConnectionState = {}));
    var RemoteTrackType;
    (function (RemoteTrackType) {
        RemoteTrackType["AUDIO"] = "audio";
        RemoteTrackType["VIDEO"] = "video";
        RemoteTrackType["SCREENSHARE_VIDEO"] = "screenShareVideo";
    })(RemoteTrackType || (RemoteTrackType = {}));

    var NegotiationState;
    (function (NegotiationState) {
        NegotiationState["IDLE"] = "idle";
        NegotiationState["CREATING_OFFER"] = "creating_offer";
        NegotiationState["SETTING_LOCAL_OFFER"] = "setting_local_offer";
        NegotiationState["WAITING_FOR_REMOTE_ANSWER"] = "waiting_for_remote_answer";
        NegotiationState["SETTING_REMOTE_ANSWER"] = "setting_remote_answer";
        NegotiationState["SETTING_REMOTE_OFFER"] = "setting_remote_offer";
        NegotiationState["CREATING_ANSWER"] = "creating_answer";
        NegotiationState["SETTING_LOCAL_ANSWER"] = "setting_local_answer";
    })(NegotiationState || (NegotiationState = {}));
    class Roap extends EventEmitter {
        negotiationState;
        seq;
        id;
        pc;
        config;
        constructor(pc, config, debugId) {
            super();
            this.id = debugId || 'ROAP';
            this.config = config;
            this.seq = 0;
            this.pc = pc;
            this.negotiationState = NegotiationState.IDLE;
        }
        log(action, description) {
            logger.info({
                ID: this.id,
                mediaType: ROAP,
                action,
                description,
            });
        }
        error(action, description) {
            logger.error({
                ID: this.id,
                mediaType: ROAP,
                action,
                description,
            });
        }
        initiateOffer() {
            if (this.negotiationState !== NegotiationState.IDLE) {
                return Promise.reject(new Error(`cannot start new negotiation in state ${this.negotiationState}`));
            }
            this.seq += 1;
            this.negotiationState = NegotiationState.CREATING_OFFER;
            return this.pc
                .createOffer()
                .then((description) => {
                this.log('initiateOffer()', 'local SDP offer created');
                this.negotiationState = NegotiationState.SETTING_LOCAL_OFFER;
                return this.pc.setLocalDescription(description);
            })
                .then(() => this.checkIceCandidates())
                .then(() => {
                this.log('initiateOffer()', 'local SDP offer set');
                this.negotiationState = NegotiationState.WAITING_FOR_REMOTE_ANSWER;
                const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription.sdp);
                this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
                    roapMessage: {
                        seq: this.seq,
                        messageType: 'OFFER',
                        sdp: mungedSdp,
                        tieBreaker: 4294967294,
                    },
                });
            });
        }
        roapMessageReceived(roapMessage) {
            const { messageType, sdp } = roapMessage;
            if (!this.pc) {
                return Promise.reject(new Error('RTCPeerConnection object is missing'));
            }
            if (messageType === 'OFFER' && this.negotiationState !== NegotiationState.IDLE) {
                return Promise.reject(new Error(`received SDP offer in the wrong state: ${this.pc.signalingState}`));
            }
            if (messageType === 'ANSWER' &&
                this.negotiationState !== NegotiationState.WAITING_FOR_REMOTE_ANSWER) {
                return Promise.reject(new Error(`received SDP answer in the wrong state: ${this.pc.signalingState}`));
            }
            switch (messageType) {
                case 'ANSWER':
                    return this.handleRoapAnswer(sdp);
                case 'OFFER':
                    return this.handleRoapOffer(sdp);
                case 'OK':
                    return Promise.resolve();
                case 'ERROR':
                    return Promise.resolve();
                default:
                    this.error('roapMessageReceived()', `unsupported messageType: ${messageType}`);
                    return Promise.reject(new Error('unhandled messageType'));
            }
        }
        handleRoapOffer(sdp) {
            if (!sdp) {
                return Promise.reject(new Error('SDP missing'));
            }
            this.negotiationState = NegotiationState.SETTING_REMOTE_OFFER;
            this.seq += 1;
            this.log('handleRoapOffer()', 'called');
            return this.pc
                .setRemoteDescription(new window.RTCSessionDescription({
                type: 'offer',
                sdp,
            }))
                .then(() => {
                this.negotiationState = NegotiationState.CREATING_ANSWER;
                return this.pc.createAnswer();
            })
                .then((answer) => {
                this.negotiationState = NegotiationState.SETTING_LOCAL_ANSWER;
                return this.pc.setLocalDescription(answer);
            })
                .then(() => this.checkIceCandidates())
                .then(() => {
                const mungedSdp = mungeLocalSdp(this.config.sdpMunging, this.pc.localDescription.sdp);
                this.negotiationState = NegotiationState.IDLE;
                this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
                    roapMessage: {
                        seq: this.seq,
                        messageType: 'ANSWER',
                        sdp: mungedSdp,
                    },
                });
            });
        }
        handleRoapAnswer(sdp) {
            if (!sdp) {
                return Promise.reject(new Error('SDP missing'));
            }
            this.negotiationState = NegotiationState.SETTING_REMOTE_ANSWER;
            this.log('handleRoapAnswer()', 'called');
            return this.pc
                .setRemoteDescription(new window.RTCSessionDescription({
                type: 'answer',
                sdp,
            }))
                .then(() => {
                this.negotiationState = NegotiationState.IDLE;
                this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
                    roapMessage: {
                        seq: this.seq,
                        messageType: 'OK',
                    },
                });
            });
        }
        checkIceCandidates() {
            return new Promise((resolve, reject) => {
                const startTime = performance.now();
                let done = false;
                const doneGatheringIceCandidates = () => {
                    if (!done) {
                        const miliseconds = performance.now() - startTime;
                        this.log('checkIceCandidates()', 'checking SDP...');
                        const invalidSdpPresent = isSdpInvalid({
                            allowPort0: !!this.config.sdpMunging.convertPort9to0,
                        }, this.error, this.pc.localDescription.sdp);
                        if (invalidSdpPresent) {
                            this.error('checkIceCandidates()', 'SDP not valid after waiting.');
                            reject(new Error('SDP not valid'));
                        }
                        this.log('checkIceCandidates()', `It took ${miliseconds} miliseconds to gather ice candidates`);
                        done = true;
                        resolve();
                    }
                };
                if (this.pc.iceGatheringState === 'complete') {
                    this.log('checkIceCandidates()', 'iceGatheringState is already "complete"');
                    doneGatheringIceCandidates();
                }
                this.pc.onicegatheringstatechange = () => {
                    this.log('checkIceCandidates()', `iceGatheringState changed to ${this.pc.iceGatheringState}`);
                    if (this.pc.iceGatheringState === 'complete') {
                        doneGatheringIceCandidates();
                    }
                };
                this.pc.onicecandidate = (evt) => {
                    if (evt.candidate === null) {
                        this.log('checkIceCandidates()', 'evt.candidate === null received');
                        doneGatheringIceCandidates();
                    }
                    else {
                        this.log('checkIceCandidates()', `ICE Candidate: ${evt.candidate?.candidate}`);
                    }
                };
                this.pc.onicecandidateerror = (event) => {
                    this.error('checkIceCandidates()', `onicecandidateerror: ${event}`);
                    reject(new Error('Error gathering ICE candidates'));
                };
            });
        }
    }

    const localTrackTypes = [
        { type: 'audio', kind: 'audio' },
        { type: 'video', kind: 'video' },
        { type: 'screenShareVideo', kind: 'video' },
    ];
    class MediaConnection$1 extends EventEmitter {
        id;
        config;
        pc;
        roap;
        localTracks;
        transceivers;
        receiveOptions;
        localOfferInitiated = false;
        mediaConnectionState;
        constructor(mediaConnectionConfig, options, debugId) {
            super();
            this.config = mediaConnectionConfig;
            this.receiveOptions = options.receive;
            this.localTracks = options.send;
            this.id = debugId || 'MediaConnection';
            this.transceivers = {};
            this.mediaConnectionState = ConnectionState.NEW;
            this.pc = new window.RTCPeerConnection({ iceServers: this.config.iceServers });
            this.roap = new Roap(this.pc, this.config, debugId);
            this.roap.on(Event$1.ROAP_MESSAGE_TO_SEND, this.onRoapMessageToSend.bind(this));
            this.pc.ontrack = this.onTrack.bind(this);
            this.pc.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
            this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this);
            this.log('constructor()', `config: ${JSON.stringify(mediaConnectionConfig)}, options: ${JSON.stringify(options)}`);
        }
        log(action, description) {
            logger.info({
                ID: this.id,
                mediaType: MEDIA_CONNECTION,
                action,
                description,
            });
        }
        error(action, description) {
            logger.error({
                ID: this.id,
                mediaType: MEDIA_CONNECTION,
                action,
                description,
            });
        }
        createTransceivers() {
            localTrackTypes.forEach(({ type, kind }) => {
                const trackType = type;
                const transceiverType = type;
                const trackInfo = getLocalTrackInfo(kind, this.receiveOptions[trackType], this.localTracks[trackType]);
                this.transceivers[transceiverType] = this.pc.addTransceiver(trackInfo.trackOrKind, {
                    direction: trackInfo.direction,
                });
            });
        }
        initiateOffer() {
            this.log('initiateOffer()', 'called');
            if (this.localOfferInitiated || this.pc.getTransceivers().length > 0) {
                this.error('initiateOffer()', 'SDP negotiation already started');
                return Promise.reject(new Error('SDP negotiation already started'));
            }
            this.createTransceivers();
            this.localOfferInitiated = true;
            return this.roap.initiateOffer();
        }
        close() {
            this.log('close()', 'called');
            this.pc.close();
        }
        reconnect() {
            this.log('reconnect()', 'called');
        }
        updateSendOptions(tracks) {
            this.log('updateSendOptions()', `called with ${JSON.stringify(tracks)}`);
            let newOfferNeeded = false;
            this.identifyTransceivers();
            localTrackTypes.forEach(({ type, kind }) => {
                const trackType = type;
                const transceiverType = type;
                const track = tracks[trackType];
                const transceiver = this.transceivers[transceiverType];
                if (track !== undefined) {
                    this.localTracks[trackType] = track;
                    if (transceiver) {
                        const trackInfo = getLocalTrackInfo(kind, this.receiveOptions[trackType], track);
                        transceiver.direction = trackInfo.direction;
                        transceiver.sender.replaceTrack(track);
                        newOfferNeeded = true;
                    }
                }
            });
            if (newOfferNeeded) {
                this.log('updateSendOptions()', 'triggering offer...');
                return this.roap.initiateOffer();
            }
            return Promise.resolve();
        }
        updateReceiveOptions(options) {
            this.log('updateReceiveOptions()', `called with ${JSON.stringify(options)}`);
            this.receiveOptions = options;
            this.identifyTransceivers();
            let newOfferNeeded = false;
            localTrackTypes.forEach(({ type, kind }) => {
                const trackType = type;
                const transceiverType = type;
                const transceiver = this.transceivers[transceiverType];
                if (transceiver) {
                    const trackInfo = getLocalTrackInfo(kind, this.receiveOptions[trackType], this.localTracks[trackType]);
                    if (transceiver.direction !== trackInfo.direction) {
                        transceiver.direction = trackInfo.direction;
                        newOfferNeeded = true;
                    }
                }
            });
            if (newOfferNeeded) {
                this.log('updateReceiveOptions()', 'triggering offer...');
                return this.roap.initiateOffer();
            }
            return Promise.resolve();
        }
        getConnectionState() {
            this.log('getConnectionState()', `called, returning ${this.mediaConnectionState}`);
            return this.mediaConnectionState;
        }
        roapMessageReceived(roapMessage) {
            this.log('roapMessageReceived()', `called with messageType=${roapMessage.messageType}, seq=${roapMessage.seq}`);
            if (!this.localOfferInitiated && roapMessage.messageType === 'OFFER') {
                this.addLocalTracks();
            }
            return this.roap.roapMessageReceived(roapMessage);
        }
        onRoapMessageToSend(event) {
            this.log('onRoapMessageToSend()', `emitting Event.ROAP_MESSAGE_TO_SEND: messageType=${event.roapMessage.messageType}, seq=${event.roapMessage.seq}`);
            this.emit(Event$1.ROAP_MESSAGE_TO_SEND, event);
        }
        identifyTransceivers() {
            if (!this.transceivers.audio &&
                !this.transceivers.video &&
                !this.transceivers.screenShareVideo) {
                const transceivers = this.pc.getTransceivers();
                this.log('identifyTransceivers()', `transceivers.length=${transceivers.length}`);
                transceivers.forEach((transceiver, idx) => {
                    this.log('identifyTransceivers()', `transceiver[${idx}].mid=${transceiver.mid}`);
                });
                [this.transceivers.audio, this.transceivers.video, this.transceivers.screenShareVideo] =
                    transceivers;
            }
        }
        onTrack(event) {
            this.log('onTrack()', `callback called: event=${JSON.stringify(event)}`);
            const MEDIA_ID = {
                AUDIO_TRACK: '0',
                VIDEO_TRACK: '1',
                SHARE_TRACK: '2',
            };
            const { track } = event;
            let trackMediaID = null;
            this.identifyTransceivers();
            if (event.transceiver?.mid) {
                this.log('onTrack()', 'identifying track by event.transceiver.mid');
                trackMediaID = event.transceiver.mid;
            }
            else if (track.id === this.transceivers.audio?.receiver?.track?.id) {
                trackMediaID = MEDIA_ID.AUDIO_TRACK;
            }
            else if (track.id === this.transceivers.video?.receiver?.track?.id) {
                trackMediaID = MEDIA_ID.VIDEO_TRACK;
            }
            else if (track.id === this.transceivers.screenShareVideo?.receiver?.track?.id) {
                trackMediaID = MEDIA_ID.SHARE_TRACK;
            }
            else {
                trackMediaID = null;
            }
            this.log('onTrack()', `trackMediaID=${trackMediaID}`);
            switch (trackMediaID) {
                case MEDIA_ID.AUDIO_TRACK:
                    this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=AUDIO');
                    this.emit(Event$1.REMOTE_TRACK_ADDED, {
                        type: RemoteTrackType.AUDIO,
                        track,
                    });
                    break;
                case MEDIA_ID.VIDEO_TRACK:
                    this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=VIDEO');
                    this.emit(Event$1.REMOTE_TRACK_ADDED, {
                        type: RemoteTrackType.VIDEO,
                        track,
                    });
                    break;
                case MEDIA_ID.SHARE_TRACK:
                    this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=SCREENSHARE_VIDEO');
                    this.emit(Event$1.REMOTE_TRACK_ADDED, {
                        type: RemoteTrackType.SCREENSHARE_VIDEO,
                        track,
                    });
                    break;
                default: {
                    this.error('onTrack()', `failed to match remote track media id: ${trackMediaID}`);
                }
            }
        }
        addLocalTracks() {
            this.log('addLocalTracks()', `adding tracks ${JSON.stringify(this.localTracks)}`);
            if (this.localTracks.audio) {
                this.pc.addTrack(this.localTracks.audio);
            }
            if (this.localTracks.video) {
                this.pc.addTrack(this.localTracks.video);
            }
            if (this.localTracks.screenShareVideo) {
                this.pc.addTrack(this.localTracks.screenShareVideo);
            }
        }
        onConnectionStateChange() {
            this.log('onConnectionStateChange()', `callback called: connectionState=${this.pc.connectionState}`);
            this.evaluateMediaConnectionState();
        }
        onIceConnectionStateChange() {
            this.log('onIceConnectionStateChange()', `callback called: iceConnectionState=${this.pc.iceConnectionState}`);
            this.evaluateMediaConnectionState();
        }
        evaluateMediaConnectionState() {
            const rtcPcConnectionState = this.pc.connectionState;
            const iceState = this.pc.iceConnectionState;
            const connectionStates = [rtcPcConnectionState, iceState];
            if (connectionStates.some((value) => value === 'closed')) {
                this.mediaConnectionState = ConnectionState.CLOSED;
            }
            else if (connectionStates.some((value) => value === 'failed')) {
                this.mediaConnectionState = ConnectionState.FAILED;
            }
            else if (connectionStates.some((value) => value === 'disconnected')) {
                this.mediaConnectionState = ConnectionState.DISCONNECTED;
            }
            else if (connectionStates.every((value) => value === 'connected' || value === 'completed')) {
                this.mediaConnectionState = ConnectionState.CONNECTED;
            }
            else {
                this.mediaConnectionState = ConnectionState.CONNECTING;
            }
            this.log('evaluateConnectionState', `iceConnectionState=${iceState} rtcPcConnectionState=${rtcPcConnectionState} => mediaConnectionState=${this.mediaConnectionState}`);
            this.emit(Event$1.CONNECTION_STATE_CHANGED, { state: this.mediaConnectionState });
        }
    }

    var MediaConnections = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get Event () { return Event$1; },
        get ConnectionState () { return ConnectionState; },
        get RemoteTrackType () { return RemoteTrackType; },
        MediaConnection: MediaConnection$1
    });

    const DetectRTC = require('detectrtc');
    function isBrowserSupported() {
        let isSupported = false;
        logger.info({
            mediaType: MEDIA,
            action: 'isBrowserSupported()',
            description: 'Checking is current browser supported by webrtc',
        });
        if ((DetectRTC.browser.isChrome ||
            DetectRTC.browser.isFirefox ||
            DetectRTC.browser.isSafari ||
            DetectRTC.browser.isEdge) &&
            DetectRTC.isWebRTCSupported) {
            isSupported = true;
        }
        return isSupported;
    }
    const Media = {
        createAudioTrack: createAudioTrack,
        createVideoTrack: createVideoTrack,
        isBrowserSupported: isBrowserSupported
    };
    const MediaConnection = MediaConnections;

    exports.Media = Media;
    exports.MediaConnection = MediaConnection;
    exports.isBrowserSupported = isBrowserSupported;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
