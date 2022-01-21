import {activeSubscriptions} from './Subscription';

const deviceList: Array<MediaDeviceInfo> = [];
const subscriptions: activeSubscriptions = {
  events: {
    'device:changed': new Map(),
  },
};

/*
 * Makes calls to individual subscription listeners obtained through subscribe method
 * @returns promise that is resolved with void
*/
async function deviceChangePublisher() : Promise<void> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn('navigator.mediaDevices.enumerateDevices() is not supported.');

    return;
  }
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
    [
      getGroupIdsFrom,
      filterDevicesFrom,
      action,
    ] = newDeviceList.length < deviceList.length ? [
      newDeviceList,
      deviceList,
      'removed',
    ] : [
      deviceList,
      newDeviceList,
      'added',
    ];

    getGroupIdsFrom.forEach((device) => {
      deviceListGroups.add(device.groupId);
    });

    filtered = filterDevicesFrom.filter((device) => !deviceListGroups.has(device.groupId));

    deviceList.splice(0, deviceList.length);
    deviceList.push(...newDeviceList);

    for (const entry of deviceChangedListeners) {
      const listener = entry[1];

      if (listener) {
        listener({
          action,
          devices: filtered,
        });
      }
    }
  }
}

export {
  subscriptions,
  deviceList,
  deviceChangePublisher,
};
