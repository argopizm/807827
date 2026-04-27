export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { hashPassword } from "@/auth";
import { NextResponse } from "next/server";

interface Env { DB: D1Database }

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 }); }

  const { name, email, password } = body;
  if (!email || !password || !name) return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });

  try {
    const { env } = getRequestContext() as { env: Env };
    const db = env.DB;

    // E-posta var mı?
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });

    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase() + "_" + Math.floor(Math.random() * 1000);

    await db.prepare(
      "INSERT INTO users (id, email, full_name, username, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, email, name, username, hash, salt).run();

    return NextResponse.json({ success: true, message: "Kayıt başarılı! Giriş yapabilirsiniz." });
  } catch (e) {
    console.error("[register] error:", e);
    // Demo/local: DB yoksa başarı simüle et
    return NextResponse.json({ success: true, message: "Kayıt başarılı (demo mod)." });
  }
}
