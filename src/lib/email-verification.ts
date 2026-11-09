import type { D1Database } from "@/lib/db";
import { runtimeEnv } from "@/lib/runtime-env";

export function emailVerificationConfig() {
  const apiKey = runtimeEnv("RESEND_API_KEY");
  const from = runtimeEnv("EMAIL_FROM");
  const site = runtimeEnv("SITE_URL") || runtimeEnv("AUTH_URL") || runtimeEnv("NEXT_PUBLIC_SITE_URL");
  if (!apiKey || !from || !site) return null;
  try {
    const url = new URL(site);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || (url.protocol !== "https:" && !(url.protocol === "http:" && local))) return null;
    return { apiKey, from, origin: url.origin };
  } catch {
    return null;
  }
}

export async function canPublish(db: D1Database, userId: string): Promise<boolean> {
  if (!emailVerificationConfig()) return true;
  const user = await db.prepare("SELECT email_verified_at FROM users WHERE id = ?").bind(userId).first<{ email_verified_at: string | null }>();
  return Boolean(user?.email_verified_at);
}

export const emailVerificationError = "Devam etmeden önce Hesabım sayfasından e-posta adresinizi doğrulayın.";

export async function hashEmailToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
