export const runtime = "edge";

import type { Metadata } from "next";
import {
  Search, Check, ArrowRight, Code2, PenTool, Megaphone,
  Languages, Clapperboard, Mic, Wallet, ShieldCheck,
  Handshake, Lock, Minus, Plus
} from "lucide-react";
import { getDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "Freelancer Türkiye | %0 Komisyonlu Freelancer Platformu",
  description: "Türkiye'nin tek komisyonsuz freelancer platformu. Yazılım, tasarım, çeviri ve daha fazlası için iş ilanı verin veya teklif alın. TC Kimlik doğrulamalı güvenli profiller.",
  keywords: ["freelancer türkiye", "komisyonsuz freelancer", "iş ilanı", "yazılım freelancer", "tasarım iş ilanı", "uzak çalışma", "serbest çalışan"],
  openGraph: {
    title: "Freelancer Türkiye | %0 Komisyonsuz Platform",
    description: "Aracı yok, komisyon yok. Türk freelancer'lar için en şeffaf platform.",
    url: "https://807827.pages.dev",
    siteName: "Freelancer Türkiye",
    locale: "tr_TR",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Freelancer Türkiye komisyon alıyor mu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hayır. Freelancer Türkiye %0 komisyon alır. Kazandığınızın tamamı sizin."
      }
    },
    {
      "@type": "Question",
      "name": "Nasıl iş ilanı verebilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hesap oluşturun, 'İlan Ver' sayfasına gidin ve projenizin detaylarını doldurun. İlanınız dakikalar içinde yayında olur."
      }
    },
    {
      "@type": "Question",
      "name": "TC Kimlik doğrulaması zorunlu mu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zorunlu değil, ancak TC Kimlik doğrulaması yapan kullanıcılar 'Onaylı Profil' rozeti kazanır ve daha fazla güven uyandırır."
      }
    },
    {
      "@type": "Question",
      "name": "Ödeme nasıl gerçekleşiyor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ödeme tamamen freelancer ve işveren arasında gerçekleşir. Platform herhangi bir kesinti yapmaz. İki taraf anlaştıktan sonra 'El Sıkışma' süreci başlatılır."
      }
    },
    {
      "@type": "Question",
      "name": "Platform güvenli mi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Evet. TC Kimlik doğrulaması, Google ile güvenli giriş ve şifreli iletişim sayesinde platformumuz güvenli bir ortam sunar."
      }
    }
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Freelancer Türkiye",
  "url": "https://807827.pages.dev",
  "description": "Türkiye'nin komisyonsuz freelancer platformu",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://807827.pages.dev/ilanlar?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const faqs = [
  {
    q: "Freelancer Türkiye komisyon alıyor mu?",
    a: "Hayır. Freelancer Türkiye %0 komisyon alır. Kazandığınızın tamamı size aittir. Platform, ileride premium özellikler sunabilir ancak temel hizmetler her zaman ücretsiz kalacaktır."
  },
  {
    q: "Nasıl iş ilanı verebilirim?",
    a: "Hesap oluşturun, 'İlan Ver' sayfasına gidin ve projenizin detaylarını (bütçe, kategori, açıklama) doldurun. İlanınız dakikalar içinde yayında olur."
  },
  {
    q: "TC Kimlik doğrulaması zorunlu mu?",
    a: "Zorunlu değil, tamamen isteğe bağlı. Ancak TC Kimlik doğrulaması yapan kullanıcılar profillerinde 'Onaylı Profil' rozeti kazanır ve bu sayede çok daha fazla güven uyandırır. Bilgileriniz sistemimizde saklanmaz."
  },
  {
    q: "Ödeme nasıl gerçekleşiyor?",
    a: "Ödeme tamamen freelancer ve işveren arasında gerçekleşir. Platform herhangi bir kesinti yapmaz. İki taraf anlaşma sağladıktan sonra platform üzerinden 'El Sıkışma' süreci başlatılır ve iş resmi hale gelir."
  },
  {
    q: "Anlaşmazlık durumunda ne olur?",
    a: "Platform bir tahkim veya arabuluculuk mekanizması sunmaktadır. Taraflar arasında anlaşmazlık yaşanması durumunda destek ekibimiz yönlendirme yapabilir. Bu nedenle tüm iletişimi platform üzerinde tutmanızı öneririz."
  },
  {
    q: "Hangi ödeme yöntemleri kabul ediliyor?",
    a: "Platform herhangi bir ödeme yöntemi zorunlu kılmaz; bu tamamen taraflara bırakılmıştır. Havale/EFT, kripto para veya nakit gibi her türlü yöntem kullanılabilir."
  },
];

const categories = [
  { icon: Code2, title: "Yazılım & Kod", desc: "Web, mobil, API geliştirme", q: "Yazılım" },
  { icon: PenTool, title: "Tasarım & UI/UX", desc: "Logo, arayüz, kurumsal kimlik", q: "Tasarım" },
  { icon: Megaphone, title: "Dijital Pazarlama", desc: "SEO, sosyal medya, reklam", q: "Pazarlama" },
  { icon: Languages, title: "Çeviri & Yazarlık", desc: "Teknik çeviri, içerik, metin", q: "Çeviri" },
  { icon: Clapperboard, title: "Video & Animasyon", desc: "Kurgu, motion grafik, reklam", q: "Video" },
  { icon: Mic, title: "Seslendirme", desc: "Reklam, e-kitap, podcast", q: "Seslendirme" },
];

