import { publicNameSql } from "@/lib/public-identity";
import NextAuth, { type User } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getDB } from "@/lib/db";
import { runtimeEnv } from "@/lib/runtime-env";
import { verifyPassword } from "@/lib/password";
import { cleanEmail, clientAddress, limitRequests } from "@/lib/request-security";

function googleProvider() {
  const clientId = runtimeEnv("GOOGLE_CLIENT_ID");
  const clientSecret = runtimeEnv("GOOGLE_CLIENT_SECRET");
  return clientId && clientSecret ? [Google({ clientId, clientSecret })] : [];
}

async function persistGoogleUser(user: User, subject: string): Promise<boolean> {
  const email = cleanEmail(user.email);
  if (!email) return false;

  const db = await getDB();
  if (!db) return false;

  const linked = await db.prepare("SELECT id FROM users WHERE google_subject = ?").bind(subject).first<{ id: string }>();
  if (linked) {
    user.id = linked.id;
    return true;
  }

  const id = crypto.randomUUID();
  const username = "kullanici_" + id.replace(/-/g, "").slice(0, 16);

  // An existing password account must prove ownership through its own login before linking.
  // Legacy Google-only rows can be attached on the first verified Google sign-in.
  await db.batch([
    db.prepare(
      "UPDATE users SET google_subject = ?, email_verified_at = CURRENT_TIMESTAMP WHERE LOWER(email) = ? AND password_hash IS NULL AND google_subject IS NULL",
    ).bind(subject, email),
    db.prepare(
      "INSERT INTO users (id, email, username, full_name, name, avatar_url, image, google_subject, email_verified_at) " +
      "SELECT ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = ? OR google_subject = ?)",
    ).bind(id, email, username, user.name ?? null, user.name ?? null, user.image ?? null, user.image ?? null, subject, email, subject),
  ]);

  const persisted = await db.prepare("SELECT id FROM users WHERE google_subject = ?").bind(subject).first<{ id: string }>();
  if (!persisted) return false;
  user.id = persisted.id;
  return true;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: runtimeEnv("AUTH_SECRET") || runtimeEnv("NEXTAUTH_SECRET"),
  trustHost: true,
  providers: [
    ...googleProvider(),
    Credentials({
      id: "credentials",
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, request) {
        const email = cleanEmail(credentials.email);
        const password = credentials.password;
        if (!email || typeof password !== "string" || !password || password.length > 256) return null;
        const address = clientAddress(request.headers);
        if (!limitRequests("login:" + address, 40, 300) || !limitRequests("login:" + address + ":" + email, 8, 300)) return null;

        try {
          const db = await getDB();
          if (!db) return null;
          const user = await db
            .prepare(
              "SELECT id, email, " + publicNameSql() + " AS display_name, COALESCE(avatar_url, image) AS display_image, " +
              "password_hash, password_salt, session_version FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL",
            )
            .bind(email)
            .first<{
              id: string;
              email: string;
              display_name: string | null;
              display_image: string | null;
              password_hash: string | null;
              password_salt: string | null;
              session_version: number;
            }>();

          if (!user?.password_hash || !user.password_salt) return null;
          if (!await verifyPassword(password, user.password_hash, user.password_salt)) return null;
          return { id: user.id, email: user.email, name: user.display_name ?? user.email.split("@")[0], image: user.display_image, sessionVersion: user.session_version };
        } catch {
          console.error("E-posta oturumu doğrulanamadı.");
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (profile?.email_verified !== true || !account.providerAccountId) return false;

      try {
        return await persistGoogleUser(user, account.providerAccountId);
      } catch {
        console.error("Google hesabı kaydedilemedi.");
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (!token.sub) return null;
      try {
        const db = await getDB();
        if (!db) return null;
        const current = await db.prepare("SELECT session_version, deleted_at, email, username, " + publicNameSql() + " AS name FROM users WHERE id = ?")
          .bind(token.sub).first<{ session_version: number; deleted_at: string | null; email: string; username: string | null; name: string | null }>();
        if (!current || current.deleted_at) return null;
        if (user?.sessionVersion !== undefined && user.sessionVersion !== current.session_version) return null;
        if (user) {
          token.sessionVersion = current.session_version;
          token.authenticatedAt = Date.now();
        }
        if (Number(token.sessionVersion ?? 0) !== current.session_version) return null;
        token.email = current.email;
        token.name = current.name;
        token.username = current.username;
        return token;
      } catch {
        return null;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user) session.user.username = typeof token.username === "string" ? token.username : null;
      if (session.user) session.user.authenticatedAt = Number(token.authenticatedAt ?? 0);
      return session;
    },
  },
  pages: { signIn: "/giris", error: "/giris" },
}));
