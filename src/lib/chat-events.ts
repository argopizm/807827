import { getRuntimeBindings } from "@/lib/db";

interface ChatNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(input: string, init?: RequestInit): Promise<Response> };
}

function chatStub(userId: string) {
  const namespace = getRuntimeBindings().CHAT_EVENTS as ChatNamespace | undefined;
  return namespace?.get(namespace.idFromName(userId));
}

export async function notifyChat(userIds: string[]) {
  await Promise.allSettled([...new Set(userIds)].map(async (userId) => {
    await chatStub(userId)?.fetch("https://chat.internal/event", { method: "POST" });
  }));
}

export async function createChatConnection(userId: string) {
  const url = getRuntimeBindings().CHAT_SOCKET_URL ?? process.env.CHAT_SOCKET_URL;
  if (typeof url !== "string" || !url) return null;
  const socket = new URL(url);
  if (socket.protocol !== "wss:") return null;
  const stub = chatStub(userId);
  if (!stub) return null;
  const response = await stub.fetch("https://chat.internal/ticket", { method: "POST" });
  if (!response.ok) return null;
  const { ticket } = await response.json() as { ticket: string };
  socket.pathname = "/socket/" + encodeURIComponent(userId);
  return { url: socket.toString(), ticket };
}
