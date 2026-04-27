export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">Komisyonsuz & Özgür</div>
          <h1 className="hero-title">
            Freelancer Dünyasında <br />
            <span className="gradient-text">Yerçekimine Meydan Okuyun</span>
          </h1>
          <p className="hero-subtitle">
            Türkiye'nin en şeffaf platformu. Aracı yok, komisyon yok, karmaşa yok. 
            Sadece işinize odaklanın, güvenle el sıkışın.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Hemen Başla</button>
            <button className="btn-secondary">İş İlanlarına Bak</button>
          </div>
        </div>
        <div className="hero-glow"></div>
      </section>

      {/* Stats Section */}
      <section className="stats container">
        <div className="glass-card stat-item">
          <h3>0%</h3>
          <p>Komisyon</p>
        </div>
        <div className="glass-card stat-item">
          <h3>100%</h3>
          <p>Şeffaflık</p>
        </div>
        <div className="glass-card stat-item">
          <h3>Hızlı</h3>
          <p>Ödeme (Siz Belirleyin)</p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories container">
        <h2 className="section-title">Popüler Kategoriler</h2>
        <div className="category-grid">
          {["Yazılım", "Tasarım", "Pazarlama", "Çeviri", "Video & Animasyon", "Seslendirme"].map((cat) => (
            <div key={cat} className="glass-card category-card">
              <h4>{cat}</h4>
              <p>İlanları Gör &rarr;</p>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .home {
          padding-bottom: 100px;
        }
        .hero {
          padding: 120px 0 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-content {
          position: relative;
          z-index: 2;
        }
        .hero-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -2px;
        }
        .hero-subtitle {
          font-size: 20px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .btn-secondary {
          padding: 12px 24px;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          font-weight: 600;
          color: var(--foreground);
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: var(--glass);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .hero-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }
        .stat-item {
          padding: 32px;
          text-align: center;
        }
        .stat-item h3 {
          font-size: 32px;
          margin-bottom: 8px;
          color: var(--primary);
        }
        .stat-item p {
          color: var(--text-muted);
          font-weight: 500;
        }

        .categories {
          margin-top: 120px;
        }
        .section-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          text-align: center;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .category-card {
          padding: 24px;
          cursor: pointer;
        }
        .category-card h4 {
          font-size: 20px;
          margin-bottom: 12px;
        }
        .category-card p {
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 40px;
          }
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
