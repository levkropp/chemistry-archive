// Path prefix the app is deployed under. Mirrors the `basePath`/
// `assetPrefix` in next.config.ts, which is set via the DESKTOP_BUILD env
// var at build time.
//
// next/link and next/router apply basePath automatically, but raw fetch()
// does NOT — so prepend this when fetching static assets from public/ (e.g.
// the browse index).
//
// Why an env var instead of just `NODE_ENV`:
//   - GitHub Pages build → basePath = `/chemistry-archive`
//   - Desktop build (NEXT_PUBLIC_DESKTOP=1) → basePath = `` (empty, loaded
//     via file://+ the app:// protocol so absolute paths resolve to the
//     export dir)
//   - `next dev` → basePath = `` (empty, dev server runs at /)
//
// Next.js bakes NEXT_PUBLIC_* into the client bundle at build time. The
// build scripts set NEXT_PUBLIC_DESKTOP=1 for desktop exports; the GitHub
// Pages workflow doesn't, so the production fallback kicks in.
//
// We can't pass an empty NEXT_PUBLIC_BASE_PATH because shell env vars that
// hold the empty string are hard to express reliably across platforms, so we
// use a sentinel flag (`NEXT_PUBLIC_DESKTOP`) instead.

const isDesktop = process.env.NEXT_PUBLIC_DESKTOP === "1"
export const BASE_PATH = isDesktop
  ? ""
  : process.env.NEXT_PUBLIC_BASE_PATH ??
    (process.env.NODE_ENV === "production" ? "/chemistry-archive" : "")