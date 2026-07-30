import type { Video } from "@/lib/types"

// Shown on /video/[id] when the YouTube original has been taken down and no
// mirror (Odysee / archive.org / local file) is available — the video is
// lost media. Apologizes, explains, and preserves whatever reconstruction we
// have from the transcript (lost_note).
export default function LostVideoCard({ video }: { video: Video }) {
  return (
    <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠</span>
        <h2 className="text-base font-bold tracking-tight text-amber-300">
          This video has been lost
        </h2>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">
        The original was removed by YouTube
        {video.youtube_status === "private" ? " (set to private)" : " for a Terms of Service violation"}
        , and our local copy was pruned before the takedown — no playable copy is
        known to survive. We apologize for the inconvenience. The metadata, tags,
        and transcript are preserved below.
      </p>
      {video.lost_note && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {video.lost_note}
          </p>
        </div>
      )}
      <p className="text-xs text-zinc-500">
        If you have a copy of this video, please get in touch so it can be
        re-added to the archive.
      </p>
    </div>
  )
}
