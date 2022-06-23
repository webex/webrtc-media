# [1.23.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.22.0...v1.23.0) (2022-06-23)


### Features

* **MediaConnection:** added support for DTMF ([a167e05](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a167e0542894b96a0b085444c185123ba3c6aa82))

# [1.22.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.21.0...v1.22.0) (2022-06-20)


### Bug Fixes

* **MediaConnection:** removed unused fields from RoapMessage ([c269fc2](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/c269fc28d57f7002bc5d3fcf6417fd51ae79c1a0))


### Features

* **MediaConnection:** reconnect() implemented ([9b2ad2d](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/9b2ad2df720dca202d5e0d543449b727d26928dc))

# [1.21.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.20.1...v1.21.0) (2022-06-13)


### Features

* **MediaConnection:** added getStats() method ([24ac6b4](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/24ac6b4ea4788bbe19f412bcafa7f5e47310f4de))

## [1.20.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.20.0...v1.20.1) (2022-06-09)


### Bug Fixes

* refactored dependencies between MediaConnection and Roap, created RoapMediaConnection ([2e70903](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/2e70903efa4bab1335125ff53cdabea644d6f8cd))

# [1.20.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.8...v1.20.0) (2022-06-07)


### Bug Fixes

* **MediaConnection:** local tracks are added again on 2nd offer in incoming calls ([8c5c31b](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/8c5c31b9c034c9738b25f10617573ce83cee73c8))
* unit tests after merge with latest master ([d2557c0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/d2557c001d85df7f33c39a51ba25575bd6559dec))


### Features

* added skipInactiveTransceivers to MediaConnectionConfig ([61420a8](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/61420a8059b646120e3e3f22d810e4fbaa87dfb8))

## [1.19.8](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.7...v1.19.8) (2022-05-26)


### Bug Fixes

* **roap:** promise returned by initiateOffer() ([b5aff90](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/b5aff900e52b313c8274b2c3ff556642f2423039))

## [1.19.7](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.6...v1.19.7) (2022-05-18)


### Bug Fixes

* **roap:** added roap test for queueing of local offers ([c3ed133](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/c3ed13368425c1e527b00357d68f8fd662143319))
* **roap:** added tests for messages with old seq ([7483294](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/7483294de4b5cf711ce66858f10d733be465ea36))
* **roap:** emitting Event.ROAP_FAILURE on browserError entry ([c091d93](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/c091d932394008e842116443cb8a82e85bbfbe2b))
* **roap:** karma builds ([ca33f9f](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/ca33f9f5335ab072e5302119432473347f9f256d))
* **roap:** more roap unit tests and 1 small fix ([503f821](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/503f821085b0f0aa3849465f20dc0fa5ddbaf07c))
* **roap:** more tests, added errorType enum, improved jest console logs ([220fded](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/220fded478d9cb23ee94a55a1d9a1a7aa7f59a54))
* **roap:** test refactor ([45e9e4f](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/45e9e4f632c376ff40dc80f0f5e8b5a0588f632a))

## [1.19.6](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.5...v1.19.6) (2022-05-16)


### Bug Fixes

* **media:** clean up the mock ([0a9ffa0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/0a9ffa0613fe8bca3e4b2084f4093cb88c80e27a))
* add custom tracks and remove un unsed code ([916025e](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/916025e83c393d315c4c9828eea93ef0e99604ae))
* **Track:** add events and remove subscription ([a4902e8](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a4902e8c344d09063b2525b68d1d713d38ea69a0))
* adding typescript to roap state machine, fixing typos in some event names ([7672d28](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/7672d2820499f5d1ab4b0175646a7bd56a3ee288))
* improved logs in roap unit tests ([8007726](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/80077266e29893a4ec16c9e7869d3d6e7f9d383b))
* incorrect use of 'always' in roap state machine ([5b7253c](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/5b7253c3695533a63d5071eada496321bdb69d29))
* spark-318696 take out SDP processing code out of roap module ([93f3cff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/93f3cff40db2484dc9b22098a6e5898a42d7ed93))

## [1.19.5](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.4...v1.19.5) (2022-05-05)


### Bug Fixes

