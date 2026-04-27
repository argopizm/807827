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


    </div>
  );
}
