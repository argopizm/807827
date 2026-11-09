import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import CategoryImage from "@/components/CategoryImage";
import { CATEGORY_GROUPS } from "@/lib/categories";
import { publicMetadata } from "@/lib/seo";
import styles from "@/components/CategoryLanding.module.css";

const title = "Freelance Hizmet Kategorileri";
const description = "Tasarım, yazılım, video ve diğer alanlarda uzmanlıkları karşılaştırın. Projenize uygun açık ilan ve freelancer profillerini keşfedin.";
export const metadata = publicMetadata({ title, description, path: "/kategoriler" });
export default function CategoriesPage() {
  return (
    <div className={"container " + styles.page}>
      <nav aria-label="Sayfa yolu" className="lp-crumbs"><Link href="/">Ana sayfa</Link> / Kategoriler</nav>
      <header className={styles.directoryIntro}>
        <div><span className={styles.kicker}><Compass size={16} aria-hidden="true" /> Fikrinin bir uzmanı var</span><h1>Ne hayal ediyorsun?<br /><em>Birlikte başlayalım.</em></h1><p>{description}</p></div>
        <span className={styles.directoryAccent} aria-hidden="true"><Compass strokeWidth={1} /><span>Tasarla. Üret. Geliştir.</span></span>
      </header>
      <h2 className={styles.directoryTitle}>{title}</h2>
      <div className={styles.grid}>
        {CATEGORY_GROUPS.map((category, index) => (
          <Link className={styles.card} key={category.slug} href={"/kategoriler/" + category.slug}>
            <div className={styles.cardPhoto}><CategoryImage slug={category.slug} title={category.title} eager={index < 2} /><span className={styles.photoArrow}><ArrowUpRight size={22} aria-hidden="true" /></span></div>
            <div className={styles.cardText}><h3>{category.title}</h3><p>{category.description}</p><span>{category.specialties.length} uzmanlık alanını keşfet →</span></div>
          </Link>
        ))}
      </div>
      <p className={styles.guideLink}><Link href="/rehber">Projenizi planlamak için Frenaw rehberlerine göz atın.</Link></p>
    </div>
  );
}
