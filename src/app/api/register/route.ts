import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { getDB } from "@/lib/db";
import { cleanDisplayName, cleanUsername, validDisplayName, validUsername } from "@/lib/public-identity";
import { cleanEmail, cleanText, clientAddress, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";


export async function POST(request: Request) {
  const body = await readJson(request);
  const name = cleanText(body?.name);
  const displayName = cleanDisplayName(body?.display_name);
  const requestedUsername = cleanUsername(body?.username);
  const baseUsername = displayName.replace(/ı/g, "i").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "uye";
  const email = cleanEmail(body?.email);
  const password = body?.password;

  if (body?.adult !== true) return NextResponse.json({ error: "Üyelik 18 yaş ve üzeri içindir. Yaş ve kullanım koşulları onayını işaretleyin." }, { status: 400 });
  if (!validDisplayName(displayName) || (requestedUsername && !validUsername(requestedUsername))) {
    return NextResponse.json({ error: "2–80 karakterlik bir görünen ad ve yalnızca harf, sayı, alt çizgi içeren 2–64 karakterlik kullanıcı adı girin." }, { status: 400 });
  }
  if (name.length < 2 || name.length > 100 || !email || typeof password !== "string" || password.length < 8 || password.length > 256) {
    return NextResponse.json({ error: "Geçerli bir ad, e-posta ve 8–256 karakterlik şifre girin." }, { status: 400 });
  }
  if (!limitRequests("register:" + clientAddress(request.headers), 8, 600)) return rateLimitResponse(600);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Kayıt şu anda kullanılamıyor." }, { status: 503 });

    const existing = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first();
    if (existing) return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    for (let attempt = 0; attempt < 3; attempt++) {
      const username = requestedUsername || (attempt === 0 && baseUsername.length >= 2 ? baseUsername : baseUsername + "_" + crypto.randomUUID().slice(0, 8));
      const result = await db.prepare(
        "INSERT INTO users (id, email, username, full_name, name, display_name, password_hash, password_salt, created_at) " +
        "SELECT ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?)",
      ).bind(id, email, username, name, name, displayName, hash, salt, email, username).run();
      if (result.meta?.changes) return NextResponse.json({ success: true, id, username }, { status: 201 });
      const emailTaken = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (emailTaken || requestedUsername) return NextResponse.json({ error: "E-posta adresi veya kullanıcı adı zaten kullanılıyor." }, { status: 409 });
    }
    return NextResponse.json({ error: "Kullanıcı adı oluşturulamadı. Tekrar deneyin." }, { status: 409 });
  } catch {
    console.error("Yeni hesap kaydedilemedi.");
    return NextResponse.json({ error: "Kayıt tamamlanamadı. Daha sonra tekrar deneyin." }, { status: 500 });
  }
}
