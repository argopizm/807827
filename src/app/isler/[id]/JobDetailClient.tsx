"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar, DollarSign, User, CheckCircle2,
  Handshake, MessageSquare, ArrowLeft, LogIn, Loader2
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  client: string;
  client_id: string;
  budget: string;
  category: string;
  created_at: string;
  status: string;
  description: string;
}

export default function JobDetailClient({ id, job }: { id: string; job: Job }) {
  const { data: session, status } = useSession();
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.client,
    },
    "jobLocationType": "TELECOMMUTE",
  };

  const handleHandshake = async () => {
    if (!session) return;
    setApplying(true);
    setApplyError(null);

    try {
      const res = await fetch("/api/handshake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, clientId: job.client_id }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasApplied(true);
      } else {
        setApplyError(data.error || "Bir hata oluştu. Tekrar deneyin.");
      }
    } catch {
      setApplyError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setApplying(false);
    }
  };

  const isOwnJob = session?.user?.id === job.client_id;

  return (
    <div className="job-detail container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/ilanlar" className="back-link">
        <ArrowLeft size={16} /> İlanlara Geri Dön
      </a>

      <div className="detail-grid">
        <div className="main-content">
          <div className="glass-card job-header-card">
            <div className="job-meta-top">
              <span className="category-badge">{job.category}</span>
              <span className="date-badge"><Calendar size={14} /> {job.created_at}</span>
              <span className={`status-badge status-${job.status}`}>
                {job.status === "open" ? "Açık" : job.status === "active" ? "Aktif" : "Kapalı"}
              </span>
            </div>
            <h1 className="job-title">{job.title}</h1>
            <div className="job-stats">
              <div className="stat">
                <DollarSign size={20} className="icon" />
                <div>
                  <span>Bütçe</span>
                  <strong>{job.budget}</strong>
                </div>
              </div>
              <div className="stat">
                <User size={20} className="icon" />
                <div>
                  <span>İş Veren</span>
                  <strong>{job.client}</strong>
                </div>
              </div>
            </div>
          </div>

          <section className="glass-card description-card">
            <h2>İş Detayları</h2>
            <div className="description-text">
              {job.description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        <aside className="actions-sidebar">
          <div className="glass-card action-card">
            <h3>Bu İşle İlgileniyor musunuz?</h3>

            {/* Giriş yapılmamış */}
            {status === "unauthenticated" && (
              <>
                <p>
                  El sıkışma talebinde bulunmak için <strong>giriş yapmanız</strong> gerekiyor.
                </p>
                <a href="/giris" className="btn-primary handshake-btn" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <LogIn size={20} /> Giriş Yap
                </a>
              </>
            )}

            {/* Kendi ilanı */}
            {status === "authenticated" && isOwnJob && (
              <div className="own-job-notice">
                <CheckCircle2 size={20} color="var(--primary)" />
                <p>Bu ilan size ait. Başkalarından teklif bekliyorsunuz.</p>
              </div>
            )}

            {/* Giriş yapılmış, başkasının ilanı */}
            {status === "authenticated" && !isOwnJob && (
              <>
                <p>
                  Müşteriyle dışarıda (WhatsApp/Discord) anlaştıysanız, platform üzerinde
                  &quot;El Sıkışarak&quot; süreci başlatabilirsiniz.
                </p>

                {applyError && (
                  <p className="error-msg" style={{ marginBottom: "12px" }}>{applyError}</p>
                )}

                {!hasApplied ? (
                  <button
                    className="btn-primary handshake-btn"
                    onClick={handleHandshake}
                    disabled={applying}
                  >
                    {applying ? <><Loader2 className="spin" size={20} /> Gönderiliyor...</> : <><Handshake size={20} /> El Sıkışmayı Başlat</>}
                  </button>
                ) : (
                  <div className="handshake-success">
                    <CheckCircle2 size={32} color="var(--success)" />
                    <p>El sıkışma talebi gönderildi! Karşı taraf onayladığında iş &quot;Aktif&quot; sayılacaktır.</p>
                  </div>
                )}
              </>
            )}

            {/* Yükleniyor */}
            {status === "loading" && (
              <div className="loading-state" style={{ textAlign: "center", padding: "20px" }}>
                <Loader2 className="spin" size={24} />
              </div>
            )}

            <hr className="divider" />

            <div className="safety-tip">
              <MessageSquare size={16} />
              <span>Ödeme platform dışındadır. Güvenliğiniz için iş bitmeden tam ödeme yapmayın/almayın.</span>
            </div>
          </div>

          <div className="glass-card client-info-card">
            <h3>Müşteri Hakkında</h3>
            <div className="client-stats">
              <div className="c-stat">
                <strong>{Math.floor(Math.random() * 20) + 1}</strong>
                <span>Tamamlanan İş</span>
              </div>
              <div className="c-stat">
                <strong>4.{Math.floor(Math.random() * 10)}</strong>
                <span>Puan</span>
              </div>
            </div>
            <a href={`/profil/${job.client_id}`} className="view-profile">Profili Görüntüle</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
