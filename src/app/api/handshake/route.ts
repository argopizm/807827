import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { parseProposalAmount, type SavedProposal } from "@/lib/proposals";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { cleanText, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";


export async function GET(request: Request) {
  const session = await auth();
  const headers = { "Cache-Control": "private, no-store" };
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapın." }, { status: 401, headers });
  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId || jobId.length > 100) return NextResponse.json({ error: "Geçersiz ilan." }, { status: 400, headers });
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Teklif yüklenemedi." }, { status: 503, headers });
    const proposal = await db.prepare("SELECT id, status, proposal_message, amount_kurus, delivery_days FROM handshakes WHERE job_id = ? AND freelancer_id = ? AND status != 'cancelled' ORDER BY created_at DESC LIMIT 1").bind(jobId, session.user.id).first<SavedProposal>();
    return NextResponse.json({ proposal }, { headers });
  } catch { return NextResponse.json({ error: "Teklif yüklenemedi." }, { status: 503, headers }); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Teklif vermek için giriş yapın." }, { status: 401 });

  const body = await readJson(request);
  const jobId = cleanText(body?.jobId);
  const freelancerId = session.user.id;
  if (!jobId || jobId.length > 100) return NextResponse.json({ error: "Geçerli bir ilan seçin." }, { status: 400 });
  const message = cleanText(body?.message);
  const amount = parseProposalAmount(body?.amount);
  const days = body?.deliveryDays;
  if (Array.from(message).length < 20 || message.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message) || amount === null || typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: "20–4000 karakterlik teklif açıklaması, geçerli bir TL fiyatı ve 1–365 gün teslim süresi girin." }, { status: 400 });
  }
  if (!limitRequests("handshake:" + freelancerId, 20, 300)) return rateLimitResponse(300);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Teklif işlemi şu anda kullanılamıyor." }, { status: 503 });

    const user = await db.prepare("SELECT user_type FROM users WHERE id = ?").bind(freelancerId).first<{ user_type: string }>();
    if (user?.user_type !== "freelancer") {
      return NextResponse.json({ error: "Teklif göndermek için freelancer hesabı kullanın." }, { status: 403 });
    }
    if (!await canPublish(db, freelancerId)) return NextResponse.json({ error: emailVerificationError }, { status: 403 });

    const job = await db.prepare("SELECT client_id, status FROM jobs WHERE id = ?").bind(jobId).first<{ client_id: string; status: string | null }>();
    if (!job) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    if (job.client_id === freelancerId) return NextResponse.json({ error: "Kendi ilanınıza teklif gönderemezsiniz." }, { status: 400 });

    const id = crypto.randomUUID();
    const result = await db.prepare(
      "INSERT INTO handshakes (id, job_id, freelancer_id, client_id, status, proposal_message, amount_kurus, delivery_days) " +
      "SELECT ?, j.id, ?, j.client_id, 'pending', ?, ?, ? FROM jobs j " +
      "WHERE j.id = ? AND j.client_id != ? AND COALESCE(j.status, 'open') = 'open' AND NOT EXISTS (" +
      "SELECT 1 FROM handshakes h WHERE h.job_id = j.id AND h.freelancer_id = ? AND h.status != 'cancelled')",
    ).bind(id, freelancerId, message, amount, days, jobId, freelancerId, freelancerId).run();

    const proposal: SavedProposal = { id, status: "pending", proposal_message: message, amount_kurus: amount, delivery_days: days };
    if (result.meta?.changes) return NextResponse.json({ success: true, id, proposal }, { status: 201 });

    const existing = await db.prepare("SELECT id, status, proposal_message, amount_kurus, delivery_days FROM handshakes WHERE job_id = ? AND freelancer_id = ? AND status != 'cancelled'")
      .bind(jobId, freelancerId).first<SavedProposal>();
    if (existing) {
      if (existing.proposal_message === message && existing.amount_kurus === amount && existing.delivery_days === days) return NextResponse.json({ success: true, id: existing.id, proposal: existing });
      return NextResponse.json({ error: "Bu ilana zaten aktif bir teklifin var. Başvurularım bölümünden inceleyebilir veya bekleyen teklifini iptal edip yenisini gönderebilirsin." }, { status: 409 });
    }

    return NextResponse.json({ error: "Bu ilan artık başvuru almıyor." }, { status: 409 });
  } catch {
    console.error("Teklif kaydedilemedi.");
    return NextResponse.json({ error: "Teklif kaydedilemedi. Daha sonra tekrar deneyin." }, { status: 500 });
  }
}

