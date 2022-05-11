// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    increaseSeq: 'always' | 'INITIATE_OFFER' | 'ERROR_ARRIVED';
    sendOutOfOrderError:
      | 'REMOTE_OFFER_ARRIVED'
      | 'REMOTE_OFFER_REQUEST_ARRIVED'
      | 'REMOTE_ANSWER_ARRIVED'
      | 'REMOTE_OK_ARRIVED';
    updateSeq:
      | 'REMOTE_OFFER_ARRIVED'
      | 'REMOTE_OFFER_REQUEST_ARRIVED'
      | 'REMOTE_ANSWER_ARRIVED'
      | 'REMOTE_OK_ARRIVED';
    setOfferRequestFlag: 'REMOTE_OFFER_REQUEST_ARRIVED';
    ignoreDuplicate:
      | 'REMOTE_ANSWER_ARRIVED'
      | 'REMOTE_OFFER_REQUEST_ARRIVED'
      | 'REMOTE_OFFER_ARRIVED';
    sendInvalidStateError:
      | 'REMOTE_ANSWER_ARRIVED'
      | 'REMOTE_OK_ARRIVED'
      | 'REMOTE_OFFER_ARRIVED'
      | 'REMOTE_OFFER_REQUEST_ARRIVED';
    sendRoapOfferResponseMessage: 'done.invoke.roap.creatingLocalOffer:invocation[0]';
    sendRoapOfferMessage: 'done.invoke.roap.creatingLocalOffer:invocation[0]';
    enqueueNewOfferCreation: 'INITIATE_OFFER';
    handleGlare: 'REMOTE_OFFER_ARRIVED' | 'REMOTE_OFFER_REQUEST_ARRIVED';
    resetRetryCounter: 'REMOTE_ANSWER_ARRIVED';
    increaseRetryCounter: 'ERROR_ARRIVED';
    sendRoapOKMessage: 'done.invoke.roap.settingRemoteAnswer:invocation[0]';
    resetOfferRequestFlag: 'done.invoke.roap.settingRemoteAnswer:invocation[0]';
    sendGenericError:
      | 'error.platform.roap.settingRemoteAnswer:invocation[0]'
      | 'error.platform.roap.settingRemoteOffer:invocation[0]';
    sendRoapAnswerMessage: 'done.invoke.roap.settingRemoteOffer:invocation[0]';
    sendRetryAfterError: 'REMOTE_OFFER_ARRIVED';
    resetPendingLocalOffer:
      | 'always'
      | 'INITIATE_OFFER'
      | 'REMOTE_OFFER_REQUEST_ARRIVED'
      | 'done.invoke.roap.creatingLocalOffer:invocation[0]'
      | 'ERROR_ARRIVED';
  };
  internalEvents: {
    'done.invoke.roap.creatingLocalOffer:invocation[0]': {
      type: 'done.invoke.roap.creatingLocalOffer:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.roap.settingRemoteAnswer:invocation[0]': {
      type: 'done.invoke.roap.settingRemoteAnswer:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.roap.settingRemoteAnswer:invocation[0]': {
      type: 'error.platform.roap.settingRemoteAnswer:invocation[0]';
      data: unknown;
    };
    'error.platform.roap.settingRemoteOffer:invocation[0]': {
      type: 'error.platform.roap.settingRemoteOffer:invocation[0]';
      data: unknown;
    };
    'done.invoke.roap.settingRemoteOffer:invocation[0]': {
      type: 'done.invoke.roap.settingRemoteOffer:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.roap.creatingLocalOffer:invocation[0]': {
      type: 'error.platform.roap.creatingLocalOffer:invocation[0]';
      data: unknown;
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    createLocalOffer: 'done.invoke.roap.creatingLocalOffer:invocation[0]';
    handleRemoteAnswer: 'done.invoke.roap.settingRemoteAnswer:invocation[0]';
    handleRemoteOffer: 'done.invoke.roap.settingRemoteOffer:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    createLocalOffer:
      | 'always'
      | 'INITIATE_OFFER'
      | 'REMOTE_OFFER_REQUEST_ARRIVED'
      | 'done.invoke.roap.creatingLocalOffer:invocation[0]'
      | 'ERROR_ARRIVED';
    handleRemoteOffer: 'REMOTE_OFFER_ARRIVED';
    handleRemoteAnswer: 'REMOTE_ANSWER_ARRIVED';
  };
  eventsCausingGuards: {
    isPendingLocalOffer: 'always' | 'done.invoke.roap.creatingLocalOffer:invocation[0]';
    isLowerOrEqualSeq: 'REMOTE_OFFER_ARRIVED' | 'REMOTE_OFFER_REQUEST_ARRIVED';
    isLowerSeq:
      | 'REMOTE_ANSWER_ARRIVED'
      | 'REMOTE_OK_ARRIVED'
      | 'REMOTE_OFFER_ARRIVED'
      | 'REMOTE_OFFER_REQUEST_ARRIVED';
    isSameSeq: 'REMOTE_ANSWER_ARRIVED' | 'ERROR_ARRIVED' | 'REMOTE_OFFER_ARRIVED';
    isHandlingOfferRequest:
      | 'done.invoke.roap.creatingLocalOffer:invocation[0]'
      | 'REMOTE_OFFER_REQUEST_ARRIVED';
    shouldErrorTriggerOfferRetry: 'ERROR_ARRIVED';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'browserError'
    | 'remoteError'
    | 'idle'
    | 'creatingLocalOffer'
    | 'waitingForAnswer'
    | 'settingRemoteAnswer'
    | 'settingRemoteOffer'
    | 'waitingForOK';
  tags: never;
}
