// Curated "keep local" recommendation for each video — the public, committed
// keep-list at web-app/data/local_keep.json describes which videos are worth
// preserving as local MP4s (vs. letting the desktop app stream them on demand
// from YouTube/Odysee). This module provides a unified lookup that works in
// both the browser (lazy-fetched from /data/local_keep.json) and the desktop
// Electron shell (synchronous via window.desktop.localKeep.get).
//
// The web app uses this to optionally show a "★ kept" badge on cards and a
// banner on the video page (indicating the curator considers it at-risk /
// worth preserving). The desktop shell uses it to decide between an embedded
// player and a local <video> file (future work).

import { BASE_PATH } from "./basePath"
import { isDesktop } from "./desktop"

// Subset of LocalKeepRecord we care about for display.
export type KeepEntry = {
  keep_local: boolean
  reasons: string[]
}

const cache: { entries?: Record<string, KeepEntry>; promise?: Promise<void> } = {}

async function loadInBrowser(): Promise<Record<string, KeepEntry>> {
  if (cache.entries) return cache.entries
  if (!cache.promise) {
    cache.promise = fetch(`${BASE_PATH}/data/local_keep.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { videos: Record<string, KeepEntry> }) => {
        cache.entries = data.videos || {}
      })
      .catch(() => {
        cache.entries = {}
      })
  }
  await cache.promise
  return cache.entries!
}

export async function getKeepEntryAsync(id: string): Promise<KeepEntry> {
  if (isDesktop()) {
    // Synchronous in the desktop shell
    return window.desktop!.localKeep.get(id) as KeepEntry
  }
  const entries = await loadInBrowser()
  return (
    entries[id] || { keep_local: false, reasons: [] }
  )
}

// Synchronous — only meaningful inside the Electron desktop shell, where the
// keep-list is baked in at preload time. Returns null in the browser.
export function getKeepEntrySync(id: string): KeepEntry | null {
  if (isDesktop()) {
    return window.desktop!.localKeep.get(id) as KeepEntry
  }
  return null
}

// Short human-readable label for the primary reason, used by card badges.
const REASON_LABELS: Record<string, string> = {
  safety: "at-risk",
  reaction: "at-risk",
  reagent: "precursor",
  product: "energetic",
  concept: "energetic",
  drug_class: "drug-adjacent",
  topic: "energetic",
  title: "at-risk",
  description: "at-risk",
}

export function reasonLabel(reasons: string[]): string {
  if (!reasons.length) return ""
  for (const r of reasons) {
    const cat = r.split(":")[0]
    if (REASON_LABELS[cat]) return REASON_LABELS[cat]
  }
  return "at-risk"
}