* improved error logging in Firefox ([bd7d1dc](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/bd7d1dcd4b80db2fa308df276d0c18c38a538ffd))
* integration tests for ChromeHeadless ([5d558a0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/5d558a00a3694bb3b6e7e16d1c3057abd86d7bba))
* integration tests for MediaConnection on Firefox ([6c6610c](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/6c6610c671ec65635dec29c18830b0510e2ae0ba))
* removed 'fsm' from roap method names ([d0c776a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/d0c776abc9f9590f5adc7815dc32f1cb67e2a64f))
* updated karma version to fix logging warnings ([6fbe6c6](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/6fbe6c63856b4069bfe41583dddbbe5980adfe7b))
* updateReceiveOptions() ignores arguments passed ([9bcd061](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/9bcd06159652275e7374164470955443e6d9f6e3))
* using xstate for roap state machine ([535f16f](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/535f16f1385c2a72e68839aefd902f6bd2a6d066))

## [1.19.4](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.3...v1.19.4) (2022-05-02)


### Bug Fixes

* export types as part of the esm changes ([bdcc5de](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/bdcc5dee62cd3e1ff016663d746139f1ce63b40d))

## [1.19.3](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.2...v1.19.3) (2022-04-29)


### Bug Fixes

* publish esm rather then the transpiled version ([4fb82f0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/4fb82f04b2b8076149746a62feffb0a33db644fc))

## [1.19.2](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.1...v1.19.2) (2022-04-08)


### Bug Fixes

* **media:** export createContentTrack ([8db34fa](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/8db34fa8b1610d55a90ecb128ad2661e75c55422))

## [1.19.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.19.0...v1.19.1) (2022-03-29)


### Bug Fixes

* modified mainEntryPointFilePath to rectify jenkins build failure ([6c80231](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/6c802318e204638d1d7d754471e57ef8318213a4))

# [1.19.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.18.1...v1.19.0) (2022-03-29)


### Features

* **media:** is codec available ([500c928](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/500c928618d66e5ac1b0cadfb344797109e5ddea))

## [1.18.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.18.0...v1.18.1) (2022-03-28)


### Bug Fixes

* **exports:** Media exports ([909b020](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/909b0202789511a19177cee544e94f632f983e38))

# [1.18.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.17.0...v1.18.0) (2022-03-24)


### Features

* **media:** added subscription capabilities to track ([1b3e981](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/1b3e981cc7775f61436391d773493aa172872f13))

# [1.17.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.16.1...v1.17.0) (2022-03-22)


### Bug Fixes

* **webrtc-core:** fix linting errors and pretify ([cb368d7](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/cb368d7c80b969d25ed880639a600792cc1894b2))


### Features

* add rollup config to bundle it via esm ([a7dd4a5](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a7dd4a587b58846ae5f34c4c1ce7cb605bb21257))

## [1.16.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.16.0...v1.16.1) (2022-03-15)


### Bug Fixes

* **logger:** replace winston logger with a custom logger ([58cfded](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/58cfded7c232c571dbfedb56af217cc72fae23cd))

# [1.16.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.15.0...v1.16.0) (2022-03-15)


### Bug Fixes

* logging when SDP checks fail ([8e6aec1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/8e6aec1fba6d23db54c35ea4bbc0eb8137dbf927))
* media connection establishment in Firefox ([e2003f6](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/e2003f6a4160d521cc60977f096859a1c217301f))


### Features

* updateSendReceiveOptions() added to MediaConnection ([bdac04d](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/bdac04d50c437ec8a6cb8d8458e8dbee4880c8c0))

# [1.15.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.14.0...v1.15.0) (2022-03-10)


### Features

* **media:** added debug logs in webrtc media files ([c452ec7](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/c452ec728faa380fbfa89d776b8c58a1f8c14f77))

# [1.14.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.13.0...v1.14.0) (2022-03-08)


### Bug Fixes

* added setContentSlides() ([0d9c3cf](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/0d9c3cfe5b78328de2d1ba7912e67b4ac4d46ee3))
* allow easier typescript debugging in karma tests ([bf2f17a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/bf2f17a8614d0ff71e9f1a76dfe72ee806dd0173))
* using logging module ([a6d2d20](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a6d2d20207512e356b793b237261edc11c3001bc))


### Features

* **MediaConnection:** initial version created ([e126c2a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/e126c2a7575fba3da7f69b4b5aa7618614edae49))

# [1.13.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.12.0...v1.13.0) (2022-03-08)


### Features

* **media:** added info logs in webrtc media files ([653944a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/653944a3a17f4521ec724906e9876c901bd9f103))

# [1.12.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.11.0...v1.12.0) (2022-03-08)


### Features

* **media:** add error logs for media ([833d102](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/833d102a459e5796a7e53aca45f9484aa543ef64))

