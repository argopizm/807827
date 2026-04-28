import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getRequestContext } from "@cloudflare/next-on-pages";

// Web Crypto PBKDF2 — Cloudflare Workers edge runtime compatible
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, key, 256);
  const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(saltBytes) };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const saltBytes = Uint8Array.from((salt.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, key, 256);
  const computed = Array.from(new Uint8Array(bits)).map(x => x.toString(16).padStart(2, "0")).join("");
  return computed === hash;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // AUTH_SECRET env var'ı Cloudflare'de kesinlikle ayarlanmış olmalı
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // trustHost: CF Pages'de farklı subdomain'lerde çalışması için şart
  trustHost: true,
  providers: [
    // Google'ı sadece credentials varsa ekle
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
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
          // getRequestContext() - Cloudflare Workers edge runtime'da çalışır
          // authorize() sadece istek sırasında çağrılır, build sırasında değil
          const { env } = getRequestContext();
          const db = (env as Record<string, unknown>).DB as D1Database | undefined;

          if (!db) {
            console.error("[authorize] D1 DB binding not found in env");
            return null;
          }

          const user = await db
            .prepare(
              "SELECT id, email, full_name, avatar_url, password_hash, password_salt FROM users WHERE LOWER(email) = ?"
            )
            .bind(email)
            .first<{
              id: string;
              email: string;
              full_name: string | null;
              avatar_url: string | null;
              password_hash: string | null;
              password_salt: string | null;
            }>();

          if (!user) {
            console.log("[authorize] User not found:", email);
            return null;
          }

          if (!user.password_hash || !user.password_salt) {
            console.log("[authorize] No password — Google-only account:", email);
            return null;
          }

          const valid = await verifyPassword(password, user.password_hash, user.password_salt);
          if (!valid) {
            console.log("[authorize] Wrong password for:", email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
          };
        } catch (e) {
          console.error("[authorize] Exception:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
});
