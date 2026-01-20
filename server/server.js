const express = require('express');
const app = express();
const initWebSocket = require('./src/ws');
const http = require('http');

app.use(express.json());
app.get("/", (req,res) =>{
    res.send("Backend running!");
})

const PORT  = process.env.PORT  || 5000;

// Create HTTP server
const server = http.createServer(app);
//Attach WebSocket to the HTTP server
initWebSocket(server);

server.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
});