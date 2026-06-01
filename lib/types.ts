export type Video = {
  id: string
  source: "youtube" | "odysee"
  language: string
  title: string
  channel: string
  channel_slug: string
  channel_url: string
  url: string
  upload_date: string
  upload_date_fmt: string
  duration: number
  description: string
  thumbnail: string
  transcript: string
  topics: string[]
  reaction_types: string[]
  reagents: string[]
  products: string[]
  equipment: string[]
  techniques: string[]
  concepts: string[]
  drug_class: string[]
  safety: string[]
  difficulty: string
}

export type Playlist = {
  slug: string
  title: string
  description: string
  type: "reaction" | "difficulty" | "channel" | "curated"
  videoIds: string[]
}

export const TAG_CATEGORIES = [
  "reaction_types",
  "reagents",
  "products",
  "equipment",
  "techniques",
  "concepts",
  "drug_class",
] as const

export type TagCategory = (typeof TAG_CATEGORIES)[number]

export const TAG_META: Record<TagCategory, { label: string; color: string; dot: string }> = {
  reaction_types: { label: "Reaction",   color: "bg-amber-500/15 text-amber-300 border-amber-500/40",   dot: "bg-amber-400" },
  reagents:       { label: "Reagent",    color: "bg-blue-500/15 text-blue-300 border-blue-500/40",       dot: "bg-blue-400"  },
  products:       { label: "Product",    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", dot: "bg-emerald-400" },
  equipment:      { label: "Equipment",  color: "bg-violet-500/15 text-violet-300 border-violet-500/40", dot: "bg-violet-400" },
  techniques:     { label: "Technique",  color: "bg-orange-500/15 text-orange-300 border-orange-500/40", dot: "bg-orange-400" },
  concepts:       { label: "Concept",    color: "bg-teal-500/15 text-teal-300 border-teal-500/40",       dot: "bg-teal-400"  },
  drug_class:     { label: "Drug Class", color: "bg-purple-500/15 text-purple-300 border-purple-500/40", dot: "bg-purple-400" },
}

export const DIFF_META: Record<string, { label: string; color: string }> = {
  beginner:     { label: "Beginner",     color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" },
  intermediate: { label: "Intermediate", color: "bg-amber-500/20 text-amber-300 border-amber-500/50" },
  advanced:     { label: "Advanced",     color: "bg-red-500/20 text-red-300 border-red-500/50" },
}

// Topic (content domain) colors — chemistry plus crossover hobbies
export const TOPIC_META: Record<string, { label: string; color: string; dot: string }> = {
  chemistry:       { label: "Chemistry",          color: "bg-rose-500/15 text-rose-300 border-rose-500/40",   dot: "bg-rose-400" },
  energetics:      { label: "Rockets & Energetics", color: "bg-orange-500/15 text-orange-300 border-orange-500/40", dot: "bg-orange-400" },
  electronics:     { label: "Electronics",        color: "bg-sky-500/15 text-sky-300 border-sky-500/40",      dot: "bg-sky-400" },
  metallurgy:      { label: "Metallurgy",         color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40", dot: "bg-yellow-400" },
  gaming:          { label: "Gaming",             color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40", dot: "bg-fuchsia-400" },
  psychotropics:   { label: "Psychotropics",      color: "bg-purple-500/15 text-purple-300 border-purple-500/40", dot: "bg-purple-400" },
  nuclear:         { label: "Nuclear",            color: "bg-lime-500/15 text-lime-300 border-lime-500/40",       dot: "bg-lime-400"   },
}

// "Meta" tags describe channel housekeeping rather than chemistry content.
// Hidden from the filter sidebar and cards by default (toggle to reveal).
export const META_TAGS = new Set<string>([
  "channel trailer",
  "channel milestone",
  "channel update",
  "channel overview",
  "return from hiatus",
  "Q&A",
  "commentary",
  "behind the scenes",
  "holiday special",
  "laboratory introduction",
  "laboratory overview",
  "YouTube censorship",
  "chemistry community",
  "demonstration",
])

export function isMetaTag(tag: string): boolean {
  return META_TAGS.has(tag)
}

export function topicMeta(topic: string) {
  return (
    TOPIC_META[topic] ?? {
      label: topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
      dot: "bg-zinc-400",
    }
  )
}
