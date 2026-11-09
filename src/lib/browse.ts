import { canonicalSkill, normalizeSkills } from "@/lib/skills";
import { publicNameSql } from "@/lib/public-identity";
import { categoryStorageValues, categoryTitle, foldTurkish, normalizeCategory } from "@/lib/categories";
import { formatRelativeDate, getDB } from "@/lib/db";

export type SearchParams = Record<string, string | string[] | undefined>;
export const PAGE_SIZE = 20;

export function browseParams(params: SearchParams) {
  const single = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
  const pageText = single(params.sayfa);
  return {
    q: single(params.q).trim().slice(0, 100),
    category: normalizeCategory(single(params.kategori)) ?? "",
    sort: single(params.sirala),
    page: /^\d{1,4}$/.test(pageText) ? Math.max(1, Number(pageText)) : 1,
  };
}

export type BrowseParams = ReturnType<typeof browseParams>;

export function browseHref(path: string, filters: BrowseParams) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.category) query.set("kategori", filters.category);
  if (filters.sort) query.set("sirala", filters.sort);
  if (filters.page > 1) query.set("sayfa", String(filters.page));
  return query.size ? path + "?" + query.toString() : path;
}

const turkishReplacements = [
  ["İ", "i"], ["ı", "i"], ["ş", "s"], ["Ş", "s"], ["ğ", "g"], ["Ğ", "g"],
  ["ü", "u"], ["Ü", "u"], ["ö", "o"], ["Ö", "o"], ["ç", "c"], ["Ç", "c"],
];

function foldedSql(column: string) {
  return "LOWER(" + turkishReplacements.reduce((sql, [source, target]) =>
    "REPLACE(" + sql + ", '" + source + "', '" + target + "')", column) + ")";
}

function categoryFilter(column: string, category: string) {
  const values = categoryStorageValues(category);
  if (!values.length) return { sql: "", values: [] };
  const placeholders = values.map(() => "?").join(", ");
  return { sql: foldedSql("TRIM(" + column + ")") + " IN (" + placeholders + ")", values };
}

function searchFilter(columns: string[], categoryColumn: string, q: string) {
  if (!q) return { sql: "", values: [] };
  const parts = columns.map((column) => "COALESCE(" + column + ", '')").join(" || ' ' || ");
  const search = "INSTR(" + foldedSql(parts) + ", ?) > 0";
  const matchedCategory = normalizeCategory(q);
  const category = matchedCategory ? categoryFilter(categoryColumn, matchedCategory) : null;
  return category?.sql
    ? { sql: "(" + search + " OR " + category.sql + ")", values: [foldTurkish(canonicalSkill(q)), ...category.values] }
    : { sql: search, values: [foldTurkish(canonicalSkill(q))] };
}

export function parseSkills(json: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(json ?? "[]");
    return Array.isArray(parsed) ? normalizeSkills(parsed).slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function publicHttpsUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

interface JobRow {
  id: string;
  title: string;
  client_name: string;
  budget_range: string | null;
  category: string | null;
  description: string | null;
  created_at: string | null;
  proposals: number;
  skills: string | null;
}

export interface BrowseJob {
  id: string;
  title: string;
  client: string;
  budget: string;
  category: string;
  description: string;
  time: string;
  proposals: number;
  skills: string[];
}

export const PUBLIC_FREELANCER_SQL =
  "user_type = 'freelancer' AND onboarding_done = 1 AND NULLIF(TRIM(username), '') IS NOT NULL";

interface ProfileRow {
  id: string;
  username: string;
  name: string;
  title: string | null;
  category: string | null;
  bio: string | null;
  avatar: string | null;
  rating_avg: number | null;
  total_jobs_completed: number | null;
  skills: string | null;
}

export interface BrowseFreelancer {
  id: string;
  username: string;
  name: string;
  title: string;
  category: string;
  bio: string;
  avatar: string;
  rating: number;
  completed: number;
  skills: string[];
}

export type BrowseResults<T> = { items: T[]; next: boolean; available: boolean };

const cleanBudget = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(j.budget_range, '₺', ''), '.', ''), ' ', ''), 'TL', ''), '–', '-'), '—', '-'), ',', '.')";
const budgetSort = "CAST(CASE WHEN INSTR(" + cleanBudget + ", '-') > 0 THEN SUBSTR(" + cleanBudget +
  ", INSTR(" + cleanBudget + ", '-') + 1) ELSE " + cleanBudget + " END AS REAL) DESC, ";

