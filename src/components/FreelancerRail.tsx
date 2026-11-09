"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, UsersRound } from "lucide-react";
import type { BrowseFreelancer } from "@/lib/browse";
import TeamLanyardRail, { type LanyardMember } from "./ui/team-lanyard-rail";
import styles from "./FreelancerRail.module.css";

export default function FreelancerRail({ profiles, available }: { profiles: BrowseFreelancer[]; available: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: .15 });
    if (root.current) observer.observe(root.current);
    const visibility = () => setPlaying(!document.hidden && !!root.current && root.current.getBoundingClientRect().bottom > 0 && root.current.getBoundingClientRect().top < window.innerHeight);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const items: LanyardMember[] = profiles.map((profile, index) => ({
    id: profile.id, name: profile.name, role: profile.title, team: "Frenaw · " + profile.category,
    image: profile.avatar, bio: profile.bio || "Uzmanlık alanlarını ve çalışma detaylarını profilinde keşfet.", tags: profile.skills.slice(0, 3),
    tone: (index % 5 + 1) as LanyardMember["tone"],
    links: [{ label: "Profili incele", href: "/profil/" + encodeURIComponent(profile.username) }],
  }));
  return (
    <div ref={root} className={"container " + styles.section}>
      {items.length ? <TeamLanyardRail
        items={items} heading="Bir sonraki iş arkadaşınla tanış."
        caption="Kartlara dokun, çevir ve uzmanların profillerini keşfet."
        labels={{ flip: "Kartı çevirmek için tıkla veya Enter’a bas.", back: "Geri çevirmek için tekrar tıkla veya Esc’ye bas.", show: "Profili göster:" }}
        autoplay={playing} interval={4000}
        action={<Link className={styles.link} href="/profil">Tüm freelancer’ları keşfet <ArrowUpRight size={18} aria-hidden="true" /></Link>}
      /> : <section className={styles.empty}>
        <span className={styles.icon}><UsersRound size={30} aria-hidden="true" /></span>
        <div><h2>Bir sonraki iş arkadaşın burada.</h2><p>{available ? "Freelancer’lar profillerini tamamladıkça burada keşfedilmeye başlayacak." : "Freelancer profilleri şu anda yüklenemiyor. Biraz sonra tekrar deneyebilirsin."}</p></div>
        <Link className={styles.link} href={available ? "/giris?mode=kayit" : "/profil"}>{available ? "Sen de aramıza katıl" : "Freelancer’ları keşfet"} <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>}
    </div>
  );
}
