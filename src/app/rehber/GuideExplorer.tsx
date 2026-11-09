"use client";

import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import GuideCard, { type GuideSummary } from "./GuideCard";
import styles from "./guides.module.css";

function searchText(text: string) {
  return text.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function GuideExplorer({ guides }: { guides: GuideSummary[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("Tümü");
  const topics = ["Tümü", ...new Set(guides.map((guide) => guide.topic))];
  const words = searchText(query.trim()).split(/\s+/).filter(Boolean);
  const filtered = guides.filter((guide) => (topic === "Tümü" || guide.topic === topic) && words.every((word) => searchText(guide.title + " " + guide.description + " " + guide.topic).includes(word)));
  return <section id="rehberler" className={styles.explorer} aria-labelledby="rehber-listesi">
    <div className={styles.listHeading}><div><h2 id="rehber-listesi">İhtiyacın olan yerden başla.</h2><p>Proje planlamadan son teslime, her aşama için pratik notlar.</p></div><div className={styles.search} role="search"><Search size={19} aria-hidden="true" /><input type="search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} placeholder="Brief, profil, revizyon…" aria-label="Rehberlerde ara" /></div></div>
    <div className={styles.filterRow}><div className={styles.filters} role="group" aria-label="Rehber konusu">{topics.map((item) => <button type="button" key={item} aria-pressed={item === topic} onClick={() => setTopic(item)}>{item}</button>)}</div><p role="status" aria-live="polite">{filtered.length} rehber</p></div>
    {filtered.length ? <div className={styles.grid}>{filtered.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}</div> : <div className={styles.empty}><BookOpen size={36} strokeWidth={1.2} aria-hidden="true" /><h3>Bu aramada bir rehber bulamadık.</h3><p>Farklı bir kelime deneyebilir veya tüm rehberlere dönebilirsin.</p><button type="button" onClick={() => { setQuery(""); setTopic("Tümü"); }}>Tüm rehberleri göster</button></div>}
  </section>;
}
