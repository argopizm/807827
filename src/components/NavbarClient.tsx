"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown, LifeBuoy, MessageCircle } from "lucide-react";

export default function NavbarClient() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  if (status === "loading") return <span className="nav-avatar-skeleton" aria-hidden="true" />;

  if (status === "unauthenticated") {
    return <Link href="/giris" className="btn-primary nav-login-btn">Giriş yap</Link>;
  }

  const name = session?.user?.name?.trim() || "Kullanıcı";
  const firstName = name;
  const initial = firstName.charAt(0).toLocaleUpperCase("tr");
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="nav-user-controls">
      <Link href="/mesajlar" prefetch={false} className="nav-desktop-inbox" aria-label="Mesajlar">
        <MessageCircle size={19} aria-hidden="true" />
      </Link>
      <div className="nav-user-menu" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          className="nav-avatar-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Hesap menüsü"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "account-navigation" : undefined}
        >
          <span className="ava nav-avatar-initial" aria-hidden="true">{initial}</span>
          <span className="nav-avatar-name">{firstName}</span>
          <ChevronDown size={14} className={'nav-chevron' + (menuOpen ? ' open' : '')} aria-hidden="true" />
        </button>

        {menuOpen && (
          <div id="account-navigation" className="nav-dropdown glass-card">
            <div className="nav-dropdown-header">
              <span className="ava nav-avatar-initial" aria-hidden="true">{initial}</span>
              <p className="nav-dropdown-name">{name}</p>
            </div>
            <hr className="nav-dropdown-divider" />
            <Link href="/profilim" prefetch={false} className="nav-dropdown-item" onClick={closeMenu}><User size={17} aria-hidden="true"/> Profilim</Link>
            <Link href="/hesabim" prefetch={false} className="nav-dropdown-item" onClick={closeMenu}>
              <Settings size={17} aria-hidden="true" /> Hesabım
            </Link>
            <Link href="/profil" className="nav-dropdown-item" onClick={closeMenu}>
              <User size={17} aria-hidden="true" /> Freelancer bul
            </Link>
            <Link href="/destek" prefetch={false} className="nav-dropdown-item" onClick={closeMenu}>
              <LifeBuoy size={17} aria-hidden="true" /> Destek merkezi
            </Link>
            <hr className="nav-dropdown-divider" />
            <button
              type="button"
              className="nav-dropdown-item danger"
              onClick={() => { closeMenu(); void signOut({ redirectTo: "/" }); }}
            >
              <LogOut size={17} aria-hidden="true" /> Çıkış yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
