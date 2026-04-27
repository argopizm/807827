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


      </body>
    </html>
  );
}
