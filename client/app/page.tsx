"use client";
import { useEffect,useState,useRef } from "react";

type Message = string;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket("ws://localhost:5000");
    socket.onopen = () =>{
      console.log("WebSocket connection established");
    }
    socket.onmessage = (event) =>{
      setMessages((prev => [...prev,event.data]))
    }
    socket.onclose = () =>{
      console.log("WebSocket connection closed");
    }
    socketRef.current = socket;

    //cleanup on umount
    return () =>{
      socket.close();
    }
  }, []);

  const sendMessage = () =>{
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
    type: "message",
    text: "Hello from client"
  }));
    }
  }

return (
  <div style={{ padding: 20 }}>
    <h2>CollabX</h2>

    <button onClick={sendMessage}>
      Send Message
    </button>

    <div style={{ marginTop: 20 }}>
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  </div>
)
}