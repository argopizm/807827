export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { hashPassword } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { name, email, password } = body;
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  let db: D1Database;
  try {
    const { env } = getRequestContext();
    db = (env as Record<string, unknown>).DB as D1Database;
    if (!db) throw new Error("DB binding not found");
  } catch (e) {
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 503 });
  }

  try {
    // Kolon adları D1'daki gerçek adlara uygun: name, image (NextAuth default)
    const existing = await db
      .prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)")
      .bind(email.trim())
      .first();
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    const usernameBase = email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const username = `${usernameBase}_${Math.floor(Math.random() * 9000 + 1000)}`;

    // DB kolonları: id, name, email, image, username, password_hash, password_salt
    await db
      .prepare(
        "INSERT INTO users (id, name, email, username, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, name.trim(), email.toLowerCase().trim(), username, hash, salt)
      .run();

    return NextResponse.json({ success: true, message: "Kayıt başarılı! Giriş yapabilirsiniz." });
  } catch (e) {
    console.error("[register] error:", e);
    return NextResponse.json({
      error: "Kayıt hatası: " + String(e),
    }, { status: 500 });
  }
}
