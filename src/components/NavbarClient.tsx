"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown, Briefcase, Code2 } from "lucide-react";

export default function NavbarClient() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Yükleniyor
  if (status === "loading") {
    return <div className="nav-avatar-skeleton" />;
  }

  // Giriş yapılmamış
  if (status === "unauthenticated") {
    return (
      <a href="/giris" className="btn-primary nav-login-btn" style={{ textDecoration: "none" }}>
        Giriş Yap
      </a>
    );
  }

  // Giriş yapılmış → Avatar + dropdown
  const avatar = session?.user?.image
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name ?? "user"}`;
  const name = session?.user?.name ?? "Kullanıcı";
  const firstName = name.split(" ")[0];

  return (
    <div className="nav-user-menu" ref={menuRef}>
      <button className="nav-avatar-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Hesap menüsü">
        <img src={avatar} alt={name} className="nav-avatar-img" />
        <span className="nav-avatar-name">{firstName}</span>
        <ChevronDown size={14} className={`nav-chevron ${menuOpen ? "open" : ""}`} />
      </button>

      {menuOpen && (
        <div className="nav-dropdown glass-card">
          <div className="nav-dropdown-header">
            <img src={avatar} alt={name} className="nav-dropdown-avatar" />
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
            <User size={15} /> Profilim
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
