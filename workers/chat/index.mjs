import { DurableObject } from "cloudflare:workers";

const protocol = "frenaw.v1";
const ticketLifetimeMs = 60_000;
const connectionLifetimeMs = 15 * 60_000;

const worker = {
  fetch(request, env) {
    const match = new URL(request.url).pathname.match(/^\/socket\/([a-zA-Z0-9_-]{1,128})$/);
    const allowedOrigins = (env.APP_ORIGINS || "").split(",").map((origin) => origin.trim());
    if (!match || request.method !== "GET") return new Response(null, { status: 404 });
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket"
      || !allowedOrigins.includes(request.headers.get("Origin"))) {
      return new Response(null, { status: 403 });
    }
    return env.CHAT_EVENTS.get(env.CHAT_EVENTS.idFromName(match[1])).fetch(
      new Request("https://chat.internal/socket", request),
    );
  },
};

export class ChatEvents extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.storage.sql.exec("CREATE TABLE IF NOT EXISTS tickets (token TEXT PRIMARY KEY, expires INTEGER NOT NULL)");
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    const now = Date.now();

    if (request.method === "POST" && path === "/ticket") {
      const ticket = crypto.randomUUID();
      this.storage.sql.exec("DELETE FROM tickets WHERE expires <= ?", now);
      this.storage.sql.exec("INSERT INTO tickets (token, expires) VALUES (?, ?)", ticket, now + ticketLifetimeMs);
      if ((await this.storage.getAlarm()) === null) await this.storage.setAlarm(now + ticketLifetimeMs);
      return Response.json({ ticket }, { headers: { "Cache-Control": "no-store" } });
    }

    if (request.method === "POST" && path === "/event") {
      for (const socket of this.ctx.getWebSockets()) {
        try {
          if (socket.deserializeAttachment()?.expires > now) socket.send("update");
          else socket.close(1000, "Session expired");
        } catch {
          // The HTTP read path remains available for disconnected clients.
        }
      }
      return new Response(null, { status: 204 });
    }

    if (request.method === "GET" && path === "/socket") {
      const requested = request.headers.get("Sec-WebSocket-Protocol")?.split(",").map((value) => value.trim()) ?? [];
      const ticket = requested.find((value) => /^ticket\.[a-f0-9-]{36}$/.test(value))?.slice(7);
      if (!ticket || !requested.includes(protocol)
        || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return new Response(null, { status: 403 });
      }
      const used = this.storage.sql.exec("DELETE FROM tickets WHERE token = ? AND expires > ? RETURNING token", ticket, now).toArray();
      if (used.length !== 1) return new Response(null, { status: 403 });

      const [client, server] = Object.values(new WebSocketPair());
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ expires: now + connectionLifetimeMs });
      return new Response(null, { status: 101, webSocket: client, headers: { "Sec-WebSocket-Protocol": protocol } });
    }

    return new Response(null, { status: 404 });
  }

  async alarm() {
    this.storage.sql.exec("DELETE FROM tickets WHERE expires <= ?", Date.now());
    const next = this.storage.sql.exec("SELECT min(expires) AS time FROM tickets").one().time;
    if (next !== null) await this.storage.setAlarm(next);
  }

  webSocketMessage(socket) {
    socket.close(1008, "Read only");
  }
}

export default worker;
