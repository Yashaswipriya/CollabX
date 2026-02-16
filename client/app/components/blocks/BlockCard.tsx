import { useState, useEffect, useRef } from "react"

export default function BlockCard({ block, onUpdate, onDelete }: any) {
  function normalizeItems(b: any) {
    // If already new format
    if (b?.content?.items && Array.isArray(b.content.items)) {
      return b.content.items
    }

    // If old format with single text
    if (b?.content?.text !== undefined) {
      return [
        {
          id: crypto.randomUUID(),
          type: b.type === "heading" ? "heading" : "text",
          text: b.content.text,
        },
      ]
    }

    // Default fallback
    return [
      { id: crypto.randomUUID(), type: "heading", text: "" },
      { id: crypto.randomUUID(), type: "text", text: "" },
    ]
  }
const [menuOpen, setMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  function handleClickOutside(e: any) {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [])


  const [items, setItems] = useState(() => normalizeItems(block))

  useEffect(() => {
    setItems(normalizeItems(block))
  }, [block])

  function sync(updatedItems: any[]) {
    if (!updatedItems || updatedItems.length === 0) {
      onDelete(block.id)
      return
    }

    onUpdate({
      ...block,
      content: { items: updatedItems },
    })
  }

  function handleEnter(e: any, index: number) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()

      const newRow = {
        id: crypto.randomUUID(),
        type: "text",
        text: "",
      }

      const updated = [
        ...items.slice(0, index + 1),
        newRow,
        ...items.slice(index + 1),
      ]

      setItems(updated)
      sync(updated)
    }
  }

  function deleteRow(index: number) {
    const updated = items.filter((_: any, i: number) => i !== index)
    setItems(updated)
    sync(updated)
  }

  function addRow(type: "text" | "heading" | "todo") {
    const newRow = {
      id: crypto.randomUUID(),
      type,
      text: "",
      ...(type === "todo" ? { checked: false } : {}),
    }

    const updated = [...items, newRow]
    setItems(updated)
    sync(updated)
  }

  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return
    el.style.height = "auto"
    el.style.height = el.scrollHeight + "px"
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm transition p-5 space-y-2">

      {Array.isArray(items) &&
        items.map((item: any, index: number) => (
          <div key={item.id} className="group flex items-start gap-2">

            {item.type === "todo" && (
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => {
                  const updated = [...items]
                  updated[index].checked = e.target.checked
                  setItems(updated)
                  sync(updated)
                }}
                className="mt-2 w-4 h-4 accent-purple-600"
              />
            )}

            <textarea
              value={item.text}
              placeholder={
                item.type === "heading"
                  ? "Heading"
                  : item.type === "text"
                  ? "Start writing..."
                  : "Todo item..."
              }
              onChange={(e) => {
                const updated = [...items]
                updated[index].text = e.target.value
                setItems(updated)
              }}
              onBlur={() => sync(items)}
              onKeyDown={(e) => handleEnter(e, index)}
              ref={(el) => autoResize(el)}
              className={`flex-1 bg-transparent resize-none overflow-hidden focus:outline-none ${
                item.type === "heading"
                  ? "text-3xl font-semibold"
                  : "text-base leading-relaxed"
              }`}
            />

            <button
              onClick={() => deleteRow(index)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition mt-2"
            >
              🗑
            </button>
          </div>
        ))}

      <div className="pt-2 relative" ref={menuRef}>
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-sm text-purple-600 hover:text-purple-800 transition"
            >
                + Add Row
            </button>

            {menuOpen && (
                <div className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm z-50">
                <button
                    onClick={() => {
                    addRow("text")
                    setMenuOpen(false)
                    }}
                    className="block px-4 py-2 hover:bg-purple-50 w-full text-left"
                >
                    Text
                </button>
                <button
                    onClick={() => {
                    addRow("heading")
                    setMenuOpen(false)
                    }}
                    className="block px-4 py-2 hover:bg-purple-50 w-full text-left"
                >
                    Heading
                </button>
                <button
                    onClick={() => {
                    addRow("todo")
                    setMenuOpen(false)
                    }}
                    className="block px-4 py-2 hover:bg-purple-50 w-full text-left"
                >
                    Todo
                </button>
                </div>
            )}
        </div>
    </div>
  )
}
