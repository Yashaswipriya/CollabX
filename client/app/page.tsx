"use client";
import { useEffect,useState,useRef } from "react";

type Block = {
  id: number;
  type: string;
  content: string;
  position: number;
};

type WSevent = |{type: "BLOCK_UPDATED", block: Block} | {type: "JOIN_ROOM", roomId: string};

export default function Home() {
  const [events, setEvents] = useState<WSevent[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const workspaceId = "test-workspace-1";

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket("ws://localhost:5000");
    socket.onopen = () =>{
      console.log("WebSocket connection established");
      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: workspaceId,
        })
    );
    };
    socket.onmessage = (event) =>{
      try {
        const data: WSevent = JSON.parse(event.data);
        //Listen for BLOCK_UPDATED
        if (data.type === "BLOCK_UPDATED") {
          console.log("Block updated from WS:", data.block);
          setEvents((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("Invalid WS message", event.data);
      }
    };
    socket.onclose = () =>{
      console.log("WebSocket connection closed");
    }
    socketRef.current = socket;

    //cleanup on umount
    return () =>{
      socket.close();
    }
  }, []);

  //simulate block update
  const emitBlockUpdate = () => {
    console.log("Emit button clicked");
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    const fakeUpdatedBlock: Block = {
      id: 1,
      type: "text",
      content: "Updated from client " + new Date().toLocaleTimeString(),
      position: 0,
    };

    socketRef.current.send(
      JSON.stringify({
        type: "BLOCK_UPDATED",
        block: fakeUpdatedBlock,
      })
    );
    console.log("BLOCK_UPDATED sent");
  };

return (
  <div style={{ padding: 24 }}>
      <h2>CollabX Realtime Test</h2>

      <button onClick={emitBlockUpdate}>
        Emit BLOCK_UPDATED
      </button>

      <div style={{ marginTop: 24 }}>
        <h4>Received Events</h4>

        {events.map((event, index) => (
          <pre key={index} style={{ background: "#000000", padding: 12 }}>
            {JSON.stringify(event, null, 2)}
          </pre>
        ))}
      </div>
    </div>
  );
}