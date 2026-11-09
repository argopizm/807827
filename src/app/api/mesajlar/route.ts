import { publicNameSql } from "@/lib/public-identity";

import { readJson, limitRequests, rateLimitResponse } from "@/lib/request-security";
import { createChatConnection, notifyChat } from "@/lib/chat-events";
import type { D1Database } from "@/lib/db";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { cursorInput, idInput, privateApi, privateJson, textInput } from "@/lib/private-api";

const pageSize = 50;

interface Thread {
  id: string;
  other_id: string;
  other_name: string;
  blocked: number;
  other_last_read_seq: number;
}

async function threadFor(db: D1Database, id: string, userId: string) {
  return db.prepare(`
    SELECT COALESCE((SELECT last_read_seq FROM chat_reads WHERE thread_id = t.id AND user_id = u.id), 0) AS other_last_read_seq, t.id, u.id AS other_id, u.username AS other_username, ${publicNameSql("u")} AS other_name,
      (u.deleted_at IS NOT NULL OR EXISTS(SELECT 1 FROM chat_blocks b WHERE b.blocker_id = ? AND b.blocked_id = u.id)) AS blocked
    FROM chat_threads t
    JOIN users u ON u.id = CASE WHEN t.first_user = ? THEN t.second_user ELSE t.first_user END
    WHERE t.id = ? AND ? IN (t.first_user, t.second_user)
  `).bind(userId, userId, id, userId).first<Thread>();
}

export function GET(request: Request) {
  return privateApi(request, async (db, userId) => {
    if (!limitRequests("chat-read:" + userId, 180, 60)) return rateLimitResponse(60);
    const query = new URL(request.url).searchParams;
    if (query.get("unread") === "1") {
      const unread = await db.prepare(`
        SELECT count(*) AS count FROM chat_messages m JOIN chat_threads t ON t.id = m.thread_id
        LEFT JOIN chat_reads r ON r.thread_id = t.id AND r.user_id = ?
        WHERE ? IN (t.first_user, t.second_user) AND m.sender_id <> ?
          AND m.seq > COALESCE(r.last_read_seq, 0)
          AND NOT EXISTS (SELECT 1 FROM chat_blocks b WHERE b.blocker_id = ? AND b.blocked_id = m.sender_id)
      `).bind(userId, userId, userId, userId).first<{ count: number }>();
      return privateJson({ unread: unread?.count ?? 0 });
    }

    const threadId = idInput(query.get("thread"));
    if (threadId) {
      const thread = await threadFor(db, threadId, userId);
      if (!thread) return privateJson({ error: "Konuşma bulunamadı." }, 404);

      const after = cursorInput(query.get("after"));
      const before = cursorInput(query.get("before"));
      const newer = after !== null;
      const limit = newer ? 100 : pageSize;
      const result = await db.prepare(`
        SELECT seq, id, sender_id = ? AS mine, content, created_at FROM chat_messages
        WHERE thread_id = ? AND seq ${newer ? ">" : "<"} ?
        ORDER BY seq ${newer ? "ASC" : "DESC"} LIMIT ?
      `).bind(userId, threadId, after ?? before ?? Number.MAX_SAFE_INTEGER, limit + 1).all();

      const more = result.results.length > limit;
      const messages = result.results.slice(0, limit);
      if (!newer) messages.reverse();
      return privateJson({ thread, messages, more });
    }

    const offset = Math.min(cursorInput(query.get("offset")) ?? 0, 100000);
    const result = await db.prepare(`
      SELECT t.id, u.id AS other_id, u.username AS other_username, ${publicNameSql("u")} AS other_name,
        last.content AS last_content, COALESCE(last.created_at, t.created_at) AS updated_at,
        (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id AND m.sender_id <> ?
          AND m.seq > COALESCE(r.last_read_seq, 0) AND NOT EXISTS (
            SELECT 1 FROM chat_blocks b WHERE b.blocker_id IN (t.first_user, t.second_user) AND b.blocked_id = m.sender_id
          )) AS unread
      FROM chat_threads t
      JOIN users u ON u.id = CASE WHEN t.first_user = ? THEN t.second_user ELSE t.first_user END
      LEFT JOIN chat_messages last ON last.seq = (SELECT max(seq) FROM chat_messages WHERE thread_id = t.id)
      LEFT JOIN chat_reads r ON r.thread_id = t.id AND r.user_id = ?
      WHERE ? IN (t.first_user, t.second_user)
      ORDER BY COALESCE(last.created_at, t.created_at) DESC, last.seq DESC, t.id DESC LIMIT 31 OFFSET ?
    `).bind(userId, userId, userId, userId, offset).all();
    return privateJson({ threads: result.results.slice(0, 30), more: result.results.length > 30 });
  });
}