export async function browseJobs(filters: BrowseParams): Promise<BrowseResults<BrowseJob>> {
  try {
    const db = await getDB();
    if (!db) return { items: [], next: false, available: false };
    const category = categoryFilter("j.category", filters.category);
    const search = searchFilter(["j.title", "j.description", "j.skills", "j.category"], "j.category", filters.q);
    const conditions = ["j.status = 'open'", category.sql, search.sql].filter(Boolean).join(" AND ");
    const order = (filters.sort === "butce" ? budgetSort : "") + "j.created_at DESC, j.id DESC";
    const { results } = await db.prepare(
      "SELECT j.id, j.title, j.description, j.category, j.budget_range, j.skills, j.created_at, " +
      "" + publicNameSql("u") + " AS client_name, " +
      "(SELECT COUNT(*) FROM handshakes h WHERE h.job_id = j.id AND h.status != 'cancelled') AS proposals " +
      "FROM jobs j LEFT JOIN users u ON j.client_id = u.id WHERE " + conditions +
      " ORDER BY " + order + " LIMIT ? OFFSET ?"
    ).bind(...category.values, ...search.values, PAGE_SIZE + 1, (filters.page - 1) * PAGE_SIZE).all<JobRow>();

    return {
      items: results.slice(0, PAGE_SIZE).map((job) => ({
        id: job.id,
        title: job.title,
        client: job.client_name,
        budget: job.budget_range ?? "Belirtilmemiş",
        category: categoryTitle(job.category),
        description: (job.description ?? "").slice(0, 500),
        time: formatRelativeDate(job.created_at),
        proposals: job.proposals,
        skills: parseSkills(job.skills),
      })),
      next: results.length > PAGE_SIZE,
      available: true,
    };
  } catch {
    return { items: [], next: false, available: false };
  }
}

export async function browseFreelancers(filters: BrowseParams): Promise<BrowseResults<BrowseFreelancer>> {
  try {
    const db = await getDB();
    if (!db) return { items: [], next: false, available: false };
    const category = categoryFilter("category", filters.category);
    const search = searchFilter(["display_name", "username", "title", "bio", "skills", "category"], "category", filters.q);
    const conditions = [PUBLIC_FREELANCER_SQL, category.sql, search.sql].filter(Boolean).join(" AND ");
    const order = filters.sort === "is" ? "total_jobs_completed DESC, rating_avg DESC, id ASC" : "rating_avg DESC, total_jobs_completed DESC, id ASC";
    const { results } = await db.prepare(
      "SELECT id, username, " + publicNameSql() + " AS name, title, category, bio, skills, " +
      "COALESCE(avatar_url, image) AS avatar, rating_avg, total_jobs_completed FROM users WHERE " +
      conditions + " ORDER BY " + order + " LIMIT ? OFFSET ?"
    ).bind(...category.values, ...search.values, PAGE_SIZE + 1, (filters.page - 1) * PAGE_SIZE).all<ProfileRow>();

    return {
      items: results.slice(0, PAGE_SIZE).map(publicProfile),
      next: results.length > PAGE_SIZE,
      available: true,
    };
  } catch {
    return { items: [], next: false, available: false };
  }
}

export async function getCategoryInventory() {
  const inventory = new Map<string, number>();
  try {
    const db = await getDB();
    if (!db) return inventory;
    const { results } = await db.prepare(
      "SELECT category, SUM(total) AS total FROM (" +
      "SELECT category, COUNT(*) AS total FROM jobs WHERE status = 'open' GROUP BY category UNION ALL " +
      "SELECT category, COUNT(*) AS total FROM users WHERE " + PUBLIC_FREELANCER_SQL +
      " GROUP BY category) GROUP BY category"
    ).all<{ category: string | null; total: number }>();

    for (const row of results) {
      const category = normalizeCategory(row.category ?? "");
      if (category) inventory.set(category, (inventory.get(category) ?? 0) + row.total);
    }
  } catch {
    // A temporary database failure keeps inventory-driven landing pages out of search results.
  }
  return inventory;
}


// Select public profile fields only. Private account/contact data never reaches the rail.
function publicProfile(profile: ProfileRow): BrowseFreelancer {
  return {
    id: profile.id, username: profile.username, name: profile.name,
    title: profile.title ?? categoryTitle(profile.category), category: categoryTitle(profile.category),
    bio: (profile.bio ?? "").slice(0, 400), avatar: publicHttpsUrl(profile.avatar),
    rating: Number(profile.rating_avg ?? 0), completed: Number(profile.total_jobs_completed ?? 0),
    skills: parseSkills(profile.skills),
  };
}

export async function randomFreelancers(): Promise<BrowseResults<BrowseFreelancer>> {
  try {
    const db = await getDB();
    if (!db) return { items: [], next: false, available: false };
    const { results } = await db.prepare(
      "SELECT id, username, " + publicNameSql() + " AS name, title, category, bio, skills, " +
      "COALESCE(avatar_url, image) AS avatar, rating_avg, total_jobs_completed FROM users WHERE " +
      PUBLIC_FREELANCER_SQL + " ORDER BY RANDOM() LIMIT 8"
    ).all<ProfileRow>();
    return { items: results.map(publicProfile), next: false, available: true };
  } catch {
    return { items: [], next: false, available: false };
  }
}
