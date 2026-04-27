export const runtime = 'edge';

export default function ProfilListPage() {
  const freelancers = [
    { username: "ali_yazilim", name: "Ali Yılmaz", skill: "Full Stack Developer", rate: "500 TL/sa" },
    { username: "ayse_tasarim", name: "Ayşe Kaya", skill: "UI/UX Designer", rate: "400 TL/sa" },
    { username: "mehmet_cevirmen", name: "Mehmet Demir", skill: "İngilizce Çevirmen", rate: "300 TL/sa" },
  ];

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <h2 style={{ marginBottom: '30px' }}>Freelancer Bul</h2>
      <div className="category-grid">
        {freelancers.map((f) => (
          <div key={f.username} className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{f.name}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{f.skill}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{f.rate}</span>
              <a href={`/profil/${f.username}`} className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>Profili Gör</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
