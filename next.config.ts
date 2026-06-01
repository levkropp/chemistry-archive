import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "chemistry-archive";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
  // Inline Tailwind's CSS into <head> as <style> tags so styles arrive with the
  // HTML — eliminates the render-blocking CSS request that caused unstyled
  // content to flash during the heavy initial load. Production builds only.
  experimental: { inlineCss: true },
};

export default nextConfig;