const steps = [
  { num: "01", title: "Hesabınızı oluşturun", desc: "E-posta ya da Google hesabınızla dakikalar içinde ücretsiz kayıt olun. Kredi kartı gerekmez." },
  { num: "02", title: "İlan verin veya teklif gönderin", desc: "Projenizi yayınlayın ya da size uygun ilanlara doğrudan teklif verin." },
  { num: "03", title: "Anlaşın, el sıkışın", desc: "Şartlarda uzlaşınca El Sıkışma ile işi kayıt altına alın. Ödeme doğrudan taraflar arasında." },
];

interface LiveStats {
  freelancerCount: number;
  completedJobs: number;
  avgRating: number;
  recentJobs: { id: string; title: string; category: string; budget: string; proposals: number }[];
}

async function getHomeData(): Promise<LiveStats> {
  const fallback: LiveStats = { freelancerCount: 0, completedJobs: 0, avgRating: 0, recentJobs: [] };
  try {
    const db = await getDB();
    if (!db) return fallback;

    const flRow = await db
      .prepare("SELECT COUNT(*) AS cnt FROM users WHERE user_type = 'freelancer' OR user_type IS NULL")
      .first<{ cnt: number }>();

    const completedRow = await db
      .prepare("SELECT (SELECT COUNT(*) FROM jobs WHERE status = 'completed') + COALESCE((SELECT SUM(total_jobs_completed) FROM users), 0) AS total")
      .first<{ total: number }>();

    const ratingRow = await db
      .prepare("SELECT COALESCE((SELECT AVG(rating) FROM reviews), (SELECT AVG(rating_avg) FROM users WHERE rating_avg > 0), 0) AS avg_rating")
      .first<{ avg_rating: number }>();

    const { results: jobs } = await db
      .prepare(
        `SELECT j.id, j.title, j.category, j.budget_range,
                (SELECT COUNT(*) FROM handshakes h WHERE h.job_id = j.id) AS proposals
         FROM jobs j
         WHERE j.status = 'open'
         ORDER BY j.created_at DESC
         LIMIT 3`
      )
      .all<{ id: string; title: string; category: string | null; budget_range: string | null; proposals: number }>();

    return {
      freelancerCount: flRow?.cnt ?? 0,
      completedJobs: completedRow?.total ?? 0,
      avgRating: Number(ratingRow?.avg_rating ?? 0),
      recentJobs: (jobs ?? []).map((j) => ({
        id: String(j.id),
        title: String(j.title),
        category: String(j.category ?? "Genel"),
        budget: String(j.budget_range ?? "Belirtilmemiş"),
        proposals: Number(j.proposals ?? 0),
      })),
    };
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const stats = await getHomeData();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      {/* ─── HERO ─── */}
      <section className="h-hero">
        <div className="container h-hero-grid">
          <div>
            <span className="eyebrow">Komisyonsuz freelancer platformu</span>
            <h1>
              Doğru freelancer&apos;ı bulun.<br />
              <em>Komisyon ödemeyin.</em>
            </h1>
            <p className="lead">
              Yazılımdan tasarıma, çeviriden pazarlamaya; işverenleri ve freelancer&apos;ları aracısız buluşturuyoruz.
              Kazancın tamamı emeği verene kalır.
            </p>

            <form action="/ilanlar" className="h-search" role="search">
              <Search size={19} />
              <input name="q" placeholder="Hangi işi arıyorsunuz? Örn. logo tasarımı" aria-label="İş ara" />
              <button type="submit">Ara</button>
            </form>

            <div className="h-popular">
              <span>Popüler:</span>
              <a href="/ilanlar?q=React">React</a>
              <a href="/ilanlar?q=Logo">Logo</a>
              <a href="/ilanlar?q=SEO">SEO</a>
              <a href="/ilanlar?q=Çeviri">Çeviri</a>
            </div>

            <div className="h-checks">
              <span><Check size={16} strokeWidth={3} /> %0 komisyon</span>
              <span><Check size={16} strokeWidth={3} /> TC kimlik doğrulamalı profiller</span>
              <span><Check size={16} strokeWidth={3} /> Ücretsiz kayıt</span>
            </div>
          </div>

          <aside className="h-panel" aria-label="Son ilanlar">
            <div className="h-panel-head">
              <span>Son yayınlanan ilanlar</span>
              <span className="live">Canlı</span>
            </div>
            {stats.recentJobs.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                <p style={{ marginBottom: 10 }}>Henüz yayınlanmış aktif ilan yok.</p>
                <a href="/ilan-ver" className="link-arrow" style={{ justifyContent: "center" }}>
                  İlk ilanı ücretsiz yayınlayın <ArrowRight size={15} />
                </a>
              </div>
            ) : (
              stats.recentJobs.map((j) => (
                <a key={j.id} href={`/isler/${j.id}`} className="h-panel-row" style={{ textDecoration: "none" }}>
                  <b>{j.title}</b>
                  <span className="price">{j.budget}</span>
                  <small>{j.category} · {j.proposals} teklif</small>
                </a>
              ))
            )}
            <div className="h-panel-foot">
              <span>Platformun aldığı komisyon</span>
              <strong>%0</strong>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── STATS (Gerçek Veritabanı Verileri) ─── */}
      <section className="container" aria-label="Platform istatistikleri">
        <div className="h-stats">
          <div className="h-stat">
            <strong className="red">%0</strong>
            <span>Komisyon, her zaman</span>
          </div>
          <div className="h-stat">
            <strong>{stats.freelancerCount.toLocaleString("tr-TR")}</strong>
            <span>Aktif freelancer</span>
          </div>
          <div className="h-stat">
            <strong>{stats.completedJobs.toLocaleString("tr-TR")}</strong>
            <span>Tamamlanan iş</span>
          </div>
          <div className="h-stat">
            <strong>
              {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1).replace(".", ",")} / 5` : "– / 5"}
            </strong>
            <span>Ortalama memnuniyet</span>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="sec" aria-labelledby="cat-title">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Kategoriler</span>
              <h2 id="cat-title" className="h-section">Her alanda uzman freelancer&apos;lar</h2>
            </div>
            <a href="/ilanlar" className="link-arrow">Tüm ilanlar <ArrowRight size={16} /></a>
          </div>
          <div className="h-cats">
            {categories.map(({ icon: Icon, title, desc, q }) => (
              <a key={title} href={`/ilanlar?kategori=${encodeURIComponent(q)}`} className="h-cat">
                <span className="h-cat-icon"><Icon size={20} strokeWidth={1.75} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="nasil" className="sec sec-alt" aria-labelledby="how-title">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Nasıl çalışır?</span>
              <h2 id="how-title" className="h-section">Üç adımda işe başlayın</h2>
            </div>
          </div>
          <div className="h-steps">
            {steps.map((s) => (
              <div key={s.num} className="h-step">
                <span className="h-step-num">ADIM {s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="sec" aria-labelledby="why-title">
        <div className="container h-why">
          <div>
            <span className="eyebrow">Neden Freelancer Türkiye?</span>
            <h2 id="why-title" className="h-section">Emeğinizin karşılığı, kesintisiz.</h2>
            <p className="lead">
              Büyük platformlar her işten %20&apos;ye varan komisyon keser. Biz temel hizmetler için hiçbir kesinti yapmıyoruz.
            </p>
            <ul className="h-why-list">
              <li><Wallet size={20} /><div><strong>%0 komisyon</strong><span>Anlaştığınız ücretin tamamı sizde kalır.</span></div></li>
              <li><ShieldCheck size={20} /><div><strong>Kimlik doğrulama</strong><span>NVİ üzerinden TC doğrulaması ile onaylı profil rozeti.</span></div></li>
              <li><Handshake size={20} /><div><strong>El Sıkışma</strong><span>Anlaşmalarınızı platformda kayıt altına alın.</span></div></li>
              <li><Lock size={20} /><div><strong>Güvenli iletişim</strong><span>Verileriniz korunur, iletişiminiz sizde kalır.</span></div></li>
            </ul>
          </div>
          <table className="h-table">
            <thead>
              <tr><th>Platform</th><th>Komisyon</th><th>Kimlik doğrulama</th></tr>
            </thead>
            <tbody>
              <tr className="us"><td>Freelancer Türkiye</td><td style={{ color: "var(--primary)" }}>%0</td><td className="yes"><Check size={18} strokeWidth={3} /></td></tr>
              <tr><td>Upwork</td><td>%10–20</td><td className="no"><Minus size={18} /></td></tr>
              <tr><td>Fiverr</td><td>%20</td><td className="no"><Minus size={18} /></td></tr>
              <tr><td>Bionluk</td><td>%15</td><td className="no"><Minus size={18} /></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="sss" className="sec sec-alt" aria-labelledby="faq-title">
        <div className="container">
          <span className="eyebrow">Sıkça sorulan sorular</span>
          <h2 id="faq-title" className="h-section" style={{ marginBottom: 24 }}>Merak ettikleriniz</h2>
          <div className="h-faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}<Plus size={20} /></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="container" style={{ paddingTop: 64, paddingBottom: 88 }} aria-label="Kayıt ol çağrısı">
        <div className="h-cta">
          <div>
            <h2>Bugün ücretsiz başlayın.</h2>
            <p>Komisyon yok, sözleşme yok. İlk ilanınızı dakikalar içinde yayınlayın.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/giris" className="btn-white">Ücretsiz hesap oluştur</a>
            <a href="/ilanlar" className="btn-outline-w">İlanları incele</a>
          </div>
        </div>
      </section>
    </>
  );
}
