
import { readJson } from "@/lib/request-security";
import { type D1Database } from "@/lib/db";
import { cursorInput, idInput, privateApi, privateJson, textInput } from "@/lib/private-api";
import { supportCategories, supportStatuses } from "@/lib/support";

async function isStaff(db: D1Database, userId: string) {
  return Boolean(await db.prepare("SELECT 1 FROM support_staff WHERE user_id = ?").bind(userId).first());
}

async function ticketFor(db: D1Database, ticketId: string, userId: string) {
  return db.prepare(`
    SELECT id, user_id = ? AS mine, subject, category, status, priority,
      assigned_to IS NOT NULL AS assigned, updated_at
    FROM support_tickets WHERE id = ? AND (user_id = ? OR (
      (assigned_to IS NULL OR assigned_to = ?) AND EXISTS (SELECT 1 FROM support_staff WHERE user_id = ?)
    ))
  `).bind(userId, ticketId, userId, userId, userId)
    .first<{ id: string; mine: number; status: string; priority: string; assigned: number }>();
}

export function GET(request: Request) {
  return privateApi(request, async (db, userId) => {
    const query = new URL(request.url).searchParams;
    const staff = await isStaff(db, userId);

    if (query.get("reports") === "1") {
      if (!staff) return privateJson({ error: "Bu alana erişim yetkiniz yok." }, 403);
      const reports = await db.prepare(`
        SELECT r.id, r.reason, r.created_at, m.content FROM chat_reports r
        JOIN chat_messages m ON m.id = r.message_id
        WHERE r.resolved_at IS NULL ORDER BY r.created_at DESC LIMIT 50
      `).all();
      return privateJson({ reports: reports.results });
    }

    const id = idInput(query.get("ticket"));
    if (id) {
      const ticket = await ticketFor(db, id, userId);
      if (!ticket) return privateJson({ error: "Destek talebi bulunamadı." }, 404);
      const before = cursorInput(query.get("before")) ?? Number.MAX_SAFE_INTEGER;
      const replies = await db.prepare(`
        SELECT seq, id, staff, body, created_at FROM support_replies
        WHERE ticket_id = ? AND seq < ? ORDER BY seq DESC LIMIT 51
      `).bind(id, before).all();
      return privateJson({ ticket, replies: replies.results.slice(0, 50).reverse(), more: replies.results.length > 50 });
    }

    const queue = query.get("queue") === "1";
    if (queue && !staff) return privateJson({ error: "Bu alana erişim yetkiniz yok." }, 403);
    const offset = Math.min(cursorInput(query.get("offset")) ?? 0, 100000);
    const result = await (queue
      ? db.prepare(`
          SELECT id, subject, category, status, priority, updated_at FROM support_tickets
          WHERE (assigned_to IS NULL OR assigned_to = ?) AND user_id <> ?
          ORDER BY status = 'resolved', priority = 'normal', updated_at DESC, id DESC LIMIT 31 OFFSET ?
        `).bind(userId, userId, offset)
      : db.prepare(`
          SELECT id, subject, category, status, priority, updated_at FROM support_tickets
          WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 31 OFFSET ?
        `).bind(userId, offset)).all();
    return privateJson({ tickets: result.results.slice(0, 30), staff, more: result.results.length > 30 });
  });
}

