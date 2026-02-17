const express = require('express');
const cors = require('cors');
const app = express();
const {initWebSocket} = require('./src/ws');
const http = require('http');
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspace');
const blockRoutes = require('./routes/block');
const authMiddleware = require('./middleware/auth');

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.get("/", (req,res) =>{
    res.send("Backend running!");
})
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api", blockRoutes);
app.get("/api/protected", authMiddleware, (req,res) =>{
    res.json({message: "Access granted!", userId: req.user.id});
});
const PORT  = process.env.PORT  || 5000;

// Create HTTP server
const server = http.createServer(app);
//Attach WebSocket to the HTTP server
async function startServer() {
  await initWebSocket(server); // Redis + WS init happens here

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
startServer();