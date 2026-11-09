import Link from "next/link";
import { cache } from "react";
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, UsersRound, Sparkles, Check, PenTool, Code2, Clapperboard, Megaphone, AudioLines, Languages, ChartNoAxesCombined, Globe, Smartphone, ShoppingBag, Database, Server, Gamepad2, Monitor, Palette, Camera, LayoutTemplate, Search, FileText, Lightbulb } from "lucide-react";
import { categoryPath } from "@/lib/categories";
import type { CategoryPageData } from "@/lib/category-pages";
import { browseFreelancers, browseHref, browseJobs, getCategoryInventory } from "@/lib/browse";
import { jsonLd, siteUrl } from "@/lib/seo";
import CategoryImage from "./CategoryImage";
import styles from "./CategoryLanding.module.css";

export const categoryInventory = cache(getCategoryInventory);
const groupIcons = { "grafik-tasarim": PenTool, "yazilim-teknoloji": Code2, "video-animasyon": Clapperboard, "dijital-pazarlama": Megaphone, "ses-muzik": AudioLines, "yazi-ceviri": Languages, "is-yonetim": ChartNoAxesCombined };
function specialtyIcon(slug: string, fallback: typeof Code2) {
  if (/wordpress|web-gelistirme|alan-adi/.test(slug)) return Globe;
  if (/mobil/.test(slug)) return Smartphone;
  if (/ticaret|ambalaj/.test(slug)) return ShoppingBag;
  if (/veri|analiz/.test(slug)) return Database;
  if (/sunucu|destek/.test(slug)) return Server;
  if (/oyun/.test(slug)) return Gamepad2;
  if (/masaustu|cms/.test(slug)) return Monitor;
  if (/logo|illustrasyon|sanat/.test(slug)) return Palette;
  if (/foto|cekim/.test(slug)) return Camera;
  if (/arayuz|sunum/.test(slug)) return LayoutTemplate;
  if (/seo|test|arastirma/.test(slug)) return Search;
  if (/metin|yazi|ceviri/.test(slug)) return FileText;
  return fallback;
}
export default async function CategoryLanding({ category }: { category: CategoryPageData }) {
  const { group, specialty, title, description, path, value } = category;
  const filters = { category: value, q: "", sort: "", page: 1 };
  const [jobs, profiles] = await Promise.all([browseJobs(filters), browseFreelancers(filters)]);
  const Icon = groupIcons[group.slug as keyof typeof groupIcons] ?? Sparkles;
  const crumbs = [{ name: "Ana sayfa", path: "/" }, { name: "Kategoriler", path: "/kategoriler" }, ...(specialty ? [{ name: group.title, path: categoryPath(group.slug) }] : []), { name: title, path }];
  const fields = specialty ? group.specialties.filter((item) => item.slug !== specialty.slug).slice(0, 6) : group.specialties;
  return (
    <div className={"container " + styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: new URL(crumb.path, siteUrl).href })),
      }) }} />
      <nav aria-label="Sayfa yolu" className="lp-crumbs">{crumbs.map((crumb, index) => <span key={crumb.path}>{index > 0 && <span aria-hidden="true"> / </span>}{crumb.path === path ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.path}>{crumb.name}</Link>}</span>)}</nav>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}><Icon size={17} aria-hidden="true" /> {specialty ? group.title : "Fikirden gerçeğe"}</span>
          <h1>{title}</h1><p>{description}</p>
          <div className={styles.actions}>
            <Link href={browseHref("/profil", filters)} className="btn-primary">Uzmanları keşfet <ArrowUpRight size={17} aria-hidden="true" /></Link>
            <a href="#uzmanliklar" className={styles.quietLink}>{specialty ? "İlgili alanları gör" : "Uzmanlık alanları"} <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
          <span className={styles.heroNote}><Check size={15} aria-hidden="true" /> Doğrudan iletişim · %0 platform komisyonu</span>
        </div>
        <div className={styles.heroVisual}><CategoryImage slug={group.slug} title={group.title} eager /><span className={styles.heroStamp} aria-hidden="true"><Icon size={27} strokeWidth={1.5} /><span>İyi fikirler,<br /><strong>doğru insanlarla.</strong></span></span></div>
      </header>
      <section id="uzmanliklar" className={styles.section}>
        <div className={styles.sectionHeading}><div><h2>{specialty ? "İlgini çekebilecek alanlar" : "Ne üzerinde çalışalım?"}</h2><p>{specialty ? "Projenin diğer ihtiyaçlarını da keşfet." : "İhtiyacına en yakın alanı seç, aradığını daha kolay bul."}</p></div><span className={styles.count}>{fields.length} alan</span></div>
        <ul className={styles.specialties}>{fields.map((item) => {
          const FieldIcon = specialtyIcon(item.slug, Icon);
          return <li key={item.slug}><Link href={categoryPath(item.slug)}><span className={styles.fieldIcon}><FieldIcon size={24} strokeWidth={1.5} aria-hidden="true" /></span><span>{item.title}</span><ArrowUpRight size={17} aria-hidden="true" /></Link></li>;
        })}</ul>
      </section>
      <div className={styles.inventory}>
        <section className={styles.resultPanel}>
          <div className={styles.sectionHeading}><h2><UsersRound size={21} aria-hidden="true" /> Bu alandaki freelancer’lar</h2><Link href={browseHref("/profil", filters)} aria-label="Bu alandaki tüm freelancer profillerini gör"><ArrowUpRight size={22} aria-hidden="true" /></Link></div>
          {profiles.items.length ? <ul className={styles.profiles}>{profiles.items.slice(0, 4).map((profile) => <li key={profile.id}><Link href={"/profil/" + encodeURIComponent(profile.username)}><span className={styles.avatar}>{profile.name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><span><strong>{profile.name}</strong><small>{profile.title}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link></li>)}</ul> : <div className={styles.empty}><UsersRound size={36} strokeWidth={1} aria-hidden="true" /><h3>{profiles.available ? "Yeni tanışmalar yakında." : "Profiller yüklenemedi."}</h3><p>{profiles.available ? "Bu alanda henüz herkese açık profil yok. Uzmanlığını paylaşan ilk kişilerden biri ol." : "Lütfen biraz sonra yeniden dene."}</p><Link href={profiles.available ? "/giris?mode=kayit" : browseHref("/profil", filters)}>{profiles.available ? "Freelancer olarak katıl" : "Yeniden dene"} <ArrowUpRight size={15} aria-hidden="true" /></Link></div>}
        </section>
        <section className={styles.resultPanel}>
          <div className={styles.sectionHeading}><h2><BriefcaseBusiness size={21} aria-hidden="true" /> Açık proje ilanları</h2><Link href={browseHref("/ilanlar", filters)} aria-label="Bu alandaki tüm açık ilanları gör"><ArrowUpRight size={22} aria-hidden="true" /></Link></div>
          {jobs.items.length ? <ul className={styles.jobs}>{jobs.items.slice(0, 4).map((job) => <li key={job.id}><Link href={"/isler/" + encodeURIComponent(job.id)}><span><small>{job.time}</small><strong>{job.title}</strong><span>{job.budget}</span></span><ArrowUpRight size={19} aria-hidden="true" /></Link></li>)}</ul> : <div className={styles.empty}><BriefcaseBusiness size={36} strokeWidth={1} aria-hidden="true" /><h3>{jobs.available ? "Sıradaki proje seninki olabilir." : "İlanlar yüklenemedi."}</h3><p>{jobs.available ? "İhtiyacını anlat, bütçeni belirle ve uygun uzmanlarla doğrudan konuşmaya başla." : "Lütfen biraz sonra yeniden dene."}</p><Link href="/ilan-ver">Proje ilanı ver <ArrowUpRight size={15} aria-hidden="true" /></Link></div>}
        </section>
      </div>
      <aside className={styles.guide}>
        <span className={styles.guideIcon}><Lightbulb size={30} strokeWidth={1.4} aria-hidden="true" /></span>
        <div><h2>İyi bir başlangıç, net bir proje özeti.</h2><p>{group.guidance}</p></div>
        <Link href="/rehber/freelance-proje-briefi">Kısa rehberi oku <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </aside>
    </div>
  );
}
