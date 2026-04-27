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


    </div>
  );
}
