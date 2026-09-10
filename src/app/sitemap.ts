import type { MetadataRoute } from "next";

const siteUrl = "https://alutta.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${siteUrl}/ng`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/ng/waitlist`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      // Where every "join" link on the site lands, and the page a shared
      // referral link (?ref=CODE) opens.
      url: `${siteUrl}/waitlist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // The canonical careers home — the job board's own root canonicalises here.
      url: `${siteUrl}/careers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
