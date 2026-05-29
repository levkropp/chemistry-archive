import Link from "next/link"
import Image from "next/image"
import TagChip, { DifficultyBadge } from "./TagChip"
import { fmtDuration } from "@/lib/data"
import { TAG_CATEGORIES, topicMeta, isMetaTag, type Video } from "@/lib/types"

export default function VideoCard({ video }: { video: Video }) {
  const tags = TAG_CATEGORIES.flatMap((cat) =>
    (video[cat] ?? [])
      .filter((t) => !isMetaTag(t))
      .slice(0, cat === "reagents" ? 3 : 2)
      .map((t) => ({ t, cat }))
  )

  // Show topic badges only for crossover (non-chemistry) topics
  const crossoverTopics = video.topics.filter((t) => t !== "chemistry")

  return (
    <Link
      href={`/video/${video.id}/`}
      className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-800 overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        {video.duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {fmtDuration(video.duration)}
          </span>
        )}
        {video.difficulty && (
          <span className="absolute top-1.5 left-1.5">
            <DifficultyBadge difficulty={video.difficulty} />
          </span>
        )}
        {crossoverTopics.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
            {crossoverTopics.map((t) => {
              const meta = topicMeta(t)
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${meta.color}`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              )
            })}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
          {video.title}
        </h3>

        <p className="text-xs text-zinc-500">
          {video.channel}
          {video.upload_date_fmt && <> · {video.upload_date_fmt}</>}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {tags.map(({ t, cat }) => (
              <TagChip key={`${cat}-${t}`} tag={t} category={cat} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
