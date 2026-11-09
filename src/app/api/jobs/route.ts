import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeCategory } from "@/lib/categories";
import { getDB } from "@/lib/db";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { cleanSkills, cleanText, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "İlan vermek için giriş yapın." }, { status: 401 });

  const body = await readJson(request);
  const title = cleanText(body?.title);
  const category = normalizeCategory(cleanText(body?.category) || "Genel");
  const description = cleanText(body?.description);
  const budget = cleanText(body?.budget);
  const skills = cleanSkills(body?.skills);
  if (!title || title.length > 140 || !description || description.length > 8000 || !budget || budget.length > 100 || !category) {
    return NextResponse.json({ error: "Geçerli bir kategori, başlık, bütçe ve açıklama girin." }, { status: 400 });
  }
  if (!limitRequests("job:" + session.user.id, 8, 300)) return rateLimitResponse(300);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "İlan verme şu anda kullanılamıyor." }, { status: 503 });
    if (!await canPublish(db, session.user.id)) return NextResponse.json({ error: emailVerificationError }, { status: 403 });

    const id = crypto.randomUUID();
    const result = await db.prepare(
      "INSERT INTO jobs (id, client_id, title, description, category, budget_range, skills, status) " +
      "SELECT ?, id, ?, ?, ?, ?, ?, 'open' FROM users WHERE id = ? AND user_type = 'employer'",
    ).bind(id, title, description, category, budget, JSON.stringify(skills), session.user.id).run();
    if (!result.meta?.changes) return NextResponse.json({ error: "İlan vermek için işveren hesabı kullanın." }, { status: 403 });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    console.error("İlan kaydedilemedi.");
    return NextResponse.json({ error: "İlan kaydedilemedi. Daha sonra tekrar deneyin." }, { status: 500 });
  }
}
