"use client"
import { useState } from "react"
import toast from "react-hot-toast"

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: (workspaceId: number) => void
}

export default function CreateWorkspaceModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Not authenticated")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        "http://localhost:5000/api/workspace/workspace",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success("Workspace created!")

      setName("")
      onClose()
      onSuccess(data.workspace_id)

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-semibold mb-8 text-gray-900">
          Create New Workspace
        </h3>

        <input
          type="text"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-8 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl mb-4 hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-purple-600 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
