"use client"

import { useState, useMemo, useEffect } from "react"
import VideoCard from "./VideoCard"
import {
  TAG_CATEGORIES,
  TAG_META,
  DIFF_META,
  topicMeta,
  isMetaTag,
  type Video,
  type TagCategory,
} from "@/lib/types"

type Props = {
  videos: Video[]
  tagIndex: Record<TagCategory, string[]>
  topics: string[]
  channels: { slug: string; name: string }[]
  languages: string[]
}

// A filter dimension is one of: topic, channel, difficulty, or a tag category.
// Filter keys are "dim::value". Each key is tri-state: off / include / exclude.
type FilterMode = "include" | "exclude"

function videoValues(v: Video, dim: string): string[] {
  if (dim === "topic") return v.topics
  if (dim === "channel") return [v.channel_slug]
  if (dim === "language") return v.language ? [v.language] : []
  if (dim === "difficulty") return v.difficulty ? [v.difficulty] : []
  return (v[dim as TagCategory] ?? []) as string[]
}

export default function BrowseClient({ videos, tagIndex, topics, channels, languages }: Props) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Map<string, FilterMode>>(new Map())
  const [showMeta, setShowMeta] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Lock body scroll while the mobile filter drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  const hasMetaTags = useMemo(
    () => TAG_CATEGORIES.some((cat) => tagIndex[cat].some(isMetaTag)),
    [tagIndex]
  )

  const cycle = (key: string) => {
    setFilters((prev) => {
      const next = new Map(prev)
      const cur = next.get(key)
      if (!cur) next.set(key, "include")
      else if (cur === "include") next.set(key, "exclude")
      else next.delete(key)
      return next
    })
  }

  const filtered = useMemo(() => {
    // Group active filters by dimension
    const includes: Record<string, string[]> = {}
    const excludes: Array<[string, string]> = []
    for (const [key, mode] of filters) {
      const [dim, ...rest] = key.split("::")
      const val = rest.join("::")
      if (mode === "include") (includes[dim] ??= []).push(val)
      else excludes.push([dim, val])
    }

    return videos.filter((v) => {
      // OR within a dimension, AND across dimensions
      for (const dim in includes) {
        const have = videoValues(v, dim)
        if (!includes[dim].some((val) => have.includes(val))) return false
      }
      // Hide if any excluded value is present
      for (const [dim, val] of excludes) {
        if (videoValues(v, dim).includes(val)) return false
      }
      if (search) {
        const q = search.toLowerCase()
        const hay = [
          v.title,
          v.channel,
          v.description,
          ...v.topics,
          ...TAG_CATEGORIES.flatMap((c) => v[c] ?? []),
        ]
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [videos, filters, search])

  const clearAll = () => {
    setFilters(new Map())
    setSearch("")
  }

  const hasFilters = filters.size > 0 || search

  return (
    <div className="flex gap-6 min-h-0">
      {/* Mobile backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — static on desktop, slide-out drawer on mobile */}
      <aside
        className={`flex flex-col gap-5 overflow-y-auto
          fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] bg-zinc-950 border-l border-zinc-800 p-5 pt-4
          transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}
          lg:static lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:bg-transparent lg:border-0 lg:p-0 lg:pr-1
          lg:translate-x-0 lg:max-h-[calc(100vh-9rem)] lg:sticky lg:top-20`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-500">
            Click: <span className="text-emerald-400">include</span> →{" "}
            <span className="text-red-400">exclude</span> → off
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-emerald-300 text-xl leading-none px-1 -mt-0.5"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-zinc-400 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/50 rounded-lg px-3 py-1.5 transition-colors text-left"
          >
            ✕ Clear all filters
          </button>
        )}

        {/* Topics */}
        {topics.length > 1 && (
          <FilterSection title="Topics">
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic) => {
                const meta = topicMeta(topic)
                return (
                  <FilterChip
                    key={topic}
                    label={meta.label}
                    dotColor={meta.dot}
                    activeColor={meta.color}
                    mode={filters.get(`topic::${topic}`)}
                    onClick={() => cycle(`topic::${topic}`)}
                  />
                )
              })}
            </div>
          </FilterSection>
        )}

        {/* Channels */}
        {channels.length > 1 && (
          <FilterSection title="Channels" count={channels.length} scroll>
            <div className="flex flex-wrap gap-1.5">
              {channels.map((ch) => (
                <FilterChip
                  key={ch.slug}
                  label={ch.name}
                  dotColor="bg-zinc-400"
                  activeColor="bg-zinc-200/15 text-zinc-100 border-zinc-400/50"
                  mode={filters.get(`channel::${ch.slug}`)}
                  onClick={() => cycle(`channel::${ch.slug}`)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Languages */}
        {languages.length > 1 && (
          <FilterSection title="Language">
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <FilterChip
                  key={lang}
                  label={lang}
                  dotColor="bg-cyan-400"
                  activeColor="bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                  mode={filters.get(`language::${lang}`)}
                  onClick={() => cycle(`language::${lang}`)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Difficulty */}
        <FilterSection title="Difficulty">
          <p className="text-[0.65rem] text-zinc-500 italic mb-2 leading-snug">
            AI-assessed: how easy the video is to <em>follow along</em>, not how
            safe or legal to replicate.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DIFF_META).map(([diff, meta]) => {
              const count = videos.filter((v) => v.difficulty === diff).length
              if (count === 0) return null
              return (
                <FilterChip
                  key={diff}
                  label={meta.label}
                  dotColor=""
                  activeColor={meta.color}
                  mode={filters.get(`difficulty::${diff}`)}
                  onClick={() => cycle(`difficulty::${diff}`)}
                />
              )
            })}
          </div>
        </FilterSection>

        {/* Tag categories */}
        {TAG_CATEGORIES.map((cat) => {
          const tags = tagIndex[cat].filter((t) => showMeta || !isMetaTag(t))
          if (tags.length === 0) return null
          const meta = TAG_META[cat]
          return (
            <FilterSection key={cat} title={meta.label + "s"} count={tags.length} scroll>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <FilterChip
                    key={tag}
                    label={tag}
                    dotColor={meta.dot}
                    activeColor={meta.color}
                    mode={filters.get(`${cat}::${tag}`)}
                    onClick={() => cycle(`${cat}::${tag}`)}
                  />
                ))}
              </div>
            </FilterSection>
          )
        })}

        {hasMetaTags && (
          <button
            onClick={() => setShowMeta((s) => !s)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left mt-1"
          >
            {showMeta ? "− Hide" : "+ Show"} channel / meta tags
          </button>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-3 sticky top-20 bg-zinc-950 z-10 py-1">
          <input
            type="search"
            placeholder="Search title, compound, reaction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/70 transition-colors"
          />
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {filtered.length} / {videos.length}
          </span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:border-emerald-500/60 hover:text-emerald-300 transition-colors"
            aria-label="Open filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Filters
            {filters.size > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] rounded-full bg-emerald-500/20 text-emerald-300 text-[0.65rem] font-semibold px-1">
                {filters.size}
              </span>
            )}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm py-20">
            No videos match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  dotColor,
  activeColor,
  mode,
  onClick,
}: {
  label: string
  dotColor: string
  activeColor: string
  mode: FilterMode | undefined
  onClick: () => void
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-all cursor-pointer select-none"
  let cls: string
  if (mode === "include") cls = `${activeColor} scale-105`
  else if (mode === "exclude")
    cls = "bg-red-500/15 text-red-300 border-red-500/50 line-through"
  else cls = "border-zinc-700 text-zinc-400 hover:border-zinc-500"

  return (
    <span className={`${base} ${cls}`} onClick={onClick} title={mode === "exclude" ? "Excluded" : mode === "include" ? "Included" : undefined}>
      {mode === "exclude" ? (
        <span className="font-bold">−</span>
      ) : (
        dotColor && <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
      )}
      {label}
    </span>
  )
}

function FilterSection({
  title,
  count,
  scroll = false,
  defaultOpen = true,
  children,
}: {
  title: string
  count?: number
  scroll?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {title}
          {count != null && (
            <span className="text-zinc-600 font-normal normal-case">({count})</span>
          )}
        </span>
        <span className={`text-zinc-600 transition-transform ${open ? "" : "-rotate-90"}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className={scroll ? "max-h-56 overflow-y-auto pr-1 -mr-1" : ""}>
          {children}
        </div>
      )}
    </div>
  )
}
