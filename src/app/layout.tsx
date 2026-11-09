import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "./design.css";
import { Providers } from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";
import { isIndexableSite, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Frenaw | Komisyonsuz freelancer platformu", template: "%s | Frenaw" },
  description: "Frenaw, Türkiye’de işverenleri ve freelancer’ları komisyon almadan buluşturur.",
  openGraph: {
    siteName: "Frenaw",
    locale: "tr_TR",
    type: "website",
  },
  robots: { index: isIndexableSite, follow: isIndexableSite },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Frenaw ana sayfa">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="21" height="21">
          <path d="M6 20V5h13M6 12h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18.5" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span>Frenaw</span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head><link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/inter-latin-ext.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head>
      <body>
        <Providers>
          <SiteChrome footer={
          <footer className="footer">
            <div className="container">
              <div className="footer-grid">
                <div>
                  <Logo />
                  <p className="footer-about">
                    Türkiye’de işverenleri ve freelancer’ları komisyon almadan buluşturan platform.
                  </p>
                </div>
                <div>
                  <h2>Keşfet</h2>
                  <ul>
                    <li><Link href="/kategoriler">Kategoriler</Link></li>
                    <li><Link href="/ilanlar">İş ilanları</Link></li>
                    <li><Link href="/profil">Freelancer bul</Link></li>
                    <li><Link href="/hizmetler">Hizmetler</Link></li>
                    <li><Link href="/rehber">Freelance rehberi</Link></li>
                  </ul>
                </div>
                <div>
                  <h2>Yardım</h2>
                  <ul>
                    <li><Link href="/destek">Destek merkezi</Link></li>
                    <li><Link href="/#sss">Sıkça sorulan sorular</Link></li>
                    <li><Link href="/hesabim" prefetch={false}>Hesabım</Link></li>
                  </ul>
                </div>
                <div>
                  <h2>Yasal</h2>
                  <ul>
                    <li><Link href="/kullanim-kosullari">Kullanım koşulları</Link></li>
                    <li><Link href="/gizlilik">Gizlilik ve aydınlatma</Link></li>
                    <li><Link href="/cerezler">Çerez politikası</Link></li>
                    <li><Link href="/kvkk-basvuru">KVKK başvurusu</Link></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <span>&copy; {new Date().getFullYear()} Frenaw</span>
                <span>Türkiye’de geliştirildi.</span>
              </div>
            </div>
          </footer>
          }>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
