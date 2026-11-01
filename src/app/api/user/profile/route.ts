export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const userId = session.user.id;
    const user = await db
      .prepare(
        `SELECT id, email, username, COALESCE(full_name, name) AS full_name, title, category, skills,
                bio, COALESCE(avatar_url, image) AS avatar_url, portfolio_url, contact_links,
                user_type, onboarding_done, tc_verified, trust_badge, total_jobs_completed, rating_avg
         FROM users WHERE id = ?`
      )
      .bind(userId)
      .first<Record<string, unknown>>();

    const { results: myJobs } = await db
      .prepare(
        `SELECT j.id, j.title, j.category, j.budget_range, j.status, j.created_at,
                (SELECT COUNT(*) FROM handshakes h WHERE h.job_id = j.id) AS proposals
         FROM jobs j WHERE j.client_id = ? ORDER BY j.created_at DESC`
      )
      .bind(userId)
      .all<Record<string, unknown>>();

    const { results: myApplications } = await db
      .prepare(
        `SELECT h.id, h.job_id, h.status, h.created_at,
                j.title AS job_title, j.budget_range AS job_budget, j.category AS job_category
         FROM handshakes h
         LEFT JOIN jobs j ON h.job_id = j.id
         WHERE h.freelancer_id = ?
         ORDER BY h.created_at DESC`
      )
      .bind(userId)
      .all<Record<string, unknown>>();

    const incomingRow = await db
      .prepare("SELECT COUNT(*) AS cnt FROM handshakes WHERE client_id = ?")
      .bind(userId)
      .first<{ cnt: number }>();

    return NextResponse.json({
      user,
      myJobs: myJobs ?? [],
      myApplications: myApplications ?? [],
      incomingProposals: incomingRow?.cnt ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = session.user.id;

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Veritabanı bağlantısı yok." }, { status: 500 });

    // TC Doğrulama isteği
    if (body.action === "verify_tc") {
      const tcNo = String(body.tcNo ?? "").trim();
      if (!/^\d{11}$/.test(tcNo) || tcNo.startsWith("0")) {
        return NextResponse.json({ error: "Geçerli 11 haneli TC Kimlik numarası girin." }, { status: 400 });
      }
      await db
        .prepare("UPDATE users SET tc_verified = 1 WHERE id = ?")
        .bind(userId)
        .run();
      return NextResponse.json({ success: true });
    }

    const fullName = String(body.full_name ?? "").trim();
    const rawUsername = String(body.username ?? "").replace(/^@/, "").trim().toLowerCase();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "Genel").trim();
    const bio = String(body.bio ?? "").trim();
    const skills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === "string"
        ? body.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    const contactLinks = {
      whatsapp: String(body.whatsapp ?? "").trim(),
      discord: String(body.discord ?? "").trim(),
      portfolio: String(body.portfolio ?? "").trim(),
    };

    if (rawUsername) {
      const taken = await db
        .prepare("SELECT id FROM users WHERE LOWER(username) = ? AND id != ?")
        .bind(rawUsername, userId)
        .first<{ id: string }>();
      if (taken) {
        return NextResponse.json({ error: "Bu kullanıcı adı başka biri tarafından kullanılıyor." }, { status: 409 });
      }
    }

    await db
      .prepare(
        `UPDATE users SET
           full_name = COALESCE(NULLIF(?, ''), full_name),
           name = COALESCE(NULLIF(?, ''), name),
           username = COALESCE(NULLIF(?, ''), username),
           title = ?,
           category = ?,
           skills = ?,
           bio = ?,
           portfolio_url = ?,
           contact_links = ?
         WHERE id = ?`
      )
      .bind(
        fullName,
        fullName,
        rawUsername,
        title,
        category,
        JSON.stringify(skills),
        bio,
        contactLinks.portfolio,
        JSON.stringify(contactLinks),
        userId
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PUT /api/user/profile]", e);
    return NextResponse.json({ error: "Kaydedilirken hata oluştu: " + String(e) }, { status: 500 });
  }
}
