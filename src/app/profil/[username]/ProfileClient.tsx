"use client";

import { useState } from "react";
import {
  Star, Briefcase, ShieldCheck, Award, ExternalLink,
  MessageSquare, Globe, ArrowLeft, ChevronDown, ChevronUp
} from "lucide-react";

interface ProfileData {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  tc_verified: boolean;
  trust_badge: boolean;
  rating: number;
  jobs_done: number;
  user_type: string;
  skills: string[];
  links: { whatsapp?: string; discord?: string; portfolio?: string };
}

const MOCK_REVIEWS = [
  { author: "Ahmet K.", rating: 5, text: "Harika bir iş çıkardı. Tam istediğimi yaptı, zamanında teslim etti.", date: "2 gün önce" },
  { author: "Zeynep M.", rating: 5, text: "Çok profesyonel ve iletişimi mükemmel. Tekrar çalışırım.", date: "1 hafta önce" },
  { author: "Murat D.", rating: 4, text: "İyi iş çıkardı, küçük revizyon gerekti ama sonuç mükemmeldi.", date: "3 hafta önce" },
];

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name,
    "description": profile.bio,
    "image": profile.avatar,
    "url": `https://807827.pages.dev/profil/${profile.username}`,
  };

  return (
    <div className="pp-page container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <a href="/profil" className="back-link"><ArrowLeft size={16} /> Freelancer Bul</a>

      <div className="pp-grid">
        {/* ─── SOL KOLON ─── */}
        <aside className="pp-sidebar">
          <div className="glass-card pp-card">
            {/* Avatar & İsim */}
            <div className="pp-avatar-wrap">
              <img src={profile.avatar} alt={profile.name} className="pp-avatar" />
              {profile.tc_verified && <span className="pp-verified-ring" title="TC Kimlik Doğrulanmış" />}
            </div>
            <h1 className="pp-name">{profile.name}</h1>
            <p className="pp-username">@{profile.username}</p>

            {/* Rozetler */}
            <div className="pp-badges">
              {profile.tc_verified && <span className="fl-badge verified">✅ Kimlik Onaylı</span>}
              {profile.trust_badge && <span className="fl-badge trust">⭐ Güven Rozeti</span>}
              <span className="fl-badge" style={{ background: "rgba(99,102,241,0.1)", color: "var(--primary)" }}>
                {profile.user_type === "freelancer" ? "👨‍💻 Freelancer" : "💼 İşveren"}
              </span>
            </div>

            {/* İstatistikler */}
            <div className="pp-mini-stats">
              <div className="pp-mini-stat">
                <Star size={16} fill="var(--warning)" stroke="none" />
                <strong>{profile.rating > 0 ? profile.rating.toFixed(1) : "–"}</strong>
                <span>Puan</span>
              </div>
              <div className="pp-mini-stat-divider" />
              <div className="pp-mini-stat">
                <Briefcase size={16} />
                <strong>{profile.jobs_done}</strong>
                <span>İş</span>
              </div>
              <div className="pp-mini-stat-divider" />
              <div className="pp-mini-stat">
                <Award size={16} />
                <strong>{MOCK_REVIEWS.length}</strong>
                <span>Yorum</span>
              </div>
            </div>

            <hr className="divider" />

            {/* Yetenekler */}
            {profile.skills.length > 0 && (
              <div className="pp-skills-wrap">
                <h3 className="pp-section-label">Yetenekler</h3>
                <div className="fl-skills">
                  {profile.skills.map(s => <span key={s} className="fl-skill">{s}</span>)}
                </div>
              </div>
            )}

            {/* İletişim */}
            <div className="pp-contact">
              <h3 className="pp-section-label">İletişim</h3>
              {profile.links.whatsapp && (
                <a href={`https://wa.me/${profile.links.whatsapp}`} target="_blank" rel="noopener noreferrer" className="pp-contact-btn wa">
                  <MessageSquare size={16} /> WhatsApp ile Yaz
                </a>
              )}
              {profile.links.portfolio && (
                <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer" className="pp-contact-btn portfolio">
                  <Globe size={16} /> Portfolyo Gör
                </a>
              )}
              {profile.links.discord && (
                <div className="pp-contact-info">
                  <span>Discord:</span><strong>{profile.links.discord}</strong>
                </div>
              )}
              {!profile.links.whatsapp && !profile.links.portfolio && (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>İletişim bilgisi eklenmemiş.</p>
              )}
            </div>
          </div>
        </aside>

        {/* ─── SAĞ KOLON ─── */}
        <main className="pp-main">
          {/* Hakkında */}
          <section className="glass-card pp-section">
            <h2 className="pp-h2">Hakkında</h2>
            <p className="pp-bio">{profile.bio || "Henüz biyografi eklenmemiş."}</p>
          </section>

          {/* Yorumlar */}
          <section className="pp-section">
            <div className="pp-reviews-header">
              <h2 className="pp-h2">
                Yorumlar
                <span className="pp-review-count">{MOCK_REVIEWS.length}</span>
              </h2>
              <div className="pp-rating-summary">
                <Star size={18} fill="var(--warning)" stroke="none" />
                <strong>{profile.rating.toFixed(1)}</strong>
                <span>/ 5.0</span>
              </div>
            </div>

            <div className="pp-review-list">
              {(showAllReviews ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 2)).map((r, i) => (
                <div key={i} className="glass-card pp-review-card">
                  <div className="pp-review-top">
                    <div className="pp-review-author">
                      <div className="pp-review-avatar">{r.author.charAt(0)}</div>
                      <div>
                        <strong>{r.author}</strong>
                        <span className="pp-review-date">{r.date}</span>
                      </div>
                    </div>
                    <div className="pp-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  <p className="pp-review-text">{r.text}</p>
                </div>
              ))}
            </div>

            {MOCK_REVIEWS.length > 2 && (
              <button className="pp-show-more" onClick={() => setShowAllReviews(!showAllReviews)}>
                {showAllReviews ? <><ChevronUp size={16} /> Daha az göster</> : <><ChevronDown size={16} /> Tüm yorumları gör ({MOCK_REVIEWS.length})</>}
              </button>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
