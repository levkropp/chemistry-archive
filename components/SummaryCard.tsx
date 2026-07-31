import Link from "next/link"
import { TAG_META, type TagCategory, type Video } from "@/lib/types"

// Hand-written "what happens in this video" card (archives/summaries.json),
// rendered in the video-page sidebar above Safety. The summary text embeds
// [[category:tag]] / [[category:tag|display]] tokens that become links to the
// browse page pre-filtered for that tag, so a viewer can jump from a mention
// of a reagent/reaction straight to every other video using it.

const CAT_MAP: Record<string, TagCategory> = {
  reagent: "reagents",
  reaction: "reaction_types",
  product: "products",
  equipment: "equipment",
  technique: "techniques",
  concept: "concepts",
}

const TOKEN_RE = /\[\[(\w+):([^\]|]+?)(?:\|([^\]]+?))?\]\]/g

function renderSummary(text: string) {
  const out: (string | React.ReactNode)[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN_RE)) {
    const [full, cat, tag, display] = m
    const i = m.index ?? 0
    if (i > last) out.push(text.slice(last, i))
    const dim = CAT_MAP[cat]
    if (dim) {
      const meta = TAG_META[dim]
      out.push(
        <Link
          key={`${i}-${cat}-${tag}`}
          href={`/?f=${dim}::${encodeURIComponent(tag)}`}
          className={`inline-flex items-center gap-1 rounded-full border px-1.5 -mx-0.5 font-medium transition-colors ${meta.color} hover:brightness-125`}
          title={`More videos: ${tag}`}
        >
          <span className={`inline-block w-1 h-1 rounded-full ${meta.dot}`} />
          {display || tag}
        </Link>
      )
    } else {
      out.push(display || tag)
    }
    last = i + full.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function SummaryCard({ video }: { video: Video }) {
  if (!video.summary) return null
  return (
    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
        In this video
      </h3>
      <p className="text-sm text-zinc-300 leading-relaxed">
        {renderSummary(video.summary)}
      </p>
      {video.equations && video.equations.length > 0 && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 flex flex-col gap-1">
          {video.equations.map((eq) => (
            <p key={eq} className="text-[0.8rem] text-zinc-300 leading-snug tracking-wide">
              {eq}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
