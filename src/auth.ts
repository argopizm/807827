import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getDB } from "@/lib/db";

// Web Crypto PBKDF2 — Cloudflare Workers edge runtime uyumlu
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, key, 256);
  const toHex = (b: Uint8Array) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(saltBytes) };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const saltBytes = Uint8Array.from((salt.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, key, 256);
  const computed = Array.from(new Uint8Array(bits)).map((x) => x.toString(16).padStart(2, "0")).join("");
  return computed === hash;
}

const FALLBACK_SECRET = "fl-tr-cf-d1-secret-807827-key-2026-prod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
  trustHost: true,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    Credentials({
      id: "credentials",
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          const db = await getDB();
          if (!db) {
            console.error("[authorize] D1 binding (DB) bulunamadı");
            return null;
          }

          const user = await db
            .prepare(
              `SELECT id, email,
                      COALESCE(full_name, name) AS display_name,
                      COALESCE(avatar_url, image) AS display_image,
                      password_hash, password_salt
               FROM users WHERE LOWER(email) = ?`
            )
            .bind(email)
            .first<{
              id: string;
              email: string;
              display_name: string | null;
              display_image: string | null;
              password_hash: string | null;
              password_salt: string | null;
            }>();

          if (!user || !user.password_hash || !user.password_salt) return null;
          const valid = await verifyPassword(password, user.password_hash, user.password_salt);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.display_name ?? user.email.split("@")[0],
            image: user.display_image ?? null,
          };
        } catch (e) {
          console.error("[authorize]", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const db = await getDB();
          if (db) {
            const email = user.email.toLowerCase().trim();
            const existing = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first<{ id: string }>();
            if (existing) {
              user.id = existing.id;
              await db
                .prepare("UPDATE users SET full_name = COALESCE(full_name, ?), name = COALESCE(name, ?), avatar_url = COALESCE(avatar_url, ?), image = COALESCE(image, ?) WHERE id = ?")
                .bind(user.name ?? null, user.name ?? null, user.image ?? null, user.image ?? null, existing.id)
                .run();
            } else {
              const newId = user.id || crypto.randomUUID();
              const baseUser = email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase();
              const username = `${baseUser}_${Math.floor(Math.random() * 9000 + 1000)}`;
              user.id = newId;
              await db
                .prepare("INSERT INTO users (id, email, username, full_name, name, avatar_url, image) VALUES (?, ?, ?, ?, ?, ?, ?)")
                .bind(newId, email, username, user.name ?? "", user.name ?? "", user.image ?? "", user.image ?? "")
                .run();
            }
          }
        } catch (e) {
          console.error("[signIn google]", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: { signIn: "/giris", error: "/giris" },
});
