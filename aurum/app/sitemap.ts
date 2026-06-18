import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://aurum.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/men`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/women`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/children`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/collections`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
