"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import BlockRenderer from "../../components/BlockRenderer"
import { useCollabSocket } from "../../hooks/useCollabSocket"
import { Block } from "../../types/block"

export default function WorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.id as string

  const [workspaceName, setWorkspaceName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  const nameInputRef = useRef<HTMLInputElement>(null)

 const [userId] = useState(() =>
  typeof window !== "undefined"
    ? localStorage.getItem("userId") || crypto.randomUUID()
    : ""
);

  //WebSocket hook
  const { events } = useCollabSocket(workspaceId, userId)

  //React to WebSocket events
  useEffect(() => {
    if (!events.length) return

    const lastEvent = events[events.length - 1]

    if (lastEvent.type === "BLOCK_UPDATED") {
      setBlocks(prev =>
        prev.map(b =>
          b.id === lastEvent.block.id ? lastEvent.block : b
        )
      )
    }

    if (lastEvent.type === "BLOCK_CREATED") {
      setBlocks(prev => [...prev, lastEvent.block])
    }

    if (lastEvent.type === "BLOCK_DELETED") {
      setBlocks(prev => prev.filter(b => b.id !== lastEvent.blockId))
    }
  }, [events])

  // 🔥 Initial data load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    async function init() {
      try {
        const wsRes = await fetch(
          `http://localhost:5000/api/workspace/workspace/${workspaceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!wsRes.ok) {
          router.push("/dashboard")
          return
        }

        const wsData = await wsRes.json()
        setWorkspaceName(wsData.name)

        const blockRes = await fetch(
          `http://localhost:5000/api/block/${workspaceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const blockData = await blockRes.json()

        // Ensure content is object
        const normalizedBlocks: Block[] = Array.isArray(blockData)
          ? blockData.map((b: any) => ({
              ...b,
              content:
                typeof b.content === "string"
                  ? JSON.parse(b.content)
                  : b.content
            }))
          : []

        setBlocks(normalizedBlocks)
        setLoading(false)
      } catch (err) {
        console.error("Initialization error:", err)
        setLoading(false)
      }
    }

    init()
  }, [workspaceId, router])

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  async function addBlock() {
    const token = localStorage.getItem("token")

    const newBlockPayload = {
      workspace_id: workspaceId,
      type: "document",
      content: {
        items: [
          { id: crypto.randomUUID(), type: "heading", text: "" },
          { id: crypto.randomUUID(), type: "text", text: "" }
        ]
      },
      position: blocks.length
    }

    const res = await fetch("http://localhost:5000/api/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newBlockPayload)
    })

    const data = await res.json()

    const normalized: Block = {
      ...data,
      content:
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content
    }

    setBlocks(prev => [...prev, normalized])
  }

  async function updateBlock(updatedBlock: Block) {
    const token = localStorage.getItem("token")

    const res = await fetch(
      `http://localhost:5000/api/block/${updatedBlock.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedBlock)
      }
    )

    if (res.status === 409) {
      alert("Block modified by another user.")
      return
    }

    const data = await res.json()

    const normalized: Block = {
      ...data,
      content:
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content
    }

    setBlocks(prev =>
      prev.map(b => (b.id === normalized.id ? normalized : b))
    )
  }

  async function deleteBlock(id: number) {
    const token = localStorage.getItem("token")

    await fetch(`http://localhost:5000/api/block/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })

    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-white py-14 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-purple-600 hover:text-purple-800 transition"
        >
          ← Dashboard
        </button>

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

          <button
            onClick={addBlock}
            className="rounded-full px-4 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
          >
            + Add Block
          </button>
        </div>

        <div className="space-y-6">
          {blocks.map(block => (
            <BlockRenderer
              key={block.id}
              block={block}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
