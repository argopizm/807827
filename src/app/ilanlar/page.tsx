export const runtime = "edge";

import { getDB, formatRelativeDate } from "@/lib/db";
import JobListClient, { type Job } from "./JobListClient";

export default async function JobBoardPage({ searchParams }: { searchParams: Promise<{ q?: string; kategori?: string }> }) {
  const sp = await searchParams;
  let dbJobs: Job[] = [];

  try {
    const db = await getDB();
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT j.id, j.title, j.description, j.category, j.budget_range, j.skills, j.created_at,
                  COALESCE(u.full_name, u.name, u.username, 'İşveren') AS client_name,
                  (SELECT COUNT(*) FROM handshakes h WHERE h.job_id = j.id) AS proposals
           FROM jobs j
           LEFT JOIN users u ON j.client_id = u.id
           WHERE j.status = 'open'
           ORDER BY j.created_at DESC`
        )
        .all<Record<string, unknown>>();

      dbJobs = (results ?? []).map((j) => {
        let skills: string[] = [];
        try {
          skills = JSON.parse(String(j.skills ?? "[]"));
        } catch {
          skills = [];
        }
        return {
          id: String(j.id),
          title: String(j.title ?? ""),
          client: String(j.client_name ?? "İşveren"),
          budget: String(j.budget_range ?? "Belirtilmemiş"),
          category: String(j.category ?? "Genel"),
          description: String(j.description ?? ""),
          time: formatRelativeDate(j.created_at as string | null),
          proposals: Number(j.proposals ?? 0),
          skills: Array.isArray(skills) ? skills : [],
        };
      });
    }
  } catch (e) {
    console.error("[ilanlar]", e);
  }

  return <JobListClient jobs={dbJobs} initialQuery={sp.q ?? ""} initialCategory={sp.kategori ?? "Tümü"} />;
}
