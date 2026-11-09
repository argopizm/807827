import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { cleanText, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  const reviewer = session.user.id;
  const body = await readJson(request);
  const id = cleanText(body?.handshakeId);
  const comment = cleanText(body?.comment);
  const rating = body?.rating;
  if (!id || id.length > 100 || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 1500) {
    return NextResponse.json({ error: "1–5 arasında bir puan ve en fazla 1500 karakterlik bir yorum girin." }, { status: 400 });
  }
  if (!limitRequests("review:" + reviewer, 20, 300)) return rateLimitResponse(300);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Değerlendirme şu anda kullanılamıyor." }, { status: 503 });
    if (!await canPublish(db, reviewer)) return NextResponse.json({ error: emailVerificationError }, { status: 403 });

    const h = await db.prepare(
      "SELECT h.client_id, h.freelancer_id, h.status, j.status AS job_status FROM handshakes h " +
      "JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
      "WHERE h.id = ? AND (h.client_id = ? OR h.freelancer_id = ?)",
    ).bind(id, reviewer, reviewer).first<{ client_id: string; freelancer_id: string; status: string; job_status: string }>();
    if (!h) return NextResponse.json({ error: "İş kaydı bulunamadı." }, { status: 404 });
    if (h.status !== "completed" || h.job_status !== "completed") {
      return NextResponse.json({ error: "Yalnızca tamamlanan işleri değerlendirebilirsiniz." }, { status: 409 });
    }

    const reviewee = reviewer === h.client_id ? h.freelancer_id : h.client_id;
    await db.batch([
      db.prepare(
        "INSERT INTO reviews (id, handshake_id, reviewer_id, reviewee_id, rating, comment) " +
        "SELECT ?, h.id, ?, ?, ?, ? FROM handshakes h JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
        "WHERE h.id = ? AND h.status = 'completed' AND j.status = 'completed' AND " +
        "((h.client_id = ? AND h.freelancer_id = ?) OR (h.freelancer_id = ? AND h.client_id = ?)) AND " +
        "NOT EXISTS (SELECT 1 FROM reviews WHERE handshake_id = h.id AND reviewer_id = ?)",
      ).bind(crypto.randomUUID(), reviewer, reviewee, rating, comment, id, reviewer, reviewee, reviewer, reviewee, reviewer),
      db.prepare(
        "UPDATE users SET rating_avg = COALESCE((SELECT AVG(r.rating) FROM reviews r " +
        "JOIN handshakes h ON h.id = r.handshake_id JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
        "WHERE r.reviewee_id = users.id AND h.status = 'completed' AND j.status = 'completed' AND " +
        "((h.client_id = r.reviewer_id AND h.freelancer_id = r.reviewee_id) OR (h.freelancer_id = r.reviewer_id AND h.client_id = r.reviewee_id)) AND " +
        "r.id = (SELECT first_review.id FROM reviews first_review WHERE first_review.handshake_id = r.handshake_id AND first_review.reviewer_id = r.reviewer_id " +
        "ORDER BY first_review.created_at, first_review.id LIMIT 1)), 0) WHERE id = ?",
      ).bind(reviewee),
    ]);

    const saved = await db.prepare("SELECT rating, comment FROM reviews WHERE handshake_id = ? AND reviewer_id = ? ORDER BY created_at, id LIMIT 1")
      .bind(id, reviewer).first<{ rating: number; comment: string | null }>();
    if (!saved || saved.rating !== rating || (saved.comment ?? "") !== comment) {
      return NextResponse.json({ error: "Bu iş için daha önce bir değerlendirme kaydedildi." }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch {
    console.error("Değerlendirme kaydedilemedi.");
    return NextResponse.json({ error: "Değerlendirme kaydedilemedi." }, { status: 500 });
  }
}
