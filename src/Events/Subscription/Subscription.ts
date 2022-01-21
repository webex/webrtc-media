interface subscriptionEvent{
  'action': string,
  'devices': Array<MediaDeviceInfo>
}

interface activeSubscriptions{
  'events': {
    [key: string]: Map<string, (event: subscriptionEvent) => void>,
  }
}

interface subscription{
  'type': string,
  'listener': {
    id: string,
    method: (event: subscriptionEvent) => void
  }
}

export {
  subscriptionEvent,
  activeSubscriptions,
  subscription,
};
