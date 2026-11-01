"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  User, Mail, ShieldCheck, LogOut, Save, Briefcase,
  Fingerprint, Calendar, Loader2, Edit3, CheckCircle2,
  Code2, FileText, Star, Plus, Settings, ChevronRight, ExternalLink
} from "lucide-react";

type UserType = "freelancer" | "employer" | null;
type FreelancerTab = "dashboard" | "profil" | "ilanlar" | "dogrulama";
type EmployerTab = "dashboard" | "ilanlarim" | "profil" | "guvenlik";

interface ProfileRecord {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  title: string | null;
  category: string | null;
  skills: string | null;
  bio: string | null;
  avatar_url: string | null;
  portfolio_url: string | null;
  contact_links: string | null;
  user_type: UserType;
  tc_verified: number;
  total_jobs_completed: number;
  rating_avg: number;
}

interface JobSummary {
  id: string;
  title: string;
  category: string;
  budget_range: string;
  status: string;
  proposals: number;
}

interface ApplicationSummary {
  id: string;
  job_id: string;
  status: string;
  job_title: string;
  job_budget: string;
  job_category: string;
}

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState<UserType>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [myJobs, setMyJobs] = useState<JobSummary[]>([]);
  const [myApps, setMyApps] = useState<ApplicationSummary[]>([]);
  const [incomingProposals, setIncomingProposals] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [tcVerified, setTcVerified] = useState(false);

  const [flTab, setFlTab] = useState<FreelancerTab>("dashboard");
  const [empTab, setEmpTab] = useState<EmployerTab>("dashboard");

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Yazılım");
  const [skillsStr, setSkillsStr] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [discord, setDiscord] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [verifyFirstName, setVerifyFirstName] = useState("");
  const [verifyLastName, setVerifyLastName] = useState("");
  const [verifyBirthYear, setVerifyBirthYear] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          const u: ProfileRecord = d.user;
          setProfile(u);
          setUserType(u.user_type ?? null);
          setTcVerified(!!u.tc_verified);
          setFullName(u.full_name ?? session?.user?.name ?? "");
          setUsername(u.username ?? "");
          setTitle(u.title ?? "");
          setCategory(u.category || "Yazılım");
          setBio(u.bio ?? "");
          try {
            const sk = JSON.parse(u.skills ?? "[]");
            setSkillsStr(Array.isArray(sk) ? sk.join(", ") : "");
          } catch {
            setSkillsStr("");
          }
          try {
            const lk = JSON.parse(u.contact_links ?? "{}");
            setWhatsapp(lk.whatsapp ?? "");
            setDiscord(lk.discord ?? "");
            setPortfolio(lk.portfolio ?? u.portfolio_url ?? "");
          } catch {
            setPortfolio(u.portfolio_url ?? "");
          }
        }
        if (Array.isArray(d?.myJobs)) setMyJobs(d.myJobs);
        if (Array.isArray(d?.myApplications)) setMyApps(d.myApplications);
        setIncomingProposals(Number(d?.incomingProposals ?? 0));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [status, session?.user?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username,
          title,
          category,
          skills: skillsStr,
          bio,
          whatsapp,
          discord,
          portfolio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Kaydedilemedi.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setSaveError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_tc",
          tcNo,
          firstName: verifyFirstName,
          lastName: verifyLastName,
          birthYear: Number(verifyBirthYear),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Doğrulama başarısız.");
      } else {
        setTcVerified(true);
      }
    } catch {
      setVerifyError("Bağlantı hatası.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && !loaded)) {
    return (
      <div className="auth-loading">
        <Loader2 className="spin" size={36} />
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
          <a href="/giris" className="btn-primary" style={{ textDecoration: "none" }}>Giriş Yap</a>
        </div>
      </div>
    );
  }

  if (loaded && !userType) {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <Code2 size={48} color="var(--primary)" />
          <h2>Hesabınızı Tamamlayın</h2>
          <p>Panelinizi kişiselleştirmek için hesap türünüzü seçin.</p>
          <a href="/onboarding" className="btn-primary" style={{ textDecoration: "none" }}>
            Devam Et <ChevronRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  const displayName = fullName || session?.user?.name || "Kullanıcı";
  const firstName = displayName.split(" ")[0];
  const initial = firstName.charAt(0).toLocaleUpperCase("tr");

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
            <span className="ava lg">{initial}</span>
            <div>
              <h1>Merhaba, <span className="gradient-text">{firstName}</span></h1>
              <p className="user-type-badge freelancer-badge"><Code2 size={12} /> Freelancer</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {username && (
              <a href={`/profil/${username}`} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 14 }}>
                Açık Profilim <ExternalLink size={14} />
              </a>
            )}
            <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut size={16} /> Çıkış Yap
            </button>
          </div>
        </div>

        <div className="hesabim-layout">
          <aside className="hesabim-sidebar glass-card">
            {tabs.map((t) => (
              <button key={t.key} className={`sidebar-tab ${flTab === t.key ? "active" : ""}`} onClick={() => setFlTab(t.key)}>
                {t.icon}{t.label}
              </button>
            ))}
            <hr className="divider" style={{ margin: "8px 0" }} />
            <a href="/ilanlar" className="sidebar-tab"><FileText size={16} /> İş İlanlarına Bak</a>
          </aside>

          <div className="hesabim-content glass-card">
            {flTab === "dashboard" && (
              <div className="tab-content">
                <div className="tab-header"><Code2 size={20} /><h2>Freelancer Özet</h2></div>
                <div className="dashboard-stats">
                  <div className="glass-card dash-stat">
                    <div className="dash-icon"><FileText size={24} /></div>
                    <strong className="gradient-text">{myApps.length}</strong>
                    <span>Başvuru</span>
                  </div>
                  <div className="glass-card dash-stat">
                    <div className="dash-icon"><Star size={24} /></div>
                    <strong className="gradient-text">
                      {profile?.rating_avg && profile.rating_avg > 0 ? profile.rating_avg.toFixed(1).replace(".", ",") : "–"}
                    </strong>
                    <span>Puan</span>
                  </div>
                  <div className="glass-card dash-stat">
                    <div className="dash-icon"><CheckCircle2 size={24} /></div>
                    <strong className="gradient-text">{profile?.total_jobs_completed ?? 0}</strong>
                    <span>Tamamlanan</span>
                  </div>
                </div>
                <div className="dash-actions">
                  <a href="/ilanlar" className="btn-primary dash-action-btn"><FileText size={16} /> İş İlanlarını Gör</a>
                  <button className="btn-secondary dash-action-btn" onClick={() => setFlTab("profil")}><Edit3 size={16} /> Profilimi Düzenle</button>
                </div>
                {!tcVerified && (
                  <div className="dash-notice glass-card">
                    <ShieldCheck size={18} color="var(--warning)" />
                    <p>TC Kimliğinizi doğrulayarak <strong>Kimlik Onaylı</strong> rozeti kazanın.</p>
                    <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "13px" }} onClick={() => setFlTab("dogrulama")}>
                      Doğrula <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {flTab === "profil" && (
              <div className="tab-content">
                <div className="tab-header"><Edit3 size={20} /><h2>Profil Bilgilerini Düzenle</h2></div>
                {saveError && <p className="auth-msg error" style={{ marginBottom: 16 }}>{saveError}</p>}
                <form className="settings-form" onSubmit={handleSave}>
                  <div className="form-row">
                    <div className="input-group">
                      <label><User size={14} /> Ad Soyad</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label><Mail size={14} /> E-posta</label>
                      <input type="email" value={session?.user?.email || ""} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Kullanıcı Adı</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="kullanici_adi" required />
                    </div>
                    <div className="input-group">
                      <label>Kategori</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Yazılım">Yazılım</option>
                        <option value="Tasarım">Tasarım</option>
                        <option value="Pazarlama">Pazarlama</option>
                        <option value="Çeviri">Çeviri</option>
                        <option value="Video">Video</option>
                        <option value="Seslendirme">Seslendirme</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Uzmanlık Unvanı</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Senior Full Stack Developer" />
                  </div>
                  <div className="input-group">
                    <label>Yetenekler (virgülle ayırın)</label>
                    <input type="text" value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="React, Node.js, TypeScript" />
                  </div>
                  <div className="input-group">
                    <label>Hakkımda</label>
                    <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Deneyiminizi ve uzmanlık alanlarınızı anlatın..." />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>WhatsApp (Ülke koduyla)</label>
                      <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="905XXXXXXXXX" />
                    </div>
                    <div className="input-group">
                      <label>Discord</label>
                      <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="kullanici" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Portfolyo Web Sitesi</label>
                    <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://portfolyonuz.com" />
                  </div>
                  <button type="submit" className="btn-primary save-btn" disabled={saving}>
                    {saving ? <><Loader2 className="spin" size={18} /> Kaydediliyor...</> : saved ? <><CheckCircle2 size={18} /> Kaydedildi!</> : <><Save size={18} /> Kaydet</>}
                  </button>
                </form>
              </div>
            )}

            {flTab === "ilanlar" && (
              <div className="tab-content">
                <div className="tab-header"><FileText size={20} /><h2>Başvurularım ({myApps.length})</h2></div>
                {myApps.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} style={{ color: "var(--text-muted)" }} />
                    <h3>Henüz başvuru yok</h3>
                    <p>İş ilanlarına göz atın ve el sıkışma talebi gönderin.</p>
                    <a href="/ilanlar" className="btn-primary" style={{ textDecoration: "none" }}>İş İlanlarına Bak</a>
                  </div>
                ) : (
                  <div>
                    {myApps.map((app) => (
                      <div key={app.id} className="job-row">
                        <div className="job-row-meta">
                          <span className="tag red">{app.job_category || "Genel"}</span>
                          <span className="tag">{app.status === "pending" ? "Beklemede" : app.status === "completed" ? "Tamamlandı" : app.status}</span>
                        </div>
                        <a href={`/isler/${app.job_id}`}><h2>{app.job_title || "İlan"}</h2></a>
                        <div className="job-row-budget"><strong>{app.job_budget}</strong></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {flTab === "dogrulama" && (
              <div className="tab-content">
                <div className="tab-header"><ShieldCheck size={20} /><h2>Kimlik Doğrulama</h2></div>
                {tcVerified ? (
                  <div className="verify-success-inline">
                    <CheckCircle2 size={48} color="var(--success)" />
                    <h3>Kimliğiniz Doğrulandı</h3>
                    <p>Profilinize <strong>Kimlik Onaylı</strong> rozeti eklendi.</p>
                  </div>
                ) : (
                  <>
                    <div className="verify-info-box">
                      <p>TC Kimlik numaranızı doğrulayın, profilinizde <strong>Kimlik Onaylı</strong> rozeti görünsün.</p>
                    </div>
                    {verifyError && <p className="auth-msg error" style={{ marginBottom: 16 }}>{verifyError}</p>}
                    <form onSubmit={handleVerify} className="settings-form">
                      <div className="form-row">
                        <div className="input-group">
                          <label>Ad (Kimlikte yazıldığı gibi)</label>
                          <input
                            type="text"
                            value={verifyFirstName}
                            onChange={(e) => setVerifyFirstName(e.target.value)}
                            placeholder="ALİ"
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>Soyad (Kimlikte yazıldığı gibi)</label>
                          <input
                            type="text"
                            value={verifyLastName}
                            onChange={(e) => setVerifyLastName(e.target.value)}
                            placeholder="YILMAZ"
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label><Fingerprint size={14} /> TC Kimlik No</label>
                        <input
                          type="text"
                          maxLength={11}
                          value={tcNo}
                          onChange={(e) => setTcNo(e.target.value)}
                          placeholder="11 haneli TC Kimlik No"
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label><Calendar size={14} /> Doğum Yılı</label>
                        <input
                          type="number"
                          min={1920}
                          max={new Date().getFullYear() - 15}
                          value={verifyBirthYear}
                          onChange={(e) => setVerifyBirthYear(e.target.value)}
                          placeholder="1995"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary save-btn" disabled={verifyLoading}>
                        {verifyLoading ? <><Loader2 className="spin" size={18} /> Doğrulanıyor...</> : <><ShieldCheck size={18} /> Kimliği Doğrula</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
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
          <span className="ava lg">{initial}</span>
          <div>
            <h1>Merhaba, <span className="gradient-text">{firstName}</span></h1>
            <p className="user-type-badge employer-badge"><Briefcase size={12} /> İşveren</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={16} /> Çıkış Yap</button>
      </div>

      <div className="hesabim-layout">
        <aside className="hesabim-sidebar glass-card">
          {empTabs.map((t) => (
            <button key={t.key} className={`sidebar-tab ${empTab === t.key ? "active" : ""}`} onClick={() => setEmpTab(t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
          <hr className="divider" style={{ margin: "8px 0" }} />
          <a href="/profil" className="sidebar-tab"><User size={16} /> Freelancer Bul</a>
        </aside>

        <div className="hesabim-content glass-card">
          {empTab === "dashboard" && (
            <div className="tab-content">
              <div className="tab-header"><Briefcase size={20} /><h2>İşveren Özet</h2></div>
              <div className="dashboard-stats">
                <div className="glass-card dash-stat">
                  <div className="dash-icon"><FileText size={24} /></div>
                  <strong className="gradient-text">{myJobs.filter((j) => j.status === "open").length}</strong>
                  <span>Aktif İlan</span>
                </div>
                <div className="glass-card dash-stat">
                  <div className="dash-icon"><CheckCircle2 size={24} /></div>
                  <strong className="gradient-text">{myJobs.filter((j) => j.status === "completed").length}</strong>
                  <span>Tamamlanan</span>
                </div>
                <div className="glass-card dash-stat">
                  <div className="dash-icon"><User size={24} /></div>
                  <strong className="gradient-text">{incomingProposals}</strong>
                  <span>Gelen Başvuru</span>
                </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FileText size={20} /><h2>İlanlarım ({myJobs.length})</h2></div>
                <a href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none", padding: "8px 16px", fontSize: "14px" }}><Plus size={16} /> Yeni İlan</a>
              </div>
              {myJobs.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} style={{ color: "var(--text-muted)" }} />
                  <h3>Henüz ilan yok</h3>
                  <p>İlk ilanınızı yayınlayın, freelancer başvurularını alın.</p>
                  <a href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none" }}><Plus size={16} /> İlan Ver</a>
                </div>
              ) : (
                <div>
                  {myJobs.map((j) => (
                    <div key={j.id} className="job-row">
                      <div className="job-row-meta">
                        <span className="tag red">{j.category}</span>
                        <span>{j.proposals} başvuru</span>
                      </div>
                      <a href={`/isler/${j.id}`}><h2>{j.title}</h2></a>
                      <div className="job-row-budget"><strong>{j.budget_range}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {empTab === "profil" && (
            <div className="tab-content">
              <div className="tab-header"><Edit3 size={20} /><h2>Şirket / Kişisel Profil</h2></div>
              {saveError && <p className="auth-msg error" style={{ marginBottom: 16 }}>{saveError}</p>}
              <form className="settings-form" onSubmit={handleSave}>
                <div className="form-row">
                  <div className="input-group">
                    <label><User size={14} /> Ad Soyad / Şirket Adı</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label><Mail size={14} /> E-posta</label>
                    <input type="email" value={session?.user?.email || ""} disabled style={{ opacity: 0.6 }} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Kullanıcı Adı</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="sirket_adi" required />
                </div>
                <div className="input-group">
                  <label>Hakkında</label>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Şirketiniz veya projeleriniz hakkında..." />
                </div>
                <button type="submit" className="btn-primary save-btn" disabled={saving}>
                  {saving ? <><Loader2 className="spin" size={18} /> Kaydediliyor...</> : saved ? <><CheckCircle2 size={18} /> Kaydedildi!</> : <><Save size={18} /> Kaydet</>}
                </button>
              </form>
            </div>
          )}

          {empTab === "guvenlik" && (
            <div className="tab-content">
              <div className="tab-header"><Settings size={20} /><h2>Güvenlik & Hesap</h2></div>
              <div className="settings-form">
                <div className="danger-zone" style={{ marginTop: "8px" }}>
                  <h3 style={{ color: "var(--accent)" }}>Oturum Yönetimi</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Hesabınızdan güvenli şekilde çıkış yapın.</p>
                  <button className="danger-btn" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={16} /> Çıkış Yap</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
