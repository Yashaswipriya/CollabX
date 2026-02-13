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
  | { type: "USER_LEFT"; userId: string }
  | { type: "CURSOR_MOVE"; x: number; y: number; senderId: string };

export function useCollabSocket(workspaceId: string, userId: string) {
  const [events, setEvents] = useState<WSevent[]>([]);
  const [block, setBlock] = useState<Block | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number }>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    console.log("Initializing WebSocket connection");
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
        console.log("Received message:", data);

        if (data.type === "BLOCK_UPDATED") {
          setEvents((prev) => [...prev, data]);
          setBlock(data.block);
        } else if (data.type === "USER_JOINED") {
          // Don't add yourself to the list
          if (data.userId !== userId) {
            setOnlineUsers((prev) =>
              prev.includes(data.userId) ? prev : [...prev, data.userId]
            );
          }
        } else if (data.type === "CURSOR_MOVE") {
          // Don't track your own cursor
          if (data.senderId !== userId) {
            setCursors((prev) => ({
              ...prev,
              [data.senderId]: { x: data.x, y: data.y },
            }));
          }
        } else if (data.type === "USER_LEFT") {
          setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
          setCursors((prev) => {
            const newCursors = { ...prev };
            delete newCursors[data.userId];
            return newCursors;
          });
        }
      } catch (err) {
        console.error("Invalid WS message", event.data, err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socketRef.current = socket;

    return () => {
      console.log("Cleaning up WebSocket");
      socket.close();
    };
  }, [workspaceId, userId]);

  const emitBlockUpdate = () => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open");
      return;
    }

    const fakeUpdatedBlock: Block = {
      id: 1,
      type: "text",
      content: "Updated from client " + new Date().toLocaleTimeString(),
      position: 0,
      version: (block?.version ?? 0) + 1,
    };

    socketRef.current.send(
      JSON.stringify({
        type: "BLOCK_UPDATED",
        block: fakeUpdatedBlock,
      })
    );
  };

  const sendCursorMove = (x: number, y: number) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    if (now - lastSentRef.current < 100) return;

    lastSentRef.current = now;

    socketRef.current.send(
      JSON.stringify({
        type: "CURSOR_MOVE",
        x,
        y,
      })
    );
  };

  return {
    events,
    block,
    onlineUsers,
    emitBlockUpdate,
    sendCursorMove,
    cursors,
  };
}