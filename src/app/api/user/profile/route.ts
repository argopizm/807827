import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeCategory } from "@/lib/categories";
import { getDB } from "@/lib/db";
import { cleanDisplayName, cleanUsername, publicNameSql, validDisplayName, validUsername } from "@/lib/public-identity";
import { canPublish, emailVerificationConfig, emailVerificationError } from "@/lib/email-verification";
import { normalizeSkills } from "@/lib/skills";
import { cleanText, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Hesabınız şu anda yüklenemedi." }, { status: 503 });

    const userId = session.user.id;
    const user = await db.prepare(
      "SELECT id, email, username, display_name, COALESCE(full_name, name) AS full_name, title, category, skills, " +
      "bio, COALESCE(avatar_url, image) AS avatar_url, portfolio_url, contact_links, " +
      "user_type, onboarding_done, email_verified_at, total_jobs_completed, rating_avg FROM users WHERE id = ?",
    ).bind(userId).first();
    if (!user) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });

    const [jobs, applications, incoming] = await db.batch([
      db.prepare(
        "SELECT j.id, j.title, j.category, j.budget_range, j.status, j.created_at, " +
        "(SELECT COUNT(*) FROM handshakes h WHERE h.job_id = j.id AND h.client_id = j.client_id AND h.status != 'cancelled') AS proposals " +
        "FROM jobs j WHERE j.client_id = ? ORDER BY j.created_at DESC",
      ).bind(userId),
      db.prepare(
        "SELECT h.id, h.job_id, h.status, h.created_at, h.proposal_message, h.amount_kurus, h.delivery_days, j.status AS job_status, " +
        "j.title AS job_title, j.budget_range AS job_budget, j.category AS job_category " +
        "FROM handshakes h JOIN jobs j ON h.job_id = j.id AND j.client_id = h.client_id " +
        "WHERE h.freelancer_id = ? ORDER BY h.created_at DESC",
      ).bind(userId),
      db.prepare(
        "SELECT h.id, h.job_id, h.status, h.proposal_message, h.amount_kurus, h.delivery_days, j.status AS job_status, j.title AS job_title, " +
        "j.category AS job_category, j.budget_range AS job_budget, " +
        publicNameSql("u") + " AS freelancer_name, u.username AS freelancer_username " +
        "FROM handshakes h JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
        "JOIN users u ON u.id = h.freelancer_id WHERE j.client_id = ? ORDER BY h.created_at DESC",
      ).bind(userId),
    ]);

    return NextResponse.json({
      user,
      myJobs: jobs.results ?? [],
      myApplications: applications.results ?? [],
      proposals: incoming.results ?? [],
      incomingProposals: (incoming.results ?? []).filter((proposal) => proposal.status === "pending").length,
      emailVerificationEnabled: Boolean(emailVerificationConfig()),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Hesap bilgileri yüklenemedi.");
    return NextResponse.json({ error: "Hesap bilgileri yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Geçersiz profil bilgisi." }, { status: 400 });
  if (body.action === "verify_tc") {
    return NextResponse.json({ error: "Kimlik doğrulama kapalı. Kimlik bilgilerinizi göndermeyin." }, { status: 410 });
  }

  const userId = session.user.id;
  if (!limitRequests("profile:" + userId, 20, 300)) return rateLimitResponse(300);
  const fullName = cleanText(body.full_name);
  const username = cleanUsername(body.username);
  const displayName = cleanDisplayName(body.display_name);
  if (body.display_name !== undefined && !validDisplayName(displayName)) {
    return NextResponse.json({ error: "Görünen ad 2–80 karakter olmalı. Takma ad veya marka adı kullanabilirsiniz." }, { status: 400 });
  }
  const title = cleanText(body.title);
  const category = normalizeCategory(cleanText(body.category) || "Genel");
  const bio = cleanText(body.bio);
  const rawSkills = Array.isArray(body.skills) ? body.skills : typeof body.skills === "string" ? body.skills.split(",") : [];
  if (rawSkills.length > 20 || rawSkills.some((item) => typeof item !== "string" || item.trim().length > 50 || /[\u0000-\u001f\u007f]/.test(item))) {
    return NextResponse.json({ error: "En fazla 20 yetenek ekleyin. Her etiket 1–50 karakter olmalı.", field: "skills" }, { status: 400 });
  }
  const skills = normalizeSkills(rawSkills);
  const whatsapp = cleanText(body.whatsapp).replace(/^[+]/, "").replace(/[\s()-]/g, "");
  const discord = cleanText(body.discord);
  const portfolio = cleanText(body.portfolio);
  const avatar = cleanText(body.avatar_url);
  if (avatar) {
    try {
      const url = new URL(avatar);
      if (avatar.length > 2048 || url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid avatar");
    } catch { return NextResponse.json({ error: "Profil görseli geçerli bir HTTPS adresi olmalı." }, { status: 400 }); }
  }
  const publicContact = body.publicContact === true;

  if (fullName.length > 100 || (username && !validUsername(username)) || title.length > 140 || !category || bio.length > 4000) {
    return NextResponse.json({ error: "Profil alanlarını kontrol edin. Kullanıcı adında harf, sayı ve alt çizgi kullanın." }, { status: 400 });
  }
  if (whatsapp && !/^[1-9]\d{7,14}$/.test(whatsapp)) {
    return NextResponse.json({ error: "WhatsApp numaranızı ülke koduyla girin." }, { status: 400 });
  }
  if (discord && !/^[a-zA-Z0-9_.-]{2,32}(?:#\d{4})?$/.test(discord)) {
    return NextResponse.json({ error: "Geçerli bir Discord kullanıcı adı girin." }, { status: 400 });
  }
  if (portfolio) {
    try {
      const url = new URL(portfolio);
      if (portfolio.length > 2048 || url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error("Invalid portfolio");
    } catch {
      return NextResponse.json({ error: "Portföy adresi https:// ile başlamalı." }, { status: 400 });
    }
  }

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Profil güncelleme şu anda kullanılamıyor." }, { status: 503 });
    if (!await canPublish(db, userId)) return NextResponse.json({ error: emailVerificationError }, { status: 403 });

    const result = await db.prepare(
      "UPDATE users SET full_name = COALESCE(NULLIF(?, ''), full_name), name = COALESCE(NULLIF(?, ''), name), display_name = COALESCE(?, display_name), " +
      "username = COALESCE(NULLIF(?, ''), username), title = ?, category = ?, skills = ?, bio = ?, portfolio_url = ?, contact_links = ?, avatar_url = ?, image = NULL " +
      "WHERE id = ? AND (? = '' OR NOT EXISTS (SELECT 1 FROM users other WHERE LOWER(other.username) = ? AND other.id != ?))",
    ).bind(
      fullName, fullName, body.display_name === undefined ? null : displayName, username, title, category, JSON.stringify(skills), bio, portfolio,
      JSON.stringify({ whatsapp, discord, portfolio, public: publicContact }), avatar || null, userId, username, username, userId,
    ).run();

    if (!result.meta?.changes) return NextResponse.json({ error: "Kullanıcı adı başka bir hesapta kullanılıyor veya profil bulunamadı." }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch {
    console.error("Profil kaydedilemedi.");
    return NextResponse.json({ error: "Profil kaydedilemedi. Daha sonra tekrar deneyin." }, { status: 500 });
  }
}
