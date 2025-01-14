## WebRTC Connection Setup
1. User A connects to the websocket and starts waiting for SDP offers.
2. User B connects to the websocket and broadcasts an SDP-offer to all users connected to the websocket.
3. User A receieves the SDP offer through the websocket, creates an RTCPeerConnection for User B's SDP info, responses with answer(accept), and then starts waiting-for-ICE-candidates.
4. User B receieves answer(accept) and starts waiting-for-ICE-candidates.
5. User A and User B keep accepting ICE candidates.


## General Flow
1. Room Initialization
 - User A joins the room and is waiting for other users to connect.
 - Frontend listens for WebSocket signals about other users joining the room or sending SDP offers.

2. New User Connection
 - User B successfully joins the room, completing the initial WebSocket connection.
 - User B is notified via WebSocket to send an SDP offer ("requesting-SDP-offer" signal). This ensures only the new user initiates the offer.

3. SDP Offer Creation and Exchange
 - User B creates an SDP offer and sends it via WebSocket ("sending-SDP-offer" action with SDP data).
 - The WebSocket server relays the offer to User A (and any other users in the room) as a "receiving-SDP-offer" signal containing User B's SDP data.

4. SDP Answer Creation and Exchange
 - User A (and other users) processes User B's SDP offer:
    - Sets it as the remote description (setRemoteDescription).
    - Creates an SDP answer (createAnswer).
    - Sends the answer back via WebSocket as "accepting-SDP-offer".
 - User B receives the SDP answer:
    - Sets it as the remote description.
    - Updates their local state to reflect User A's status as "waiting-for-ICE-candidates".

5. ICE Candidate Exchange
 - User A and User B begin discovering ICE candidates:
    - Candidates are sent to the WebSocket server as they are discovered.
    - The WebSocket server relays them to the corresponding peer.
    - Each peer adds received candidates to their RTCPeerConnection using addIceCandidate.

6. Connection Establishment
 - Once all ICE candidates have been exchanged and both peers have valid network paths:
    - The WebRTC connection is established.
    - Media streams or data channels can flow directly between User A and User B, bypassing the WebSocket server.


## Useful Commands
```
let peerConnection = new RTCPeerConnection( peerConstraints );

peerConnection.addEventListener( 'connectionstatechange', event => {} );
peerConnection.addEventListener( 'icecandidate', event => {} );
peerConnection.addEventListener( 'icecandidateerror', event => {} );
peerConnection.addEventListener( 'iceconnectionstatechange', event => {} );
peerConnection.addEventListener( 'icegatheringstatechange', event => {} );
peerConnection.addEventListener( 'negotiationneeded', event => {} );
peerConnection.addEventListener( 'signalingstatechange', event => {} );
peerConnection.addEventListener( 'track', event => {} );
```

### Destroying the Peer Connection
When ending a call you should always make sure to dispose of everything ready for another call.
The following should dispose of everything related to the peer connection.
```
peerConnection.close();
peerConnection = null;
```

### Creating a Data Channel
Usually the call initialiser would create the data channel but it can be done on both sides.
The negotiation needed event will be triggered on the peer connection afterwords.
```
let datachannel = peerConnection.createDataChannel( 'my_channel' );

datachannel.addEventListener( 'open', event => {} );
datachannel.addEventListener( 'close', event => {} );
datachannel.addEventListener( 'message', message => {} );
```