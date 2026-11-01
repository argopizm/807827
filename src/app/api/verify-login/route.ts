export const runtime = "edge";

import { verifyPassword } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı yok." }, { status: 500 });

    const user = await db
      .prepare("SELECT id, email, COALESCE(full_name, name) AS name, COALESCE(avatar_url, image) AS image, password_hash, password_salt FROM users WHERE LOWER(email) = ?")
      .bind(String(email).toLowerCase().trim())
      .first<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        password_hash: string | null;
        password_salt: string | null;
      }>();

    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 401 });
    if (!user.password_hash || !user.password_salt) {
      return NextResponse.json({ error: "Bu hesap Google ile oluşturulmuş." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) return NextResponse.json({ error: "Hatalı şifre." }, { status: 401 });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, image: user.image });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
