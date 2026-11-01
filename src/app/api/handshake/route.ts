export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bu işlem için giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const freelancerId = session.user.id;
  const body = await request.json().catch(() => null);
  const { jobId, clientId } = body ?? {};

  if (!jobId || !clientId) {
    return NextResponse.json({ error: "jobId ve clientId gerekli." }, { status: 400 });
  }
  if (freelancerId === clientId) {
    return NextResponse.json({ error: "Kendi ilanınıza teklif gönderemezsiniz." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı yok." }, { status: 500 });

    const job = await db
      .prepare("SELECT id, status FROM jobs WHERE id = ?")
      .bind(jobId)
      .first<{ id: string; status: string }>();

    if (!job) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    if (job.status && job.status !== "open") {
      return NextResponse.json({ error: "Bu ilan artık aktif değil." }, { status: 400 });
    }

    const existing = await db
      .prepare("SELECT id FROM handshakes WHERE job_id = ? AND freelancer_id = ? AND status != 'cancelled'")
      .bind(jobId, freelancerId)
      .first<{ id: string }>();

    if (existing) {
      return NextResponse.json({ error: "Bu iş için zaten bir el sıkışma talebiniz var." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO handshakes (id, job_id, freelancer_id, client_id, status, created_at) VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)")
      .bind(id, jobId, freelancerId, clientId)
      .run();

    return NextResponse.json({ success: true, message: "El sıkışma talebi gönderildi.", id });
  } catch (e) {
    console.error("[handshake]", e);
    return NextResponse.json({ error: "Sunucu hatası: " + String(e) }, { status: 500 });
  }
}
