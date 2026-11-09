import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCheck, Clock3, Lightbulb, List, Quote } from "lucide-react";
import CategoryImage from "@/components/CategoryImage";
import { GUIDES, guideReadTime } from "@/lib/guides";
import { jsonLd, publicMetadata, siteUrl } from "@/lib/seo";
import GuideCard from "../GuideCard";
import styles from "../guides.module.css";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return GUIDES.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;
async function getGuide(params: Props["params"]) {
  const { slug } = await params;
  const guide = GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  return guide;
}
export async function generateMetadata({ params }: Props) {
  const guide = await getGuide(params);
  const metadata = publicMetadata({ title: guide.title, description: guide.description, path: "/rehber/" + guide.slug });
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article" } };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getGuide(params);
  const others = GUIDES.filter((item) => item.slug !== guide.slug);
  const related = [...others.filter((item) => item.topic === guide.topic), ...others.filter((item) => item.topic !== guide.topic)].slice(0, 3);
  const path = "/rehber/" + guide.slug;
  const articleUrl = new URL(path, siteUrl).href;
  return <div className={"container " + styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description, inLanguage: "tr-TR", articleSection: guide.topic, mainEntityOfPage: articleUrl, url: articleUrl, image: new URL("/images/categories/" + guide.image + "-v2.webp", siteUrl).href, author: { "@type": "Organization", name: "Frenaw", url: siteUrl.href } },
      { "@type": "BreadcrumbList", itemListElement: [{ name: "Ana sayfa", path: "/" }, { name: "Rehberler", path: "/rehber" }, { name: guide.title, path }].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, siteUrl).href })) },
    ] }) }} />
    <nav className={styles.crumbs} aria-label="Sayfa yolu"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><Link href="/rehber">Rehberler</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.topic}</span></nav>
    <article>
      <header className={styles.articleHero}><div className={styles.articleTitle}><div className={styles.articleMeta}><span className={styles.kicker}><BookOpen size={15} aria-hidden="true" /> {guide.topic}</span><span><Clock3 size={14} aria-hidden="true" /> {guideReadTime(guide)} dk okuma</span></div><h1>{guide.title}</h1><p>{guide.description}</p></div><div className={styles.articlePhoto}><CategoryImage slug={guide.image} title={guide.title} eager /></div></header>
      <div className={styles.articleLayout}>
        <div className={styles.articleBody}>
          <aside className={styles.takeaway} aria-labelledby="rehber-ozet"><span><Lightbulb size={21} strokeWidth={1.5} aria-hidden="true" /><strong id="rehber-ozet">Bir bakışta</strong></span><p>{guide.takeaway}</p></aside>
          <nav className={styles.mobileContents} aria-label="Rehber içindekiler"><details><summary><List size={18} aria-hidden="true" /> Bu rehberde <span>+</span></summary><ul>{guide.sections.map((section, index) => <li key={section.title}><a href={"#bolum-" + (index + 1)}>{section.title}</a></li>)}<li><a href="#kontrol-listesi">Kontrol listesi</a></li></ul></details></nav>
          {guide.sections.map((section, index) => <section id={"bolum-" + (index + 1)} className={styles.articleSection} key={section.title}><h2>{section.title}</h2><p>{section.body}</p>{section.points && <ul className={styles.points}>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}{section.example && <aside className={styles.example}><span><Quote size={17} aria-hidden="true" /> Somut bir örnek</span><p>{section.example}</p></aside>}</section>)}
          <section id="kontrol-listesi" className={styles.checklist} aria-labelledby="kontrol-baslik"><h2 id="kontrol-baslik"><CheckCheck size={24} aria-hidden="true" /> Son bir gözden geçirme.</h2><p>İlerlemeden önce bu maddeleri tek tek kontrol edebilirsin.</p><div>{guide.checklist.map((item, index) => <label key={item} htmlFor={"kontrol-" + index}><input id={"kontrol-" + index} type="checkbox" /><span>{item}</span></label>)}</div></section>
          <aside className={styles.articleAction}><div><h2>Şimdi sıradaki adım.</h2><p>Rehberdeki notları kendi projen için kullanmaya başlayabilirsin.</p></div><Link href={guide.action.href}>{guide.action.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></aside>
          <Link className={styles.backLink} href="/rehber"><ArrowLeft size={16} aria-hidden="true" /> Tüm rehberlere dön</Link>
        </div>
        <aside className={styles.sidebar}><div className={styles.sidebarInner}><nav aria-label="Rehber içindekiler"><h2><List size={17} aria-hidden="true" /> Bu rehberde</h2><ul>{guide.sections.map((section, index) => <li key={section.title}><a href={"#bolum-" + (index + 1)}>{section.title}</a></li>)}<li><a href="#kontrol-listesi">Kontrol listesi</a></li></ul></nav><div className={styles.sidebarHelp}><BookOpen size={25} strokeWidth={1.5} aria-hidden="true" /><h3>Birlikte daha kolay.</h3><p>Platformla ilgili bir soruda destek merkezine göz atabilirsin.</p><Link href="/destek">Destek merkezi <ArrowUpRight size={15} aria-hidden="true" /></Link></div></div></aside>
      </div>
    </article>
    <section className={styles.related} aria-labelledby="ilgili-rehberler"><div className={styles.listHeading}><div><h2 id="ilgili-rehberler">Buradan devam edebilirsin.</h2><p>Bir sonraki adımına yardımcı olacak diğer rehberler.</p></div><Link className={styles.heroLink} href="/rehber">Tüm rehberler <ArrowUpRight size={17} aria-hidden="true" /></Link></div><div className={styles.grid}>{related.map((item) => <GuideCard key={item.slug} guide={{ slug: item.slug, title: item.title, description: item.description, topic: item.topic, image: item.image, readTime: guideReadTime(item) }} />)}</div></section>
  </div>;
}
