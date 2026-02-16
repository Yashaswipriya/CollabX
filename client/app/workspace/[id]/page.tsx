"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import BlockRenderer from "../../components/BlockRenderer"

type RowItem = {
  id: string
  type: "heading" | "text" | "todo"
  text: string
  checked?: boolean
}

type Block = {
  id: number
  position: number
  version: number
  content: {
    items: RowItem[]
  }
}

export default function WorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.id as string

  const [workspaceName, setWorkspaceName] = useState("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    async function init() {
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
      setBlocks(Array.isArray(blockData) ? blockData : [])

      setLoading(false)
    }

    init()
  }, [workspaceId, router])

  async function addBlock() {
    const token = localStorage.getItem("token")

    const newBlock = {
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
      body: JSON.stringify(newBlock)
    })

    const data = await res.json()
    setBlocks([...blocks, data])
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
    setBlocks(blocks.map(b => (b.id === data.id ? data : b)))
  }

  function deleteBlock(id: number) {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-white py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-semibold text-gray-900">
            {workspaceName}
          </h1>

          <button
            onClick={addBlock}
            className="rounded-full px-4 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
          >
            + Add Block
          </button>
        </div>

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
  )
}