export function POST(request: Request) {
  return privateApi(request, async (db, userId) => {
    const body = await readJson(request);
    if (!body) return privateJson({ error: "Geçersiz istek." }, 400);

    if (body?.action === "create") {
      const subject = textInput(body.subject, 120);
      const message = textInput(body.message, 5000);
      const category = typeof body.category === "string" && Object.hasOwn(supportCategories, body.category)
        ? body.category : null;
      if (!subject || !message || !category) {
        return privateJson({ error: "Konu, kategori ve açıklamayı doldurun." }, 400);
      }
      const id = idInput(body.id) ?? crypto.randomUUID();
      const [created] = await db.batch([
        db.prepare(`
          INSERT INTO support_tickets (id, user_id, subject, category)
          SELECT ?, ?, ?, ? WHERE (SELECT count(*) FROM support_tickets WHERE user_id = ? AND status <> 'resolved') < 10
          ON CONFLICT (id) DO NOTHING
        `).bind(id, userId, subject, category, userId),
        db.prepare(`
          INSERT INTO support_replies (id, ticket_id, author_id, body)
          SELECT ?, id, ?, ? FROM support_tickets WHERE id = ? AND user_id = ?
          ON CONFLICT (id) DO NOTHING
        `).bind(id + "_initial", userId, message, id, userId),
      ]);
      const existing = await db.prepare("SELECT t.subject, t.category, r.body FROM support_tickets t JOIN support_replies r ON r.id = ? WHERE t.id = ? AND t.user_id = ?")
        .bind(id + "_initial", id, userId).first<{ subject: string; category: string; body: string }>();
      if (existing?.subject === subject && existing.category === category && existing.body === message) return privateJson({ id }, created.meta?.changes ? 201 : 200);
      if (!created.meta?.changes) return privateJson({ error: "Yeni talep açmadan önce açık taleplerinizden birini sonuçlandırın." }, 429);
      return privateJson({ id }, 201);
    }

    if (body?.action === "resolveReport") {
      if (!await isStaff(db, userId)) return privateJson({ error: "Bu alana erişim yetkiniz yok." }, 403);
      const reportId = idInput(body.id);
      if (!reportId) return privateJson({ error: "Bildirim bulunamadı." }, 404);
      await db.prepare("UPDATE chat_reports SET resolved_at = CURRENT_TIMESTAMP, resolved_by = ? WHERE id = ? AND resolved_at IS NULL")
        .bind(userId, reportId).run();
      return privateJson({ ok: true });
    }

    const id = idInput(body?.id);
    const ticket = id && await ticketFor(db, id, userId);
    if (!ticket) return privateJson({ error: "Destek talebi bulunamadı." }, 404);

    if (body.action === "reply") {
      const message = textInput(body.message, 5000);
      const replyId = idInput(body.replyId);
      if (!message || !replyId) return privateJson({ error: "Yanıt metnini doldurun." }, 400);
      const fromStaff = ticket.mine ? 0 : 1;
      await db.batch([
        db.prepare(`
          INSERT INTO support_replies (id, ticket_id, author_id, staff, body)
          SELECT ?, id, ?, ?, ? FROM support_tickets
          WHERE id = ? AND status <> 'resolved' AND (user_id = ? OR (
            (assigned_to IS NULL OR assigned_to = ?) AND EXISTS (SELECT 1 FROM support_staff WHERE user_id = ?)
          )) AND (SELECT count(*) FROM support_replies WHERE author_id = ? AND created_at >= datetime('now', '-1 minute')) < 10
          ON CONFLICT (id) DO NOTHING
        `).bind(replyId, userId, fromStaff, message, ticket.id, userId, userId, userId, userId),
        db.prepare(`
          UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND changes() > 0
        `).bind(fromStaff ? "awaiting_user" : "open", ticket.id),
      ]);
      const reply = await db.prepare("SELECT body FROM support_replies WHERE id = ? AND ticket_id = ? AND author_id = ?")
        .bind(replyId, ticket.id, userId).first<{ body: string }>();
      if (reply?.body !== message) return privateJson({ error: "Yanıt kaydedilemedi." }, 409);
      return privateJson({ ok: true });
    }

    if (body.action === "manage") {
      if (ticket.mine || !await isStaff(db, userId)) return privateJson({ error: "Bu alana erişim yetkiniz yok." }, 403);
      const status = typeof body.status === "string" && Object.hasOwn(supportStatuses, body.status) ? body.status : null;
      const priority = body.priority === "high" || body.priority === "normal" ? body.priority : null;
      const assignment = body.assignment === "claim" ? userId : body.assignment === "release" ? null : undefined;
      if (!status || !priority || assignment === undefined) return privateJson({ error: "Geçersiz talep ayarı." }, 400);

      const [changed] = await db.batch([
        db.prepare(`
          UPDATE support_tickets SET status = ?, priority = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id <> ? AND (assigned_to IS NULL OR assigned_to = ?)
            AND EXISTS (SELECT 1 FROM support_staff WHERE user_id = ?)
        `).bind(status, priority, assignment, ticket.id, userId, userId, userId),
        db.prepare(`
          INSERT INTO support_events (id, ticket_id, actor_id, action)
          SELECT ?, ?, ?, ? WHERE changes() > 0
        `).bind(crypto.randomUUID(), ticket.id, userId, [status, priority, body.assignment].join("/")),
      ]);
      if (!changed.meta?.changes) return privateJson({ error: "Talep başka bir ekip üyesi tarafından alındı." }, 409);
      return privateJson({ ok: true });
    }

    return privateJson({ error: "Geçersiz işlem." }, 400);
  });
}
