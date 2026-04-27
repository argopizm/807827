export const runtime = "edge";

import { Search, Clock, Filter } from "lucide-react";
import { getRequestContext } from "@cloudflare/next-on-pages";

export default async function JobBoardPage() {
  let dbJobs: any[] = [];
  
  try {
    const { env } = getRequestContext();
    const db = env.DB;
    if (db) {
      const { results } = await db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
      dbJobs = results || [];
    }
  } catch (e) {
    console.error("D1 connection failed, using mock data", e);
  }

  // Mock data for fallback
  const mockJobs = [
    {
      id: "1",
      title: "Next.js ile E-Ticaret Arayüzü (Demo)",
      client: "Dijital Akademi",
      budget: "15.000 - 20.000 TL",
      category: "Yazılım",
      time: "2 saat önce",
      description: "Mevcut Figma tasarımımızı Next.js ve Tailwind kullanarak koda dökecek bir freelancer arıyoruz...",
    }
  ];

  const jobs = dbJobs.length > 0 ? dbJobs.map(j => ({
    ...j,
    time: "Yeni İlan", // Simplified for DB results
  })) : mockJobs;

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
                    <span><Search size={14} /> {job.client || 'Anonim'}</span>
                    <span><Clock size={14} /> {job.time || 'Yeni'}</span>
                  </div>
                </div>
                <div className="job-budget">{job.budget}</div>
              </div>
              <p className="job-desc">{job.description}</p>
              <div className="job-card-footer">
                <a href={`/isler/${job.id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>Detayları Gör</a>
                <a href={`/isler/${job.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>Teklif Ver</a>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
