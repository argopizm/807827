export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

// Geçici debug endpoint — env var ve DB durumunu kontrol etmek için
export async function GET() {
  const result: Record<string, unknown> = {
    auth_secret: !!process.env.AUTH_SECRET,
    nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    google_client_id: !!process.env.GOOGLE_CLIENT_ID,
    google_client_secret: !!process.env.GOOGLE_CLIENT_SECRET,
    auth_url: process.env.AUTH_URL ?? null,
    nextauth_url: process.env.NEXTAUTH_URL ?? null,
    auth_trust_host: process.env.AUTH_TRUST_HOST ?? null,
    db_connected: false,
    db_user_count: null,
    db_columns: null,
    error: null,
  };

  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    result.db_connected = !!db;

    if (db) {
      const countResult = await db.prepare("SELECT COUNT(*) as c FROM users").first<{ c: number }>();
      result.db_user_count = countResult?.c ?? 0;

      // Kolonları kontrol et
      const cols = await db.prepare("PRAGMA table_info(users)").all<{ name: string }>();
      result.db_columns = cols.results?.map(c => c.name) ?? [];
    }
  } catch (e) {
    result.error = String(e);
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
