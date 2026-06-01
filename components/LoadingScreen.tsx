"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen loading overlay shown until the page hydrates.
 *
 * Everything here is styled with INLINE styles (plus one injected <style> for
 * the spinner keyframes) so it renders correctly even before the stylesheet
 * loads — it is immune to the flash-of-unstyled-content that the overlay exists
 * to hide. The large embedded videos.json makes the initial HTML heavy, so the
 * overlay covers the progressively-rendering page until React is interactive.
 */
export default function LoadingScreen() {
  // `done` triggers unmount after the fade-out transition completes.
  const [done, setDone] = useState(false);
  // `hidden` drives the opacity transition (set on hydration).
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // This effect runs once React has hydrated — i.e. the (large) HTML is fully
    // parsed and, because CSS is inlined in <head>, styles are already applied.
    // That's the moment the page is genuinely ready, so hide then rather than
    // waiting for the window `load` event (which also waits for every remote
    // thumbnail and would keep the spinner up far too long). A small minimum
    // display avoids a jarring flash on fast loads.
    let fadeTimer: ReturnType<typeof setTimeout>;
    const startHide = () => {
      setHidden(true);
      fadeTimer = setTimeout(() => setDone(true), 400); // match transition
    };
    const minTimer = setTimeout(startHide, 250);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        background: "#09090b", // zinc-950, matches body
        color: "#fafafa",
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: hidden ? "none" : "auto",
        fontFamily:
          "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`@keyframes ca-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "28px", color: "#34d399" }}>⚗</span>
        <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em" }}>
          Chemistry Archive
        </span>
      </div>

      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid #27272a", // zinc-800
          borderTopColor: "#34d399", // emerald-400
          borderRadius: "50%",
          animation: "ca-spin 0.8s linear infinite",
        }}
      />

      <div style={{ fontSize: "13px", color: "#71717a" /* zinc-500 */ }}>
        Loading the archive…
      </div>
    </div>
  );
}
