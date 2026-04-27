import type { Metadata } from "next";

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

const categories = [
  { icon: "💻", title: "Yazılım & Kod", desc: "Web, mobil, API geliştirme", count: "120+ ilan" },
  { icon: "🎨", title: "Tasarım & UI/UX", desc: "Logo, web tasarımı, grafik", count: "85+ ilan" },
  { icon: "📢", title: "Dijital Pazarlama", desc: "SEO, sosyal medya, reklam", count: "60+ ilan" },
  { icon: "🌍", title: "Çeviri & Yazarlık", desc: "İngilizce, Almanca, içerik", count: "45+ ilan" },
  { icon: "🎬", title: "Video & Animasyon", desc: "Kurgu, motion grafik, reklam", count: "38+ ilan" },
  { icon: "🎙️", title: "Seslendirme", desc: "Reklam, e-kitap, podcast", count: "22+ ilan" },
];

const steps = [
  { num: "01", title: "Kayıt Ol", desc: "Google hesabınızla saniyeler içinde ücretsiz kayıt olun. Kredi kartı gerekmez." },
  { num: "02", title: "İlan Ver veya Bul", desc: "Projeniz için ilan açın ya da binlerce aktif ilanı inceleyin, teklif verin." },
  { num: "03", title: "El Sıkış", desc: "Anlaşınca platform üzerinden 'El Sıkışma' sürecini başlatın. Güvenli ve şeffaf." },
];

const testimonials = [
  { name: "Mert K.", role: "Full Stack Developer", text: "Komisyon kesilmeden çalışmak çok güzel. İlk haftada 3 proje aldım.", stars: 5 },
  { name: "Selin A.", role: "UI/UX Tasarımcı", text: "TC doğrulaması sayesinde müşteriler bana daha çok güveniyor. Harika platform.", stars: 5 },
  { name: "Burak D.", role: "Dijital Pazarlama", text: "Upwork komisyonundan bıkmıştım. Burası gerçekten özgürleştirici.", stars: 5 },
];

