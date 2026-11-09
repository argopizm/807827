import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, Clock3, Sparkles } from "lucide-react";
import CategoryImage from "@/components/CategoryImage";
import { GUIDES, guideReadTime } from "@/lib/guides";
import { publicMetadata } from "@/lib/seo";
import GuideExplorer from "./GuideExplorer";
import styles from "./guides.module.css";

const title = "Freelance Çalışma ve Proje Rehberleri";
const description = "Proje briefi, freelancer seçimi, profil, teklif, revizyon ve teslim rehberleri. Somut örnekler ve kontrol listeleriyle freelance çalışmalarınızı planlayın.";
export const metadata = publicMetadata({ title, description, path: "/rehber" });

export default function GuidesPage() {
  const featured = GUIDES[0];
  const summaries = GUIDES.map(({ slug, title, description, topic, image, ...rest }) => ({ slug, title, description, topic, image, readTime: guideReadTime({ slug, title, description, topic, image, ...rest }) }));
  return <div className={"container " + styles.page}>
    <nav className={styles.crumbs} aria-label="Sayfa yolu"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><span aria-current="page">Rehberler</span></nav>
    <header className={styles.directoryHero}>
      <div className={styles.heroCopy}><span className={styles.kicker}><BookOpen size={17} aria-hidden="true" /> Frenaw rehberleri</span><h1>İyi işler,<br /><em>iyi bir başlangıçla.</em></h1><p>İster ilk projen için uzman ara, ister uzmanlığını paylaş. Freelance çalışmanın her aşaması için örnekler, fikirler ve uygulanabilir kontrol listeleri burada.</p><a href="#rehberler" className={styles.heroLink}>Rehberleri keşfet <ArrowDown size={17} aria-hidden="true" /></a></div>
      <Link href={"/rehber/" + featured.slug} className={styles.featured}><div className={styles.featuredPhoto}><CategoryImage slug={featured.image} title={featured.title} eager /><span className={styles.featuredBadge}><Sparkles size={14} aria-hidden="true" /> Buradan başla</span></div><div className={styles.featuredCopy}><span><Clock3 size={13} aria-hidden="true" /> {guideReadTime(featured)} dk okuma</span><h2>{featured.title}</h2><span className={styles.featuredLink}>İlk briefini hazırla <ArrowUpRight size={18} aria-hidden="true" /></span></div></Link>
    </header>
    <GuideExplorer guides={summaries} />
    <aside className={styles.bottomBanner}><span className={styles.bannerIcon}><Sparkles size={29} strokeWidth={1.4} aria-hidden="true" /></span><div><h2>Fikrini bir sonraki adıma taşı.</h2><p>İhtiyacını netleştirdiysen, projen için doğru uzmanlığı keşfet.</p></div><Link href="/kategoriler">Kategorileri keşfet <ArrowUpRight size={17} aria-hidden="true" /></Link></aside>
  </div>;
}
