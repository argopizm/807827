import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { emailVerificationConfig, hashEmailToken } from "@/lib/email-verification";
import { limitRequests, readJson, rateLimitResponse } from "@/lib/request-security";


export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Önce hesabınıza giriş yapın ve e-postadaki bağlantıyı tekrar açın." }, { status: 401 });

  if (!limitRequests("email-verification:" + session.user.id, 20, 300)) return rateLimitResponse(300);


  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "İşlem şu anda tamamlanamadı." }, { status: 503 });
    const userId = session.user.id;
    const user = await db.prepare("SELECT email, email_verified_at FROM users WHERE id = ?")
      .bind(userId).first<{ email: string; email_verified_at: string | null }>();
    if (!user) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    if (user.email_verified_at) return NextResponse.json({ verified: true });

    if (body.action === "confirm") {
      if (typeof body.token !== "string" || !/^[0-9a-f]{64}$/.test(body.token)) {
        return NextResponse.json({ error: "Doğrulama bağlantısı geçersiz." }, { status: 400 });
      }
      const hash = await hashEmailToken(body.token);
      const [update] = await db.batch([
        db.prepare("UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = ? AND email_verified_at IS NULL AND EXISTS (SELECT 1 FROM email_verification_tokens WHERE token_hash = ? AND user_id = ? AND expires_at > unixepoch())")
          .bind(userId, hash, userId),
        db.prepare("DELETE FROM email_verification_tokens WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND email_verified_at IS NOT NULL)")
          .bind(userId, userId),
      ]);
      if (!update.meta?.changes) return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş. Hesabım sayfasından yeni bağlantı isteyin." }, { status: 400 });
      return NextResponse.json({ verified: true });
    }

    if (body.action !== "send") return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    const config = emailVerificationConfig();
    if (!config) return NextResponse.json({ error: "E-posta gönderimi şu anda kullanılamıyor." }, { status: 503 });
    if (!limitRequests("email-send:" + userId, 3, 600)) return rateLimitResponse(600);

    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    const hash = await hashEmailToken(token);
    const [insert] = await db.batch([
      db.prepare("INSERT INTO email_verification_tokens (token_hash, user_id, expires_at) SELECT ?, ?, unixepoch() + 1800 WHERE NOT EXISTS (SELECT 1 FROM email_verification_tokens WHERE user_id = ? AND created_at > unixepoch() - 60)")
        .bind(hash, userId, userId),
      db.prepare("DELETE FROM email_verification_tokens WHERE user_id = ? AND expires_at <= unixepoch()").bind(userId),
    ]);
    if (!insert.meta?.changes) return rateLimitResponse(60);

    const url = new URL("/eposta-dogrula", config.origin);
    url.hash = token;
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + config.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [user.email],
        subject: "Frenaw e-posta doğrulaması",
        text: "E-posta adresinizi doğrulamak için Frenaw hesabınıza giriş yapın ve şu bağlantıyı açın:\n\n" + url.href +
          "\n\nBağlantı 30 dakika geçerlidir. Bu isteği siz yapmadıysanız iletiyi yok sayabilirsiniz.",
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!sent?.ok) {
      await db.prepare("DELETE FROM email_verification_tokens WHERE token_hash = ?").bind(hash).run();
      return NextResponse.json({ error: "Doğrulama e-postası gönderilemedi. Daha sonra tekrar deneyin." }, { status: 503 });
    }
    return NextResponse.json({ sent: true });
  } catch {
    console.error("E-posta doğrulama işlemi tamamlanamadı.");
    return NextResponse.json({ error: "Doğrulama işlemi tamamlanamadı." }, { status: 500 });
  }
}
