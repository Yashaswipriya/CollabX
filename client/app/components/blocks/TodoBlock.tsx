import { useState } from "react"

export default function TodoBlock({ block, onUpdate }: any) {
  const [text, setText] = useState(block.content.text)
  const [checked, setChecked] = useState(block.content.checked)

  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked)
          onUpdate({
            ...block,
            content: { text, checked: e.target.checked },
          })
        }}
        className="w-4 h-4 accent-purple-600"
      />

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() =>
          onUpdate({ ...block, content: { text, checked } })
        }
        className="flex-1 bg-transparent focus:outline-none text-base"
        placeholder="Todo item..."
      />
    </div>
  )
}
