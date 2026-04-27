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


    </div>
  );
}
