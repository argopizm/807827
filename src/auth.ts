import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

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
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "credentials",
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      // request parametresi ile gerçek host URL'ini alıyoruz
      // Bu sayede preview deployment'larda da doğru URL kullanılır
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // request.url'den gerçek host'u al (preview URL'leri de dahil)
          const reqUrl = new URL(request.url);
          const base = `${reqUrl.protocol}//${reqUrl.host}`;
          const res = await fetch(`${base}/api/verify-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Sonsuz döngüyü önlemek için internal header
              "X-Internal-Auth": process.env.AUTH_SECRET ?? "internal",
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) {
            console.error("[authorize] verify-login returned:", res.status);
            return null;
          }
          return await res.json() as { id: string; email: string; name: string | null; image: string | null };
        } catch (e) {
          console.error("[authorize] error:", e);
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
