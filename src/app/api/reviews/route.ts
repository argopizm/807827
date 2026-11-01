export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const { handshakeId, rating, comment } = await request.json().catch(() => ({}));
  const numRating = Number(rating);
  if (!handshakeId || !numRating || numRating < 1 || numRating > 5) {
    return NextResponse.json({ error: "Geçerli bir puan seçin." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı yok." }, { status: 500 });

    const hs = await db
      .prepare("SELECT id, job_id, freelancer_id, client_id FROM handshakes WHERE id = ?")
      .bind(handshakeId)
      .first<{ id: string; job_id: string; freelancer_id: string; client_id: string }>();

    if (!hs) {
      return NextResponse.json({ error: "El sıkışma kaydı bulunamadı." }, { status: 404 });
    }

    const reviewerId = session.user.id;
    const revieweeId = reviewerId === hs.client_id ? hs.freelancer_id : hs.client_id;

    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO reviews (id, handshake_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, handshakeId, reviewerId, revieweeId, numRating, String(comment ?? "").trim())
      .run();

    await db.prepare("UPDATE handshakes SET status = 'completed' WHERE id = ?").bind(handshakeId).run();
    await db.prepare("UPDATE jobs SET status = 'completed' WHERE id = ?").bind(hs.job_id).run();

    // Kullanıcının ortalama puanını ve tamamlanan iş sayısını güncelle
    const stats = await db
      .prepare("SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE reviewee_id = ?")
      .bind(revieweeId)
      .first<{ avg_rating: number; cnt: number }>();

    await db
      .prepare("UPDATE users SET rating_avg = ?, total_jobs_completed = total_jobs_completed + 1 WHERE id = ?")
      .bind(stats?.avg_rating ?? numRating, revieweeId)
      .run();

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
