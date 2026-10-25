"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { KeyboardEvent, MouseEvent } from "react"
import { TAG_META, DIFF_META, type TagCategory } from "@/lib/types"

type Props = {
  tag: string
  category: TagCategory
  onClick?: () => void
  active?: boolean
  size?: "sm" | "md"
  // When set (and no onClick), the chip becomes a link to the browse view
  // pre-filtered for this tag.
  href?: string
  // Cards wrap their whole surface in a <Link>, so a nested <a> would be
  // invalid HTML. With this flag the chip navigates imperatively instead.
  insideLink?: boolean
}

export default function TagChip({
  tag,
  category,
  onClick,
  active,
  size = "sm",
  href,
  insideLink = false,
}: Props) {
  const router = useRouter()
  const meta = TAG_META[category]
  const base = `inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-100`
  const sz = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
  const style = active
    ? `${meta.color} opacity-100 scale-105 shadow-sm cursor-pointer`
    : onClick
    ? `${meta.color} opacity-70 hover:opacity-100 cursor-pointer hover:scale-105`
    : href
    ? `${meta.color} opacity-80 hover:opacity-100 hover:brightness-125 cursor-pointer`
    : `${meta.color}`

  const content = (
    <>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {tag}
    </>
  )

  if (href && !onClick) {
    if (insideLink) {
      const go = (e: MouseEvent | KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(href)
      }
      return (
        <span
          role="link"
          tabIndex={0}
          onClick={go}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") go(e)
          }}
          className={`${base} ${sz} ${style}`}
          title={`More videos: ${tag}`}
        >
          {content}
        </span>
      )
    }
    return (
      <Link
        href={href}
        className={`${base} ${sz} ${style}`}
        title={`More videos: ${tag}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <span className={`${base} ${sz} ${style}`} onClick={onClick}>
      {content}
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
