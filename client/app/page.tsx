"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"

export default function Home() {
  const router = useRouter()

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const BASE_URL = "http://localhost:5000/api/auth"

  async function handleLogin() {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await res.json()
      console.log("LOGIN RESPONSE:", data)
      if (!res.ok) {
        throw new Error(data.message)
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("username", data.name)
      console.log("Stored username:", localStorage.getItem("username"))
      setIsLoginOpen(false)
      toast.success("Logged in successfully!")
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleSignup() {
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success("Account created successfully.")
      setIsSignupOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#faf9ff] to-white">
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="mt-32 w-[900px] h-[900px] bg-purple-300/30 rounded-full blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
          Collab<span className="font-bold text-purple-600">X</span>
        </h1>
      </div>

      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-28 grid md:grid-cols-2 items-center gap-12">
        <div className="text-center md:text-left">
          <h2 className="text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-gray-900">
            Where Teams Turn Ideas Into Action.
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-xl leading-relaxed">
            A real-time collaborative workspace designed to help teams organize, create, and execute seamlessly.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-6">
            <button
              onClick={() => setIsSignupOpen(true)}
              className="px-10 py-3 rounded-full bg-black text-white border border-white hover:scale-[1.03] transition duration-300"
            >
              Sign Up
            </button>

            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-10 py-3 rounded-full bg-white text-black border border-black hover:scale-[1.03] transition duration-300"
            >
              Login
            </button>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-lg">
            <Image
              src="/collaboration.svg"
              alt="Live collaboration illustration"
              width={600}
              height={500}
              className="w-full h-auto drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-semibold mb-8 text-gray-900">
              Login to CollabX
            </h3>

            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-8 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-xl mb-4 hover:bg-gray-900 transition"
            >
              Login
            </button>

            <button
              onClick={() => setIsLoginOpen(false)}
              className="text-sm text-gray-500 hover:text-black w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-semibold mb-8 text-gray-900">
              Create your account
            </h3>

            <input
              type="text"
              placeholder="Full Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
            />

            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
            />

            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-8 focus:outline-none focus:ring-2 focus:ring-purple-300/40"
            />

            <button
              onClick={handleSignup}
              className="w-full bg-black text-white py-3 rounded-xl mb-4 hover:bg-gray-900 transition"
            >
              Sign Up
            </button>

            <button
              onClick={() => setIsSignupOpen(false)}
              className="text-sm text-gray-500 hover:text-black w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
