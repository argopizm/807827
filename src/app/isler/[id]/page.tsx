export const runtime = 'edge';

import { getRequestContext } from "@cloudflare/next-on-pages";
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
  client_email: string | null;
}

// Mock data fallback (local development)
const MOCK_JOB: DBJob = {
  id: "demo-1",
  title: "Next.js ile E-Ticaret Arayüzü (Demo)",
  description: `Mevcut Figma tasarımımızı Next.js ve Tailwind kullanarak koda dökecek bir freelancer arıyoruz.

Beklentilerimiz:
- Pixel-perfect kodlama
- SEO uyumlu yapı (Semantic HTML)
- Hızlı yükleme süreleri (Lighthouse 90+)
- Responsive tasarım

Teslim süresi 15 gündür. Detaylar için el sıkıştıktan sonra WhatsApp üzerinden görüşülecektir.`,
  category: "Yazılım",
  budget_range: "15.000 - 20.000 TL",
  status: "open",
  created_at: new Date().toLocaleDateString("tr-TR"),
  client_id: "demo-client-1",
  client_name: "Dijital Akademi",
  client_email: null,
};

async function getJob(id: string): Promise<DBJob | null> {
  try {
    const { env } = getRequestContext();
    const db = env.DB;
    if (!db) return null;

    const result = await db
      .prepare(`
        SELECT 
          j.id, j.title, j.description, j.category, j.budget_range,
          j.status, j.created_at, j.client_id,
          u.full_name AS client_name, u.email AS client_email
        FROM jobs j
        LEFT JOIN users u ON j.client_id = u.id
        WHERE j.id = ?
      `)
      .bind(id)
      .first<DBJob>();

    return result ?? null;
  } catch {
    return null;
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let job = await getJob(id);

  // Demo/fallback için mock data
  if (!job) {
    if (id === "demo-1" || id === "1") {
      job = MOCK_JOB;
    } else {
      notFound();
    }
  }

  const jobData = {
    id: job.id,
    title: job.title,
    client: job.client_name ?? job.client_email ?? "Anonim",
    client_id: job.client_id,
    budget: job.budget_range ?? "Belirtilmemiş",
    category: job.category ?? "Genel",
    created_at: new Date(job.created_at).toLocaleDateString("tr-TR"),
    status: job.status ?? "open",
    description: job.description ?? "",
  };

  return <JobDetailClient id={id} job={jobData} />;
}
