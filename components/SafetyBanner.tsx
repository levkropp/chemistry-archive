"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "safety-banner-dismissed-v1"

export default function SafetyBanner() {
  // Default visible so SSR renders it; hide post-hydration if already dismissed.
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1")
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-start gap-3">
        <span className="text-yellow-400 text-lg leading-none mt-0.5 flex-shrink-0">⚠</span>
        <p className="text-xs sm:text-sm text-yellow-100/90 leading-relaxed flex-1">
          <strong className="font-semibold text-yellow-200">Aggregation only — not a recommendation.</strong>{" "}
          This is an archival index of publicly-available chemistry videos preserved for
          educational and historical purposes. Nothing here endorses or encourages
          attempting any procedure shown. Many videos depict procedures that are{" "}
          <em>dangerous</em>, require professional training, or may be <em>illegal in your
          jurisdiction</em>. Verify local laws and consult qualified experts before
          attempting anything. The archive maintainers disclaim all liability.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss safety notice"
          className="text-yellow-300/60 hover:text-yellow-200 text-lg leading-none mt-0.5 flex-shrink-0 px-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
