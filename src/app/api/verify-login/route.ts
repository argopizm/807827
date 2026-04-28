export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { verifyPassword } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) return NextResponse.json({ error: "No DB" }, { status: 500 });

    const user = await db
      .prepare("SELECT id, email, full_name, avatar_url, password_hash, password_salt FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; email: string; full_name: string | null; avatar_url: string | null; password_hash: string | null; password_salt: string | null }>();

    if (!user?.password_hash || !user?.password_salt) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    return NextResponse.json({ id: user.id, email: user.email, name: user.full_name, image: user.avatar_url });
  } catch (e) {
    console.error("[verify-login]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
