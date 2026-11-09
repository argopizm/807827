import { auth } from "@/auth";
import { getDB, type D1Database } from "@/lib/db";
import { emailVerificationConfig, hashEmailToken } from "@/lib/email-verification";
import { sendAccountEmail } from "@/lib/email-delivery";
import { hashPassword, verifyPassword } from "@/lib/password";
import { privateJson } from "@/lib/private-api";
import { cleanEmail, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";

type Account = { id: string; email: string; password_hash: string | null; password_salt: string | null; session_version: number };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return privateJson({ error: "Önce giriş yapın." }, 401);
  const db = await getDB();
  if (!db) return privateJson({ error: "Hesap ayarları yüklenemedi." }, 503);
  const account = await db.prepare("SELECT email, email_verified_at, password_hash IS NOT NULL AS has_password FROM users WHERE id = ? AND deleted_at IS NULL")
    .bind(session.user.id).first<{ email: string; email_verified_at: string | null; has_password: number }>();
  if (!account) return privateJson({ error: "Hesap bulunamadı." }, 404);
  const pending = await db.prepare("SELECT new_email FROM account_email_changes WHERE user_id = ? AND expires_at > unixepoch()")
    .bind(session.user.id).first<{ new_email: string }>();
  return privateJson({ email: account.email, emailVerified: Boolean(account.email_verified_at), hasPassword: Boolean(account.has_password), emailChangeEnabled: Boolean(emailVerificationConfig()), pendingEmail: pending?.new_email ?? null });
}