# [1.11.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.10.0...v1.11.0) (2022-03-07)


### Features

* **track:** new method to return underlying mediaStreamTrack ([160b1a5](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/160b1a551e0efa84b818a48d4f59da57e3ac6864))

# [1.10.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.9.0...v1.10.0) (2022-02-28)


### Bug Fixes

* **media:** added winston and set immediate ([91fb627](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/91fb627b315effabe14032872ce2157035858e2c))


### Features

* **media:** configure winston logger ([e96e639](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/e96e63919b38e8680ab805ef42f5d0c0a11724fb))

# [1.9.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.8.0...v1.9.0) (2022-02-17)


### Features

* **media:** track mute event ([728231a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/728231ac6e8e9960427dfe2251000d131223a268))

# [1.8.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.7.0...v1.8.0) (2022-02-17)


### Features

* **media:** allow for custom constraints on content tracks ([9178d26](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/9178d262d032a5d8f135e04f1628931bf39e3857))

# [1.7.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.6.0...v1.7.0) (2022-02-16)


### Features

* **track:** apply constraints for track from given input ([8a9363a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/8a9363a15159f472a0a5e6da04a30fac91b6dc7b))

# [1.6.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.5.0...v1.6.0) (2022-02-15)


### Bug Fixes

* **media:** added dependency for detectrtc ([806800f](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/806800f9c055a8b2a67178ff81460054f28e6d3a))


### Features

* **media:** implement is browser supported ([2e19a49](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/2e19a4999d9b6646f160351a0ad70fb9ec271b9f))

# [1.5.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.4.0...v1.5.0) (2022-02-11)


### Features

* **media:** unsubscribe events ([0dabc13](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/0dabc1361f38bc92166b1419c0fa7c04a5001d18))

# [1.4.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.3.0...v1.4.0) (2022-02-02)


### Bug Fixes

* **media:** add uuid package to manage subsriptions ([e801935](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/e801935e13501fef87571a0caad8b3cce17a8bd3))


### Features

* **media:** subscribe method and device change listener ([660996c](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/660996c1b57441af116d173200dc7fe04be42f93))

# [1.3.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.2.0...v1.3.0) (2022-02-01)


### Features

* **Media:** implemented createAudioTrack ([7946ccc](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/7946cccdd6b5638d275ae37e832c815853ba5cba))
* **Media:** implemented createContentTrack ([a163657](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a16365702efefb2e3ba12dd6f8c265cee76e4ab3))
* **Media:** implemented createContentTrack ([a75987b](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/a75987b50471fdfa87ef46dc0e49649437e766e1))
* **Media:** implemented createVideoTrack ([93d57dd](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/93d57dd7a71d369c36a3c7a010f14db41f7655eb))

# [1.2.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.2...v1.2.0) (2021-10-20)


### Features

* **Device:** define device object ([cc6d77f](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/cc6d77f7d3fbd3bea31c6d05fb38d2048b6c2b8d))
* **Track:** defined Track class ([ce363e7](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/ce363e7fe0822586c37d503caaf99d5490752237))

## [1.1.2](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.1...v1.1.2) (2021-10-13)


### Bug Fixes

* **release:** readded npm token for release script ([149c27a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/149c27aea53961ed8d08045f4293a2300752277b))

## [1.1.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* **release:** update credentials for release script ([dd9b3ff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/dd9b3ffd6e321ccf68bf69747e7a25d6d90d34fd))

## [1.1.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* **release:** update credentials for release script ([dd9b3ff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/dd9b3ffd6e321ccf68bf69747e7a25d6d90d34fd))

## [1.1.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* **release:** update credentials for release script ([dd9b3ff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/dd9b3ffd6e321ccf68bf69747e7a25d6d90d34fd))

## [1.1.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* **release:** update credentials for release script ([dd9b3ff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/dd9b3ffd6e321ccf68bf69747e7a25d6d90d34fd))

## [1.1.1](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* **release:** update credentials for release script ([dd9b3ff](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/dd9b3ffd6e321ccf68bf69747e7a25d6d90d34fd))

# [1.1.0](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare/v1.0.0...v1.1.0) (2021-10-06)


### Features

* **Devices:** add Device methods ([683bc1a](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/683bc1ac7abffabe5aa8b16f1c66012f853c1ed8))

# 1.0.0 (2021-09-29)


### Bug Fixes

* **deps:** add api-documenter/extractor dependency ([2cbf5e8](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/commit/2cbf5e8b4a8796aff1b90dba1676e08cb788e4ef))
