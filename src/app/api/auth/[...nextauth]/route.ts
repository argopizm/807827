import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";

// Not: D1 adapter kullanımı için Cloudflare ortamı gereklidir.
// Yerel geliştirmede simülasyon veya farklı bir adapter kullanılabilir.

export const authOptions = {
  // @ts-ignore - D1 adapter tip uyuşmazlığı olabilir
  // adapter: D1Adapter(process.env.DB), 
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user?.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
