import { NextResponse } from "next/server";

export function sameOriginMutation(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const target = new URL(request.url);
  if (origin === target.origin) return true;

  // Next dev normalizes its Request URL to localhost while preserving the browser Host.
  if (process.env.NODE_ENV !== "development") return false;
  const host = request.headers.get("host");
  return Boolean(host && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)
    && origin === target.protocol + "//" + host);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!sameOriginMutation(request)) return null;
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return null;

  const maxBytes = 64 * 1024;
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanEmail(value: unknown): string {
  const email = cleanText(value).toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function cleanSkills(value: unknown): string[] {
  const fields = Array.isArray(value) ? value : cleanText(value).split(",");
  return [...new Set(fields.map(cleanText).filter((skill) => skill && skill.length <= 50))].slice(0, 20);
}

const counters = new Map<string, { count: number; expires: number }>();

// A bounded per-runtime guard. Shared limits at the Cloudflare edge are configured separately.
export function limitRequests(key: string, limit: number, seconds: number): boolean {
  const now = Date.now();
  const counter = counters.get(key);
  if (counter && counter.expires > now) {
    if (counter.count >= limit) return false;
    counter.count++;
    return true;
  }
  if (counters.size >= 2048) {
    for (const [id, entry] of counters) if (entry.expires <= now) counters.delete(id);
    if (counters.size >= 2048) return false;
  }
  counters.set(key, { count: 1, expires: now + seconds * 1000 });
  return true;
}

export function clientAddress(headers: Headers): string {
  return headers.get("cf-connecting-ip") ?? "local";
}

export function rateLimitResponse(seconds: number): NextResponse {
  return NextResponse.json(
    { error: "Çok fazla deneme yaptınız. Bir süre sonra tekrar deneyin." },
    { status: 429, headers: { "Retry-After": String(seconds) } },
  );
}
