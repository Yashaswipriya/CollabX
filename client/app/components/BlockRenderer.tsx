import BlockCard from "./blocks/BlockCard"

export default function BlockRenderer({ block, onUpdate, onDelete }: any) {
  return (
    <BlockCard
      block={block}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  )
}

