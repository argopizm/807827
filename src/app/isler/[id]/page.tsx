export const runtime = "edge";

import { getDB, formatRelativeDate } from "@/lib/db";
import { notFound } from "next/navigation";
import JobDetailClient from "./JobDetailClient";

interface DBJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_range: string;
  status: string;
  created_at: string;
  client_id: string;
  client_name: string | null;
  client_username: string | null;
  client_jobs: number | null;
  client_rating: number | null;
}

async function getJob(id: string): Promise<DBJob | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const result = await db
      .prepare(
        `SELECT j.id, j.title, j.description, j.category, j.budget_range,
                j.status, j.created_at, j.client_id,
                COALESCE(u.full_name, u.name, u.username) AS client_name,
                u.username AS client_username,
                u.total_jobs_completed AS client_jobs,
                u.rating_avg AS client_rating
         FROM jobs j
         LEFT JOIN users u ON j.client_id = u.id
         WHERE j.id = ?`
      )
      .bind(id)
      .first<DBJob>();

    return result ?? null;
  } catch {
    return null;
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const jobData = {
    id: job.id,
    title: job.title,
    client: job.client_name ?? "İşveren",
    client_id: job.client_id,
    client_username: job.client_username ?? job.client_id,
    client_jobs: Number(job.client_jobs ?? 0),
    client_rating: Number(job.client_rating ?? 0),
    budget: job.budget_range ?? "Belirtilmemiş",
    category: job.category ?? "Genel",
    created_at: formatRelativeDate(job.created_at),
    status: job.status ?? "open",
    description: job.description ?? "",
  };

  return <JobDetailClient id={id} job={jobData} />;
}
