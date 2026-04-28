"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  User, Mail, ShieldCheck, LogOut, Save, Briefcase,
  Fingerprint, Calendar, Loader2, Edit3, CheckCircle2,
  Code2, FileText, Star, Plus, Settings, ChevronRight, Link2
} from "lucide-react";

type UserType = "freelancer" | "employer" | null;
type Tab = "genel" | "profil" | "dogrulama" | "guvenlik";
type FreelancerTab = "dashboard" | "profil" | "ilanlar" | "dogrulama";
type EmployerTab = "dashboard" | "ilanlarim" | "profil" | "guvenlik";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState<UserType>(null);
  const [typeLoaded, setTypeLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "success" | "error">("idle");
  const [flTab, setFlTab] = useState<FreelancerTab>("dashboard");
  const [empTab, setEmpTab] = useState<EmployerTab>("dashboard");

  useEffect(() => {
    // Her durumda user type yükle — session bağımsız
    const timer = setTimeout(() => setTypeLoaded(true), 6000); // 6s timeout
    fetch("/api/user/type")
      .then(r => r.ok ? r.json() : Promise.resolve({ user_type: null }))
      .then((d: { user_type: string | null }) => {
        setUserType((d.user_type as UserType) ?? null);
        setTypeLoaded(true);
        clearTimeout(timer);
      })
      .catch(() => { setTypeLoaded(true); clearTimeout(timer); });
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setTimeout(() => { setVerifyLoading(false); setVerifyStatus("success"); }, 2000);
  };

  // Session yüklenirken ve user type gelmemişse bekle (max 6 saniye)
  if (status === "loading" && !typeLoaded) {
    return <div className="auth-loading"><Loader2 className="spin" size={40} /><p>Yükleniyor...</p></div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <ShieldCheck size={48} color="var(--primary)" />
          <h2>Giriş Yapmanız Gerekiyor</h2>
          <p>Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
          <a href="/giris" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}>Giriş Yap</a>
        </div>
      </div>
    );
  }

  // Onboarding yönlendirmesi
  if (!userType && !loadingType) {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <Code2 size={48} color="var(--primary)" />
          <h2>Hesabınızı Tamamlayın</h2>
          <p>Panelinizi kişiselleştirmek için devam edin.</p>
          <a href="/onboarding" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}>
            Devam Et <ChevronRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  const avatar = session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`;
  const firstName = session?.user?.name?.split(" ")[0] ?? "Kullanıcı";

  // ─── FREELANCER PANELİ ───
  if (userType === "freelancer") {
    const tabs: { key: FreelancerTab; icon: React.ReactNode; label: string }[] = [
      { key: "dashboard", icon: <Code2 size={16} />, label: "Özet" },
      { key: "profil", icon: <User size={16} />, label: "Profilim" },
      { key: "ilanlar", icon: <FileText size={16} />, label: "Başvurularım" },
      { key: "dogrulama", icon: <ShieldCheck size={16} />, label: "Kimlik Doğrula" },
    ];

    return (
      <div className="hesabim container">
        <div className="hesabim-header">
          <div className="user-greeting">
            <img src={avatar} alt="avatar" className="hesabim-avatar" />
            <div>
              <h1>Merhaba, <span className="gradient-text">{firstName}</span> 👋</h1>
              <p className="user-type-badge freelancer-badge"><Code2 size={12} /> Freelancer</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>

        <div className="hesabim-layout">
          <aside className="hesabim-sidebar glass-card">
            {tabs.map(t => (
              <button key={t.key} className={`sidebar-tab ${flTab === t.key ? "active" : ""}`} onClick={() => setFlTab(t.key)}>
                {t.icon}{t.label}
              </button>
            ))}
            <hr className="divider" style={{ margin: "8px 0" }} />
            <button className="sidebar-tab" onClick={() => window.location.href = "/ilanlar"}>
              <FileText size={16} /> İş İlanlarına Bak
            </button>
          </aside>

          <main className="hesabim-content glass-card">
            {flTab === "dashboard" && (
              <div className="tab-content">
                <div className="tab-header"><Code2 size={20} /><h2>Freelancer Özet</h2></div>
                <div className="dashboard-stats">
                  {[
                    { icon: <FileText size={24} />, val: "0", label: "Başvuru" },
                    { icon: <Star size={24} />, val: "–", label: "Puan" },
                    { icon: <CheckCircle2 size={24} />, val: "0", label: "Tamamlanan" },
                  ].map(s => (
                    <div key={s.label} className="glass-card dash-stat">
                      <div className="dash-icon">{s.icon}</div>
                      <strong className="gradient-text">{s.val}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dash-actions">
                  <a href="/ilanlar" className="btn-primary dash-action-btn"><FileText size={16} /> İş İlanlarını Gör</a>
                  <button className="btn-secondary dash-action-btn" onClick={() => setFlTab("profil")}><Edit3 size={16} /> Profilimi Düzenle</button>
                </div>
                {!verifyStatus && (
                  <div className="dash-notice glass-card">
                    <ShieldCheck size={18} color="var(--warning)" />
                    <p>TC Kimliğinizi doğrulayarak <strong>Onaylı Profil</strong> rozeti kazanın ve daha fazla iş alın.</p>
                    <button className="btn-secondary" onClick={() => setFlTab("dogrulama")}>Doğrula <ChevronRight size={14} /></button>
                  </div>
                )}
              </div>
            )}

            {flTab === "profil" && (
              <div className="tab-content">
                <div className="tab-header"><Edit3 size={20} /><h2>Profil Bilgilerini Düzenle</h2></div>
                <form className="settings-form" onSubmit={handleSave}>
                  <div className="settings-avatar-row">
                    <img src={avatar} alt="avatar" className="settings-avatar" />
                    <div>
                      <p className="settings-label">Profil Fotoğrafı</p>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Google/kayıt fotoğrafınızdan alınır.</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group"><label><User size={14} /> Ad Soyad</label><input type="text" defaultValue={session?.user?.name || ""} /></div>
                    <div className="input-group"><label><Mail size={14} /> E-posta</label><input type="email" defaultValue={session?.user?.email || ""} disabled style={{ opacity: 0.5 }} /></div>
                  </div>
                  <div className="input-group"><label>Kullanıcı Adı</label><input type="text" placeholder="@kullanici_adi" /></div>
                  <div className="input-group"><label>Uzmanlık Alanı</label><input type="text" placeholder="Full Stack Developer, UI/UX Tasarımcı..." /></div>
                  <div className="input-group"><label>Hakkımda</label><textarea rows={4} placeholder="Kendinizi tanıtın, uzmanlık alanlarınızı ve deneyimlerinizi paylaşın..." /></div>
                  <div className="form-row">
                    <div className="input-group"><label><Link size={14} /> WhatsApp</label><input type="text" placeholder="905XXXXXXXXX" /></div>
                    <div className="input-group"><label>Discord</label><input type="text" placeholder="kullanici#1234" /></div>
                  </div>
                  <div className="input-group"><label>Portfolyo / Web Sitesi</label><input type="url" placeholder="https://portfolyonuz.com" /></div>
                  <button type="submit" className="btn-primary save-btn">
                    {saved ? <><CheckCircle2 size={18} /> Kaydedildi!</> : <><Save size={18} /> Değişiklikleri Kaydet</>}
                  </button>
                </form>
              </div>
            )}

            {flTab === "ilanlar" && (
              <div className="tab-content">
                <div className="tab-header"><FileText size={20} /><h2>Başvurularım</h2></div>
                <div className="empty-state">
                  <FileText size={48} style={{ color: "var(--text-muted)" }} />
                  <h3>Henüz başvuru yok</h3>
                  <p>İş ilanlarına göz atın ve el sıkışma talebi gönderin.</p>
                  <a href="/ilanlar" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}>İş İlanlarına Bak</a>
                </div>
              </div>
            )}

            {flTab === "dogrulama" && (
              <div className="tab-content">
                <div className="tab-header"><ShieldCheck size={20} /><h2>Kimlik Doğrulama</h2></div>
                {verifyStatus === "success" ? (
                  <div className="verify-success-inline">
                    <CheckCircle2 size={48} color="var(--success)" />
                    <h3>Kimliğiniz Doğrulandı!</h3>
                    <p>Profilinize <strong>✅ Kimlik Doğrulanmış</strong> rozeti eklendi.</p>
                  </div>
                ) : (
                  <>
                    <div className="verify-info-box"><p>TC Kimlik numaranızı doğrulayın, <strong>&quot;Onaylı Profil&quot;</strong> rozeti kazanın. Bilgiler sistemimizde saklanmaz.</p></div>
                    <form onSubmit={handleVerify} className="settings-form">
                      <div className="form-row">
                        <div className="input-group"><label>Ad (Büyük Harf)</label><input type="text" placeholder="ALİ" required /></div>
                        <div className="input-group"><label>Soyad (Büyük Harf)</label><input type="text" placeholder="YILMAZ" required /></div>
                      </div>
                      <div className="input-group"><label><Fingerprint size={14} /> TC Kimlik No</label><input type="text" maxLength={11} placeholder="12345678901" required /></div>
                      <div className="input-group"><label><Calendar size={14} /> Doğum Yılı</label><input type="number" min={1900} max={2010} placeholder="1995" required /></div>
                      <button type="submit" className="btn-primary save-btn" disabled={verifyLoading}>
                        {verifyLoading ? <><Loader2 className="spin" size={18} /> Doğrulanıyor...</> : <><ShieldCheck size={18} /> Kimliği Doğrula</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ─── İŞVEREN PANELİ ───
  const empTabs: { key: EmployerTab; icon: React.ReactNode; label: string }[] = [
    { key: "dashboard", icon: <Briefcase size={16} />, label: "Özet" },
    { key: "ilanlarim", icon: <FileText size={16} />, label: "İlanlarım" },
    { key: "profil", icon: <User size={16} />, label: "Profilim" },
    { key: "guvenlik", icon: <Settings size={16} />, label: "Güvenlik" },
  ];

  return (
    <div className="hesabim container">
      <div className="hesabim-header">
        <div className="user-greeting">
          <img src={avatar} alt="avatar" className="hesabim-avatar" />
          <div>
            <h1>Merhaba, <span className="gradient-text">{firstName}</span> 👋</h1>
            <p className="user-type-badge employer-badge"><Briefcase size={12} /> İşveren</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut size={16} /> Çıkış Yap
        </button>
      </div>

      <div className="hesabim-layout">
        <aside className="hesabim-sidebar glass-card">
          {empTabs.map(t => (
            <button key={t.key} className={`sidebar-tab ${empTab === t.key ? "active" : ""}`} onClick={() => setEmpTab(t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
          <hr className="divider" style={{ margin: "8px 0" }} />
          <button className="sidebar-tab" onClick={() => window.location.href = "/profil"}>
            <User size={16} /> Freelancer Bul
          </button>
        </aside>

        <main className="hesabim-content glass-card">
          {empTab === "dashboard" && (
            <div className="tab-content">
              <div className="tab-header"><Briefcase size={20} /><h2>İşveren Özet</h2></div>
              <div className="dashboard-stats">
                {[
                  { icon: <FileText size={24} />, val: "0", label: "Aktif İlan" },
                  { icon: <CheckCircle2 size={24} />, val: "0", label: "Tamamlanan" },
                  { icon: <User size={24} />, val: "0", label: "Toplam Başvuru" },
                ].map(s => (
                  <div key={s.label} className="glass-card dash-stat">
                    <div className="dash-icon">{s.icon}</div>
                    <strong className="gradient-text">{s.val}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="dash-actions">
                <a href="/ilan-ver" className="btn-primary dash-action-btn"><Plus size={16} /> Yeni İlan Ver</a>
                <a href="/profil" className="btn-secondary dash-action-btn"><User size={16} /> Freelancer Bul</a>
              </div>
            </div>
          )}

          {empTab === "ilanlarim" && (
            <div className="tab-content">
              <div className="tab-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FileText size={20} /><h2>İlanlarım</h2></div>
                <a href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "6px", padding: "8px 16px", fontSize: "14px" }}>
                  <Plus size={16} /> Yeni İlan
                </a>
              </div>
              <div className="empty-state">
                <Briefcase size={48} style={{ color: "var(--text-muted)" }} />
                <h3>Henüz ilan yok</h3>
                <p>İlk ilanınızı verin, freelancer başvurularını bekleyin.</p>
                <a href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}>
                  <Plus size={16} /> İlan Ver
                </a>
              </div>
            </div>
          )}

          {empTab === "profil" && (
            <div className="tab-content">
              <div className="tab-header"><Edit3 size={20} /><h2>Şirket / Kişisel Profil</h2></div>
              <form className="settings-form" onSubmit={handleSave}>
                <div className="settings-avatar-row">
                  <img src={avatar} alt="avatar" className="settings-avatar" />
                  <div>
                    <p className="settings-label">Profil Fotoğrafı</p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Google/kayıt fotoğrafınızdan alınır.</p>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label><User size={14} /> Ad Soyad</label><input type="text" defaultValue={session?.user?.name || ""} /></div>
                  <div className="input-group"><label><Mail size={14} /> E-posta</label><input type="email" defaultValue={session?.user?.email || ""} disabled style={{ opacity: 0.5 }} /></div>
                </div>
                <div className="input-group"><label>Şirket Adı (isteğe bağlı)</label><input type="text" placeholder="Şirket Adı A.Ş." /></div>
                <div className="input-group"><label>Hakkında</label><textarea rows={3} placeholder="Şirketiniz veya kendiniz hakkında..." /></div>
                <button type="submit" className="btn-primary save-btn">
                  {saved ? <><CheckCircle2 size={18} /> Kaydedildi!</> : <><Save size={18} /> Kaydet</>}
                </button>
              </form>
            </div>
          )}

          {empTab === "guvenlik" && (
            <div className="tab-content">
              <div className="tab-header"><Settings size={20} /><h2>Güvenlik & Hesap</h2></div>
              <div className="settings-form">
                <div className="danger-zone" style={{ marginTop: "8px" }}>
                  <h3 style={{ color: "var(--accent)" }}>Tehlikeli Bölge</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Bu işlemler geri alınamaz.</p>
                  <button className="danger-btn" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut size={16} /> Tüm Cihazlardan Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
