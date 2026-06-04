"use client"

import { useState, useEffect, useRef } from "react"
import VideoCard from "./VideoCard"
import type { BrowseVideo } from "@/lib/types"

const PAGE = 48

/**
 * Renders a video grid incrementally: only the first PAGE cards mount, and more
 * are appended as the user scrolls a bottom sentinel into view. Keeps the DOM
 * bounded even when the result set has thousands of videos. The visible count
 * resets whenever the input array changes identity (e.g. a filter/search edit).
 */
export default function VideoGrid({ videos }: { videos: BrowseVideo[] }) {
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // New result set → start from the top. Resetting during render (rather than in
  // an effect) avoids a wasted extra render and the cascading-render lint rule.
  const [prevVideos, setPrevVideos] = useState(videos)
  if (videos !== prevVideos) {
    setPrevVideos(videos)
    setVisible(PAGE)
  }

  // Grow as the sentinel enters view. Re-observing on `visible` change means a
  // sentinel still within the (generous) root margin fires again immediately,
  // auto-filling tall viewports until it scrolls out of range or all are shown.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || visible >= videos.length) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE, videos.length))
        }
      },
      { rootMargin: "800px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [videos.length, visible])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.slice(0, visible).map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      {visible < videos.length && (
        <div
          ref={sentinelRef}
          className="h-12 flex items-center justify-center text-xs text-zinc-600"
        >
          Loading more… ({visible} / {videos.length})
        </div>
      )}
    </>
  )
}
