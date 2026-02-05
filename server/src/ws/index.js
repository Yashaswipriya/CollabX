const WebSocket = require('ws');
function initWebSocket(server){
const wss = new WebSocket.Server({ server });
console.log('WebSocket server initialized');

const rooms = new Map();
const presence = new Map();

function broadcastToRoom(roomId,data,sender){
    const clients = rooms.get(roomId);
    if(!clients) return;
    clients.forEach((client) =>{
        if(client.readyState === WebSocket.OPEN && client != sender){
            client.send(data);
        }
    })
}

wss.on('connection',(ws) =>{
    console.log('New client connected');
    ws.roomId = null;
    ws.userId = null;
    ws.on('message', (message) =>{
        let data;
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.error("Invalid JSON received");
            return;
        }
        if(data.type === "JOIN_ROOM"){
            const {roomId,userId} = data;
            if(!rooms.has(roomId)){
                rooms.set(roomId, new Set());
            }
            if(!presence.has(roomId)){
                presence.set(roomId, new Set());
            }
        rooms.get(roomId).add(ws);
        presence.get(roomId).add(userId);
        ws.roomId = roomId;
        ws.userId = userId;
        broadcastToRoom(roomId,JSON.stringify({type:"USER_JOINED",userId}), ws);
        return;
        }
        if(data.type === "BLOCK_UPDATED"){
            if(!ws.roomId) return;
            broadcastToRoom(ws.roomId,JSON.stringify({type:"BLOCK_UPDATED",block:data.block,}), ws);
        }
    });
    ws.on('close', ()=>{
    console.log('Client disconnected');
    const {roomId,userId} = ws;
    if(!roomId) return;
    const clients = rooms.get(roomId);
    if(!clients) return;
    clients.delete(ws);
    if(clients.size === 0){
        rooms.delete(roomId);
    }
    const onlineUsers = presence.get(roomId);
    if(onlineUsers && userId && onlineUsers.has(userId)){
        onlineUsers.delete(userId);
    }
    broadcastToRoom(roomId,JSON.stringify({type:"USER_LEFT",userId}), ws);
    if(onlineUsers.size === 0){
        presence.delete(roomId);
    }
    });
});
}
module.exports = initWebSocket;

