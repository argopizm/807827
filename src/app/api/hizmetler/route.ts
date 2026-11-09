import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { normalizeCategory } from "@/lib/categories";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { cleanText, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Önce giriş yapın." }, { status: 401, headers });
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Hizmetleriniz yüklenemedi." }, { status: 503, headers });
    const result = await db.prepare("SELECT id, title, category, status, budget_range FROM services WHERE freelancer_id = ? ORDER BY created_at DESC, id DESC LIMIT 100").bind(session.user.id).all();
    return NextResponse.json({ services: result.results }, { headers });
  } catch {
    return NextResponse.json({ error: "Hizmetleriniz şu anda yüklenemedi." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Hizmet yayınlamak için giriş yapın." }, { status: 401, headers });
  const body = await readJson(request);
  const id = cleanText(body?.id);
  const title = cleanText(body?.title);
  const description = cleanText(body?.description);
  const category = normalizeCategory(cleanText(body?.category));
  const budget = cleanText(body?.budget);
  if (!/^[a-f0-9-]{36}$/.test(id) || title.length < 8 || title.length > 140 || description.length < 60 || description.length > 8000 || !category || !budget || budget.length > 100) {
    return NextResponse.json({ error: "Başlık, kategori, ücret ve en az 60 karakterlik teslim kapsamını doldurun." }, { status: 400, headers });
  }
  if (!limitRequests("service:" + session.user.id, 12, 300)) return rateLimitResponse(300);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Hizmet yayınlama şu anda kullanılamıyor." }, { status: 503, headers });
    if (!await canPublish(db, session.user.id)) return NextResponse.json({ error: emailVerificationError }, { status: 403, headers });
    await db.prepare(
      "INSERT INTO services (id, freelancer_id, title, description, category, budget_range) " +
      "SELECT ?, id, ?, ?, ?, ? FROM users WHERE id = ? AND user_type = 'freelancer' AND onboarding_done = 1 " +
      "AND (SELECT count(*) FROM services WHERE freelancer_id = users.id AND status = 'published') < 20 " +
      "ON CONFLICT (id) DO NOTHING",
    ).bind(id, title, description, category, budget, session.user.id).run();
    const saved = await db.prepare("SELECT id FROM services WHERE id = ? AND freelancer_id = ? AND title = ? AND description = ? AND category = ? AND budget_range = ?")
      .bind(id, session.user.id, title, description, category, budget).first();
    if (!saved) return NextResponse.json({ error: "Hizmet yayınlanamadı. Freelancer hesabınızı ve yayındaki hizmet sınırını kontrol edin." }, { status: 409, headers });
    return NextResponse.json({ success: true, id }, { status: 201, headers });
  } catch {
    return NextResponse.json({ error: "Hizmet yayınlanamadı. Biraz sonra tekrar deneyin." }, { status: 503, headers });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Önce giriş yapın." }, { status: 401, headers });
  const body = await readJson(request);
  const id = cleanText(body?.id);
  const status = body?.status;
  if (!/^[a-f0-9-]{36}$/.test(id) || (status !== "published" && status !== "hidden")) {
    return NextResponse.json({ error: "Geçersiz hizmet işlemi." }, { status: 400, headers });
  }
  if (!limitRequests("service-status:" + session.user.id, 30, 300)) return rateLimitResponse(300);
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Hizmet güncellenemedi." }, { status: 503, headers });
    if (status === "published" && !await canPublish(db, session.user.id)) return NextResponse.json({ error: emailVerificationError }, { status: 403, headers });
    const result = await db.prepare(
      "UPDATE services SET status = ? WHERE id = ? AND freelancer_id = ? " +
      "AND EXISTS (SELECT 1 FROM users WHERE users.id = services.freelancer_id AND user_type = 'freelancer') " +
      "AND (? = 'hidden' OR status = 'published' OR (SELECT count(*) FROM services other WHERE other.freelancer_id = services.freelancer_id AND other.status = 'published') < 20)",
    ).bind(status, id, session.user.id, status).run();
    if (!result.meta?.changes) return NextResponse.json({ error: "Hizmet bulunamadı veya yayın sınırına ulaşıldı." }, { status: 404, headers });
    return NextResponse.json({ success: true }, { headers });
  } catch {
    return NextResponse.json({ error: "Hizmet şu anda güncellenemedi." }, { status: 503, headers });
  }
}
