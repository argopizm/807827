import { publicNameSql } from "@/lib/public-identity";
import { cache } from "react";
import { notFound } from "next/navigation";
import { categoryTitle } from "@/lib/categories";
import { getDB, formatRelativeDate } from "@/lib/db";
import { publicMetadata, summarize } from "@/lib/seo";
import JobDetailClient from "./JobDetailClient";


interface DBJob {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  budget_range: string | null;
  status: string;
  created_at: string;
  client_id: string;
  client_name: string | null;
  client_username: string | null;
  client_jobs: number | null;
  client_rating: number | null;
}

const getJob = cache(async function (id: string): Promise<DBJob | null> {
  const db = await getDB();
  if (!db) return null;
  return db.prepare(
    "SELECT j.id, j.title, j.description, j.category, j.budget_range, j.status, j.created_at, j.client_id, " +
    "" + publicNameSql("u") + " AS client_name, " +
    "CASE WHEN u.onboarding_done = 1 AND u.user_type = 'employer' THEN u.username END AS client_username, " +
    "u.total_jobs_completed AS client_jobs, u.rating_avg AS client_rating " +
    "FROM jobs j LEFT JOIN users u ON j.client_id = u.id " +
    "WHERE j.id = ? AND j.status IN ('open', 'in_progress', 'active', 'completed', 'closed')"
  ).bind(id).first<DBJob>();
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const job = await getJob((await params).id);
  if (!job) notFound();
  return publicMetadata({
    title: job.title,
    description: summarize(job.description ?? "") || "Frenaw freelance proje ilanı.",
    path: "/isler/" + encodeURIComponent(job.id),
    index: job.status === "open" && (job.description?.trim().length ?? 0) >= 60,
  });
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJob((await params).id);
  if (!job) notFound();
  return (
    <JobDetailClient job={{
      id: job.id,
      title: job.title,
      client: job.client_name ?? "İşveren",
      client_id: job.client_id,
      client_username: job.client_username,
      client_jobs: Number(job.client_jobs ?? 0),
      client_rating: Number(job.client_rating ?? 0),
      budget: job.budget_range ?? "Belirtilmemiş",
      category: categoryTitle(job.category),
      created_at: formatRelativeDate(job.created_at),
      status: job.status,
      description: job.description ?? "",
    }} />
  );
}
