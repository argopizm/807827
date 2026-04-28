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
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // DB kolon adları NextAuth default schema'ya uygun: name, image
    const user = await db
      .prepare(`
        SELECT id, email, name, image, password_hash, password_salt
        FROM users
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
      `)
      .bind(email.trim())
      .first<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        password_hash: string | null;
        password_salt: string | null;
      }>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (!user.password_hash || !user.password_salt) {
      return NextResponse.json({
        error: "Bu hesap Google ile oluşturuldu. Google ile giriş yapın.",
      }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });
  } catch (e) {
    console.error("[verify-login]", e);
    return NextResponse.json({ error: "Server error: " + String(e) }, { status: 500 });
  }
}
