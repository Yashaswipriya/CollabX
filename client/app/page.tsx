"use client";
import { useMemo } from "react";
import { useCollabSocket } from "./hooks/useCollabSocket";
import OnlineUsers from "./components/OnlineUsers";
import EventLog from "./components/EventLog";

export default function Home() {
  const workspaceId = "test-workspace-1";

  const userId = useMemo(() => {
    return "user-" + Math.floor(Math.random() * 1000);
  }, []);

  const {
    events,
    onlineUsers,
    emitBlockUpdate,
  } = useCollabSocket(workspaceId, userId);

  return (
    <div style={{ padding: 24 }}>
      <h2>CollabX Realtime Test</h2>

      <OnlineUsers users={onlineUsers} />

      <button onClick={emitBlockUpdate}>
        Emit BLOCK_UPDATED
      </button>

      <EventLog events={events} />
    </div>
  );
}
