"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import type { Video, AlternateSource, SourceKind } from "@/lib/types"

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  )
  return m ? m[1] : null
}

function embedSrc(video: Video, sel: AlternateSource): string {
  if (sel.source === "odysee") {
    // https://odysee.com/name:claimid -> https://odysee.com/$/embed/name:claimid
    return sel.url.replace("odysee.com/", "odysee.com/$/embed/") + "?autoplay=true"
  }
  if (sel.source === "archive") {
    // archive.org details URL -> embed player for that specific file
    return sel.url.replace("/details/", "/embed/")
  }
  // The video's own id is the YouTube id only when the primary source is
  // YouTube; for alternates (e.g. YT mirror of an Odysee-native upload)
  // parse it out of the watch URL.
  const id = sel.source === video.source ? video.id : youtubeId(sel.url)
  return `https://www.youtube-nocookie.com/embed/${id ?? video.id}?autoplay=1`
}

function posterSrc(video: Video): string {
  if (video.source === "odysee" || video.source === "archive") return video.thumbnail
  return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
}

const SOURCE_META: Record<SourceKind, { label: string; active: string; dot: string }> = {
  youtube: { label: "YouTube",    active: "bg-red-600 text-white border-red-500",         dot: "bg-red-500" },
  odysee:  { label: "Odysee",     active: "bg-[#ef1970] text-white border-[#ef1970]",     dot: "bg-[#ef1970]" },
  archive: { label: "archive.org", active: "bg-sky-600 text-white border-sky-500",        dot: "bg-sky-500" },
}

export default function VideoEmbed({ video }: { video: Video }) {
  const sources = useMemo<AlternateSource[]>(
    () => [{ source: video.source, url: video.url }, ...(video.alternates ?? [])],
    [video]
  )
  // A source we know is dead (probed by scripts/10_check_youtube_status.py).
  // Only YouTube takedowns are tracked; Odysee/archive mirrors are assumed live.
  const ytGone = video.youtube_status === "deleted" || video.youtube_status === "private"
  const isDead = (s: AlternateSource) => s.source === "youtube" && ytGone

  const [playing, setPlaying] = useState(false)

  // Inside the Electron desktop shell, if the keep-list says we have a local
  // mp4 on disk for this video, play the file instead of embedding from
  // YouTube. This avoids embed-restriction 403s (a chemistry-channel owner
  // disabled third-party embedding) AND skip YouTube's age gate / regional
  // blocks — the whole point of keeping local copies of at-risk videos.
  // Returns the app://local/<id>.<ext> URL. Picking an alternate source
  // (selIdx > 0) bypasses the local file and embeds from that host instead.
  const localVideoUrl = useMemo(() => {
    if (typeof window === "undefined" || !window.desktop) return null
    return window.desktop.getLocalVideoUrl(video.id)
  }, [video.id])

  const [selIdx, setSelIdx] = useState(() => {
    // Desktop with a local file always starts on the primary (local) slot.
    if (localVideoUrl) return 0
    const i = sources.findIndex((s) => !isDead(s))
    return i === -1 ? 0 : i
  })
  const sel = sources[selIdx] ?? sources[0]
  const useLocal = selIdx === 0 ? localVideoUrl : null

  const badge = useLocal ? (
    <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-emerald-500/90 text-zinc-950">
      ★ local file
    </span>
  ) : sel.source === "odysee" ? (
    <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-[#ef1970]/90 text-white">
      Odysee
    </span>
  ) : sel.source === "archive" ? (
    <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-sky-600/90 text-white">
      archive.org
    </span>
  ) : null

  const switcher = sources.length > 1 && (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">
        Sources
      </span>
      {sources.map((s, i) => {
        const meta = SOURCE_META[s.source]
        const active = i === selIdx
        const dead = isDead(s)
        return (
          <button
            key={`${s.source}-${s.url}`}
            onClick={() => setSelIdx(i)}
            disabled={dead}
            aria-pressed={active}
            title={dead ? "Taken down by YouTube" : undefined}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              dead
                ? "bg-zinc-900/50 text-zinc-600 border-zinc-800 line-through cursor-not-allowed"
                : active
                  ? meta.active
                  : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dead ? "bg-zinc-700" : active ? "bg-white" : meta.dot}`} />
            {meta.label}
          </button>
        )
      })}
    </div>
  )

  if (playing) {
    // Local MP4 path — uses <video> for the desktop shell. Outside the shell
    // (or when no local file exists), fall back to the iframe embed.
    return (
      <div>
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
          {useLocal ? (
            <video
              className="absolute inset-0 w-full h-full"
              src={useLocal}
              poster={posterSrc(video)}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <iframe
              key={`${sel.source}-${sel.url}`}
              className="absolute inset-0 w-full h-full"
              src={embedSrc(video, sel)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {switcher}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setPlaying(true)}
        className="group relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-800 block"
        aria-label={`Play ${video.title}`}
      >
        {video.thumbnail && (
          <Image
            src={posterSrc(video)}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <span
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-xl group-hover:scale-110 ${
              useLocal
                ? "bg-emerald-600 group-hover:bg-emerald-500"
                : sel.source === "odysee"
                  ? "bg-[#ef1970] group-hover:bg-[#ff2d83]"
                  : sel.source === "archive"
                    ? "bg-sky-600 group-hover:bg-sky-500"
                    : "bg-red-600 group-hover:bg-red-500"
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white ml-1" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {/* Badge — which backend is serving this video */}
        {badge}
      </button>
      {switcher}
    </div>
  )
}
