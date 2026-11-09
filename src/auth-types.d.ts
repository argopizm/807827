import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User { sessionVersion?: number }
  interface Session {
    user: { id: string; authenticatedAt: number; username?: string | null } & DefaultSession["user"];
  }
}
