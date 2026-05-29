"use client"

import { useState, useMemo } from "react"
import VideoCard from "./VideoCard"
import TagChip from "./TagChip"
import { TAG_CATEGORIES, TAG_META, DIFF_META, type Video, type TagCategory } from "@/lib/types"

type Props = {
  videos: Video[]
  tagIndex: Record<TagCategory, string[]>
}

export default function BrowseClient({ videos, tagIndex }: Props) {
  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [activeDiff, setActiveDiff] = useState<string | null>(null)

  const toggleFilter = (cat: TagCategory, tag: string) => {
    const key = `${cat}::${tag}`
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (activeDiff && v.difficulty !== activeDiff) return false
      for (const key of activeFilters) {
        const [cat, tag] = key.split("::")
        if (!(v[cat as TagCategory] ?? []).includes(tag)) return false
      }
      if (search) {
        const q = search.toLowerCase()
        const hay = [
          v.title,
          v.channel,
          v.description,
          ...TAG_CATEGORIES.flatMap((c) => v[c] ?? []),
        ]
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [videos, search, activeFilters, activeDiff])

  const clearAll = () => {
    setActiveFilters(new Set())
    setActiveDiff(null)
    setSearch("")
  }

  const hasFilters = activeFilters.size > 0 || activeDiff || search

  return (
    <div className="flex gap-6 min-h-0">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col gap-5 overflow-y-auto pr-1">
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-zinc-500 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/50 rounded-lg px-3 py-1.5 transition-colors text-left"
          >
            ✕ Clear all filters
          </button>
        )}

        {/* Difficulty */}
        <FilterSection title="Difficulty">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DIFF_META).map(([diff, meta]) => {
              const count = videos.filter((v) => v.difficulty === diff).length
              if (count === 0) return null
              return (
                <button
                  key={diff}
                  onClick={() => setActiveDiff(activeDiff === diff ? null : diff)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all ${
                    activeDiff === diff
                      ? meta.color + " scale-105"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {meta.label} <span className="opacity-60">({count})</span>
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Tag categories */}
        {TAG_CATEGORIES.map((cat) => {
          const tags = tagIndex[cat]
          if (tags.length === 0) return null
          return (
            <FilterSection key={cat} title={TAG_META[cat].label + "s"}>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => {
                  const key = `${cat}::${tag}`
                  return (
                    <TagChip
                      key={tag}
                      tag={tag}
                      category={cat}
                      active={activeFilters.has(key)}
                      onClick={() => toggleFilter(cat, tag)}
                    />
                  )
                })}
              </div>
            </FilterSection>
          )
        })}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search + stats */}
        <div className="flex items-center gap-3">
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
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
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
