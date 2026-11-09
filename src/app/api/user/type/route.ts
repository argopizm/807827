import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { readJson } from "@/lib/request-security";


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = await readJson(request);
  const userType = body?.userType;
  if (userType !== "freelancer" && userType !== "employer") {
    return NextResponse.json({ error: "Geçersiz hesap türü." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Hesap şu anda güncellenemedi." }, { status: 503 });

    const result = await db.prepare(
      "UPDATE users SET user_type = ?, onboarding_done = 1 WHERE id = ? AND (user_type IS NULL OR user_type = ?)",
    ).bind(userType, session.user.id, userType).run();

    if (!result.meta?.changes) return NextResponse.json({ error: "Hesap türü daha önce seçilmiş veya hesap bulunamadı." }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Hesap türü güncellenemedi." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ user_type: null, onboarding_done: false });

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ user_type: null, onboarding_done: false });
    const data = await db.prepare("SELECT user_type, onboarding_done FROM users WHERE id = ?")
      .bind(session.user.id).first<{ user_type: string | null; onboarding_done: number | null }>();
    return NextResponse.json({ user_type: data?.user_type ?? null, onboarding_done: Boolean(data?.onboarding_done) });
  } catch {
    return NextResponse.json({ user_type: null, onboarding_done: false });
  }
}
