"use client";

import { useMemo, useState } from "react";
import { Search, Clock, Users, Building2 } from "lucide-react";

export interface Job {
  id: string;
  title: string;
  client: string;
  budget: string;
  category: string;
  time: string;
  description: string;
  proposals?: number;
  skills?: string[];
}

const CATEGORIES = ["Tümü", "Yazılım", "Tasarım", "Pazarlama", "Çeviri", "Video", "Seslendirme"];

function budgetValue(b: string) {
  const n = b.replace(/\./g, "").match(/\d+/g);
  return n ? Math.max(...n.map(Number)) : 0;
}

export default function JobListClient({ jobs, initialQuery = "", initialCategory = "Tümü" }: { jobs: Job[]; initialQuery?: string; initialCategory?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(CATEGORIES.includes(initialCategory) ? initialCategory : "Tümü");
  const [sort, setSort] = useState<"new" | "budget">("new");

  const counts = useMemo(() => {
    const c: Record<string, number> = { Tümü: jobs.length };
    jobs.forEach((j) => { c[j.category] = (c[j.category] ?? 0) + 1; });
    return c;
  }, [jobs]);

  const list = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("tr");
    const r = jobs.filter((j) =>
      (cat === "Tümü" || j.category === cat) &&
      (!s || `${j.title} ${j.description} ${j.category} ${(j.skills ?? []).join(" ")}`.toLocaleLowerCase("tr").includes(s))
    );
    return sort === "budget" ? [...r].sort((a, b) => budgetValue(b.budget) - budgetValue(a.budget)) : r;
  }, [jobs, q, cat, sort]);

  return (
    <>
      <header className="lp-head">
        <div className="container">
          <div className="lp-crumbs"><a href="/">Ana sayfa</a> / İş İlanları</div>
          <div className="lp-head-row">
            <div>
              <h1>İş İlanları</h1>
              <p>Projelere doğrudan teklif verin. Platform hiçbir ücretten pay almaz.</p>
            </div>
            <a href="/ilan-ver" className="btn-primary">Ücretsiz ilan ver</a>
          </div>
          <div className="lp-search">
            <Search size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Başlık, yetenek veya anahtar kelime ara" aria-label="İlan ara" />
          </div>
        </div>
      </header>

      <div className="container lp-body">
        <aside className="lp-side" aria-label="Filtreler">
          <div className="lp-side-group">
            <h3>Kategori</h3>
            {CATEGORIES.map((c) => (
              <button key={c} className={`lp-opt ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
                {c} <small>{counts[c] ?? 0}</small>
              </button>
            ))}
          </div>
        </aside>

        <section>
          <div className="lp-toolbar">
            <span><strong>{list.length}</strong> ilan listeleniyor</span>
            <select className="lp-select" value={sort} onChange={(e) => setSort(e.target.value as "new" | "budget")} aria-label="Sırala">
              <option value="new">En yeni</option>
              <option value="budget">Bütçe: yüksekten düşüğe</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="lp-empty">
              <strong>Eşleşen ilan bulunamadı</strong>
              Farklı bir anahtar kelime deneyin veya kategori filtresini kaldırın.
            </div>
          ) : (
            list.map((job) => (
              <article key={job.id} className="job-row">
                <div className="job-row-meta">
                  <span className="tag red">{job.category}</span>
                  <span><Clock size={13} /> {job.time}</span>
                  <span><Building2 size={13} /> {job.client || "Anonim işveren"}</span>
                  {job.proposals !== undefined && <span><Users size={13} /> {job.proposals} teklif</span>}
                </div>
                <a href={`/isler/${job.id}`}><h2>{job.title}</h2></a>
                <div className="job-row-budget">
                  <strong>{job.budget}</strong>
                  <span>Sabit bütçe</span>
                </div>
                <p>{job.description}</p>
                <div className="job-row-foot">
                  <div className="tags">{(job.skills ?? []).map((s) => <span key={s} className="tag">{s}</span>)}</div>
                  <a href={`/isler/${job.id}`} className="link-arrow">Teklif ver →</a>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
