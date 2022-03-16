import {DEVICE, TRACK} from '../../constants';
import logger from '../../Logger';
import type {Track} from '../Track';
import {activeSubscriptions} from './Subscription';

const deviceList: Array<MediaDeviceInfo> = [];
const subscriptions: activeSubscriptions = {
  events: {
    'device:changed': new Map(),
    'track:mute': new Map(),
  },
};

/*
 * Makes calls to individual subscription listeners obtained through subscribe method
 * @returns promise that is resolved with void
 */
async function deviceChangePublisher(): Promise<void> {
  logger.debug({
    mediaType: DEVICE,
    action: 'deviceChangePublisher()',
    description: 'Called',
  });
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn('navigator.mediaDevices.enumerateDevices() is not supported.');

    return;
  }

  logger.info({
    mediaType: DEVICE,
    action: 'deviceChangePublisher()',
    description: 'Calling individual subscription listener obtained by device change event',
  });
  const newDeviceList: Array<MediaDeviceInfo> = await navigator.mediaDevices.enumerateDevices();
  const deviceChangedListeners = subscriptions.events['device:changed'];
  let filtered: Array<MediaDeviceInfo> = [];
  let getGroupIdsFrom: Array<MediaDeviceInfo> = [];
  let filterDevicesFrom: Array<MediaDeviceInfo> = [];
  let action = 'changed';
  const deviceListGroups = new Set();

  if (newDeviceList.length !== deviceList.length) {
    /**
     * When a phyisical device is removed / added, two MediaDevice gets added
     * One input & one output device.
     * `groupid` is the only thing common between these two MediaDevices
     * So, the following code is to filter both of those devices based on group ID to pass on to subscribed listeners
     */
    [getGroupIdsFrom, filterDevicesFrom, action] =
      newDeviceList.length < deviceList.length
        ? [newDeviceList, deviceList, 'removed']
        : [deviceList, newDeviceList, 'added'];

    getGroupIdsFrom.forEach((device) => {
      deviceListGroups.add(device.groupId);
    });

    filtered = filterDevicesFrom.filter((device) => !deviceListGroups.has(device.groupId));

    deviceList.splice(0, deviceList.length);
    deviceList.push(...newDeviceList);

    for (const entry of deviceChangedListeners) {
      const {method: listener} = entry[1];

      if (listener) {
        listener({
          action,
          devices: filtered,
        });
      }
    }
  }
}

function trackMutePublisher(event: Event, track: Track, module?:string): void {
  logger.debug({
    ID: track.ID,
    mediaType: TRACK,
    action: 'trackMutePublisher()',
    description: `Called with ${JSON.stringify(event)} ${JSON.stringify(track)}`,
  });
  logger.info({
    ID: track.ID,
    mediaType: TRACK,
    action: 'trackMutePublisher()',
    description: 'Calling track subscription listener obtained by track mute event',
  });

  const onmuteListeners = subscriptions.events['track:mute'];
  const currentTrack = <MediaStreamTrack>event.target;

  for (const entry of onmuteListeners) {
    const {module: listnerModule, method: listener} = entry[1];
    const action = currentTrack.enabled ? 'muted' : 'unmuted';

    if (listnerModule === module && listener) {
      listener({
        action,
        track: <Track>track,
      });
    }
  }
}

export {subscriptions, deviceList, deviceChangePublisher, trackMutePublisher};
