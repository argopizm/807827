import type { MetadataRoute } from "next";
import { isIndexableSite, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableSite) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
