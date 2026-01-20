const WebSocket = require('ws');

function initWebSocket(server){
const wss = new WebSocket.Server({ server });
console.log('WebSocket server initialized');
wss.on('connection',(ws) =>{
    console.log('New client connected');

    ws.send('Welcome new client!');

    ws.on('message', (message) =>{
        console.log(`Received message: ${message}`);
        ws.send(`Echo: ${message}`);
    });
    ws.on('close', ()=>{
    console.log('Client disconnected');
    });
})
}
module.exports = initWebSocket;

