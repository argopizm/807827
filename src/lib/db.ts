import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1Result {
  success: boolean;
  results: Record<string, unknown>[];
  meta?: { changes?: number; [key: string]: unknown };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<unknown>;
}

export function getRuntimeBindings(): Record<string, unknown> {
  try {
    return getCloudflareContext().env as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function getDB(): Promise<D1Database | null> {
  return (getRuntimeBindings().DB as D1Database | undefined) ?? null;
}

export function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return "Yeni";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return dateStr;
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diffSec < 60) return "Az önce";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Dün";
  if (diffDay < 30) return `${diffDay} gün önce`;
  return d.toLocaleDateString("tr-TR");
}
