/**
 * Returns the full URL for a public asset, using the CloudFront CDN prefix
 * when NEXT_PUBLIC_ASSET_PREFIX is set (production), or a relative path locally.
 *
 * Usage: assetUrl("/brand/logo-horizontal-coloured.svg")
 *   → "https://d1234abcd.cloudfront.net/brand/logo-horizontal-coloured.svg"  (prod)
 *   → "/brand/logo-horizontal-coloured.svg"                                   (local)
 */
export function assetUrl(path: string): string {
  const prefix = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "";
  if (!prefix) return path;
  // Avoid double slashes
  return `${prefix.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
