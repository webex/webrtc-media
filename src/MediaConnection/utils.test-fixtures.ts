// SDP generated by browsers always have CRLF (\r\n) endings, this function ensures that our SDP fixtures also have that
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ensureCRLF = (strings: any) => strings.raw[0].replaceAll('\n', '\r\n');

// a cut down version of SDP taken from chrome with port value 9 for audio and one of video m-lines
export const SDP_WITH_PORT_9_VALUE = ensureCRLF`v=0
o=- 2935832218733659974 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1 2
a=extmap-allow-mixed
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111 103
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 36193 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:103 ISAC/16000
a=ssrc:3091196375 cname:zEw239i8VYqeJ/C7
a=ssrc:3091196375 msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
a=ssrc:3091196375 mslabel:-
a=ssrc:3091196375 label:cc26c00b-a7b8-463c-bab5-821a50cd6acd
m=video 5094 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 52772 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:1
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=sendonly
a=msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=ssrc-group:FID 870163895 424273468
a=ssrc:870163895 cname:zEw239i8VYqeJ/C7
a=ssrc:870163895 msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:870163895 mslabel:-
a=ssrc:870163895 label:4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:424273468 cname:zEw239i8VYqeJ/C7
a=ssrc:424273468 msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:424273468 mslabel:-
a=ssrc:424273468 label:4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
m=video 9 UDP/TLS/RTP/SAVPF 102 124 127
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 37908 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:2
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=inactive
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:102 red/90000
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=102
a=rtpmap:127 ulpfec/90000
`;

// exactly the same like SDP_WITH_PORT_9_VALUE, but with the port values in the m-lines changed from 9 to 0
export const SDP_WITH_PORT_9_VALUE_CONVERTED_TO_0 = ensureCRLF`v=0
o=- 2935832218733659974 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1 2
a=extmap-allow-mixed
a=msid-semantic: WMS
m=audio 0 UDP/TLS/RTP/SAVPF 111 103
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 36193 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:103 ISAC/16000
a=ssrc:3091196375 cname:zEw239i8VYqeJ/C7
a=ssrc:3091196375 msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
a=ssrc:3091196375 mslabel:-
a=ssrc:3091196375 label:cc26c00b-a7b8-463c-bab5-821a50cd6acd
m=video 5094 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 52772 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:1
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=sendonly
a=msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=ssrc-group:FID 870163895 424273468
a=ssrc:870163895 cname:zEw239i8VYqeJ/C7
a=ssrc:870163895 msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:870163895 mslabel:-
a=ssrc:870163895 label:4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:424273468 cname:zEw239i8VYqeJ/C7
a=ssrc:424273468 msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=ssrc:424273468 mslabel:-
a=ssrc:424273468 label:4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
m=video 0 UDP/TLS/RTP/SAVPF 102 124 127
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 37908 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:2
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=inactive
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:102 red/90000
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=102
a=rtpmap:127 ulpfec/90000
`;

export const SDP_WITH_1_VIDEO_M_LINE = ensureCRLF`v=0
o=- 2935832218733659974 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
c=IN IP4 0.0.0.0
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
m=audio 9 UDP/TLS/RTP/SAVPF 103
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:0
a=sendrecv
a=rtpmap:103 ISAC/16000
a=ssrc:3091196375 cname:zEw239i8VYqeJ/C7
a=ssrc:3091196375 msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
m=video 5094 UDP/TLS/RTP/SAVPF 96
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:1
a=sendonly
a=msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=ssrc:870163895 cname:zEw239i8VYqeJ/C7
`;

export const SDP_WITH_2_VIDEO_M_LINES = ensureCRLF`v=0
o=- 2935832218733659974 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1 2
c=IN IP4 0.0.0.0
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
m=audio 9 UDP/TLS/RTP/SAVPF 103
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:0
a=sendrecv
a=rtpmap:103 ISAC/16000
a=ssrc:3091196375 cname:zEw239i8VYqeJ/C7
a=ssrc:3091196375 msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
m=video 5094 UDP/TLS/RTP/SAVPF 96
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:1
a=sendonly
a=msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=ssrc:870163895 cname:zEw239i8VYqeJ/C7
m=video 9 UDP/TLS/RTP/SAVPF 102 124 127
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 37908 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:2
a=inactive
a=rtpmap:102 red/90000
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=102
a=rtpmap:127 ulpfec/90000
`;

// same as SDP_WITH_2_VIDEO_M_LINES but with "a=content:slide" line at the end
export const SDP_WITH_2_VIDEO_M_LINES_AND_CONTENT_SLIDES = ensureCRLF`v=0
o=- 2935832218733659974 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1 2
c=IN IP4 0.0.0.0
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
m=audio 9 UDP/TLS/RTP/SAVPF 103
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:0
a=sendrecv
a=rtpmap:103 ISAC/16000
a=ssrc:3091196375 cname:zEw239i8VYqeJ/C7
a=ssrc:3091196375 msid:- cc26c00b-a7b8-463c-bab5-821a50cd6acd
m=video 5094 UDP/TLS/RTP/SAVPF 96
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:1
a=sendonly
a=msid:- 4cfa6ba7-60d9-49ce-9e48-bfecdcf4ef50
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=ssrc:870163895 cname:zEw239i8VYqeJ/C7
m=video 9 UDP/TLS/RTP/SAVPF 102 124 127
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3964964154 1 udp 2113937151 4a52ecb2-bfd3-4f08-8479-4ed6029555f3.local 37908 typ host generation 0 network-cost 999
a=ice-ufrag:1izm
a=ice-pwd:LH+BRR+d0AN0wUfhri7wyRII
a=ice-options:trickle
a=fingerprint:sha-256 EC:C5:A0:3A:07:61:A6:1C:44:EC:E6:14:31:54:45:86:DB:2B:87:D7:F5:06:11:93:5F:2A:07:F8:FB:C2:DE:5E
a=setup:actpass
a=mid:2
a=inactive
a=rtpmap:102 red/90000
a=rtpmap:124 rtx/90000
a=fmtp:124 apt=102
a=rtpmap:127 ulpfec/90000
a=content:slides
`;
