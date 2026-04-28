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
    console.error("[register] getRequestContext failed:", e);
    return NextResponse.json({
      error: "Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.",
    }, { status: 503 });
  }

  try {
    // E-posta var mı?
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

    await db
      .prepare(
        "INSERT INTO users (id, email, full_name, username, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, email.toLowerCase().trim(), name.trim(), username, hash, salt)
      .run();

    return NextResponse.json({ success: true, message: "Kayıt başarılı! Giriş yapabilirsiniz." });
  } catch (e) {
    console.error("[register] DB error:", e);
    const msg = String(e);
    // Kolon yoksa açıklayıcı hata ver
    if (msg.includes("no such column") || msg.includes("table users has no column")) {
      return NextResponse.json({
        error: "Veritabanı şeması güncel değil. Lütfen yöneticiye bildirin.",
        detail: msg,
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "Kayıt sırasında hata oluştu: " + msg,
    }, { status: 500 });
  }
}
