"use client";

import { useState, useRef, useEffect } from "react";
import OnlineUsers from "./OnlineUsers";
import InviteButton from "./InviteButton";

interface Props {
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  onlineUsers: any[];
  onAddBlock: () => void;
  workspaceId: string;
}

export default function WorkspaceHeader({
  workspaceName,
  setWorkspaceName,
  onlineUsers,
  onAddBlock,
  workspaceId
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  return (
    <div className="flex justify-between items-center">
      {editingName ? (
        <input
          ref={nameInputRef}
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="text-4xl font-semibold bg-transparent border-b border-purple-300 focus:outline-none"
        />
      ) : (
        <h1
          onClick={() => setEditingName(true)}
          className="text-4xl font-semibold text-gray-900 cursor-pointer hover:text-purple-700 transition"
        >
          {workspaceName}
        </h1>
      )}

      <div className="flex items-center gap-4">
        <OnlineUsers users={onlineUsers} />
        <InviteButton workspaceId={workspaceId} />
        <button
          onClick={onAddBlock}
          className="rounded-full px-4 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
        >
          + Add Block
        </button>
      </div>
    </div>
  );
}
