"use client";
import { WSevent } from "../hooks/useCollabSocket";

type Props = {
  events: WSevent[];
};

export default function EventLog({ events }: Props) {
  return (
    <div style={{ marginTop: 24 }}>
      <h4>Received Events</h4>

      {events.map((event, index) => (
        <pre key={index} style={{ background: "#000000", padding: 12 }}>
          {JSON.stringify(event, null, 2)}
        </pre>
      ))}
    </div>
  );
}
