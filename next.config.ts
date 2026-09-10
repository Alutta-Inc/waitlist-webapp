import type { NextConfig } from "next";

// Static assets (fonts, brand SVGs/PNGs) can be served from AWS S3 + CloudFront.
// Set NEXT_PUBLIC_ASSET_PREFIX to the CloudFront distribution URL in Vercel env
// vars. Leave empty locally — Next.js falls back to serving from /public.
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "";
const isDev = process.env.NODE_ENV !== "production";

/** The origin of a URL from the environment, or nothing if it is unset or not
 *  a URL. Used to widen one CSP directive by exactly the host it needs. */
function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const assetOrigin = originOf(assetPrefix);
const analyticsOrigin = originOf(process.env.NEXT_PUBLIC_ANALYTICS_URL) ?? "https://api.alutta.com";
const videoOrigin = originOf(process.env.NEXT_PUBLIC_EXPLAINER_VIDEO_URL);
const captionsOrigin = originOf(process.env.NEXT_PUBLIC_EXPLAINER_CAPTIONS_URL);

const TURNSTILE = "https://challenges.cloudflare.com";

// Content-Security-Policy.
//
// This site reaches almost nowhere: the fonts are local, every image is in
// /public, and the one third-party script is Cloudflare Turnstile on the
// waitlist form. Each allowance below is load-bearing:
//
//   script-src   Turnstile's widget script. `'unsafe-inline'` remains for
//                Next's own inline bootstrap, the same measured trade-off the
//                student app documents: a per-request nonce forces every page
//                dynamic, and this site is static by design. `'unsafe-eval'`
//                is dev-only (next dev evaluates; a production build does not).
//   frame-src    the Turnstile challenge is an iframe.
//   connect-src  the site's own API routes, and analytics-service's ingest
//                through the gateway (sendBeacon / fetch from the browser).
//   style-src    `'unsafe-inline'` for Next's style injection and the
//                components that set CSS custom properties from pointer events.
//   img-src      local assets, `data:` for the inline SVG icons and `blob:`
//                for next/image previews; plus the CDN origin when configured.
//   media-src    the explainer video, only from the origin that hosts it.
//
// object-src, base-uri, form-action and frame-ancestors are pinned so an
// injected element cannot load a plugin, retarget relative URLs, post the form
// elsewhere, or frame the site (the marketing site is never embedded).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${TURNSTILE}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${assetOrigin ? ` ${assetOrigin}` : ""}`,
  `font-src 'self'${assetOrigin ? ` ${assetOrigin}` : ""}`,
  `connect-src 'self' ${analyticsOrigin}${assetOrigin ? ` ${assetOrigin}` : ""}${isDev ? " ws: http://localhost:* http://127.0.0.1:*" : ""}`,
  `frame-src ${TURNSTILE}`,
  `media-src 'self'${videoOrigin ? ` ${videoOrigin}` : ""}${captionsOrigin && captionsOrigin !== videoOrigin ? ` ${captionsOrigin}` : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Two years, subdomains included, preload-eligible. Vercel sends HSTS on its
  // own domains too; stating it here keeps it if the host ever changes.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site needs a sensor, a payment handler or a camera.
  // navigator.share and the clipboard (the referral link) are not policy-gated.
  { key: "Permissions-Policy", value: "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Serve all static assets (_next/static/* and /public/*) from CloudFront when set
  assetPrefix: assetPrefix || undefined,

  // Next's own fingerprint header. The site is not a secret, but the version
  // does not need announcing to every scanner either.
  poweredByHeader: false,

  images: {
    // next/image optimises local files only. The one remote host that used to
    // be here (Unsplash) went with the components that used it; an open
    // remote pattern is a fetch-anything proxy at /_next/image and earns its
    // place only while something needs it.
    remotePatterns: assetOrigin
      ? [{ protocol: "https" as const, hostname: new URL(assetOrigin).hostname }]
      : [],
  },

  async redirects() {
    // The old build linked /manifest.json. An installed app or a cached page
    // may still ask for it; send it to the manifest that says "browser".
    return [{ source: "/manifest.json", destination: "/manifest.webmanifest", permanent: true }];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // API routes carry no page, so no CSP frame or script allowances apply;
      // they must never be cached by a shared cache either.
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
