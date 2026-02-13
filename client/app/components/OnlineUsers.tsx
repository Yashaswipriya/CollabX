"use client";

type Props = {
  users: string[];
};

export default function OnlineUsers({ users }: Props) {
  return (
    <p>
      <strong>Online users:</strong>{" "}
      {users.length === 0 ? "none" : users.join(", ")}
    </p>
  );
}
