"use client"

import { useState } from "react"

export default function Transcript({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  if (!text) return null

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/50 transition-colors"
      >
        <span>Transcript</span>
        <span className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  )
}
