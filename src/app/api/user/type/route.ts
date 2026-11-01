export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  const { userType } = await request.json().catch(() => ({}));
  if (!["freelancer", "employer"].includes(userType)) {
    return NextResponse.json({ error: "Geçersiz hesap türü." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı yok." }, { status: 500 });

    await db
      .prepare("UPDATE users SET user_type = ?, onboarding_done = 1 WHERE id = ?")
      .bind(userType, session.user.id)
      .run();

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user_type: null, onboarding_done: false });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ user_type: null, onboarding_done: false });

    const data = await db
      .prepare("SELECT user_type, onboarding_done FROM users WHERE id = ?")
      .bind(session.user.id)
      .first<{ user_type: string | null; onboarding_done: number | null }>();

    return NextResponse.json({
      user_type: data?.user_type ?? null,
      onboarding_done: !!data?.onboarding_done,
    });
  } catch {
    return NextResponse.json({ user_type: null, onboarding_done: false });
  }
}