async function legacyStatements(db: D1Database, userId: string, guard: string, values: unknown[]) {
  const statements = [];
  for (const table of ["accounts", "sessions"]) {
    const { results } = await db.prepare("PRAGMA table_info(" + table + ")").all<{ name: string }>();
    const column = results.some((row) => row.name === "userId") ? "userId" : results.some((row) => row.name === "user_id") ? "user_id" : null;
    if (column) statements.push(db.prepare("DELETE FROM " + table + " WHERE " + column + " = ? AND " + guard).bind(userId, ...values));
  }
  return statements;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return privateJson({ error: "Geçersiz istek." }, 400);
  const session = await auth();
  if (!session?.user?.id) return privateJson({ error: "Önce giriş yapın." }, 401);
  const id = session.user.id;
  if (!limitRequests("account-security:" + id, 12, 600)) return rateLimitResponse(600);
  try {
    const db = await getDB();
    if (!db) return privateJson({ error: "İşlem şu anda kullanılamıyor." }, 503);
    const account = await db.prepare("SELECT id, email, password_hash, password_salt, session_version FROM users WHERE id = ? AND deleted_at IS NULL")
      .bind(id).first<Account>();
    if (!account) return privateJson({ error: "Hesap bulunamadı." }, 404);

    if (body.action === "confirm_email") {
      if (typeof body.token !== "string" || !/^[0-9a-f]{64}$/.test(body.token)) return privateJson({ error: "Bağlantı geçersiz." }, 400);
      const hash = await hashEmailToken(body.token);
      const change = await db.prepare("SELECT new_email FROM account_email_changes WHERE token_hash = ? AND user_id = ? AND session_version = ? AND expires_at > unixepoch()")
        .bind(hash, id, account.session_version).first<{ new_email: string }>();
      if (!change) return privateJson({ error: "Bağlantı geçersiz veya süresi dolmuş. Yeni bağlantı isteyin." }, 400);
      const [result] = await db.batch([
        db.prepare("UPDATE users SET email = ?, email_verified_at = CURRENT_TIMESTAMP, session_version = session_version + 1 WHERE id = ? AND deleted_at IS NULL AND session_version = ? AND NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = ?) AND EXISTS (SELECT 1 FROM account_email_changes WHERE token_hash = ? AND user_id = ? AND session_version = users.session_version AND expires_at > unixepoch())")
          .bind(change.new_email, id, account.session_version, change.new_email, hash, id),
        db.prepare("DELETE FROM account_email_changes WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND session_version = ?)").bind(id, id, account.session_version + 1),
        db.prepare("DELETE FROM email_verification_tokens WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND session_version = ?)").bind(id, id, account.session_version + 1),
      ]);
      if (!result.meta?.changes) return privateJson({ error: "Bu adres kullanılıyor veya hesap bilgileri değişti. Yeni bağlantı isteyin." }, 409);
      return privateJson({ success: true, signOut: true });
    }

    const password = typeof body.currentPassword === "string" ? body.currentPassword : "";
    if (account.password_hash && account.password_salt) {
      if (!password || password.length > 256 || !await verifyPassword(password, account.password_hash, account.password_salt)) return privateJson({ error: "Mevcut şifrenizi kontrol edin." }, 403);
    } else if (!session.user.authenticatedAt || Date.now() - session.user.authenticatedAt > 5 * 60 * 1000) {
      return privateJson({ error: "Bu işlem için sosyal hesabınızla yeniden giriş yapın ve beş dakika içinde tekrar deneyin.", reauthenticate: true }, 403);
    }

    if (body.action === "password") {
      if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 256 || body.password !== body.confirmPassword) return privateJson({ error: "Şifreler eşleşmeli ve 8–256 karakter olmalı." }, 400);
      if (password && body.password === password) return privateJson({ error: "Yeni şifre mevcut şifrenizden farklı olmalı." }, 400);
      const next = await hashPassword(body.password);
      const result = await db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, session_version = session_version + 1 WHERE id = ? AND session_version = ? AND deleted_at IS NULL AND password_hash IS ?")
        .bind(next.hash, next.salt, id, account.session_version, account.password_hash).run();
      if (!result.meta?.changes) return privateJson({ error: "Hesap bilgileri değişti. Yeniden giriş yapın." }, 409);
      return privateJson({ success: true, signOut: true });
    }

    if (body.action === "email") {
      const config = emailVerificationConfig();
      if (!config) return privateJson({ error: "E-posta değişikliği için doğrulama gönderimi henüz etkin değil." }, 503);
      const email = cleanEmail(body.email);
      if (!email || email === account.email.toLowerCase()) return privateJson({ error: "Farklı ve geçerli bir e-posta adresi girin." }, 400);
      const existing = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (existing) return privateJson({ error: "Bu e-posta adresi kullanılamıyor." }, 409);
      if (!limitRequests("email-change-send:" + id, 3, 600)) return rateLimitResponse(600);
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const tokenHash = await hashEmailToken(token);
      const result = await db.prepare("INSERT INTO account_email_changes (token_hash, user_id, new_email, session_version, expires_at) SELECT ?, id, ?, session_version, unixepoch() + 1800 FROM users WHERE id = ? AND session_version = ? AND deleted_at IS NULL ON CONFLICT(user_id) DO UPDATE SET token_hash=excluded.token_hash,new_email=excluded.new_email,session_version=excluded.session_version,expires_at=excluded.expires_at,created_at=unixepoch()")
        .bind(tokenHash, email, id, account.session_version).run();
      if (!result.meta?.changes) return privateJson({ error: "Hesap bilgileri değişti. Yeniden deneyin." }, 409);
      const url = new URL("/hesabim/eposta-degistir", config.origin);
      url.hash = token;
      const sent = await sendAccountEmail(email, "Frenaw e-posta değişikliğini doğrulayın", "Bu adresi Frenaw hesabınıza bağlamak için aynı hesabınızda oturum açın ve bağlantıyı açın:\n\n" + url.href + "\n\nBağlantı 30 dakika geçerlidir. İsteği siz yapmadıysanız yok sayın. Doğrulama tamamlanana kadar mevcut adresiniz korunur.");
      if (!sent) {
        await db.prepare("DELETE FROM account_email_changes WHERE token_hash = ?").bind(tokenHash).run();
        return privateJson({ error: "Doğrulama iletisi gönderilemedi. Adresiniz değiştirilmedi." }, 503);
      }
      return privateJson({ success: true, sent: true });
    }

    if (body.action === "delete") {
      if (body.confirmation !== "HESABIMI SİL" || body.accepted !== true) return privateJson({ error: "Silme koşullarını onaylayın ve HESABIMI SİL yazın." }, 400);
      const deletedEmail = "deleted-" + crypto.randomUUID() + "@deleted.invalid";
      const guard = "EXISTS (SELECT 1 FROM users erased WHERE erased.id = ? AND erased.email = ? AND erased.deleted_at IS NOT NULL)";
      const values = [id, deletedEmail];
      const sql = (query: string, ...bindings: unknown[]) => db.prepare(query + " AND " + guard).bind(...bindings, ...values);
      const legacy = await legacyStatements(db, id, guard, values);
      const [result] = await db.batch([
        db.prepare("UPDATE users SET deleted_at = CURRENT_TIMESTAMP, email = ?, username = NULL, display_name = NULL, full_name = 'Silinen kullanıcı', name = 'Silinen kullanıcı', title = NULL, category = NULL, skills = '[]', bio = NULL, avatar_url = NULL, image = NULL, portfolio_url = NULL, contact_links = '{}', password_hash = NULL, password_salt = NULL, google_subject = NULL, email_verified_at = NULL, user_type = NULL, onboarding_done = 0, tc_verified = 0, trust_badge = 0, rating_avg = 0, total_jobs_completed = 0, session_version = session_version + 1 WHERE id = ? AND session_version = ? AND deleted_at IS NULL AND password_hash IS ?")
          .bind(deletedEmail, id, account.session_version, account.password_hash),
        sql("DELETE FROM account_email_changes WHERE user_id = ?", id),
        sql("DELETE FROM email_verification_tokens WHERE user_id = ?", id),
        sql("DELETE FROM chat_reports WHERE (reporter_id = ? OR message_id IN (SELECT id FROM chat_messages WHERE sender_id = ?))", id, id),
        sql("UPDATE chat_reports SET resolved_by = NULL WHERE resolved_by = ?", id),
        sql("UPDATE chat_messages SET content = '[Hesap sahibi bu mesajı sildi.]' WHERE sender_id = ?", id),
        sql("DELETE FROM messages WHERE (sender_id = ? OR receiver_id = ?)", id, id),
        sql("DELETE FROM chat_reads WHERE user_id = ?", id),
        sql("DELETE FROM chat_blocks WHERE (blocker_id = ? OR blocked_id = ?)", id, id),
        sql("DELETE FROM support_events WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id = ?)", id),
        sql("DELETE FROM support_replies WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id = ?)", id),
        sql("DELETE FROM support_tickets WHERE user_id = ?", id),
        sql("UPDATE support_tickets SET assigned_to = NULL WHERE assigned_to = ?", id),
        sql("UPDATE support_replies SET body = '[Hesap sahibi bu içeriği sildi.]' WHERE author_id = ?", id),
        sql("DELETE FROM support_staff WHERE user_id = ?", id),
        sql("DELETE FROM services WHERE freelancer_id = ?", id),
        sql("UPDATE jobs SET title = 'Kaldırılan ilan', description = NULL, skills = '[]', budget_range = NULL, category = NULL, status = 'cancelled' WHERE client_id = ?", id),
        sql("UPDATE handshakes SET status = 'cancelled', proposal_message = NULL, amount_kurus = NULL, delivery_days = NULL WHERE (freelancer_id = ? OR client_id = ?)", id, id),
        sql("UPDATE users SET rating_avg = COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewee_id = users.id AND reviewer_id != ? AND reviewee_id != ?), 0) WHERE id IN (SELECT reviewee_id FROM reviews WHERE reviewer_id = ?)", id, id, id),
        sql("DELETE FROM reviews WHERE (reviewer_id = ? OR reviewee_id = ?)", id, id),
        ...legacy,
      ]);
      if (!result.meta?.changes) return privateJson({ error: "Hesap bilgileri değişti. Yeniden giriş yapın." }, 409);
      return privateJson({ success: true, signOut: true });
    }
    return privateJson({ error: "Geçersiz işlem." }, 400);
  } catch {
    console.error("Hesap güvenliği işlemi tamamlanamadı.");
    return privateJson({ error: "İşlem tamamlanamadı. Daha sonra tekrar deneyin." }, 503);
  }
}
