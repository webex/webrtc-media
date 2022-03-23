window.RTCSessionDescription = jest.fn().mockImplementation((desc) => ({
  type: desc.type,
  sdp: desc.sdp || '',
}));
