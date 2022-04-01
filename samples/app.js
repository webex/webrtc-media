const kindOfDevices = {
  AUDIO_INPUT: 'audioinput',
  AUDIO_OUTPUT: 'audiooutput',
  VIDEO_INPUT: 'videoinput',
};
const mediaMethods = webrtcCore.Media;
const videoElement = document.querySelector('video#localVideo');
const screenshareElement = document.querySelector('video#localScreenshare');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoInputSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoInputSelect];

// This function is for handling error if promises getting failed
function handleError(error) {
  // eslint-disable-next-line no-console
  console.log('webrtcCore Media error: ', error.message, error.name);
}

// This function will create option for selectbox and return that option to caller
function buildSelectOption(device) {
  const childOption = document.createElement('option');

  childOption.value = device.ID;

  return childOption;
}

// This function is for building dropdowns of Microphones
function buildAudioInputSelection(audioInputDevices) {
  audioInputDevices.forEach((audioInputDevice) => {
    const childOption = buildSelectOption(audioInputDevice);

    childOption.text = audioInputDevice.label || `Microphone ${audioInputSelect.length + 1}`;
    audioInputSelect.appendChild(childOption);
  });
}

// This function is for building dropdowns of Speakers
function buildAudioOutputSelection(audioOutputDevices) {
  audioOutputDevices.forEach((audioOutputDevice) => {
    const childOption = buildSelectOption(audioOutputDevice);

    childOption.text = audioOutputDevice.label || `Speaker ${audioInputSelect.length + 1}`;
    audioOutputSelect.appendChild(childOption);
  });
}

// This function is for building dropdowns of Cameras
function buildVideoInputSelection(videoInputDevices) {
  videoInputDevices.forEach((videoInputDevice) => {
    const childOption = buildSelectOption(videoInputDevice);

    childOption.text = videoInputDevice.label || `Camera ${audioInputSelect.length + 1}`;
    videoInputSelect.appendChild(childOption);
  });
}

// This function is running camera video stream in box of local video
function buildLocalVideo(videoTrack) {
  videoElement.srcObject = new MediaStream([videoTrack.getMediaStreamTrack()]);
}

// This function is running screenshare video stream in box of local screen share
function buildLocalScreenshare(contentTrack) {
  screenshareElement.srcObject = new MediaStream([contentTrack.getMediaStreamTrack()]);
}

// This functions is for building dropdowns of all selectboxes and preserve the previously selected value.
function gotDevices(devices) {
  // Handles being called several times to update labels. Preserve values.

  const values = selectors.map((selector) => selector.value);

  selectors.forEach((selector) => {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  });

  buildAudioInputSelection(devices[0]);
  buildVideoInputSelection(devices[1]);
  buildAudioOutputSelection(devices[2]);

  selectors.forEach((selector, selectorIndex) => {
    if (
      Array.prototype.slice.call(selector.childNodes).some((n) => n.value === values[selectorIndex])
    ) {
      // eslint-disable-next-line no-param-reassign
      selector.value = values[selectorIndex];
    }
  });
}

// This functions is for running video streams in boxes and return the promise of getting all devices.
function gotTracks(tracks) {
  buildLocalVideo(tracks[0]);
  buildLocalScreenshare(tracks[2]);

  const devicePromises = [
    mediaMethods.getMicrophones(),
    mediaMethods.getCameras(),
    mediaMethods.getSpeakers(),
  ];

  return Promise.all(devicePromises);
}

// This function is starting point of app. it will will get all tracks and then run next operation.
function start({audioPayload = '', videoPayload = '', contentPayload = ''}) {
  const trackPromises = [
    mediaMethods.createVideoTrack(videoPayload),
    mediaMethods.createAudioTrack(audioPayload),
    mediaMethods.createContentTrack(contentPayload),
  ];

  Promise.all(trackPromises).then(gotTracks).then(gotDevices).catch(handleError);
}

// This function is for changing audio input device on dropdown change and clicking the button updateAudio.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setAudioInputDevice() {
  const deviceId = audioInputSelect.value;

  const audioPayload = {
    ID: deviceId,
    kind: kindOfDevices.AUDIO_INPUT,
  };

  start({audioPayload});
}

// This function is for changing video input device on dropdown change and clicking the button updateVideo.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setVideoInputDevice() {
  const deviceId = videoInputSelect.value;

  const videoPayload = {
    ID: deviceId,
    kind: kindOfDevices.VIDEO_INPUT,
  };

  start({videoPayload});
}

start({});
