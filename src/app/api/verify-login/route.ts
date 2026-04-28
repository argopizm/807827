export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { verifyPassword } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;

    if (!db) {
      console.error("[verify-login] DB binding not found");
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const user = await db
      .prepare(`
        SELECT id, email, full_name, avatar_url, password_hash, password_salt
        FROM users
        WHERE email = ?
        LIMIT 1
      `)
      .bind(email.toLowerCase().trim())
      .first<{
        id: string;
        email: string;
        full_name: string | null;
        avatar_url: string | null;
        password_hash: string | null;
        password_salt: string | null;
      }>();

    if (!user) {
      console.log("[verify-login] User not found:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.password_hash || !user.password_salt) {
      console.log("[verify-login] User has no password (Google-only account):", email);
      return NextResponse.json({ error: "No password set. Please use Google login." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) {
      console.log("[verify-login] Invalid password for:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.full_name,
      image: user.avatar_url,
    });
  } catch (e) {
    console.error("[verify-login] DB error:", e);
    return NextResponse.json({ error: "Server error", detail: String(e) }, { status: 500 });
  }
}