const transitions = {
  accept: { from: "pending", to: "accepted", jobFrom: "open", jobTo: "in_progress" },
  complete: { from: "accepted", to: "completed", jobFrom: "in_progress", jobTo: "completed" },
} as const;

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  const actor = session.user.id;
  const body = await readJson(request);
  const id = cleanText(body?.id);
  const action = body?.action;
  if (!id || id.length > 100 || (action !== "accept" && action !== "complete" && action !== "cancel")) {
    return NextResponse.json({ error: "Geçersiz teklif işlemi." }, { status: 400 });
  }
  if (!limitRequests("transition:" + actor, 30, 300)) return rateLimitResponse(300);

  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Teklif işlemi şu anda kullanılamıyor." }, { status: 503 });

    const h = await db.prepare(
      "SELECT h.job_id, h.client_id, h.freelancer_id, h.status FROM handshakes h " +
      "JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
      "WHERE h.id = ? AND (h.client_id = ? OR h.freelancer_id = ?)",
    ).bind(id, actor, actor).first<{ job_id: string; client_id: string; freelancer_id: string; status: string }>();
    if (!h) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
    if (action !== "cancel" && actor !== h.client_id) {
      return NextResponse.json({ error: "Bu işlemi ilan sahibi yapabilir." }, { status: 403 });
    }

    const to = action === "cancel" ? "cancelled" : transitions[action].to;
    if (h.status === to) return NextResponse.json({ success: true, status: to });
    const allowed = action === "cancel" ? h.status === "pending" || h.status === "accepted" : h.status === transitions[action].from;
    if (!allowed) return NextResponse.json({ error: "Teklif bu durumda güncellenemez." }, { status: 409 });

    const steps = [];
    if (action === "cancel") {
      steps.push(
        db.prepare("UPDATE handshakes SET status = 'cancelled' WHERE id = ? AND status = ? AND (client_id = ? OR freelancer_id = ?)")
          .bind(id, h.status, actor, actor),
      );
      if (h.status === "accepted") {
        steps.push(db.prepare(
          "UPDATE jobs SET status = 'open' WHERE id = ? AND status = 'in_progress' " +
          "AND EXISTS (SELECT 1 FROM handshakes WHERE id = ? AND status = 'cancelled') " +
          "AND NOT EXISTS (SELECT 1 FROM handshakes WHERE job_id = jobs.id AND status = 'accepted')",
        ).bind(h.job_id, id));
      }
    } else {
      const state = transitions[action];
      steps.push(
        db.prepare(
          "UPDATE handshakes SET status = ? WHERE id = ? AND client_id = ? AND status = ? " +
          "AND EXISTS (SELECT 1 FROM jobs WHERE jobs.id = handshakes.job_id AND jobs.client_id = handshakes.client_id AND COALESCE(jobs.status, 'open') = ?) " +
          "AND NOT EXISTS (SELECT 1 FROM handshakes other WHERE other.job_id = handshakes.job_id AND other.id != handshakes.id AND other.status = 'accepted')",
        ).bind(state.to, id, actor, state.from, state.jobFrom),
        db.prepare(
          "UPDATE jobs SET status = ? WHERE id = ? AND client_id = ? AND COALESCE(status, 'open') = ? " +
          "AND EXISTS (SELECT 1 FROM handshakes WHERE id = ? AND job_id = jobs.id AND status = ?)",
        ).bind(state.jobTo, h.job_id, actor, state.jobFrom, id, state.to),
      );

      if (action === "complete") {
        steps.push(
          db.prepare(
            "UPDATE handshakes SET status = 'cancelled' WHERE job_id = ? AND id != ? AND status = 'pending' " +
            "AND EXISTS (SELECT 1 FROM handshakes completed WHERE completed.id = ? AND completed.status = 'completed')",
          ).bind(h.job_id, id, id),
          db.prepare(
            "UPDATE users SET total_jobs_completed = (SELECT COUNT(DISTINCT h.job_id) FROM handshakes h " +
            "JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
            "WHERE h.freelancer_id = users.id AND h.status = 'completed' AND j.status = 'completed') WHERE id = ?",
          ).bind(h.freelancer_id),
        );
      }
    }

    const [changed] = await db.batch(steps);
    if (!changed.meta?.changes) return NextResponse.json({ error: "Teklifin durumu değişti. Sayfayı yenileyin." }, { status: 409 });

    return NextResponse.json({ success: true, status: to });
  } catch {
    console.error("Teklif durumu güncellenemedi.");
    return NextResponse.json({ error: "Teklif durumu güncellenemedi." }, { status: 500 });
  }
}
