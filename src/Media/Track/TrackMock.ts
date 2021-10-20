export const fakeTracks = [
  {
    id: 'default',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Default Audio Input',
    groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c1',
  },
  {
    id: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Audio Input 1',
    groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
  },
  {
    id: '3786a0243c13d1bc4f39b8091b468f43b14ace215ecd4e878268f095a9d3ba94',
    kind: 'audio',
    readyState: 'ended',
    muted: true,
    label: 'Fake Audio Input 2',
    groupId: 'cb709a56a05b4683a1ef0e8f52144a2afcdc80137a87b8f398c00d1e07d46c48',
  },
  {
    id: '479d27bedc007f21231d7e30e20b8ad0c220cc1dd7a800256564c5134167d542',
    kind: 'video',
    readyState: 'live',
    muted: true,
    label: 'fake_device_0',
    groupId: '6ef67974f928bbe32043f571d203d39659f9fa42ce1588745f783a476fbfa6a8',
  },
  {
    id: 'default',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Default Audio Output',
    groupId: 'e0d70595a03e14932924c77b7ef27906323e4276c89f87148aea392c5e297f1b',
  },
  {
    id: 'd9feb221c64d6bf7c3ba735c0e70afc2bcd4598053ec3a3f11101d28f6b76945',
    kind: 'audio',
    readyState: 'ended',
    muted: true,
    label: 'Fake Audio Output 1',
    groupId: 'a0df3f514c52d1e5a567863b9fd852f53d259c09640ace42d724867eafbfe593',
  },
  {
    id: 'd2e765431584de6404c45f91c0e3b2c48693305b1341de7ae909925108a1758f',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Audio Output 2',
    groupId: '14ec82d4008126d0fe70c3e61646eb966a423cddfa7da12749e9b70cedbb639b',
  },
];

const originalGetUserMedia = navigator.mediaDevices ? navigator.mediaDevices.getUserMedia : null;

interface ConstraintsInterface {
  audio: {
    deviceId: {
      exact: string
    }
  }
}

export const setupMediaTrackMocks = (): void => {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: async (constraints: ConstraintsInterface) => ({
        getAudioTracks: () => (constraints.audio?.deviceId?.exact
        // eslint-disable-next-line max-len
          ? fakeTracks.filter((mediaStreamTrack) => mediaStreamTrack.id === constraints.audio?.deviceId.exact)
          : fakeTracks),
      }),
    },
  });
  console.warn('Setting up Mocks on navigator.mediaDevices');
};

export const resetMediaTrackMocks = (): void => {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      originalGetUserMedia,
    },
  });
};
