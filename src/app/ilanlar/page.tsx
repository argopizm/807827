import { Search, MapPin, Clock, Filter } from "lucide-react";

export default function JobBoardPage() {
  // Mock data for jobs
  const jobs = [
    {
      id: "1",
      title: "Next.js ile E-Ticaret Arayüzü",
      client: "Dijital Akademi",
      budget: "15.000 - 20.000 TL",
      category: "Yazılım",
      time: "2 saat önce",
      description: "Mevcut Figma tasarımımızı Next.js ve Tailwind kullanarak koda dökecek bir freelancer arıyoruz...",
    },
    {
      id: "2",
      title: "Modern Logo Tasarımı",
      client: "Luna Coffee",
      budget: "2.500 - 4.000 TL",
      category: "Tasarım",
      time: "5 saat önce",
      description: "Yeni kahve markamız için minimalist ve akılda kalıcı bir logo tasarımına ihtiyacımız var.",
    },
    {
      id: "3",
      title: "Mobil Uygulama Çevirisi (İngilizce - Türkçe)",
      client: "AppWorld",
      budget: "3.000 TL",
      category: "Çeviri",
      time: "1 gün önce",
      description: "5000 kelimelik bir mobil uygulama içeriğinin yerelleştirilmesi işidir.",
    },
  ];

  return (
    <div className="job-board container">
      {/* Search & Filter Bar */}
      <div className="search-bar glass-card">
        <div className="search-input">
          <Search size={20} className="icon" />
          <input type="text" placeholder="İş ara... (Örn: Web Tasarım)" />
        </div>
        <button className="filter-btn">
          <Filter size={18} /> Filtrele
        </button>
        <button className="btn-primary">Ara</button>
      </div>

      <div className="board-layout">
        {/* Categories Sidebar */}
        <aside className="filters-sidebar">
          <h3>Kategoriler</h3>
          <div className="filter-list">
            {["Tümü", "Yazılım", "Tasarım", "Pazarlama", "Çeviri", "Video"].map((cat) => (
              <label key={cat} className="filter-item">
                <input type="checkbox" defaultChecked={cat === "Tümü"} />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Job List */}
        <main className="job-list">
          <div className="list-header">
            <h2>Aktif İlanlar ({jobs.length})</h2>
            <select>
              <option>En Yeni</option>
              <option>Bütçe: Önce Yüksek</option>
            </select>
          </div>

          {jobs.map((job) => (
            <div key={job.id} className="glass-card job-card">
              <div className="job-card-header">
                <div>
                  <span className="category-badge">{job.category}</span>
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span><Search size={14} /> {job.client}</span>
                    <span><Clock size={14} /> {job.time}</span>
                  </div>
                </div>
                <div className="job-budget">{job.budget}</div>
              </div>
              <p className="job-desc">{job.description}</p>
              <div className="job-card-footer">
                <button className="btn-secondary">Detayları Gör</button>
                <button className="btn-primary">Teklif Ver</button>
              </div>
            </div>
          ))}
        </main>
      </div>

      <style jsx>{`
        .job-board {
          padding-top: 40px;
        }
        .search-bar {
          padding: 16px 24px;
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 40px;
        }
        .search-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0 16px;
        }
        .search-input input {
          background: none;
          border: none;
          padding: 12px 0;
          color: white;
          width: 100%;
        }
        .search-input input:focus { outline: none; }
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-muted);
        }

        .board-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
        }
        
        .filters-sidebar h3 {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .filter-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.3s ease;
        }
        .filter-item:hover { color: white; }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .list-header h2 { font-size: 24px; }
        .list-header select {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .job-card {
          padding: 24px;
          margin-bottom: 24px;
        }
        .job-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .category-badge {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .job-title {
          font-size: 20px;
          margin: 4px 0 8px;
        }
        .job-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .job-meta span { display: flex; align-items: center; gap: 4px; }
        .job-budget {
          font-size: 18px;
          font-weight: 700;
          color: var(--success);
        }
        .job-desc {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .job-card-footer {
          display: flex;
          gap: 12px;
        }

        @media (max-width: 800px) {
          .board-layout { grid-template-columns: 1fr; }
          .filters-sidebar { display: none; }
          .search-bar { flex-direction: column; }
          .search-input { width: 100%; }
        }
      `}</style>
    </div>
  );
}
