"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryTitle } from "@/lib/categories";
import ProposalSummary from "@/components/ProposalSummary";
import type { ProposalTerms } from "@/lib/proposals";
import {
  User, Mail, ShieldCheck, LogOut, Briefcase,
  Loader2, Edit3, CheckCircle2,
  Code2, FileText, Star, Plus, Settings, ChevronRight, ExternalLink
} from "lucide-react";

type UserType = "freelancer" | "employer" | null;
type FreelancerTab = "dashboard" | "profil" | "ilanlar";
type EmployerTab = "dashboard" | "ilanlarim" | "basvurular" | "profil" | "guvenlik";

interface ProfileRecord {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  title: string | null;
  category: string | null;
  skills: string | null;
  bio: string | null;
  avatar_url: string | null;
  portfolio_url: string | null;
  contact_links: string | null;
  user_type: UserType;
  email_verified_at: string | null;
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

interface ApplicationSummary extends ProposalTerms {
  id: string;
  job_id: string;
  status: string;
  job_title: string;
  job_budget: string;
  job_category: string;
  job_status: string;
}

interface IncomingProposal extends ApplicationSummary {
  freelancer_name: string;
  freelancer_username: string | null;
}

const proposalStatus: Record<string, string> = {
  pending: "Bekliyor", accepted: "Kabul edildi", completed: "Tamamlandı", cancelled: "İptal edildi",
};
type ProposalAction = "accept" | "complete" | "cancel";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [myJobs, setMyJobs] = useState<JobSummary[]>([]);
  const [myApps, setMyApps] = useState<ApplicationSummary[]>([]);
  const [incomingProposals, setIncomingProposals] = useState(0);
  const [loaded, setLoaded] = useState(false);


  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [proposals, setProposals] = useState<IncomingProposal[]>([]);
  const [proposalBusy, setProposalBusy] = useState(false);
  const [proposalError, setProposalError] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [revision, setRevision] = useState(0);

