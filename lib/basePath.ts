// Path prefix the app is deployed under (GitHub Pages project site). Mirrors the
// `basePath`/`assetPrefix` in next.config.ts. next/link and next/router apply the
// basePath automatically, but raw fetch() does NOT — so prepend this when fetching
// static assets from public/ (e.g. the browse index). NODE_ENV is inlined into the
// client bundle at build time, so this resolves correctly in the browser.
export const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/chemistry-archive" : "";
