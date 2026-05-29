import Link from "next/link";
import { notFound } from "next/navigation";
import { videos, getVideoById, getRelatedVideos, fmtDuration } from "@/lib/data";
import { TAG_CATEGORIES, TAG_META, type TagCategory } from "@/lib/types";
import TagChip, { DifficultyBadge } from "@/components/TagChip";
import VideoCard from "@/components/VideoCard";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import Transcript from "@/components/Transcript";

export function generateStaticParams() {
  return videos.map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideoById(id);
  return {
    title: video ? `${video.title} · Chemistry Archive` : "Chemistry Archive",
    description: video?.description?.slice(0, 160),
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();

  const related = getRelatedVideos(video, 6);

  const tagSections = TAG_CATEGORIES.map((cat) => ({
    cat,
    values: video[cat] ?? [],
  })).filter((s) => s.values.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors w-fit">
        ← Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <YouTubeEmbed id={video.id} title={video.title} thumbnail={video.thumbnail} />

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">{video.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <Link
                href={`/channel/${video.channel_slug}/`}
                className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors"
              >
                {video.channel}
              </Link>
              {video.upload_date_fmt && <span>· {video.upload_date_fmt}</span>}
              {video.duration > 0 && <span>· {fmtDuration(video.duration)}</span>}
              {video.difficulty && <DifficultyBadge difficulty={video.difficulty} />}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                ↗ Watch on YouTube
              </a>
            </div>
          </div>

          {video.description && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-6">
                {video.description}
              </p>
            </div>
          )}

          <Transcript text={video.transcript} />
        </div>

        {/* Sidebar: tags */}
        <aside className="flex flex-col gap-5">
          {video.safety.length > 0 && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
                ⚠ Safety
              </h3>
              <ul className="flex flex-col gap-1.5">
                {video.safety.map((s) => (
                  <li key={s} className="text-sm text-red-200/90 leading-snug">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tagSections.map(({ cat, values }) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                {TAG_META[cat as TagCategory].label}s
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {values.map((t) => (
                  <TagChip key={t} tag={t} category={cat as TagCategory} size="md" />
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold tracking-tight">Related videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
