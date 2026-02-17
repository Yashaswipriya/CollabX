const WebSocket = require('ws');
const initRedis = require('../../config/redis');
const { randomUUID } = require('crypto');
let pub, sub;

const SERVER_ID = randomUUID();
let broadcastToRoomGlobal;
let pubGlobal;
function emitToRoom(roomId, payload) {
  console.log("Emitting to room:", roomId, payload.type);

  if (broadcastToRoomGlobal) {
    broadcastToRoomGlobal(roomId, payload);
  }

  if (pubGlobal) {
    pubGlobal.publish(`room:${roomId}`, JSON.stringify(payload));
  }
}
async function initWebSocket(server) {
  const redis = await initRedis();
  pub = redis.pub;
  sub = redis.sub;

  pubGlobal = pub;

const wss = new WebSocket.Server({ server });
console.log('WebSocket server initialized');
console.log(`Server ID: ${SERVER_ID}`);

const rooms = new Map();// roomId -> Set of clients(local server only)
const presence = new Map();// roomId -> Set of userIds (local presence only)

function broadcastToRoom(roomId,data,sender){
    const clients = rooms.get(roomId);
    if(!clients) return;
    clients.forEach((client) =>{
        if(client.readyState === WebSocket.OPEN && client !== sender){
            client.send(JSON.stringify(data));
        }
    })
}
broadcastToRoomGlobal = broadcastToRoom;

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
            console.log(` User ${userId} joined room ${roomId} on this server`);
            if(!rooms.has(roomId)){
                rooms.set(roomId, new Set());
                sub.subscribe(`room:${roomId}`, (message) => {
                const data = JSON.parse(message);
                //ignore messages from self
                if(data.originServerId === SERVER_ID) return;

                const clients = rooms.get(roomId);
                if (!clients) return;

                clients.forEach((client) => {
                    if (
                    client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                    }
                });
                });
            }
            if(!presence.has(roomId)){
                presence.set(roomId, new Set());
            }
        rooms.get(roomId).add(ws);
        presence.get(roomId).add(userId);
        ws.roomId = roomId;
        ws.userId = userId;
        const payload = {type:"USER_JOINED",userId,senderId:userId,originServerId:SERVER_ID};
        broadcastToRoom(roomId, payload, ws);
        pub.publish(`room:${roomId}`, JSON.stringify(payload));
        return;
        }
        if(data.type === "BLOCK_UPDATED"){
            if(!ws.roomId) return;
            const payload = {type:"BLOCK_UPDATED",block:data.block,senderId:ws.userId,originServerId:SERVER_ID};
            broadcastToRoom(ws.roomId, payload, ws);
            pub.publish(`room:${ws.roomId}`, JSON.stringify(payload));
           console.log("BLOCK_UPDATED received from:", ws.userId);
           console.log("ws.roomId is:", ws.roomId);
        }
        if(data.type === "CURSOR_MOVE"){
        if(!ws.roomId) return;
        const payload = {type:"CURSOR_MOVE",x:data.x,y:data.y,senderId:ws.userId,originServerId:SERVER_ID};
        broadcastToRoom(ws.roomId, payload, ws);
        pub.publish(`room:${ws.roomId}`, JSON.stringify(payload));
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
        sub.unsubscribe(`room:${roomId}`);
    }
    const onlineUsers = presence.get(roomId);
    if(onlineUsers && userId && onlineUsers.has(userId)){
        onlineUsers.delete(userId);
    }
    const payload = {type:"USER_LEFT",userId,senderId:userId,originServerId:SERVER_ID};
    broadcastToRoom(roomId, payload, ws);
    pub.publish(`room:${roomId}`, JSON.stringify(payload));
    if(onlineUsers && onlineUsers.size === 0){
        presence.delete(roomId);
    }
    });
});
}
module.exports = {
  initWebSocket,
  emitToRoom
};