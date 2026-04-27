import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freelancer Türkiye | Komisyonsuz Freelancer Platformu",
  description: "Türkiye'nin en hafif, hızlı ve komisyonsuz freelancer platformu. İş ilanları açın, teklif verin ve güvenle el sıkışın.",
  keywords: ["freelancer", "türkiye", "komisyonsuz", "iş ilanları", "yazılım", "tasarım", "çeviri"],
  openGraph: {
    title: "Freelancer Türkiye",
    description: "Komisyonsuz Freelancer Platformu",
    url: "https://frelancerturkiye.com",
    siteName: "Freelancer Türkiye",
    locale: "tr_TR",
    type: "website",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <Providers>
          <nav className="nav">
            <div className="container nav-content">
              <a href="/" className="logo">
                <span className="gradient-text">Freelancer</span> Türkiye
              </a>
              <div className="nav-links">
                <a href="/ilanlar">İş İlanları</a>
                <a href="/freelancerlar">Freelancer Bul</a>
                <button className="btn-primary">Giriş Yap</button>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="footer">
            <div className="container">
              <p>&copy; {new Date().getFullYear()} Freelancer Türkiye. Tüm hakları saklıdır.</p>
            </div>
          </footer>
        </Providers>

        <style jsx global>{`
          .nav {
            height: 80px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--glass-border);
            position: sticky;
            top: 0;
            background: rgba(10, 10, 12, 0.8);
            backdrop-filter: blur(12px);
            z-index: 1000;
          }
          .nav-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .nav-links {
            display: flex;
            gap: 32px;
            align-items: center;
          }
          .nav-links a {
            font-weight: 500;
            color: var(--text-muted);
            transition: color 0.3s ease;
          }
          .nav-links a:hover {
            color: var(--foreground);
          }
          .footer {
            padding: 40px 0;
            border-top: 1px solid var(--glass-border);
            text-align: center;
            color: var(--text-muted);
            margin-top: 80px;
          }
        `}</style>
      </body>
    </html>
  );
}
