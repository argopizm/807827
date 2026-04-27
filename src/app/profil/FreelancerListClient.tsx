"use client";

import { useState } from "react";
import { Search, Filter, Star, Briefcase, ShieldCheck, Award, MapPin, ArrowRight } from "lucide-react";

interface Freelancer {
  id: string; username: string; full_name: string; email: string;
  avatar_url: string; bio: string; tc_verified: number; trust_badge: number;
  total_jobs_completed: number; rating_avg: number; skills: string[]; category: string;
}

const CATEGORIES = ["Tümü", "Yazılım", "Tasarım", "Pazarlama", "Çeviri", "Video", "Seslendirme"];

export default function FreelancerListClient({ freelancers }: { freelancers: Freelancer[] }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tümü");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState<"rating" | "jobs">("rating");

  const filtered = freelancers
    .filter(f => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.full_name.toLowerCase().includes(q) || f.bio.toLowerCase().includes(q) || f.skills.some(s => s.toLowerCase().includes(q));
      const matchCat = activeCat === "Tümü" || f.category === activeCat;
      const matchVerified = !onlyVerified || f.tc_verified;
      return matchSearch && matchCat && matchVerified;
    })
    .sort((a, b) => sort === "rating" ? b.rating_avg - a.rating_avg : b.total_jobs_completed - a.total_jobs_completed);

  return (
    <div className="fl-page">
      {/* Hero */}
      <div className="fl-hero">
        <div className="fl-hero-orb" />
        <div className="container">
          <h1 className="fl-hero-title">Freelancer <span className="gradient-text">Bul</span></h1>
          <p className="fl-hero-sub">TC kimlik doğrulamalı, güvenilir Türk freelancer'larla çalışın</p>
          <div className="fl-search-bar glass-card">
            <Search size={20} className="fl-search-icon" />
            <input
              className="fl-search-input"
              placeholder="İsim, yetenek veya uzmanlık ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container fl-content">
        {/* Filters Row */}
        <div className="fl-filters">
          <div className="fl-cats">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`fl-cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <div className="fl-controls">
            <label className="fl-toggle">
              <input type="checkbox" checked={onlyVerified} onChange={e => setOnlyVerified(e.target.checked)} />
              <span className="fl-toggle-track" />
              <span className="fl-toggle-label"><ShieldCheck size={14} /> Doğrulanmış</span>
            </label>
            <select className="fl-sort" value={sort} onChange={e => setSort(e.target.value as "rating" | "jobs")}>
              <option value="rating">En Yüksek Puan</option>
              <option value="jobs">En Fazla İş</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="fl-count">
          <strong>{filtered.length}</strong> freelancer bulundu
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="fl-empty glass-card">
            <Search size={40} style={{ color: "var(--text-muted)" }} />
            <p>Aramanızla eşleşen freelancer bulunamadı.</p>
          </div>
        ) : (
          <div className="fl-grid">
            {filtered.map(f => (
              <article key={f.id} className="fl-card glass-card">
                {/* Card Header */}
                <div className="fl-card-top">
                  <div className="fl-avatar-wrap">
                    <img src={f.avatar_url} alt={f.full_name} className="fl-avatar" />
                    {f.tc_verified ? <span className="fl-verified-dot" title="TC Doğrulanmış" /> : null}
                  </div>
                  <div className="fl-card-info">
                    <h2 className="fl-name">{f.full_name}</h2>
                    <p className="fl-category">{f.category}</p>
                    <div className="fl-badges">
                      {f.tc_verified ? <span className="fl-badge verified">✅ Kimlik Onaylı</span> : null}
                      {f.trust_badge ? <span className="fl-badge trust">⭐ Güven Rozeti</span> : null}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="fl-bio">{f.bio || "Henüz biyografi eklenmemiş."}</p>

                {/* Skills */}
                {f.skills.length > 0 && (
                  <div className="fl-skills">
                    {f.skills.map(s => <span key={s} className="fl-skill">{s}</span>)}
                  </div>
                )}

                {/* Stats */}
                <div className="fl-stats">
                  <div className="fl-stat">
                    <Star size={14} fill="var(--warning)" stroke="none" />
                    <strong>{f.rating_avg > 0 ? f.rating_avg.toFixed(1) : "–"}</strong>
                    <span>Puan</span>
                  </div>
                  <div className="fl-stat-divider" />
                  <div className="fl-stat">
                    <Briefcase size={14} />
                    <strong>{f.total_jobs_completed}</strong>
                    <span>İş</span>
                  </div>
                </div>

                {/* Action */}
                <a href={`/profil/${f.username}`} className="fl-cta-btn btn-primary">
                  Profili Gör <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