const faqs = [
  {
    q: "Freelancer Türkiye komisyon alıyor mu?",
    a: "Hayır. Freelancer Türkiye %0 komisyon alır. Kazandığınızın tamamı size aittir. Platform, ileride premium özellikler sunabilir ancak temel hizmetler her zaman ücretsiz kalacaktır."
  },
  {
    q: "Nasıl iş ilanı verebilirim?",
    a: "Hesap oluşturun, 'İlan Ver' sayfasına gidin ve projenizin detaylarını (bütçe, kategori, açıklama) doldurun. İlanınız dakikalar içinde binlerce freelancer tarafından görülebilir hale gelir."
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="home">

        {/* ─── HERO ─── */}
        <section className="hero">
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="hero-orb hero-orb-1" aria-hidden="true" />
          <div className="hero-orb hero-orb-2" aria-hidden="true" />

          <div className="container hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Türkiye&apos;nin 1 Numaralı Komisyonsuz Platformu
            </div>

            <h1 className="hero-title">
              Freelancer Dünyasında<br />
              <span className="gradient-text">Yerçekimine Meydan Okuyun</span>
            </h1>

            <p className="hero-subtitle">
              Aracı yok, komisyon yok, karmaşa yok. Yazılımdan tasarıma, çeviriden pazarlamaya
              — Türkiye&apos;nin en şeffaf freelancer platformunda güvenle çalışın.
            </p>

            <div className="hero-actions">
              <a href="/giris" className="btn-primary hero-cta">
                Ücretsiz Başla
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/ilanlar" className="btn-secondary hero-cta-2">İş İlanlarına Bak</a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                <span>%0 Komisyon</span>
              </div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                <span>TC Doğrulamalı Profiller</span>
              </div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                <span>Hızlı Kayıt</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="stats-section container" aria-label="Platform istatistikleri">
          <div className="stats-grid">
            {[
              { val: "%0", label: "Komisyon", sub: "Her zaman ücretsiz" },
              { val: "500+", label: "Aktif Freelancer", sub: "Onaylı profiller" },
              { val: "1.2K+", label: "Tamamlanan İş", sub: "Ve artıyor" },
              { val: "4.9★", label: "Kullanıcı Puanı", sub: "Ortalama değerlendirme" },
            ].map((s) => (
              <div key={s.label} className="glass-card stat-card">
                <div className="stat-val gradient-text">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="how-section container" aria-labelledby="how-title">
          <div className="section-header">
            <div className="section-chip">Nasıl Çalışır?</div>
            <h2 id="how-title" className="section-title">3 Adımda Başlayın</h2>
            <p className="section-desc">Kayıttan ilk işe kadar sadece birkaç dakika</p>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={step.num} className="step-card glass-card">
                <div className="step-num gradient-text">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="step-arrow" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── CATEGORIES ─── */}
        <section className="categories-section container" aria-labelledby="cat-title">
          <div className="section-header">
            <div className="section-chip">Kategoriler</div>
            <h2 id="cat-title" className="section-title">Popüler İş Kategorileri</h2>
            <p className="section-desc">Hangi alanda çalışırsanız çalışın, sizi bekliyoruz</p>
          </div>

          <div className="cat-grid">
            {categories.map((cat) => (
              <a href="/ilanlar" key={cat.title} className="cat-card glass-card">
                <div className="cat-icon">{cat.icon}</div>
                <h3 className="cat-title">{cat.title}</h3>
                <p className="cat-desc">{cat.desc}</p>
                <span className="cat-count">{cat.count}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ─── WHY US ─── */}
        <section className="why-section container" aria-labelledby="why-title">
          <div className="why-grid">
            <div className="why-content">
              <div className="section-chip">Neden Freelancer Türkiye?</div>
              <h2 id="why-title" className="why-title">
                Diğer Platformlardan<br />
                <span className="gradient-text">Farkımız Ne?</span>
              </h2>
              <p className="why-desc">
                Upwork, Fiverr gibi platformlar her işten %20&apos;ye varan komisyon keser.
                Biz bunu reddediyoruz. Emeğiniz size ait.
              </p>

              <ul className="why-list">
                {[
                  ["💰", "%0 Komisyon", "Kazandığınızın tamamı sizin cebinizde kalır"],
                  ["🛡️", "TC Doğrulaması", "NVI üzerinden kimlik doğrulama ile güven inşa edin"],
                  ["⚡", "Anlık İş Akışı", "İlan, teklif ve el sıkışma — hepsi saniyeler içinde"],
                  ["🔒", "Gizli İletişim", "Verileriniz şifreli, iletişiminiz güvende"],
                ].map(([icon, title, desc]) => (
                  <li key={String(title)} className="why-item">
                    <span className="why-icon">{icon}</span>
                    <div>
                      <strong>{title}</strong>
                      <span>{desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="why-visual glass-card">
              <div className="comparison-table">
                <div className="comp-header">
                  <span>Platform</span>
                  <span>Komisyon</span>
                  <span>TC Doğrulama</span>
                </div>
                {[
                  { name: "Freelancer Türkiye", kom: "%0", tc: "✅", highlight: true },
                  { name: "Upwork", kom: "%20", tc: "❌", highlight: false },
                  { name: "Fiverr", kom: "%20", tc: "❌", highlight: false },
                  { name: "Bionluk", kom: "%15", tc: "❌", highlight: false },
                ].map((row) => (
                  <div key={row.name} className={`comp-row ${row.highlight ? "highlight" : ""}`}>
                    <span>{row.highlight ? <strong>{row.name}</strong> : row.name}</span>
                    <span className={row.highlight ? "gradient-text" : "muted"}>{row.kom}</span>
                    <span>{row.tc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="testimonials-section container" aria-labelledby="testimonial-title">
          <div className="section-header">
            <div className="section-chip">Kullanıcı Yorumları</div>
            <h2 id="testimonial-title" className="section-title">Onlar Zaten Başladı</h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <article key={t.name} className="glass-card testimonial-card">
                <div className="testimonial-stars">{"⭐".repeat(t.stars)}</div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="faq-section container" aria-labelledby="faq-title">
          <div className="section-header">
            <div className="section-chip">Sıkça Sorulan Sorular</div>
            <h2 id="faq-title" className="section-title">Merak Ettikleriniz</h2>
            <p className="section-desc">Başlamadan önce bilmek istedikleriniz</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <details key={i} className="faq-item glass-card">
                <summary className="faq-question">
                  <span>{faq.q}</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9"/></svg>
                </summary>
                <p className="faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="cta-section container" aria-label="Kayıt ol çağrısı">
          <div className="cta-card glass-card">
            <div className="cta-orb" aria-hidden="true" />
            <div className="section-chip">Ücretsiz</div>
            <h2 className="cta-title">
              Hemen <span className="gradient-text">Başlamaya</span> Hazır mısınız?
            </h2>
            <p className="cta-desc">
              Bugün kayıt olun, dakikalar içinde ilk ilanınızı verin veya ilk teklifinizi gönderin.
              Komisyon yok, sözleşme yok, risk yok.
            </p>
            <div className="cta-actions">
              <a href="/giris" className="btn-primary cta-btn">
                Ücretsiz Hesap Oluştur
              </a>
              <a href="/ilanlar" className="btn-secondary cta-btn">
                İlanları İncele
              </a>
            </div>
            <p className="cta-note">Kayıt tamamen ücretsizdir • Kredi kartı gerekmez • İstediğinizde çıkabilirsiniz</p>
          </div>
        </section>

      </div>
    </>
  );
}
