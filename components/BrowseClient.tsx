"use client"

import { useState, useMemo } from "react"
import VideoCard from "./VideoCard"
import {
  TAG_CATEGORIES,
  TAG_META,
  DIFF_META,
  topicMeta,
  type Video,
  type TagCategory,
} from "@/lib/types"

type Props = {
  videos: Video[]
  tagIndex: Record<TagCategory, string[]>
  topics: string[]
  channels: { slug: string; name: string }[]
}

// A filter dimension is one of: topic, channel, difficulty, or a tag category.
// Filter keys are "dim::value". Each key is tri-state: off / include / exclude.
type FilterMode = "include" | "exclude"

function videoValues(v: Video, dim: string): string[] {
  if (dim === "topic") return v.topics
  if (dim === "channel") return [v.channel_slug]
  if (dim === "difficulty") return v.difficulty ? [v.difficulty] : []
  return (v[dim as TagCategory] ?? []) as string[]
}

export default function BrowseClient({ videos, tagIndex, topics, channels }: Props) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Map<string, FilterMode>>(new Map())

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
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col gap-5 overflow-y-auto pr-1 max-h-[calc(100vh-9rem)] sticky top-20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Click: <span className="text-emerald-400">include</span> →{" "}
            <span className="text-red-400">exclude</span> → off
          </span>
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
          <FilterSection title="Channels">
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

        {/* Difficulty */}
        <FilterSection title="Difficulty">
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
          const tags = tagIndex[cat]
          if (tags.length === 0) return null
          const meta = TAG_META[cat]
          return (
            <FilterSection key={cat} title={meta.label + "s"}>
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}
