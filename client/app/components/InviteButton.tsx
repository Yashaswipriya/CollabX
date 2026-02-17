"use client";

import toast from "react-hot-toast";

interface Props {
  workspaceId: string;
}

export default function InviteButton({ workspaceId }: Props) {
  const handleInvite = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5000/api/workspace/${workspaceId}/invite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      await navigator.clipboard.writeText(data.inviteLink);
      toast.success("Invite link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Error generating invite.");
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="px-4 py-1.5 text-sm bg-black text-white rounded-full hover:opacity-80 transition"
    >
      Invite
    </button>
  );
}
