import { auth } from "@/auth";
import { getDB, type D1Database } from "@/lib/db";
import { sameOriginMutation } from "@/lib/request-security";

export function privateJson(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function textInput(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= max ? text : null;
}

export function idInput(value: unknown): string | null {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value) ? value : null;
}

export function cursorInput(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (!/^\d+$/.test(String(value))) return null;
  const cursor = Number(value);
  return Number.isSafeInteger(cursor) ? cursor : null;
}

export async function privateApi(
  request: Request,
  handler: (db: D1Database, userId: string) => Promise<Response>,
): Promise<Response> {
  if (request.method !== "GET" && !sameOriginMutation(request)) {
    return privateJson({ error: "Bu istek kabul edilemedi." }, 403);
  }
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return privateJson({ error: "Önce giriş yapın." }, 401);
    const db = await getDB();
    if (!db) return privateJson({ error: "Servis geçici olarak kullanılamıyor." }, 503);
    return await handler(db, userId);
  } catch {
    return privateJson({ error: "İşlem şu anda tamamlanamadı." }, 503);
  }
}
