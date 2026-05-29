"use client"

import { useState } from "react"
import Image from "next/image"

export default function YouTubeEmbed({
  id,
  title,
  thumbnail,
}: {
  id: string
  title: string
  thumbnail: string
}) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
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
      aria-label={`Play ${title}`}
    >
      <Image
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover"
        unoptimized
        priority
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-500 group-hover:scale-110 transition-all shadow-xl">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white ml-1" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
