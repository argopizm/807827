export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "İlan vermek için giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { title, category, budget, description, skills } = body ?? {};

  if (!title?.trim() || !description?.trim() || !budget?.trim()) {
    return NextResponse.json({ error: "Başlık, bütçe ve açıklama alanları zorunludur." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });

    const id = crypto.randomUUID();
    const skillArr = Array.isArray(skills)
      ? skills
      : typeof skills === "string" && skills.trim()
        ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    await db
      .prepare(
        `INSERT INTO jobs (id, client_id, title, description, category, budget_range, skills, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`
      )
      .bind(
        id,
        session.user.id,
        String(title).trim(),
        String(description).trim(),
        String(category || "Genel").trim(),
        String(budget).trim(),
        JSON.stringify(skillArr)
      )
      .run();

    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("[POST /api/jobs]", e);
    return NextResponse.json({ error: "İlan kaydedilirken hata oluştu: " + String(e) }, { status: 500 });
  }
}