  const [flTab, setFlTab] = useState<FreelancerTab>("dashboard");
  const [empTab, setEmpTab] = useState<EmployerTab>("dashboard");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (new URLSearchParams(window.location.search).get("bolum") === "profil") router.replace("/hesabim/profil");
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);
  // Profile navigation
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/profile")
      .then((response) => {
        if (!response.ok) throw new Error("Profil yüklenemedi");
        return response.json();
      })
      .then((d) => {
        setProfileError(false);
        if (d?.user) {
          const u: ProfileRecord = d.user;
          setProfile(u);
          setUserType(u.user_type ?? null);
          setUsername(u.username ?? "");
          setDisplayName(u.display_name ?? u.username ?? "");
        }
        if (Array.isArray(d?.myJobs)) setMyJobs(d.myJobs);
        if (Array.isArray(d?.myApplications)) setMyApps(d.myApplications);
        setIncomingProposals(Number(d?.incomingProposals ?? 0));
        setProposals(Array.isArray(d?.proposals) ? d.proposals : []);
        setEmailEnabled(Boolean(d?.emailVerificationEnabled));
        setLoaded(true);
      })
      .catch(() => {
        setProfileError(true);
        setLoaded(true);
      });
  }, [status, session?.user?.name, revision]);

  async function sendVerification() {
    setEmailPending(true);
    setEmailMessage("");
    try {
      const response = await fetch("/api/user/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = await response.json();
      if (!response.ok) setEmailMessage(data.error ?? "E-posta gönderilemedi.");
      else if (data.verified) setRevision((value) => value + 1);
      else setEmailMessage("Doğrulama bağlantısı e-posta adresinize gönderildi.");
    } catch {
      setEmailMessage("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setEmailPending(false);
    }
  }

  async function changeProposal(id: string, action: ProposalAction) {
    setProposalBusy(true);
    setProposalError("");
    try {
      const response = await fetch("/api/handshake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok) setProposalError(data.error ?? "Teklif güncellenemedi.");
      setRevision((value) => value + 1);
    } catch {
      setProposalError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setProposalBusy(false);
    }
  }

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
          <Link href="/giris" className="btn-primary" style={{ textDecoration: "none" }}>Giriş Yap</Link>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <h2>Hesap bilgileri yüklenemedi</h2>
          <button type="button" className="btn-primary" onClick={() => setRevision((value) => value + 1)}>Tekrar dene</button>
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
          <Link href="/onboarding" className="btn-primary" style={{ textDecoration: "none" }}>
            Devam Et <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const firstName = displayName || username || session?.user?.name || "Kullanıcı";
  const initial = firstName.charAt(0).toLocaleUpperCase("tr");

  const emailNotice = emailEnabled && !profile?.email_verified_at && (
    <div className="dash-notice glass-card">
      <Mail size={18} aria-hidden="true" />
      <p role="status">{emailMessage || "İlan, teklif, profil ve mesajlaşma işlemleri için e-posta adresinizi doğrulayın."}</p>
      <button type="button" className="btn-secondary" disabled={emailPending} onClick={sendVerification}>
        {emailPending ? "Gönderiliyor…" : "Doğrulama bağlantısı gönder"}
      </button>
    </div>
  );

  function proposalActions(proposal: ApplicationSummary, isEmployer: boolean) {
    if (proposal.status === "completed" && proposal.job_status === "completed") {
      return <Link className="btn-secondary" href={"/degerlendir/" + encodeURIComponent(proposal.id)}>Değerlendir</Link>;
    }
    if (proposal.status !== "pending" && proposal.status !== "accepted") return null;
    return (
      <div className="dash-actions">
        {isEmployer && proposal.status === "pending" && (proposal.job_status === "open" || !proposal.job_status) && (
          <button type="button" className="btn-primary" disabled={proposalBusy} onClick={() => changeProposal(proposal.id, "accept")}>Teklifi kabul et</button>
        )}
        {isEmployer && proposal.status === "accepted" && proposal.job_status === "in_progress" && (
          <button type="button" className="btn-primary" disabled={proposalBusy} onClick={() => changeProposal(proposal.id, "complete")}>İşi tamamla</button>
        )}
        <button type="button" className="btn-secondary" disabled={proposalBusy} onClick={() => changeProposal(proposal.id, "cancel")}>Teklifi iptal et</button>
      </div>
    );
  }

  // ─── FREELANCER PANELİ ───
  if (userType === "freelancer") {
    const tabs: { key: FreelancerTab; icon: React.ReactNode; label: string }[] = [
      { key: "dashboard", icon: <Code2 size={16} />, label: "Özet" },
      { key: "profil", icon: <User size={16} />, label: "Profilim" },
      { key: "ilanlar", icon: <FileText size={16} />, label: "Başvurularım" },
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
              <Link href={`/profil/${username}`} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 14 }}>
                Açık Profilim <ExternalLink size={14} />
              </Link>
            )}
            <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut size={16} /> Çıkış Yap
            </button>
          </div>
        </div>

        <div className="hesabim-layout">
          <aside className="hesabim-sidebar glass-card">
            {tabs.map((t) => (
              <button key={t.key} className={`sidebar-tab ${flTab === t.key ? "active" : ""}`} onClick={() => t.key === "profil" ? router.push("/profilim") : setFlTab(t.key)}>
                {t.icon}{t.label}
              </button>
            ))}
            <hr className="divider" style={{ margin: "8px 0" }} />
            <Link href="/ilanlar" className="sidebar-tab"><FileText size={16} /> İş İlanlarına Bak</Link>
            <Link href="/hesabim/ayarlar" className="sidebar-tab"><Settings size={16} /> Hesap Ayarları</Link>
            <Link href="/destek" className="sidebar-tab"><Mail size={16} /> Destek Taleplerim</Link>
            <Link href="/dogrulama" className="sidebar-tab"><ShieldCheck size={16} /> Kimlik Doğrulama Bilgisi</Link>
          </aside>

          <div className="hesabim-content glass-card">
            {emailNotice}
            {proposalError && <p role="alert" className="auth-msg error">{proposalError}</p>}
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
                  <Link href="/ilanlar" className="btn-primary dash-action-btn"><FileText size={16} /> İş İlanlarını Gör</Link>
                  <button className="btn-secondary dash-action-btn" onClick={() => router.push("/hesabim/profil")}><Edit3 size={16} /> Profilimi Düzenle</button>
                </div>
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
                    <Link href="/ilanlar" className="btn-primary" style={{ textDecoration: "none" }}>İş İlanlarına Bak</Link>
                  </div>
                ) : (
                  <div>
                    {myApps.map((app) => (
                      <div key={app.id} className="job-row">
                        <div className="job-row-meta">
                          <span className="tag red">{categoryTitle(app.job_category)}</span>
                          <span className="tag">{proposalStatus[app.status] ?? "Durumu bilinmiyor"}</span>
                        </div>
                        <Link href={`/isler/${app.job_id}`}><h2>{app.job_title || "İlan"}</h2></Link>
                        <div className="job-row-budget"><strong>{app.job_budget}</strong></div>
                        <ProposalSummary proposal={app}/>
                        {proposalActions(app, false)}
                      </div>
                    ))}
                  </div>
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
    { key: "basvurular", icon: <User size={16} />, label: "Gelen teklifler" },
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
            <button key={t.key} className={`sidebar-tab ${empTab === t.key ? "active" : ""}`} onClick={() => t.key === "profil" ? router.push("/profilim") : setEmpTab(t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
          <hr className="divider" style={{ margin: "8px 0" }} />
          <Link href="/profil" className="sidebar-tab"><User size={16} /> Freelancer Bul</Link>
          <Link href="/hesabim/ayarlar" className="sidebar-tab"><Settings size={16} /> Hesap Ayarları</Link>
            <Link href="/destek" className="sidebar-tab"><Mail size={16} /> Destek Taleplerim</Link>
          <Link href="/dogrulama" className="sidebar-tab"><ShieldCheck size={16} /> Kimlik Doğrulama Bilgisi</Link>
        </aside>

        <div className="hesabim-content glass-card">
          {emailNotice}
          {proposalError && <p role="alert" className="auth-msg error">{proposalError}</p>}
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
                <Link href="/ilan-ver" className="btn-primary dash-action-btn"><Plus size={16} /> Yeni İlan Ver</Link>
                <Link href="/profil" className="btn-secondary dash-action-btn"><User size={16} /> Freelancer Bul</Link>
              </div>
            </div>
          )}

          {empTab === "ilanlarim" && (
            <div className="tab-content">
              <div className="tab-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FileText size={20} /><h2>İlanlarım ({myJobs.length})</h2></div>
                <Link href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none", padding: "8px 16px", fontSize: "14px" }}><Plus size={16} /> Yeni İlan</Link>
              </div>
              {myJobs.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} style={{ color: "var(--text-muted)" }} />
                  <h3>Henüz ilan yok</h3>
                  <p>İlk ilanınızı yayınlayın, freelancer başvurularını alın.</p>
                  <Link href="/ilan-ver" className="btn-primary" style={{ textDecoration: "none" }}><Plus size={16} /> İlan Ver</Link>
                </div>
              ) : (
                <div>
                  {myJobs.map((j) => (
                    <div key={j.id} className="job-row">
                      <div className="job-row-meta">
                        <span className="tag red">{categoryTitle(j.category)}</span>
                        <span>{j.proposals} başvuru</span>
                      </div>
                      <Link href={`/isler/${j.id}`}><h2>{j.title}</h2></Link>
                      <div className="job-row-budget"><strong>{j.budget_range}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {empTab === "basvurular" && (
            <div className="tab-content">
              <div className="tab-header"><User size={20} /><h2>Gelen teklifler</h2></div>
              {proposals.length === 0 && <p>İlanlarınıza henüz teklif gelmedi.</p>}
              {proposals.map((proposal) => (
                <article key={proposal.id} className="job-row">
                  <div className="job-row-meta">
                    <span className="tag red">{categoryTitle(proposal.job_category)}</span>
                    <span className="tag">{proposalStatus[proposal.status] ?? "Durumu bilinmiyor"}</span>
                  </div>
                  <h2><Link href={"/isler/" + encodeURIComponent(proposal.job_id)}>{proposal.job_title}</Link></h2>
                  {proposal.freelancer_username ? (
                    <Link href={"/profil/" + encodeURIComponent(proposal.freelancer_username)}>{proposal.freelancer_name}</Link>
                  ) : <p>{proposal.freelancer_name}</p>}
                  <ProposalSummary proposal={proposal}/>
                  {proposalActions(proposal, true)}
                </article>
              ))}
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
