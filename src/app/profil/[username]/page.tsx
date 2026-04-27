import AdSenseSlot from "@/components/AdSenseSlot";

export default function ProfilePage({ params }: { params: { username: string } }) {
  // Mock data for demonstration
  const user = {
    name: "Ahmet Yılmaz",
    username: params.username,
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

      <style jsx>{`
        .profile {
          padding-top: 40px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
        }
        .sidebar-content {
          padding: 32px;
          text-align: center;
          position: sticky;
          top: 100px;
        }
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--primary);
          margin-bottom: 16px;
        }
        .name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .username {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 24px;
        }
        .badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .badge.tc { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .badge.trust { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        
        .stats-mini {
          display: flex;
          justify-content: space-around;
          margin-bottom: 24px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: var(--text-muted);
        }
        .stat strong {
          font-size: 18px;
          color: var(--foreground);
        }

        .divider {
          border: 0;
          border-top: 1px solid var(--glass-border);
          margin: 24px 0;
        }

        .contact-links h3 {
          font-size: 16px;
          margin-bottom: 16px;
          text-align: left;
        }
        .contact-btn {
          display: block;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          margin-bottom: 12px;
          text-align: center;
        }
        .contact-btn.wa { background: #25d366; color: white; }
        .contact-btn.portfolio { background: var(--glass); border: 1px solid var(--glass-border); }
        .contact-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .bio-section {
          padding: 32px;
          margin-bottom: 32px;
        }
        .bio-section h2 { margin-bottom: 16px; }
        
        .reviews-section h2 { margin-bottom: 24px; }
        .review-card {
          padding: 24px;
          margin-bottom: 16px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .date {
          display: block;
          margin-top: 12px;
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .sidebar-content {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
