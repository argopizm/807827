export const runtime = 'edge';

import { auth } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Kimlik kontrolü
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Bu işlem için giriş yapmanız gerekiyor." },
      { status: 401 }
    );
  }

  const freelancerId = session.user.id;

  let body: { jobId?: string; clientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { jobId, clientId } = body;

  if (!jobId || !clientId) {
    return NextResponse.json({ error: "jobId ve clientId gerekli." }, { status: 400 });
  }

  // Kendi ilanına başvuramaz
  if (freelancerId === clientId) {
    return NextResponse.json(
      { error: "Kendi ilanınıza el sıkışma talebi gönderemezsiniz." },
      { status: 400 }
    );
  }

  // 2. Veritabanı işlemleri
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      // Demo mod: DB bağlı değil, başarı simüle et
      return NextResponse.json({
        success: true,
        message: "El sıkışma talebi gönderildi (demo).",
        id: `demo-${Date.now()}`,
      });
    }

    // Kullanıcı DB'de yoksa oluştur (Google OAuth ilk girişte)
    await db
      .prepare(`
        INSERT OR IGNORE INTO users (id, email, full_name, avatar_url)
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        freelancerId,
        session.user.email ?? "",
        session.user.name ?? "",
        session.user.image ?? ""
      )
      .run();

    // İlanın var olup olmadığını kontrol et
    const job = await db
      .prepare("SELECT id, status FROM jobs WHERE id = ?")
      .bind(jobId)
      .first<{ id: string; status: string }>();

    if (!job) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }

    if (job.status !== "open") {
      return NextResponse.json(
        { error: "Bu ilan artık aktif değil." },
        { status: 400 }
      );
    }

    // Daha önce el sıkışma talebi gönderilmiş mi?
    const existing = await db
      .prepare(
        "SELECT id FROM handshakes WHERE job_id = ? AND freelancer_id = ? AND status != 'cancelled'"
      )
      .bind(jobId, freelancerId)
      .first();

    if (existing) {
      return NextResponse.json(
        { error: "Bu iş için zaten bir talebiniz var." },
        { status: 409 }
      );
    }

    // El sıkışma kaydı oluştur
    const handshakeId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO handshakes (id, job_id, freelancer_id, client_id, status)
        VALUES (?, ?, ?, ?, 'pending')
      `)
      .bind(handshakeId, jobId, freelancerId, clientId)
      .run();

    return NextResponse.json({
      success: true,
      message: "El sıkışma talebi başarıyla gönderildi.",
      id: handshakeId,
    });
  } catch (err) {
    console.error("Handshake API error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
