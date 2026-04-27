import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // D1Adapter, Cloudflare ortamında getRequestContext() üzerinden bağlanmalı.
  // process.env.DB bir string değil, D1 binding nesnesidir.
  // Adapter olmadan da session JWT tabanlı çalışır.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/dogrulama",
  },
});
