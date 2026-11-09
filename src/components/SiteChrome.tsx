"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import NavbarClient from "./NavbarClient";
import MobileNavigation from "./MobileNavigation";
import "./site-chrome.css";

export default function SiteChrome({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  const authScreen = pathname === "/giris";
  return <div className="site-shell" data-auth={authScreen}>
    <a className="skip-link" href="#main-content">Ana içeriğe geç</a>
    <header className="site-header" data-testid="morph-header">
      <div className="chrome-topbar" inert={authScreen} aria-hidden={authScreen}>
        <div className="container"><span><strong>%0 platform komisyonu.</strong> Proje ücretini taraflar belirler.</span><Link href="/#nasil">Frenaw nasıl çalışır?</Link></div>
      </div>
      <nav className="chrome-nav" aria-label={authScreen ? "Frenaw ana sayfa" : "Ana gezinme"}>
        <div className="container chrome-content">
          <Link href="/" className="logo chrome-logo" aria-label="Frenaw ana sayfa"><span className="chrome-logo-inner"><span className="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" width="21" height="21"><path d="M6 20V5h13M6 12h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor"/></svg></span><span>Frenaw</span></span></Link>
          <div className="nav-links chrome-links" inert={authScreen} aria-hidden={authScreen}>
            <Link href="/kategoriler">Kategoriler</Link><Link href="/ilanlar">İş ilanları</Link><Link href="/hizmetler">Hizmetler</Link><Link href="/profil">Freelancer bul</Link><Link href="/ilan-ver" className="nav-cta">İlan ver</Link><div className="chrome-account-slot"><NavbarClient /></div>
          </div>
        </div>
      </nav>
    </header>
    <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>
    <div className="chrome-footer">{footer}</div>
    <MobileNavigation />
  </div>;
}
