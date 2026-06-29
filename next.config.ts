import type { NextConfig } from "next";

// Static assets (fonts, brand SVGs/PNGs) are served from AWS S3 + CloudFront.
// Set NEXT_PUBLIC_ASSET_PREFIX to your CloudFront distribution URL in Vercel env vars.
// Example: https://d1234abcd.cloudfront.net
// Leave empty locally — Next.js will fall back to serving from /public as normal.
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "";

const nextConfig: NextConfig = {
  // Serve all static assets (_next/static/* and /public/*) from CloudFront when set
  assetPrefix: assetPrefix || undefined,

  images: {
    // Allow Next.js <Image> to load from the CloudFront domain
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(assetPrefix
        ? [{ protocol: "https" as const, hostname: new URL(assetPrefix).hostname }]
        : []),
    ],
  },
};

export default nextConfig;
