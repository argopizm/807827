import type { Metadata } from "next";

const fallbackUrl = "https://807827.pages.dev";
const configured = process.env.NEXT_PUBLIC_SITE_URL;

function resolveSiteUrl() {
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" && !url.username && !url.password) return new URL(url.origin);
    } catch {
      // Missing or invalid production configuration uses the existing public hostname.
    }
  }
  return new URL(fallbackUrl);
}

export const siteUrl = resolveSiteUrl();
export const isIndexableSite =
  process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true" &&
  (!process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH === "main");

export function publicMetadata({
  title, description, path, index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const canonical = new URL(path, siteUrl);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "Frenaw", locale: "tr_TR", type: "website", images: [{ url: new URL("/images/frenaw-paylasim.jpg", siteUrl), width: 1200, height: 630, alt: "Frenaw" }] },
    twitter: { card: "summary_large_image", title, description, images: [new URL("/images/frenaw-paylasim.jpg", siteUrl)] },
    robots: { index: isIndexableSite && index, follow: isIndexableSite },
  };
}

export function jsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function summarize(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? normalized.slice(0, maxLength - 1).trimEnd() + "…" : normalized;
}
