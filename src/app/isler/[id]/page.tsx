"use client";

import { useState } from "react";
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  User, 
  CheckCircle2, 
  Handshake, 
  MessageSquare, 
  ArrowLeft 
} from "lucide-react";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [hasApplied, setHasApplied] = useState(false);

  // Mock data for a specific job
  const job = {
    id: params.id,
    title: "Next.js ile E-Ticaret Arayüzü",
    client: "Dijital Akademi",
    client_id: "user_123",
    budget: "15.000 - 20.000 TL",
    category: "Yazılım",
    created_at: "27 Nisan 2024",
    status: "open",
    description: `
      Mevcut Figma tasarımımızı Next.js ve Tailwind kullanarak koda dökecek bir freelancer arıyoruz.
      
      Beklentilerimiz:
      - Pixel-perfect kodlama
      - SEO uyumlu yapı (Semantic HTML)
      - Hızlı yükleme süreleri (Lighthouse 90+)
      - Responsive tasarım
      
      Teslim süresi 15 gündür. Detaylar için el sıkıştıktan sonra WhatsApp üzerinden görüşülecektir.
    `,
  };

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
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "TRY",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.budget,
        "unitText": "YEAR"
      }
    }
  };

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
        {/* Main Content */}
        <div className="main-content">
          <div className="glass-card job-header-card">
            <div className="job-meta-top">
              <span className="category-badge">{job.category}</span>
              <span className="date-badge"><Calendar size={14} /> {job.created_at}</span>
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

        {/* Sidebar Actions */}
        <aside className="actions-sidebar">
          <div className="glass-card action-card">
            <h3>Bu İşle İlgileniyor musunuz?</h3>
            <p>
              Müşteriyle dışarıda (WhatsApp/Discord) anlaştıysanız, platform üzerinde 
              "El Sıkışarak" süreci başlatabilirsiniz.
            </p>
            
            {!hasApplied ? (
              <button 
                className="btn-primary handshake-btn"
                onClick={() => setHasApplied(true)}
              >
                <Handshake size={20} /> El Sıkışmayı Başlat
              </button>
            ) : (
              <div className="handshake-success">
                <CheckCircle2 size={32} color="var(--success)" />
                <p>El sıkışma talebi gönderildi! Karşı taraf onayladığında iş "Aktif" sayılacaktır.</p>
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
                <strong>12</strong>
                <span>Tamamlanan İş</span>
              </div>
              <div className="c-stat">
                <strong>4.8</strong>
                <span>Puan</span>
              </div>
            </div>
            <a href={`/profil/${job.client_id}`} className="view-profile">Profili Görüntüle</a>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .job-detail {
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          margin-bottom: 24px;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .back-link:hover { color: white; }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
        }

        .job-header-card {
          padding: 40px;
          margin-bottom: 32px;
        }
        .job-meta-top {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        .category-badge {
          background: var(--primary-glow);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
        }
        .date-badge {
          color: var(--text-muted);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .job-title {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 32px;
          letter-spacing: -1px;
        }
        .job-stats {
          display: flex;
          gap: 48px;
        }
        .stat {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .stat .icon { color: var(--primary); }
        .stat span { display: block; font-size: 13px; color: var(--text-muted); }
        .stat strong { font-size: 18px; }

        .description-card {
          padding: 40px;
        }
        .description-card h2 { margin-bottom: 24px; }
        .description-text p {
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 16px;
        }

        .action-card {
          padding: 32px;
          margin-bottom: 24px;
        }
        .action-card h3 { margin-bottom: 12px; }
        .action-card p {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .handshake-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 16px;
        }
        .handshake-success {
          text-align: center;
          padding: 20px;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 12px;
        }
        .handshake-success p { margin-top: 12px; color: var(--success); }

        .divider {
          border: 0;
          border-top: 1px solid var(--glass-border);
          margin: 24px 0;
        }
        .safety-tip {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }

        .client-info-card {
          padding: 32px;
        }
        .client-info-card h3 { margin-bottom: 20px; font-size: 16px; }
        .client-stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
        }
        .c-stat { text-align: center; }
        .c-stat strong { display: block; font-size: 20px; color: var(--foreground); }
        .c-stat span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
        .view-profile {
          display: block;
          text-align: center;
          color: var(--primary);
          font-weight: 600;
          font-size: 14px;
          margin-top: 16px;
        }

        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr; }
          .actions-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
}
