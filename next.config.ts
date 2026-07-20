import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// DESKTOP_BUILD=1 produces a static export with no basePath so the Electron
// shell can load `out/index.html` directly via file://. The GitHub Pages build
// (no DESKTOP_BUILD) keeps the project-site basePath /chemistry-archive.
const isDesktop = process.env.DESKTOP_BUILD === "1";
const repoName = "chemistry-archive";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd && !isDesktop ? `/${repoName}` : "",
  assetPrefix: isProd && !isDesktop ? `/${repoName}/` : "",
  images: { unoptimized: true },
  // Inline Tailwind's CSS into <head> as <style> tags so styles arrive with the
  // HTML — eliminates the render-blocking CSS request that caused unstyled
  // content to flash during the heavy initial load. Production builds only.
  experimental: { inlineCss: true },
};

export default nextConfig;
