import { canonicalSkill } from "@/lib/skills";
import { publicNameSql } from "@/lib/public-identity";
import { categoryStorageValues, categoryTitle, foldTurkish } from "@/lib/categories";
import { getDB } from "@/lib/db";
import type { BrowseParams } from "@/lib/browse";

export type Service = {
  id: string;
  freelancer_id: string;
  username: string;
  name: string;
  title: string;
  description: string;
  category: string;
  budget_range: string;
  created_at: string;
};

export const servicePageSize = 20;
const select = "SELECT s.id, s.freelancer_id, u.username, " + publicNameSql("u") + " AS name, s.title, s.description, s.category, s.budget_range, s.created_at FROM services s JOIN users u ON u.id = s.freelancer_id";
const publicOnly = "s.status = 'published' AND u.user_type = 'freelancer' AND u.onboarding_done = 1 AND NULLIF(TRIM(u.username), '') IS NOT NULL";
const replacements = [["İ", "i"], ["ı", "i"], ["Ş", "s"], ["ş", "s"], ["Ğ", "g"], ["ğ", "g"], ["Ü", "u"], ["ü", "u"], ["Ö", "o"], ["ö", "o"], ["Ç", "c"], ["ç", "c"]];

function searchExpression() {
  const expression = "s.title || ' ' || s.description || ' ' || COALESCE(u.display_name, '') || ' ' || COALESCE(u.username, '')";
  return "LOWER(" + replacements.reduce((sql, [from, to]) => "REPLACE(" + sql + ", '" + from + "', '" + to + "')", expression) + ")";
}

export async function listServices(filters: BrowseParams) {
  try {
    const db = await getDB();
    if (!db) return { items: [] as Service[], next: false, available: false };
    const conditions = [publicOnly];
    const values: unknown[] = [];
    if (filters.category) {
      const categories = categoryStorageValues(filters.category);
      if (categories.length) {
        conditions.push("LOWER(s.category) IN (" + categories.map(() => "?").join(", ") + ")");
        values.push(...categories);
      }
    }
    if (filters.q) {
      conditions.push("INSTR(" + searchExpression() + ", ?) > 0");
      values.push(foldTurkish(canonicalSkill(filters.q)));
    }
    const result = await db.prepare(select + " WHERE " + conditions.join(" AND ") + " ORDER BY s.created_at DESC, s.id DESC LIMIT ? OFFSET ?")
      .bind(...values, servicePageSize + 1, (filters.page - 1) * servicePageSize).all<Service>();
    return { items: result.results.slice(0, servicePageSize), next: result.results.length > servicePageSize, available: true };
  } catch {
    return { items: [] as Service[], next: false, available: false };
  }
}

export async function getService(id: string): Promise<Service | null> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return null;
  const db = await getDB();
  if (!db) return null;
  return db.prepare(select + " WHERE s.id = ? AND " + publicOnly).bind(id).first<Service>();
}

export function serviceCategoryTitle(service: Pick<Service, "category">) {
  return categoryTitle(service.category);
}
