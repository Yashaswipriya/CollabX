import { useState, useRef, useEffect } from "react"

export default function TextBlock({ block, onUpdate }: any) {
  const [text, setText] = useState(block.content.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px"
    }
  }, [text])

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onUpdate({ ...block, content: { text } })}
      className="w-full bg-transparent resize-none overflow-hidden focus:outline-none text-base leading-relaxed"
      placeholder="Start writing..."
    />
  )
}
