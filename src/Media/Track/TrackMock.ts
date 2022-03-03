interface FakeMediaTrackEvent {
  target: {
    [key: string]: unknown
  }
}

export const fakeAudioTracks = [
  {
    id: 'default',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Default Audio Input',
    groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c1',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
  {
    id: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
    kind: 'audio',
    readyState: 'live',
    muted: true,
    label: 'Fake Audio Input 1',
    groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
  {
    id: '3786a0243c13d1bc4f39b8091b468f43b14ace215ecd4e878268f095a9d3ba94',
    kind: 'audio',
    readyState: 'ended',
    muted: true,
    label: 'Fake Audio Input 2',
    groupId: 'cb709a56a05b4683a1ef0e8f52144a2afcdc80137a87b8f398c00d1e07d46c48',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
];

export const fakeVideoTracks = [
  {
    id: 'default',
    kind: 'video',
    readyState: 'live',
    muted: true,
    label: 'Fake Default Video Input',
    groupId: 'a6b4fb6a105c92a16a6e2f3fb4efe289a783304764be026d4f973febf805c0c1',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
  {
    id: '47dd6c612bb77e7992cb8f026b660c59648e8105baf4c569f96d226738add9a4',
    kind: 'video',
    readyState: 'live',
    muted: true,
    label: 'Fake Video Input 1',
    groupId: '99782d7b13f331947c1a9865b27cf7eabffbfd48cfe21ab99867d101c6d7b4d0',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
  {
    id: '3786a0243c13d1bc4f39b8091b468f43b14ace215ecd4e878268f095a9d3ba94',
    kind: 'video',
    readyState: 'ended',
    muted: true,
    label: 'Fake Video Input 2',
    groupId: 'cb709a56a05b4683a1ef0e8f52144a2afcdc80137a87b8f398c00d1e07d46c48',
    onmute: (event: FakeMediaTrackEvent): FakeMediaTrackEvent => event,
    enabled: false,
  },
];

const originalGetUserMedia = navigator.mediaDevices ? navigator.mediaDevices.getUserMedia : null;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line
const originalGetDisplayMedia = navigator.mediaDevices ? navigator.mediaDevices.getDisplayMedia : null;

interface ConstraintsInterface {
  audio: {
    deviceId: {
      exact: string
    }
  }
  video: {
    deviceId: {
      exact: string
    }
  }
}

export const setupMediaTrackMocks = (): void => {
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
    writable: true,
    value: async (constraints: ConstraintsInterface) => ({
      getAudioTracks: () => (constraints.audio?.deviceId?.exact
        // eslint-disable-next-line max-len
        ? fakeAudioTracks.filter((mediaStreamTrack) => mediaStreamTrack.id === constraints.audio?.deviceId.exact)
        : fakeAudioTracks),
      getVideoTracks: () => (constraints.video?.deviceId?.exact
      // eslint-disable-next-line max-len
        ? fakeVideoTracks.filter((mediaStreamTrack) => mediaStreamTrack.id === constraints.video?.deviceId.exact)
        : fakeVideoTracks),
    }),
  });

  Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
    writable: true,
    value: async () => ({
      getVideoTracks: () => fakeVideoTracks,
    }),
  });
  console.warn('Setting up Mocks on navigator.mediaDevices');
};

export const setupEmptyMediaTrackMocks = (): void => {
  Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
    writable: true,
    value: async () => Promise.reject(Error),
  });
  console.warn('Setting up Mocks on navigator.mediaDevices');
};

export const resetMediaTrackMocks = (): void => {
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
    writable: true,
    value: originalGetUserMedia,
  });

  Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
    writable: true,
    value: originalGetDisplayMedia,
  });
};
