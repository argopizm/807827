"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, Compass, MessageCircle, Plus, User } from "lucide-react";

const mobileBreakpoint = "(max-width: 800px)";

const links = [
  { href: "/", label: "Keşfet", icon: Compass },
  { href: "/ilanlar", label: "İlanlar", icon: BriefcaseBusiness },
  { href: "/ilan-ver", label: "İlan ver", icon: Plus },
  { href: "/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/profilim", label: "Profilim", icon: User },
];

function activeLink(path: string, href: string) {
  if (href === "/") return path === "/" || /^\/(kategoriler|profil|hizmetler|rehber)(\/|$)/.test(path);
  if (href === "/ilanlar") return /^\/(ilanlar|isler)(\/|$)/.test(path);
  if (href === "/profilim") return /^\/(profilim|hesabim|giris|onboarding|dogrulama|destek)(\/|$)/.test(path);
  return path === href || path.startsWith(href + "/");
}

export default function MobileNavigation() {
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== "authenticated" || pathname === "/giris") return;
    const mobile = window.matchMedia(mobileBreakpoint);
    let request: AbortController | undefined;

    async function refresh() {
      if (!mobile.matches || document.visibilityState !== "visible" || request) return;
      const controller = new AbortController();
      request = controller;
      try {
        const response = await fetch("/api/mesajlar?unread=1", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const result: { unread?: unknown } = await response.json();
        if (typeof result.unread === "number" && Number.isSafeInteger(result.unread) && result.unread >= 0) {
          if (!controller.signal.aborted) setUnread(result.unread);
        }
      } catch {
        // The tab remains usable if the unread counter is temporarily unavailable.
      } finally {
        request = undefined;
      }
    }

    void refresh();
    const interval = window.setInterval(refresh, 20_000);
    document.addEventListener("visibilitychange", refresh);
    mobile.addEventListener("change", refresh);
    return () => {
      request?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      mobile.removeEventListener("change", refresh);
    };
  }, [pathname, status]);

  return (
    <nav className="mobile-navigation" aria-label="Mobil gezinme">
      {links.map(({ href, label, icon: Icon }) => {
        const ownProfile = Boolean(session?.user?.username && pathname === "/profil/" + encodeURIComponent(session.user.username));
        const active = ownProfile ? href === "/profilim" : activeLink(pathname, href);
        const count = href === "/mesajlar" && status === "authenticated" ? unread : 0;
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            aria-label={count > 0 ? label + ", " + count + " okunmamış mesaj" : undefined}
          >
            <span className="mobile-navigation-icon">
              <Icon size={20} aria-hidden="true" />
              {count > 0 && <span className="mobile-navigation-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
