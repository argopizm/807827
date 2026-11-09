import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, Sparkles, Layers3, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import CategoryOptions from "./CategoryOptions";
import CategoryImage from "./CategoryImage";
import { CATEGORY_GROUPS } from "@/lib/categories";
import { browseHref, type BrowseParams } from "@/lib/browse";
import styles from "./BrowseLayout.module.css";

export default function BrowseLayout({ title, description, path, filters, count, next, available, sorts, children, action }: {
  title: string;
  description: string;
  path: string;
  filters: BrowseParams;
  count: number;
  next: boolean;
  available: boolean;
  sorts: { value: string; title: string }[];
  children: ReactNode;
  action?: ReactNode;
}) {
  const marketplace = path === "/ilanlar" || path === "/hizmetler";
  const services = path === "/hizmetler";
  return (
    <div className={styles.shell} data-marketplace={marketplace}>
      <header className={marketplace ? styles.hero : "lp-head"}>
        <div className="container">
          <nav className="lp-crumbs" aria-label="Sayfa yolu"><Link href="/">Ana sayfa</Link> / {title}</nav>
          <div className={marketplace ? styles.heroGrid : "lp-head-row"}>
            <div>
              {marketplace && <span className={styles.kicker}><Sparkles size={14}/>{services ? "YETENEKTEN HİZMETE" : "SIRADAKİ İŞ BİRLİĞİN"}</span>}
              <h1>{title}</h1><p className={marketplace ? styles.lead : undefined}>{description}</p>
          <form className={"lp-search " + styles.search} action={path} role="search">
            <Search size={18} aria-hidden="true" />
            <input name="q" defaultValue={filters.q} maxLength={100} placeholder="Anahtar kelime veya uzmanlık ara" aria-label={title + " arama"} />
            {filters.category && <input type="hidden" name="kategori" value={filters.category} />}
            {filters.sort && <input type="hidden" name="sirala" value={filters.sort} />}
            <button className="btn-primary">Ara</button>
          </form>
              {marketplace && <div className={styles.heroActions}>{action}<span><Layers3 size={14}/> %0 platform komisyonu</span></div>}
            </div>
            {marketplace ? <div className={styles.art} aria-hidden="true"><div className={styles.artMain}><CategoryImage slug={services ? "yazilim-teknoloji" : "grafik-tasarim"} title="" eager/></div><div className={styles.artSmall}><CategoryImage slug={services ? "video-animasyon" : "yazilim-teknoloji"} title="" eager/></div><div className={styles.artNote}><span><ArrowUpRight size={20}/></span><div><strong>{services ? "İyi bir fikir, doğru uzman." : "Yeni bir proje. Yeni bir başlangıç."}</strong><small>{services ? "Keşfet, konuş, birlikte üret." : "Uzmanlığınla bir sonraki işe yön ver."}</small></div></div><span className={styles.orbit}/></div> : action}
          </div>
        </div>
      </header>
      <section className={"container " + styles.results} aria-label="Arama sonuçları">
        {marketplace && <nav className={styles.categories} aria-label="Hızlı kategori filtresi"><Link href={browseHref(path,{...filters,category:"",page:1})} aria-current={!filters.category ? "page" : undefined}>Tümü</Link>{CATEGORY_GROUPS.map(group=><Link key={group.slug} href={browseHref(path,{...filters,category:group.slug,page:1})} aria-current={filters.category===group.slug ? "page" : undefined}>{group.title}</Link>)}</nav>}
        <details className={styles.filters}>
          <summary><SlidersHorizontal size={15}/>Filtrele ve sırala{filters.category || filters.sort ? " · Etkin" : ""}</summary>
          <form className={styles.filterForm} action={path}>
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            <label>Kategori<select name="kategori" defaultValue={filters.category}><CategoryOptions allLabel="Tüm kategoriler" /></select></label>
            <label>Sıralama<select name="sirala" defaultValue={filters.sort}>{sorts.map((sort) => <option key={sort.value} value={sort.value}>{sort.title}</option>)}</select></label>
            <button className="btn-primary">Uygula</button>
            <a className="btn-secondary" href={path}>Temizle</a>
          </form>
        </details>
        {available ? (
          <>
            <div className={styles.toolbar}><span><strong>{count}</strong> {marketplace ? services ? "hizmet bu sayfada" : "proje bu sayfada" : "sonuç"}{filters.page > 1 ? " · Sayfa " + filters.page : ""}</span>{marketplace && <small>{services ? "Kapsamı incele, uzmanla doğrudan konuş." : "İhtiyacı keşfet, ilan sahibiyle tanış."}</small>}</div>
            {count ? <div className={marketplace ? styles.cards : undefined}>{children}</div> : <div className={styles.empty}><span className={styles.emptyIcon}><Search size={28}/></span><h2>{!marketplace ? "Sonuç bulunamadı" : filters.q || filters.category ? "Burada henüz bir eşleşme yok." : services ? "İlk hizmetinle burada yerini al." : "Bir sonraki proje senden gelsin."}</h2><p>{!marketplace || filters.q || filters.category ? "Başka bir kelimeyle ara veya tüm kategorilere göz at." : services ? "Hangi işi sunduğunu ve teslim kapsamını anlat. Yeni iş birlikleri profilinle başlasın." : "İhtiyacını paylaş, doğru uzmanlarla aynı yerde buluş."}</p><div>{(filters.q || filters.category) && <Link href={path} className="btn-secondary">Filtreleri temizle</Link>}{action}</div>{marketplace && <Link href="/kategoriler" className={styles.emptyLink}>Uzmanlık alanlarını keşfet <ArrowRight size={15}/></Link>}</div>}
            {(filters.page > 1 || next) && (
              <nav className={styles.pagination} aria-label="Sonuç sayfaları">
                {filters.page > 1 && <a className="btn-secondary" rel="prev" href={browseHref(path, { ...filters, page: filters.page - 1 })}>Önceki</a>}
                {next && <a className="btn-secondary" rel="next" href={browseHref(path, { ...filters, page: filters.page + 1 })}>Sonraki</a>}
              </nav>
            )}
          </>
        ) : <div className="lp-empty"><strong>Liste şu anda yüklenemiyor</strong>Biraz sonra tekrar deneyin.</div>}
      </section>
    </div>
  );
}
