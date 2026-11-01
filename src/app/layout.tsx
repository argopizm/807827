import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./design.css";
import { Providers } from "@/components/Providers";
import NavbarClient from "@/components/NavbarClient";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Freelancer Türkiye | Komisyonsuz Freelancer Platformu",
  description: "Türkiye'nin en hafif, hızlı ve komisyonsuz freelancer platformu. İş ilanları açın, teklif verin ve güvenle el sıkışın.",
  keywords: ["freelancer", "türkiye", "komisyonsuz", "iş ilanları", "yazılım", "tasarım", "çeviri"],
  openGraph: {
    title: "Freelancer Türkiye",
    description: "Komisyonsuz Freelancer Platformu",
    url: "https://807827.pages.dev",
    siteName: "Freelancer Türkiye",
    locale: "tr_TR",
    type: "website",
  },
};

function Logo() {
  return (
    <a href="/" className="logo" aria-label="Freelancer Türkiye ana sayfa">
      <span className="logo-mark">FT</span>
      <span>Freelancer <span className="logo-sub">Türkiye</span></span>
    </a>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <Providers>
          <div className="topbar">
            <div className="container">
              <span><strong>%0 komisyon.</strong> Kazandığınızın tamamı sizin.</span>
              <span><a href="/ilan-ver">İşveren misiniz? Ücretsiz ilan verin →</a></span>
            </div>
          </div>
          <nav className="nav">
            <div className="container nav-content">
              <Logo />
              <div className="nav-links">
                <a href="/ilanlar">İş İlanları</a>
                <a href="/profil">Freelancer Bul</a>
                <a href="/ilan-ver" className="nav-cta">İlan Ver</a>
                {/* Giriş durumuna göre navbar değişir — NavbarClient */}
                <NavbarClient />
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="footer">
            <div className="container">
              <div className="footer-grid">
                <div>
                  <Logo />
                  <p className="footer-about">
                    İşverenlerle freelancer&apos;ları aracısız buluşturan, komisyon almayan yerli platform.
                  </p>
                </div>
                <div>
                  <h4>Platform</h4>
                  <ul>
                    <li><a href="/ilanlar">İş İlanları</a></li>
                    <li><a href="/profil">Freelancer Bul</a></li>
                    <li><a href="/ilan-ver">İlan Ver</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Hesap</h4>
                  <ul>
                    <li><a href="/giris">Giriş Yap</a></li>
                    <li><a href="/giris">Kayıt Ol</a></li>
                    <li><a href="/hesabim">Hesabım</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Destek</h4>
                  <ul>
                    <li><a href="/#sss">Sıkça Sorulanlar</a></li>
                    <li><a href="/#nasil">Nasıl Çalışır?</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <span>&copy; {new Date().getFullYear()} Freelancer Türkiye. Tüm hakları saklıdır.</span>
                <span>Türkiye&apos;de geliştirildi.</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
