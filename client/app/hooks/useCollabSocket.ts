"use client";
import { useEffect, useRef, useState } from "react";

export type Block = {
  id: number;
  type: string;
  content: string;
  position: number;
  version: number;
};

export type WSevent =
  | { type: "BLOCK_UPDATED"; block: Block }
  | { type: "USER_JOINED"; userId: string }
  | { type: "USER_LEFT"; userId: string };

export function useCollabSocket(workspaceId: string, userId: string) {
  const [events, setEvents] = useState<WSevent[]>([]);
  const [block, setBlock] = useState<Block | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: workspaceId,
          userId,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const data: WSevent = JSON.parse(event.data);

        if (data.type === "BLOCK_UPDATED") {
          console.log("Block updated from WS:", data.block);
          setEvents((prev) => [...prev, data]);
          setBlock(data.block);
        }

        if (data.type === "USER_JOINED") {
          setOnlineUsers((prev) =>
            prev.includes(data.userId)
              ? prev
              : [...prev, data.userId]
          );
        }

        if (data.type === "USER_LEFT") {
          setOnlineUsers((prev) =>
            prev.filter((id) => id !== data.userId)
          );
        }
      } catch (err) {
        console.error("Invalid WS message", event.data);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [workspaceId, userId]);

  const emitBlockUpdate = () => {
    console.log("Emit button clicked");

    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    const fakeUpdatedBlock: Block = {
      id: 1,
      type: "text",
      content: "Updated from client " + new Date().toLocaleTimeString(),
      position: 0,
      version: block?.version ?? 1,
    };

    socketRef.current.send(
      JSON.stringify({
        type: "BLOCK_UPDATED",
        block: fakeUpdatedBlock,
      })
    );

    console.log("BLOCK_UPDATED sent");
  };

  return {
    events,
    block,
    onlineUsers,
    emitBlockUpdate,
  };
}
