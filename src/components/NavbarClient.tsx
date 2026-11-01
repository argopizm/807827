"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

export default function NavbarClient() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="nav-avatar-skeleton" />;
  }

  if (status === "unauthenticated") {
    return (
      <a href="/giris" className="btn-primary nav-login-btn" style={{ textDecoration: "none" }}>
        Giriş Yap
      </a>
    );
  }

  const avatar = session?.user?.image;
  const name = session?.user?.name ?? "Kullanıcı";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toLocaleUpperCase("tr");

  return (
    <div className="nav-user-menu" ref={menuRef}>
      <button className="nav-avatar-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Hesap menüsü">
        {avatar ? (
          <img src={avatar} alt={name} className="nav-avatar-img" />
        ) : (
          <span className="ava" style={{ width: 32, height: 32, fontSize: 13 }}>{initial}</span>
        )}
        <span className="nav-avatar-name">{firstName}</span>
        <ChevronDown size={14} className={`nav-chevron ${menuOpen ? "open" : ""}`} />
      </button>

      {menuOpen && (
        <div className="nav-dropdown glass-card">
          <div className="nav-dropdown-header">
            {avatar ? (
              <img src={avatar} alt={name} className="nav-dropdown-avatar" />
            ) : (
              <span className="ava" style={{ width: 38, height: 38, fontSize: 15 }}>{initial}</span>
            )}
            <div>
              <p className="nav-dropdown-name">{name}</p>
              <p className="nav-dropdown-email">{session?.user?.email}</p>
            </div>
          </div>
          <hr className="nav-dropdown-divider" />
          <a href="/hesabim" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
            <Settings size={15} /> Hesabım
          </a>
          <a href="/profil" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
            <User size={15} /> Freelancer Bul
          </a>
          <hr className="nav-dropdown-divider" />
          <button
            className="nav-dropdown-item danger"
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
          >
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
