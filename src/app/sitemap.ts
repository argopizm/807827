import type { MetadataRoute } from "next";
import { categoryHasIndexableInventory, getCategoryPage } from "@/lib/category-pages";
import { getCategoryInventory, PUBLIC_FREELANCER_SQL } from "@/lib/browse";
import { CATEGORY_GROUPS } from "@/lib/categories";
import { getDB } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { isIndexableSite, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableSite) return [];

  const paths = ["/", "/ilanlar", "/profil", "/hizmetler", "/kategoriler", "/rehber", ...GUIDES.map(({ slug }) => "/rehber/" + slug)];
  const [inventory, db] = await Promise.all([getCategoryInventory(), getDB()]);
  for (const group of CATEGORY_GROUPS) {
    for (const specialty of [undefined, ...group.specialties]) {
      const page = getCategoryPage(group.slug, specialty?.slug);
      if (page && categoryHasIndexableInventory(page, inventory)) paths.push(page.path);
    }
  }

  if (db) {
    try {
      const services = await db.prepare("SELECT id FROM services WHERE status = 'published' AND LENGTH(TRIM(description)) >= 60 ORDER BY created_at DESC, id LIMIT 5000").all<{ id: string }>();
      paths.push(...services.results.map(({ id }) => "/hizmetler/" + encodeURIComponent(id)));
      const [jobs, profiles] = await Promise.all([
        db.prepare("SELECT id FROM jobs WHERE status = 'open' AND LENGTH(TRIM(COALESCE(description, ''))) >= 60 ORDER BY created_at DESC, id LIMIT 5000").all<{ id: string }>(),
        db.prepare("SELECT username FROM users WHERE " + PUBLIC_FREELANCER_SQL + " AND LENGTH(TRIM(COALESCE(bio, ''))) >= 40 ORDER BY id LIMIT 5000").all<{ username: string }>(),
      ]);
      paths.push(...jobs.results.map(({ id }) => "/isler/" + encodeURIComponent(id)));
      paths.push(...profiles.results.map(({ username }) => "/profil/" + encodeURIComponent(username)));
    } catch {
      // The static public routes remain in the sitemap during a D1 outage.
    }
  }
  return paths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
