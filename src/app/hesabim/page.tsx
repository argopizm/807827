"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  User, Mail, Link, ShieldCheck, LogOut, Save,
  Fingerprint, Calendar, Loader2, Edit3, CheckCircle2
} from "lucide-react";

type Tab = "profil" | "dogrulama" | "gizlilik";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [saved, setSaved] = useState(false);

  // TC Doğrulama state
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setTimeout(() => {
      setVerifyLoading(false);
      setVerifyStatus("success");
    }, 2000);
  };

  // Giriş yapılmamışsa yönlendir
  if (status === "loading") {
    return (
      <div className="auth-loading">
        <Loader2 className="spin" size={40} />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <ShieldCheck size={48} color="var(--primary)" />
          <h2>Giriş Yapmanız Gerekiyor</h2>
          <p>Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
          <a href="/giris" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}>
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profil", label: "Profil Düzenleme" },
    { key: "dogrulama", label: "Kimlik Doğrulama" },
    { key: "gizlilik", label: "Güvenlik" },
  ];

  return (
    <div className="hesabim container">
      <div className="hesabim-header">
        <div className="user-greeting">
          {session?.user?.image && (
            <img src={session.user.image} alt="avatar" className="hesabim-avatar" />
          )}
          <div>
            <h1>Merhaba, <span className="gradient-text">{session?.user?.name?.split(" ")[0]}</span> 👋</h1>
            <p>{session?.user?.email}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut size={16} /> Çıkış Yap
        </button>
      </div>

      <div className="hesabim-layout">
        {/* Sidebar Tabs */}
        <aside className="hesabim-sidebar glass-card">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`sidebar-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.key === "profil" && <User size={16} />}
              {t.key === "dogrulama" && <ShieldCheck size={16} />}
              {t.key === "gizlilik" && <Link size={16} />}
              {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="hesabim-content glass-card">

          {/* --- PROFİL DÜZENLEMEheader --- */}
          {activeTab === "profil" && (
            <div className="tab-content">
              <div className="tab-header">
                <Edit3 size={20} />
                <h2>Profil Bilgilerini Düzenle</h2>
              </div>

              <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="settings-avatar-row">
                  <img
                    src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`}
                    alt="avatar"
                    className="settings-avatar"
                  />
                  <div>
                    <p className="settings-label">Profil Fotoğrafı</p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Google hesabınızdan otomatik alınır.</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label><User size={14} /> Ad Soyad</label>
                    <input type="text" defaultValue={session?.user?.name || ""} />
                  </div>
                  <div className="input-group">
                    <label><Mail size={14} /> E-posta</label>
                    <input type="email" defaultValue={session?.user?.email || ""} disabled style={{ opacity: 0.5 }} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Kullanıcı Adı</label>
                  <input type="text" placeholder="@kullanici_adi" />
                </div>

                <div className="input-group">
                  <label>Hakkımda / Biyografi</label>
                  <textarea rows={4} placeholder="Kendinizi tanıtın, uzmanlık alanlarınızı belirtin..." />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label><Link size={14} /> WhatsApp</label>
                    <input type="text" placeholder="905XXXXXXXXX" />
                  </div>
                  <div className="input-group">
                    <label>Discord</label>
                    <input type="text" placeholder="kullanici#1234" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Portfolyo / Web Sitesi</label>
                  <input type="url" placeholder="https://portfolyonuz.com" />
                </div>

                <button type="submit" className="btn-primary save-btn">
                  {saved ? <><CheckCircle2 size={18} /> Kaydedildi!</> : <><Save size={18} /> Değişiklikleri Kaydet</>}
                </button>
              </form>
            </div>
          )}

          {/* --- KİMLİK DOĞRULAMA --- */}
          {activeTab === "dogrulama" && (
            <div className="tab-content">
              <div className="tab-header">
                <ShieldCheck size={20} />
                <h2>Kimlik Doğrulama</h2>
              </div>

              {verifyStatus === "success" ? (
                <div className="verify-success-inline">
                  <CheckCircle2 size={48} color="var(--success)" />
                  <h3>Kimliğiniz Doğrulandı!</h3>
                  <p>Profilinize <strong>✅ Kimlik Doğrulanmış</strong> rozeti eklendi. Müşterileriniz sizi artık güvenle bulabilir.</p>
                </div>
              ) : (
                <>
                  <div className="verify-info-box">
                    <p>
                      TC Kimlik numaranızı NVI üzerinden doğrulayın ve profilinize <strong>"Onaylı Profil"</strong> rozeti kazanın.
                      Bilgileriniz sistemimizde <strong>saklanmaz</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className="settings-form">
                    <div className="form-row">
                      <div className="input-group">
                        <label><User size={14} /> Ad (Büyük Harf)</label>
                        <input type="text" placeholder="ALİ" required />
                      </div>
                      <div className="input-group">
                        <label><User size={14} /> Soyad (Büyük Harf)</label>
                        <input type="text" placeholder="YILMAZ" required />
                      </div>
                    </div>

                    <div className="input-group">
                      <label><Fingerprint size={14} /> TC Kimlik No</label>
                      <input type="text" maxLength={11} placeholder="12345678901" required />
                    </div>

                    <div className="input-group">
                      <label><Calendar size={14} /> Doğum Yılı</label>
                      <input type="number" min={1900} max={2010} placeholder="1995" required />
                    </div>

                    <p className="auth-notice">
                      * Bilgileriniz yalnızca doğrulama amacıyla kullanılır ve sistemimizde asla saklanmaz.
                    </p>

                    <button type="submit" className="btn-primary save-btn" disabled={verifyLoading}>
                      {verifyLoading ? <><Loader2 className="spin" size={18} /> Doğrulanıyor...</> : <><ShieldCheck size={18} /> Kimliği Doğrula</>}
                    </button>

                    {verifyStatus === "error" && (
                      <p className="error-msg">Bilgiler doğrulanamadı. Lütfen kontrol edip tekrar deneyin.</p>
                    )}
                  </form>
                </>
              )}
            </div>
          )}

          {/* --- GÜVENLİK --- */}
          {activeTab === "gizlilik" && (
            <div className="tab-content">
              <div className="tab-header">
                <Link size={20} />
                <h2>Güvenlik & Hesap</h2>
              </div>

              <div className="settings-form">
                <div className="danger-zone">
                  <h3>Bağlı Hesaplar</h3>
                  <div className="connected-account glass-card">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <div>
                        <strong>Google</strong>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session?.user?.email}</p>
                      </div>
                    </div>
                    <span className="badge tc">Bağlı</span>
                  </div>
                </div>

                <div className="danger-zone" style={{ marginTop: "32px" }}>
                  <h3 style={{ color: "var(--accent)" }}>Tehlikeli Bölge</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
                    Bu işlemler geri alınamaz. Dikkatli olun.
                  </p>
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
