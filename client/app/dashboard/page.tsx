"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateWorkspaceModal from "../components/CreateWorkspaceModal"

type Workspace = {
  id: number
  name: string
}

export default function Dashboard() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/")
      return
    }

    async function fetchWorkspaces() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/workspace/workspaces",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()
        if (!Array.isArray(data)) {
        console.error("Unexpected response:", data)
        setWorkspaces([])
        } else {
        setWorkspaces(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [router])

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between shadow-sm">
        
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-8">
            Collab<span className="text-purple-600 font-bold">X</span>
          </h1>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full mb-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
            >
            + Create Workspace
            </button>

          <div className="space-y-2">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition"
              >
                {ws.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-purple-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8">
          Your Workspaces
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h3 className="text-xl font-medium text-gray-800 mb-4">
              You don't have any workspaces yet.
            </h3>
            <button className="px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
              onClick={() => setIsCreateOpen(true)}
            >
              Create Your First Workspace
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/workspace/${ws.id}`)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ws.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Click to enter workspace
                </p>
              </div>
            ))}
          </div>
        )}
        {/* create workspace modal */}
        <CreateWorkspaceModal
            open={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={(workspaceId) => {
                router.push(`/workspace/${workspaceId}`)
            }}
        />
      </main>
    </div>
  )
}
