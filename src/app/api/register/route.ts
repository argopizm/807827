export const runtime = "edge";

import { hashPassword } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, email, password } = body ?? {};
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) {
      return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();

    const existing = await db
      .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
      .bind(cleanEmail)
      .first<{ id: string }>();

    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }

    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    const baseUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const username = `${baseUsername}_${Math.floor(Math.random() * 9000 + 1000)}`;

    await db
      .prepare(
        `INSERT INTO users (id, email, username, full_name, name, password_hash, password_salt, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .bind(id, cleanEmail, username, cleanName, cleanName, hash, salt)
      .run();

    return NextResponse.json({ success: true, id, username });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Kayıt sırasında hata oluştu: " + String(e) }, { status: 500 });
  }
}
