import { getRequestContext } from "@cloudflare/next-on-pages";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: Record<string, unknown> }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
  exec(query: string): Promise<unknown>;
}

let schemaInitialized = false;

const REQUIRED_USER_COLUMNS: [string, string][] = [
  ["username", "TEXT"],
  ["full_name", "TEXT"],
  ["name", "TEXT"],
  ["title", "TEXT"],
  ["category", "TEXT DEFAULT 'Genel'"],
  ["skills", "TEXT DEFAULT '[]'"],
  ["bio", "TEXT"],
  ["avatar_url", "TEXT"],
  ["image", "TEXT"],
  ["portfolio_url", "TEXT"],
  ["contact_links", "TEXT DEFAULT '{}'"],
  ["password_hash", "TEXT"],
  ["password_salt", "TEXT"],
  ["user_type", "TEXT DEFAULT NULL"],
  ["onboarding_done", "INTEGER DEFAULT 0"],
  ["tc_verified", "INTEGER DEFAULT 0"],
  ["trust_badge", "INTEGER DEFAULT 0"],
  ["total_jobs_completed", "INTEGER DEFAULT 0"],
  ["rating_avg", "REAL DEFAULT 0"],
  ["created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"],
];

const REQUIRED_JOB_COLUMNS: [string, string][] = [
  ["skills", "TEXT DEFAULT '[]'"],
  ["status", "TEXT DEFAULT 'open'"],
  ["budget_range", "TEXT"],
  ["category", "TEXT DEFAULT 'Genel'"],
  ["created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"],
];

async function ensureSchema(db: D1Database) {
  if (schemaInitialized) return;
  try {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        full_name TEXT,
        name TEXT,
        title TEXT,
        category TEXT DEFAULT 'Genel',
        skills TEXT DEFAULT '[]',
        bio TEXT,
        avatar_url TEXT,
        image TEXT,
        portfolio_url TEXT,
        contact_links TEXT DEFAULT '{}',
        password_hash TEXT,
        password_salt TEXT,
        user_type TEXT DEFAULT NULL,
        onboarding_done INTEGER DEFAULT 0,
        tc_verified INTEGER DEFAULT 0,
        trust_badge INTEGER DEFAULT 0,
        total_jobs_completed INTEGER DEFAULT 0,
        rating_avg REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Genel',
        budget_range TEXT,
        skills TEXT DEFAULT '[]',
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS handshakes (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        freelancer_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        handshake_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        reviewee_id TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`),
    ]);

    // Mevcut tablolarda eksik sütun varsa tamamla
    const { results: userCols } = await db.prepare("PRAGMA table_info(users)").all<{ name: string }>();
    const existingUserCols = new Set((userCols ?? []).map((c) => c.name));
    for (const [col, def] of REQUIRED_USER_COLUMNS) {
      if (!existingUserCols.has(col)) {
        await db.prepare(`ALTER TABLE users ADD COLUMN ${col} ${def}`).run().catch(() => {});
      }
    }

    const { results: jobCols } = await db.prepare("PRAGMA table_info(jobs)").all<{ name: string }>();
    const existingJobCols = new Set((jobCols ?? []).map((c) => c.name));
    for (const [col, def] of REQUIRED_JOB_COLUMNS) {
      if (!existingJobCols.has(col)) {
        await db.prepare(`ALTER TABLE jobs ADD COLUMN ${col} ${def}`).run().catch(() => {});
      }
    }

    schemaInitialized = true;
  } catch (e) {
    console.error("[ensureSchema]", e);
  }
}

export async function getDB(): Promise<D1Database | null> {
  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>)?.DB as D1Database | undefined;
    if (!db) return null;
    await ensureSchema(db);
    return db;
  } catch {
    return null;
  }
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
