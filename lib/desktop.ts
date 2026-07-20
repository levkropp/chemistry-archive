// Bridge to the Electron desktop shell. When the web app is loaded inside the
// Electron window (preload.js exposes `window.desktop`), the renderer gains
// extra features — currently: persistent save/unsave of channels. When loaded
// in a normal browser (GitHub Pages deployment, `next dev`, etc.), `window.desktop`
// is undefined and every call here returns a no-op / empty result, so the same
// code path serves both contexts.

export type SavedChannelsAPI = {
  get: () => Promise<string[]>
  toggle: (slug: string) => Promise<string[]>
  onChange: (cb: (channels: string[]) => void) => () => void
}

export type LocalKeepRecord = {
  keep_local: boolean
  reasons: string[]
  title?: string
  channel?: string
  mp4_path?: string
}

export type LocalKeepAPI = {
  get: (id: string) => LocalKeepRecord
  totals: () => { total: number; keep_local: number; stream: number } | null
}

declare global {
  interface Window {
    desktop?: {
      isDesktop: boolean
      savedChannels: SavedChannelsAPI
      localKeep: LocalKeepAPI
      // Returns an app://local/<id>.<ext> URL if the video has a local MP4
      // on disk per the keep-list, otherwise null. The desktop shell's main
      // process serves those URLs from the archives/ directory.
      getLocalVideoUrl: (id: string) => string | null
    }
  }
}

export {}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && !!window.desktop
}

export function getSavedChannelsAPI(): SavedChannelsAPI | null {
  if (typeof window === "undefined" || !window.desktop) return null
  return window.desktop.savedChannels
}