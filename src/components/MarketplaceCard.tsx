import Link from "next/link";
import { ArrowUpRight, Clock3, Layers3, Users, Wallet } from "lucide-react";
import CategoryImage from "./CategoryImage";
import { categoryTitle, getCategory } from "@/lib/categories";
import styles from "./MarketplaceCard.module.css";

type Props = {
  href: string; title: string; category: string | null; budget: string;
  description?: string; person?: string; personHref?: string; time?: string;
  proposals?: number; skills?: string[]; variant?: "project" | "service" | "home";
};

export default function MarketplaceCard({ href, title, category, budget, description, person, personHref, time, proposals, skills = [], variant = "project" }: Props) {
  const group = getCategory(category ?? "");
  const label = categoryTitle(category);
  return <article className={styles.card + " " + styles[variant]}>
    <Link href={href} className={styles.visual} tabIndex={-1} aria-hidden="true">
      <CategoryImage slug={group?.slug ?? "is-yonetim"} title={group?.title ?? "Projeler"}/>
      <span className={styles.visualLabel}><Layers3 size={13}/>{variant === "service" ? "Uzmanından hizmet" : "Birlikte üret"}</span>
      <span className={styles.visualArrow}><ArrowUpRight size={20}/></span>
    </Link>
    <div className={styles.content}>
      <div className={styles.meta}><span className={styles.category}>{label}</span>{time && <span><Clock3 size={13}/>{time}</span>}{proposals !== undefined && <span><Users size={13}/>{proposals} teklif</span>}</div>
      {variant === "home" ? <h3><Link href={href}>{title}</Link></h3> : <h2><Link href={href}>{title}</Link></h2>}
      {description && <p className={styles.description}>{description}</p>}
      {skills.length > 0 && <div className={styles.tags}>{skills.slice(0, 5).map(skill => <span key={skill}>{skill}</span>)}{skills.length > 5 && <span>+{skills.length - 5}</span>}</div>}
      {person && <div className={styles.person}><span aria-hidden="true">{person.trim().slice(0, 1).toLocaleUpperCase("tr-TR")}</span>{personHref ? <Link href={personHref}>{person}</Link> : <strong>{person}</strong>}</div>}
      <div className={styles.footer}><div className={styles.budget}><Wallet size={17}/><div><small>{variant === "service" ? "Hizmet ücreti" : "Proje bütçesi"}</small><strong>{budget}</strong></div></div><Link href={href} className={styles.cta}>{variant === "service" ? "Hizmeti keşfet" : "İlanı incele"}<ArrowUpRight size={17}/></Link></div>
    </div>
  </article>;
}
