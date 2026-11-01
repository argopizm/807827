"use client";

import { useMemo, useState } from "react";
import { Search, Star, ShieldCheck, Award } from "lucide-react";

interface Freelancer {
  id: string; username: string; full_name: string; email: string;
  avatar_url: string; bio: string; tc_verified: number; trust_badge: number;
  total_jobs_completed: number; rating_avg: number; skills: string[]; category: string;
  title?: string;
}

const CATEGORIES = ["Tümü", "Yazılım", "Tasarım", "Pazarlama", "Çeviri", "Video", "Seslendirme"];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toLocaleUpperCase("tr");
}

export default function FreelancerListClient({ freelancers }: { freelancers: Freelancer[] }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tümü");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyTrusted, setOnlyTrusted] = useState(false);
  const [sort, setSort] = useState<"rating" | "jobs">("rating");

  const counts = useMemo(() => {
    const c: Record<string, number> = { Tümü: freelancers.length };
    freelancers.forEach((f) => { c[f.category] = (c[f.category] ?? 0) + 1; });
    return c;
  }, [freelancers]);

  const filtered = freelancers
    .filter((f) => {
      const q = search.toLocaleLowerCase("tr");
      const matchSearch = !q || `${f.full_name} ${f.bio} ${f.title ?? ""} ${f.skills.join(" ")}`.toLocaleLowerCase("tr").includes(q);
      const matchCat = activeCat === "Tümü" || f.category === activeCat;
      return matchSearch && matchCat && (!onlyVerified || f.tc_verified) && (!onlyTrusted || f.trust_badge);
    })
    .sort((a, b) => (sort === "rating" ? b.rating_avg - a.rating_avg : b.total_jobs_completed - a.total_jobs_completed));

  return (
    <>
      <header className="lp-head">
        <div className="container">
          <div className="lp-crumbs"><a href="/">Ana sayfa</a> / Freelancer Bul</div>
          <div className="lp-head-row">
            <div>
              <h1>Freelancer Bul</h1>
              <p>Projeniz için doğru uzmanı seçin, doğrudan iletişime geçin.</p>
            </div>
          </div>
          <div className="lp-search">
            <Search size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="İsim, uzmanlık veya yetenek ara (örn. React, logo, çeviri)" aria-label="Freelancer ara" />
          </div>
        </div>
      </header>

      <div className="container lp-body">
        <aside className="lp-side" aria-label="Filtreler">
          <div className="lp-side-group">
            <h3>Uzmanlık</h3>
            {CATEGORIES.map((c) => (
              <button key={c} className={`lp-opt ${activeCat === c ? "active" : ""}`} onClick={() => setActiveCat(c)}>
                {c} <small>{counts[c] ?? 0}</small>
              </button>
            ))}
          </div>
          <div className="lp-side-group">
            <h3>Güven</h3>
            <label className="lp-check"><input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)} /> Kimliği doğrulanmış</label>
            <label className="lp-check"><input type="checkbox" checked={onlyTrusted} onChange={(e) => setOnlyTrusted(e.target.checked)} /> Güven rozetli</label>
          </div>
        </aside>

        <section>
          <div className="lp-toolbar">
            <span><strong>{filtered.length}</strong> freelancer</span>
            <select className="lp-select" value={sort} onChange={(e) => setSort(e.target.value as "rating" | "jobs")} aria-label="Sırala">
              <option value="rating">En yüksek puan</option>
              <option value="jobs">En çok tamamlanan iş</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="lp-empty">
              <strong>Sonuç bulunamadı</strong>
              Aramanızı genişletmeyi veya filtreleri kaldırmayı deneyin.
            </div>
          ) : (
            filtered.map((f) => (
              <article key={f.id} className="fr-row">
                <a href={`/profil/${f.username}`} className="ava lg" aria-hidden="true">
                  {f.avatar_url ? <img src={f.avatar_url} alt="" /> : initials(f.full_name)}
                </a>
                <div>
                  <div className="fr-name">
                    <a href={`/profil/${f.username}`}><h2>{f.full_name}</h2></a>
                    {f.tc_verified ? <span className="fr-verified"><ShieldCheck size={14} /> Kimlik onaylı</span> : null}
                    {f.trust_badge ? <span className="fr-verified" style={{ color: "var(--primary)" }}><Award size={14} /> Güven rozeti</span> : null}
                  </div>
                  <div className="fr-title">{f.title ?? f.category}</div>
                  <p className="fr-bio">{f.bio || "Henüz biyografi eklenmemiş."}</p>
                  {f.skills.length > 0 && (
                    <div className="tags">{f.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
                  )}
                </div>
                <div className="fr-side">
                  <span className="fr-rating">
                    <Star size={15} fill="currentColor" stroke="none" />
                    {f.rating_avg > 0 ? f.rating_avg.toFixed(1).replace(".", ",") : "Yeni"}
                  </span>
                  <small>{f.total_jobs_completed} tamamlanan iş</small>
                  <a href={`/profil/${f.username}`} className="btn-secondary">Profili incele</a>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