export function POST(request: Request) {
  return privateApi(request, async (db, userId) => {
    const body = await readJson(request);
    if (!body) return privateJson({ error: "Geçersiz istek." }, 400);
    if (body?.action === "connect") {
      if (!limitRequests("chat-connect:" + userId, 10, 60)) return rateLimitResponse(60);
      return privateJson(await createChatConnection(userId).catch(() => null) ?? {});
    }
    if ((body?.action === "start" || body?.action === "send") && !await canPublish(db, userId)) {
      return privateJson({ error: emailVerificationError }, 403);
    }
    if (body?.action === "start") {
      if (!limitRequests("chat-start:" + userId, 20, 60)) return rateLimitResponse(60);
      const other = idInput(body.to);
      if (!other || other === userId) return privateJson({ error: "Geçerli bir kullanıcı seçin." }, 400);
      const [first, second] = [userId, other].sort();
      await db.prepare(`
        INSERT INTO chat_threads (id, first_user, second_user)
        SELECT ?, ?, ? WHERE EXISTS (
          SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL AND onboarding_done = 1 AND user_type IN ('freelancer', 'employer')
        ) AND NOT EXISTS (
          SELECT 1 FROM chat_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
        ) ON CONFLICT (first_user, second_user) DO NOTHING
      `).bind(crypto.randomUUID(), first, second, other, first, second, second, first).run();

      const thread = await db.prepare(`
        SELECT id FROM chat_threads WHERE first_user = ? AND second_user = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL)
      `).bind(first, second, other).first<{ id: string }>();
      return thread ? privateJson({ threadId: thread.id }) : privateJson({ error: "Bu kullanıcıyla konuşma başlatılamadı." }, 403);
    }

    const threadId = idInput(body?.threadId);
    const thread = threadId && await threadFor(db, threadId, userId);
    if (!thread) return privateJson({ error: "Konuşma bulunamadı." }, 404);

    switch (body.action) {
      case "read": {
        const seq = cursorInput(body.seq);
        if (seq === null) return privateJson({ error: "Mesaj sırası geçersiz." }, 400);
        await db.prepare(`
          INSERT INTO chat_reads (thread_id, user_id, last_read_seq)
          SELECT ?, ?, COALESCE(max(seq), 0) FROM chat_messages WHERE thread_id = ? AND seq <= ?
          ON CONFLICT (thread_id, user_id) DO UPDATE SET last_read_seq = max(last_read_seq, excluded.last_read_seq)
        `).bind(thread.id, userId, thread.id, seq).run();
        await notifyChat([thread.other_id]);
        return privateJson({ ok: true });
      }
      case "block": {
        if (body.blocked === true) {
          await db.prepare("INSERT OR IGNORE INTO chat_blocks (blocker_id, blocked_id) VALUES (?, ?)")
            .bind(userId, thread.other_id).run();
        } else if (body.blocked === false) {
          await db.prepare("DELETE FROM chat_blocks WHERE blocker_id = ? AND blocked_id = ?")
            .bind(userId, thread.other_id).run();
        } else {
          return privateJson({ error: "Geçersiz engelleme isteği." }, 400);
        }
        return privateJson({ ok: true });
      }
      case "report": {
        const id = idInput(body.messageId);
        const reason = textInput(body.reason, 500);
        if (!id || !reason) return privateJson({ error: "Mesajı ve şikâyet nedenini belirtin." }, 400);
        const message = await db.prepare("SELECT id FROM chat_messages WHERE id = ? AND thread_id = ? AND sender_id <> ?")
          .bind(id, thread.id, userId).first();
        if (!message) return privateJson({ error: "Mesaj bulunamadı." }, 404);
        await db.prepare(`
          INSERT INTO chat_reports (id, reporter_id, message_id, reason) VALUES (?, ?, ?, ?)
          ON CONFLICT (reporter_id, message_id) DO NOTHING
        `).bind(crypto.randomUUID(), userId, id, reason).run();
        return privateJson({ ok: true });
      }
      case "send": {
        if (thread.blocked) return privateJson({ error: "Bu kullanıcıya mesaj gönderilemiyor." }, 403);
        const id = idInput(body.messageId);
        const content = textInput(body.content, 4000);
        if (!id || !content) return privateJson({ error: "En fazla 4.000 karakterlik bir mesaj yazın." }, 400);

        const result = await db.prepare(`
          INSERT INTO chat_messages (id, thread_id, sender_id, content)
          SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL) AND NOT EXISTS (
            SELECT 1 FROM chat_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
          ) AND (
            SELECT count(*) FROM chat_messages WHERE sender_id = ? AND created_at >= datetime('now', '-1 minute')
          ) < 20
          ON CONFLICT (id) DO NOTHING
        `).bind(id, thread.id, userId, content, thread.other_id, userId, thread.other_id, thread.other_id, userId, userId).run();

        const message = await db.prepare(`
          SELECT seq, id, 1 AS mine, content, created_at FROM chat_messages WHERE id = ? AND thread_id = ? AND sender_id = ?
        `).bind(id, thread.id, userId).first<{ content: string }>();
        if (!message || message.content !== content) {
          return privateJson({ error: "Mesaj gönderilemedi. Bir süre sonra tekrar deneyin." }, 409);
        }
        if (result.meta?.changes) await notifyChat([userId, thread.other_id]);
        return privateJson({ message });
      }
      default:
        return privateJson({ error: "Geçersiz işlem." }, 400);
    }
  });
}
