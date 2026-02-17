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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const socketRef = useRef<WebSocket | null>(null);
  const lastSentRef = useRef(0); // throttle

  // Send cursor movement (exposed to component)
  const sendCursorMove = (x: number, y: number) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    if (now - lastSentRef.current < 50) return; // throttle 50ms

    lastSentRef.current = now;

    socketRef.current.send(
      JSON.stringify({
        type: "CURSOR_MOVE",
        x,
        y,
      })
    );
  };

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

        // Block events
        if (
          data.type === "BLOCK_UPDATED" ||
          data.type === "BLOCK_CREATED" ||
          data.type === "BLOCK_DELETED"
        ) {
          setEvents((prev) => [...prev, data]);
        }

        // Presence events
        if (data.type === "USER_JOINED") {
          if (data.userId !== userId) {
            setOnlineUsers((prev) =>
              prev.includes(data.userId) ? prev : [...prev, data.userId]
            );

            setEvents((prev) => [...prev, data]);
          }
        }


        if (data.type === "USER_LEFT") {
          setOnlineUsers((prev) =>
            prev.filter((id) => id !== data.userId)
          );
          setEvents((prev) => [...prev, data]);
          // Also remove cursor when user leaves
          setCursors((prev) => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }

        // Cursor events
        if (data.type === "CURSOR_MOVE") {
          if (data.senderId !== userId) {
            setCursors((prev) => ({
              ...prev,
              [data.senderId]: { x: data.x, y: data.y },
            }));
          }
        }

      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    socket.onerror = () => {
      console.warn("WebSocket encountered an issue");
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [workspaceId, userId]);

  return { events, onlineUsers, cursors, sendCursorMove };
}

