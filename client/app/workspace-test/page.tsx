"use client";

import { useMemo } from "react";
import { useCollabSocket } from "../hooks/useCollabSocket";
import OnlineUsers from "../components/OnlineUsers";
import EventLog from "../components/EventLog";

export default function Home() {
  const workspaceId = "test-workspace-1";

  const userId = useMemo(() => {
    return "user-" + Math.floor(Math.random() * 1000);
  }, []);

  const {
    events,
    onlineUsers,
    emitBlockUpdate,
    sendCursorMove,
    cursors,
  } = useCollabSocket(workspaceId, userId);

  return (
    <div 
      style={{ padding: 24, position: "relative", minHeight: "400px" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        sendCursorMove(x, y);
      }}
    >
      <h2>CollabX Realtime Test</h2>

      <OnlineUsers users={onlineUsers} />

      <button onClick={emitBlockUpdate}>
        Emit BLOCK_UPDATED
      </button>

      <EventLog events={events} />
      
      {Object.entries(cursors).map(([id, pos]) => 
        id !== userId ? (
          <div
            key={id}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: 10,
              height: 10,
              backgroundColor: "red",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        ) : null
      )}
    </div>
  );
}