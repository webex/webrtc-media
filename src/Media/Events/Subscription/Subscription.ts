import type {Track} from '../../Track';

interface subscriptionEvent {
  action: string;
  devices?: Array<MediaDeviceInfo>;
  track?: Track;
}

interface subscriptionListener {
  module: string;
  method: (event: subscriptionEvent) => void;
}

interface activeSubscriptions {
  events: {
    [key: string]: Map<string, subscriptionListener>;
  };
}

interface subscription {
  type: string;
  listener: {
    id: string;
    method: (event: subscriptionEvent) => void;
  };
}

export {subscriptionEvent, activeSubscriptions, subscription, subscriptionListener};
