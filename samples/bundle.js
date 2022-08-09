(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/asyncToGenerator'), require('@babel/runtime/helpers/defineProperty'), require('@babel/runtime/helpers/classPrivateFieldGet'), require('@babel/runtime/helpers/classPrivateFieldSet')) :
  typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/asyncToGenerator', '@babel/runtime/helpers/defineProperty', '@babel/runtime/helpers/classPrivateFieldGet', '@babel/runtime/helpers/classPrivateFieldSet'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.webrtcCore = {}, global._asyncToGenerator, global._defineProperty, global._classPrivateFieldGet, global._classPrivateFieldSet));
})(this, (function (exports, _asyncToGenerator, _defineProperty, _classPrivateFieldGet, _classPrivateFieldSet) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

  var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
  var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
  var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
  var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on$1 = noop;
  var addListener = noop;
  var once = noop;
  var off$1 = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance$1 = global$1.performance || {};
  var performanceNow =
    performance$1.now        ||
    performance$1.mozNow     ||
    performance$1.msNow      ||
    performance$1.oNow       ||
    performance$1.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance$1)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var browser$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on$1,
    addListener: addListener,
    once: once,
    off: off$1,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var DetectRTC = {exports: {}};

  (function (module) {
    // ________________
    // DetectRTC v1.4.1
    // Open-Sourced: https://github.com/muaz-khan/DetectRTC
    // --------------------------------------------------
    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // --------------------------------------------------

    (function () {
      var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';
      var isNodejs = typeof browser$1 === 'object' && typeof browser$1.versions === 'object' && browser$1.versions.node &&
      /*node-process*/
      !browser$1.browser;

      if (isNodejs) {
        var version = browser$1.versions.node.toString().replace('v', '');
        browserFakeUserAgent = 'Nodejs/' + version + ' (NodeOS) AppleWebKit/' + version + ' (KHTML, like Gecko) Nodejs/' + version + ' Nodejs/' + version;
      }

      (function (that) {
        if (typeof window !== 'undefined') {
          return;
        }

        if (typeof window === 'undefined' && typeof commonjsGlobal !== 'undefined') {
          commonjsGlobal.navigator = {
            userAgent: browserFakeUserAgent,
            getUserMedia: function getUserMedia() {}
          };
          /*global window:true */

          that.window = commonjsGlobal;
        }

        if (typeof location === 'undefined') {
          /*global location:true */
          that.location = {
            protocol: 'file:',
            href: '',
            hash: ''
          };
        }

        if (typeof screen === 'undefined') {
          /*global screen:true */
          that.screen = {
            width: 0,
            height: 0
          };
        }
      })(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : window);
      /*global navigator:true */


      var navigator = window.navigator;

      if (typeof navigator !== 'undefined') {
        if (typeof navigator.webkitGetUserMedia !== 'undefined') {
          navigator.getUserMedia = navigator.webkitGetUserMedia;
        }

        if (typeof navigator.mozGetUserMedia !== 'undefined') {
          navigator.getUserMedia = navigator.mozGetUserMedia;
        }
      } else {
        navigator = {
          getUserMedia: function getUserMedia() {},
          userAgent: browserFakeUserAgent
        };
      }

      var isMobileDevice = !!/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent || '');
      var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && 'netscape' in window && / rv:/.test(navigator.userAgent);
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      var isChrome = !!window.chrome && !isOpera;
      var isIE = typeof document !== 'undefined' && !!document.documentMode && !isEdge; // this one can also be used:
      // https://www.websocket.org/js/stuff.js (DetectBrowser.js)

      function getBrowserInfo() {
        navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix; // In Opera, the true version is after 'Opera' or after 'Version'

        if (isOpera) {
          browserName = 'Opera';

          try {
            fullVersion = navigator.userAgent.split('OPR/')[1].split(' ')[0];
            majorVersion = fullVersion.split('.')[0];
          } catch (e) {
            fullVersion = '0.0.0.0';
            majorVersion = 0;
          }
        } // In MSIE version <=10, the true version is after 'MSIE' in userAgent
        // In IE 11, look for the string after 'rv:'
        else if (isIE) {
          verOffset = nAgt.indexOf('rv:');

          if (verOffset > 0) {
            //IE 11
            fullVersion = nAgt.substring(verOffset + 3);
          } else {
            //IE 10 or earlier
            verOffset = nAgt.indexOf('MSIE');
            fullVersion = nAgt.substring(verOffset + 5);
          }

          browserName = 'IE';
        } // In Chrome, the true version is after 'Chrome' 
        else if (isChrome) {
          verOffset = nAgt.indexOf('Chrome');
          browserName = 'Chrome';
          fullVersion = nAgt.substring(verOffset + 7);
        } // In Safari, the true version is after 'Safari' or after 'Version' 
        else if (isSafari) {
          // both and safri and chrome has same userAgent
          if (nAgt.indexOf('CriOS') !== -1) {
            verOffset = nAgt.indexOf('CriOS');
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 6);
          } else if (nAgt.indexOf('FxiOS') !== -1) {
            verOffset = nAgt.indexOf('FxiOS');
            browserName = 'Firefox';
            fullVersion = nAgt.substring(verOffset + 6);
          } else {
            verOffset = nAgt.indexOf('Safari');
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
              fullVersion = nAgt.substring(verOffset + 8);
            }

            if (navigator.userAgent.indexOf('Version/') !== -1) {
              fullVersion = navigator.userAgent.split('Version/')[1].split(' ')[0];
            }
          }
        } // In Firefox, the true version is after 'Firefox' 
        else if (isFirefox) {
          verOffset = nAgt.indexOf('Firefox');
          browserName = 'Firefox';
          fullVersion = nAgt.substring(verOffset + 8);
        } // In most other browsers, 'name/version' is at the end of userAgent 
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
          browserName = nAgt.substring(nameOffset, verOffset);
          fullVersion = nAgt.substring(verOffset + 1);

          if (browserName.toLowerCase() === browserName.toUpperCase()) {
            browserName = navigator.appName;
          }
        }

        if (isEdge) {
          browserName = 'Edge';
          fullVersion = navigator.userAgent.split('Edge/')[1]; // fullVersion = parseInt(navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)[2], 10).toString();
        } // trim the fullVersion string at semicolon/space/bracket if present


        if ((ix = fullVersion.search(/[; \)]/)) !== -1) {
          fullVersion = fullVersion.substring(0, ix);
        }

        majorVersion = parseInt('' + fullVersion, 10);

        if (isNaN(majorVersion)) {
          fullVersion = '' + parseFloat(navigator.appVersion);
          majorVersion = parseInt(navigator.appVersion, 10);
        }

        return {
          fullVersion: fullVersion,
          version: majorVersion,
          name: browserName,
          isPrivateBrowsing: false
        };
      } // via: https://gist.github.com/cou929/7973956


      function retry(isDone, next) {
        var currentTrial = 0,
            maxRetry = 50,
            isTimeout = false;
        var id = window.setInterval(function () {
          if (isDone()) {
            window.clearInterval(id);
            next(isTimeout);
          }

          if (currentTrial++ > maxRetry) {
            window.clearInterval(id);
            isTimeout = true;
            next(isTimeout);
          }
        }, 10);
      }

      function isIE10OrLater(userAgent) {
        var ua = userAgent.toLowerCase();

        if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
          return false;
        }

        var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);

        if (match && parseInt(match[1], 10) >= 10) {
          return true;
        }

        return false;
      }

      function detectPrivateMode(callback) {
        var isPrivate;

        try {
          if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(window.TEMPORARY, 1, function () {
              isPrivate = false;
            }, function (e) {
              isPrivate = true;
            });
          } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
            var db;

            try {
              db = window.indexedDB.open('test');

              db.onerror = function () {
                return true;
              };
            } catch (e) {
              isPrivate = true;
            }

            if (typeof isPrivate === 'undefined') {
              retry(function isDone() {
                return db.readyState === 'done' ? true : false;
              }, function next(isTimeout) {
                if (!isTimeout) {
                  isPrivate = db.result ? false : true;
                }
              });
            }
          } else if (isIE10OrLater(window.navigator.userAgent)) {
            isPrivate = false;

            try {
              if (!window.indexedDB) {
                isPrivate = true;
              }
            } catch (e) {
              isPrivate = true;
            }
          } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
            try {
              window.localStorage.setItem('test', 1);
            } catch (e) {
              isPrivate = true;
            }

            if (typeof isPrivate === 'undefined') {
              isPrivate = false;
              window.localStorage.removeItem('test');
            }
          }
        } catch (e) {
          isPrivate = false;
        }

        retry(function isDone() {
          return typeof isPrivate !== 'undefined' ? true : false;
        }, function next(isTimeout) {
          callback(isPrivate);
        });
      }

      var isMobile = {
        Android: function Android() {
          return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function BlackBerry() {
          return navigator.userAgent.match(/BlackBerry|BB10/i);
        },
        iOS: function iOS() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function Opera() {
          return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function Windows() {
          return navigator.userAgent.match(/IEMobile/i);
        },
        any: function any() {
          return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
        },
        getOsName: function getOsName() {
          var osName = 'Unknown OS';

          if (isMobile.Android()) {
            osName = 'Android';
          }

          if (isMobile.BlackBerry()) {
            osName = 'BlackBerry';
          }

          if (isMobile.iOS()) {
            osName = 'iOS';
          }

          if (isMobile.Opera()) {
            osName = 'Opera Mini';
          }

          if (isMobile.Windows()) {
            osName = 'Windows';
          }

          return osName;
        }
      }; // via: http://jsfiddle.net/ChristianL/AVyND/

      function detectDesktopOS() {
        var unknown = '-';
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var os = unknown;
        var clientStrings = [{
          s: 'Chrome OS',
          r: /CrOS/
        }, {
          s: 'Windows 10',
          r: /(Windows 10.0|Windows NT 10.0)/
        }, {
          s: 'Windows 8.1',
          r: /(Windows 8.1|Windows NT 6.3)/
        }, {
          s: 'Windows 8',
          r: /(Windows 8|Windows NT 6.2)/
        }, {
          s: 'Windows 7',
          r: /(Windows 7|Windows NT 6.1)/
        }, {
          s: 'Windows Vista',
          r: /Windows NT 6.0/
        }, {
          s: 'Windows Server 2003',
          r: /Windows NT 5.2/
        }, {
          s: 'Windows XP',
          r: /(Windows NT 5.1|Windows XP)/
        }, {
          s: 'Windows 2000',
          r: /(Windows NT 5.0|Windows 2000)/
        }, {
          s: 'Windows ME',
          r: /(Win 9x 4.90|Windows ME)/
        }, {
          s: 'Windows 98',
          r: /(Windows 98|Win98)/
        }, {
          s: 'Windows 95',
          r: /(Windows 95|Win95|Windows_95)/
        }, {
          s: 'Windows NT 4.0',
          r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
        }, {
          s: 'Windows CE',
          r: /Windows CE/
        }, {
          s: 'Windows 3.11',
          r: /Win16/
        }, {
          s: 'Android',
          r: /Android/
        }, {
          s: 'Open BSD',
          r: /OpenBSD/
        }, {
          s: 'Sun OS',
          r: /SunOS/
        }, {
          s: 'Linux',
          r: /(Linux|X11)/
        }, {
          s: 'iOS',
          r: /(iPhone|iPad|iPod)/
        }, {
          s: 'Mac OS X',
          r: /Mac OS X/
        }, {
          s: 'Mac OS',
          r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
        }, {
          s: 'QNX',
          r: /QNX/
        }, {
          s: 'UNIX',
          r: /UNIX/
        }, {
          s: 'BeOS',
          r: /BeOS/
        }, {
          s: 'OS/2',
          r: /OS\/2/
        }, {
          s: 'Search Bot',
          r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
        }];

        for (var i = 0, cs; cs = clientStrings[i]; i++) {
          if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
          }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
          if (/Windows (.*)/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
          }

          os = 'Windows';
        }

        switch (os) {
          case 'Mac OS X':
            if (/Mac OS X (10[\.\_\d]+)/.test(nAgt)) {
              osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
            }

            break;

          case 'Android':
            if (/Android ([\.\_\d]+)/.test(nAgt)) {
              osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
            }

            break;

          case 'iOS':
            if (/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)) {
              osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);

              if (osVersion && osVersion.length > 3) {
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
              }
            }

            break;
        }

        return {
          osName: os,
          osVersion: osVersion
        };
      }

      var osName = 'Unknown OS';
      var osVersion = 'Unknown OS Version';

      function getAndroidVersion(ua) {
        ua = (ua || navigator.userAgent).toLowerCase();
        var match = ua.match(/android\s([0-9\.]*)/);
        return match ? match[1] : false;
      }

      var osInfo = detectDesktopOS();

      if (osInfo && osInfo.osName && osInfo.osName != '-') {
        osName = osInfo.osName;
        osVersion = osInfo.osVersion;
      } else if (isMobile.any()) {
        osName = isMobile.getOsName();

        if (osName == 'Android') {
          osVersion = getAndroidVersion();
        }
      }

      var isNodejs = typeof browser$1 === 'object' && typeof browser$1.versions === 'object' && browser$1.versions.node;

      if (osName === 'Unknown OS' && isNodejs) {
        osName = 'Nodejs';
        osVersion = browser$1.versions.node.toString().replace('v', '');
      }

      var isCanvasSupportsStreamCapturing = false;
      var isVideoSupportsStreamCapturing = false;
      ['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function (item) {
        if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
          return;
        }

        if (!isCanvasSupportsStreamCapturing && item in document.createElement('canvas')) {
          isCanvasSupportsStreamCapturing = true;
        }

        if (!isVideoSupportsStreamCapturing && item in document.createElement('video')) {
          isVideoSupportsStreamCapturing = true;
        }
      });
      var regexIpv4Local = /^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/,
          regexIpv4 = /([0-9]{1,3}(\.[0-9]{1,3}){3})/,
          regexIpv6 = /[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}/; // via: https://github.com/diafygi/webrtc-ips

      function DetectLocalIPAddress(callback, stream) {
        if (!DetectRTC.isWebRTCSupported) {
          return;
        }

        var isPublic = true,
            isIpv4 = true;
        getIPs(function (ip) {
          if (!ip) {
            callback(); // Pass nothing to tell that ICE-gathering-ended
          } else if (ip.match(regexIpv4Local)) {
            isPublic = false;
            callback('Local: ' + ip, isPublic, isIpv4);
          } else if (ip.match(regexIpv6)) {
            //via https://ourcodeworld.com/articles/read/257/how-to-get-the-client-ip-address-with-javascript-only
            isIpv4 = false;
            callback('Public: ' + ip, isPublic, isIpv4);
          } else {
            callback('Public: ' + ip, isPublic, isIpv4);
          }
        }, stream);
      }

      function getIPs(callback, stream) {
        if (typeof document === 'undefined' || typeof document.getElementById !== 'function') {
          return;
        }

        var ipDuplicates = {};
        var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

        if (!RTCPeerConnection) {
          var iframe = document.getElementById('iframe');

          if (!iframe) {
            return;
          }

          var win = iframe.contentWindow;
          RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
        }

        if (!RTCPeerConnection) {
          return;
        }

        var peerConfig = null;

        if (DetectRTC.browser === 'Chrome' && DetectRTC.browser.version < 58) {
          // todo: add support for older Opera
          peerConfig = {
            optional: [{
              RtpDataChannels: true
            }]
          };
        }

        var servers = {
          iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
          }]
        };
        var pc = new RTCPeerConnection(servers, peerConfig);

        if (stream) {
          if (pc.addStream) {
            pc.addStream(stream);
          } else if (pc.addTrack && stream.getTracks()[0]) {
            pc.addTrack(stream.getTracks()[0], stream);
          }
        }

        function handleCandidate(candidate) {
          if (!candidate) {
            callback(); // Pass nothing to tell that ICE-gathering-ended

            return;
          }

          var match = regexIpv4.exec(candidate);

          if (!match) {
            return;
          }

          var ipAddress = match[1];
          var isPublic = candidate.match(regexIpv4Local),
              isIpv4 = true;

          if (ipDuplicates[ipAddress] === undefined) {
            callback(ipAddress, isPublic, isIpv4);
          }

          ipDuplicates[ipAddress] = true;
        } // listen for candidate events


        pc.onicecandidate = function (event) {
          if (event.candidate && event.candidate.candidate) {
            handleCandidate(event.candidate.candidate);
          } else {
            handleCandidate(); // Pass nothing to tell that ICE-gathering-ended
          }
        }; // create data channel


        if (!stream) {
          try {
            pc.createDataChannel('sctp', {});
          } catch (e) {}
        } // create an offer sdp


        if (DetectRTC.isPromisesSupported) {
          pc.createOffer().then(function (result) {
            pc.setLocalDescription(result).then(afterCreateOffer);
          });
        } else {
          pc.createOffer(function (result) {
            pc.setLocalDescription(result, afterCreateOffer, function () {});
          }, function () {});
        }

        function afterCreateOffer() {
          var lines = pc.localDescription.sdp.split('\n');
          lines.forEach(function (line) {
            if (line && line.indexOf('a=candidate:') === 0) {
              handleCandidate(line);
            }
          });
        }
      }

      var MediaDevices = [];
      var audioInputDevices = [];
      var audioOutputDevices = [];
      var videoInputDevices = [];

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevices
        // Thanks @xdumaine/enumerateDevices
        navigator.enumerateDevices = function (callback) {
          var enumerateDevices = navigator.mediaDevices.enumerateDevices();

          if (enumerateDevices && enumerateDevices.then) {
            navigator.mediaDevices.enumerateDevices().then(callback).catch(function () {
              callback([]);
            });
          } else {
            callback([]);
          }
        };
      } // Media Devices detection


      var canEnumerate = false;
      /*global MediaStreamTrack:true */

      if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
        canEnumerate = true;
      } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
        canEnumerate = true;
      }

      var hasMicrophone = false;
      var hasSpeakers = false;
      var hasWebcam = false;
      var isWebsiteHasMicrophonePermissions = false;
      var isWebsiteHasWebcamPermissions = false; // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices

      function checkDeviceSupport(callback) {
        if (!canEnumerate) {
          if (callback) {
            callback();
          }

          return;
        }

        if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
          navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
        }

        if (!navigator.enumerateDevices && navigator.enumerateDevices) {
          navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
        }

        if (!navigator.enumerateDevices) {
          if (callback) {
            callback();
          }

          return;
        }

        MediaDevices = [];
        audioInputDevices = [];
        audioOutputDevices = [];
        videoInputDevices = [];
        hasMicrophone = false;
        hasSpeakers = false;
        hasWebcam = false;
        isWebsiteHasMicrophonePermissions = false;
        isWebsiteHasWebcamPermissions = false; // to prevent duplication

        var alreadyUsedDevices = {};
        navigator.enumerateDevices(function (devices) {
          MediaDevices = [];
          audioInputDevices = [];
          audioOutputDevices = [];
          videoInputDevices = [];
          devices.forEach(function (_device) {
            var device = {};

            for (var d in _device) {
              try {
                if (typeof _device[d] !== 'function') {
                  device[d] = _device[d];
                }
              } catch (e) {}
            }

            if (alreadyUsedDevices[device.deviceId + device.label + device.kind]) {
              return;
            } // if it is MediaStreamTrack.getSources


            if (device.kind === 'audio') {
              device.kind = 'audioinput';
            }

            if (device.kind === 'video') {
              device.kind = 'videoinput';
            }

            if (!device.deviceId) {
              device.deviceId = device.id;
            }

            if (!device.id) {
              device.id = device.deviceId;
            }

            if (!device.label) {
              device.isCustomLabel = true;

              if (device.kind === 'videoinput') {
                device.label = 'Camera ' + (videoInputDevices.length + 1);
              } else if (device.kind === 'audioinput') {
                device.label = 'Microphone ' + (audioInputDevices.length + 1);
              } else if (device.kind === 'audiooutput') {
                device.label = 'Speaker ' + (audioOutputDevices.length + 1);
              } else {
                device.label = 'Please invoke getUserMedia once.';
              }

              if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
                if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                  device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
              }
            } else {
              // Firefox on Android still returns empty label
              if (device.kind === 'videoinput' && !isWebsiteHasWebcamPermissions) {
                isWebsiteHasWebcamPermissions = true;
              }

              if (device.kind === 'audioinput' && !isWebsiteHasMicrophonePermissions) {
                isWebsiteHasMicrophonePermissions = true;
              }
            }

            if (device.kind === 'audioinput') {
              hasMicrophone = true;

              if (audioInputDevices.indexOf(device) === -1) {
                audioInputDevices.push(device);
              }
            }

            if (device.kind === 'audiooutput') {
              hasSpeakers = true;

              if (audioOutputDevices.indexOf(device) === -1) {
                audioOutputDevices.push(device);
              }
            }

            if (device.kind === 'videoinput') {
              hasWebcam = true;

              if (videoInputDevices.indexOf(device) === -1) {
                videoInputDevices.push(device);
              }
            } // there is no 'videoouput' in the spec.


            MediaDevices.push(device);
            alreadyUsedDevices[device.deviceId + device.label + device.kind] = device;
          });

          if (typeof DetectRTC !== 'undefined') {
            // to sync latest outputs
            DetectRTC.MediaDevices = MediaDevices;
            DetectRTC.hasMicrophone = hasMicrophone;
            DetectRTC.hasSpeakers = hasSpeakers;
            DetectRTC.hasWebcam = hasWebcam;
            DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
            DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;
            DetectRTC.audioInputDevices = audioInputDevices;
            DetectRTC.audioOutputDevices = audioOutputDevices;
            DetectRTC.videoInputDevices = videoInputDevices;
          }

          if (callback) {
            callback();
          }
        });
      }

      var DetectRTC = window.DetectRTC || {}; // ----------
      // DetectRTC.browser.name || DetectRTC.browser.version || DetectRTC.browser.fullVersion

      DetectRTC.browser = getBrowserInfo();
      detectPrivateMode(function (isPrivateBrowsing) {
        DetectRTC.browser.isPrivateBrowsing = !!isPrivateBrowsing;
      }); // DetectRTC.isChrome || DetectRTC.isFirefox || DetectRTC.isEdge

      DetectRTC.browser['is' + DetectRTC.browser.name] = true; // -----------

      DetectRTC.osName = osName;
      DetectRTC.osVersion = osVersion;
      typeof browser$1 === 'object' && typeof browser$1.versions === 'object' && browser$1.versions['node-webkit']; // --------- Detect if system supports WebRTC 1.0 or WebRTC 1.1.

      var isWebRTCSupported = false;
      ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function (item) {
        if (isWebRTCSupported) {
          return;
        }

        if (item in window) {
          isWebRTCSupported = true;
        }
      });
      DetectRTC.isWebRTCSupported = isWebRTCSupported; //-------

      DetectRTC.isORTCSupported = typeof RTCIceGatherer !== 'undefined'; // --------- Detect if system supports screen capturing API

      var isScreenCapturingSupported = false;

      if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 35) {
        isScreenCapturingSupported = true;
      } else if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 34) {
        isScreenCapturingSupported = true;
      } else if (DetectRTC.browser.isEdge && DetectRTC.browser.version >= 17) {
        isScreenCapturingSupported = true;
      } else if (DetectRTC.osName === 'Android' && DetectRTC.browser.isChrome) {
        isScreenCapturingSupported = true;
      }

      if (!!navigator.getDisplayMedia || navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        isScreenCapturingSupported = true;
      }

      if (!/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
        var isNonLocalHost = typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1;

        if (isNonLocalHost && (DetectRTC.browser.isChrome || DetectRTC.browser.isEdge || DetectRTC.browser.isOpera)) {
          isScreenCapturingSupported = false;
        } else if (DetectRTC.browser.isFirefox) {
          isScreenCapturingSupported = false;
        }
      }

      DetectRTC.isScreenCapturingSupported = isScreenCapturingSupported; // --------- Detect if WebAudio API are supported

      var webAudio = {
        isSupported: false,
        isCreateMediaStreamSourceSupported: false
      };
      ['AudioContext', 'webkitAudioContext', 'mozAudioContext', 'msAudioContext'].forEach(function (item) {
        if (webAudio.isSupported) {
          return;
        }

        if (item in window) {
          webAudio.isSupported = true;

          if (window[item] && 'createMediaStreamSource' in window[item].prototype) {
            webAudio.isCreateMediaStreamSourceSupported = true;
          }
        }
      });
      DetectRTC.isAudioContextSupported = webAudio.isSupported;
      DetectRTC.isCreateMediaStreamSourceSupported = webAudio.isCreateMediaStreamSourceSupported; // ---------- Detect if SCTP/RTP channels are supported.

      var isRtpDataChannelsSupported = false;

      if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 31) {
        isRtpDataChannelsSupported = true;
      }

      DetectRTC.isRtpDataChannelsSupported = isRtpDataChannelsSupported;
      var isSCTPSupportd = false;

      if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 28) {
        isSCTPSupportd = true;
      } else if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 25) {
        isSCTPSupportd = true;
      } else if (DetectRTC.browser.isOpera && DetectRTC.browser.version >= 11) {
        isSCTPSupportd = true;
      }

      DetectRTC.isSctpDataChannelsSupported = isSCTPSupportd; // ---------

      DetectRTC.isMobileDevice = isMobileDevice; // "isMobileDevice" boolean is defined in "getBrowserInfo.js"
      // ------

      var isGetUserMediaSupported = false;

      if (navigator.getUserMedia) {
        isGetUserMediaSupported = true;
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isGetUserMediaSupported = true;
      }

      if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
        if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
          isGetUserMediaSupported = 'Requires HTTPs';
        }
      }

      if (DetectRTC.osName === 'Nodejs') {
        isGetUserMediaSupported = false;
      }

      DetectRTC.isGetUserMediaSupported = isGetUserMediaSupported;
      var displayResolution = '';

      if (screen.width) {
        var width = screen.width ? screen.width : '';
        var height = screen.height ? screen.height : '';
        displayResolution += '' + width + ' x ' + height;
      }

      DetectRTC.displayResolution = displayResolution;

      function getAspectRatio(w, h) {
        function gcd(a, b) {
          return b == 0 ? a : gcd(b, a % b);
        }

        var r = gcd(w, h);
        return w / r / (h / r);
      }

      DetectRTC.displayAspectRatio = getAspectRatio(screen.width, screen.height).toFixed(2); // ----------

      DetectRTC.isCanvasSupportsStreamCapturing = isCanvasSupportsStreamCapturing;
      DetectRTC.isVideoSupportsStreamCapturing = isVideoSupportsStreamCapturing;

      if (DetectRTC.browser.name == 'Chrome' && DetectRTC.browser.version >= 53) {
        if (!DetectRTC.isCanvasSupportsStreamCapturing) {
          DetectRTC.isCanvasSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
        }

        if (!DetectRTC.isVideoSupportsStreamCapturing) {
          DetectRTC.isVideoSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
        }
      } // ------


      DetectRTC.DetectLocalIPAddress = DetectLocalIPAddress;
      DetectRTC.isWebSocketsSupported = 'WebSocket' in window && 2 === window.WebSocket.CLOSING;
      DetectRTC.isWebSocketsBlocked = !DetectRTC.isWebSocketsSupported;

      if (DetectRTC.osName === 'Nodejs') {
        DetectRTC.isWebSocketsSupported = true;
        DetectRTC.isWebSocketsBlocked = false;
      }

      DetectRTC.checkWebSocketsSupport = function (callback) {
        callback = callback || function () {};

        try {
          var starttime;
          var websocket = new WebSocket('wss://echo.websocket.org:443/');

          websocket.onopen = function () {
            DetectRTC.isWebSocketsBlocked = false;
            starttime = new Date().getTime();
            websocket.send('ping');
          };

          websocket.onmessage = function () {
            DetectRTC.WebsocketLatency = new Date().getTime() - starttime + 'ms';
            callback();
            websocket.close();
            websocket = null;
          };

          websocket.onerror = function () {
            DetectRTC.isWebSocketsBlocked = true;
            callback();
          };
        } catch (e) {
          DetectRTC.isWebSocketsBlocked = true;
          callback();
        }
      }; // -------


      DetectRTC.load = function (callback) {
        callback = callback || function () {};

        checkDeviceSupport(callback);
      }; // check for microphone/camera support!

      if (typeof MediaDevices !== 'undefined') {
        DetectRTC.MediaDevices = MediaDevices;
      } else {
        DetectRTC.MediaDevices = [];
      }

      DetectRTC.hasMicrophone = hasMicrophone;
      DetectRTC.hasSpeakers = hasSpeakers;
      DetectRTC.hasWebcam = hasWebcam;
      DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
      DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;
      DetectRTC.audioInputDevices = audioInputDevices;
      DetectRTC.audioOutputDevices = audioOutputDevices;
      DetectRTC.videoInputDevices = videoInputDevices; // ------

      var isSetSinkIdSupported = false;

      if (typeof document !== 'undefined' && typeof document.createElement === 'function' && 'setSinkId' in document.createElement('video')) {
        isSetSinkIdSupported = true;
      }

      DetectRTC.isSetSinkIdSupported = isSetSinkIdSupported; // -----

      var isRTPSenderReplaceTracksSupported = false;

      if (DetectRTC.browser.isFirefox && typeof mozRTCPeerConnection !== 'undefined'
      /*&& DetectRTC.browser.version > 39*/
      ) {
        /*global mozRTCPeerConnection:true */
        if ('getSenders' in mozRTCPeerConnection.prototype) {
          isRTPSenderReplaceTracksSupported = true;
        }
      } else if (DetectRTC.browser.isChrome && typeof webkitRTCPeerConnection !== 'undefined') {
        /*global webkitRTCPeerConnection:true */
        if ('getSenders' in webkitRTCPeerConnection.prototype) {
          isRTPSenderReplaceTracksSupported = true;
        }
      }

      DetectRTC.isRTPSenderReplaceTracksSupported = isRTPSenderReplaceTracksSupported; //------

      var isRemoteStreamProcessingSupported = false;

      if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 38) {
        isRemoteStreamProcessingSupported = true;
      }

      DetectRTC.isRemoteStreamProcessingSupported = isRemoteStreamProcessingSupported; //-------

      var isApplyConstraintsSupported = false;
      /*global MediaStreamTrack:true */

      if (typeof MediaStreamTrack !== 'undefined' && 'applyConstraints' in MediaStreamTrack.prototype) {
        isApplyConstraintsSupported = true;
      }

      DetectRTC.isApplyConstraintsSupported = isApplyConstraintsSupported; //-------

      var isMultiMonitorScreenCapturingSupported = false;

      if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 43) {
        // version 43 merely supports platforms for multi-monitors
        // version 44 will support exact multi-monitor selection i.e. you can select any monitor for screen capturing.
        isMultiMonitorScreenCapturingSupported = true;
      }

      DetectRTC.isMultiMonitorScreenCapturingSupported = isMultiMonitorScreenCapturingSupported;
      DetectRTC.isPromisesSupported = !!('Promise' in window); // version is generated by "grunt"

      DetectRTC.version = '1.4.1';

      if (typeof DetectRTC === 'undefined') {
        window.DetectRTC = {};
      }

      var MediaStream = window.MediaStream;

      if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
        MediaStream = webkitMediaStream;
      }

      if (typeof MediaStream !== 'undefined' && typeof MediaStream === 'function') {
        DetectRTC.MediaStream = Object.keys(MediaStream.prototype);
      } else DetectRTC.MediaStream = false;

      if (typeof MediaStreamTrack !== 'undefined') {
        DetectRTC.MediaStreamTrack = Object.keys(MediaStreamTrack.prototype);
      } else DetectRTC.MediaStreamTrack = false;

      var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

      if (typeof RTCPeerConnection !== 'undefined') {
        DetectRTC.RTCPeerConnection = Object.keys(RTCPeerConnection.prototype);
      } else DetectRTC.RTCPeerConnection = false;

      window.DetectRTC = DetectRTC;

      {
        module.exports = DetectRTC;
      }
    })();
  })(DetectRTC);

  var MEDIA = 'MEDIA';
  var DEVICE = 'DEVICE';
  var MEDIA_STREAM_TRACK = 'MEDIA_STREAM_TRACK';

  var LEVELS = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  };

  var logFormat = (level, logDetails) => {
    var {
      ID,
      mediaType,
      action,
      description,
      error
    } = logDetails;
    var timestamp = new Date().toISOString();
    var errorText = error ? error.stack ? "".concat(error.message, ": ").concat(error.stack) : "".concat(error) : '';
    return "".concat(timestamp, " ").concat(level, " ").concat(ID || '', " ").concat(mediaType, " ").concat(action, " ").concat(description, " ").concat(errorText).replace(/\s+/g, ' ').trim();
  };

  var currentLevel = 'error';

  var log$2 = (level, args) => {
    if (LEVELS[level] <= LEVELS[currentLevel]) {
      console.log(logFormat(level, args));
    }
  };

  var logger = {
    info: args => log$2('info', args),
    warn: args => log$2('warn', args),
    error: args => log$2('error', args),
    debug: args => log$2('debug', args)
  };

  var _loop = function _loop(level) {
    logger[level] = logInfo => {
      var {
        ID,
        mediaType,
        action,
        description,
        error
      } = logInfo;
      currentLevel = level;
      return log$2(level, {
        ID,
        mediaType,
        action,
        description,
        error
      });
    };
  };

  for (var level of ['info', 'warn', 'error', 'debug']) {
    _loop(level);
  }

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter$1() {
    EventEmitter$1.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter$1.EventEmitter = EventEmitter$1;

  EventEmitter$1.usingDomains = false;

  EventEmitter$1.prototype.domain = undefined;
  EventEmitter$1.prototype._events = undefined;
  EventEmitter$1.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter$1.defaultMaxListeners = 10;

  EventEmitter$1.init = function() {
    this.domain = null;
    if (EventEmitter$1.usingDomains) {
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
  EventEmitter$1.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter$1.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter$1.prototype.getMaxListeners = function getMaxListeners() {
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

  EventEmitter$1.prototype.emit = function emit(type) {
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
  EventEmitter$1.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter$1.prototype.on = EventEmitter$1.prototype.addListener;

  EventEmitter$1.prototype.prependListener =
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

  EventEmitter$1.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter$1.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter$1.prototype.removeListener =
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
  EventEmitter$1.prototype.off = function(type, listener){
      return this.removeListener(type, listener);
  };

  EventEmitter$1.prototype.removeAllListeners =
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

  EventEmitter$1.prototype.listeners = function listeners(type) {
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

  EventEmitter$1.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter$1.prototype.listenerCount = listenerCount;
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

  EventEmitter$1.prototype.eventNames = function eventNames() {
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

  function _classPrivateFieldInitSpec$1(obj, privateMap, value) { _checkPrivateRedeclaration$1(obj, privateMap); privateMap.set(obj, value); }

  function _checkPrivateRedeclaration$1(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

  var DeviceKinds;

  (function (DeviceKinds) {
    DeviceKinds["AUDIO_INPUT"] = "audioinput";
    DeviceKinds["AUDIO_OUTPUT"] = "audiooutput";
    DeviceKinds["VIDEO_INPUT"] = "videoinput";
  })(DeviceKinds || (DeviceKinds = {}));

  var _mediaDeviceInfo = /*#__PURE__*/new WeakMap();

  class Device {
    constructor(mediaDeviceInfo) {
      _defineProperty__default["default"](this, "ID", void 0);

      _defineProperty__default["default"](this, "groupID", void 0);

      _defineProperty__default["default"](this, "label", void 0);

      _defineProperty__default["default"](this, "kind", void 0);

      _classPrivateFieldInitSpec$1(this, _mediaDeviceInfo, {
        writable: true,
        value: void 0
      });

      _classPrivateFieldSet__default["default"](this, _mediaDeviceInfo, mediaDeviceInfo);

      this.ID = _classPrivateFieldGet__default["default"](this, _mediaDeviceInfo).deviceId;
      this.groupID = _classPrivateFieldGet__default["default"](this, _mediaDeviceInfo).groupId;
      this.label = _classPrivateFieldGet__default["default"](this, _mediaDeviceInfo).label;
      this.kind = _classPrivateFieldGet__default["default"](this, _mediaDeviceInfo).kind;
    }

  }

  function getTrackSettings(track) {
    logger.debug({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'getTrackSettings()',
      description: 'Called'
    });
    var settings = track.getSettings();

    if (settings) {
      logger.debug({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'getTrackSettings()',
        description: "Returning track settings ".concat(JSON.stringify(settings))
      });
      return settings;
    }

    var error = new Error('Unable to get track settings');
    logger.info({
      ID: track.id,
      mediaType: MEDIA_STREAM_TRACK,
      action: 'getTrackSettings()',
      description: error.message,
      error
    });
    return {};
  }

  function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

  function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
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

  var _mediaStreamTrack = /*#__PURE__*/new WeakMap();

  class Track extends EventEmitter$1 {
    constructor(mediaStreamTrack) {
      super();

      _defineProperty__default["default"](this, "ID", void 0);

      _defineProperty__default["default"](this, "kind", void 0);

      _defineProperty__default["default"](this, "status", void 0);

      _defineProperty__default["default"](this, "muted", void 0);

      _defineProperty__default["default"](this, "label", void 0);

      _classPrivateFieldInitSpec(this, _mediaStreamTrack, {
        writable: true,
        value: void 0
      });

      this.ID = mediaStreamTrack.id;
      this.kind = mediaStreamTrack.kind;
      this.status = mediaStreamTrack.readyState;
      this.muted = mediaStreamTrack.muted;
      this.label = mediaStreamTrack.label;

      _classPrivateFieldSet__default["default"](this, _mediaStreamTrack, mediaStreamTrack);

      _classPrivateFieldGet__default["default"](this, _mediaStreamTrack).onmute = () => {
        var action = _classPrivateFieldGet__default["default"](this, _mediaStreamTrack).enabled ? 'muted' : 'unmuted';
        this.emit('track:mute', {
          action
        });
      };
    }

    stop() {
      _classPrivateFieldGet__default["default"](this, _mediaStreamTrack).stop();

      this.status = TrackStatus.ENDED;
    }

    applyConstraints(constraints) {
      var _this = this;

      return _asyncToGenerator__default["default"](function* () {
        var _constraints$deviceId, _constraints$deviceId2, _constraints$deviceId5;

        logger.debug({
          ID: constraints === null || constraints === void 0 ? void 0 : (_constraints$deviceId = constraints.deviceId) === null || _constraints$deviceId === void 0 ? void 0 : _constraints$deviceId.toString(),
          mediaType: DEVICE,
          action: 'applyConstraints()',
          description: "Called with ".concat(JSON.stringify(constraints))
        });
        logger.info({
          ID: constraints === null || constraints === void 0 ? void 0 : (_constraints$deviceId2 = constraints.deviceId) === null || _constraints$deviceId2 === void 0 ? void 0 : _constraints$deviceId2.toString(),
          mediaType: DEVICE,
          action: 'applyConstraints()',
          description: 'Applying constraints to track objects'
        });
        var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        var notSupportedConstraints = [];

        for (var thisConstraint of Object.keys(constraints)) {
          if (!supportedConstraints[thisConstraint]) {
            var _constraints$deviceId3;

            logger.debug({
              ID: constraints === null || constraints === void 0 ? void 0 : (_constraints$deviceId3 = constraints.deviceId) === null || _constraints$deviceId3 === void 0 ? void 0 : _constraints$deviceId3.toString(),
              mediaType: DEVICE,
              action: 'applyConstraints()',
              description: "Not suported constraint tracked ".concat(thisConstraint)
            });
            notSupportedConstraints.push(thisConstraint);
          }
        }

        if (notSupportedConstraints.length > 0) {
          var _constraints$deviceId4;

          console.warn("#TrackObject Unsupported constraints - ".concat(notSupportedConstraints.join(', ')));
          logger.debug({
            ID: constraints === null || constraints === void 0 ? void 0 : (_constraints$deviceId4 = constraints.deviceId) === null || _constraints$deviceId4 === void 0 ? void 0 : _constraints$deviceId4.toString(),
            mediaType: DEVICE,
            action: 'applyConstraints()',
            description: 'Constraints not applied'
          });
          return false;
        }

        yield _classPrivateFieldGet__default["default"](_this, _mediaStreamTrack).applyConstraints(constraints);
        logger.debug({
          ID: constraints === null || constraints === void 0 ? void 0 : (_constraints$deviceId5 = constraints.deviceId) === null || _constraints$deviceId5 === void 0 ? void 0 : _constraints$deviceId5.toString(),
          mediaType: DEVICE,
          action: 'applyConstraints()',
          description: 'Constraints applied successfully'
        });
        return true;
      })();
    }

    getSettings() {
      logger.debug({
        mediaType: MEDIA,
        action: 'getSettings()',
        description: 'Called'
      });
      logger.info({
        mediaType: MEDIA,
        action: 'getSettings()',
        description: 'Fetching constraints properties for the current media stream track'
      });
      var settings = getTrackSettings(_classPrivateFieldGet__default["default"](this, _mediaStreamTrack));
      logger.debug({
        mediaType: MEDIA,
        action: 'getSettings()',
        description: "Received settings ".concat(JSON.stringify(settings))
      });
      return settings;
    }

    getMediaStreamTrack() {
      logger.debug({
        mediaType: MEDIA,
        action: 'getMediaStreamTrack()',
        description: 'Called'
      });

      var mediaStreamTrack = _classPrivateFieldGet__default["default"](this, _mediaStreamTrack);

      logger.debug({
        mediaType: MEDIA,
        action: 'getMediaStreamTrack()',
        description: "Received media stream track ".concat(JSON.stringify(mediaStreamTrack))
      });
      return mediaStreamTrack;
    }

  }

  var eventEmitter = new EventEmitter$1();
  var deviceList = [];

  var getDevices = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator__default["default"](function* () {
      var _navigator$mediaDevic;

      logger.debug({
        mediaType: DEVICE,
        action: 'getDevices()',
        description: 'Called'
      });

      if (!((_navigator$mediaDevic = navigator.mediaDevices) !== null && _navigator$mediaDevic !== void 0 && _navigator$mediaDevic.enumerateDevices)) {
        console.warn('navigator.mediaDevices.enumerateDevices() is not supported.');
        return [];
      }

      logger.info({
        mediaType: DEVICE,
        action: 'getDevices()',
        description: 'Requesting list of available media input and output devices'
      });
      return navigator.mediaDevices.enumerateDevices();
    });

    return function getDevices() {
      return _ref.apply(this, arguments);
    };
  }();

  var getCameras = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator__default["default"](function* () {
      logger.debug({
        mediaType: DEVICE,
        action: 'getCameras()',
        description: 'Called'
      });
      var devices = yield getDevices();
      logger.info({
        mediaType: DEVICE,
        action: 'getCameras()',
        description: 'Filtering camera devices from all available media devices'
      });
      return devices.filter(_ref3 => {
        var {
          kind
        } = _ref3;
        return kind === DeviceKinds.VIDEO_INPUT;
      }).map(device => {
        logger.debug({
          ID: device.deviceId,
          mediaType: DEVICE,
          action: 'getCameras()',
          description: "Received camera device ".concat(JSON.stringify(device))
        });
        return new Device(device);
      });
    });

    return function getCameras() {
      return _ref2.apply(this, arguments);
    };
  }();

  var getMicrophones = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator__default["default"](function* () {
      logger.debug({
        mediaType: DEVICE,
        action: 'getMicrophones()',
        description: 'Called'
      });
      var devices = yield getDevices();
      logger.info({
        mediaType: DEVICE,
        action: 'getMicrophones()',
        description: 'Filtering microphones devices from all available media devices'
      });
      return devices.filter(_ref5 => {
        var {
          kind
        } = _ref5;
        return kind === DeviceKinds.AUDIO_INPUT;
      }).map(device => {
        logger.debug({
          ID: device.deviceId,
          mediaType: DEVICE,
          action: 'getMicrophones()',
          description: "Received microphone device ".concat(JSON.stringify(device))
        });
        return new Device(device);
      });
    });

    return function getMicrophones() {
      return _ref4.apply(this, arguments);
    };
  }();

  var getSpeakers = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator__default["default"](function* () {
      logger.debug({
        mediaType: DEVICE,
        action: 'getSpeakers()',
        description: 'Called'
      });
      var devices = yield getDevices();
      logger.info({
        mediaType: DEVICE,
        action: 'getSpeakers()',
        description: 'Filtering speaker devices from all available media devices'
      });
      return devices.filter(_ref7 => {
        var {
          kind
        } = _ref7;
        return kind === DeviceKinds.AUDIO_OUTPUT;
      }).map(device => {
        logger.debug({
          ID: device.deviceId,
          mediaType: DEVICE,
          action: 'getSpeakers()',
          description: "Received speaker device ".concat(JSON.stringify(device))
        });
        return new Device(device);
      });
    });

    return function getSpeakers() {
      return _ref6.apply(this, arguments);
    };
  }();

  function getUnsupportedConstraints(mediaConstraints) {
    logger.debug({
      mediaType: MEDIA,
      action: 'getUnsupportedConstraints()',
      description: "Called with ".concat(JSON.stringify(mediaConstraints))
    });
    logger.info({
      mediaType: MEDIA,
      action: 'getUnsupportedConstraints()',
      description: 'Filtering list of media track unsupported constraints'
    });
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var unsupportedConstraints = [];
    Object.keys(mediaConstraints).forEach(constraint => {
      if (!(Object.prototype.hasOwnProperty.call(supportedConstraints, constraint) && supportedConstraints[constraint])) {
        unsupportedConstraints.push(constraint);
      }
    });
    logger.debug({
      mediaType: MEDIA,
      action: 'getUnsupportedConstraints()',
      description: "Received unsupported constraints ".concat(unsupportedConstraints)
    });
    return unsupportedConstraints;
  }

  function createAudioTrack(_x) {
    return _createAudioTrack.apply(this, arguments);
  }

  function _createAudioTrack() {
    _createAudioTrack = _asyncToGenerator__default["default"](function* (device) {
      logger.debug({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: DEVICE,
        action: 'createAudioTrack()',
        description: "Called ".concat(device ? "with ".concat(JSON.stringify(device)) : '', " ")
      });

      if (device && device.kind !== DeviceKinds.AUDIO_INPUT) {
        var _error = new Error("Device ".concat(device.ID, " is not of kind AUDIO_INPUT"));

        logger.error({
          ID: device.ID,
          mediaType: 'DEVICE',
          action: 'createAudioTrack()',
          description: _error.message,
          error: _error
        });
        throw _error;
      }

      logger.info({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: DEVICE,
        action: 'createAudioTrack()',
        description: 'Creating audio track'
      });
      var deviceConfig = device ? {
        audio: {
          deviceId: {
            exact: device.ID
          }
        }
      } : {
        audio: true,
        video: false
      };
      var stream = yield navigator.mediaDevices.getUserMedia(deviceConfig);
      var track = stream.getAudioTracks()[0];

      if (track) {
        logger.debug({
          ID: device === null || device === void 0 ? void 0 : device.ID,
          mediaType: DEVICE,
          action: 'createAudioTrack()',
          description: "Received audio track ".concat(JSON.stringify(track))
        });
        return new Track(track);
      }

      var error = new Error("Device could not obtain an audio track of kind ".concat(device === null || device === void 0 ? void 0 : device.kind));
      logger.error({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: 'DEVICE',
        action: 'createAudioTrack()',
        description: error.message,
        error
      });
      throw error;
    });
    return _createAudioTrack.apply(this, arguments);
  }

  function createVideoTrack(_x2) {
    return _createVideoTrack.apply(this, arguments);
  }

  function _createVideoTrack() {
    _createVideoTrack = _asyncToGenerator__default["default"](function* (device) {
      logger.debug({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: DEVICE,
        action: 'createVideoTrack()',
        description: "Called ".concat(device ? "with ".concat(JSON.stringify(device)) : '', " ")
      });

      if (device && device.kind !== DeviceKinds.VIDEO_INPUT) {
        var _error2 = new Error("Device ".concat(device.ID, " is not of kind VIDEO_INPUT"));

        logger.error({
          ID: device.ID,
          mediaType: 'DEVICE',
          action: 'createVideoTrack()',
          description: _error2.message,
          error: _error2
        });
        throw _error2;
      }

      logger.info({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: DEVICE,
        action: 'createVideoTrack()',
        description: 'Creating video track'
      });
      var deviceConfig = device ? {
        video: {
          deviceId: {
            exact: device.ID
          }
        }
      } : {
        audio: false,
        video: true
      };
      var stream = yield navigator.mediaDevices.getUserMedia(deviceConfig);
      var track = stream.getVideoTracks()[0];

      if (track) {
        logger.debug({
          ID: device === null || device === void 0 ? void 0 : device.ID,
          mediaType: DEVICE,
          action: 'createVideoTrack()',
          description: "Received video track ".concat(JSON.stringify(track))
        });
        return new Track(track);
      }

      var error = new Error("Device could not obtain a video track of kind ".concat(device === null || device === void 0 ? void 0 : device.kind));
      logger.error({
        ID: device === null || device === void 0 ? void 0 : device.ID,
        mediaType: 'DEVICE',
        action: 'createVideoTrack()',
        description: error.message,
        error
      });
      throw error;
    });
    return _createVideoTrack.apply(this, arguments);
  }

  function createContentTrack(_x3) {
    return _createContentTrack.apply(this, arguments);
  }

  function _createContentTrack() {
    _createContentTrack = _asyncToGenerator__default["default"](function* (mediaConstraints) {
      var _mediaConstraints$dev, _mediaConstraints$dev2, _mediaConstraints$dev7;

      logger.debug({
        ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev = mediaConstraints.deviceId) === null || _mediaConstraints$dev === void 0 ? void 0 : _mediaConstraints$dev.toString(),
        mediaType: DEVICE,
        action: 'createContentTrack()',
        description: "Called ".concat(mediaConstraints ? "with ".concat(JSON.stringify(mediaConstraints)) : '', " ")
      });
      logger.info({
        ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev2 = mediaConstraints.deviceId) === null || _mediaConstraints$dev2 === void 0 ? void 0 : _mediaConstraints$dev2.toString(),
        mediaType: MEDIA,
        action: 'createContentTrack()',
        description: 'Creating content track'
      });
      var deviceConfig = {
        audio: false,
        video: true
      };
      var track;
      var stream;

      try {
        stream = yield navigator.mediaDevices.getDisplayMedia(deviceConfig);
        [track] = stream.getVideoTracks();
      } catch (error) {
        if (error instanceof Error) {
          var _mediaConstraints$dev3;

          logger.error({
            ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev3 = mediaConstraints.deviceId) === null || _mediaConstraints$dev3 === void 0 ? void 0 : _mediaConstraints$dev3.toString(),
            mediaType: 'DEVICE',
            action: 'createContentTrack()',
            description: error.message,
            error
          });
        }

        throw error;
      }

      if (mediaConstraints) {
        var unsupportedConstraints = getUnsupportedConstraints(mediaConstraints);

        if (unsupportedConstraints.length <= 0) {
          var _mediaConstraints$dev4;

          track.applyConstraints(mediaConstraints);
          logger.debug({
            ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev4 = mediaConstraints.deviceId) === null || _mediaConstraints$dev4 === void 0 ? void 0 : _mediaConstraints$dev4.toString(),
            mediaType: DEVICE,
            action: 'createContentTrack()',
            description: 'Applied media constraints to fetched content track'
          });
        } else {
          var _mediaConstraints$dev5;

          var _error3 = new Error("".concat(unsupportedConstraints.join(', '), " constraint is not supported by browser"));

          logger.error({
            ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev5 = mediaConstraints.deviceId) === null || _mediaConstraints$dev5 === void 0 ? void 0 : _mediaConstraints$dev5.toString(),
            mediaType: 'DEVICE',
            action: 'createContentTrack()',
            description: _error3.message,
            error: _error3
          });
          throw _error3;
        }
      }

      if (track) {
        var _mediaConstraints$dev6;

        logger.debug({
          ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev6 = mediaConstraints.deviceId) === null || _mediaConstraints$dev6 === void 0 ? void 0 : _mediaConstraints$dev6.toString(),
          mediaType: DEVICE,
          action: 'createContentTrack()',
          description: "Received content track ".concat(JSON.stringify(track))
        });
        return new Track(track);
      }

      var error = new Error('Could not obtain a content track');
      logger.error({
        ID: mediaConstraints === null || mediaConstraints === void 0 ? void 0 : (_mediaConstraints$dev7 = mediaConstraints.deviceId) === null || _mediaConstraints$dev7 === void 0 ? void 0 : _mediaConstraints$dev7.toString(),
        mediaType: 'DEVICE',
        action: 'createContentTrack()',
        description: error.message,
        error
      });
      throw error;
    });
    return _createContentTrack.apply(this, arguments);
  }

  function deviceChangePublisher() {
    return _deviceChangePublisher.apply(this, arguments);
  }

  function _deviceChangePublisher() {
    _deviceChangePublisher = _asyncToGenerator__default["default"](function* () {
      var _navigator$mediaDevic2;

      logger.debug({
        mediaType: DEVICE,
        action: 'deviceChangePublisher()',
        description: 'Called'
      });

      if (!((_navigator$mediaDevic2 = navigator.mediaDevices) !== null && _navigator$mediaDevic2 !== void 0 && _navigator$mediaDevic2.enumerateDevices)) {
        console.warn('navigator.mediaDevices.enumerateDevices() is not supported.');
        return;
      }

      logger.info({
        mediaType: DEVICE,
        action: 'deviceChangePublisher()',
        description: 'Calling individual subscription listener obtained by device change event'
      });
      var newDeviceList = yield navigator.mediaDevices.enumerateDevices();
      var filtered = [];
      var getGroupIdsFrom = [];
      var filterDevicesFrom = [];
      var action = 'changed';
      var deviceListGroups = new Set();

      if (newDeviceList.length !== deviceList.length) {
        [getGroupIdsFrom, filterDevicesFrom, action] = newDeviceList.length < deviceList.length ? [newDeviceList, deviceList, 'removed'] : [deviceList, newDeviceList, 'added'];
        getGroupIdsFrom.forEach(device => {
          deviceListGroups.add(device.groupId);
        });
        filtered = filterDevicesFrom.filter(device => !deviceListGroups.has(device.groupId));
        deviceList.splice(0, deviceList.length);
        deviceList.push(...newDeviceList);
        eventEmitter.emit('device:changed', {
          action,
          devices: filtered
        });
      }
    });
    return _deviceChangePublisher.apply(this, arguments);
  }

  function on(_x4, _x5) {
    return _on.apply(this, arguments);
  }

  function _on() {
    _on = _asyncToGenerator__default["default"](function* (eventName, listener) {
      logger.debug({
        mediaType: MEDIA,
        action: 'on()',
        description: "Subscribing to an ".concat(eventName, ",").concat(listener)
      });
      eventEmitter.on(eventName, listener);

      if (eventName === 'device:changed') {
        var thisDeviceList = yield getDevices();
        deviceList.push(...thisDeviceList);
        navigator.mediaDevices.addEventListener('devicechange', deviceChangePublisher);
      }
    });
    return _on.apply(this, arguments);
  }

  var off = (eventName, listener) => {
    logger.debug({
      mediaType: MEDIA,
      action: 'off()',
      description: "Called ".concat(eventName, " with ").concat(listener, " listener")
    });
    eventEmitter.off(eventName, listener);
  };

  class EventEmitter extends EventEmitter$1 {}

  var defaultLogger = {
    info: function info() {
      return console.info(...arguments);
    },
    log: function log() {
      return console.log(...arguments);
    },
    error: function error() {
      return console.error(...arguments);
    },
    warn: function warn() {
      return console.warn(...arguments);
    },
    trace: function trace() {
      return console.trace(...arguments);
    },
    debug: function debug() {
      return console.debug(...arguments);
    }
  };
  var currentLogger = defaultLogger;
  var setLogger = newLogger => {
    if (newLogger) {
      currentLogger = newLogger;
    } else {
      currentLogger = defaultLogger;
    }
  };
  var getLogger = () => currentLogger;
  var getErrorDescription = error => {
    return error ? error.stack ? "".concat(error.message, ": ").concat(error.stack) : "".concat(error) : '';
  };

  var NUM = '\\d+';
  var TOKEN = '\\S+';
  var SP = '\\s';
  var REST = '.+';

  class Line {}

  var _a$5;

  class BandwidthLine extends Line {
    constructor(bandwidthType, bandwidth) {
      super();
      this.bandwidthType = bandwidthType;
      this.bandwidth = bandwidth;
    }

    static fromSdpLine(line) {
      if (!BandwidthLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(BandwidthLine.regex);
      var bandwidthType = tokens[1];
      var bandwidth = parseInt(tokens[2], 10);
      return new BandwidthLine(bandwidthType, bandwidth);
    }

    toSdpLine() {
      return "b=".concat(this.bandwidthType, ":").concat(this.bandwidth);
    }

  }

  _a$5 = BandwidthLine;
  BandwidthLine.BW_TYPE_REGEX = 'CT|AS|TIAS';
  BandwidthLine.regex = new RegExp("^(".concat(_a$5.BW_TYPE_REGEX, "):(").concat(NUM, ")"));

  class BundleGroupLine extends Line {
    constructor(mids) {
      super();
      this.mids = mids;
    }

    static fromSdpLine(line) {
      if (!BundleGroupLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(BundleGroupLine.regex);
      var mids = tokens[1].split(' ');
      return new BundleGroupLine(mids);
    }

    toSdpLine() {
      return "a=group:BUNDLE ".concat(this.mids.join(' '));
    }

  }

  BundleGroupLine.regex = new RegExp("^group:BUNDLE (".concat(REST, ")"));

  var _a$4;

  class CandidateLine extends Line {
    constructor(foundation, componentId, transport, priority, connectionAddress, port, candidateType, relAddr, relPort, candidateExtensions) {
      super();
      this.foundation = foundation;
      this.componentId = componentId;
      this.transport = transport;
      this.priority = priority;
      this.connectionAddress = connectionAddress;
      this.port = port;
      this.candidateType = candidateType;
      this.relAddr = relAddr;
      this.relPort = relPort;
      this.candidateExtensions = candidateExtensions;
    }

    static fromSdpLine(line) {
      if (!CandidateLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(CandidateLine.regex);
      var foundation = tokens[1];
      var componentId = parseInt(tokens[2], 10);
      var transport = tokens[3];
      var priority = parseInt(tokens[4], 10);
      var connectionAddress = tokens[5];
      var port = parseInt(tokens[6], 10);
      var candidateType = tokens[7];
      var relAddr = tokens[8];
      var relPort = tokens[9] ? parseInt(tokens[9], 10) : undefined;
      var candidateExtensions = tokens[10];
      return new CandidateLine(foundation, componentId, transport, priority, connectionAddress, port, candidateType, relAddr, relPort, candidateExtensions);
    }

    toSdpLine() {
      var str = '';
      str += "a=candidate:".concat(this.foundation, " ").concat(this.componentId, " ").concat(this.transport, " ").concat(this.priority, " ").concat(this.connectionAddress, " ").concat(this.port, " typ ").concat(this.candidateType);

      if (this.relAddr) {
        str += " raddr ".concat(this.relAddr);
      }

      if (this.relPort) {
        str += " rport ".concat(this.relPort);
      }

      if (this.candidateExtensions) {
        str += " ".concat(this.candidateExtensions);
      }

      return str;
    }

  }

  _a$4 = CandidateLine;
  CandidateLine.ICE_CHARS = "[a-zA-Z0-9+/]+";
  CandidateLine.regex = new RegExp("^candidate:(".concat(_a$4.ICE_CHARS, ") (").concat(NUM, ") (").concat(TOKEN, ") (").concat(NUM, ") (").concat(TOKEN, ") (").concat(NUM, ") typ (").concat(TOKEN, ")(?: raddr (").concat(TOKEN, "))?(?: rport (").concat(NUM, "))?(?: (").concat(REST, "))?"));

  class ConnectionLine extends Line {
    constructor(netType, addrType, ipAddr) {
      super();
      this.netType = netType;
      this.addrType = addrType;
      this.ipAddr = ipAddr;
    }

    static fromSdpLine(line) {
      if (!ConnectionLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(ConnectionLine.regex);
      var netType = tokens[1];
      var addrType = tokens[2];
      var ipAddr = tokens[3];
      return new ConnectionLine(netType, addrType, ipAddr);
    }

    toSdpLine() {
      return "c=".concat(this.netType, " ").concat(this.addrType, " ").concat(this.ipAddr);
    }

  }

  ConnectionLine.regex = new RegExp("^(".concat(TOKEN, ") (").concat(TOKEN, ") (").concat(TOKEN, ")"));

  class ContentLine extends Line {
    constructor(values) {
      super();
      this.values = values;
    }

    static fromSdpLine(line) {
      if (!ContentLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(ContentLine.regex);
      var values = tokens[1].split(',');
      return new ContentLine(values);
    }

    toSdpLine() {
      return "a=content:".concat(this.values.join(','));
    }

  }

  ContentLine.regex = new RegExp("^content:(".concat(REST, ")$"));

  class DirectionLine extends Line {
    constructor(direction) {
      super();
      this.direction = direction;
    }

    static fromSdpLine(line) {
      if (!DirectionLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(DirectionLine.regex);
      var direction = tokens[1];
      return new DirectionLine(direction);
    }

    toSdpLine() {
      return "a=".concat(this.direction);
    }

  }

  DirectionLine.regex = /^(sendrecv|sendonly|recvonly|inactive)$/;

  var _a$3;

  class ExtMapLine extends Line {
    constructor(id, uri, direction, extensionAttributes) {
      super();
      this.id = id;
      this.uri = uri;
      this.direction = direction;
      this.extensionAttributes = extensionAttributes;
    }

    static fromSdpLine(line) {
      if (!ExtMapLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(ExtMapLine.regex);
      var id = parseInt(tokens[1], 10);
      var direction = tokens[2];
      var uri = tokens[3];
      var extensionAttributes = tokens[4];
      return new ExtMapLine(id, uri, direction, extensionAttributes);
    }

    toSdpLine() {
      var str = '';
      str += "a=extmap:".concat(this.id);

      if (this.direction) {
        str += "/".concat(this.direction);
      }

      str += " ".concat(this.uri);

      if (this.extensionAttributes) {
        str += " ".concat(this.extensionAttributes);
      }

      return str;
    }

  }

  _a$3 = ExtMapLine;
  ExtMapLine.EXTMAP_DIRECTION = "sendonly|recvonly|sendrecv|inactive";
  ExtMapLine.regex = new RegExp("^extmap:(".concat(NUM, ")(?:/(").concat(_a$3.EXTMAP_DIRECTION, "))? (").concat(TOKEN, ")(?: (").concat(REST, "))?"));

  class FingerprintLine extends Line {
    constructor(fingerprint) {
      super();
      this.fingerprint = fingerprint;
    }

    static fromSdpLine(line) {
      if (!FingerprintLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(FingerprintLine.regex);
      var fingerprint = tokens[1];
      return new FingerprintLine(fingerprint);
    }

    toSdpLine() {
      return "a=fingerprint:".concat(this.fingerprint);
    }

  }

  FingerprintLine.regex = new RegExp("^fingerprint:(".concat(REST, ")"));

  class FmtpLine extends Line {
    constructor(payloadType, params) {
      super();
      this.payloadType = payloadType;
      this.params = params;
    }

    static fromSdpLine(line) {
      if (!FmtpLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(FmtpLine.regex);
      var payloadType = parseInt(tokens[1], 10);
      var params = tokens[2];
      return new FmtpLine(payloadType, params);
    }

    toSdpLine() {
      return "a=fmtp:".concat(this.payloadType, " ").concat(this.params);
    }

  }

  FmtpLine.regex = new RegExp("^fmtp:(".concat(NUM, ") (").concat(REST, ")"));

  class IceOptionsLine extends Line {
    constructor(options) {
      super();
      this.options = options;
    }

    static fromSdpLine(line) {
      if (!IceOptionsLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(IceOptionsLine.regex);
      var options = tokens[1].split(' ');
      return new IceOptionsLine(options);
    }

    toSdpLine() {
      return "a=ice-options:".concat(this.options.join(' '));
    }

  }

  IceOptionsLine.regex = new RegExp("^ice-options:(".concat(REST, ")$"));

  class IcePwdLine extends Line {
    constructor(pwd) {
      super();
      this.pwd = pwd;
    }

    static fromSdpLine(line) {
      if (!IcePwdLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(IcePwdLine.regex);
      var pwd = tokens[1];
      return new IcePwdLine(pwd);
    }

    toSdpLine() {
      return "a=ice-pwd:".concat(this.pwd);
    }

  }

  IcePwdLine.regex = new RegExp("^ice-pwd:(".concat(TOKEN, ")$"));

  class IceUfragLine extends Line {
    constructor(ufrag) {
      super();
      this.ufrag = ufrag;
    }

    static fromSdpLine(line) {
      if (!IceUfragLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(IceUfragLine.regex);
      var ufrag = tokens[1];
      return new IceUfragLine(ufrag);
    }

    toSdpLine() {
      return "a=ice-ufrag:".concat(this.ufrag);
    }

  }

  IceUfragLine.regex = new RegExp("^ice-ufrag:(".concat(TOKEN, ")$"));

  class MaxMessageSizeLine extends Line {
    constructor(maxMessageSize) {
      super();
      this.maxMessageSize = maxMessageSize;
    }

    static fromSdpLine(line) {
      if (!MaxMessageSizeLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(MaxMessageSizeLine.regex);
      var maxMessageSize = parseInt(tokens[1], 10);
      return new MaxMessageSizeLine(maxMessageSize);
    }

    toSdpLine() {
      return "a=max-message-size:".concat(this.maxMessageSize);
    }

  }

  MaxMessageSizeLine.regex = new RegExp("^max-message-size:(".concat(NUM, ")"));

  var _a$2;

  class MediaLine extends Line {
    constructor(type, port, protocol, formats) {
      super();
      this.type = type;
      this.port = port;
      this.protocol = protocol;
      this.formats = formats;
    }

    static fromSdpLine(line) {
      if (!MediaLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(MediaLine.regex);
      var type = tokens[1];
      var port = parseInt(tokens[2], 10);
      var protocol = tokens[3];
      var formats = tokens[4].split(' ');
      return new MediaLine(type, port, protocol, formats);
    }

    toSdpLine() {
      return "m=".concat(this.type, " ").concat(this.port, " ").concat(this.protocol, " ").concat(this.formats.join(' '));
    }

  }

  _a$2 = MediaLine;
  MediaLine.MEDIA_TYPE = 'audio|video|application';
  MediaLine.regex = new RegExp("^(".concat(_a$2.MEDIA_TYPE, ") (").concat(NUM, ") (").concat(TOKEN, ") (").concat(REST, ")"));

  class MidLine extends Line {
    constructor(mid) {
      super();
      this.mid = mid;
    }

    static fromSdpLine(line) {
      if (!MidLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(MidLine.regex);
      var mid = tokens[1];
      return new MidLine(mid);
    }

    toSdpLine() {
      return "a=mid:".concat(this.mid);
    }

  }

  MidLine.regex = new RegExp("^mid:(".concat(TOKEN, ")$"));

  class OriginLine extends Line {
    constructor(username, sessionId, sessionVersion, netType, addrType, ipAddr) {
      super();
      this.username = username;
      this.sessionId = sessionId;
      this.sessionVersion = sessionVersion;
      this.netType = netType;
      this.addrType = addrType;
      this.ipAddr = ipAddr;
    }

    static fromSdpLine(line) {
      if (!OriginLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(OriginLine.regex);
      var username = tokens[1];
      var sessionId = tokens[2];
      var sessionVersion = parseInt(tokens[3], 10);
      var netType = tokens[4];
      var addrType = tokens[5];
      var ipAddr = tokens[6];
      return new OriginLine(username, sessionId, sessionVersion, netType, addrType, ipAddr);
    }

    toSdpLine() {
      return "o=".concat(this.username, " ").concat(this.sessionId, " ").concat(this.sessionVersion, " ").concat(this.netType, " ").concat(this.addrType, " ").concat(this.ipAddr);
    }

  }

  OriginLine.regex = new RegExp("^(".concat(TOKEN, ") (").concat(TOKEN, ") (").concat(NUM, ") (").concat(TOKEN, ") (").concat(TOKEN, ") (").concat(TOKEN, ")"));

  var _a$1;

  class RidLine extends Line {
    constructor(id, direction, params) {
      super();
      this.id = id;
      this.direction = direction;
      this.params = params;
    }

    static fromSdpLine(line) {
      if (!RidLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(RidLine.regex);
      var id = tokens[1];
      var direction = tokens[2];
      var params = tokens[3];
      return new RidLine(id, direction, params);
    }

    toSdpLine() {
      var str = '';
      str += "a=rid:".concat(this.id, " ").concat(this.direction);

      if (this.params) {
        str += " ".concat(this.params);
      }

      return str;
    }

  }

  _a$1 = RidLine;
  RidLine.RID_ID = "[\\w-]+";
  RidLine.RID_DIRECTION = "\\bsend\\b|\\brecv\\b";
  RidLine.regex = new RegExp("^rid:(".concat(_a$1.RID_ID, ") (").concat(_a$1.RID_DIRECTION, ")(?:").concat(SP, "(").concat(REST, "))?"));

  class RtcpMuxLine extends Line {
    static fromSdpLine(line) {
      if (!RtcpMuxLine.regex.test(line)) {
        return undefined;
      }

      return new RtcpMuxLine();
    }

    toSdpLine() {
      return "a=rtcp-mux";
    }

  }

  RtcpMuxLine.regex = /^rtcp-mux$/;

  class RtcpFbLine extends Line {
    constructor(payloadType, feedback) {
      super();
      this.payloadType = payloadType;
      this.feedback = feedback;
    }

    static fromSdpLine(line) {
      if (!RtcpFbLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(RtcpFbLine.regex);
      var payloadType = parseInt(tokens[1], 10);
      var feedback = tokens[2];
      return new RtcpFbLine(payloadType, feedback);
    }

    toSdpLine() {
      return "a=rtcp-fb:".concat(this.payloadType, " ").concat(this.feedback);
    }

  }

  RtcpFbLine.regex = new RegExp("^rtcp-fb:(".concat(NUM, ") (").concat(REST, ")"));

  var _a$6;

  class RtpMapLine extends Line {
    constructor(payloadType, encodingName, clockRate, encodingParams) {
      super();
      this.payloadType = payloadType;
      this.encodingName = encodingName;
      this.clockRate = clockRate;
      this.encodingParams = encodingParams;
    }

    static fromSdpLine(line) {
      if (!RtpMapLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(RtpMapLine.regex);
      var payloadType = parseInt(tokens[1], 10);
      var encodingName = tokens[2];
      var clockRate = parseInt(tokens[3], 10);
      var encodingParams = tokens[4];
      return new RtpMapLine(payloadType, encodingName, clockRate, encodingParams);
    }

    toSdpLine() {
      var str = '';
      str += "a=rtpmap:".concat(this.payloadType, " ").concat(this.encodingName, "/").concat(this.clockRate);

      if (this.encodingParams) {
        str += "/".concat(this.encodingParams);
      }

      return str;
    }

  }

  _a$6 = RtpMapLine;
  RtpMapLine.NON_SLASH_TOKEN = '[^\\s/]+';
  RtpMapLine.regex = new RegExp("^rtpmap:(".concat(NUM, ") (").concat(_a$6.NON_SLASH_TOKEN, ")/(").concat(_a$6.NON_SLASH_TOKEN, ")(?:/(").concat(_a$6.NON_SLASH_TOKEN, "))?"));

  class SctpPortLine extends Line {
    constructor(port) {
      super();
      this.port = port;
    }

    static fromSdpLine(line) {
      if (!SctpPortLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(SctpPortLine.regex);
      var port = parseInt(tokens[1], 10);
      return new SctpPortLine(port);
    }

    toSdpLine() {
      return "a=sctp-port:".concat(this.port);
    }

  }

  SctpPortLine.regex = new RegExp("^sctp-port:(".concat(NUM, ")"));

  class SessionInformationLine extends Line {
    constructor(info) {
      super();
      this.info = info;
    }

    static fromSdpLine(line) {
      if (!SessionInformationLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(SessionInformationLine.regex);
      var info = tokens[1];
      return new SessionInformationLine(info);
    }

    toSdpLine() {
      return "i=".concat(this.info);
    }

  }

  SessionInformationLine.regex = new RegExp("(".concat(REST, ")"));

  class SessionNameLine extends Line {
    constructor(name) {
      super();
      this.name = name;
    }

    static fromSdpLine(line) {
      if (!SessionNameLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(SessionNameLine.regex);
      var name = tokens[1];
      return new SessionNameLine(name);
    }

    toSdpLine() {
      return "s=".concat(this.name);
    }

  }

  SessionNameLine.regex = new RegExp("^(".concat(REST, ")"));

  class SetupLine extends Line {
    constructor(setup) {
      super();
      this.setup = setup;
    }

    static fromSdpLine(line) {
      if (!SetupLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(SetupLine.regex);
      var setup = tokens[1];
      return new SetupLine(setup);
    }

    toSdpLine() {
      return "a=setup:".concat(this.setup);
    }

  }

  SetupLine.regex = /^setup:(actpass|active|passive)$/;

  class SimulcastLayer {
    constructor(id, paused) {
      this.id = id;
      this.paused = paused;
    }

    toString() {
      return this.paused ? "~".concat(this.id) : this.id;
    }

  }

  class SimulcastLayerList {
    constructor() {
      this.layers = [];
    }

    addLayer(layer) {
      this.layers.push([layer]);
    }

    addLayerWithAlternatives(alternatives) {
      this.layers.push(alternatives);
    }

    get length() {
      return this.layers.length;
    }

    get(index) {
      return this.layers[index];
    }

    static fromString(str) {
      var layerList = new SimulcastLayerList();
      var tokens = str.split(';');

      if (tokens.length === 1 && !tokens[0].trim()) {
        throw new Error('simulcast stream list empty');
      }

      tokens.forEach(token => {
        if (!token) {
          throw new Error('simulcast layer list empty');
        }

        var ridTokens = token.split(',');
        var layers = [];
        ridTokens.forEach(ridToken => {
          if (!ridToken || ridToken === '~') {
            throw new Error('rid empty');
          }

          var paused = ridToken[0] === '~';
          var rid = paused ? ridToken.substring(1) : ridToken;
          layers.push(new SimulcastLayer(rid, paused));
        });
        layerList.addLayerWithAlternatives(layers);
      });
      return layerList;
    }

    toString() {
      return this.layers.map(altArray => altArray.map(v => v.toString()).join(',')).join(';');
    }

  }

  class SimulcastLine extends Line {
    constructor(sendLayers, recvLayers) {
      super();
      this.sendLayers = sendLayers;
      this.recvLayers = recvLayers;
    }

    static fromSdpLine(line) {
      if (!SimulcastLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(SimulcastLine.regex);
      var bidirectional = tokens[3] && tokens[4];
      var firstDirection = tokens[1];
      var layerList1 = SimulcastLayerList.fromString(tokens[2]);
      var layerList2 = new SimulcastLayerList();

      if (bidirectional) {
        var secondDirection = tokens[3];

        if (firstDirection === secondDirection) {
          return undefined;
        }

        layerList2 = SimulcastLayerList.fromString(tokens[4]);
      }

      var sendLayerList;
      var recvLayerList;

      if (firstDirection === 'send') {
        sendLayerList = layerList1;
        recvLayerList = layerList2;
      } else {
        sendLayerList = layerList2;
        recvLayerList = layerList1;
      }

      return new SimulcastLine(sendLayerList, recvLayerList);
    }

    toSdpLine() {
      var str = 'a=simulcast:';

      if (this.sendLayers.length) {
        str += "send ".concat(this.sendLayers.toString());

        if (this.recvLayers.length) {
          str += " ";
        }
      }

      if (this.recvLayers.length) {
        str += "recv ".concat(this.recvLayers.toString());
      }

      return str;
    }

  }

  SimulcastLine.regex = new RegExp("^simulcast:(send|recv) (".concat(TOKEN, ")(?: (send|recv) (").concat(TOKEN, "))?"));

  class TimingLine extends Line {
    constructor(startTime, stopTime) {
      super();
      this.startTime = startTime;
      this.stopTime = stopTime;
    }

    static fromSdpLine(line) {
      if (!TimingLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(TimingLine.regex);
      var startTime = parseInt(tokens[1], 10);
      var stopTime = parseInt(tokens[2], 10);
      return new TimingLine(startTime, stopTime);
    }

    toSdpLine() {
      return "t=".concat(this.startTime, " ").concat(this.stopTime);
    }

  }

  TimingLine.regex = new RegExp("^(".concat(NUM, ") (").concat(NUM, ")"));

  class VersionLine extends Line {
    constructor(version) {
      super();
      this.version = version;
    }

    static fromSdpLine(line) {
      if (!VersionLine.regex.test(line)) {
        return undefined;
      }

      var tokens = line.match(VersionLine.regex);
      var version = parseInt(tokens[1], 10);
      return new VersionLine(version);
    }

    toSdpLine() {
      return "v=".concat(this.version);
    }

  }

  VersionLine.regex = new RegExp("^(".concat(NUM, ")$"));

  class UnknownLine extends Line {
    constructor(value) {
      super();
      this.value = value;
    }

    static fromSdpLine(line) {
      var tokens = line.match(UnknownLine.regex);
      var value = tokens[1];
      return new UnknownLine(value);
    }

    toSdpLine() {
      return "".concat(this.value);
    }

  }

  UnknownLine.regex = new RegExp("(".concat(REST, ")"));

  class IceInfo {
    constructor() {
      this.candidates = [];
    }

    addLine(line) {
      if (line instanceof IceUfragLine) {
        this.ufrag = line;
        return true;
      }

      if (line instanceof IcePwdLine) {
        this.pwd = line;
        return true;
      }

      if (line instanceof IceOptionsLine) {
        this.options = line;
        return true;
      }

      if (line instanceof CandidateLine) {
        this.candidates.push(line);
        return true;
      }

      return false;
    }

    toLines() {
      var lines = [];

      if (this.ufrag) {
        lines.push(this.ufrag);
      }

      if (this.pwd) {
        lines.push(this.pwd);
      }

      if (this.options) {
        lines.push(this.options);
      }

      this.candidates.forEach(candidate => lines.push(candidate));
      return lines;
    }

  }

  class MediaDescription {
    constructor(type, port, protocol) {
      this.iceInfo = new IceInfo();
      this.otherLines = [];
      this.type = type;
      this.port = port;
      this.protocol = protocol;
    }

    findOtherLine(ty) {
      return this.otherLines.find(line => line instanceof ty);
    }

    addLine(line) {
      if (line instanceof BundleGroupLine) {
        throw new Error("Error: bundle group line not allowed in media description");
      }

      if (line instanceof BandwidthLine) {
        this.bandwidth = line;
        return true;
      }

      if (line instanceof MidLine) {
        this.mid = line.mid;
        return true;
      }

      if (line instanceof FingerprintLine) {
        this.fingerprint = line.fingerprint;
        return true;
      }

      if (line instanceof SetupLine) {
        this.setup = line.setup;
        return true;
      }

      if (line instanceof ConnectionLine) {
        this.connection = line;
        return true;
      }

      if (line instanceof ContentLine) {
        this.content = line;
        return true;
      }

      return this.iceInfo.addLine(line);
    }

  }

  class ApplicationMediaDescription extends MediaDescription {
    constructor(mediaLine) {
      super(mediaLine.type, mediaLine.port, mediaLine.protocol);
      this.fmts = [];
      this.fmts = mediaLine.formats;
    }

    toLines() {
      var lines = [];
      lines.push(new MediaLine(this.type, this.port, this.protocol, this.fmts));

      if (this.connection) {
        lines.push(this.connection);
      }

      if (this.bandwidth) {
        lines.push(this.bandwidth);
      }

      lines.push(...this.iceInfo.toLines());

      if (this.fingerprint) {
        lines.push(new FingerprintLine(this.fingerprint));
      }

      if (this.setup) {
        lines.push(new SetupLine(this.setup));
      }

      if (this.mid) {
        lines.push(new MidLine(this.mid));
      }

      if (this.content) {
        lines.push(this.content);
      }

      if (this.sctpPort) {
        lines.push(new SctpPortLine(this.sctpPort));
      }

      if (this.maxMessageSize) {
        lines.push(new MaxMessageSizeLine(this.maxMessageSize));
      }

      lines.push(...this.otherLines);
      return lines;
    }

    addLine(line) {
      if (super.addLine(line)) {
        return true;
      }

      if (line instanceof MediaLine) {
        throw new Error('Error: tried passing a MediaLine to an existing MediaInfo');
      }

      if (line instanceof SctpPortLine) {
        this.sctpPort = line.port;
        return true;
      }

      if (line instanceof MaxMessageSizeLine) {
        this.maxMessageSize = line.maxMessageSize;
        return true;
      }

      this.otherLines.push(line);
      return true;
    }

  }

  class CodecInfo {
    constructor(pt) {
      this.fmtParams = [];
      this.feedback = [];
      this.pt = pt;
    }

    addLine(line) {
      if (line instanceof RtpMapLine) {
        this.name = line.encodingName;
        this.clockRate = line.clockRate;
        this.encodingParams = line.encodingParams;
        return true;
      }

      if (line instanceof FmtpLine) {
        this.fmtParams.push(line.params);

        if (line.params.indexOf('apt') !== -1) {
          var apt = line.params.split('=')[1];
          this.primaryCodecPt = parseInt(apt, 10);
        }

        return true;
      }

      if (line instanceof RtcpFbLine) {
        this.feedback.push(line.feedback);
        return true;
      }

      return false;
    }

    toLines() {
      var lines = [];
      lines.push(new RtpMapLine(this.pt, this.name, this.clockRate, this.encodingParams));
      this.feedback.forEach(fb => {
        lines.push(new RtcpFbLine(this.pt, fb));
      });
      this.fmtParams.forEach(fmt => {
        lines.push(new FmtpLine(this.pt, fmt));
      });
      return lines;
    }

  }

  class AvMediaDescription extends MediaDescription {
    constructor(mediaLine) {
      super(mediaLine.type, mediaLine.port, mediaLine.protocol);
      this.pts = [];
      this.extMaps = [];
      this.rids = [];
      this.codecs = new Map();
      this.rtcpMux = false;
      this.pts = mediaLine.formats.map(fmt => {
        return parseInt(fmt, 10);
      });
      this.pts.forEach(pt => this.codecs.set(pt, new CodecInfo(pt)));
    }

    toLines() {
      var lines = [];
      lines.push(new MediaLine(this.type, this.port, this.protocol, this.pts.map(pt => "".concat(pt))));

      if (this.connection) {
        lines.push(this.connection);
      }

      if (this.bandwidth) {
        lines.push(this.bandwidth);
      }

      lines.push(...this.iceInfo.toLines());

      if (this.fingerprint) {
        lines.push(new FingerprintLine(this.fingerprint));
      }

      if (this.setup) {
        lines.push(new SetupLine(this.setup));
      }

      if (this.mid) {
        lines.push(new MidLine(this.mid));
      }

      if (this.rtcpMux) {
        lines.push(new RtcpMuxLine());
      }

      if (this.content) {
        lines.push(this.content);
      }

      this.extMaps.forEach(extMap => lines.push(extMap));
      this.rids.forEach(rid => lines.push(rid));

      if (this.simulcast) {
        lines.push(this.simulcast);
      }

      if (this.direction) {
        lines.push(new DirectionLine(this.direction));
      }

      this.codecs.forEach(codec => lines.push(...codec.toLines()));
      lines.push(...this.otherLines);
      return lines;
    }

    addLine(line) {
      if (super.addLine(line)) {
        return true;
      }

      if (line instanceof MediaLine) {
        throw new Error('Error: tried passing a MediaLine to an existing MediaInfo');
      }

      if (line instanceof DirectionLine) {
        this.direction = line.direction;
        return true;
      }

      if (line instanceof ExtMapLine) {
        this.extMaps.push(line);
        return true;
      }

      if (line instanceof RidLine) {
        this.rids.push(line);
        return true;
      }

      if (line instanceof RtcpMuxLine) {
        this.rtcpMux = true;
        return true;
      }

      if (line instanceof SimulcastLine) {
        this.simulcast = line;
        return true;
      }

      if (line instanceof RtpMapLine || line instanceof FmtpLine || line instanceof RtcpFbLine) {
        var codec = this.codecs.get(line.payloadType);

        if (!codec) {
          throw new Error("Error: got line for unknown codec: ".concat(line.toSdpLine()));
        }

        codec.addLine(line);
        return true;
      }

      this.otherLines.push(line);
      return true;
    }

    getCodecByPt(pt) {
      return this.codecs.get(pt);
    }

    removePt(pt) {
      var associatedPts = [...this.codecs.values()].filter(ci => ci.primaryCodecPt === pt).map(ci => ci.pt);
      var allPtsToRemove = [pt, ...associatedPts];
      allPtsToRemove.forEach(ptToRemove => {
        this.codecs.delete(ptToRemove);
      });
      this.pts = this.pts.filter(existingPt => allPtsToRemove.indexOf(existingPt) === -1);
    }

  }

  class SessionDescription {
    constructor() {
      this.groups = [];
      this.otherLines = [];
    }

    addLine(line) {
      if (line instanceof VersionLine) {
        this.version = line;
        return true;
      }

      if (line instanceof OriginLine) {
        this.origin = line;
        return true;
      }

      if (line instanceof SessionNameLine) {
        this.sessionName = line;
        return true;
      }

      if (line instanceof SessionInformationLine) {
        this.information = line;
        return true;
      }

      if (line instanceof TimingLine) {
        this.timing = line;
        return true;
      }

      if (line instanceof ConnectionLine) {
        this.connection = line;
        return true;
      }

      if (line instanceof BandwidthLine) {
        this.bandwidth = line;
        return true;
      }

      if (line instanceof BundleGroupLine) {
        this.groups.push(line);
        return true;
      }

      this.otherLines.push(line);
      return true;
    }

    toLines() {
      var lines = [];

      if (this.version) {
        lines.push(this.version);
      }

      if (this.origin) {
        lines.push(this.origin);
      }

      if (this.sessionName) {
        lines.push(this.sessionName);
      }

      if (this.information) {
        lines.push(this.information);
      }

      if (this.connection) {
        lines.push(this.connection);
      }

      if (this.bandwidth) {
        lines.push(this.bandwidth);
      }

      if (this.timing) {
        lines.push(this.timing);
      }

      if (this.groups) {
        lines.push(...this.groups);
      }

      lines.push(...this.otherLines);
      return lines;
    }

  }

  class Sdp {
    constructor() {
      this.session = new SessionDescription();
      this.media = [];
    }

    get avMedia() {
      return this.media.filter(mi => mi instanceof AvMediaDescription);
    }

    toString() {
      var lines = [];
      lines.push(...this.session.toLines());
      this.media.forEach(m => lines.push(...m.toLines()));
      return "".concat(lines.map(l => l.toSdpLine()).join('\r\n'), "\r\n");
    }

  }

  class Grammar {
    constructor() {
      this.parsers = new Map();
    }

    addParser(lineType, parser) {
      var parsers = this.parsers.get(lineType) || [];
      parsers.push(parser);
      this.parsers.set(lineType, parsers);
    }

    getParsers(lineType) {
      return this.parsers.get(lineType) || [];
    }

  }

  class SdpGrammar extends Grammar {
    constructor() {
      super();
      this.addParser('v', VersionLine.fromSdpLine);
      this.addParser('o', OriginLine.fromSdpLine);
      this.addParser('c', ConnectionLine.fromSdpLine);
      this.addParser('i', SessionInformationLine.fromSdpLine);
      this.addParser('m', MediaLine.fromSdpLine);
      this.addParser('s', SessionNameLine.fromSdpLine);
      this.addParser('t', TimingLine.fromSdpLine);
      this.addParser('b', BandwidthLine.fromSdpLine);
      this.addParser('a', RtpMapLine.fromSdpLine);
      this.addParser('a', RtcpFbLine.fromSdpLine);
      this.addParser('a', FmtpLine.fromSdpLine);
      this.addParser('a', DirectionLine.fromSdpLine);
      this.addParser('a', ExtMapLine.fromSdpLine);
      this.addParser('a', MidLine.fromSdpLine);
      this.addParser('a', IceUfragLine.fromSdpLine);
      this.addParser('a', IcePwdLine.fromSdpLine);
      this.addParser('a', IceOptionsLine.fromSdpLine);
      this.addParser('a', FingerprintLine.fromSdpLine);
      this.addParser('a', SetupLine.fromSdpLine);
      this.addParser('a', SctpPortLine.fromSdpLine);
      this.addParser('a', MaxMessageSizeLine.fromSdpLine);
      this.addParser('a', RtcpMuxLine.fromSdpLine);
      this.addParser('a', BundleGroupLine.fromSdpLine);
      this.addParser('a', ContentLine.fromSdpLine);
      this.addParser('a', RidLine.fromSdpLine);
      this.addParser('a', CandidateLine.fromSdpLine);
      this.addParser('a', SimulcastLine.fromSdpLine);
    }

  }

  var DefaultSdpGrammar = new SdpGrammar();

  function isValidLine(line) {
    return line.length > 2;
  }

  function parseToModel(lines) {
    var sdp = new Sdp();
    var currBlock = sdp.session;
    lines.forEach(l => {
      if (l instanceof MediaLine) {
        var mediaInfo;

        if (l.type === 'audio' || l.type === 'video') {
          mediaInfo = new AvMediaDescription(l);
        } else if (l.type === 'application') {
          mediaInfo = new ApplicationMediaDescription(l);
        } else {
          throw new Error("Unhandled media type: ".concat(l.type));
        }

        sdp.media.push(mediaInfo);
        currBlock = mediaInfo;
      } else {
        currBlock.addLine(l);
      }
    });
    return sdp;
  }

  function parseToLines(sdp, grammar) {
    var lines = [];
    sdp.split(/(\r\n|\r|\n)/).filter(isValidLine).forEach(l => {
      var lineType = l[0];
      var lineValue = l.slice(2);
      var parsers = grammar.getParsers(lineType);

      for (var parser of parsers) {
        var _result = parser(lineValue);

        if (_result) {
          lines.push(_result);
          return;
        }
      }

      var result = UnknownLine.fromSdpLine(l);
      lines.push(result);
    });
    return lines;
  }

  function parse(sdp) {
    var grammar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultSdpGrammar;
    var lines = parseToLines(sdp, grammar);
    var parsed = parseToModel(lines);
    return parsed;
  }

  function getLocalTrackInfo(kind, receive, localTrack) {
    var direction = (() => {
      var send = !!localTrack;
      if (send && receive) return 'sendrecv';
      if (send && !receive) return 'sendonly';
      if (!send && receive) return 'recvonly';
      return 'inactive';
    })();

    return {
      trackOrKind: localTrack || kind,
      direction
    };
  }

  function hasH264Codec(mediaLine) {
    for (var codec of mediaLine.codecs.values()) {
      var _codec$name;

      if (((_codec$name = codec.name) === null || _codec$name === void 0 ? void 0 : _codec$name.toUpperCase()) === 'H264') {
        return true;
      }
    }

    return false;
  }

  function isSdpInvalid(options, errorLog, sdp) {
    if (!sdp) {
      return 'iceCandidate: SDP missing';
    }

    var parsedSdp = parse(sdp);

    for (var mediaLine of parsedSdp.avMedia) {
      if (!mediaLine.iceInfo.candidates.length) {
        errorLog('isSdpInvalid', "ice candidates missing for m-line with mid=".concat(mediaLine.mid));
        return 'isSdpInvalid: ice candidates missing';
      }

      if (!options.allowPort0 && mediaLine.port === 0) {
        errorLog('isSdpInvalid', "Found invalid port number 0 at m-line with mid=".concat(mediaLine.mid));
        return 'isSdpInvalid: Found invalid port number 0';
      }

      if (!mediaLine.iceInfo.pwd || !mediaLine.iceInfo.ufrag) {
        errorLog('isSdpInvalid', "ice ufrag and password not found for m-line with mid=".concat(mediaLine.mid));
        return 'isSdpInvalid: ice ufrag and password not found';
      }

      if (options.requireH264 && mediaLine.type === 'video' && !hasH264Codec(mediaLine)) {
        errorLog('isSdpInvalid', "H264 codec is missing for video media description with mid=".concat(mediaLine.mid));
        return 'isSdpInvalid: H264 codec is missing';
      }
    }

    return '';
  }

  function convertCLineToIPv4(sdp) {
    var convertConnectionProp = connection => {
      if ((connection === null || connection === void 0 ? void 0 : connection.addrType) === 'IP6') {
        connection.addrType = 'IP4';
        connection.ipAddr = '0.0.0.0';
      }
    };

    convertConnectionProp(sdp.session.connection);
    sdp.media.forEach(media => {
      convertConnectionProp(media.connection);
    });
  }

  function convertPort9to0(sdp) {
    sdp.media.forEach(media => {
      if (media.port === 9) {
        media.port = 0;
      }
    });
  }

  function setContentSlides(sdp) {
    var videoMediaDescriptions = sdp.avMedia.filter(media => media.type === 'video');

    if (videoMediaDescriptions.length === 2) {
      videoMediaDescriptions[1].addLine(new ContentLine(['slides']));
    }
  }

  class AnyLine extends Line {
    constructor(value) {
      super();

      _defineProperty__default["default"](this, "value", void 0);

      this.value = value;
    }

    static fromSdpLine() {
      return undefined;
    }

    toSdpLine() {
      return "a=".concat(this.value);
    }

  }

  function addBandwidthLimits(sdp, limits) {
    sdp.avMedia.forEach(media => {
      if (media.type === 'audio') {
        media.addLine(new BandwidthLine('TIAS', limits.audio));
      } else if (media.type === 'video') {
        media.addLine(new BandwidthLine('TIAS', limits.video));
      }
    });
  }

  function addPeriodicKeyframes(sdp, value) {
    sdp.avMedia.forEach(media => {
      if (media.type === 'video') {
        media.addLine(new AnyLine("periodic-keyframes:".concat(value)));
      }
    });
  }

  function disableExtmap(sdp) {
    sdp.avMedia.forEach(media => {
      media.extMaps.length = 0;
    });
  }

  function appendToH264fmtpParams(sdp, paramsToAppend) {
    sdp.avMedia.forEach(media => {
      if (media.type === 'video') {
        media.codecs.forEach(codec => {
          var _codec$name2;

          if (((_codec$name2 = codec.name) === null || _codec$name2 === void 0 ? void 0 : _codec$name2.toUpperCase()) === 'H264') {
            codec.fmtParams = codec.fmtParams.map(fmtp => "".concat(fmtp, ";").concat(paramsToAppend));
          }
        });
      }
    });
  }

  function setH264MaxFs(sdp, maxFsValue) {
    appendToH264fmtpParams(sdp, "max-fs=".concat(maxFsValue));
  }

  function disableRtx(sdp) {
    sdp.avMedia.forEach(media => {
      var payloadTypesToRemove = [];
      media.codecs.forEach((codec, codecPt) => {
        if (codec.name === 'rtx' && codec.primaryCodecPt) {
          payloadTypesToRemove.push(codecPt);
        }
      });
      payloadTypesToRemove.forEach(pt => media.codecs.delete(pt));
      media.pts = media.pts.filter(pt => !payloadTypesToRemove.includes(pt));
    });
  }

  function mungeLocalSdpForBrowser(config, sdp) {
    var parsedSdp = parse(sdp);

    if (config.disableRtx) {
      disableRtx(parsedSdp);
    }

    return parsedSdp.toString();
  }
  function mungeLocalSdp(config, sdp) {
    var parsedSdp = parse(sdp);

    if (config.convertCLineToIPv4) {
      convertCLineToIPv4(parsedSdp);
    }

    if (config.bandwidthLimits) {
      addBandwidthLimits(parsedSdp, config.bandwidthLimits);
    }

    if (config.periodicKeyframes) {
      addPeriodicKeyframes(parsedSdp, config.periodicKeyframes);
    }

    if (config.convertPort9to0) {
      convertPort9to0(parsedSdp);
    }

    if (config.addContentSlides) {
      setContentSlides(parsedSdp);
    }

    if (config.disableExtmap) {
      disableExtmap(parsedSdp);
    }

    if (config.h264MaxFs) {
      setH264MaxFs(parsedSdp, config.h264MaxFs);
    }

    return parsedSdp.toString();
  }

  function setStartBitrate(sdp, startBitrate) {
    appendToH264fmtpParams(sdp, "x-google-start-bitrate=".concat(startBitrate));
  }

  function mungeRemoteSdp(config, sdp) {
    var parsedSdp = parse(sdp);

    if (config.startBitrate) {
      setStartBitrate(parsedSdp, config.startBitrate);
    }

    if (config.disableExtmap) {
      disableExtmap(parsedSdp);
    }

    return parsedSdp.toString();
  }

  var Event$1;

  (function (Event) {
    Event["CONNECTION_STATE_CHANGED"] = "connectionState:changed";
    Event["REMOTE_TRACK_ADDED"] = "remoteTrack:added";
    Event["ROAP_MESSAGE_TO_SEND"] = "roap:messageToSend";
    Event["ROAP_STARTED"] = "roap:started";
    Event["ROAP_FAILURE"] = "roap:failure";
    Event["ROAP_DONE"] = "roap:done";
    Event["DTMF_TONE_CHANGED"] = "dtmfTone:changed";
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

  var ErrorType;

  (function (ErrorType) {
    ErrorType["DOUBLECONFLICT"] = "DOUBLECONFLICT";
    ErrorType["CONFLICT"] = "CONFLICT";
    ErrorType["FAILED"] = "FAILED";
    ErrorType["INVALID_STATE"] = "INVALID_STATE";
    ErrorType["NOMATCH"] = "NOMATCH";
    ErrorType["OUT_OF_ORDER"] = "OUT_OF_ORDER";
    ErrorType["REFUSED"] = "REFUSED";
    ErrorType["RETRY"] = "RETRY";
    ErrorType["TIMEOUT"] = "TIMEOUT";
  })(ErrorType || (ErrorType = {}));

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  var localTrackTypes = [{
    type: 'audio',
    kind: 'audio'
  }, {
    type: 'video',
    kind: 'video'
  }, {
    type: 'screenShareVideo',
    kind: 'video'
  }];
  class MediaConnection$1 extends EventEmitter {
    constructor(mediaConnectionConfig, options, debugId) {
      super();

      _defineProperty__default["default"](this, "id", void 0);

      _defineProperty__default["default"](this, "config", void 0);

      _defineProperty__default["default"](this, "pc", void 0);

      _defineProperty__default["default"](this, "localTracks", void 0);

      _defineProperty__default["default"](this, "transceivers", void 0);

      _defineProperty__default["default"](this, "receiveOptions", void 0);

      _defineProperty__default["default"](this, "mediaConnectionState", void 0);

      _defineProperty__default["default"](this, "lastEmittedMediaConnectionState", void 0);

      this.config = mediaConnectionConfig;
      this.receiveOptions = options.receive;
      this.localTracks = options.send;
      this.id = debugId || 'MediaConnection';
      this.transceivers = {};
      this.mediaConnectionState = ConnectionState.NEW;
      this.pc = new window.RTCPeerConnection({
        iceServers: this.config.iceServers,
        bundlePolicy: 'max-compat'
      });
      this.pc.ontrack = this.onTrack.bind(this);
      this.pc.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
      this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this);
    }

    log(action, description) {
      getLogger().info("".concat(this.id, ":").concat(action, " ").concat(description));
    }

    error(action, description, error) {
      getLogger().error("".concat(this.id, ":").concat(action, " ").concat(description, " ").concat(getErrorDescription(error)));
    }

    createTransceivers() {
      localTrackTypes.forEach(_ref => {
        var {
          type,
          kind
        } = _ref;
        var trackType = type;
        var transceiverType = type;
        var trackInfo = getLocalTrackInfo(kind, this.receiveOptions[trackType], this.localTracks[trackType]);

        if (!this.config.skipInactiveTransceivers || trackInfo.direction !== 'inactive') {
          this.transceivers[transceiverType] = this.pc.addTransceiver(trackInfo.trackOrKind, {
            direction: trackInfo.direction
          });
        }
      });
      this.setupTransceiverListeners();
    }

    initializeTransceivers(incomingOffer) {
      if (this.pc.getTransceivers().length > 0) {
        this.error('initiateOffer()', 'SDP negotiation already started');
        throw new Error('SDP negotiation already started');
      }

      if (incomingOffer) {
        this.addLocalTracks();
      } else {
        this.createTransceivers();
      }
    }

    close() {
      this.pc.close();
      this.pc.ontrack = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.onconnectionstatechange = null;
      this.pc.onicegatheringstatechange = null;
      this.pc.onicecandidate = null;
      this.pc.onicecandidateerror = null;
    }

    getConfig() {
      return this.config;
    }

    getSendReceiveOptions() {
      return {
        send: this.localTracks,
        receive: this.receiveOptions
      };
    }

    updateTransceivers(options) {
      var newOfferNeeded = false;
      this.receiveOptions = options.receive;
      this.identifyTransceivers();
      localTrackTypes.forEach(_ref2 => {
        var {
          type,
          kind
        } = _ref2;
        var trackType = type;
        var transceiverType = type;
        var track = options.send[trackType];
        var transceiver = this.transceivers[transceiverType];

        if (track !== undefined && track !== this.localTracks[trackType]) {
          this.localTracks[trackType] = track;

          if (transceiver) {
            this.log('updateTransceivers()', "replacing sender track on \"".concat(type, "\" transceiver"));
            transceiver.sender.replaceTrack(track);
          }
        }

        if (transceiver) {
          var trackInfo = getLocalTrackInfo(kind, this.receiveOptions[trackType], this.localTracks[trackType]);

          if (transceiver.direction !== trackInfo.direction) {
            this.log('updateTransceivers()', "updating direction to ".concat(trackInfo.direction, " on \"").concat(type, "\" transceiver"));
            transceiver.direction = trackInfo.direction;
            newOfferNeeded = true;
          }
        }
      });
      return newOfferNeeded;
    }

    updateSendOptions(tracks) {
      return this.updateTransceivers({
        send: tracks,
        receive: _objectSpread$1({}, this.receiveOptions)
      });
    }

    updateReceiveOptions(options) {
      return this.updateTransceivers({
        send: this.localTracks,
        receive: options
      });
    }

    updateSendReceiveOptions(options) {
      return this.updateTransceivers(options);
    }

    getConnectionState() {
      this.log('getConnectionState()', "called, returning ".concat(this.mediaConnectionState));
      return this.mediaConnectionState;
    }

    getStats() {
      return this.pc.getStats();
    }

    getTransceiverStats() {
      var _this = this;

      return _asyncToGenerator__default["default"](function* () {
        var result = {
          audio: {
            sender: new Map(),
            receiver: new Map()
          },
          video: {
            sender: new Map(),
            receiver: new Map()
          },
          screenShareVideo: {
            sender: new Map(),
            receiver: new Map()
          }
        };

        var _loop = function* _loop(type) {
          var transceiver = _this.transceivers[type];

          if (transceiver) {
            var _transceiver$sender, _transceiver$sender$t;

            result[type].currentDirection = transceiver.currentDirection;
            result[type].localTrackLabel = (_transceiver$sender = transceiver.sender) === null || _transceiver$sender === void 0 ? void 0 : (_transceiver$sender$t = _transceiver$sender.track) === null || _transceiver$sender$t === void 0 ? void 0 : _transceiver$sender$t.label;
            yield transceiver.sender.getStats().then(statsReport => {
              result[type].sender = statsReport;
            });
            yield transceiver.receiver.getStats().then(statsReport => {
              result[type].receiver = statsReport;
            });
          }
        };

        for (var {
          type
        } of localTrackTypes) {
          yield* _loop(type);
        }

        return result;
      })();
    }

    insertDTMF(tones, duration, interToneGap) {
      if (!this.transceivers.audio) {
        throw new Error('audio transceiver missing');
      }

      if (!this.transceivers.audio.sender) {
        throw new Error('this.transceivers.audio.sender is null');
      }

      if (!this.transceivers.audio.sender.dtmf) {
        throw new Error('this.transceivers.audio.sender.dtmf is null');
      }

      this.transceivers.audio.sender.dtmf.insertDTMF(tones.toUpperCase(), duration, interToneGap);
    }

    setupTransceiverListeners() {
      var _this$transceivers$au, _this$transceivers$au2;

      if ((_this$transceivers$au = this.transceivers.audio) !== null && _this$transceivers$au !== void 0 && (_this$transceivers$au2 = _this$transceivers$au.sender) !== null && _this$transceivers$au2 !== void 0 && _this$transceivers$au2.dtmf) {
        this.transceivers.audio.sender.dtmf.ontonechange = this.onToneChange.bind(this);
      }
    }

    onToneChange(event) {
      this.log('onToneChange()', "emitting Event.DTMF_TONE_CHANGED with tone=\"".concat(event.tone, "\""));
      this.emit(Event$1.DTMF_TONE_CHANGED, {
        tone: event.tone
      });
    }

    identifyTransceivers() {
      if (!this.transceivers.audio && !this.transceivers.video && !this.transceivers.screenShareVideo) {
        var transceivers = this.pc.getTransceivers();
        this.log('identifyTransceivers()', "transceivers.length=".concat(transceivers.length));
        transceivers.forEach((transceiver, idx) => {
          this.log('identifyTransceivers()', "transceiver[".concat(idx, "].mid=").concat(transceiver.mid));
        });
        [this.transceivers.audio, this.transceivers.video, this.transceivers.screenShareVideo] = transceivers;
        this.setupTransceiverListeners();
      }
    }

    onTrack(event) {
      var _event$transceiver, _this$transceivers$au3, _this$transceivers$au4, _this$transceivers$au5, _this$transceivers$vi, _this$transceivers$vi2, _this$transceivers$vi3, _this$transceivers$sc, _this$transceivers$sc2, _this$transceivers$sc3;

      this.log('onTrack()', "callback called: event=".concat(JSON.stringify(event)));
      var MEDIA_ID = {
        AUDIO_TRACK: '0',
        VIDEO_TRACK: '1',
        SHARE_TRACK: '2'
      };
      var {
        track
      } = event;
      var trackMediaID = null;
      this.identifyTransceivers();

      if ((_event$transceiver = event.transceiver) !== null && _event$transceiver !== void 0 && _event$transceiver.mid) {
        this.log('onTrack()', 'identifying track by event.transceiver.mid');
        trackMediaID = event.transceiver.mid;
      } else if (track.id === ((_this$transceivers$au3 = this.transceivers.audio) === null || _this$transceivers$au3 === void 0 ? void 0 : (_this$transceivers$au4 = _this$transceivers$au3.receiver) === null || _this$transceivers$au4 === void 0 ? void 0 : (_this$transceivers$au5 = _this$transceivers$au4.track) === null || _this$transceivers$au5 === void 0 ? void 0 : _this$transceivers$au5.id)) {
        trackMediaID = MEDIA_ID.AUDIO_TRACK;
      } else if (track.id === ((_this$transceivers$vi = this.transceivers.video) === null || _this$transceivers$vi === void 0 ? void 0 : (_this$transceivers$vi2 = _this$transceivers$vi.receiver) === null || _this$transceivers$vi2 === void 0 ? void 0 : (_this$transceivers$vi3 = _this$transceivers$vi2.track) === null || _this$transceivers$vi3 === void 0 ? void 0 : _this$transceivers$vi3.id)) {
        trackMediaID = MEDIA_ID.VIDEO_TRACK;
      } else if (track.id === ((_this$transceivers$sc = this.transceivers.screenShareVideo) === null || _this$transceivers$sc === void 0 ? void 0 : (_this$transceivers$sc2 = _this$transceivers$sc.receiver) === null || _this$transceivers$sc2 === void 0 ? void 0 : (_this$transceivers$sc3 = _this$transceivers$sc2.track) === null || _this$transceivers$sc3 === void 0 ? void 0 : _this$transceivers$sc3.id)) {
        trackMediaID = MEDIA_ID.SHARE_TRACK;
      } else {
        trackMediaID = null;
      }

      this.log('onTrack()', "trackMediaID=".concat(trackMediaID));

      switch (trackMediaID) {
        case MEDIA_ID.AUDIO_TRACK:
          this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=AUDIO');
          this.emit(Event$1.REMOTE_TRACK_ADDED, {
            type: RemoteTrackType.AUDIO,
            track
          });
          break;

        case MEDIA_ID.VIDEO_TRACK:
          this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=VIDEO');
          this.emit(Event$1.REMOTE_TRACK_ADDED, {
            type: RemoteTrackType.VIDEO,
            track
          });
          break;

        case MEDIA_ID.SHARE_TRACK:
          this.log('onTrack()', 'emitting Event.REMOTE_TRACK_ADDED with type=SCREENSHARE_VIDEO');
          this.emit(Event$1.REMOTE_TRACK_ADDED, {
            type: RemoteTrackType.SCREENSHARE_VIDEO,
            track
          });
          break;

        default:
          {
            this.error('onTrack()', "failed to match remote track media id: ".concat(trackMediaID));
          }
      }
    }

    addLocalTracks() {
      this.log('addLocalTracks()', "adding tracks ".concat(JSON.stringify(this.localTracks)));

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
      this.log('onConnectionStateChange()', "callback called: connectionState=".concat(this.pc.connectionState));
      this.evaluateMediaConnectionState();
    }

    onIceConnectionStateChange() {
      this.log('onIceConnectionStateChange()', "callback called: iceConnectionState=".concat(this.pc.iceConnectionState));
      this.evaluateMediaConnectionState();
    }

    evaluateMediaConnectionState() {
      var rtcPcConnectionState = this.pc.connectionState;
      var iceState = this.pc.iceConnectionState;
      var connectionStates = [rtcPcConnectionState, iceState];

      if (connectionStates.some(value => value === 'closed')) {
        this.mediaConnectionState = ConnectionState.CLOSED;
      } else if (connectionStates.some(value => value === 'failed')) {
        this.mediaConnectionState = ConnectionState.FAILED;
      } else if (connectionStates.some(value => value === 'disconnected')) {
        this.mediaConnectionState = ConnectionState.DISCONNECTED;
      } else if (connectionStates.every(value => value === 'connected' || value === 'completed')) {
        this.mediaConnectionState = ConnectionState.CONNECTED;
      } else {
        this.mediaConnectionState = ConnectionState.CONNECTING;
      }

      this.log('evaluateConnectionState', "iceConnectionState=".concat(iceState, " rtcPcConnectionState=").concat(rtcPcConnectionState, " => mediaConnectionState=").concat(this.mediaConnectionState));

      if (this.lastEmittedMediaConnectionState !== this.mediaConnectionState) {
        this.emit(Event$1.CONNECTION_STATE_CHANGED, {
          state: this.mediaConnectionState
        });
        this.lastEmittedMediaConnectionState = this.mediaConnectionState;
      }
    }

    createLocalOffer() {
      return this.pc.createOffer().then(description => {
        this.log('createLocalOffer', 'local SDP offer created');
        var mungedDescription = {
          type: description.type,
          sdp: mungeLocalSdpForBrowser(this.config.sdpMunging, (description === null || description === void 0 ? void 0 : description.sdp) || '')
        };
        return this.pc.setLocalDescription(mungedDescription);
      }).then(() => this.waitForIceCandidates()).then(() => {
        var _this$pc$localDescrip;

        var mungedSdp = mungeLocalSdp(this.config.sdpMunging, ((_this$pc$localDescrip = this.pc.localDescription) === null || _this$pc$localDescrip === void 0 ? void 0 : _this$pc$localDescrip.sdp) || '');
        return {
          sdp: mungedSdp
        };
      });
    }

    handleRemoteOffer(sdp) {
      this.log('handleRemoteOffer', 'called');

      if (!sdp) {
        return Promise.reject(new Error('SDP missing'));
      }

      var mungedRemoteSdp = mungeRemoteSdp(this.config.sdpMunging, sdp);
      return this.pc.setRemoteDescription(new window.RTCSessionDescription({
        type: 'offer',
        sdp: mungedRemoteSdp
      })).then(() => this.pc.createAnswer()).then(answer => {
        var mungedAnswer = {
          type: answer.type,
          sdp: mungeLocalSdpForBrowser(this.config.sdpMunging, (answer === null || answer === void 0 ? void 0 : answer.sdp) || '')
        };
        return this.pc.setLocalDescription(mungedAnswer);
      }).then(() => this.waitForIceCandidates()).then(() => {
        var _this$pc$localDescrip2;

        var mungedLocalSdp = mungeLocalSdp(this.config.sdpMunging, ((_this$pc$localDescrip2 = this.pc.localDescription) === null || _this$pc$localDescrip2 === void 0 ? void 0 : _this$pc$localDescrip2.sdp) || '');
        return {
          sdp: mungedLocalSdp
        };
      });
    }

    handleRemoteAnswer(sdp) {
      this.log('handleRemoteAnswer', 'called');

      if (!sdp) {
        return Promise.reject(new Error('SDP missing'));
      }

      var mungedRemoteSdp = mungeRemoteSdp(this.config.sdpMunging, sdp);
      return this.pc.setRemoteDescription(new window.RTCSessionDescription({
        type: 'answer',
        sdp: mungedRemoteSdp
      }));
    }

    waitForIceCandidates() {
      return new Promise((resolve, reject) => {
        var startTime = performance.now();
        var done = false;

        var isLocalSdpValid = () => {
          var _this$pc$localDescrip3;

          return !isSdpInvalid({
            allowPort0: !!this.config.sdpMunging.convertPort9to0,
            requireH264: !!this.config.requireH264
          }, this.error.bind(this), (_this$pc$localDescrip3 = this.pc.localDescription) === null || _this$pc$localDescrip3 === void 0 ? void 0 : _this$pc$localDescrip3.sdp);
        };

        var doneGatheringIceCandidates = () => {
          if (!done) {
            var miliseconds = performance.now() - startTime;
            this.log('waitForIceCandidates()', "checking SDP...");

            if (!isLocalSdpValid()) {
              this.error('waitForIceCandidates()', 'SDP not valid after waiting.');
              reject(new Error('SDP not valid'));
            }

            this.log('waitForIceCandidates()', "It took ".concat(miliseconds, " miliseconds to gather ice candidates"));
            done = true;
            this.pc.onicegatheringstatechange = null;
            this.pc.onicecandidate = null;
            this.pc.onicecandidateerror = null;
            resolve();
          }
        };

        if (this.pc.iceGatheringState === 'complete' && isLocalSdpValid()) {
          this.log('waitForIceCandidates()', 'iceGatheringState is already "complete" and local SDP is valid');
          resolve();
          return;
        }

        this.log('waitForIceCandidates()', 'waiting for ICE candidates to be gathered...');

        this.pc.onicegatheringstatechange = () => {
          this.log('waitForIceCandidates()', "iceGatheringState changed to ".concat(this.pc.iceGatheringState));

          if (this.pc.iceGatheringState === 'complete') {
            doneGatheringIceCandidates();
          }
        };

        this.pc.onicecandidate = evt => {
          if (evt.candidate === null) {
            this.log('waitForIceCandidates()', 'evt.candidate === null received');
            doneGatheringIceCandidates();
          } else {
            var _evt$candidate, _evt$candidate2;

            this.log('waitForIceCandidates()', "ICE Candidate(".concat((_evt$candidate = evt.candidate) === null || _evt$candidate === void 0 ? void 0 : _evt$candidate.sdpMLineIndex, "): ").concat((_evt$candidate2 = evt.candidate) === null || _evt$candidate2 === void 0 ? void 0 : _evt$candidate2.candidate));
          }
        };

        this.pc.onicecandidateerror = event => {
          this.error('waitForIceCandidates()', "onicecandidateerror: ".concat(event));
          reject(new Error('Error gathering ICE candidates'));
        };
      });
    }

  }

  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */

  var logDisabled_ = true;
  var deprecationWarnings_ = true;
  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */

  function extractVersion(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  } // Wraps the peerconnection event eventNameToWrap in a function
  // which returns the modified event object (or false to prevent
  // the event).

  function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
    if (!window.RTCPeerConnection) {
      return;
    }

    var proto = window.RTCPeerConnection.prototype;
    var nativeAddEventListener = proto.addEventListener;

    proto.addEventListener = function (nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap) {
        return nativeAddEventListener.apply(this, arguments);
      }

      var wrappedCallback = e => {
        var modifiedEvent = wrapper(e);

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

      return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
    };

    var nativeRemoveEventListener = proto.removeEventListener;

    proto.removeEventListener = function (nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
        return nativeRemoveEventListener.apply(this, arguments);
      }

      if (!this._eventMap[eventNameToWrap].has(cb)) {
        return nativeRemoveEventListener.apply(this, arguments);
      }

      var unwrappedCb = this._eventMap[eventNameToWrap].get(cb);

      this._eventMap[eventNameToWrap].delete(cb);

      if (this._eventMap[eventNameToWrap].size === 0) {
        delete this._eventMap[eventNameToWrap];
      }

      if (Object.keys(this._eventMap).length === 0) {
        delete this._eventMap;
      }

      return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
    };

    Object.defineProperty(proto, 'on' + eventNameToWrap, {
      get() {
        return this['_on' + eventNameToWrap];
      },

      set(cb) {
        if (this['_on' + eventNameToWrap]) {
          this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
          delete this['_on' + eventNameToWrap];
        }

        if (cb) {
          this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
        }
      },

      enumerable: true,
      configurable: true
    });
  }
  function disableLog(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool + '. Please use a boolean.');
    }

    logDisabled_ = bool;
    return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
  }
  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */

  function disableWarnings(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool + '. Please use a boolean.');
    }

    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  }
  function log$1() {
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

    console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
  }
  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */

  function detectBrowser(window) {
    // Returned result object.
    var result = {
      browser: null,
      version: null
    }; // Fail early if it's not a browser

    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    var {
      navigator
    } = window;

    if (navigator.mozGetUserMedia) {
      // Firefox.
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia || window.isSecureContext === false && window.webkitRTCPeerConnection && !window.RTCIceGatherer) {
      // Chrome, Chromium, Webview, Opera.
      // Version matches Chrome/WebRTC version.
      // Chrome 74 removed webkitGetUserMedia on http as well so we need the
      // more complicated fallback to webkitRTCPeerConnection.
      result.browser = 'chrome';
      result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
    } else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
      // Safari.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
      result.supportsUnifiedPlan = window.RTCRtpTransceiver && 'currentDirection' in window.RTCRtpTransceiver.prototype;
    } else {
      // Default fallthrough: not supported.
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

    return Object.keys(data).reduce(function (accumulator, key) {
      var isObj = isObject(data[key]);
      var value = isObj ? compactObject(data[key]) : data[key];
      var isEmptyObject = isObj && !Object.keys(value).length;

      if (value === undefined || isEmptyObject) {
        return accumulator;
      }

      return Object.assign(accumulator, {
        [key]: value
      });
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
    var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
    var filteredResult = new Map();

    if (track === null) {
      return filteredResult;
    }

    var trackStats = [];
    result.forEach(value => {
      if (value.type === 'track' && value.trackIdentifier === track.id) {
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
  var logging = log$1;
  function shimGetUserMedia$2(window, browserDetails) {
    var navigator = window && window.navigator;

    if (!navigator.mediaDevices) {
      return;
    }

    var constraintsToChrome_ = function constraintsToChrome_(c) {
      if (typeof c !== 'object' || c.mandatory || c.optional) {
        return c;
      }

      var cc = {};
      Object.keys(c).forEach(key => {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }

        var r = typeof c[key] === 'object' ? c[key] : {
          ideal: c[key]
        };

        if (r.exact !== undefined && typeof r.exact === 'number') {
          r.min = r.max = r.exact;
        }

        var oldname_ = function oldname_(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }

          return name === 'deviceId' ? 'sourceId' : name;
        };

        if (r.ideal !== undefined) {
          cc.optional = cc.optional || [];
          var oc = {};

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

    var shimConstraints_ = function shimConstraints_(constraints, func) {
      if (browserDetails.version >= 61) {
        return func(constraints);
      }

      constraints = JSON.parse(JSON.stringify(constraints));

      if (constraints && typeof constraints.audio === 'object') {
        var remap = function remap(obj, a, b) {
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
        var face = constraints.video.facingMode;
        face = face && (typeof face === 'object' ? face : {
          ideal: face
        });
        var getSupportedFacingModeLies = browserDetails.version < 66;

        if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
          delete constraints.video.facingMode;
          var matches;

          if (face.exact === 'environment' || face.ideal === 'environment') {
            matches = ['back', 'rear'];
          } else if (face.exact === 'user' || face.ideal === 'user') {
            matches = ['front'];
          }

          if (matches) {
            // Look for matches in label, or use last cam for back (typical).
            return navigator.mediaDevices.enumerateDevices().then(devices => {
              devices = devices.filter(d => d.kind === 'videoinput');
              var dev = devices.find(d => matches.some(match => d.label.toLowerCase().includes(match)));

              if (!dev && devices.length && matches.includes('back')) {
                dev = devices[devices.length - 1]; // more likely the back cam
              }

              if (dev) {
                constraints.video.deviceId = face.exact ? {
                  exact: dev.deviceId
                } : {
                  ideal: dev.deviceId
                };
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

    var shimError_ = function shimError_(e) {
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

    var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
      shimConstraints_(constraints, c => {
        navigator.webkitGetUserMedia(c, onSuccess, e => {
          if (onError) {
            onError(shimError_(e));
          }
        });
      });
    };

    navigator.getUserMedia = getUserMedia_.bind(navigator); // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.

    if (navigator.mediaDevices.getUserMedia) {
      var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      navigator.mediaDevices.getUserMedia = function (cs) {
        return shimConstraints_(cs, c => origGetUserMedia(c).then(stream => {
          if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
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
    if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }

    if (!window.navigator.mediaDevices) {
      return;
    } // getSourceId is a function that returns a promise resolving with
    // the sourceId of the screen/window/tab to be shared.


    if (typeof getSourceId !== 'function') {
      console.error('shimGetDisplayMedia: getSourceId argument is not ' + 'a function');
      return;
    }

    window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      return getSourceId(constraints).then(sourceId => {
        var widthSpecified = constraints.video && constraints.video.width;
        var heightSpecified = constraints.video && constraints.video.height;
        var frameRateSpecified = constraints.video && constraints.video.frameRate;
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
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
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
      var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;

      window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        if (!this._ontrackpoly) {
          this._ontrackpoly = e => {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', te => {
              var receiver;

              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find(r => r.track && r.track.id === te.track.id);
              } else {
                receiver = {
                  track: te.track
                };
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {
                receiver
              };
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(track => {
              var receiver;

              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find(r => r.track && r.track.id === track.id);
              } else {
                receiver = {
                  track
                };
              }

              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {
                receiver
              };
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
          Object.defineProperty(e, 'transceiver', {
            value: {
              receiver: e.receiver
            }
          });
        }

        return e;
      });
    }
  }
  function shimGetSendersWithDtmf(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
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
      }; // augment addTrack when getSenders is not available.


      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };

        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;

        window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
          var sender = origAddTrack.apply(this, arguments);

          if (!sender) {
            sender = shimSenderWithDtmf(this, track);

            this._senders.push(sender);
          }

          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;

        window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
          origRemoveTrack.apply(this, arguments);

          var idx = this._senders.indexOf(sender);

          if (idx !== -1) {
            this._senders.splice(idx, 1);
          }
        };
      }

      var origAddStream = window.RTCPeerConnection.prototype.addStream;

      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        this._senders = this._senders || [];
        origAddStream.apply(this, [stream]);
        stream.getTracks().forEach(track => {
          this._senders.push(shimSenderWithDtmf(this, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;

      window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        this._senders = this._senders || [];
        origRemoveStream.apply(this, [stream]);
        stream.getTracks().forEach(track => {
          var sender = this._senders.find(s => s.track === track);

          if (sender) {
            // remove sender
            this._senders.splice(this._senders.indexOf(sender), 1);
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;

      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        var senders = origGetSenders.apply(this, []);
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

    var origGetStats = window.RTCPeerConnection.prototype.getStats;

    window.RTCPeerConnection.prototype.getStats = function getStats() {
      var [selector, onSucc, onErr] = arguments; // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.

      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      } // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.


      if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function fixChromeStats_(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(report => {
          var standardStats = {
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
      }; // shim getStats with maplike support


      var makeMapStats = function makeMapStats(stats) {
        return new Map(Object.keys(stats).map(key => [key, stats[key]]));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function successCallbackWrapper_(response) {
          onSucc(makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_, selector]);
      } // promise-support


      return new Promise((resolve, reject) => {
        origGetStats.apply(this, [function (response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        }, reject]);
      }).then(onSucc, onErr);
    };
  }
  function shimSenderReceiverGetStats(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection && window.RTCRtpSender && window.RTCRtpReceiver)) {
      return;
    } // shim sender stats.


    if (!('getStats' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;

      if (origGetSenders) {
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          var senders = origGetSenders.apply(this, []);
          senders.forEach(sender => sender._pc = this);
          return senders;
        };
      }

      var origAddTrack = window.RTCPeerConnection.prototype.addTrack;

      if (origAddTrack) {
        window.RTCPeerConnection.prototype.addTrack = function addTrack() {
          var sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }

      window.RTCRtpSender.prototype.getStats = function getStats() {
        var sender = this;
        return this._pc.getStats().then(result =>
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true));
      };
    } // shim receiver stats.


    if (!('getStats' in window.RTCRtpReceiver.prototype)) {
      var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;

      if (origGetReceivers) {
        window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
          var receivers = origGetReceivers.apply(this, []);
          receivers.forEach(receiver => receiver._pc = this);
          return receivers;
        };
      }

      wrapPeerConnectionEvent(window, 'track', e => {
        e.receiver._pc = e.srcElement;
        return e;
      });

      window.RTCRtpReceiver.prototype.getStats = function getStats() {
        var receiver = this;
        return this._pc.getStats().then(result => filterStats(result, receiver.track, false));
      };
    }

    if (!('getStats' in window.RTCRtpSender.prototype && 'getStats' in window.RTCRtpReceiver.prototype)) {
      return;
    } // shim RTCPeerConnection.getStats(track).


    var origGetStats = window.RTCPeerConnection.prototype.getStats;

    window.RTCPeerConnection.prototype.getStats = function getStats() {
      if (arguments.length > 0 && arguments[0] instanceof window.MediaStreamTrack) {
        var track = arguments[0];
        var sender;
        var receiver;
        var err;
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

        if (err || sender && receiver) {
          return Promise.reject(new DOMException('There are more than one sender or receiver for the track.', 'InvalidAccessError'));
        } else if (sender) {
          return sender.getStats();
        } else if (receiver) {
          return receiver.getStats();
        }

        return Promise.reject(new DOMException('There is no sender or receiver for the track.', 'InvalidAccessError'));
      }

      return origGetStats.apply(this, arguments);
    };
  }
  function shimAddTrackRemoveTrackWithNative(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(streamId => this._shimmedLocalStreams[streamId][0]);
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;

    window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }

      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      var sender = origAddTrack.apply(this, arguments);

      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }

      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;

    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      stream.getTracks().forEach(track => {
        var alreadyExists = this.getSenders().find(s => s.track === track);

        if (alreadyExists) {
          throw new DOMException('Track already exists.', 'InvalidAccessError');
        }
      });
      var existingSenders = this.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = this.getSenders().filter(newSender => existingSenders.indexOf(newSender) === -1);
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;

    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;

    window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(streamId => {
          var idx = this._shimmedLocalStreams[streamId].indexOf(sender);

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
    } // shim addTrack and removeTrack.


    if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
      return shimAddTrackRemoveTrackWithNative(window);
    } // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.


    var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;

    window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      var nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map(stream => this._reverseStreams[stream.id]);
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;

    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      stream.getTracks().forEach(track => {
        var alreadyExists = this.getSenders().find(s => s.track === track);

        if (alreadyExists) {
          throw new DOMException('Track already exists.', 'InvalidAccessError');
        }
      }); // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.

      if (!this._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }

      origAddStream.apply(this, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;

    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
      delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
      delete this._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      if (this.signalingState === 'closed') {
        throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
      }

      var streams = [].slice.call(arguments, 1);

      if (streams.length !== 1 || !streams[0].getTracks().find(t => t === track)) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
      }

      var alreadyExists = this.getSenders().find(s => s.track === track);

      if (alreadyExists) {
        throw new DOMException('Track already exists.', 'InvalidAccessError');
      }

      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      var oldStream = this._streams[stream.id];

      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track); // Trigger ONN async.

        Promise.resolve().then(() => {
          this.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        this.addStream(newStream);
      }

      return this.getSenders().find(s => s.track === track);
    }; // replace the internal stream id with the external one and
    // vice versa.


    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(internalId => {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp
      });
    }

    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(internalId => {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp
      });
    }

    ['createOffer', 'createAnswer'].forEach(function (method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      var methodObj = {
        [method]() {
          var args = arguments;
          var isLegacyCall = arguments.length && typeof arguments[0] === 'function';

          if (isLegacyCall) {
            return nativeMethod.apply(this, [description => {
              var desc = replaceInternalStreamId(this, description);
              args[0].apply(null, [desc]);
            }, err => {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]]);
          }

          return nativeMethod.apply(this, arguments).then(description => replaceInternalStreamId(this, description));
        }

      };
      window.RTCPeerConnection.prototype[method] = methodObj[method];
    });
    var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;

    window.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }

      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    }; // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier


    var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
      get() {
        var description = origLocalDescription.get.apply(this);

        if (description.type === '') {
          return description;
        }

        return replaceInternalStreamId(this, description);
      }

    });

    window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      if (this.signalingState === 'closed') {
        throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
      } // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.


      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
      }

      var isLocal = sender._pc === this;

      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
      } // Search for the native stream the senders track belongs to.


      this._streams = this._streams || {};
      var stream;
      Object.keys(this._streams).forEach(streamid => {
        var hasTrack = this._streams[streamid].getTracks().find(track => sender.track === track);

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
    } // shim implicit creation of RTCSessionDescription/RTCIceCandidate


    if (browserDetails.version < 53) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        var methodObj = {
          [method]() {
            arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }

        };
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }
  } // Attempt to fix ONN in plan-b mode.

  function fixNegotiationNeeded(window, browserDetails) {
    wrapPeerConnectionEvent(window, 'negotiationneeded', e => {
      var pc = e.target;

      if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === 'plan-b') {
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
    var navigator = window && window.navigator;
    var MediaStreamTrack = window && window.MediaStreamTrack;

    navigator.getUserMedia = function (constraints, onSuccess, onError) {
      // Replace Firefox 44+'s deprecation warning with unprefixed version.
      deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    };

    if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
      var remap = function remap(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };

      var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      navigator.mediaDevices.getUserMedia = function (c) {
        if (typeof c === 'object' && typeof c.audio === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
          remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
        }

        return nativeGetUserMedia(c);
      };

      if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
        var nativeGetSettings = MediaStreamTrack.prototype.getSettings;

        MediaStreamTrack.prototype.getSettings = function () {
          var obj = nativeGetSettings.apply(this, arguments);
          remap(obj, 'mozAutoGainControl', 'autoGainControl');
          remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
          return obj;
        };
      }

      if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
        var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;

        MediaStreamTrack.prototype.applyConstraints = function (c) {
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
    if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }

    if (!window.navigator.mediaDevices) {
      return;
    }

    window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      if (!(constraints && constraints.video)) {
        var err = new DOMException('getDisplayMedia without video ' + 'constraints is undefined');
        err.name = 'NotFoundError'; // from https://heycam.github.io/webidl/#idl-DOMException-error-names

        err.code = 8;
        return Promise.reject(err);
      }

      if (constraints.video === true) {
        constraints.video = {
          mediaSource: preferredMediaSource
        };
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
    if (typeof window === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get() {
          return {
            receiver: this.receiver
          };
        }

      });
    }
  }
  function shimPeerConnection(window, browserDetails) {
    if (typeof window !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }

    if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
      // very basic support for old versions.
      window.RTCPeerConnection = window.mozRTCPeerConnection;
    }

    if (browserDetails.version < 53) {
      // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        var methodObj = {
          [method]() {
            arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }

        };
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };
    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;

    window.RTCPeerConnection.prototype.getStats = function getStats() {
      var [selector, onSucc, onErr] = arguments;
      return nativeGetStats.apply(this, [selector || null]).then(stats => {
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
            } // Avoid TypeError: "type" is read-only, in old versions. 34-43ish


            stats.forEach((stat, i) => {
              stats.set(i, Object.assign({}, stat, {
                type: modernStatsTypes[stat.type] || stat.type
              }));
            });
          }
        }

        return stats;
      }).then(onSucc, onErr);
    };
  }
  function shimSenderGetStats(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
      return;
    }

    if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
      return;
    }

    var origGetSenders = window.RTCPeerConnection.prototype.getSenders;

    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        var senders = origGetSenders.apply(this, []);
        senders.forEach(sender => sender._pc = this);
        return senders;
      };
    }

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;

    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function addTrack() {
        var sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }

    window.RTCRtpSender.prototype.getStats = function getStats() {
      return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
    };
  }
  function shimReceiverGetStats(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
      return;
    }

    if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
      return;
    }

    var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;

    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        var receivers = origGetReceivers.apply(this, []);
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
    if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }

    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
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

    var origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;

    if (origAddTransceiver) {
      window.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
        this.setParametersPromises = [];
        var initParameters = arguments[1];
        var shouldPerformCheck = initParameters && 'sendEncodings' in initParameters;

        if (shouldPerformCheck) {
          // If sendEncodings params are provided, validate grammar
          initParameters.sendEncodings.forEach(encodingParam => {
            if ('rid' in encodingParam) {
              var ridRegex = /^[a-z0-9]{0,16}$/i;

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

        var transceiver = origAddTransceiver.apply(this, arguments);

        if (shouldPerformCheck) {
          // Check if the init options were applied. If not we do this in an
          // asynchronous way and save the promise reference in a global object.
          // This is an ugly hack, but at the same time is way more robust than
          // checking the sender parameters before and after the createOffer
          // Also note that after the createoffer we are not 100% sure that
          // the params were asynchronously applied so we might miss the
          // opportunity to recreate offer.
          var {
            sender
          } = transceiver;
          var params = sender.getParameters();

          if (!('encodings' in params) || // Avoid being fooled by patched getParameters() below.
          params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
            params.encodings = initParameters.sendEncodings;
            sender.sendEncodings = initParameters.sendEncodings;
            this.setParametersPromises.push(sender.setParameters(params).then(() => {
              delete sender.sendEncodings;
            }).catch(() => {
              delete sender.sendEncodings;
            }));
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

    var origGetParameters = window.RTCRtpSender.prototype.getParameters;

    if (origGetParameters) {
      window.RTCRtpSender.prototype.getParameters = function getParameters() {
        var params = origGetParameters.apply(this, arguments);

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

    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;

    window.RTCPeerConnection.prototype.createOffer = function createOffer() {
      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(() => {
          return origCreateOffer.apply(this, arguments);
        }).finally(() => {
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

    var origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;

    window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(() => {
          return origCreateAnswer.apply(this, arguments);
        }).finally(() => {
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
      window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }

        return this._localStreams;
      };
    }

    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;

      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }

        if (!this._localStreams.includes(stream)) {
          this._localStreams.push(stream);
        } // Try to emulate Chrome's behaviour of adding in audio-video order.
        // Safari orders by track id.


        stream.getAudioTracks().forEach(track => _addTrack.call(this, track, stream));
        stream.getVideoTracks().forEach(track => _addTrack.call(this, track, stream));
      };

      window.RTCPeerConnection.prototype.addTrack = function addTrack(track) {
        for (var _len = arguments.length, streams = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          streams[_key - 1] = arguments[_key];
        }

        if (streams) {
          streams.forEach(stream => {
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
      window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }

        var index = this._localStreams.indexOf(stream);

        if (index === -1) {
          return;
        }

        this._localStreams.splice(index, 1);

        var tracks = stream.getTracks();
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
      window.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
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
          this.addEventListener('track', this._onaddstreampoly = e => {
            e.streams.forEach(stream => {
              if (!this._remoteStreams) {
                this._remoteStreams = [];
              }

              if (this._remoteStreams.includes(stream)) {
                return;
              }

              this._remoteStreams.push(stream);

              var event = new Event('addstream');
              event.stream = stream;
              this.dispatchEvent(event);
            });
          });
        }

      });
      var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;

      window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        var pc = this;

        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function (e) {
            e.streams.forEach(stream => {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }

              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }

              pc._remoteStreams.push(stream);

              var event = new Event('addstream');
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

    var prototype = window.RTCPeerConnection.prototype;
    var origCreateOffer = prototype.createOffer;
    var origCreateAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function createOffer(successCallback, failureCallback) {
      var options = arguments.length >= 2 ? arguments[2] : arguments[0];
      var promise = origCreateOffer.apply(this, [options]);

      if (!failureCallback) {
        return promise;
      }

      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
      var options = arguments.length >= 2 ? arguments[2] : arguments[0];
      var promise = origCreateAnswer.apply(this, [options]);

      if (!failureCallback) {
        return promise;
      }

      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function withCallback(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);

      if (!failureCallback) {
        return promise;
      }

      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.setLocalDescription = withCallback;

    withCallback = function withCallback(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);

      if (!failureCallback) {
        return promise;
      }

      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.setRemoteDescription = withCallback;

    withCallback = function withCallback(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);

      if (!failureCallback) {
        return promise;
      }

      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.addIceCandidate = withCallback;
  }
  function shimGetUserMedia(window) {
    var navigator = window && window.navigator;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // shim not needed in Safari 12.1
      var mediaDevices = navigator.mediaDevices;

      var _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);

      navigator.mediaDevices.getUserMedia = constraints => {
        return _getUserMedia(shimConstraints(constraints));
      };
    }

    if (!navigator.getUserMedia && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
        navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
      }.bind(navigator);
    }
  }
  function shimConstraints(constraints) {
    if (constraints && constraints.video !== undefined) {
      return Object.assign({}, constraints, {
        video: compactObject(constraints.video)
      });
    }

    return constraints;
  }
  function shimRTCIceServerUrls(window) {
    if (!window.RTCPeerConnection) {
      return;
    } // migrate from non-spec RTCIceServer.url to RTCIceServer.urls


    var OrigPeerConnection = window.RTCPeerConnection;

    window.RTCPeerConnection = function RTCPeerConnection(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];

        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];

          if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
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

    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype; // wrap static methods. Currently just generateCertificate.

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
    if (typeof window === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get() {
          return {
            receiver: this.receiver
          };
        }

      });
    }
  }
  function shimCreateOfferLegacy(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;

    window.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }

        var audioTransceiver = this.getTransceivers().find(transceiver => transceiver.receiver.track.kind === 'audio');

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
        } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
          this.addTransceiver('audio', {
            direction: 'recvonly'
          });
        }

        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }

        var videoTransceiver = this.getTransceivers().find(transceiver => transceiver.receiver.track.kind === 'video');

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
        } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
          this.addTransceiver('video', {
            direction: 'recvonly'
          });
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

    var SDPUtils = {}; // Generate an alphanumeric identifier for cname or mids.
    // TODO: use UUIDs instead? https://gist.github.com/jed/982883

    SDPUtils.generateIdentifier = function () {
      return Math.random().toString(36).substr(2, 10);
    }; // The RTCP CNAME used by all peerconnections from the same JS.


    SDPUtils.localCName = SDPUtils.generateIdentifier(); // Splits SDP into lines, dealing with both CRLF and LF.

    SDPUtils.splitLines = function (blob) {
      return blob.trim().split('\n').map(line => line.trim());
    }; // Splits SDP into sessionpart and mediasections. Ensures CRLF.


    SDPUtils.splitSections = function (blob) {
      var parts = blob.split('\nm=');
      return parts.map((part, index) => (index > 0 ? 'm=' + part : part).trim() + '\r\n');
    }; // Returns the session description.


    SDPUtils.getDescription = function (blob) {
      var sections = SDPUtils.splitSections(blob);
      return sections && sections[0];
    }; // Returns the individual media sections.


    SDPUtils.getMediaSections = function (blob) {
      var sections = SDPUtils.splitSections(blob);
      sections.shift();
      return sections;
    }; // Returns lines that start with a certain prefix.


    SDPUtils.matchPrefix = function (blob, prefix) {
      return SDPUtils.splitLines(blob).filter(line => line.indexOf(prefix) === 0);
    }; // Parses an ICE candidate line. Sample input:
    // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
    // rport 55996"
    // Input can be prefixed with a=.


    SDPUtils.parseCandidate = function (line) {
      var parts; // Parse both variants.

      if (line.indexOf('a=candidate:') === 0) {
        parts = line.substring(12).split(' ');
      } else {
        parts = line.substring(10).split(' ');
      }

      var candidate = {
        foundation: parts[0],
        component: {
          1: 'rtp',
          2: 'rtcp'
        }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };

      for (var i = 8; i < parts.length; i += 2) {
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

          default:
            // extension handling, in particular ufrag. Don't overwrite.
            if (candidate[parts[i]] === undefined) {
              candidate[parts[i]] = parts[i + 1];
            }

            break;
        }
      }

      return candidate;
    }; // Translates a candidate object into SDP candidate attribute.
    // This does not include the a= prefix!


    SDPUtils.writeCandidate = function (candidate) {
      var sdp = [];
      sdp.push(candidate.foundation);
      var component = candidate.component;

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
      var type = candidate.type;
      sdp.push('typ');
      sdp.push(type);

      if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
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
    }; // Parses an ice-options line, returns an array of option tags.
    // Sample input:
    // a=ice-options:foo bar


    SDPUtils.parseIceOptions = function (line) {
      return line.substr(14).split(' ');
    }; // Parses a rtpmap line, returns RTCRtpCoddecParameters. Sample input:
    // a=rtpmap:111 opus/48000/2


    SDPUtils.parseRtpMap = function (line) {
      var parts = line.substr(9).split(' ');
      var parsed = {
        payloadType: parseInt(parts.shift(), 10) // was: id

      };
      parts = parts[0].split('/');
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10); // was: clockrate

      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1; // legacy alias, got renamed back to channels in ORTC.

      parsed.numChannels = parsed.channels;
      return parsed;
    }; // Generates a rtpmap line from RTCRtpCodecCapability or
    // RTCRtpCodecParameters.


    SDPUtils.writeRtpMap = function (codec) {
      var pt = codec.payloadType;

      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }

      var channels = codec.channels || codec.numChannels || 1;
      return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (channels !== 1 ? '/' + channels : '') + '\r\n';
    }; // Parses a extmap line (headerextension from RFC 5285). Sample input:
    // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
    // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset


    SDPUtils.parseExtmap = function (line) {
      var parts = line.substr(9).split(' ');
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
        uri: parts[1]
      };
    }; // Generates an extmap line from RTCRtpHeaderExtensionParameters or
    // RTCRtpHeaderExtension.


    SDPUtils.writeExtmap = function (headerExtension) {
      return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== 'sendrecv' ? '/' + headerExtension.direction : '') + ' ' + headerExtension.uri + '\r\n';
    }; // Parses a fmtp line, returns dictionary. Sample input:
    // a=fmtp:96 vbr=on;cng=on
    // Also deals with vbr=on; cng=on


    SDPUtils.parseFmtp = function (line) {
      var parsed = {};
      var kv;
      var parts = line.substr(line.indexOf(' ') + 1).split(';');

      for (var j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split('=');
        parsed[kv[0].trim()] = kv[1];
      }

      return parsed;
    }; // Generates a fmtp line from RTCRtpCodecCapability or RTCRtpCodecParameters.


    SDPUtils.writeFmtp = function (codec) {
      var line = '';
      var pt = codec.payloadType;

      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }

      if (codec.parameters && Object.keys(codec.parameters).length) {
        var params = [];
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
    }; // Parses a rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
    // a=rtcp-fb:98 nack rpsi


    SDPUtils.parseRtcpFb = function (line) {
      var parts = line.substr(line.indexOf(' ') + 1).split(' ');
      return {
        type: parts.shift(),
        parameter: parts.join(' ')
      };
    }; // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.


    SDPUtils.writeRtcpFb = function (codec) {
      var lines = '';
      var pt = codec.payloadType;

      if (codec.preferredPayloadType !== undefined) {
        pt = codec.preferredPayloadType;
      }

      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        // FIXME: special handling for trr-int?
        codec.rtcpFeedback.forEach(fb => {
          lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') + '\r\n';
        });
      }

      return lines;
    }; // Parses a RFC 5576 ssrc media attribute. Sample input:
    // a=ssrc:3735928559 cname:something


    SDPUtils.parseSsrcMedia = function (line) {
      var sp = line.indexOf(' ');
      var parts = {
        ssrc: parseInt(line.substr(7, sp - 7), 10)
      };
      var colon = line.indexOf(':', sp);

      if (colon > -1) {
        parts.attribute = line.substr(sp + 1, colon - sp - 1);
        parts.value = line.substr(colon + 1);
      } else {
        parts.attribute = line.substr(sp + 1);
      }

      return parts;
    }; // Parse a ssrc-group line (see RFC 5576). Sample input:
    // a=ssrc-group:semantics 12 34


    SDPUtils.parseSsrcGroup = function (line) {
      var parts = line.substr(13).split(' ');
      return {
        semantics: parts.shift(),
        ssrcs: parts.map(ssrc => parseInt(ssrc, 10))
      };
    }; // Extracts the MID (RFC 5888) from a media section.
    // Returns the MID or undefined if no mid line was found.


    SDPUtils.getMid = function (mediaSection) {
      var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];

      if (mid) {
        return mid.substr(6);
      }
    }; // Parses a fingerprint line for DTLS-SRTP.


    SDPUtils.parseFingerprint = function (line) {
      var parts = line.substr(14).split(' ');
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase() // the definition is upper-case in RFC 4572.

      };
    }; // Extracts DTLS parameters from SDP media section or sessionpart.
    // FIXME: for consistency with other functions this should only
    //   get the fingerprint line as input. See also getIceParameters.


    SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
      var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=fingerprint:'); // Note: a=setup line is ignored since we use the 'auto' role in Edge.

      return {
        role: 'auto',
        fingerprints: lines.map(SDPUtils.parseFingerprint)
      };
    }; // Serializes DTLS parameters to SDP.


    SDPUtils.writeDtlsParameters = function (params, setupType) {
      var sdp = 'a=setup:' + setupType + '\r\n';
      params.fingerprints.forEach(fp => {
        sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
      });
      return sdp;
    }; // Parses a=crypto lines into
    //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members


    SDPUtils.parseCryptoLine = function (line) {
      var parts = line.substr(9).split(' ');
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };

    SDPUtils.writeCryptoLine = function (parameters) {
      return 'a=crypto:' + parameters.tag + ' ' + parameters.cryptoSuite + ' ' + (typeof parameters.keyParams === 'object' ? SDPUtils.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') + '\r\n';
    }; // Parses the crypto key parameters into
    //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*


    SDPUtils.parseCryptoKeyParams = function (keyParams) {
      if (keyParams.indexOf('inline:') !== 0) {
        return null;
      }

      var parts = keyParams.substr(7).split('|');
      return {
        keyMethod: 'inline',
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
        mkiLength: parts[2] ? parts[2].split(':')[1] : undefined
      };
    };

    SDPUtils.writeCryptoKeyParams = function (keyParams) {
      return keyParams.keyMethod + ':' + keyParams.keySalt + (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') + (keyParams.mkiValue && keyParams.mkiLength ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength : '');
    }; // Extracts all SDES parameters.


    SDPUtils.getCryptoParameters = function (mediaSection, sessionpart) {
      var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=crypto:');
      return lines.map(SDPUtils.parseCryptoLine);
    }; // Parses ICE information from SDP media section or sessionpart.
    // FIXME: for consistency with other functions this should only
    //   get the ice-ufrag and ice-pwd lines as input.


    SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
      var ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=ice-ufrag:')[0];
      var pwd = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=ice-pwd:')[0];

      if (!(ufrag && pwd)) {
        return null;
      }

      return {
        usernameFragment: ufrag.substr(12),
        password: pwd.substr(10)
      };
    }; // Serializes ICE parameters to SDP.


    SDPUtils.writeIceParameters = function (params) {
      var sdp = 'a=ice-ufrag:' + params.usernameFragment + '\r\n' + 'a=ice-pwd:' + params.password + '\r\n';

      if (params.iceLite) {
        sdp += 'a=ice-lite\r\n';
      }

      return sdp;
    }; // Parses the SDP media section and returns RTCRtpParameters.


    SDPUtils.parseRtpParameters = function (mediaSection) {
      var description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      var lines = SDPUtils.splitLines(mediaSection);
      var mline = lines[0].split(' ');

      for (var i = 3; i < mline.length; i++) {
        // find all codecs from mline[3..]
        var pt = mline[i];
        var rtpmapline = SDPUtils.matchPrefix(mediaSection, 'a=rtpmap:' + pt + ' ')[0];

        if (rtpmapline) {
          var codec = SDPUtils.parseRtpMap(rtpmapline);
          var fmtps = SDPUtils.matchPrefix(mediaSection, 'a=fmtp:' + pt + ' '); // Only the first a=fmtp:<pt> is considered.

          codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-fb:' + pt + ' ').map(SDPUtils.parseRtcpFb);
          description.codecs.push(codec); // parse FEC mechanisms from rtpmap lines.

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
      }); // FIXME: parse rtcp.

      return description;
    }; // Generates parts of the SDP media section describing the capabilities /
    // parameters.


    SDPUtils.writeRtpDescription = function (kind, caps) {
      var sdp = ''; // Build the mline.

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
      sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n'; // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.

      caps.codecs.forEach(codec => {
        sdp += SDPUtils.writeRtpMap(codec);
        sdp += SDPUtils.writeFmtp(codec);
        sdp += SDPUtils.writeRtcpFb(codec);
      });
      var maxptime = 0;
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
      } // FIXME: write fecMechanisms.


      return sdp;
    }; // Parses the SDP media section and returns an array of
    // RTCRtpEncodingParameters.


    SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
      var encodingParameters = [];
      var description = SDPUtils.parseRtpParameters(mediaSection);
      var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
      var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1; // filter a=ssrc:... cname:, ignore PlanB-msid

      var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(line => SDPUtils.parseSsrcMedia(line)).filter(parts => parts.attribute === 'cname');
      var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      var secondarySsrc;
      var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID').map(line => {
        var parts = line.substr(17).split(' ');
        return parts.map(part => parseInt(part, 10));
      });

      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }

      description.codecs.forEach(codec => {
        if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
          var encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };

          if (primarySsrc && secondarySsrc) {
            encParam.rtx = {
              ssrc: secondarySsrc
            };
          }

          encodingParameters.push(encParam);

          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
            };
            encodingParameters.push(encParam);
          }
        }
      });

      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      } // we support both b=AS and b=TIAS but interpret AS as TIAS.


      var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');

      if (bandwidth.length) {
        if (bandwidth[0].indexOf('b=TIAS:') === 0) {
          bandwidth = parseInt(bandwidth[0].substr(7), 10);
        } else if (bandwidth[0].indexOf('b=AS:') === 0) {
          // use formula from JSEP to convert b=AS to TIAS value.
          bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = undefined;
        }

        encodingParameters.forEach(params => {
          params.maxBitrate = bandwidth;
        });
      }

      return encodingParameters;
    }; // parses http://draft.ortc.org/#rtcrtcpparameters*


    SDPUtils.parseRtcpParameters = function (mediaSection) {
      var rtcpParameters = {}; // Gets the first SSRC. Note that with RTX there might be multiple
      // SSRCs.

      var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(line => SDPUtils.parseSsrcMedia(line)).filter(obj => obj.attribute === 'cname')[0];

      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      } // Edge uses the compound attribute instead of reducedSize
      // compound is !reducedSize


      var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0; // parses the rtcp-mux attrіbute.
      // Note that Edge does not support unmuxed RTCP.

      var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };

    SDPUtils.writeRtcpParameters = function (rtcpParameters) {
      var sdp = '';

      if (rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }

      if (rtcpParameters.mux) {
        sdp += 'a=rtcp-mux\r\n';
      }

      if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
        sdp += 'a=ssrc:' + rtcpParameters.ssrc + ' cname:' + rtcpParameters.cname + '\r\n';
      }

      return sdp;
    }; // parses either a=msid: or a=ssrc:... msid lines and returns
    // the id of the MediaStream and MediaStreamTrack.


    SDPUtils.parseMsid = function (mediaSection) {
      var parts;
      var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');

      if (spec.length === 1) {
        parts = spec[0].substr(7).split(' ');
        return {
          stream: parts[0],
          track: parts[1]
        };
      }

      var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(line => SDPUtils.parseSsrcMedia(line)).filter(msidParts => msidParts.attribute === 'msid');

      if (planB.length > 0) {
        parts = planB[0].value.split(' ');
        return {
          stream: parts[0],
          track: parts[1]
        };
      }
    }; // SCTP
    // parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
    // to draft-ietf-mmusic-sctp-sdp-05


    SDPUtils.parseSctpDescription = function (mediaSection) {
      var mline = SDPUtils.parseMLine(mediaSection);
      var maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
      var maxMessageSize;

      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
      }

      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }

      var sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');

      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substr(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }

      var sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');

      if (sctpMapLines.length > 0) {
        var parts = sctpMapLines[0].substr(10).split(' ');
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    }; // SCTP
    // outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
    // support by now receiving in this format, unless we originally parsed
    // as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
    // protocol of DTLS/SCTP -- without UDP/ or TCP/)


    SDPUtils.writeSctpDescription = function (media, sctp) {
      var output = [];

      if (media.protocol !== 'DTLS/SCTP') {
        output = ['m=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n', 'c=IN IP4 0.0.0.0\r\n', 'a=sctp-port:' + sctp.port + '\r\n'];
      } else {
        output = ['m=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n', 'c=IN IP4 0.0.0.0\r\n', 'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n'];
      }

      if (sctp.maxMessageSize !== undefined) {
        output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
      }

      return output.join('');
    }; // Generate a session ID for SDP.
    // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
    // recommends using a cryptographically random +ve 64-bit value
    // but right now this should be acceptable and within the right range


    SDPUtils.generateSessionId = function () {
      return Math.random().toString().substr(2, 21);
    }; // Write boiler plate for start of SDP
    // sessId argument is optional - if not supplied it will
    // be generated randomly
    // sessVersion is optional and defaults to 2
    // sessUser is optional and defaults to 'thisisadapterortc'


    SDPUtils.writeSessionBoilerplate = function (sessId, sessVer, sessUser) {
      var sessionId;
      var version = sessVer !== undefined ? sessVer : 2;

      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils.generateSessionId();
      }

      var user = sessUser || 'thisisadapterortc'; // FIXME: sess-id should be an NTP timestamp.

      return 'v=0\r\n' + 'o=' + user + ' ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
    }; // Gets the direction from the mediaSection or the sessionpart.


    SDPUtils.getDirection = function (mediaSection, sessionpart) {
      // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
      var lines = SDPUtils.splitLines(mediaSection);

      for (var i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case 'a=sendrecv':
          case 'a=sendonly':
          case 'a=recvonly':
          case 'a=inactive':
            return lines[i].substr(2);

        }
      }

      if (sessionpart) {
        return SDPUtils.getDirection(sessionpart);
      }

      return 'sendrecv';
    };

    SDPUtils.getKind = function (mediaSection) {
      var lines = SDPUtils.splitLines(mediaSection);
      var mline = lines[0].split(' ');
      return mline[0].substr(2);
    };

    SDPUtils.isRejected = function (mediaSection) {
      return mediaSection.split(' ', 2)[1] === '0';
    };

    SDPUtils.parseMLine = function (mediaSection) {
      var lines = SDPUtils.splitLines(mediaSection);
      var parts = lines[0].substr(2).split(' ');
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(' ')
      };
    };

    SDPUtils.parseOLine = function (mediaSection) {
      var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
      var parts = line.substr(2).split(' ');
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    }; // a very naive interpretation of a valid SDP.


    SDPUtils.isValidSDP = function (blob) {
      if (typeof blob !== 'string' || blob.length === 0) {
        return false;
      }

      var lines = SDPUtils.splitLines(blob);

      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
          return false;
        } // TODO: check the modifier a bit more.

      }

      return true;
    }; // Expose public methods.


    {
      module.exports = SDPUtils;
    }
  })(sdp$1);

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
    if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;

    window.RTCIceCandidate = function RTCIceCandidate(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
        var nativeCandidate = new NativeRTCIceCandidate(args);
        var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
        var augmentedCandidate = Object.assign(nativeCandidate, parsedCandidate); // Add a serializer that does not serialize the extra attributes.

        augmentedCandidate.toJSON = function toJSON() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment
          };
        };

        return augmentedCandidate;
      }

      return new NativeRTCIceCandidate(args);
    };

    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype; // Hook up the augmented candidate in onicecandidate and
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

    var sctpInDescription = function sctpInDescription(description) {
      if (!description || !description.sdp) {
        return false;
      }

      var sections = SDPUtils.splitSections(description.sdp);
      sections.shift();
      return sections.some(mediaSection => {
        var mLine = SDPUtils.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);

      if (match === null || match.length < 2) {
        return -1;
      }

      var version = parseInt(match[1], 10); // Test for NaN (yes, this is ugly)

      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;

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
          canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
        } else {
          // FF >= 60 supports sending ~2 GiB
          canSendMaxMessageSize = 2147483637;
        }
      }

      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536; // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697

      if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');

      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }

      return maxMessageSize;
    };

    var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;

    window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      this._sctp = null; // Chrome decided to not expose .sctp in plan-b mode.
      // As usual, adapter.js has to do an 'ugly worakaround'
      // to cover up the mess.

      if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
        var {
          sdpSemantics
        } = this.getConfiguration();

        if (sdpSemantics === 'plan-b') {
          Object.defineProperty(this, 'sctp', {
            get() {
              return typeof this._sctp === 'undefined' ? null : this._sctp;
            },

            enumerable: true,
            configurable: true
          });
        }
      }

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]); // Get the maximum message size the local peer is capable of sending

        var canSendMMS = getCanSendMaxMessageSize(isFirefox); // Get the maximum message size of the remote peer.

        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox); // Determine final maximum message size

        var maxMessageSize;

        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        } // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.


        var sctp = {};
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
    if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
      return;
    } // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831


    function wrapDcSend(dc, pc) {
      var origDataChannelSend = dc.send;

      dc.send = function send() {
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;

        if (dc.readyState === 'open' && pc.sctp && length > pc.sctp.maxMessageSize) {
          throw new TypeError('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)');
        }

        return origDataChannelSend.apply(dc, arguments);
      };
    }

    var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;

    window.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
      var dataChannel = origCreateDataChannel.apply(this, arguments);
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
    if (!window.RTCPeerConnection || 'connectionState' in window.RTCPeerConnection.prototype) {
      return;
    }

    var proto = window.RTCPeerConnection.prototype;
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
          this.removeEventListener('connectionstatechange', this._onconnectionstatechange);
          delete this._onconnectionstatechange;
        }

        if (cb) {
          this.addEventListener('connectionstatechange', this._onconnectionstatechange = cb);
        }
      },

      enumerable: true,
      configurable: true
    });
    ['setLocalDescription', 'setRemoteDescription'].forEach(method => {
      var origMethod = proto[method];

      proto[method] = function () {
        if (!this._connectionstatechangepoly) {
          this._connectionstatechangepoly = e => {
            var pc = e.target;

            if (pc._lastConnectionState !== pc.connectionState) {
              pc._lastConnectionState = pc.connectionState;
              var newEvent = new Event('connectionstatechange', e);
              pc.dispatchEvent(newEvent);
            }

            return e;
          };

          this.addEventListener('iceconnectionstatechange', this._connectionstatechangepoly);
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

    var nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;

    window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
      if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
        var sdp = desc.sdp.split('\n').filter(line => {
          return line.trim() !== 'a=extmap-allow-mixed';
        }).join('\n'); // Safari enforces read-only-ness of RTCSessionDescription fields.

        if (window.RTCSessionDescription && desc instanceof window.RTCSessionDescription) {
          arguments[0] = new window.RTCSessionDescription({
            type: desc.type,
            sdp
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

    var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;

    if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
      return;
    }

    window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }

        return Promise.resolve();
      } // Firefox 68+ emits and processes {candidate: "", ...}, ignore
      // in older versions.
      // Native support for ignoring exists for Chrome M77+.
      // Safari ignores as well, exact version unknown but works in the same
      // version that also ignores addIceCandidate(null).


      if ((browserDetails.browser === 'chrome' && browserDetails.version < 78 || browserDetails.browser === 'firefox' && browserDetails.version < 68 || browserDetails.browser === 'safari') && arguments[0] && arguments[0].candidate === '') {
        return Promise.resolve();
      }

      return nativeAddIceCandidate.apply(this, arguments);
    };
  } // Note: Make sure to call this ahead of APIs that modify
  // setLocalDescription.length

  function shimParameterlessSetLocalDescription(window, browserDetails) {
    if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
      return;
    }

    var nativeSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;

    if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
      return;
    }

    window.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
      var desc = arguments[0] || {};

      if (typeof desc !== 'object' || desc.type && desc.sdp) {
        return nativeSetLocalDescription.apply(this, arguments);
      } // The remaining steps should technically happen when SLD comes off the
      // RTCPeerConnection's operations chain (not ahead of going on it), but
      // this is too difficult to shim. Instead, this shim only covers the
      // common case where the operations chain is empty. This is imperfect, but
      // should cover many cases. Rationale: Even if we can't reduce the glare
      // window to zero on imperfect implementations, there's value in tapping
      // into the perfect negotiation pattern that several browsers support.


      desc = {
        type: desc.type,
        sdp: desc.sdp
      };

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

      if (desc.sdp || desc.type !== 'offer' && desc.type !== 'answer') {
        return nativeSetLocalDescription.apply(this, [desc]);
      }

      var func = desc.type === 'offer' ? this.createOffer : this.createAnswer;
      return func.apply(this).then(d => nativeSetLocalDescription.apply(this, [d]));
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

  function adapterFactory() {
    var {
      window
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      shimChrome: true,
      shimFirefox: true,
      shimSafari: true
    };
    // Utils.
    var logging = log$1;
    var browserDetails = detectBrowser(window);
    var adapter = {
      browserDetails,
      commonShim,
      extractVersion: extractVersion,
      disableLog: disableLog,
      disableWarnings: disableWarnings,
      // Expose sdp as a convenience. For production apps include directly.
      sdp
    }; // Shim browser if found.

    switch (browserDetails.browser) {
      case 'chrome':
        if (!chromeShim || !shimPeerConnection$1 || !options.shimChrome) {
          logging('Chrome shim is not included in this adapter release.');
          return adapter;
        }

        if (browserDetails.version === null) {
          logging('Chrome shim can not determine version, not shimming.');
          return adapter;
        }

        logging('adapter.js shimming chrome.'); // Export to the adapter global object visible in the browser.

        adapter.browserShim = chromeShim; // Must be called before shimPeerConnection.

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
        if (!firefoxShim || !shimPeerConnection || !options.shimFirefox) {
          logging('Firefox shim is not included in this adapter release.');
          return adapter;
        }

        logging('adapter.js shimming firefox.'); // Export to the adapter global object visible in the browser.

        adapter.browserShim = firefoxShim; // Must be called before shimPeerConnection.

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

        logging('adapter.js shimming safari.'); // Export to the adapter global object visible in the browser.

        adapter.browserShim = safariShim; // Must be called before shimCallbackAPI.

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
  adapterFactory({
    window: typeof window === 'undefined' ? undefined : window
  });

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  var _assign = function __assign() {
    _assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    return _assign.apply(this, arguments);
  };

  function __rest(s, e) {
    var t = {};

    for (var p in s) {
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }

    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
  }

  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator,
        m = s && o[s],
        i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function next() {
        if (o && i >= o.length) o = void 0;
        return {
          value: o && o[i++],
          done: !o
        };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;

    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
        ar.push(r.value);
      }
    } catch (error) {
      e = {
        error: error
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }

    return ar;
  }

  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  var ActionTypes;

  (function (ActionTypes) {
    ActionTypes["Start"] = "xstate.start";
    ActionTypes["Stop"] = "xstate.stop";
    ActionTypes["Raise"] = "xstate.raise";
    ActionTypes["Send"] = "xstate.send";
    ActionTypes["Cancel"] = "xstate.cancel";
    ActionTypes["NullEvent"] = "";
    ActionTypes["Assign"] = "xstate.assign";
    ActionTypes["After"] = "xstate.after";
    ActionTypes["DoneState"] = "done.state";
    ActionTypes["DoneInvoke"] = "done.invoke";
    ActionTypes["Log"] = "xstate.log";
    ActionTypes["Init"] = "xstate.init";
    ActionTypes["Invoke"] = "xstate.invoke";
    ActionTypes["ErrorExecution"] = "error.execution";
    ActionTypes["ErrorCommunication"] = "error.communication";
    ActionTypes["ErrorPlatform"] = "error.platform";
    ActionTypes["ErrorCustom"] = "xstate.error";
    ActionTypes["Update"] = "xstate.update";
    ActionTypes["Pure"] = "xstate.pure";
    ActionTypes["Choose"] = "xstate.choose";
  })(ActionTypes || (ActionTypes = {}));

  var SpecialTargets;

  (function (SpecialTargets) {
    SpecialTargets["Parent"] = "#_parent";
    SpecialTargets["Internal"] = "#_internal";
  })(SpecialTargets || (SpecialTargets = {}));

  var start$1 = ActionTypes.Start;
  var stop$1 = ActionTypes.Stop;
  var raise$1 = ActionTypes.Raise;
  var send$1 = ActionTypes.Send;
  var cancel$1 = ActionTypes.Cancel;
  var nullEvent = ActionTypes.NullEvent;
  var assign$2 = ActionTypes.Assign;
  ActionTypes.After;
  ActionTypes.DoneState;
  var log = ActionTypes.Log;
  var init = ActionTypes.Init;
  var invoke = ActionTypes.Invoke;
  ActionTypes.ErrorExecution;
  var errorPlatform = ActionTypes.ErrorPlatform;
  var error$1 = ActionTypes.ErrorCustom;
  var update = ActionTypes.Update;
  var choose = ActionTypes.Choose;
  var pure = ActionTypes.Pure;

  var STATE_DELIMITER = '.';
  var EMPTY_ACTIVITY_MAP = {};
  var DEFAULT_GUARD_TYPE = 'xstate.guard';
  var TARGETLESS_KEY = '';

  var IS_PRODUCTION = browser$1.env.NODE_ENV === 'production';

  var _a;

  function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) {
      delimiter = STATE_DELIMITER;
    }

    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);

    if (isString(childStateValue)) {
      if (isString(parentStateValue)) {
        return childStateValue === parentStateValue;
      } // Parent more specific than child


      return false;
    }

    if (isString(parentStateValue)) {
      return parentStateValue in childStateValue;
    }

    return Object.keys(parentStateValue).every(function (key) {
      if (!(key in childStateValue)) {
        return false;
      }

      return matchesState(parentStateValue[key], childStateValue[key]);
    });
  }

  function getEventType(event) {
    try {
      return isString(event) || typeof event === 'number' ? "".concat(event) : event.type;
    } catch (e) {
      throw new Error('Events must be strings or objects with a string event.type property.');
    }
  }

  function toStatePath(stateId, delimiter) {
    try {
      if (isArray(stateId)) {
        return stateId;
      }

      return stateId.toString().split(delimiter);
    } catch (e) {
      throw new Error("'".concat(stateId, "' is not a valid state path."));
    }
  }

  function isStateLike(state) {
    return typeof state === 'object' && 'value' in state && 'context' in state && 'event' in state && '_event' in state;
  }

  function toStateValue(stateValue, delimiter) {
    if (isStateLike(stateValue)) {
      return stateValue.value;
    }

    if (isArray(stateValue)) {
      return pathToStateValue(stateValue);
    }

    if (typeof stateValue !== 'string') {
      return stateValue;
    }

    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
  }

  function pathToStateValue(statePath) {
    if (statePath.length === 1) {
      return statePath[0];
    }

    var value = {};
    var marker = value;

    for (var i = 0; i < statePath.length - 1; i++) {
      if (i === statePath.length - 2) {
        marker[statePath[i]] = statePath[i + 1];
      } else {
        marker[statePath[i]] = {};
        marker = marker[statePath[i]];
      }
    }

    return value;
  }

  function mapValues(collection, iteratee) {
    var result = {};
    var collectionKeys = Object.keys(collection);

    for (var i = 0; i < collectionKeys.length; i++) {
      var key = collectionKeys[i];
      result[key] = iteratee(collection[key], key, collection, i);
    }

    return result;
  }

  function mapFilterValues(collection, iteratee, predicate) {
    var e_1, _a;

    var result = {};

    try {
      for (var _b = __values(Object.keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var item = collection[key];

        if (!predicate(item)) {
          continue;
        }

        result[key] = iteratee(item, key, collection);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    return result;
  }
  /**
   * Retrieves a value at the given path.
   * @param props The deep path to the prop of the desired value
   */


  var path = function path(props) {
    return function (object) {
      var e_2, _a;

      var result = object;

      try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
          var prop = props_1_1.value;
          result = result[prop];
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
        } finally {
          if (e_2) throw e_2.error;
        }
      }

      return result;
    };
  };
  /**
   * Retrieves a value at the given path via the nested accessor prop.
   * @param props The deep path to the prop of the desired value
   */


  function nestedPath(props, accessorProp) {
    return function (object) {
      var e_3, _a;

      var result = object;

      try {
        for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
          var prop = props_2_1.value;
          result = result[accessorProp][prop];
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (props_2_1 && !props_2_1.done && (_a = props_2.return)) _a.call(props_2);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      return result;
    };
  }

  function toStatePaths(stateValue) {
    if (!stateValue) {
      return [[]];
    }

    if (isString(stateValue)) {
      return [[stateValue]];
    }

    var result = flatten(Object.keys(stateValue).map(function (key) {
      var subStateValue = stateValue[key];

      if (typeof subStateValue !== 'string' && (!subStateValue || !Object.keys(subStateValue).length)) {
        return [[key]];
      }

      return toStatePaths(stateValue[key]).map(function (subPath) {
        return [key].concat(subPath);
      });
    }));
    return result;
  }

  function flatten(array) {
    var _a;

    return (_a = []).concat.apply(_a, __spreadArray([], __read(array), false));
  }

  function toArrayStrict(value) {
    if (isArray(value)) {
      return value;
    }

    return [value];
  }

  function toArray(value) {
    if (value === undefined) {
      return [];
    }

    return toArrayStrict(value);
  }

  function mapContext(mapper, context, _event) {
    var e_5, _a;

    if (isFunction(mapper)) {
      return mapper(context, _event.data);
    }

    var result = {};

    try {
      for (var _b = __values(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var subMapper = mapper[key];

        if (isFunction(subMapper)) {
          result[key] = subMapper(context, _event.data);
        } else {
          result[key] = subMapper;
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_5) throw e_5.error;
      }
    }

    return result;
  }

  function isBuiltInEvent(eventType) {
    return /^(done|error)\./.test(eventType);
  }

  function isPromiseLike(value) {
    if (value instanceof Promise) {
      return true;
    } // Check if shape matches the Promise/A+ specification for a "thenable".


    if (value !== null && (isFunction(value) || typeof value === 'object') && isFunction(value.then)) {
      return true;
    }

    return false;
  }

  function isBehavior(value) {
    return value !== null && typeof value === 'object' && 'transition' in value && typeof value.transition === 'function';
  }

  function partition(items, predicate) {
    var e_6, _a;

    var _b = __read([[], []], 2),
        truthy = _b[0],
        falsy = _b[1];

    try {
      for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
        var item = items_1_1.value;

        if (predicate(item)) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }
    } catch (e_6_1) {
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
      } finally {
        if (e_6) throw e_6.error;
      }
    }

    return [truthy, falsy];
  }

  function updateHistoryStates(hist, stateValue) {
    return mapValues(hist.states, function (subHist, key) {
      if (!subHist) {
        return undefined;
      }

      var subStateValue = (isString(stateValue) ? undefined : stateValue[key]) || (subHist ? subHist.current : undefined);

      if (!subStateValue) {
        return undefined;
      }

      return {
        current: subStateValue,
        states: updateHistoryStates(subHist, subStateValue)
      };
    });
  }

  function updateHistoryValue(hist, stateValue) {
    return {
      current: stateValue,
      states: updateHistoryStates(hist, stateValue)
    };
  }

  function updateContext(context, _event, assignActions, state) {
    if (!IS_PRODUCTION) {
      warn(!!context, 'Attempting to update undefined context');
    }

    var updatedContext = context ? assignActions.reduce(function (acc, assignAction) {
      var e_7, _a;

      var assignment = assignAction.assignment;
      var meta = {
        state: state,
        action: assignAction,
        _event: _event
      };
      var partialUpdate = {};

      if (isFunction(assignment)) {
        partialUpdate = assignment(acc, _event.data, meta);
      } else {
        try {
          for (var _b = __values(Object.keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var propAssignment = assignment[key];
            partialUpdate[key] = isFunction(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
          }
        } catch (e_7_1) {
          e_7 = {
            error: e_7_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_7) throw e_7.error;
          }
        }
      }

      return Object.assign({}, acc, partialUpdate);
    }, context) : context;
    return updatedContext;
  } // tslint:disable-next-line:no-empty


  var warn = function warn() {};

  if (!IS_PRODUCTION) {
    warn = function warn(condition, message) {
      var error = condition instanceof Error ? condition : undefined;

      if (!error && condition) {
        return;
      }

      if (console !== undefined) {
        var args = ["Warning: ".concat(message)];

        if (error) {
          args.push(error);
        } // tslint:disable-next-line:no-console


        console.warn.apply(console, args);
      }
    };
  }

  function isArray(value) {
    return Array.isArray(value);
  } // tslint:disable-next-line:ban-types


  function isFunction(value) {
    return typeof value === 'function';
  }

  function isString(value) {
    return typeof value === 'string';
  }

  function toGuard(condition, guardMap) {
    if (!condition) {
      return undefined;
    }

    if (isString(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition,
        predicate: guardMap ? guardMap[condition] : undefined
      };
    }

    if (isFunction(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition.name,
        predicate: condition
      };
    }

    return condition;
  }

  function isObservable(value) {
    try {
      return 'subscribe' in value && isFunction(value.subscribe);
    } catch (e) {
      return false;
    }
  }

  var symbolObservable = /*#__PURE__*/function () {
    return typeof Symbol === 'function' && Symbol.observable || '@@observable';
  }(); // TODO: to be removed in v5, left it out just to minimize the scope of the change and maintain compatibility with older versions of integration paackages


  (_a = {}, _a[symbolObservable] = function () {
    return this;
  }, _a[Symbol.observable] = function () {
    return this;
  }, _a);

  function isMachine(value) {
    return !!value && '__xstatenode' in value;
  }

  function isActor$1(value) {
    return !!value && typeof value.send === 'function';
  }

  function toEventObject(event, payload // id?: TEvent['type']
  ) {
    if (isString(event) || typeof event === 'number') {
      return _assign({
        type: event
      }, payload);
    }

    return event;
  }

  function toSCXMLEvent(event, scxmlEvent) {
    if (!isString(event) && '$$type' in event && event.$$type === 'scxml') {
      return event;
    }

    var eventObject = toEventObject(event);
    return _assign({
      name: eventObject.type,
      data: eventObject,
      $$type: 'scxml',
      type: 'external'
    }, scxmlEvent);
  }

  function toTransitionConfigArray(event, configLike) {
    var transitions = toArrayStrict(configLike).map(function (transitionLike) {
      if (typeof transitionLike === 'undefined' || typeof transitionLike === 'string' || isMachine(transitionLike)) {
        return {
          target: transitionLike,
          event: event
        };
      }

      return _assign(_assign({}, transitionLike), {
        event: event
      });
    });
    return transitions;
  }

  function normalizeTarget(target) {
    if (target === undefined || target === TARGETLESS_KEY) {
      return undefined;
    }

    return toArray(target);
  }

  function reportUnhandledExceptionOnInvocation(originalError, currentError, id) {
    if (!IS_PRODUCTION) {
      var originalStackTrace = originalError.stack ? " Stacktrace was '".concat(originalError.stack, "'") : '';

      if (originalError === currentError) {
        // tslint:disable-next-line:no-console
        console.error("Missing onError handler for invocation '".concat(id, "', error was '").concat(originalError, "'.").concat(originalStackTrace));
      } else {
        var stackTrace = currentError.stack ? " Stacktrace was '".concat(currentError.stack, "'") : ''; // tslint:disable-next-line:no-console

        console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '".concat(id, "'. ") + "Original error: '".concat(originalError, "'. ").concat(originalStackTrace, " Current error is '").concat(currentError, "'.").concat(stackTrace));
      }
    }
  }

  function evaluateGuard(machine, guard, context, _event, state) {
    var guards = machine.options.guards;
    var guardMeta = {
      state: state,
      cond: guard,
      _event: _event
    }; // TODO: do not hardcode!

    if (guard.type === DEFAULT_GUARD_TYPE) {
      return ((guards === null || guards === void 0 ? void 0 : guards[guard.name]) || guard.predicate)(context, _event.data, guardMeta);
    }

    var condFn = guards === null || guards === void 0 ? void 0 : guards[guard.type];

    if (!condFn) {
      throw new Error("Guard '".concat(guard.type, "' is not implemented on machine '").concat(machine.id, "'."));
    }

    return condFn(context, _event.data, guardMeta);
  }

  function toInvokeSource$1(src) {
    if (typeof src === 'string') {
      return {
        type: src
      };
    }

    return src;
  }

  function toObserver(nextHandler, errorHandler, completionHandler) {
    var noop = function noop() {};

    var isObserver = typeof nextHandler === 'object';
    var self = isObserver ? nextHandler : null;
    return {
      next: ((isObserver ? nextHandler.next : nextHandler) || noop).bind(self),
      error: ((isObserver ? nextHandler.error : errorHandler) || noop).bind(self),
      complete: ((isObserver ? nextHandler.complete : completionHandler) || noop).bind(self)
    };
  }

  function createInvokeId(stateNodeId, index) {
    return "".concat(stateNodeId, ":invocation[").concat(index, "]");
  }

  var initEvent = /*#__PURE__*/toSCXMLEvent({
    type: init
  });

  function getActionFunction(actionType, actionFunctionMap) {
    return actionFunctionMap ? actionFunctionMap[actionType] || undefined : undefined;
  }

  function toActionObject(action, actionFunctionMap) {
    var actionObject;

    if (isString(action) || typeof action === 'number') {
      var exec = getActionFunction(action, actionFunctionMap);

      if (isFunction(exec)) {
        actionObject = {
          type: action,
          exec: exec
        };
      } else if (exec) {
        actionObject = exec;
      } else {
        actionObject = {
          type: action,
          exec: undefined
        };
      }
    } else if (isFunction(action)) {
      actionObject = {
        // Convert action to string if unnamed
        type: action.name || action.toString(),
        exec: action
      };
    } else {
      var exec = getActionFunction(action.type, actionFunctionMap);

      if (isFunction(exec)) {
        actionObject = _assign(_assign({}, action), {
          exec: exec
        });
      } else if (exec) {
        var actionType = exec.type || action.type;
        actionObject = _assign(_assign(_assign({}, exec), action), {
          type: actionType
        });
      } else {
        actionObject = action;
      }
    }

    return actionObject;
  }

  var toActionObjects = function toActionObjects(action, actionFunctionMap) {
    if (!action) {
      return [];
    }

    var actions = isArray(action) ? action : [action];
    return actions.map(function (subAction) {
      return toActionObject(subAction, actionFunctionMap);
    });
  };

  function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return _assign(_assign({
      id: isString(action) ? action : actionObject.id
    }, actionObject), {
      type: actionObject.type
    });
  }
  /**
   * Raises an event. This places the event in the internal event queue, so that
   * the event is immediately consumed by the machine in the current step.
   *
   * @param eventType The event to raise.
   */


  function raise(event) {
    if (!isString(event)) {
      return send(event, {
        to: SpecialTargets.Internal
      });
    }

    return {
      type: raise$1,
      event: event
    };
  }

  function resolveRaise(action) {
    return {
      type: raise$1,
      _event: toSCXMLEvent(action.event)
    };
  }
  /**
   * Sends an event. This returns an action that will be read by an interpreter to
   * send the event in the next step, after the current step is finished executing.
   *
   * @param event The event to send.
   * @param options Options to pass into the send event:
   *  - `id` - The unique send event identifier (used with `cancel()`).
   *  - `delay` - The number of milliseconds to delay the sending of the event.
   *  - `to` - The target of this event (by default, the machine the event was sent from).
   */


  function send(event, options) {
    return {
      to: options ? options.to : undefined,
      type: send$1,
      event: isFunction(event) ? event : toEventObject(event),
      delay: options ? options.delay : undefined,
      id: options && options.id !== undefined ? options.id : isFunction(event) ? event.name : getEventType(event)
    };
  }

  function resolveSend(action, ctx, _event, delaysMap) {
    var meta = {
      _event: _event
    }; // TODO: helper function for resolving Expr

    var resolvedEvent = toSCXMLEvent(isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
    var resolvedDelay;

    if (isString(action.delay)) {
      var configDelay = delaysMap && delaysMap[action.delay];
      resolvedDelay = isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
    } else {
      resolvedDelay = isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
    }

    var resolvedTarget = isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
    return _assign(_assign({}, action), {
      to: resolvedTarget,
      _event: resolvedEvent,
      event: resolvedEvent.data,
      delay: resolvedDelay
    });
  }

  var resolveLog = function resolveLog(action, ctx, _event) {
    return _assign(_assign({}, action), {
      value: isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
        _event: _event
      })
    });
  };
  /**
   * Cancels an in-flight `send(...)` action. A canceled sent action will not
   * be executed, nor will its event be sent, unless it has already been sent
   * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
   *
   * @param sendId The `id` of the `send(...)` action to cancel.
   */


  var cancel = function cancel(sendId) {
    return {
      type: cancel$1,
      sendId: sendId
    };
  };
  /**
   * Starts an activity.
   *
   * @param activity The activity to start.
   */


  function start(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
      type: ActionTypes.Start,
      activity: activityDef,
      exec: undefined
    };
  }
  /**
   * Stops an activity.
   *
   * @param actorRef The activity to stop.
   */


  function stop(actorRef) {
    var activity = isFunction(actorRef) ? actorRef : toActivityDefinition(actorRef);
    return {
      type: ActionTypes.Stop,
      activity: activity,
      exec: undefined
    };
  }

  function resolveStop(action, context, _event) {
    var actorRefOrString = isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
    var resolvedActorRef = typeof actorRefOrString === 'string' ? {
      id: actorRefOrString
    } : actorRefOrString;
    var actionObject = {
      type: ActionTypes.Stop,
      activity: resolvedActorRef
    };
    return actionObject;
  }
  /**
   * Updates the current context of the machine.
   *
   * @param assignment An object that represents the partial context to update.
   */


  var assign$1 = function assign(assignment) {
    return {
      type: assign$2,
      assignment: assignment
    };
  };
  /**
   * Returns an event type that represents an implicit event that
   * is sent after the specified `delay`.
   *
   * @param delayRef The delay in milliseconds
   * @param id The state node ID where this event is handled
   */


  function after(delayRef, id) {
    var idSuffix = id ? "#".concat(id) : '';
    return "".concat(ActionTypes.After, "(").concat(delayRef, ")").concat(idSuffix);
  }
  /**
   * Returns an event that represents that a final state node
   * has been reached in the parent state node.
   *
   * @param id The final state node's parent state node `id`
   * @param data The data to pass into the event
   */


  function done(id, data) {
    var type = "".concat(ActionTypes.DoneState, ".").concat(id);
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }
  /**
   * Returns an event that represents that an invoked service has terminated.
   *
   * An invoked service is terminated when it has reached a top-level final state node,
   * but not when it is canceled.
   *
   * @param id The final state node ID
   * @param data The data to pass into the event
   */


  function doneInvoke(id, data) {
    var type = "".concat(ActionTypes.DoneInvoke, ".").concat(id);
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }

  function error(id, data) {
    var type = "".concat(ActionTypes.ErrorPlatform, ".").concat(id);
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }

  function resolveActions(machine, currentState, currentContext, _event, actions, predictableExec, preserveActionOrder) {
    if (preserveActionOrder === void 0) {
      preserveActionOrder = false;
    }

    var _a = __read(preserveActionOrder ? [[], actions] : partition(actions, function (action) {
      return action.type === assign$2;
    }), 2),
        assignActions = _a[0],
        otherActions = _a[1];

    var updatedContext = assignActions.length ? updateContext(currentContext, _event, assignActions, currentState) : currentContext;
    var preservedContexts = preserveActionOrder ? [currentContext] : undefined;
    var resolvedActions = flatten(otherActions.map(function (actionObject) {
      var _a;

      switch (actionObject.type) {
        case raise$1:
          {
            return resolveRaise(actionObject);
          }

        case send$1:
          var sendAction = resolveSend(actionObject, updatedContext, _event, machine.options.delays); // TODO: fix ActionTypes.Init

          if (!IS_PRODUCTION) {
            // warn after resolving as we can create better contextual message here
            warn(!isString(actionObject.delay) || typeof sendAction.delay === 'number', // tslint:disable-next-line:max-line-length
            "No delay reference for delay expression '".concat(actionObject.delay, "' was found on machine '").concat(machine.id, "'"));
          }

          if (sendAction.to !== SpecialTargets.Internal) {
            predictableExec === null || predictableExec === void 0 ? void 0 : predictableExec(sendAction, updatedContext, _event);
          }

          return sendAction;

        case log:
          {
            var resolved = resolveLog(actionObject, updatedContext, _event);
            predictableExec === null || predictableExec === void 0 ? void 0 : predictableExec(resolved, updatedContext, _event);
            return resolved;
          }

        case choose:
          {
            var chooseAction = actionObject;
            var matchedActions = (_a = chooseAction.conds.find(function (condition) {
              var guard = toGuard(condition.cond, machine.options.guards);
              return !guard || evaluateGuard(machine, guard, updatedContext, _event, !predictableExec ? currentState : undefined);
            })) === null || _a === void 0 ? void 0 : _a.actions;

            if (!matchedActions) {
              return [];
            }

            var _b = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), predictableExec, preserveActionOrder), 2),
                resolvedActionsFromChoose = _b[0],
                resolvedContextFromChoose = _b[1];

            updatedContext = resolvedContextFromChoose;
            preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
            return resolvedActionsFromChoose;
          }

        case pure:
          {
            var matchedActions = actionObject.get(updatedContext, _event.data);

            if (!matchedActions) {
              return [];
            }

            var _c = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), predictableExec, preserveActionOrder), 2),
                resolvedActionsFromPure = _c[0],
                resolvedContext = _c[1];

            updatedContext = resolvedContext;
            preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
            return resolvedActionsFromPure;
          }

        case stop$1:
          {
            var resolved = resolveStop(actionObject, updatedContext, _event);
            predictableExec === null || predictableExec === void 0 ? void 0 : predictableExec(resolved, updatedContext, _event);
            return resolved;
          }

        case assign$2:
          {
            updatedContext = updateContext(updatedContext, _event, [actionObject], !predictableExec ? currentState : undefined);
            preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
            break;
          }

        default:
          var resolvedActionObject = toActionObject(actionObject, machine.options.actions);
          var exec_1 = resolvedActionObject.exec;

          if (predictableExec) {
            predictableExec(resolvedActionObject, updatedContext, _event);
          } else if (exec_1 && preservedContexts) {
            var contextIndex_1 = preservedContexts.length - 1;
            resolvedActionObject = _assign(_assign({}, resolvedActionObject), {
              exec: function exec(_ctx) {
                var args = [];

                for (var _i = 1; _i < arguments.length; _i++) {
                  args[_i - 1] = arguments[_i];
                }

                exec_1.apply(void 0, __spreadArray([preservedContexts[contextIndex_1]], __read(args), false));
              }
            });
          }

          return resolvedActionObject;
      }
    }).filter(function (a) {
      return !!a;
    }));
    return [resolvedActions, updatedContext];
  }

  /**
   * Maintains a stack of the current service in scope.
   * This is used to provide the correct service to spawn().
   */

  var provide = function provide(service, fn) {
    var result = fn(service);
    return result;
  };

  function createNullActor(id) {
    var _a;

    return _a = {
      id: id,
      send: function send() {
        return void 0;
      },
      subscribe: function subscribe() {
        return {
          unsubscribe: function unsubscribe() {
            return void 0;
          }
        };
      },
      getSnapshot: function getSnapshot() {
        return undefined;
      },
      toJSON: function toJSON() {
        return {
          id: id
        };
      }
    }, _a[symbolObservable] = function () {
      return this;
    }, _a;
  }
  /**
   * Creates a deferred actor that is able to be invoked given the provided
   * invocation information in its `.meta` value.
   *
   * @param invokeDefinition The meta information needed to invoke the actor.
   */


  function createInvocableActor(invokeDefinition, machine, context, _event) {
    var _a;

    var invokeSrc = toInvokeSource$1(invokeDefinition.src);
    var serviceCreator = (_a = machine === null || machine === void 0 ? void 0 : machine.options.services) === null || _a === void 0 ? void 0 : _a[invokeSrc.type];
    var resolvedData = invokeDefinition.data ? mapContext(invokeDefinition.data, context, _event) : undefined;
    var tempActor = serviceCreator ? createDeferredActor(serviceCreator, invokeDefinition.id, resolvedData) : createNullActor(invokeDefinition.id); // @ts-ignore

    tempActor.meta = invokeDefinition;
    return tempActor;
  }

  function createDeferredActor(entity, id, data) {
    var tempActor = createNullActor(id); // @ts-ignore

    tempActor.deferred = true;

    if (isMachine(entity)) {
      // "mute" the existing service scope so potential spawned actors within the `.initialState` stay deferred here
      var initialState_1 = tempActor.state = provide(undefined, function () {
        return (data ? entity.withContext(data) : entity).initialState;
      });

      tempActor.getSnapshot = function () {
        return initialState_1;
      };
    }

    return tempActor;
  }

  function isActor(item) {
    try {
      return typeof item.send === 'function';
    } catch (e) {
      return false;
    }
  }

  function isSpawnedActor(item) {
    return isActor(item) && 'id' in item;
  } // TODO: refactor the return type, this could be written in a better way but it's best to avoid unneccessary breaking changes now


  function toActorRef(actorRefLike) {
    var _a;

    return _assign((_a = {
      subscribe: function subscribe() {
        return {
          unsubscribe: function unsubscribe() {
            return void 0;
          }
        };
      },
      id: 'anonymous',
      getSnapshot: function getSnapshot() {
        return undefined;
      }
    }, _a[symbolObservable] = function () {
      return this;
    }, _a), actorRefLike);
  }

  var isLeafNode = function isLeafNode(stateNode) {
    return stateNode.type === 'atomic' || stateNode.type === 'final';
  };

  function getAllChildren(stateNode) {
    return Object.keys(stateNode.states).map(function (key) {
      return stateNode.states[key];
    });
  }

  function getChildren(stateNode) {
    return getAllChildren(stateNode).filter(function (sn) {
      return sn.type !== 'history';
    });
  }

  function getAllStateNodes(stateNode) {
    var stateNodes = [stateNode];

    if (isLeafNode(stateNode)) {
      return stateNodes;
    }

    return stateNodes.concat(flatten(getChildren(stateNode).map(getAllStateNodes)));
  }

  function getConfiguration(prevStateNodes, stateNodes) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;

    var prevConfiguration = new Set(prevStateNodes);
    var prevAdjList = getAdjList(prevConfiguration);
    var configuration = new Set(stateNodes);

    try {
      // add all ancestors
      for (var configuration_1 = __values(configuration), configuration_1_1 = configuration_1.next(); !configuration_1_1.done; configuration_1_1 = configuration_1.next()) {
        var s = configuration_1_1.value;
        var m = s.parent;

        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (configuration_1_1 && !configuration_1_1.done && (_a = configuration_1.return)) _a.call(configuration_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    var adjList = getAdjList(configuration);

    try {
      // add descendants
      for (var configuration_2 = __values(configuration), configuration_2_1 = configuration_2.next(); !configuration_2_1.done; configuration_2_1 = configuration_2.next()) {
        var s = configuration_2_1.value; // if previously active, add existing child nodes

        if (s.type === 'compound' && (!adjList.get(s) || !adjList.get(s).length)) {
          if (prevAdjList.get(s)) {
            prevAdjList.get(s).forEach(function (sn) {
              return configuration.add(sn);
            });
          } else {
            s.initialStateNodes.forEach(function (sn) {
              return configuration.add(sn);
            });
          }
        } else {
          if (s.type === 'parallel') {
            try {
              for (var _e = (e_3 = void 0, __values(getChildren(s))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;

                if (!configuration.has(child)) {
                  configuration.add(child);

                  if (prevAdjList.get(child)) {
                    prevAdjList.get(child).forEach(function (sn) {
                      return configuration.add(sn);
                    });
                  } else {
                    child.initialStateNodes.forEach(function (sn) {
                      return configuration.add(sn);
                    });
                  }
                }
              }
            } catch (e_3_1) {
              e_3 = {
                error: e_3_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_c = _e.return)) _c.call(_e);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (configuration_2_1 && !configuration_2_1.done && (_b = configuration_2.return)) _b.call(configuration_2);
      } finally {
        if (e_2) throw e_2.error;
      }
    }

    try {
      // add all ancestors
      for (var configuration_3 = __values(configuration), configuration_3_1 = configuration_3.next(); !configuration_3_1.done; configuration_3_1 = configuration_3.next()) {
        var s = configuration_3_1.value;
        var m = s.parent;

        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_4_1) {
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (configuration_3_1 && !configuration_3_1.done && (_d = configuration_3.return)) _d.call(configuration_3);
      } finally {
        if (e_4) throw e_4.error;
      }
    }

    return configuration;
  }

  function getValueFromAdj(baseNode, adjList) {
    var childStateNodes = adjList.get(baseNode);

    if (!childStateNodes) {
      return {}; // todo: fix?
    }

    if (baseNode.type === 'compound') {
      var childStateNode = childStateNodes[0];

      if (childStateNode) {
        if (isLeafNode(childStateNode)) {
          return childStateNode.key;
        }
      } else {
        return {};
      }
    }

    var stateValue = {};
    childStateNodes.forEach(function (csn) {
      stateValue[csn.key] = getValueFromAdj(csn, adjList);
    });
    return stateValue;
  }

  function getAdjList(configuration) {
    var e_5, _a;

    var adjList = new Map();

    try {
      for (var configuration_4 = __values(configuration), configuration_4_1 = configuration_4.next(); !configuration_4_1.done; configuration_4_1 = configuration_4.next()) {
        var s = configuration_4_1.value;

        if (!adjList.has(s)) {
          adjList.set(s, []);
        }

        if (s.parent) {
          if (!adjList.has(s.parent)) {
            adjList.set(s.parent, []);
          }

          adjList.get(s.parent).push(s);
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (configuration_4_1 && !configuration_4_1.done && (_a = configuration_4.return)) _a.call(configuration_4);
      } finally {
        if (e_5) throw e_5.error;
      }
    }

    return adjList;
  }

  function getValue(rootNode, configuration) {
    var config = getConfiguration([rootNode], configuration);
    return getValueFromAdj(rootNode, getAdjList(config));
  }

  function has(iterable, item) {
    if (Array.isArray(iterable)) {
      return iterable.some(function (member) {
        return member === item;
      });
    }

    if (iterable instanceof Set) {
      return iterable.has(item);
    }

    return false; // TODO: fix
  }

  function nextEvents(configuration) {
    return __spreadArray([], __read(new Set(flatten(__spreadArray([], __read(configuration.map(function (sn) {
      return sn.ownEvents;
    })), false)))), false);
  }

  function isInFinalState(configuration, stateNode) {
    if (stateNode.type === 'compound') {
      return getChildren(stateNode).some(function (s) {
        return s.type === 'final' && has(configuration, s);
      });
    }

    if (stateNode.type === 'parallel') {
      return getChildren(stateNode).every(function (sn) {
        return isInFinalState(configuration, sn);
      });
    }

    return false;
  }

  function getMeta(configuration) {
    if (configuration === void 0) {
      configuration = [];
    }

    return configuration.reduce(function (acc, stateNode) {
      if (stateNode.meta !== undefined) {
        acc[stateNode.id] = stateNode.meta;
      }

      return acc;
    }, {});
  }

  function getTagsFromConfiguration(configuration) {
    return new Set(flatten(configuration.map(function (sn) {
      return sn.tags;
    })));
  }

  function stateValuesEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (a === undefined || b === undefined) {
      return false;
    }

    if (isString(a) || isString(b)) {
      return a === b;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every(function (key) {
      return stateValuesEqual(a[key], b[key]);
    });
  }

  function isStateConfig(state) {
    if (typeof state !== 'object' || state === null) {
      return false;
    }

    return 'value' in state && '_event' in state;
  }

  function bindActionToState(action, state) {
    var exec = action.exec;

    var boundAction = _assign(_assign({}, action), {
      exec: exec !== undefined ? function () {
        return exec(state.context, state.event, {
          action: action,
          state: state,
          _event: state._event
        });
      } : undefined
    });

    return boundAction;
  }

  var State =
  /*#__PURE__*/

  /** @class */
  function () {
    /**
     * Creates a new State instance.
     * @param value The state value
     * @param context The extended state
     * @param historyValue The tree representing historical values of the state nodes
     * @param history The previous state
     * @param actions An array of action objects to execute as side-effects
     * @param activities A mapping of activities and whether they are started (`true`) or stopped (`false`).
     * @param meta
     * @param events Internal event queue. Should be empty with run-to-completion semantics.
     * @param configuration
     */
    function State(config) {
      var _this = this;

      var _a;

      this.actions = [];
      this.activities = EMPTY_ACTIVITY_MAP;
      this.meta = {};
      this.events = [];
      this.value = config.value;
      this.context = config.context;
      this._event = config._event;
      this._sessionid = config._sessionid;
      this.event = this._event.data;
      this.historyValue = config.historyValue;
      this.history = config.history;
      this.actions = config.actions || [];
      this.activities = config.activities || EMPTY_ACTIVITY_MAP;
      this.meta = getMeta(config.configuration);
      this.events = config.events || [];
      this.matches = this.matches.bind(this);
      this.toStrings = this.toStrings.bind(this);
      this.configuration = config.configuration;
      this.transitions = config.transitions;
      this.children = config.children;
      this.done = !!config.done;
      this.tags = (_a = Array.isArray(config.tags) ? new Set(config.tags) : config.tags) !== null && _a !== void 0 ? _a : new Set();
      this.machine = config.machine;
      Object.defineProperty(this, 'nextEvents', {
        get: function get() {
          return nextEvents(_this.configuration);
        }
      });
    }
    /**
     * Creates a new State instance for the given `stateValue` and `context`.
     * @param stateValue
     * @param context
     */


    State.from = function (stateValue, context) {
      if (stateValue instanceof State) {
        if (stateValue.context !== context) {
          return new State({
            value: stateValue.value,
            context: context,
            _event: stateValue._event,
            _sessionid: null,
            historyValue: stateValue.historyValue,
            history: stateValue.history,
            actions: [],
            activities: stateValue.activities,
            meta: {},
            events: [],
            configuration: [],
            transitions: [],
            children: {}
          });
        }

        return stateValue;
      }

      var _event = initEvent;
      return new State({
        value: stateValue,
        context: context,
        _event: _event,
        _sessionid: null,
        historyValue: undefined,
        history: undefined,
        actions: [],
        activities: undefined,
        meta: undefined,
        events: [],
        configuration: [],
        transitions: [],
        children: {}
      });
    };
    /**
     * Creates a new State instance for the given `config`.
     * @param config The state config
     */


    State.create = function (config) {
      return new State(config);
    };
    /**
     * Creates a new `State` instance for the given `stateValue` and `context` with no actions (side-effects).
     * @param stateValue
     * @param context
     */


    State.inert = function (stateValue, context) {
      if (stateValue instanceof State) {
        if (!stateValue.actions.length) {
          return stateValue;
        }

        var _event = initEvent;
        return new State({
          value: stateValue.value,
          context: context,
          _event: _event,
          _sessionid: null,
          historyValue: stateValue.historyValue,
          history: stateValue.history,
          activities: stateValue.activities,
          configuration: stateValue.configuration,
          transitions: [],
          children: {}
        });
      }

      return State.from(stateValue, context);
    };
    /**
     * Returns an array of all the string leaf state node paths.
     * @param stateValue
     * @param delimiter The character(s) that separate each subpath in the string state node path.
     */


    State.prototype.toStrings = function (stateValue, delimiter) {
      var _this = this;

      if (stateValue === void 0) {
        stateValue = this.value;
      }

      if (delimiter === void 0) {
        delimiter = '.';
      }

      if (isString(stateValue)) {
        return [stateValue];
      }

      var valueKeys = Object.keys(stateValue);
      return valueKeys.concat.apply(valueKeys, __spreadArray([], __read(valueKeys.map(function (key) {
        return _this.toStrings(stateValue[key], delimiter).map(function (s) {
          return key + delimiter + s;
        });
      })), false));
    };

    State.prototype.toJSON = function () {
      var _a = this;

      _a.configuration;
      _a.transitions;
      var tags = _a.tags;
      _a.machine;

      var jsonValues = __rest(_a, ["configuration", "transitions", "tags", "machine"]);

      return _assign(_assign({}, jsonValues), {
        tags: Array.from(tags)
      });
    };

    State.prototype.matches = function (parentStateValue) {
      return matchesState(parentStateValue, this.value);
    };
    /**
     * Whether the current state configuration has a state node with the specified `tag`.
     * @param tag
     */


    State.prototype.hasTag = function (tag) {
      return this.tags.has(tag);
    };
    /**
     * Determines whether sending the `event` will cause a non-forbidden transition
     * to be selected, even if the transitions have no actions nor
     * change the state value.
     *
     * @param event The event to test
     * @returns Whether the event will cause a transition
     */


    State.prototype.can = function (event) {
      var _a;

      if (IS_PRODUCTION) {
        warn(!!this.machine, "state.can(...) used outside of a machine-created State object; this will always return false.");
      }

      var transitionData = (_a = this.machine) === null || _a === void 0 ? void 0 : _a.getTransitionData(this, event);
      return !!(transitionData === null || transitionData === void 0 ? void 0 : transitionData.transitions.length) && // Check that at least one transition is not forbidden
      transitionData.transitions.some(function (t) {
        return t.target !== undefined || t.actions.length;
      });
    };

    return State;
  }();

  var defaultOptions = {
    deferEvents: false
  };

  var Scheduler =
  /*#__PURE__*/

  /** @class */
  function () {
    function Scheduler(options) {
      this.processingEvent = false;
      this.queue = [];
      this.initialized = false;
      this.options = _assign(_assign({}, defaultOptions), options);
    }

    Scheduler.prototype.initialize = function (callback) {
      this.initialized = true;

      if (callback) {
        if (!this.options.deferEvents) {
          this.schedule(callback);
          return;
        }

        this.process(callback);
      }

      this.flushEvents();
    };

    Scheduler.prototype.schedule = function (task) {
      if (!this.initialized || this.processingEvent) {
        this.queue.push(task);
        return;
      }

      if (this.queue.length !== 0) {
        throw new Error('Event queue should be empty when it is not processing events');
      }

      this.process(task);
      this.flushEvents();
    };

    Scheduler.prototype.clear = function () {
      this.queue = [];
    };

    Scheduler.prototype.flushEvents = function () {
      var nextCallback = this.queue.shift();

      while (nextCallback) {
        this.process(nextCallback);
        nextCallback = this.queue.shift();
      }
    };

    Scheduler.prototype.process = function (callback) {
      this.processingEvent = true;

      try {
        callback();
      } catch (e) {
        // there is no use to keep the future events
        // as the situation is not anymore the same
        this.clear();
        throw e;
      } finally {
        this.processingEvent = false;
      }
    };

    return Scheduler;
  }();

  var children = /*#__PURE__*/new Map();
  var sessionIdIndex = 0;
  var registry = {
    bookId: function bookId() {
      return "x:".concat(sessionIdIndex++);
    },
    register: function register(id, actor) {
      children.set(id, actor);
      return id;
    },
    get: function get(id) {
      return children.get(id);
    },
    free: function free(id) {
      children.delete(id);
    }
  };

  function getGlobal() {
    if (typeof globalThis !== 'undefined') {
      return globalThis;
    }

    if (typeof self !== 'undefined') {
      return self;
    }

    if (typeof window !== 'undefined') {
      return window;
    }

    if (typeof global$1 !== 'undefined') {
      return global$1;
    }

    if (!IS_PRODUCTION) {
      console.warn('XState could not find a global object in this environment. Please let the maintainers know and raise an issue here: https://github.com/statelyai/xstate/issues');
    }
  }

  function getDevTools() {
    var global = getGlobal();

    if (global && '__xstate__' in global) {
      return global.__xstate__;
    }

    return undefined;
  }

  function registerService(service) {
    if (!getGlobal()) {
      return;
    }

    var devTools = getDevTools();

    if (devTools) {
      devTools.register(service);
    }
  }

  function spawnBehavior(behavior, options) {
    if (options === void 0) {
      options = {};
    }

    var state = behavior.initialState;
    var observers = new Set();
    var mailbox = [];
    var flushing = false;

    var flush = function flush() {
      if (flushing) {
        return;
      }

      flushing = true;

      while (mailbox.length > 0) {
        var event_1 = mailbox.shift();
        state = behavior.transition(state, event_1, actorCtx);
        observers.forEach(function (observer) {
          return observer.next(state);
        });
      }

      flushing = false;
    };

    var actor = toActorRef({
      id: options.id,
      send: function send(event) {
        mailbox.push(event);
        flush();
      },
      getSnapshot: function getSnapshot() {
        return state;
      },
      subscribe: function subscribe(next, handleError, complete) {
        var observer = toObserver(next, handleError, complete);
        observers.add(observer);
        observer.next(state);
        return {
          unsubscribe: function unsubscribe() {
            observers.delete(observer);
          }
        };
      }
    });
    var actorCtx = {
      parent: options.parent,
      self: actor,
      id: options.id || 'anonymous',
      observers: observers
    };
    state = behavior.start ? behavior.start(actorCtx) : state;
    return actor;
  }

  var DEFAULT_SPAWN_OPTIONS = {
    sync: false,
    autoForward: false
  };
  var InterpreterStatus;

  (function (InterpreterStatus) {
    InterpreterStatus[InterpreterStatus["NotStarted"] = 0] = "NotStarted";
    InterpreterStatus[InterpreterStatus["Running"] = 1] = "Running";
    InterpreterStatus[InterpreterStatus["Stopped"] = 2] = "Stopped";
  })(InterpreterStatus || (InterpreterStatus = {}));

  var Interpreter =
  /*#__PURE__*/

  /** @class */
  function () {
    /**
     * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
     *
     * @param machine The machine to be interpreted
     * @param options Interpreter options
     */
    function Interpreter(machine, options) {
      var _this = this;

      if (options === void 0) {
        options = Interpreter.defaultOptions;
      }

      this.machine = machine;
      this.delayedEventsMap = {};
      this.listeners = new Set();
      this.contextListeners = new Set();
      this.stopListeners = new Set();
      this.doneListeners = new Set();
      this.eventListeners = new Set();
      this.sendListeners = new Set();
      /**
       * Whether the service is started.
       */

      this.initialized = false;
      this.status = InterpreterStatus.NotStarted;
      this.children = new Map();
      this.forwardTo = new Set();
      /**
       * Alias for Interpreter.prototype.start
       */

      this.init = this.start;
      /**
       * Sends an event to the running interpreter to trigger a transition.
       *
       * An array of events (batched) can be sent as well, which will send all
       * batched events to the running interpreter. The listeners will be
       * notified only **once** when all events are processed.
       *
       * @param event The event(s) to send
       */

      this.send = function (event, payload) {
        if (isArray(event)) {
          _this.batch(event);

          return _this.state;
        }

        var _event = toSCXMLEvent(toEventObject(event, payload));

        if (_this.status === InterpreterStatus.Stopped) {
          // do nothing
          if (!IS_PRODUCTION) {
            warn(false, "Event \"".concat(_event.name, "\" was sent to stopped service \"").concat(_this.machine.id, "\". This service has already reached its final state, and will not transition.\nEvent: ").concat(JSON.stringify(_event.data)));
          }

          return _this.state;
        }

        if (_this.status !== InterpreterStatus.Running && !_this.options.deferEvents) {
          throw new Error("Event \"".concat(_event.name, "\" was sent to uninitialized service \"").concat(_this.machine.id // tslint:disable-next-line:max-line-length
          , "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.\nEvent: ").concat(JSON.stringify(_event.data)));
        }

        _this.scheduler.schedule(function () {
          // Forward copy of event to child actors
          _this.forward(_event);

          var nextState = _this.nextState(_event);

          _this.update(nextState, _event);
        });

        return _this._state; // TODO: deprecate (should return void)
        // tslint:disable-next-line:semicolon
      };

      this.sendTo = function (event, to) {
        var isParent = _this.parent && (to === SpecialTargets.Parent || _this.parent.id === to);
        var target = isParent ? _this.parent : isString(to) ? _this.children.get(to) || registry.get(to) : isActor$1(to) ? to : undefined;

        if (!target) {
          if (!isParent) {
            throw new Error("Unable to send event to child '".concat(to, "' from service '").concat(_this.id, "'."));
          } // tslint:disable-next-line:no-console


          if (!IS_PRODUCTION) {
            warn(false, "Service '".concat(_this.id, "' has no parent: unable to send event ").concat(event.type));
          }

          return;
        }

        if ('machine' in target) {
          // perhaps those events should be rejected in the parent
          // but atm it doesn't have easy access to all of the information that is required to do it reliably
          if (_this.status !== InterpreterStatus.Stopped || _this.parent !== target || // we need to send events to the parent from exit handlers of a machine that reached its final state
          _this.state.done) {
            // Send SCXML events to machines
            target.send(_assign(_assign({}, event), {
              name: event.name === error$1 ? "".concat(error(_this.id)) : event.name,
              origin: _this.sessionId
            }));
          }
        } else {
          // Send normal events to other targets
          target.send(event.data);
        }
      };

      this._exec = function (action, context, _event, actionFunctionMap) {
        if (actionFunctionMap === void 0) {
          actionFunctionMap = _this.machine.options.actions;
        }

        var actionOrExec = action.exec || getActionFunction(action.type, actionFunctionMap);
        var exec = isFunction(actionOrExec) ? actionOrExec : actionOrExec ? actionOrExec.exec : action.exec;

        if (exec) {
          try {
            return exec(context, _event.data, !_this.machine.config.predictableActionArguments ? {
              action: action,
              state: _this.state,
              _event: _event
            } : {
              action: action,
              _event: _event
            });
          } catch (err) {
            if (_this.parent) {
              _this.parent.send({
                type: 'xstate.error',
                data: err
              });
            }

            throw err;
          }
        }

        switch (action.type) {
          case send$1:
            var sendAction = action;

            if (typeof sendAction.delay === 'number') {
              _this.defer(sendAction);

              return;
            } else {
              if (sendAction.to) {
                _this.sendTo(sendAction._event, sendAction.to);
              } else {
                _this.send(sendAction._event);
              }
            }

            break;

          case cancel$1:
            _this.cancel(action.sendId);

            break;

          case start$1:
            {
              if (_this.status !== InterpreterStatus.Running) {
                return;
              }

              var activity = action.activity; // If the activity will be stopped right after it's started
              // (such as in transient states)
              // don't bother starting the activity.

              if ( // in v4 with `predictableActionArguments` invokes are called eagerly when the `this.state` still points to the previous state
              !_this.machine.config.predictableActionArguments && !_this.state.activities[activity.id || activity.type]) {
                break;
              } // Invoked services


              if (activity.type === ActionTypes.Invoke) {
                var invokeSource = toInvokeSource$1(activity.src);
                var serviceCreator = _this.machine.options.services ? _this.machine.options.services[invokeSource.type] : undefined;
                var id = activity.id,
                    data = activity.data;

                if (!IS_PRODUCTION) {
                  warn(!('forward' in activity), // tslint:disable-next-line:max-line-length
                  "`forward` property is deprecated (found in invocation of '".concat(activity.src, "' in in machine '").concat(_this.machine.id, "'). ") + "Please use `autoForward` instead.");
                }

                var autoForward = 'autoForward' in activity ? activity.autoForward : !!activity.forward;

                if (!serviceCreator) {
                  // tslint:disable-next-line:no-console
                  if (!IS_PRODUCTION) {
                    warn(false, "No service found for invocation '".concat(activity.src, "' in machine '").concat(_this.machine.id, "'."));
                  }

                  return;
                }

                var resolvedData = data ? mapContext(data, context, _event) : undefined;

                if (typeof serviceCreator === 'string') {
                  // TODO: warn
                  return;
                }

                var source = isFunction(serviceCreator) ? serviceCreator(context, _event.data, {
                  data: resolvedData,
                  src: invokeSource,
                  meta: activity.meta
                }) : serviceCreator;

                if (!source) {
                  // TODO: warn?
                  return;
                }

                var options = void 0;

                if (isMachine(source)) {
                  source = resolvedData ? source.withContext(resolvedData) : source;
                  options = {
                    autoForward: autoForward
                  };
                }

                _this.spawn(source, id, options);
              } else {
                _this.spawnActivity(activity);
              }

              break;
            }

          case stop$1:
            {
              _this.stopChild(action.activity.id);

              break;
            }

          case log:
            var label = action.label,
                value = action.value;

            if (label) {
              _this.logger(label, value);
            } else {
              _this.logger(value);
            }

            break;

          default:
            if (!IS_PRODUCTION) {
              warn(false, "No implementation found for action type '".concat(action.type, "'"));
            }

            break;
        }
      };

      var resolvedOptions = _assign(_assign({}, Interpreter.defaultOptions), options);

      var clock = resolvedOptions.clock,
          logger = resolvedOptions.logger,
          parent = resolvedOptions.parent,
          id = resolvedOptions.id;
      var resolvedId = id !== undefined ? id : machine.id;
      this.id = resolvedId;
      this.logger = logger;
      this.clock = clock;
      this.parent = parent;
      this.options = resolvedOptions;
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
      this.sessionId = registry.bookId();
    }

    Object.defineProperty(Interpreter.prototype, "initialState", {
      get: function get() {
        var _this = this;

        if (this._initialState) {
          return this._initialState;
        }

        return provide(this, function () {
          _this._initialState = _this.machine.initialState;
          return _this._initialState;
        });
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Interpreter.prototype, "state", {
      get: function get() {
        if (!IS_PRODUCTION) {
          warn(this.status !== InterpreterStatus.NotStarted, "Attempted to read state from uninitialized service '".concat(this.id, "'. Make sure the service is started first."));
        }

        return this._state;
      },
      enumerable: false,
      configurable: true
    });
    /**
     * Executes the actions of the given state, with that state's `context` and `event`.
     *
     * @param state The state whose actions will be executed
     * @param actionsConfig The action implementations to use
     */

    Interpreter.prototype.execute = function (state, actionsConfig) {
      var e_1, _a;

      try {
        for (var _b = __values(state.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
          var action = _c.value;
          this.exec(action, state, actionsConfig);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    };

    Interpreter.prototype.update = function (state, _event) {
      var e_2, _a, e_3, _b, e_4, _c, e_5, _d;

      var _this = this; // Attach session ID to state


      state._sessionid = this.sessionId; // Update state

      this._state = state; // Execute actions

      if ((!this.machine.config.predictableActionArguments || // this is currently required to execute initial actions as the `initialState` gets cached
      // we can't just recompute it (and execute actions while doing so) because we try to preserve identity of actors created within initial assigns
      _event === initEvent) && this.options.execute) {
        this.execute(this.state);
      } // Update children


      this.children.forEach(function (child) {
        _this.state.children[child.id] = child;
      }); // Dev tools

      if (this.devTools) {
        this.devTools.send(_event.data, state);
      } // Execute listeners


      if (state.event) {
        try {
          for (var _e = __values(this.eventListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
            var listener = _f.value;
            listener(state.event);
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }

      try {
        for (var _g = __values(this.listeners), _h = _g.next(); !_h.done; _h = _g.next()) {
          var listener = _h.value;
          listener(state, state.event);
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      try {
        for (var _j = __values(this.contextListeners), _k = _j.next(); !_k.done; _k = _j.next()) {
          var contextListener = _k.value;
          contextListener(this.state.context, this.state.history ? this.state.history.context : undefined);
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      if (this.state.done) {
        // get final child state node
        var finalChildStateNode = state.configuration.find(function (sn) {
          return sn.type === 'final' && sn.parent === _this.machine;
        });
        var doneData = finalChildStateNode && finalChildStateNode.doneData ? mapContext(finalChildStateNode.doneData, state.context, _event) : undefined;

        try {
          for (var _l = __values(this.doneListeners), _m = _l.next(); !_m.done; _m = _l.next()) {
            var listener = _m.value;
            listener(doneInvoke(this.id, doneData));
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
          } finally {
            if (e_5) throw e_5.error;
          }
        }

        this._stop();
      }
    };
    /*
     * Adds a listener that is notified whenever a state transition happens. The listener is called with
     * the next state and the event object that caused the state transition.
     *
     * @param listener The state listener
     */


    Interpreter.prototype.onTransition = function (listener) {
      this.listeners.add(listener); // Send current state to listener

      if (this.status === InterpreterStatus.Running) {
        listener(this.state, this.state.event);
      }

      return this;
    };

    Interpreter.prototype.subscribe = function (nextListenerOrObserver, _, // TODO: error listener
    completeListener) {
      var _this = this;

      var observer = toObserver(nextListenerOrObserver, _, completeListener);
      this.listeners.add(observer.next); // Send current state to listener

      if (this.status !== InterpreterStatus.NotStarted) {
        observer.next(this.state);
      }

      var completeOnce = function completeOnce() {
        _this.doneListeners.delete(completeOnce);

        _this.stopListeners.delete(completeOnce);

        observer.complete();
      };

      if (this.status === InterpreterStatus.Stopped) {
        observer.complete();
      } else {
        this.onDone(completeOnce);
        this.onStop(completeOnce);
      }

      return {
        unsubscribe: function unsubscribe() {
          _this.listeners.delete(observer.next);

          _this.doneListeners.delete(completeOnce);

          _this.stopListeners.delete(completeOnce);
        }
      };
    };
    /**
     * Adds an event listener that is notified whenever an event is sent to the running interpreter.
     * @param listener The event listener
     */


    Interpreter.prototype.onEvent = function (listener) {
      this.eventListeners.add(listener);
      return this;
    };
    /**
     * Adds an event listener that is notified whenever a `send` event occurs.
     * @param listener The event listener
     */


    Interpreter.prototype.onSend = function (listener) {
      this.sendListeners.add(listener);
      return this;
    };
    /**
     * Adds a context listener that is notified whenever the state context changes.
     * @param listener The context listener
     */


    Interpreter.prototype.onChange = function (listener) {
      this.contextListeners.add(listener);
      return this;
    };
    /**
     * Adds a listener that is notified when the machine is stopped.
     * @param listener The listener
     */


    Interpreter.prototype.onStop = function (listener) {
      this.stopListeners.add(listener);
      return this;
    };
    /**
     * Adds a state listener that is notified when the statechart has reached its final state.
     * @param listener The state listener
     */


    Interpreter.prototype.onDone = function (listener) {
      this.doneListeners.add(listener);
      return this;
    };
    /**
     * Removes a listener.
     * @param listener The listener to remove
     */


    Interpreter.prototype.off = function (listener) {
      this.listeners.delete(listener);
      this.eventListeners.delete(listener);
      this.sendListeners.delete(listener);
      this.stopListeners.delete(listener);
      this.doneListeners.delete(listener);
      this.contextListeners.delete(listener);
      return this;
    };
    /**
     * Starts the interpreter from the given state, or the initial state.
     * @param initialState The state to start the statechart from
     */


    Interpreter.prototype.start = function (initialState) {
      var _this = this;

      if (this.status === InterpreterStatus.Running) {
        // Do not restart the service if it is already started
        return this;
      } // yes, it's a hack but we need the related cache to be populated for some things to work (like delayed transitions)
      // this is usually called by `machine.getInitialState` but if we rehydrate from a state we might bypass this call
      // we also don't want to call this method here as it resolves the full initial state which might involve calling assign actions
      // and that could potentially lead to some unwanted side-effects (even such as creating some rogue actors)


      this.machine._init();

      registry.register(this.sessionId, this);
      this.initialized = true;
      this.status = InterpreterStatus.Running;
      var resolvedState = initialState === undefined ? this.initialState : provide(this, function () {
        return isStateConfig(initialState) ? _this.machine.resolveState(initialState) : _this.machine.resolveState(State.from(initialState, _this.machine.context));
      });

      if (this.options.devTools) {
        this.attachDev();
      }

      this.scheduler.initialize(function () {
        _this.update(resolvedState, initEvent);
      });
      return this;
    };

    Interpreter.prototype._stop = function () {
      var e_6, _a, e_7, _b, e_8, _c, e_9, _d, e_10, _e;

      try {
        for (var _f = __values(this.listeners), _g = _f.next(); !_g.done; _g = _f.next()) {
          var listener = _g.value;
          this.listeners.delete(listener);
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
        } finally {
          if (e_6) throw e_6.error;
        }
      }

      try {
        for (var _h = __values(this.stopListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
          var listener = _j.value; // call listener, then remove

          listener();
          this.stopListeners.delete(listener);
        }
      } catch (e_7_1) {
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
        } finally {
          if (e_7) throw e_7.error;
        }
      }

      try {
        for (var _k = __values(this.contextListeners), _l = _k.next(); !_l.done; _l = _k.next()) {
          var listener = _l.value;
          this.contextListeners.delete(listener);
        }
      } catch (e_8_1) {
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
        } finally {
          if (e_8) throw e_8.error;
        }
      }

      try {
        for (var _m = __values(this.doneListeners), _o = _m.next(); !_o.done; _o = _m.next()) {
          var listener = _o.value;
          this.doneListeners.delete(listener);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
        } finally {
          if (e_9) throw e_9.error;
        }
      }

      if (!this.initialized) {
        // Interpreter already stopped; do nothing
        return this;
      }

      this.initialized = false;
      this.status = InterpreterStatus.Stopped;
      this._initialState = undefined;

      try {
        // we are going to stop within the current sync frame
        // so we can safely just cancel this here as nothing async should be fired anyway
        for (var _p = __values(Object.keys(this.delayedEventsMap)), _q = _p.next(); !_q.done; _q = _p.next()) {
          var key = _q.value;
          this.clock.clearTimeout(this.delayedEventsMap[key]);
        }
      } catch (e_10_1) {
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
        } finally {
          if (e_10) throw e_10.error;
        }
      } // clear everything that might be enqueued


      this.scheduler.clear();
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
    };
    /**
     * Stops the interpreter and unsubscribe all listeners.
     *
     * This will also notify the `onStop` listeners.
     */


    Interpreter.prototype.stop = function () {
      // TODO: add warning for stopping non-root interpreters
      var _this = this; // grab the current scheduler as it will be replaced in _stop


      var scheduler = this.scheduler;

      this._stop(); // let what is currently processed to be finished


      scheduler.schedule(function () {
        // it feels weird to handle this here but we need to handle this even slightly "out of band"
        var _event = toSCXMLEvent({
          type: 'xstate.stop'
        });

        var nextState = provide(_this, function () {
          var exitActions = flatten(__spreadArray([], __read(_this.state.configuration), false).sort(function (a, b) {
            return b.order - a.order;
          }).map(function (stateNode) {
            return toActionObjects(stateNode.onExit, _this.machine.options.actions);
          }));

          var _a = __read(resolveActions(_this.machine, _this.state, _this.state.context, _event, exitActions, _this.machine.config.predictableActionArguments ? _this._exec : undefined, _this.machine.config.predictableActionArguments || _this.machine.config.preserveActionOrder), 2),
              resolvedActions = _a[0],
              updatedContext = _a[1];

          var newState = new State({
            value: _this.state.value,
            context: updatedContext,
            _event: _event,
            _sessionid: _this.sessionId,
            historyValue: undefined,
            history: _this.state,
            actions: resolvedActions.filter(function (action) {
              return action.type !== raise$1 && (action.type !== send$1 || !!action.to && action.to !== SpecialTargets.Internal);
            }),
            activities: {},
            events: [],
            configuration: [],
            transitions: [],
            children: {},
            done: _this.state.done,
            tags: _this.state.tags,
            machine: _this.machine
          });
          newState.changed = true;
          return newState;
        });

        _this.update(nextState, _event); // TODO: think about converting those to actions
        // Stop all children


        _this.children.forEach(function (child) {
          if (isFunction(child.stop)) {
            child.stop();
          }
        });

        _this.children.clear();

        registry.free(_this.sessionId);
      });
      return this;
    };

    Interpreter.prototype.batch = function (events) {
      var _this = this;

      if (this.status === InterpreterStatus.NotStarted && this.options.deferEvents) {
        // tslint:disable-next-line:no-console
        if (!IS_PRODUCTION) {
          warn(false, "".concat(events.length, " event(s) were sent to uninitialized service \"").concat(this.machine.id, "\" and are deferred. Make sure .start() is called for this service.\nEvent: ").concat(JSON.stringify(event)));
        }
      } else if (this.status !== InterpreterStatus.Running) {
        throw new Error( // tslint:disable-next-line:max-line-length
        "".concat(events.length, " event(s) were sent to uninitialized service \"").concat(this.machine.id, "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options."));
      }

      this.scheduler.schedule(function () {
        var e_11, _a;

        var nextState = _this.state;
        var batchChanged = false;
        var batchedActions = [];

        var _loop_1 = function _loop_1(event_1) {
          var _event = toSCXMLEvent(event_1);

          _this.forward(_event);

          nextState = provide(_this, function () {
            return _this.machine.transition(nextState, _event);
          });
          batchedActions.push.apply(batchedActions, __spreadArray([], __read(nextState.actions.map(function (a) {
            return bindActionToState(a, nextState);
          })), false));
          batchChanged = batchChanged || !!nextState.changed;
        };

        try {
          for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
            var event_1 = events_1_1.value;

            _loop_1(event_1);
          }
        } catch (e_11_1) {
          e_11 = {
            error: e_11_1
          };
        } finally {
          try {
            if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
          } finally {
            if (e_11) throw e_11.error;
          }
        }

        nextState.changed = batchChanged;
        nextState.actions = batchedActions;

        _this.update(nextState, toSCXMLEvent(events[events.length - 1]));
      });
    };
    /**
     * Returns a send function bound to this interpreter instance.
     *
     * @param event The event to be sent by the sender.
     */


    Interpreter.prototype.sender = function (event) {
      return this.send.bind(this, event);
    };

    Interpreter.prototype._nextState = function (event) {
      var _this = this;

      var _event = toSCXMLEvent(event);

      if (_event.name.indexOf(errorPlatform) === 0 && !this.state.nextEvents.some(function (nextEvent) {
        return nextEvent.indexOf(errorPlatform) === 0;
      })) {
        throw _event.data.data;
      }

      var nextState = provide(this, function () {
        return _this.machine.transition(_this.state, _event, undefined, _this.machine.config.predictableActionArguments ? _this._exec : undefined);
      });
      return nextState;
    };
    /**
     * Returns the next state given the interpreter's current state and the event.
     *
     * This is a pure method that does _not_ update the interpreter's state.
     *
     * @param event The event to determine the next state
     */


    Interpreter.prototype.nextState = function (event) {
      return this._nextState(event);
    };

    Interpreter.prototype.forward = function (event) {
      var e_12, _a;

      try {
        for (var _b = __values(this.forwardTo), _c = _b.next(); !_c.done; _c = _b.next()) {
          var id = _c.value;
          var child = this.children.get(id);

          if (!child) {
            throw new Error("Unable to forward event '".concat(event, "' from interpreter '").concat(this.id, "' to nonexistant child '").concat(id, "'."));
          }

          child.send(event);
        }
      } catch (e_12_1) {
        e_12 = {
          error: e_12_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_12) throw e_12.error;
        }
      }
    };

    Interpreter.prototype.defer = function (sendAction) {
      var _this = this;

      this.delayedEventsMap[sendAction.id] = this.clock.setTimeout(function () {
        if (sendAction.to) {
          _this.sendTo(sendAction._event, sendAction.to);
        } else {
          _this.send(sendAction._event);
        }
      }, sendAction.delay);
    };

    Interpreter.prototype.cancel = function (sendId) {
      this.clock.clearTimeout(this.delayedEventsMap[sendId]);
      delete this.delayedEventsMap[sendId];
    };

    Interpreter.prototype.exec = function (action, state, actionFunctionMap) {
      if (actionFunctionMap === void 0) {
        actionFunctionMap = this.machine.options.actions;
      }

      this._exec(action, state.context, state._event, actionFunctionMap);
    };

    Interpreter.prototype.removeChild = function (childId) {
      var _a;

      this.children.delete(childId);
      this.forwardTo.delete(childId); // this.state might not exist at the time this is called,
      // such as when a child is added then removed while initializing the state

      (_a = this.state) === null || _a === void 0 ? true : delete _a.children[childId];
    };

    Interpreter.prototype.stopChild = function (childId) {
      var child = this.children.get(childId);

      if (!child) {
        return;
      }

      this.removeChild(childId);

      if (isFunction(child.stop)) {
        child.stop();
      }
    };

    Interpreter.prototype.spawn = function (entity, name, options) {
      if (this.status !== InterpreterStatus.Running) {
        return createDeferredActor(entity, name);
      }

      if (isPromiseLike(entity)) {
        return this.spawnPromise(Promise.resolve(entity), name);
      } else if (isFunction(entity)) {
        return this.spawnCallback(entity, name);
      } else if (isSpawnedActor(entity)) {
        return this.spawnActor(entity, name);
      } else if (isObservable(entity)) {
        return this.spawnObservable(entity, name);
      } else if (isMachine(entity)) {
        return this.spawnMachine(entity, _assign(_assign({}, options), {
          id: name
        }));
      } else if (isBehavior(entity)) {
        return this.spawnBehavior(entity, name);
      } else {
        throw new Error("Unable to spawn entity \"".concat(name, "\" of type \"").concat(typeof entity, "\"."));
      }
    };

    Interpreter.prototype.spawnMachine = function (machine, options) {
      var _this = this;

      if (options === void 0) {
        options = {};
      }

      var childService = new Interpreter(machine, _assign(_assign({}, this.options), {
        parent: this,
        id: options.id || machine.id
      }));

      var resolvedOptions = _assign(_assign({}, DEFAULT_SPAWN_OPTIONS), options);

      if (resolvedOptions.sync) {
        childService.onTransition(function (state) {
          _this.send(update, {
            state: state,
            id: childService.id
          });
        });
      }

      var actor = childService;
      this.children.set(childService.id, actor);

      if (resolvedOptions.autoForward) {
        this.forwardTo.add(childService.id);
      }

      childService.onDone(function (doneEvent) {
        _this.removeChild(childService.id);

        _this.send(toSCXMLEvent(doneEvent, {
          origin: childService.id
        }));
      }).start();
      return actor;
    };

    Interpreter.prototype.spawnBehavior = function (behavior, id) {
      var actorRef = spawnBehavior(behavior, {
        id: id,
        parent: this
      });
      this.children.set(id, actorRef);
      return actorRef;
    };

    Interpreter.prototype.spawnPromise = function (promise, id) {
      var _a;

      var _this = this;

      var canceled = false;
      var resolvedData;
      promise.then(function (response) {
        if (!canceled) {
          resolvedData = response;

          _this.removeChild(id);

          _this.send(toSCXMLEvent(doneInvoke(id, response), {
            origin: id
          }));
        }
      }, function (errorData) {
        if (!canceled) {
          _this.removeChild(id);

          var errorEvent = error(id, errorData);

          try {
            // Send "error.platform.id" to this (parent).
            _this.send(toSCXMLEvent(errorEvent, {
              origin: id
            }));
          } catch (error) {
            reportUnhandledExceptionOnInvocation(errorData, error, id);

            if (_this.devTools) {
              _this.devTools.send(errorEvent, _this.state);
            }

            if (_this.machine.strict) {
              // it would be better to always stop the state machine if unhandled
              // exception/promise rejection happens but because we don't want to
              // break existing code so enforce it on strict mode only especially so
              // because documentation says that onError is optional
              _this.stop();
            }
          }
        }
      });
      var actor = (_a = {
        id: id,
        send: function send() {
          return void 0;
        },
        subscribe: function subscribe(next, handleError, complete) {
          var observer = toObserver(next, handleError, complete);
          var unsubscribed = false;
          promise.then(function (response) {
            if (unsubscribed) {
              return;
            }

            observer.next(response);

            if (unsubscribed) {
              return;
            }

            observer.complete();
          }, function (err) {
            if (unsubscribed) {
              return;
            }

            observer.error(err);
          });
          return {
            unsubscribe: function unsubscribe() {
              return unsubscribed = true;
            }
          };
        },
        stop: function stop() {
          canceled = true;
        },
        toJSON: function toJSON() {
          return {
            id: id
          };
        },
        getSnapshot: function getSnapshot() {
          return resolvedData;
        }
      }, _a[symbolObservable] = function () {
        return this;
      }, _a);
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnCallback = function (callback, id) {
      var _a;

      var _this = this;

      var canceled = false;
      var receivers = new Set();
      var listeners = new Set();
      var emitted;

      var receive = function receive(e) {
        emitted = e;
        listeners.forEach(function (listener) {
          return listener(e);
        });

        if (canceled) {
          return;
        }

        _this.send(toSCXMLEvent(e, {
          origin: id
        }));
      };

      var callbackStop;

      try {
        callbackStop = callback(receive, function (newListener) {
          receivers.add(newListener);
        });
      } catch (err) {
        this.send(error(id, err));
      }

      if (isPromiseLike(callbackStop)) {
        // it turned out to be an async function, can't reliably check this before calling `callback`
        // because transpiled async functions are not recognizable
        return this.spawnPromise(callbackStop, id);
      }

      var actor = (_a = {
        id: id,
        send: function send(event) {
          return receivers.forEach(function (receiver) {
            return receiver(event);
          });
        },
        subscribe: function subscribe(next) {
          var observer = toObserver(next);
          listeners.add(observer.next);
          return {
            unsubscribe: function unsubscribe() {
              listeners.delete(observer.next);
            }
          };
        },
        stop: function stop() {
          canceled = true;

          if (isFunction(callbackStop)) {
            callbackStop();
          }
        },
        toJSON: function toJSON() {
          return {
            id: id
          };
        },
        getSnapshot: function getSnapshot() {
          return emitted;
        }
      }, _a[symbolObservable] = function () {
        return this;
      }, _a);
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnObservable = function (source, id) {
      var _a;

      var _this = this;

      var emitted;
      var subscription = source.subscribe(function (value) {
        emitted = value;

        _this.send(toSCXMLEvent(value, {
          origin: id
        }));
      }, function (err) {
        _this.removeChild(id);

        _this.send(toSCXMLEvent(error(id, err), {
          origin: id
        }));
      }, function () {
        _this.removeChild(id);

        _this.send(toSCXMLEvent(doneInvoke(id), {
          origin: id
        }));
      });
      var actor = (_a = {
        id: id,
        send: function send() {
          return void 0;
        },
        subscribe: function subscribe(next, handleError, complete) {
          return source.subscribe(next, handleError, complete);
        },
        stop: function stop() {
          return subscription.unsubscribe();
        },
        getSnapshot: function getSnapshot() {
          return emitted;
        },
        toJSON: function toJSON() {
          return {
            id: id
          };
        }
      }, _a[symbolObservable] = function () {
        return this;
      }, _a);
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnActor = function (actor, name) {
      this.children.set(name, actor);
      return actor;
    };

    Interpreter.prototype.spawnActivity = function (activity) {
      var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity.type] : undefined;

      if (!implementation) {
        if (!IS_PRODUCTION) {
          warn(false, "No implementation found for activity '".concat(activity.type, "'"));
        } // tslint:disable-next-line:no-console


        return;
      } // Start implementation


      var dispose = implementation(this.state.context, activity);
      this.spawnEffect(activity.id, dispose);
    };

    Interpreter.prototype.spawnEffect = function (id, dispose) {
      var _a;

      this.children.set(id, (_a = {
        id: id,
        send: function send() {
          return void 0;
        },
        subscribe: function subscribe() {
          return {
            unsubscribe: function unsubscribe() {
              return void 0;
            }
          };
        },
        stop: dispose || undefined,
        getSnapshot: function getSnapshot() {
          return undefined;
        },
        toJSON: function toJSON() {
          return {
            id: id
          };
        }
      }, _a[symbolObservable] = function () {
        return this;
      }, _a));
    };

    Interpreter.prototype.attachDev = function () {
      var global = getGlobal();

      if (this.options.devTools && global) {
        if (global.__REDUX_DEVTOOLS_EXTENSION__) {
          var devToolsOptions = typeof this.options.devTools === 'object' ? this.options.devTools : undefined;
          this.devTools = global.__REDUX_DEVTOOLS_EXTENSION__.connect(_assign(_assign({
            name: this.id,
            autoPause: true,
            stateSanitizer: function stateSanitizer(state) {
              return {
                value: state.value,
                context: state.context,
                actions: state.actions
              };
            }
          }, devToolsOptions), {
            features: _assign({
              jump: false,
              skip: false
            }, devToolsOptions ? devToolsOptions.features : undefined)
          }), this.machine);
          this.devTools.init(this.state);
        } // add XState-specific dev tooling hook


        registerService(this);
      }
    };

    Interpreter.prototype.toJSON = function () {
      return {
        id: this.id
      };
    };

    Interpreter.prototype[symbolObservable] = function () {
      return this;
    };

    Interpreter.prototype.getSnapshot = function () {
      if (this.status === InterpreterStatus.NotStarted) {
        return this.initialState;
      }

      return this._state;
    };
    /**
     * The default interpreter options:
     *
     * - `clock` uses the global `setTimeout` and `clearTimeout` functions
     * - `logger` uses the global `console.log()` method
     */


    Interpreter.defaultOptions = {
      execute: true,
      deferEvents: true,
      clock: {
        setTimeout: function (_setTimeout) {
          function setTimeout(_x, _x2) {
            return _setTimeout.apply(this, arguments);
          }

          setTimeout.toString = function () {
            return _setTimeout.toString();
          };

          return setTimeout;
        }(function (fn, ms) {
          return setTimeout(fn, ms);
        }),
        clearTimeout: function (_clearTimeout) {
          function clearTimeout(_x3) {
            return _clearTimeout.apply(this, arguments);
          }

          clearTimeout.toString = function () {
            return _clearTimeout.toString();
          };

          return clearTimeout;
        }(function (id) {
          return clearTimeout(id);
        })
      },
      logger: /*#__PURE__*/console.log.bind(console),
      devTools: false
    };
    Interpreter.interpret = interpret;
    return Interpreter;
  }();
  /**
   * Creates a new Interpreter instance for the given machine with the provided options, if any.
   *
   * @param machine The machine to interpret
   * @param options Interpreter options
   */


  function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
  }

  function toInvokeSource(src) {
    if (typeof src === 'string') {
      var simpleSrc = {
        type: src
      };

      simpleSrc.toString = function () {
        return src;
      }; // v4 compat - TODO: remove in v5


      return simpleSrc;
    }

    return src;
  }

  function toInvokeDefinition(invokeConfig) {
    return _assign(_assign({
      type: invoke
    }, invokeConfig), {
      toJSON: function toJSON() {
        invokeConfig.onDone;
        invokeConfig.onError;

        var invokeDef = __rest(invokeConfig, ["onDone", "onError"]);

        return _assign(_assign({}, invokeDef), {
          type: invoke,
          src: toInvokeSource(invokeConfig.src)
        });
      }
    });
  }

  var NULL_EVENT = '';
  var STATE_IDENTIFIER = '#';
  var WILDCARD = '*';
  var EMPTY_OBJECT = {};

  var isStateId = function isStateId(str) {
    return str[0] === STATE_IDENTIFIER;
  };

  var createDefaultOptions = function createDefaultOptions() {
    return {
      actions: {},
      guards: {},
      services: {},
      activities: {},
      delays: {}
    };
  };

  var validateArrayifiedTransitions = function validateArrayifiedTransitions(stateNode, event, transitions) {
    var hasNonLastUnguardedTarget = transitions.slice(0, -1).some(function (transition) {
      return !('cond' in transition) && !('in' in transition) && (isString(transition.target) || isMachine(transition.target));
    });
    var eventText = event === NULL_EVENT ? 'the transient event' : "event '".concat(event, "'");
    warn(!hasNonLastUnguardedTarget, "One or more transitions for ".concat(eventText, " on state '").concat(stateNode.id, "' are unreachable. ") + "Make sure that the default transition is the last one defined.");
  };

  var StateNode =
  /*#__PURE__*/

  /** @class */
  function () {
    function StateNode(
    /**
     * The raw config used to create the machine.
     */
    config, options,
    /**
     * The initial extended state
     */
    _context, // TODO: this is unsafe, but we're removing it in v5 anyway
    _stateInfo) {
      var _this = this;

      if (_context === void 0) {
        _context = 'context' in config ? config.context : undefined;
      }

      var _a;

      this.config = config;
      this._context = _context;
      /**
       * The order this state node appears. Corresponds to the implicit SCXML document order.
       */

      this.order = -1;
      this.__xstatenode = true;
      this.__cache = {
        events: undefined,
        relativeValue: new Map(),
        initialStateValue: undefined,
        initialState: undefined,
        on: undefined,
        transitions: undefined,
        candidates: {},
        delayedTransitions: undefined
      };
      this.idMap = {};
      this.tags = [];
      this.options = Object.assign(createDefaultOptions(), options);
      this.parent = _stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.parent;
      this.key = this.config.key || (_stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.key) || this.config.id || '(machine)';
      this.machine = this.parent ? this.parent.machine : this;
      this.path = this.parent ? this.parent.path.concat(this.key) : [];
      this.delimiter = this.config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER);
      this.id = this.config.id || __spreadArray([this.machine.key], __read(this.path), false).join(this.delimiter);
      this.version = this.parent ? this.parent.version : this.config.version;
      this.type = this.config.type || (this.config.parallel ? 'parallel' : this.config.states && Object.keys(this.config.states).length ? 'compound' : this.config.history ? 'history' : 'atomic');
      this.schema = this.parent ? this.machine.schema : (_a = this.config.schema) !== null && _a !== void 0 ? _a : {};
      this.description = this.config.description;

      if (!IS_PRODUCTION) {
        warn(!('parallel' in this.config), "The \"parallel\" property is deprecated and will be removed in version 4.1. ".concat(this.config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '".concat(this.type, "'`"), " in the config for state node '").concat(this.id, "' instead."));
      }

      this.initial = this.config.initial;
      this.states = this.config.states ? mapValues(this.config.states, function (stateConfig, key) {
        var _a;

        var stateNode = new StateNode(stateConfig, {}, undefined, {
          parent: _this,
          key: key
        });
        Object.assign(_this.idMap, _assign((_a = {}, _a[stateNode.id] = stateNode, _a), stateNode.idMap));
        return stateNode;
      }) : EMPTY_OBJECT; // Document order

      var order = 0;

      function dfs(stateNode) {
        var e_1, _a;

        stateNode.order = order++;

        try {
          for (var _b = __values(getAllChildren(stateNode)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            dfs(child);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }

      dfs(this); // History config

      this.history = this.config.history === true ? 'shallow' : this.config.history || false;
      this._transient = !!this.config.always || (!this.config.on ? false : Array.isArray(this.config.on) ? this.config.on.some(function (_a) {
        var event = _a.event;
        return event === NULL_EVENT;
      }) : NULL_EVENT in this.config.on);
      this.strict = !!this.config.strict; // TODO: deprecate (entry)

      this.onEntry = toArray(this.config.entry || this.config.onEntry).map(function (action) {
        return toActionObject(action);
      }); // TODO: deprecate (exit)

      this.onExit = toArray(this.config.exit || this.config.onExit).map(function (action) {
        return toActionObject(action);
      });
      this.meta = this.config.meta;
      this.doneData = this.type === 'final' ? this.config.data : undefined;
      this.invoke = toArray(this.config.invoke).map(function (invokeConfig, i) {
        var _a, _b;

        if (isMachine(invokeConfig)) {
          var invokeId = createInvokeId(_this.id, i);
          _this.machine.options.services = _assign((_a = {}, _a[invokeId] = invokeConfig, _a), _this.machine.options.services);
          return toInvokeDefinition({
            src: invokeId,
            id: invokeId
          });
        } else if (isString(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i);
          return toInvokeDefinition(_assign(_assign({}, invokeConfig), {
            id: invokeId,
            src: invokeConfig.src
          }));
        } else if (isMachine(invokeConfig.src) || isFunction(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i);
          _this.machine.options.services = _assign((_b = {}, _b[invokeId] = invokeConfig.src, _b), _this.machine.options.services);
          return toInvokeDefinition(_assign(_assign({
            id: invokeId
          }, invokeConfig), {
            src: invokeId
          }));
        } else {
          var invokeSource = invokeConfig.src;
          return toInvokeDefinition(_assign(_assign({
            id: createInvokeId(_this.id, i)
          }, invokeConfig), {
            src: invokeSource
          }));
        }
      });
      this.activities = toArray(this.config.activities).concat(this.invoke).map(function (activity) {
        return toActivityDefinition(activity);
      });
      this.transition = this.transition.bind(this);
      this.tags = toArray(this.config.tags); // TODO: this is the real fix for initialization once
      // state node getters are deprecated
      // if (!this.parent) {
      //   this._init();
      // }
    }

    StateNode.prototype._init = function () {
      if (this.__cache.transitions) {
        return;
      }

      getAllStateNodes(this).forEach(function (stateNode) {
        return stateNode.on;
      });
    };
    /**
     * Clones this state machine with custom options and context.
     *
     * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
     * @param context Custom context (will override predefined context)
     */


    StateNode.prototype.withConfig = function (options, context) {
      var _a = this.options,
          actions = _a.actions,
          activities = _a.activities,
          guards = _a.guards,
          services = _a.services,
          delays = _a.delays;
      return new StateNode(this.config, {
        actions: _assign(_assign({}, actions), options.actions),
        activities: _assign(_assign({}, activities), options.activities),
        guards: _assign(_assign({}, guards), options.guards),
        services: _assign(_assign({}, services), options.services),
        delays: _assign(_assign({}, delays), options.delays)
      }, context !== null && context !== void 0 ? context : this.context);
    };
    /**
     * Clones this state machine with custom context.
     *
     * @param context Custom context (will override predefined context, not recursive)
     */


    StateNode.prototype.withContext = function (context) {
      return new StateNode(this.config, this.options, context);
    };

    Object.defineProperty(StateNode.prototype, "context", {
      get: function get() {
        return isFunction(this._context) ? this._context() : this._context;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "definition", {
      /**
       * The well-structured state node definition.
       */
      get: function get() {
        return {
          id: this.id,
          key: this.key,
          version: this.version,
          context: this.context,
          type: this.type,
          initial: this.initial,
          history: this.history,
          states: mapValues(this.states, function (state) {
            return state.definition;
          }),
          on: this.on,
          transitions: this.transitions,
          entry: this.onEntry,
          exit: this.onExit,
          activities: this.activities || [],
          meta: this.meta,
          order: this.order || -1,
          data: this.doneData,
          invoke: this.invoke,
          description: this.description,
          tags: this.tags
        };
      },
      enumerable: false,
      configurable: true
    });

    StateNode.prototype.toJSON = function () {
      return this.definition;
    };

    Object.defineProperty(StateNode.prototype, "on", {
      /**
       * The mapping of events to transitions.
       */
      get: function get() {
        if (this.__cache.on) {
          return this.__cache.on;
        }

        var transitions = this.transitions;
        return this.__cache.on = transitions.reduce(function (map, transition) {
          map[transition.eventType] = map[transition.eventType] || [];
          map[transition.eventType].push(transition);
          return map;
        }, {});
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "after", {
      get: function get() {
        return this.__cache.delayedTransitions || (this.__cache.delayedTransitions = this.getDelayedTransitions(), this.__cache.delayedTransitions);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "transitions", {
      /**
       * All the transitions that can be taken from this state node.
       */
      get: function get() {
        return this.__cache.transitions || (this.__cache.transitions = this.formatTransitions(), this.__cache.transitions);
      },
      enumerable: false,
      configurable: true
    });

    StateNode.prototype.getCandidates = function (eventName) {
      if (this.__cache.candidates[eventName]) {
        return this.__cache.candidates[eventName];
      }

      var transient = eventName === NULL_EVENT;
      var candidates = this.transitions.filter(function (transition) {
        var sameEventType = transition.eventType === eventName; // null events should only match against eventless transitions

        return transient ? sameEventType : sameEventType || transition.eventType === WILDCARD;
      });
      this.__cache.candidates[eventName] = candidates;
      return candidates;
    };
    /**
     * All delayed transitions from the config.
     */


    StateNode.prototype.getDelayedTransitions = function () {
      var _this = this;

      var afterConfig = this.config.after;

      if (!afterConfig) {
        return [];
      }

      var mutateEntryExit = function mutateEntryExit(delay, i) {
        var delayRef = isFunction(delay) ? "".concat(_this.id, ":delay[").concat(i, "]") : delay;
        var eventType = after(delayRef, _this.id);

        _this.onEntry.push(send(eventType, {
          delay: delay
        }));

        _this.onExit.push(cancel(eventType));

        return eventType;
      };

      var delayedTransitions = isArray(afterConfig) ? afterConfig.map(function (transition, i) {
        var eventType = mutateEntryExit(transition.delay, i);
        return _assign(_assign({}, transition), {
          event: eventType
        });
      }) : flatten(Object.keys(afterConfig).map(function (delay, i) {
        var configTransition = afterConfig[delay];
        var resolvedTransition = isString(configTransition) ? {
          target: configTransition
        } : configTransition;
        var resolvedDelay = !isNaN(+delay) ? +delay : delay;
        var eventType = mutateEntryExit(resolvedDelay, i);
        return toArray(resolvedTransition).map(function (transition) {
          return _assign(_assign({}, transition), {
            event: eventType,
            delay: resolvedDelay
          });
        });
      }));
      return delayedTransitions.map(function (delayedTransition) {
        var delay = delayedTransition.delay;
        return _assign(_assign({}, _this.formatTransition(delayedTransition)), {
          delay: delay
        });
      });
    };
    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param state The state value or State instance
     */


    StateNode.prototype.getStateNodes = function (state) {
      var _a;

      var _this = this;

      if (!state) {
        return [];
      }

      var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);

      if (isString(stateValue)) {
        var initialStateValue = this.getStateNode(stateValue).initial;
        return initialStateValue !== undefined ? this.getStateNodes((_a = {}, _a[stateValue] = initialStateValue, _a)) : [this, this.states[stateValue]];
      }

      var subStateKeys = Object.keys(stateValue);
      var subStateNodes = [this];
      subStateNodes.push.apply(subStateNodes, __spreadArray([], __read(flatten(subStateKeys.map(function (subStateKey) {
        return _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);
      }))), false));
      return subStateNodes;
    };
    /**
     * Returns `true` if this state node explicitly handles the given event.
     *
     * @param event The event in question
     */


    StateNode.prototype.handles = function (event) {
      var eventType = getEventType(event);
      return this.events.includes(eventType);
    };
    /**
     * Resolves the given `state` to a new `State` instance relative to this machine.
     *
     * This ensures that `.events` and `.nextEvents` represent the correct values.
     *
     * @param state The state to resolve
     */


    StateNode.prototype.resolveState = function (state) {
      var stateFromConfig = state instanceof State ? state : State.create(state);
      var configuration = Array.from(getConfiguration([], this.getStateNodes(stateFromConfig.value)));
      return new State(_assign(_assign({}, stateFromConfig), {
        value: this.resolve(stateFromConfig.value),
        configuration: configuration,
        done: isInFinalState(configuration, this),
        tags: getTagsFromConfiguration(configuration),
        machine: this.machine
      }));
    };

    StateNode.prototype.transitionLeafNode = function (stateValue, state, _event) {
      var stateNode = this.getStateNode(stateValue);
      var next = stateNode.next(state, _event);

      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }

      return next;
    };

    StateNode.prototype.transitionCompoundNode = function (stateValue, state, _event) {
      var subStateKeys = Object.keys(stateValue);
      var stateNode = this.getStateNode(subStateKeys[0]);

      var next = stateNode._transition(stateValue[subStateKeys[0]], state, _event);

      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }

      return next;
    };

    StateNode.prototype.transitionParallelNode = function (stateValue, state, _event) {
      var e_2, _a;

      var transitionMap = {};

      try {
        for (var _b = __values(Object.keys(stateValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var subStateKey = _c.value;
          var subStateValue = stateValue[subStateKey];

          if (!subStateValue) {
            continue;
          }

          var subStateNode = this.getStateNode(subStateKey);

          var next = subStateNode._transition(subStateValue, state, _event);

          if (next) {
            transitionMap[subStateKey] = next;
          }
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_2) throw e_2.error;
        }
      }

      var stateTransitions = Object.keys(transitionMap).map(function (key) {
        return transitionMap[key];
      });
      var enabledTransitions = flatten(stateTransitions.map(function (st) {
        return st.transitions;
      }));
      var willTransition = stateTransitions.some(function (st) {
        return st.transitions.length > 0;
      });

      if (!willTransition) {
        return this.next(state, _event);
      }

      var entryNodes = flatten(stateTransitions.map(function (t) {
        return t.entrySet;
      }));
      var configuration = flatten(Object.keys(transitionMap).map(function (key) {
        return transitionMap[key].configuration;
      }));
      return {
        transitions: enabledTransitions,
        entrySet: entryNodes,
        exitSet: flatten(stateTransitions.map(function (t) {
          return t.exitSet;
        })),
        configuration: configuration,
        source: state,
        actions: flatten(Object.keys(transitionMap).map(function (key) {
          return transitionMap[key].actions;
        }))
      };
    };

    StateNode.prototype._transition = function (stateValue, state, _event) {
      // leaf node
      if (isString(stateValue)) {
        return this.transitionLeafNode(stateValue, state, _event);
      } // hierarchical node


      if (Object.keys(stateValue).length === 1) {
        return this.transitionCompoundNode(stateValue, state, _event);
      } // orthogonal node


      return this.transitionParallelNode(stateValue, state, _event);
    };

    StateNode.prototype.getTransitionData = function (state, event) {
      return this._transition(state.value, state, toSCXMLEvent(event));
    };

    StateNode.prototype.next = function (state, _event) {
      var e_3, _a;

      var _this = this;

      var eventName = _event.name;
      var actions = [];
      var nextStateNodes = [];
      var selectedTransition;

      try {
        for (var _b = __values(this.getCandidates(eventName)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var candidate = _c.value;
          var cond = candidate.cond,
              stateIn = candidate.in;
          var resolvedContext = state.context;
          var isInState = stateIn ? isString(stateIn) && isStateId(stateIn) ? // Check if in state by ID
          state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : // Check if in state by relative grandparent
          matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
          var guardPassed = false;

          try {
            guardPassed = !cond || evaluateGuard(this.machine, cond, resolvedContext, _event, state);
          } catch (err) {
            throw new Error("Unable to evaluate guard '".concat(cond.name || cond.type, "' in transition for event '").concat(eventName, "' in state node '").concat(this.id, "':\n").concat(err.message));
          }

          if (guardPassed && isInState) {
            if (candidate.target !== undefined) {
              nextStateNodes = candidate.target;
            }

            actions.push.apply(actions, __spreadArray([], __read(candidate.actions), false));
            selectedTransition = candidate;
            break;
          }
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      if (!selectedTransition) {
        return undefined;
      }

      if (!nextStateNodes.length) {
        return {
          transitions: [selectedTransition],
          entrySet: [],
          exitSet: [],
          configuration: state.value ? [this] : [],
          source: state,
          actions: actions
        };
      }

      var allNextStateNodes = flatten(nextStateNodes.map(function (stateNode) {
        return _this.getRelativeStateNodes(stateNode, state.historyValue);
      }));
      var isInternal = !!selectedTransition.internal;
      var reentryNodes = [];

      if (!isInternal) {
        nextStateNodes.forEach(function (targetNode) {
          reentryNodes.push.apply(reentryNodes, __spreadArray([], __read(_this.getExternalReentryNodes(targetNode)), false));
        });
      }

      return {
        transitions: [selectedTransition],
        entrySet: reentryNodes,
        exitSet: isInternal ? [] : [this],
        configuration: allNextStateNodes,
        source: state,
        actions: actions
      };
    };

    StateNode.prototype.getExternalReentryNodes = function (targetNode) {
      var nodes = [];

      var _a = __read(targetNode.order > this.order ? [targetNode, this] : [this, targetNode], 2),
          marker = _a[0],
          possibleAncestor = _a[1];

      while (marker && marker !== possibleAncestor) {
        nodes.push(marker);
        marker = marker.parent;
      }

      if (marker !== possibleAncestor) {
        // we never got to `possibleAncestor`, therefore the initial `marker` "escapes" it
        // it's in a different part of the tree so no states will be reentered for such an external transition
        return [];
      }

      nodes.push(possibleAncestor);
      return nodes;
    };

    StateNode.prototype.getActions = function (resolvedConfig, isDone, transition, currentContext, _event, prevState) {
      var e_4, _a, e_5, _b;

      var prevConfig = getConfiguration([], prevState ? this.getStateNodes(prevState.value) : [this]);

      try {
        for (var resolvedConfig_1 = __values(resolvedConfig), resolvedConfig_1_1 = resolvedConfig_1.next(); !resolvedConfig_1_1.done; resolvedConfig_1_1 = resolvedConfig_1.next()) {
          var sn = resolvedConfig_1_1.value;

          if (!has(prevConfig, sn) || has(transition.entrySet, sn.parent)) {
            transition.entrySet.push(sn);
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (resolvedConfig_1_1 && !resolvedConfig_1_1.done && (_a = resolvedConfig_1.return)) _a.call(resolvedConfig_1);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      try {
        for (var prevConfig_1 = __values(prevConfig), prevConfig_1_1 = prevConfig_1.next(); !prevConfig_1_1.done; prevConfig_1_1 = prevConfig_1.next()) {
          var sn = prevConfig_1_1.value;

          if (!has(resolvedConfig, sn) || has(transition.exitSet, sn.parent)) {
            transition.exitSet.push(sn);
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (prevConfig_1_1 && !prevConfig_1_1.done && (_b = prevConfig_1.return)) _b.call(prevConfig_1);
        } finally {
          if (e_5) throw e_5.error;
        }
      }

      var doneEvents = flatten(transition.entrySet.map(function (sn) {
        var events = [];

        if (sn.type !== 'final') {
          return events;
        }

        var parent = sn.parent;

        if (!parent.parent) {
          return events;
        }

        events.push(done(sn.id, sn.doneData), // TODO: deprecate - final states should not emit done events for their own state.
        done(parent.id, sn.doneData ? mapContext(sn.doneData, currentContext, _event) : undefined));
        var grandparent = parent.parent;

        if (grandparent.type === 'parallel') {
          if (getChildren(grandparent).every(function (parentNode) {
            return isInFinalState(transition.configuration, parentNode);
          })) {
            events.push(done(grandparent.id));
          }
        }

        return events;
      }));
      transition.exitSet.sort(function (a, b) {
        return b.order - a.order;
      });
      transition.entrySet.sort(function (a, b) {
        return a.order - b.order;
      });
      var entryStates = new Set(transition.entrySet);
      var exitStates = new Set(transition.exitSet);

      var _c = __read([flatten(Array.from(entryStates).map(function (stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.activities.map(function (activity) {
          return start(activity);
        })), false), __read(stateNode.onEntry), false);
      })).concat(doneEvents.map(raise)), flatten(Array.from(exitStates).map(function (stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.onExit), false), __read(stateNode.activities.map(function (activity) {
          return stop(activity);
        })), false);
      }))], 2),
          entryActions = _c[0],
          exitActions = _c[1];

      var actions = toActionObjects(exitActions.concat(transition.actions).concat(entryActions), this.machine.options.actions);

      if (isDone) {
        var stopActions = toActionObjects(flatten(__spreadArray([], __read(resolvedConfig), false).sort(function (a, b) {
          return b.order - a.order;
        }).map(function (stateNode) {
          return stateNode.onExit;
        })), this.machine.options.actions).filter(function (action) {
          return action.type !== raise$1 && (action.type !== send$1 || !!action.to && action.to !== SpecialTargets.Internal);
        });
        return actions.concat(stopActions);
      }

      return actions;
    };
    /**
     * Determines the next state given the current `state` and sent `event`.
     *
     * @param state The current State instance or state value
     * @param event The event that was sent at the current state
     * @param context The current context (extended state) of the current state
     */


    StateNode.prototype.transition = function (state, event, context, exec) {
      if (state === void 0) {
        state = this.initialState;
      }

      var _event = toSCXMLEvent(event);

      var currentState;

      if (state instanceof State) {
        currentState = context === undefined ? state : this.resolveState(State.from(state, context));
      } else {
        var resolvedStateValue = isString(state) ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : this.resolve(state);
        var resolvedContext = context !== null && context !== void 0 ? context : this.machine.context;
        currentState = this.resolveState(State.from(resolvedStateValue, resolvedContext));
      }

      if (!IS_PRODUCTION && _event.name === WILDCARD) {
        throw new Error("An event cannot have the wildcard type ('".concat(WILDCARD, "')"));
      }

      if (this.strict) {
        if (!this.events.includes(_event.name) && !isBuiltInEvent(_event.name)) {
          throw new Error("Machine '".concat(this.id, "' does not accept event '").concat(_event.name, "'"));
        }
      }

      var stateTransition = this._transition(currentState.value, currentState, _event) || {
        transitions: [],
        configuration: [],
        entrySet: [],
        exitSet: [],
        source: currentState,
        actions: []
      };
      var prevConfig = getConfiguration([], this.getStateNodes(currentState.value));
      var resolvedConfig = stateTransition.configuration.length ? getConfiguration(prevConfig, stateTransition.configuration) : prevConfig;
      stateTransition.configuration = __spreadArray([], __read(resolvedConfig), false);
      return this.resolveTransition(stateTransition, currentState, currentState.context, exec, _event);
    };

    StateNode.prototype.resolveRaisedTransition = function (state, _event, originalEvent, predictableExec) {
      var _a;

      var currentActions = state.actions;
      state = this.transition(state, _event, undefined, predictableExec); // Save original event to state
      // TODO: this should be the raised event! Delete in V5 (breaking)

      state._event = originalEvent;
      state.event = originalEvent.data;

      (_a = state.actions).unshift.apply(_a, __spreadArray([], __read(currentActions), false));

      return state;
    };

    StateNode.prototype.resolveTransition = function (stateTransition, currentState, context, predictableExec, _event) {
      var e_6, _a;

      var _this = this;

      if (_event === void 0) {
        _event = initEvent;
      }

      var configuration = stateTransition.configuration; // Transition will "apply" if:
      // - this is the initial state (there is no current state)
      // - OR there are transitions

      var willTransition = !currentState || stateTransition.transitions.length > 0;
      var resolvedConfiguration = willTransition ? stateTransition.configuration : currentState ? currentState.configuration : [];
      var isDone = isInFinalState(resolvedConfiguration, this);
      var resolvedStateValue = willTransition ? getValue(this.machine, configuration) : undefined;
      var historyValue = currentState ? currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : undefined : undefined;
      var actions = this.getActions(new Set(resolvedConfiguration), isDone, stateTransition, context, _event, currentState);
      var activities = currentState ? _assign({}, currentState.activities) : {};

      try {
        for (var actions_1 = __values(actions), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
          var action = actions_1_1.value;

          if (action.type === start$1) {
            activities[action.activity.id || action.activity.type] = action;
          } else if (action.type === stop$1) {
            activities[action.activity.id || action.activity.type] = false;
          }
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (actions_1_1 && !actions_1_1.done && (_a = actions_1.return)) _a.call(actions_1);
        } finally {
          if (e_6) throw e_6.error;
        }
      }

      var _b = __read(resolveActions(this, currentState, context, _event, actions, predictableExec, this.machine.config.predictableActionArguments || this.machine.config.preserveActionOrder), 2),
          resolvedActions = _b[0],
          updatedContext = _b[1];

      var _c = __read(partition(resolvedActions, function (action) {
        return action.type === raise$1 || action.type === send$1 && action.to === SpecialTargets.Internal;
      }), 2),
          raisedEvents = _c[0],
          nonRaisedActions = _c[1];

      var invokeActions = resolvedActions.filter(function (action) {
        var _a;

        return action.type === start$1 && ((_a = action.activity) === null || _a === void 0 ? void 0 : _a.type) === invoke;
      });
      var children = invokeActions.reduce(function (acc, action) {
        acc[action.activity.id] = createInvocableActor(action.activity, _this.machine, updatedContext, _event);
        return acc;
      }, currentState ? _assign({}, currentState.children) : {});
      var nextState = new State({
        value: resolvedStateValue || currentState.value,
        context: updatedContext,
        _event: _event,
        // Persist _sessionid between states
        _sessionid: currentState ? currentState._sessionid : null,
        historyValue: resolvedStateValue ? historyValue ? updateHistoryValue(historyValue, resolvedStateValue) : undefined : currentState ? currentState.historyValue : undefined,
        history: !resolvedStateValue || stateTransition.source ? currentState : undefined,
        actions: resolvedStateValue ? nonRaisedActions : [],
        activities: resolvedStateValue ? activities : currentState ? currentState.activities : {},
        events: [],
        configuration: resolvedConfiguration,
        transitions: stateTransition.transitions,
        children: children,
        done: isDone,
        tags: getTagsFromConfiguration(resolvedConfiguration),
        machine: this
      });
      var didUpdateContext = context !== updatedContext;
      nextState.changed = _event.name === update || didUpdateContext; // Dispose of penultimate histories to prevent memory leaks

      var history = nextState.history;

      if (history) {
        delete history.history;
      } // There are transient transitions if the machine is not in a final state
      // and if some of the state nodes have transient ("always") transitions.


      var hasAlwaysTransitions = !isDone && (this._transient || configuration.some(function (stateNode) {
        return stateNode._transient;
      })); // If there are no enabled transitions, check if there are transient transitions.
      // If there are transient transitions, continue checking for more transitions
      // because an transient transition should be triggered even if there are no
      // enabled transitions.
      //
      // If we're already working on an transient transition then stop to prevent an infinite loop.
      //
      // Otherwise, if there are no enabled nor transient transitions, we are done.

      if (!willTransition && (!hasAlwaysTransitions || _event.name === NULL_EVENT)) {
        return nextState;
      }

      var maybeNextState = nextState;

      if (!isDone) {
        if (hasAlwaysTransitions) {
          maybeNextState = this.resolveRaisedTransition(maybeNextState, {
            type: nullEvent
          }, _event, predictableExec);
        }

        while (raisedEvents.length) {
          var raisedEvent = raisedEvents.shift();
          maybeNextState = this.resolveRaisedTransition(maybeNextState, raisedEvent._event, _event, predictableExec);
        }
      } // Detect if state changed


      var changed = maybeNextState.changed || (history ? !!maybeNextState.actions.length || didUpdateContext || typeof history.value !== typeof maybeNextState.value || !stateValuesEqual(maybeNextState.value, history.value) : undefined);
      maybeNextState.changed = changed; // Preserve original history after raised events

      maybeNextState.history = history;
      return maybeNextState;
    };
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */


    StateNode.prototype.getStateNode = function (stateKey) {
      if (isStateId(stateKey)) {
        return this.machine.getStateNodeById(stateKey);
      }

      if (!this.states) {
        throw new Error("Unable to retrieve child state '".concat(stateKey, "' from '").concat(this.id, "'; no child states exist."));
      }

      var result = this.states[stateKey];

      if (!result) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }

      return result;
    };
    /**
     * Returns the state node with the given `stateId`, or throws.
     *
     * @param stateId The state ID. The prefix "#" is removed.
     */


    StateNode.prototype.getStateNodeById = function (stateId) {
      var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;

      if (resolvedStateId === this.id) {
        return this;
      }

      var stateNode = this.machine.idMap[resolvedStateId];

      if (!stateNode) {
        throw new Error("Child state node '#".concat(resolvedStateId, "' does not exist on machine '").concat(this.id, "'"));
      }

      return stateNode;
    };
    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */


    StateNode.prototype.getStateNodeByPath = function (statePath) {
      if (typeof statePath === 'string' && isStateId(statePath)) {
        try {
          return this.getStateNodeById(statePath.slice(1));
        } catch (e) {// try individual paths
          // throw e;
        }
      }

      var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
      var currentStateNode = this;

      while (arrayStatePath.length) {
        var key = arrayStatePath.shift();

        if (!key.length) {
          break;
        }

        currentStateNode = currentStateNode.getStateNode(key);
      }

      return currentStateNode;
    };
    /**
     * Resolves a partial state value with its full representation in this machine.
     *
     * @param stateValue The partial state value to resolve.
     */


    StateNode.prototype.resolve = function (stateValue) {
      var _a;

      var _this = this;

      if (!stateValue) {
        return this.initialStateValue || EMPTY_OBJECT; // TODO: type-specific properties
      }

      switch (this.type) {
        case 'parallel':
          return mapValues(this.initialStateValue, function (subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
          });

        case 'compound':
          if (isString(stateValue)) {
            var subStateNode = this.getStateNode(stateValue);

            if (subStateNode.type === 'parallel' || subStateNode.type === 'compound') {
              return _a = {}, _a[stateValue] = subStateNode.initialStateValue, _a;
            }

            return stateValue;
          }

          if (!Object.keys(stateValue).length) {
            return this.initialStateValue || {};
          }

          return mapValues(stateValue, function (subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
          });

        default:
          return stateValue || EMPTY_OBJECT;
      }
    };

    StateNode.prototype.getResolvedPath = function (stateIdentifier) {
      if (isStateId(stateIdentifier)) {
        var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];

        if (!stateNode) {
          throw new Error("Unable to find state node '".concat(stateIdentifier, "'"));
        }

        return stateNode.path;
      }

      return toStatePath(stateIdentifier, this.delimiter);
    };

    Object.defineProperty(StateNode.prototype, "initialStateValue", {
      get: function get() {
        var _a;

        if (this.__cache.initialStateValue) {
          return this.__cache.initialStateValue;
        }

        var initialStateValue;

        if (this.type === 'parallel') {
          initialStateValue = mapFilterValues(this.states, function (state) {
            return state.initialStateValue || EMPTY_OBJECT;
          }, function (stateNode) {
            return !(stateNode.type === 'history');
          });
        } else if (this.initial !== undefined) {
          if (!this.states[this.initial]) {
            throw new Error("Initial state '".concat(this.initial, "' not found on '").concat(this.key, "'"));
          }

          initialStateValue = isLeafNode(this.states[this.initial]) ? this.initial : (_a = {}, _a[this.initial] = this.states[this.initial].initialStateValue, _a);
        } else {
          // The finite state value of a machine without child states is just an empty object
          initialStateValue = {};
        }

        this.__cache.initialStateValue = initialStateValue;
        return this.__cache.initialStateValue;
      },
      enumerable: false,
      configurable: true
    });

    StateNode.prototype.getInitialState = function (stateValue, context) {
      this._init(); // TODO: this should be in the constructor (see note in constructor)


      var configuration = this.getStateNodes(stateValue);
      return this.resolveTransition({
        configuration: configuration,
        entrySet: __spreadArray([], __read(configuration), false),
        exitSet: [],
        transitions: [],
        source: undefined,
        actions: []
      }, undefined, context !== null && context !== void 0 ? context : this.machine.context, undefined);
    };

    Object.defineProperty(StateNode.prototype, "initialState", {
      /**
       * The initial State instance, which includes all actions to be executed from
       * entering the initial state.
       */
      get: function get() {
        var initialStateValue = this.initialStateValue;

        if (!initialStateValue) {
          throw new Error("Cannot retrieve initial state from simple state '".concat(this.id, "'."));
        }

        return this.getInitialState(initialStateValue);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "target", {
      /**
       * The target state value of the history state node, if it exists. This represents the
       * default state value to transition to if no history value exists yet.
       */
      get: function get() {
        var target;

        if (this.type === 'history') {
          var historyConfig = this.config;

          if (isString(historyConfig.target)) {
            target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
          } else {
            target = historyConfig.target;
          }
        }

        return target;
      },
      enumerable: false,
      configurable: true
    });
    /**
     * Returns the leaf nodes from a state path relative to this state node.
     *
     * @param relativeStateId The relative state path to retrieve the state nodes
     * @param history The previous state to retrieve history
     * @param resolve Whether state nodes should resolve to initial child state nodes
     */

    StateNode.prototype.getRelativeStateNodes = function (relativeStateId, historyValue, resolve) {
      if (resolve === void 0) {
        resolve = true;
      }

      return resolve ? relativeStateId.type === 'history' ? relativeStateId.resolveHistory(historyValue) : relativeStateId.initialStateNodes : [relativeStateId];
    };

    Object.defineProperty(StateNode.prototype, "initialStateNodes", {
      get: function get() {
        var _this = this;

        if (isLeafNode(this)) {
          return [this];
        } // Case when state node is compound but no initial state is defined


        if (this.type === 'compound' && !this.initial) {
          if (!IS_PRODUCTION) {
            warn(false, "Compound state node '".concat(this.id, "' has no initial state."));
          }

          return [this];
        }

        var initialStateNodePaths = toStatePaths(this.initialStateValue);
        return flatten(initialStateNodePaths.map(function (initialPath) {
          return _this.getFromRelativePath(initialPath);
        }));
      },
      enumerable: false,
      configurable: true
    });
    /**
     * Retrieves state nodes from a relative path to this state node.
     *
     * @param relativePath The relative path from this state node
     * @param historyValue
     */

    StateNode.prototype.getFromRelativePath = function (relativePath) {
      if (!relativePath.length) {
        return [this];
      }

      var _a = __read(relativePath),
          stateKey = _a[0],
          childStatePath = _a.slice(1);

      if (!this.states) {
        throw new Error("Cannot retrieve subPath '".concat(stateKey, "' from node with no states"));
      }

      var childStateNode = this.getStateNode(stateKey);

      if (childStateNode.type === 'history') {
        return childStateNode.resolveHistory();
      }

      if (!this.states[stateKey]) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }

      return this.states[stateKey].getFromRelativePath(childStatePath);
    };

    StateNode.prototype.historyValue = function (relativeStateValue) {
      if (!Object.keys(this.states).length) {
        return undefined;
      }

      return {
        current: relativeStateValue || this.initialStateValue,
        states: mapFilterValues(this.states, function (stateNode, key) {
          if (!relativeStateValue) {
            return stateNode.historyValue();
          }

          var subStateValue = isString(relativeStateValue) ? undefined : relativeStateValue[key];
          return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
        }, function (stateNode) {
          return !stateNode.history;
        })
      };
    };
    /**
     * Resolves to the historical value(s) of the parent state node,
     * represented by state nodes.
     *
     * @param historyValue
     */


    StateNode.prototype.resolveHistory = function (historyValue) {
      var _this = this;

      if (this.type !== 'history') {
        return [this];
      }

      var parent = this.parent;

      if (!historyValue) {
        var historyTarget = this.target;
        return historyTarget ? flatten(toStatePaths(historyTarget).map(function (relativeChildPath) {
          return parent.getFromRelativePath(relativeChildPath);
        })) : parent.initialStateNodes;
      }

      var subHistoryValue = nestedPath(parent.path, 'states')(historyValue).current;

      if (isString(subHistoryValue)) {
        return [parent.getStateNode(subHistoryValue)];
      }

      return flatten(toStatePaths(subHistoryValue).map(function (subStatePath) {
        return _this.history === 'deep' ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
      }));
    };

    Object.defineProperty(StateNode.prototype, "stateIds", {
      /**
       * All the state node IDs of this state node and its descendant state nodes.
       */
      get: function get() {
        var _this = this;

        var childStateIds = flatten(Object.keys(this.states).map(function (stateKey) {
          return _this.states[stateKey].stateIds;
        }));
        return [this.id].concat(childStateIds);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "events", {
      /**
       * All the event types accepted by this state node and its descendants.
       */
      get: function get() {
        var e_7, _a, e_8, _b;

        if (this.__cache.events) {
          return this.__cache.events;
        }

        var states = this.states;
        var events = new Set(this.ownEvents);

        if (states) {
          try {
            for (var _c = __values(Object.keys(states)), _d = _c.next(); !_d.done; _d = _c.next()) {
              var stateId = _d.value;
              var state = states[stateId];

              if (state.states) {
                try {
                  for (var _e = (e_8 = void 0, __values(state.events)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var event_1 = _f.value;
                    events.add("".concat(event_1));
                  }
                } catch (e_8_1) {
                  e_8 = {
                    error: e_8_1
                  };
                } finally {
                  try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                  } finally {
                    if (e_8) throw e_8.error;
                  }
                }
              }
            }
          } catch (e_7_1) {
            e_7 = {
              error: e_7_1
            };
          } finally {
            try {
              if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            } finally {
              if (e_7) throw e_7.error;
            }
          }
        }

        return this.__cache.events = Array.from(events);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "ownEvents", {
      /**
       * All the events that have transitions directly from this state node.
       *
       * Excludes any inert events.
       */
      get: function get() {
        var events = new Set(this.transitions.filter(function (transition) {
          return !(!transition.target && !transition.actions.length && transition.internal);
        }).map(function (transition) {
          return transition.eventType;
        }));
        return Array.from(events);
      },
      enumerable: false,
      configurable: true
    });

    StateNode.prototype.resolveTarget = function (_target) {
      var _this = this;

      if (_target === undefined) {
        // an undefined target signals that the state node should not transition from that state when receiving that event
        return undefined;
      }

      return _target.map(function (target) {
        if (!isString(target)) {
          return target;
        }

        var isInternalTarget = target[0] === _this.delimiter; // If internal target is defined on machine,
        // do not include machine key on target

        if (isInternalTarget && !_this.parent) {
          return _this.getStateNodeByPath(target.slice(1));
        }

        var resolvedTarget = isInternalTarget ? _this.key + target : target;

        if (_this.parent) {
          try {
            var targetStateNode = _this.parent.getStateNodeByPath(resolvedTarget);

            return targetStateNode;
          } catch (err) {
            throw new Error("Invalid transition definition for state node '".concat(_this.id, "':\n").concat(err.message));
          }
        } else {
          return _this.getStateNodeByPath(resolvedTarget);
        }
      });
    };

    StateNode.prototype.formatTransition = function (transitionConfig) {
      var _this = this;

      var normalizedTarget = normalizeTarget(transitionConfig.target);
      var internal = 'internal' in transitionConfig ? transitionConfig.internal : normalizedTarget ? normalizedTarget.some(function (_target) {
        return isString(_target) && _target[0] === _this.delimiter;
      }) : true;
      var guards = this.machine.options.guards;
      var target = this.resolveTarget(normalizedTarget);

      var transition = _assign(_assign({}, transitionConfig), {
        actions: toActionObjects(toArray(transitionConfig.actions)),
        cond: toGuard(transitionConfig.cond, guards),
        target: target,
        source: this,
        internal: internal,
        eventType: transitionConfig.event,
        toJSON: function toJSON() {
          return _assign(_assign({}, transition), {
            target: transition.target ? transition.target.map(function (t) {
              return "#".concat(t.id);
            }) : undefined,
            source: "#".concat(_this.id)
          });
        }
      });

      return transition;
    };

    StateNode.prototype.formatTransitions = function () {
      var e_9, _a;

      var _this = this;

      var onConfig;

      if (!this.config.on) {
        onConfig = [];
      } else if (Array.isArray(this.config.on)) {
        onConfig = this.config.on;
      } else {
        var _b = this.config.on,
            _c = WILDCARD,
            _d = _b[_c],
            wildcardConfigs = _d === void 0 ? [] : _d,
            strictTransitionConfigs_1 = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);

        onConfig = flatten(Object.keys(strictTransitionConfigs_1).map(function (key) {
          if (!IS_PRODUCTION && key === NULL_EVENT) {
            warn(false, "Empty string transition configs (e.g., `{ on: { '': ... }}`) for transient transitions are deprecated. Specify the transition in the `{ always: ... }` property instead. " + "Please check the `on` configuration for \"#".concat(_this.id, "\"."));
          }

          var transitionConfigArray = toTransitionConfigArray(key, strictTransitionConfigs_1[key]);

          if (!IS_PRODUCTION) {
            validateArrayifiedTransitions(_this, key, transitionConfigArray);
          }

          return transitionConfigArray;
        }).concat(toTransitionConfigArray(WILDCARD, wildcardConfigs)));
      }

      var eventlessConfig = this.config.always ? toTransitionConfigArray('', this.config.always) : [];
      var doneConfig = this.config.onDone ? toTransitionConfigArray(String(done(this.id)), this.config.onDone) : [];

      if (!IS_PRODUCTION) {
        warn(!(this.config.onDone && !this.parent), "Root nodes cannot have an \".onDone\" transition. Please check the config of \"".concat(this.id, "\"."));
      }

      var invokeConfig = flatten(this.invoke.map(function (invokeDef) {
        var settleTransitions = [];

        if (invokeDef.onDone) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(doneInvoke(invokeDef.id)), invokeDef.onDone)), false));
        }

        if (invokeDef.onError) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(error(invokeDef.id)), invokeDef.onError)), false));
        }

        return settleTransitions;
      }));
      var delayedTransitions = this.after;
      var formattedTransitions = flatten(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(doneConfig), false), __read(invokeConfig), false), __read(onConfig), false), __read(eventlessConfig), false).map(function (transitionConfig) {
        return toArray(transitionConfig).map(function (transition) {
          return _this.formatTransition(transition);
        });
      }));

      try {
        for (var delayedTransitions_1 = __values(delayedTransitions), delayedTransitions_1_1 = delayedTransitions_1.next(); !delayedTransitions_1_1.done; delayedTransitions_1_1 = delayedTransitions_1.next()) {
          var delayedTransition = delayedTransitions_1_1.value;
          formattedTransitions.push(delayedTransition);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (delayedTransitions_1_1 && !delayedTransitions_1_1.done && (_a = delayedTransitions_1.return)) _a.call(delayedTransitions_1);
        } finally {
          if (e_9) throw e_9.error;
        }
      }

      return formattedTransitions;
    };

    return StateNode;
  }();

  var warned = false;

  function createMachine(config, options) {
    if (!IS_PRODUCTION && !config.predictableActionArguments && !warned) {
      warned = true;
      console.warn('It is highly recommended to set `predictableActionArguments` to `true` when using `createMachine`. https://xstate.js.org/docs/guides/actions.html');
    }

    return new StateNode(config, options);
  }

  var assign = assign$1;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  var WEB_TIEBREAKER_VALUE = 0xfffffffe;
  var MAX_RETRIES = 2;
  class Roap extends EventEmitter {
    constructor(createLocalOfferCallback, handleRemoteOfferCallback, handleRemoteAnswerCallback, debugId, initialSeq) {
      super();

      _defineProperty__default["default"](this, "id", void 0);

      _defineProperty__default["default"](this, "createLocalOfferCallback", void 0);

      _defineProperty__default["default"](this, "handleRemoteOfferCallback", void 0);

      _defineProperty__default["default"](this, "handleRemoteAnswerCallback", void 0);

      _defineProperty__default["default"](this, "stateMachine", void 0);

      _defineProperty__default["default"](this, "initiateOfferPromises", void 0);

      this.id = debugId || 'ROAP';
      this.createLocalOfferCallback = createLocalOfferCallback;
      this.handleRemoteOfferCallback = handleRemoteOfferCallback;
      this.handleRemoteAnswerCallback = handleRemoteAnswerCallback;
      this.initiateOfferPromises = [];
      var fsm = createMachine({
        tsTypes: {},
        schema: {
          context: {},
          events: {},
          services: {}
        },
        preserveActionOrder: true,
        id: 'roap',
        initial: 'idle',
        context: {
          seq: initialSeq || 0,
          pendingLocalOffer: false,
          isHandlingOfferRequest: false,
          retryCounter: 0
        },
        states: {
          browserError: {
            onEntry: (context, event) => {
              this.error('FSM', "browserError state onEntry: context=".concat(JSON.stringify(context), ":"), event.data);
              this.emit(Event$1.ROAP_FAILURE);
            }
          },
          remoteError: {
            onEntry: () => {
              this.log('FSM', 'remoteError state onEntry called, emitting Event.ROAP_FAILURE');
              this.emit(Event$1.ROAP_FAILURE);
            }
          },
          idle: {
            always: {
              cond: 'isPendingLocalOffer',
              actions: ['increaseSeq', 'sendStartedEvent'],
              target: 'creatingLocalOffer'
            },
            on: {
              INITIATE_OFFER: {
                actions: ['increaseSeq', 'sendStartedEvent'],
                target: 'creatingLocalOffer'
              },
              REMOTE_OFFER_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'sendOutOfOrderError'
              }, {
                actions: ['updateSeq', 'sendStartedEvent'],
                target: 'settingRemoteOffer'
              }],
              REMOTE_OFFER_REQUEST_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'sendOutOfOrderError'
              }, {
                actions: ['updateSeq', 'setOfferRequestFlag', 'sendStartedEvent'],
                target: 'creatingLocalOffer'
              }],
              REMOTE_ANSWER_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'sendInvalidStateError'
              }],
              REMOTE_OK_ARRIVED: {
                actions: 'sendInvalidStateError'
              }
            }
          },
          creatingLocalOffer: {
            invoke: {
              src: 'createLocalOffer',
              onDone: [{
                cond: 'isPendingLocalOffer',
                target: 'creatingLocalOffer'
              }, {
                cond: 'isHandlingOfferRequest',
                actions: ['sendRoapOfferResponseMessage', 'resolvePendingInitiateOfferPromises'],
                target: 'waitingForAnswer'
              }, {
                actions: ['sendRoapOfferMessage', 'resolvePendingInitiateOfferPromises'],
                target: 'waitingForAnswer'
              }],
              onError: {
                actions: 'rejectPendingInitiateOfferPromises',
                target: 'browserError'
              }
            },
            onEntry: ['resetPendingLocalOffer'],
            on: {
              INITIATE_OFFER: {
                actions: 'enqueueNewOfferCreation'
              },
              REMOTE_OFFER_ARRIVED: [{
                actions: 'handleGlare'
              }],
              REMOTE_OFFER_REQUEST_ARRIVED: [{
                cond: 'isHandlingOfferRequest',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'handleGlare'
              }],
              REMOTE_ANSWER_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_OK_ARRIVED: {
                actions: 'sendInvalidStateError'
              }
            }
          },
          waitingForAnswer: {
            on: {
              REMOTE_ANSWER_ARRIVED: [{
                actions: ['resetRetryCounter', 'updateSeq'],
                target: 'settingRemoteAnswer'
              }],
              INITIATE_OFFER: {
                actions: 'enqueueNewOfferCreation'
              },
              REMOTE_OFFER_ARRIVED: {
                actions: 'handleGlare'
              },
              REMOTE_OFFER_REQUEST_ARRIVED: [{
                cond: 'isHandlingOfferRequest',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'handleGlare'
              }],
              REMOTE_OK_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              ERROR_ARRIVED: [{
                cond: 'shouldErrorTriggerOfferRetry',
                actions: ['increaseSeq', 'increaseRetryCounter'],
                target: 'creatingLocalOffer'
              }, {
                cond: 'isSameSeq',
                target: 'remoteError'
              }]
            }
          },
          settingRemoteAnswer: {
            invoke: {
              src: 'handleRemoteAnswer',
              onDone: {
                actions: ['sendRoapOKMessage', 'resetOfferRequestFlag', 'sendDoneEvent'],
                target: 'idle'
              },
              onError: {
                actions: 'sendGenericError',
                target: 'browserError'
              }
            },
            on: {
              INITIATE_OFFER: {
                actions: 'enqueueNewOfferCreation'
              },
              REMOTE_OFFER_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_OFFER_REQUEST_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_ANSWER_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'sendInvalidStateError'
              }],
              REMOTE_OK_ARRIVED: {
                actions: 'sendInvalidStateError'
              }
            }
          },
          settingRemoteOffer: {
            invoke: {
              src: 'handleRemoteOffer',
              onDone: {
                actions: ['sendRoapAnswerMessage'],
                target: 'waitingForOK'
              },
              onError: {
                actions: 'sendGenericError',
                target: 'browserError'
              }
            },
            on: {
              INITIATE_OFFER: {
                actions: 'enqueueNewOfferCreation'
              },
              REMOTE_OFFER_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'sendRetryAfterError'
              }],
              REMOTE_OFFER_REQUEST_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_ANSWER_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_OK_ARRIVED: {
                actions: 'sendInvalidStateError'
              }
            }
          },
          waitingForOK: {
            on: {
              REMOTE_OK_ARRIVED: [{
                actions: ['updateSeq', 'sendDoneEvent'],
                target: 'idle'
              }],
              INITIATE_OFFER: {
                actions: 'enqueueNewOfferCreation'
              },
              REMOTE_OFFER_ARRIVED: [{
                cond: 'isSameSeq',
                actions: 'ignoreDuplicate'
              }, {
                actions: 'sendInvalidStateError'
              }],
              REMOTE_OFFER_REQUEST_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              REMOTE_ANSWER_ARRIVED: {
                actions: 'sendInvalidStateError'
              },
              ERROR_ARRIVED: {
                cond: 'isSameSeq',
                target: 'remoteError'
              }
            }
          }
        }
      }, {
        services: {
          createLocalOffer: () => this.createLocalOfferCallback(),
          handleRemoteAnswer: (_context, event) => this.handleRemoteAnswerCallback(event.sdp),
          handleRemoteOffer: (_context, event) => this.handleRemoteOfferCallback(event.sdp)
        },
        actions: {
          enqueueNewOfferCreation: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            pendingLocalOffer: true
          })),
          resetPendingLocalOffer: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            pendingLocalOffer: false
          })),
          increaseSeq: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            seq: context.seq + 1
          })),
          updateSeq: assign((context, event) => _objectSpread(_objectSpread({}, context), {}, {
            seq: event.seq
          })),
          increaseRetryCounter: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            retryCounter: context.retryCounter + 1
          })),
          resetRetryCounter: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            retryCounter: 0
          })),
          setOfferRequestFlag: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            isHandlingOfferRequest: true
          })),
          resetOfferRequestFlag: assign(context => _objectSpread(_objectSpread({}, context), {}, {
            isHandlingOfferRequest: false
          })),
          handleGlare: (_context, event) => {
            if (event.tieBreaker === WEB_TIEBREAKER_VALUE) {
              this.sendErrorMessage(event.seq, ErrorType.DOUBLECONFLICT);
            } else {
              this.sendErrorMessage(event.seq, ErrorType.CONFLICT);
            }
          },
          sendRoapOfferMessage: (context, event) => this.sendRoapOfferMessage(context.seq, event.data.sdp),
          sendRoapOfferResponseMessage: (context, event) => this.sendRoapOfferResponseMessage(context.seq, event.data.sdp),
          sendRoapOKMessage: context => this.sendRoapOkMessage(context.seq),
          sendRoapAnswerMessage: (context, event) => this.sendRoapAnswerMessage(context.seq, event.data.sdp),
          sendStartedEvent: () => this.sendStartedEvent(),
          sendDoneEvent: () => this.sendDoneEvent(),
          sendGenericError: context => this.sendErrorMessage(context.seq, ErrorType.FAILED),
          sendInvalidStateError: (_context, event) => this.sendErrorMessage(event.seq, ErrorType.INVALID_STATE),
          sendOutOfOrderError: (_context, event) => this.sendErrorMessage(event.seq, ErrorType.OUT_OF_ORDER),
          sendRetryAfterError: (_context, event) => this.sendErrorMessage(event.seq, ErrorType.FAILED, {
            retryAfter: Math.floor(Math.random() * 11)
          }),
          ignoreDuplicate: (_context, event) => this.log('FSM', "ignoring duplicate roap message ".concat(event.type, " with seq=").concat(event.seq)),
          resolvePendingInitiateOfferPromises: () => this.resolvePendingInitiateOfferPromises(),
          rejectPendingInitiateOfferPromises: (_context, event) => this.rejectPendingInitiateOfferPromises(event.data)
        },
        guards: {
          isPendingLocalOffer: context => context.pendingLocalOffer,
          isHandlingOfferRequest: context => context.isHandlingOfferRequest,
          isSameSeq: (context, event) => {
            if (event.seq === context.seq) {
              this.log('FSM', "incoming roap message seq is same as current context seq: ".concat(event.seq));
              return true;
            }

            return false;
          },
          shouldErrorTriggerOfferRetry: (context, event) => {
            var retryableErrorTypes = [ErrorType.DOUBLECONFLICT, ErrorType.INVALID_STATE, ErrorType.OUT_OF_ORDER, ErrorType.RETRY];

            if (retryableErrorTypes.includes(event.errorType)) {
              if (event.seq === context.seq && context.retryCounter < MAX_RETRIES) {
                this.log('FSM', "retryable error message received with matching seq and retryCounter ".concat(context.retryCounter, " < ").concat(MAX_RETRIES));
                return true;
              }

              if (event.seq !== context.seq) {
                this.log('FSM', "ignoring error message with wrong seq: ".concat(event.seq, " !== ").concat(context.seq));
              } else {
                this.log('FSM', "reached max retries: retryCounter=".concat(context.retryCounter));
              }
            }

            return false;
          }
        }
      });
      this.stateMachine = interpret(fsm).onTransition((state, event) => this.log('onTransition', "state=".concat(state.value, ", event=").concat(JSON.stringify(event)))).start();
    }

    log(action, description) {
      getLogger().info("".concat(this.id, ":").concat(action, " ").concat(description));
    }

    error(action, description, error) {
      getLogger().error("".concat(this.id, ":").concat(action, " ").concat(description, " ").concat(getErrorDescription(error)));
    }

    sendRoapOfferMessage(seq, sdp) {
      this.log('sendRoapOfferMessage', 'emitting ROAP OFFER');
      this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {
          seq,
          messageType: 'OFFER',
          sdp,
          tieBreaker: WEB_TIEBREAKER_VALUE
        }
      });
    }

    sendRoapOfferResponseMessage(seq, sdp) {
      this.log('sendRoapOfferResponseMessage', 'emitting ROAP OFFER RESPONSE');
      this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {
          seq,
          messageType: 'OFFER_RESPONSE',
          sdp
        }
      });
    }

    sendRoapOkMessage(seq) {
      this.log('sendRoapOkMessage', 'emitting ROAP OK');
      this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {
          seq,
          messageType: 'OK'
        }
      });
    }

    sendRoapAnswerMessage(seq, sdp) {
      this.log('sendRoapAnswerMessage', 'emitting ROAP ANSWER');
      this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {
          seq,
          messageType: 'ANSWER',
          sdp
        }
      });
    }

    sendDoneEvent() {
      this.log('sendDoneEvent', 'emitting ROAP DONE');
      this.emit(Event$1.ROAP_DONE);
    }

    sendStartedEvent() {
      this.log('sendStartedEvent', 'emitting ROAP STARTED');
      this.emit(Event$1.ROAP_STARTED);
    }

    sendErrorMessage(seq, errorType) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var {
        retryAfter
      } = options;
      this.log('sendErrorMessage', "emitting ROAP ERROR (".concat(errorType, ")"));
      this.emit(Event$1.ROAP_MESSAGE_TO_SEND, {
        roapMessage: {
          seq,
          messageType: 'ERROR',
          errorType,
          retryAfter
        }
      });
    }

    getStateMachine() {
      return this.stateMachine;
    }

    initiateOffer() {
      return new Promise((resolve, reject) => {
        this.initiateOfferPromises.push({
          resolve,
          reject
        });
        this.stateMachine.send('INITIATE_OFFER');
      });
    }

    resolvePendingInitiateOfferPromises() {
      while (this.initiateOfferPromises.length > 0) {
        var promise = this.initiateOfferPromises.shift();
        promise === null || promise === void 0 ? void 0 : promise.resolve();
      }
    }

    rejectPendingInitiateOfferPromises(error) {
      while (this.initiateOfferPromises.length > 0) {
        var promise = this.initiateOfferPromises.shift();
        promise === null || promise === void 0 ? void 0 : promise.reject(error);
      }
    }

    validateIncomingRoapMessage(roapMessage) {
      var {
        errorType,
        messageType,
        seq
      } = roapMessage;
      var isValid = true;
      var errorToSend;

      if (seq < this.stateMachine.state.context.seq) {
        isValid = false;

        if (messageType !== 'ERROR') {
          errorToSend = ErrorType.OUT_OF_ORDER;
          this.error('validateIncomingRoapMessage', "received roap message ".concat(messageType, " with seq too low: ").concat(seq, " < ").concat(this.stateMachine.state.context.seq));
        } else {
          this.error('validateIncomingRoapMessage', "received ERROR message ".concat(errorType, " with seq too low: ").concat(seq, " < ").concat(this.stateMachine.state.context.seq, ", ignoring it"));
        }
      }

      return {
        isValid,
        errorToSend
      };
    }

    roapMessageReceived(roapMessage) {
      var {
        errorCause,
        errorType,
        messageType,
        sdp,
        seq,
        tieBreaker
      } = roapMessage;
      var {
        isValid,
        errorToSend
      } = this.validateIncomingRoapMessage(roapMessage);

      if (!isValid) {
        if (errorToSend) {
          this.sendErrorMessage(seq, errorToSend);
        }

        return;
      }

      switch (messageType) {
        case 'ANSWER':
          this.stateMachine.send('REMOTE_ANSWER_ARRIVED', {
            sdp,
            seq
          });
          break;

        case 'OFFER':
          this.stateMachine.send('REMOTE_OFFER_ARRIVED', {
            sdp,
            seq,
            tieBreaker
          });
          break;

        case 'OFFER_REQUEST':
          this.stateMachine.send('REMOTE_OFFER_REQUEST_ARRIVED', {
            seq,
            tieBreaker
          });
          break;

        case 'OK':
          this.stateMachine.send('REMOTE_OK_ARRIVED', {
            sdp,
            seq
          });
          break;

        case 'ERROR':
          this.error('roapMessageReceived', "Error received: seq=".concat(seq, " type=").concat(errorType, " cause=").concat(errorCause));

          if (errorType === ErrorType.CONFLICT) {
            this.error('roapMessageReceived', "CONFLICT error type received - this should never happen, because we use the tieBreaker value ".concat(WEB_TIEBREAKER_VALUE));
          }

          this.stateMachine.send('ERROR_ARRIVED', {
            seq,
            errorType
          });
          break;

        case 'OFFER_RESPONSE':
          this.error('roapMessageReceived', "Received unexpected OFFER_RESPONSE: seq=".concat(seq));
          break;

        default:
          this.error('roapMessageReceived()', "unsupported messageType: ".concat(messageType));
          throw new Error('unhandled messageType');
      }
    }

    stop() {
      this.stateMachine.stop();
    }

    getSeq() {
      return this.stateMachine.state.context.seq;
    }

  }

  class RoapMediaConnection extends EventEmitter {
    constructor(mediaConnectionConfig, options, debugId) {
      super();

      _defineProperty__default["default"](this, "id", void 0);

      _defineProperty__default["default"](this, "debugId", void 0);

      _defineProperty__default["default"](this, "mediaConnection", void 0);

      _defineProperty__default["default"](this, "roap", void 0);

      _defineProperty__default["default"](this, "sdpNegotiationStarted", void 0);

      this.debugId = debugId;
      this.id = debugId || 'RoapMediaConnection';
      this.sdpNegotiationStarted = false;
      this.log('constructor()', "config: ".concat(JSON.stringify(mediaConnectionConfig), ", options: ").concat(JSON.stringify(options)));
      this.mediaConnection = this.createMediaConnection(mediaConnectionConfig, options, debugId);
      this.roap = this.createRoap(debugId);
    }

    log(action, description) {
      getLogger().info("".concat(this.id, ":").concat(action, " ").concat(description));
    }

    error(action, description, error) {
      getLogger().error("".concat(this.id, ":").concat(action, " ").concat(description, " ").concat(getErrorDescription(error)));
    }

    createMediaConnection(mediaConnectionConfig, options, debugId) {
      var mediaConnection = new MediaConnection$1(mediaConnectionConfig, options, debugId);
      mediaConnection.on(Event$1.REMOTE_TRACK_ADDED, this.onRemoteTrack.bind(this));
      mediaConnection.on(Event$1.CONNECTION_STATE_CHANGED, this.onConnectionStateChanged.bind(this));
      mediaConnection.on(Event$1.DTMF_TONE_CHANGED, this.onDtmfToneChanged.bind(this));
      return mediaConnection;
    }

    createRoap(debugId, seq) {
      var roap = new Roap(this.createLocalOffer.bind(this), this.handleRemoteOffer.bind(this), this.handleRemoteAnswer.bind(this), debugId, seq);
      roap.on(Event$1.ROAP_MESSAGE_TO_SEND, event => this.emit(Event$1.ROAP_MESSAGE_TO_SEND, event));
      roap.on(Event$1.ROAP_STARTED, () => this.emit(Event$1.ROAP_STARTED));
      roap.on(Event$1.ROAP_DONE, () => this.emit(Event$1.ROAP_DONE));
      roap.on(Event$1.ROAP_FAILURE, () => this.emit(Event$1.ROAP_FAILURE));
      return roap;
    }

    initiateOffer() {
      this.log('initiateOffer()', 'called');

      if (this.sdpNegotiationStarted) {
        this.error('initiateOffer()', 'SDP negotiation already started');
        return Promise.reject(new Error('SDP negotiation already started'));
      }

      this.mediaConnection.initializeTransceivers(false);
      this.sdpNegotiationStarted = true;
      return this.roap.initiateOffer();
    }

    close() {
      this.log('close()', 'called');
      this.closeMediaConnection();
      this.stopRoapSession();
    }

    closeMediaConnection() {
      this.mediaConnection.close();
      this.mediaConnection.removeAllListeners();
    }

    stopRoapSession() {
      this.roap.stop();
      this.roap.removeAllListeners();
    }

    reconnect() {
      var initiateOffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.log('reconnect()', 'called');
      var config = this.mediaConnection.getConfig();
      var options = this.mediaConnection.getSendReceiveOptions();
      var seq = this.roap.getSeq();
      this.stopRoapSession();
      this.closeMediaConnection();
      this.sdpNegotiationStarted = false;
      this.mediaConnection = this.createMediaConnection(config, options, this.debugId);
      this.roap = this.createRoap(this.debugId, seq);

      if (initiateOffer) {
        return this.initiateOffer();
      }

      return Promise.resolve();
    }

    updateSendOptions(tracks) {
      this.log('updateSendOptions()', "called with ".concat(JSON.stringify(tracks)));
      var newOfferNeeded = this.mediaConnection.updateSendOptions(tracks);

      if (newOfferNeeded) {
        this.log('updateSendOptions()', 'triggering offer...');
        return this.roap.initiateOffer();
      }

      return Promise.resolve();
    }

    updateReceiveOptions(options) {
      this.log('updateReceiveOptions()', "called with ".concat(JSON.stringify(options)));
      var newOfferNeeded = this.mediaConnection.updateReceiveOptions(options);

      if (newOfferNeeded) {
        this.log('updateReceiveOptions()', 'triggering offer...');
        return this.roap.initiateOffer();
      }

      return Promise.resolve();
    }

    updateSendReceiveOptions(options) {
      this.log('updateSendReceiveOptions()', "called with ".concat(JSON.stringify(options)));
      var newOfferNeeded = this.mediaConnection.updateSendReceiveOptions(options);

      if (newOfferNeeded) {
        this.log('updateSendReceiveOptions()', 'triggering offer...');
        return this.roap.initiateOffer();
      }

      return Promise.resolve();
    }

    getConnectionState() {
      return this.mediaConnection.getConnectionState();
    }

    getStats() {
      return this.mediaConnection.getStats();
    }

    getTransceiverStats() {
      return this.mediaConnection.getTransceiverStats();
    }

    insertDTMF(tones, duration, interToneGap) {
      this.log('insertDTMF()', "called with tones=\"".concat(tones, "\", duration=").concat(duration, ", interToneGap=").concat(interToneGap));
      this.mediaConnection.insertDTMF(tones, duration, interToneGap);
    }

    roapMessageReceived(roapMessage) {
      this.log('roapMessageReceived()', "called with messageType=".concat(roapMessage.messageType, ", seq=").concat(roapMessage.seq));

      if (!this.sdpNegotiationStarted && roapMessage.messageType === 'OFFER') {
        this.sdpNegotiationStarted = true;
        this.mediaConnection.initializeTransceivers(true);
      }

      this.roap.roapMessageReceived(roapMessage);
    }

    onRemoteTrack(event) {
      this.emit(Event$1.REMOTE_TRACK_ADDED, event);
    }

    onConnectionStateChanged(event) {
      this.emit(Event$1.CONNECTION_STATE_CHANGED, event);
    }

    onDtmfToneChanged(event) {
      this.emit(Event$1.DTMF_TONE_CHANGED, event);
    }

    createLocalOffer() {
      return this.mediaConnection.createLocalOffer();
    }

    handleRemoteOffer(sdp) {
      return this.mediaConnection.handleRemoteOffer(sdp);
    }

    handleRemoteAnswer(sdp) {
      return this.mediaConnection.handleRemoteAnswer(sdp);
    }

  }

  var MediaConnections = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Event () { return Event$1; },
    get ConnectionState () { return ConnectionState; },
    get RemoteTrackType () { return RemoteTrackType; },
    RoapMediaConnection: RoapMediaConnection,
    setLogger: setLogger,
    getLogger: getLogger,
    getErrorDescription: getErrorDescription
  });

  var bnrProcessor = {
    isModuleAdded: false,
    workletProcessorUrl: 'https://models.intelligence.webex.com/bnr/1.1.0/noise-reduction-effect.worklet.js'
  };

  function isValidTrack(track) {
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var supportedSampleRates = [16000, 32000, 48000];

    if (supportedConstraints.sampleRate) {
      var settings = getTrackSettings(track);
      var {
        sampleRate
      } = settings;

      if (sampleRate && !supportedSampleRates.includes(sampleRate)) {
        var error = new Error("Sample rate of ".concat(sampleRate, " is not supported."));
        logger.error({
          ID: track.id,
          mediaType: MEDIA_STREAM_TRACK,
          action: 'isValidTrack()',
          description: error.message,
          error
        });
        throw error;
      } else {
        return true;
      }
    } else {
      var _error = new Error('Not supported');

      logger.info({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'isValidTrack()',
        description: _error.message,
        error: _error
      });
      return true;
    }
  }

  function loadProcessor() {
    return _loadProcessor.apply(this, arguments);
  }

  function _loadProcessor() {
    _loadProcessor = _asyncToGenerator__default["default"](function* () {
      logger.info({
        mediaType: MEDIA_STREAM_TRACK,
        action: 'loadProcessor()',
        description: 'Creating and loading BNR module'
      });
      var audioContext = new AudioContext();
      bnrProcessor.isModuleAdded = true;
      bnrProcessor.audioContext = audioContext;
      yield audioContext.audioWorklet.addModule(bnrProcessor.workletProcessorUrl);
      bnrProcessor.workletNode = new AudioWorkletNode(audioContext, 'noise-reduction-worklet-processor');
      return audioContext;
    });
    return _loadProcessor.apply(this, arguments);
  }

  function enableBNR(_x) {
    return _enableBNR.apply(this, arguments);
  }

  function _enableBNR() {
    _enableBNR = _asyncToGenerator__default["default"](function* (track) {
      logger.debug({
        ID: track.id,
        mediaType: MEDIA_STREAM_TRACK,
        action: 'enableBNR()',
        description: 'Called'
      });

      try {
        isValidTrack(track);
        var streamFromTrack = new MediaStream();
        streamFromTrack.addTrack(track);
        var audioContext;
        var workletNode;
        logger.info({
          ID: track.id,
          mediaType: MEDIA_STREAM_TRACK,
          action: 'enableBNR()',
          description: 'Checking if BNR module is present already'
        });

        if (!bnrProcessor.isModuleAdded) {
          logger.debug({
            ID: track.id,
            mediaType: MEDIA_STREAM_TRACK,
            action: 'enableBNR()',
            description: 'BNR module is not present already'
          });
          audioContext = yield loadProcessor();
        } else {
          logger.debug({
            ID: track.id,
            mediaType: MEDIA_STREAM_TRACK,
            action: 'enableBNR()',
            description: 'BNR module is present already'
          });
          var oldDestinationTrack = bnrProcessor.destinationTrack;

          if (track.id === oldDestinationTrack.id) {
            var oldTrackErrorMsg = 'BNR is enabled on the track already';
            var oldTrackError = new Error(oldTrackErrorMsg);
            logger.error({
              ID: track.id,
              mediaType: MEDIA_STREAM_TRACK,
              action: 'enableBNR()',
              description: oldTrackErrorMsg,
              error: oldTrackError
            });
            throw oldTrackError;
          }

          logger.info({
            ID: track.id,
            mediaType: MEDIA_STREAM_TRACK,
            action: 'enableBNR()',
            description: 'Using existing AudioContext'
          });
          audioContext = bnrProcessor.audioContext;
        }

        logger.info({
          ID: track.id,
          mediaType: MEDIA_STREAM_TRACK,
          action: 'enableBNR()',
          description: 'Creating worklet node, connecting source and destination streams'
        });
        workletNode = bnrProcessor.workletNode;
        workletNode.port.postMessage('ENABLE');
        bnrProcessor.sourceNode = audioContext.createMediaStreamSource(streamFromTrack);
        bnrProcessor.sourceNode.connect(workletNode);
        bnrProcessor.destinationStream = audioContext.createMediaStreamDestination();
        workletNode.connect(bnrProcessor.destinationStream);
        logger.info({
          ID: track.id,
          mediaType: MEDIA_STREAM_TRACK,
          action: 'enableBNR()',
          description: 'Obtaining noise reduced track and returning'
        });
        var destinationStream = bnrProcessor.destinationStream.stream;
        var [destinationTrack] = destinationStream.getAudioTracks();
        bnrProcessor.destinationTrack = destinationTrack;
        return destinationTrack;
      } catch (error) {
        logger.error({
          ID: track.id,
          mediaType: MEDIA_STREAM_TRACK,
          action: 'enableBNR()',
          description: 'Error in enableBNR',
          error: error
        });
        throw error;
      }
    });
    return _enableBNR.apply(this, arguments);
  }

  function disableBNR() {
    logger.debug({
      mediaType: MEDIA_STREAM_TRACK,
      action: 'disableBNR()',
      description: 'Called'
    });

    try {
      var workletNode;
      logger.info({
        mediaType: MEDIA_STREAM_TRACK,
        action: 'disableBNR()',
        description: 'Checking if BNR is enabled before disabling'
      });

      if (!bnrProcessor.isModuleAdded) {
        var error = new Error('Can not disable as BNR is not enabled');
        logger.error({
          mediaType: MEDIA_STREAM_TRACK,
          action: 'disableBNR()',
          description: 'Can not disable as BNR is not enabled'
        });
        throw error;
      } else {
        logger.info({
          mediaType: MEDIA_STREAM_TRACK,
          action: 'disableBNR()',
          description: 'Using existing AudioWorkletNode for disabling BNR'
        });
        workletNode = bnrProcessor.workletNode;
      }

      workletNode.port.postMessage('DISPOSE');
      logger.info({
        mediaType: MEDIA_STREAM_TRACK,
        action: 'disableBNR()',
        description: 'Obtaining raw media stream track and removing bnr context'
      });
      var bnrDisabledStream = bnrProcessor.sourceNode.mediaStream;
      var [track] = bnrDisabledStream === null || bnrDisabledStream === void 0 ? void 0 : bnrDisabledStream.getAudioTracks();
      bnrProcessor.isModuleAdded = false;
      delete bnrProcessor.workletNode;
      delete bnrProcessor.audioContext;
      delete bnrProcessor.sourceNode;
      delete bnrProcessor.destinationStream;
      delete bnrProcessor.destinationTrack;
      return track;
    } catch (error) {
      logger.error({
        mediaType: MEDIA_STREAM_TRACK,
        action: 'disableBNR()',
        description: 'Error in disableBNR',
        error: error
      });
      throw error;
    }
  }

  function isBrowserSupported() {
    var isSupported = false;
    logger.info({
      mediaType: MEDIA,
      action: 'isBrowserSupported()',
      description: 'Checking is current browser supported by webrtc'
    });

    if ((DetectRTC.exports.browser.isChrome || DetectRTC.exports.browser.isFirefox || DetectRTC.exports.browser.isSafari || DetectRTC.exports.browser.isEdge) && DetectRTC.exports.isWebRTCSupported) {
      isSupported = true;
    }

    return isSupported;
  }
  var Media = {
    createAudioTrack: createAudioTrack,
    createVideoTrack: createVideoTrack,
    createContentTrack: createContentTrack,
    getCameras: getCameras,
    getMicrophones: getMicrophones,
    getSpeakers: getSpeakers,
    on: on,
    off: off,
    Effects: {
      BNR: {
        enableBNR: enableBNR,
        disableBNR: disableBNR
      }
    },
    isBrowserSupported
  };
  var MediaConnection = MediaConnections;

  exports.Media = Media;
  exports.MediaConnection = MediaConnection;
  exports.isBrowserSupported = isBrowserSupported;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
