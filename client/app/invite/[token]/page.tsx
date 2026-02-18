"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE } from "@/lib/config";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    async function acceptInvite() {
      const jwt = localStorage.getItem("token");

      // If not logged in → redirect to login
      if (!jwt) {
        router.push(`/?redirect=/invite/${token}`);
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/invite/${token}/accept`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Invite failed");
          router.push("/dashboard");
          return;
        }

        // Redirect to workspace after joining
        router.push(`/workspace/${data.workspaceId}`);
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    }

    if (token) {
      acceptInvite();
    }
  }, [token, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#faf9ff] to-white">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Joining Workspace...
        </h2>
        <p className="text-gray-500 text-sm">
          Please wait while we add you.
        </p>
      </div>
    </div>
  );
}
