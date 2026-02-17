export type RowItem = {
  id: string
  type: "heading" | "text" | "todo"
  text: string
  checked?: boolean
}

export type Block = {
  id: number
  position: number
  version: number
  content: {
    items: RowItem[]
  }
}
