export const runtime = "edge";

import { auth } from "@/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userType } = await request.json() as { userType: string };
  if (!["freelancer", "employer"].includes(userType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) {
      // Demo: kaydet ama DB yoksa simüle et
      return NextResponse.json({ success: true });
    }

    // Kullanıcı yoksa önce oluştur (Google ile ilk giriş)
    await db.prepare(
      "INSERT OR IGNORE INTO users (id, email, full_name, avatar_url) VALUES (?, ?, ?, ?)"
    ).bind(
      session.user.id,
      session.user.email ?? "",
      session.user.name ?? "",
      session.user.image ?? ""
    ).run();

    // Kullanıcı tipini güncelle
    await db.prepare(
      "UPDATE users SET user_type = ?, onboarding_done = 1 WHERE id = ?"
    ).bind(userType, session.user.id).run();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[user/type]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) return NextResponse.json({ user_type: null, onboarding_done: false });

    const user = await db
      .prepare("SELECT user_type, onboarding_done FROM users WHERE id = ?")
      .bind(session.user.id)
      .first<{ user_type: string | null; onboarding_done: number }>();

    return NextResponse.json({ user_type: user?.user_type ?? null, onboarding_done: !!user?.onboarding_done });
  } catch {
    return NextResponse.json({ user_type: null, onboarding_done: false });
  }
}
