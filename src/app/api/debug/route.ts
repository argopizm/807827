export const runtime = "edge";

import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, unknown> = {
    d1_connected: false,
    user_count: 0,
    job_count: 0,
    error: null,
  };

  try {
    const db = await getDB();
    if (!db) throw new Error("D1 binding (DB) bulunamadı");
    const u = await db.prepare("SELECT COUNT(*) as cnt FROM users").first<{ cnt: number }>();
    const j = await db.prepare("SELECT COUNT(*) as cnt FROM jobs").first<{ cnt: number }>();
    result.d1_connected = true;
    result.user_count = u?.cnt ?? 0;
    result.job_count = j?.cnt ?? 0;
  } catch (e) {
    result.error = String(e);
  }

  return NextResponse.json(result);
}
