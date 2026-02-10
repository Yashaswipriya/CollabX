const WebSocket = require('ws');
const initRedis = require('../../config/redis');
let pub, sub;
let redisListenerAttached = false;
async function initWebSocket(server) {
  const redis = await initRedis();
  pub = redis.pub;
  sub = redis.sub;
const wss = new WebSocket.Server({ server });
console.log('WebSocket server initialized');

const rooms = new Map();// roomId -> Set of clients(local server only)
const presence = new Map();// roomId -> Set of userIds (local presence only)

// function broadcastToRoom(roomId,data,sender){
//     const clients = rooms.get(roomId);
//     if(!clients) return;
//     clients.forEach((client) =>{
//         if(client.readyState === WebSocket.OPEN && client != sender){
//             client.send(data);
//         }
//     })
// }

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

                const clients = rooms.get(roomId);
                if (!clients) return;

                clients.forEach((client) => {
                    if (
                    client.readyState === WebSocket.OPEN &&
                    client.userId !== data.senderId
                    ) {
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
        pub.publish(`room:${roomId}`, JSON.stringify({type:"USER_JOINED",userId,senderId:userId}));
        return;
        }
        if(data.type === "BLOCK_UPDATED"){
            if(!ws.roomId) return;
            pub.publish(`room:${ws.roomId}`, JSON.stringify({type:"BLOCK_UPDATED",block:data.block,senderId:ws.userId}));
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
    pub.publish(`room:${roomId}`, JSON.stringify({type:"USER_LEFT",userId,senderId:userId}));
    if(onlineUsers.size === 0){
        presence.delete(roomId);
    }
    });
});
}
module.exports = initWebSocket;

