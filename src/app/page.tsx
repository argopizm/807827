export const dynamic = "force-dynamic";


import CategoryImage from "@/components/CategoryImage";
import MarketplaceCard from "@/components/MarketplaceCard";
import FreelancerRail from "@/components/FreelancerRail";
import { randomFreelancers } from "@/lib/browse";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ClipboardList,
  Handshake, MessageCircle, Plus, Search,
} from "lucide-react";
import { CATEGORY_GROUPS } from "@/lib/categories";
import { getDB } from "@/lib/db";
import { jsonLd, publicMetadata, siteUrl } from "@/lib/seo";
import styles from "./page.module.css";

const title = "Frenaw | Türkiye’nin komisyonsuz freelancer platformu";
const description = "Tasarım, yazılım, video ve diğer alanlarda freelancer bulun. Projenizi yayınlayın, uzmanlarla konuşun ve komisyon ödemeden birlikte çalışın.";

const homeMetadata = publicMetadata({ title, description, path: "/" });
const shareImage = { url: "/images/frenaw-paylasim.jpg", width: 1200, height: 630, alt: "Frenaw proje çalışma alanı" };

export const metadata = {
  ...homeMetadata,
  title: { absolute: title },
  openGraph: { ...homeMetadata.openGraph, images: [shareImage] },
  twitter: { card: "summary_large_image" as const, title, description, images: [shareImage.url] },
};

const popularSearches = ["Logo tasarımı", "WordPress", "Video kurgu", "SEO"];

const steps = [
  {
    title: "İşini anlat",
    description: "İhtiyacını, bütçeni ve teslim tarihini yaz. Uzmanlar neye ihtiyacın olduğunu ilk bakışta anlasın.",
    icon: ClipboardList,
    preview: "Proje özeti",
  },
  {
    title: "Uzmanlarla konuş",
    description: "Portföyleri ve teklifleri incele. Aklındaki soruları doğrudan site içi mesajla sor.",
    icon: MessageCircle,
    preview: "Teklifleri karşılaştır",
  },
  {
    title: "Birlikte ilerle",
    description: "Kapsamı ve teslim koşullarını netleştir. Çalışma tamamlandığında deneyimini değerlendir.",
    icon: Handshake,
    preview: "Çalışmayı başlat",
  },
];

const faqs = [
  {
    question: "Frenaw komisyon alıyor mu?",
    answer: "Frenaw, freelancer ile işveren arasında kararlaştırılan proje bedelinden komisyon almaz.",
  },
  {
    question: "Nasıl proje ilanı veririm?",
    answer: "Hesabınıza giriş yaptıktan sonra İlan Ver sayfasında projenin kapsamını, bütçesini ve kategorisini belirtin. İlan yayınlandığında uzmanlar size teklif gönderebilir.",
  },
  {
    question: "Ödeme nasıl gerçekleşiyor?",
    answer: "Ödeme yöntemini ve takvimini taraflar birlikte belirler. Frenaw üzerinden ödeme alınmaz. İşe başlamadan önce kapsamı, teslimleri ve ücret koşullarını yazılı olarak netleştirin.",
  },
  {
    question: "Frenaw kimlik numarası istiyor mu?",
    answer: "Frenaw şu anda T.C. kimlik numarası istemez. Kimlik bilgilerinizi mesaj veya destek talebinde paylaşmayın.",
  },
  {
    question: "Bir sorun yaşarsam nasıl destek alırım?",
    answer: "Hesabınızdaki destek bölümünden talep oluşturabilir ve yanıtları takip edebilirsiniz. Hesap ve platform sorunları için destek ekibine başvurabilirsiniz.",
  },
];

type RecentJob = { id: string; title: string; category: string | null; budget_range: string | null };

async function getHomeData() {
  const fallback = { freelancers: null, completed: null, rating: null, jobs: [] as RecentJob[] };
  try {
    const db = await getDB();
    if (!db) return fallback;

    const [freelancers, completed, rating, recent] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS count FROM users WHERE user_type = 'freelancer' AND onboarding_done = 1 AND username IS NOT NULL").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM jobs WHERE status = 'completed'").first<{ count: number }>(),
      db.prepare("SELECT AVG(rating) AS average FROM reviews WHERE rating BETWEEN 1 AND 5").first<{ average: number | null }>(),
      db.prepare("SELECT id, title, category, budget_range FROM jobs WHERE status = 'open' ORDER BY created_at DESC, id DESC LIMIT 3").all<RecentJob>(),
    ]);

    return {
      freelancers: freelancers?.count ?? 0,
      completed: completed?.count ?? 0,
      rating: rating?.average ?? null,
      jobs: recent.results,
    };
  } catch {
    return fallback;
  }
}

