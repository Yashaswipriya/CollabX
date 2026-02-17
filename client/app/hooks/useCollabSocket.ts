"use client";

import { useEffect, useRef, useState } from "react";
import { Block } from "../types/block";

export type WSEvent =
  | { type: "BLOCK_UPDATED"; block: Block }
  | { type: "BLOCK_CREATED"; block: Block }
  | { type: "BLOCK_DELETED"; blockId: number }
  | { type: "USER_JOINED"; userId: string }
  | { type: "USER_LEFT"; userId: string }
  | { type: "CURSOR_MOVE"; x: number; y: number; senderId: string };

export function useCollabSocket(workspaceId: string, userId: string) {
  const [events, setEvents] = useState<WSEvent[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!workspaceId || !userId) return;

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: String(workspaceId),
          userId,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);
        console.log("WS Received:", data);
        setEvents((prev) => [...prev, data]);
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [workspaceId, userId]);

  return { events };
}
