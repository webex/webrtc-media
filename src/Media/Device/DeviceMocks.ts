export const fakeDevices = [
  {
    deviceId: 'default',
    kind: 'audioinput',
    label: 'Fake Default Audio Input',
    groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c1',
  },
  {
    deviceId: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
    kind: 'audioinput',
    label: 'Fake Audio Input 1',
    groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
  },
  {
    deviceId: '3786a0243c13d1bc4f39b8091b468f43b14ace215ecd4e878268f095a9d3ba94',
    kind: 'audioinput',
    label: 'Fake Audio Input 2',
    groupId: 'cb709a56a05b4683a1ef0e8f52144a2afcdc80137a87b8f398c00d1e07d46c48',
  },
  {
    deviceId: '479d27bedc007f21231d7e30e20b8ad0c220cc1dd7a800256564c5134167d542',
    kind: 'videoinput',
    label: 'fake_device_0',
    groupId: '6ef67974f928bbe32043f571d203d39659f9fa42ce1588745f783a476fbfa6a8',
  },
  {
    deviceId: 'default',
    kind: 'audiooutput',
    label: 'Fake Default Audio Output',
    groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c1',
  },
  {
    deviceId: 'd9feb221c64d6bf7c3ba735c0e70afc2bcd4598053ec3a3f11101d28f6b76945',
    kind: 'audiooutput',
    label: 'Fake Audio Output 1',
    groupId: 'a0df3f514c52d1e5a567863b9fd852f53d259c09640ace42d724867eafbfe593',
  },
  {
    deviceId: 'd2e765431584de6404c45f91c0e3b2c48693305b1341de7ae909925108a1758f',
    kind: 'audiooutput',
    label: 'Fake Audio Output 2',
    groupId: '14ec82d4008126d0fe70c3e61646eb966a423cddfa7da12749e9b70cedbb639b',
  },
];

// eslint-disable-next-line max-len
const originalEnumerateDevices = navigator.mediaDevices
  ? navigator.mediaDevices.enumerateDevices
  : null;

export const setupMediaDeviceMocks = (): void => {
  Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
    writable: true,
    value: async () => fakeDevices,
  });
  console.warn('Setting up Mocks on navigator.mediaDevices');
};

export const resetMediaDeviceMocks = (): void => {
  Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
    writable: true,
    value: originalEnumerateDevices,
  });
};
