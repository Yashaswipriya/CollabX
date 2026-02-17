"use client";

type Props = {
  users: string[];
};

export default function OnlineUsers({ users }: Props) {
  const totalOnline = users.length + 1; // include current user

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{totalOnline} online</span>
    </div>
  );
}
