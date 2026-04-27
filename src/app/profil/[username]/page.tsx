"use client";

import { use, useState } from "react";
import AdSenseSlot from "@/components/AdSenseSlot";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  // Mock data for demonstration
  const user = {
    name: "Ahmet Yılmaz",
    username: username,
    bio: "Kıdemli Full-stack Developer | 10+ Yıl Deneyim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet",
    tc_verified: true,
    trust_badge: true,
    rating: 4.9,
    jobs_done: 42,
    links: {
      whatsapp: "https://wa.me/905000000000",
      discord: "ahmet#1234",
      portfolio: "https://ahmet.dev",
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.name,
    "jobTitle": "Freelancer",
    "description": user.bio,
    "image": user.avatar,
    "url": `https://frelancerturkiye.com/profil/${user.username}`
  };

  return (
    <div className="profile container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="profile-grid">
        {/* Left Side: Avatar & Badges */}
        <aside className="profile-sidebar">
          <div className="glass-card sidebar-content">
            <img src={user.avatar} alt={user.name} className="avatar" />
            <h1 className="name">{user.name}</h1>
            <p className="username">@{user.username}</p>
            
            <div className="badges">
              {user.tc_verified && (
                <div className="badge tc" title="TC Kimlik Doğrulanmış">
                  ✅ Kimlik Doğrulanmış
                </div>
              )}
              {user.trust_badge && (
                <div className="badge trust" title="Güvenilir Satıcı">
                  ⭐ Güven Rozeti
                </div>
              )}
            </div>

            <div className="stats-mini">
              <div className="stat">
                <span>İş Sayısı</span>
                <strong>{user.jobs_done}</strong>
              </div>
              <div className="stat">
                <span>Puan</span>
                <strong>{user.rating} / 5</strong>
              </div>
            </div>

            <hr className="divider" />

            <div className="contact-links">
              <h3>İletişim</h3>
              <a href={user.links.whatsapp} className="contact-btn wa">WhatsApp ile Yaz</a>
              <div className="contact-item">
                <span>Discord:</span>
                <strong>{user.links.discord}</strong>
              </div>
              <a href={user.links.portfolio} target="_blank" className="contact-btn portfolio">Portfolyo Gör</a>
            </div>
          </div>
        </aside>

        {/* Right Side: Bio & Reviews */}
        <main className="profile-main">
          <section className="glass-card bio-section">
            <h2>Hakkında</h2>
            <p>{user.bio}</p>
            <AdSenseSlot id="profile-bio-ads" format="auto" />
          </section>

          <section className="reviews-section">
            <h2>Yorumlar (12)</h2>
            <div className="review-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card review-card">
                  <div className="review-header">
                    <strong>Müşteri #{i}</strong>
                    <span className="rating">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p>Harika bir iş çıkardı, zamanında teslim etti. Kesinlikle tavsiye ederim.</p>
                  <span className="date">2 gün önce</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>


    </div>
  );
}
