import type { Video, Playlist, TagCategory } from "./types"
import rawVideos from "@/data/videos.json"

export const videos: Video[] = rawVideos as Video[]

// Lightweight copies for list/grid views (home, channel, playlist). Transcripts
// are up to 4000 chars each and make up the bulk of the embedded page data, but
// they're only read on individual /video/[id] pages — never in cards or browse
// search. Stripping them here keeps the statically-embedded payload small so the
// browse pages load fast.
export const browseVideos: Video[] = videos.map((v) => ({ ...v, transcript: "" }))

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.id === id)
}

export function fmtDuration(secs: number): string {
  if (!secs) return ""
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

// Related videos scored by shared tags
export function getRelatedVideos(video: Video, count = 5): Video[] {
  return videos
    .filter((v) => v.id !== video.id)
    .map((v) => ({ v, score: relatedScore(video, v) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.v)
}

function relatedScore(a: Video, b: Video): number {
  const overlap = (xs: string[], ys: string[]) =>
    xs.filter((x) => ys.includes(x)).length
  return (
    overlap(a.reaction_types, b.reaction_types) * 4 +
    overlap(a.products, b.products) * 3 +
    overlap(a.reagents, b.reagents) * 2 +
    overlap(a.techniques, b.techniques) * 1.5 +
    overlap(a.equipment, b.equipment) * 0.5 +
    (a.channel === b.channel ? 1 : 0) +
    (a.difficulty === b.difficulty ? 0.5 : 0)
  )
}

// Auto-generate playlists
function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

function titleCase(s: string): string {
  return s
    .split(/[-\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function getAllPlaylists(): Playlist[] {
  const playlists: Playlist[] = []

  // Reaction type playlists (2+ videos)
  const byReaction: Record<string, string[]> = {}
  videos.forEach((v) =>
    v.reaction_types.forEach((r) => {
      ;(byReaction[r] ??= []).push(v.id)
    })
  )
  Object.entries(byReaction)
    .filter(([, ids]) => ids.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([reaction, ids]) => {
      playlists.push({
        slug: `reaction-${slugify(reaction)}`,
        title: titleCase(reaction),
        description: `Videos covering ${reaction} reactions`,
        type: "reaction",
        videoIds: ids,
      })
    })

  // Difficulty playlists
  const DIFFS = ["beginner", "intermediate", "advanced"] as const
  DIFFS.forEach((diff) => {
    const ids = videos.filter((v) => v.difficulty === diff).map((v) => v.id)
    if (ids.length > 0) {
      playlists.push({
        slug: `difficulty-${diff}`,
        title: `${titleCase(diff)} Level`,
        description: `${titleCase(diff)}-level chemistry videos`,
        type: "difficulty",
        videoIds: ids,
      })
    }
  })

  // Channel playlists
  const byChannel: Record<string, string[]> = {}
  videos.forEach((v) => {
    ;(byChannel[v.channel_slug] ??= []).push(v.id)
  })
  Object.entries(byChannel).forEach(([slug, ids]) => {
    const ch = videos.find((v) => v.channel_slug === slug)?.channel ?? slug
    playlists.push({
      slug: `channel-${slug}`,
      title: ch,
      description: `All videos from ${ch}`,
      type: "channel",
      videoIds: ids,
    })
  })

  return playlists
}

// Collect all unique tag values for a category
export function allTagValues(cat: TagCategory): string[] {
  const seen = new Set<string>()
  videos.forEach((v) => v[cat].forEach((t) => seen.add(t)))
  return Array.from(seen).sort()
}
