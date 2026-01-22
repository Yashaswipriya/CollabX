const WebSocket = require('ws');

function initWebSocket(server){
const wss = new WebSocket.Server({ server });
console.log('WebSocket server initialized');

const rooms = new Map();

function broadcastToRoom(roomId,data,sender){
    const clients = rooms.get(roomId);
    if(!clients) return;
    clients.forEach((client) =>{
        if(client.readyState == WebSocket.OPEN && client != sender){
            client.send(data);
        }
    })
}

wss.on('connection',(ws) =>{
    console.log('New client connected');

    ws.send('Welcome new client!');
    ws.roomId = null;
    ws.on('message', (message) =>{
        console.log(`Received message: ${message}`);
        const data = JSON.parse(message);
        if(data.type == "join"){
            const roomId = data.roomId;
            if(!rooms.has(roomId)){
                rooms.set(roomId, new Set());
            }
        rooms.get(roomId).add(ws);
        ws.roomId = roomId;
        ws.send(`Joined room: ${roomId}`);
        return;
        }
        if(data.type == "message"){
            if(!ws.roomId) return;
            broadcastToRoom(ws.roomId, data.message, ws);
        }
    });
    ws.on('close', ()=>{
    console.log('Client disconnected');
    const roomId = ws.roomId;
    if(!roomId) return;
    const clients = rooms.get(roomId);
    if(!clients) return;
    clients.delete(ws);
    if(clients.size === 0){
        rooms.delete(roomId);
    }
    });
})
}
module.exports = initWebSocket;

