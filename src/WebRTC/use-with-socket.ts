import { useEffect } from "react";
import { useState } from "react";
import Config from "react-native-config";

export enum SocketStatus {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    ERROR = "error"
}


export function useWithSocket(){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [socketStatus, setSocketStatus] = useState<SocketStatus>(SocketStatus.DISCONNECTED);
    const [subscribedEvents, setSubscribedEvents] = useState<((event: WebSocketMessageEvent) => any)[]>([]);
    
    function attemptSocketConnection(){
        if(!Config.SOCKET_URL) {
            console.error("No socket url found")
            return
        }
        console.log(Config.SOCKET_URL)
        console.log("connecting")
        const socket = new WebSocket(Config.SOCKET_URL);
        setSocket(socket);
        socket.onopen = onSocketOpen
        socket.onclose = onSocketClose
        socket.onerror = onSocketError
        socket.onmessage = notifySubscribers

    }

    function closeSocket(){
        socket?.close()
    }

    function onSocketClose(event: WebSocketCloseEvent){
        console.log("socket closed")
        console.log(event)
        setSocketStatus(SocketStatus.DISCONNECTED);
    }

    function onSocketOpen(){
        console.log("connected successfully")
        setSocketStatus(SocketStatus.CONNECTED)
    }

    function onSocketError(event: WebSocketErrorEvent){
        console.log("connection failed")
        console.error(event)
        setSocketStatus(SocketStatus.ERROR);
    }

    function sendMessage(data: string | Blob | ArrayBuffer){
        if(!socket) return;
        socket.send(JSON.stringify({
            action: "foo",
            data
        }));
        console.log(`Sent: ${data}`)
    }

    function notifySubscribers(event: WebSocketMessageEvent){
        for(let i = 0; i < subscribedEvents.length; i++){
            subscribedEvents[i](event)
        }
    }
    
    function subscribeToSocketEvents(func: (event: WebSocketMessageEvent) => any){
        setSubscribedEvents(prev =>{
            return [...prev, func]
        })
    }
    
    return {
        socketStatus,
        attemptSocketConnection,
        sendMessage,
        subscribeToSocketEvents,
        closeSocket
    }
}