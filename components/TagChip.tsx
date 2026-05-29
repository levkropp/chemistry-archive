import { TAG_META, DIFF_META, type TagCategory } from "@/lib/types"

type Props = {
  tag: string
  category: TagCategory
  onClick?: () => void
  active?: boolean
  size?: "sm" | "md"
}

export default function TagChip({ tag, category, onClick, active, size = "sm" }: Props) {
  const meta = TAG_META[category]
  const base = `inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-100 cursor-default`
  const sz = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
  const style = active
    ? `${meta.color} opacity-100 scale-105 shadow-sm cursor-pointer`
    : onClick
    ? `${meta.color} opacity-70 hover:opacity-100 cursor-pointer hover:scale-105`
    : meta.color

  return (
    <span className={`${base} ${sz} ${style}`} onClick={onClick}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {tag}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  if (!difficulty) return null
  const meta = DIFF_META[difficulty]
  if (!meta) return null
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  )
}
