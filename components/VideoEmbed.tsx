"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import type { Video } from "@/lib/types"

function embedSrc(video: Video): string {
  if (video.source === "odysee") {
    // https://odysee.com/name:claimid -> https://odysee.com/$/embed/name:claimid
    return video.url.replace("odysee.com/", "odysee.com/$/embed/") + "?autoplay=true"
  }
  if (video.source === "archive") {
    // archive.org details URL -> embed player for that specific file
    return video.url.replace("/details/", "/embed/")
  }
  return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`
}

function posterSrc(video: Video): string {
  if (video.source === "odysee" || video.source === "archive") return video.thumbnail
  return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
}

export default function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false)

  // Inside the Electron desktop shell, if the keep-list says we have a local
  // mp4 on disk for this video, play the file instead of embedding from
  // YouTube. This avoids embed-restriction 403s (a chemistry-channel owner
  // disabled third-party embedding) AND skip YouTube's age gate / regional
  // blocks — the whole point of keeping local copies of at-risk videos.
  // Returns the app://local/<id>.<ext> URL.
  const localVideoUrl = useMemo(() => {
    if (typeof window === "undefined" || !window.desktop) return null
    return window.desktop.getLocalVideoUrl(video.id)
  }, [video.id])

  if (playing) {
    // Local MP4 path — uses <video> for the desktop shell. Outside the shell
    // (or when no local file exists), fall back to the iframe embed.
    if (localVideoUrl) {
      return (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
          <video
            className="absolute inset-0 w-full h-full"
            src={localVideoUrl}
            poster={posterSrc(video)}
            controls
            autoPlay
            playsInline
          />
        </div>
      )
    }
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedSrc(video)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
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
            localVideoUrl
              ? "bg-emerald-600 group-hover:bg-emerald-500"
              : video.source === "odysee"
                ? "bg-[#ef1970] group-hover:bg-[#ff2d83]"
                : video.source === "archive"
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
      {localVideoUrl ? (
        <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-emerald-500/90 text-zinc-950">
          ★ local file
        </span>
      ) : video.source === "odysee" ? (
        <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-[#ef1970]/90 text-white">
          Odysee
        </span>
      ) : video.source === "archive" ? (
        <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold px-2 py-0.5 rounded bg-sky-600/90 text-white">
          archive.org
        </span>
      ) : null}
    </button>
  )
}