function SectionHeading({ eyebrow, title, id, href, link }: {
  eyebrow?: string;
  title: string;
  id: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 id={id}>{title}</h2>
      </div>
      {href && link && (
        <Link className={styles.textLink} href={href}>
          {link}<ArrowRight size={17} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [stats, freelancers] = await Promise.all([getHomeData(), randomFreelancers()]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Frenaw",
    url: siteUrl.href,
    description,
    inLanguage: "tr-TR",
  };
  const formatter = new Intl.NumberFormat("tr-TR");
  const ratingFormat = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className={styles.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={'container ' + styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 id="home-title">
              Projenize uygun <em>freelancer’ı bulun.</em>
            </h1>
            <p className={styles.heroLead}>
              Tasarımdan yazılıma, videodan çeviriye. Doğru uzmanla tanışın, projenizi konuşun ve komisyon ödemeden birlikte çalışın.
            </p>

            <form action="/profil" className={styles.search} role="search">
              <Search size={21} aria-hidden="true" />
              <input type="search" name="q" placeholder="Uzmanlık ara" aria-label="Freelancer ara" maxLength={100} />
              <button type="submit">Freelancer bul <ArrowRight size={16} aria-hidden="true" /></button>
            </form>
            <div className={styles.popular}>
              <span>Öne çıkanlar</span>
              {popularSearches.map((term) => (
                <Link key={term} href={{ pathname: "/profil", query: { q: term } }}>{term}</Link>
              ))}
            </div>
            <div className={styles.heroBottom}>
              <Link className={styles.textLink} href="/ilan-ver">Ücretsiz proje ilanı ver <ArrowUpRight size={17} aria-hidden="true" /></Link>
              <span><Check size={16} aria-hidden="true" /> %0 platform komisyonu</span>
            </div>
          </div>
          <figure className={styles.heroArt}>
            {/* Local, pre-sized WebP sources keep the hero responsive on Cloudflare Pages. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.heroImage}
              src="/images/frenaw-hero.webp"
              srcSet="/images/frenaw-hero-small.webp 600w, /images/frenaw-hero.webp 1080w"
              sizes="(max-width: 800px) calc(100vw - 36px), 510px"
              width={1080}
              height={900}
              fetchPriority="high"
              alt="Proje üzerinde birlikte çalışan bir ekip"
            />
          </figure>
        </div>
      </section>

      <section className={'container ' + styles.stats} aria-label="Platform verileri">
        <div><strong>%0</strong><span>Platform komisyonu</span></div>
        <div><strong>{stats.freelancers === null ? "—" : formatter.format(stats.freelancers)}</strong><span>Freelancer profili</span></div>
        <div><strong>{stats.completed === null ? "—" : formatter.format(stats.completed)}</strong><span>Tamamlanan proje</span></div>
        <div><strong>{stats.rating === null ? "—" : ratingFormat.format(stats.rating) + " / 5"}</strong><span>Ortalama değerlendirme</span></div>
      </section>

      <section className={'container ' + styles.section} aria-labelledby="category-title">
        <SectionHeading
          eyebrow="Uzmanlık alanları"
          title="Projenin ihtiyacına göre keşfet."
          id="category-title"
          href="/kategoriler"
          link="Tüm kategoriler"
        />
        <div className={styles.categories}>
          {CATEGORY_GROUPS.map((group) => (
            <Link key={group.slug} className={styles.category} href={'/kategoriler/' + group.slug}>
              <div className={styles.categoryPhoto}>
                <CategoryImage slug={group.slug} title={group.title} />
              </div>
              <div className={styles.categoryInfo}>
                <span>{group.specialties.length} uzmanlık</span>
                <h3>{group.title}</h3>
                <ArrowUpRight size={20} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <FreelancerRail profiles={freelancers.items} available={freelancers.available} />

      <section id="nasil" className={styles.process} aria-labelledby="process-title">
        <div className={'container ' + styles.section}>
          <SectionHeading title="Fikirden iş birliğine." id="process-title" />
          <div className={styles.steps}>
            {steps.map(({ title, description, icon: Icon, preview }) => (
              <article key={title} className={styles.step}>
                <div className={styles.stepVisual} aria-hidden="true">
                  <span className={styles.stepIcon}><Icon size={25} strokeWidth={1.75} /></span>
                  <span className={styles.stepPreview}>
                    {preview}<span /><span />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={'container ' + styles.section} aria-labelledby="jobs-title">
        <SectionHeading title="Yayındaki son ilanlar." id="jobs-title" href="/ilanlar" link="Tüm ilanlar" />
        {stats.jobs.length > 0 ? (
          <div className={styles.jobs}>
            {stats.jobs.map((job) => (
                <MarketplaceCard key={job.id} variant="home" href={'/isler/' + encodeURIComponent(job.id)} title={job.title} category={job.category} budget={job.budget_range || "Bütçe görüşülür"}/>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Burada gösterilecek açık proje bulunamadı.</p>
            <Link href="/ilan-ver" className={styles.textLink}>Proje ilanı ver <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      <section id="sss" className={styles.faqSection} aria-labelledby="faq-title">
        <div className={'container ' + styles.section + ' ' + styles.faqGrid}>
          <div>
            <SectionHeading eyebrow="Sıkça sorulan sorular" title="Aklınıza takılanlar." id="faq-title" />
            <Link href="/destek" className={styles.textLink}>Destek merkezi <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className={styles.faq}>
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}<Plus size={20} aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={'container ' + styles.section} aria-labelledby="join-title">
        <div className={styles.join}>
          <div>
            <span className={styles.eyebrow}>Frenaw’a katılın</span>
            <h2 id="join-title">Sıradaki projeniz burada başlayabilir.</h2>
          </div>
          <Link href="/ilan-ver" className={styles.joinButton}>İlan ver <ArrowDownRight size={19} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
