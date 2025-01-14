import { useState } from "react";
import {
	ScreenCapturePickerView,
	RTCPeerConnection,
	RTCIceCandidate,
	RTCSessionDescription,
	RTCView,
	MediaStream,
	MediaStreamTrack,
	mediaDevices,
	registerGlobals
} from 'react-native-webrtc';
import { SocketStatus, useWithSocket } from "./use-with-socket";


export function useWithWebRTC(){
    const {subscribeToSocketEvents, sendMessage: sendSocketMessage, closeSocket, attemptSocketConnection, socketStatus} = useWithSocket();
    const [peerConnections, setPeerConnections] = useState<RTCPeerConnection[]>([]);
    const peerConstraints = {
        iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
        }]
    };

    /**
     * A new SDP offer from another user was recieved.
     * Create a new RTCPeerConnection for said user.
     * Create an answer for that user.
     * Send the answer back tothe user, start waiting for ICE candidates.
     */
    async function sdpOfferRecieved(sdpOffer: RTCSessionDescription){
        const peerConnection = new RTCPeerConnection(peerConstraints);
        peerConnection.setRemoteDescription(sdpOffer);
        const answer = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer);
        setPeerConnections(prev => [...prev, peerConnection]);
    }

    return {
        attemptSocketConnection,
        sendSocketMessage,
        socketStatus,
        closeSocket
    }
}