import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, ChevronDown, Headphones, LifeBuoy, LockKeyhole, MessagesSquare, ShieldCheck, Ticket, UserRound, BriefcaseBusiness } from "lucide-react";
import { auth } from "@/auth";
import SupportClient from "./SupportClient";
import styles from "./support.module.css";

export const metadata: Metadata = { title: "Destek", robots: { index: false, follow: false } };

const topics = [
  { title: "Hesap ve erişim", description: "Giriş yapma, profilini tamamlama ve hesap ayarları.", icon: UserRound, href: "#hesap-sorulari" },
  { title: "İlan ve teklifler", description: "Proje yayınlama, teklifleri inceleme ve birlikte çalışma.", icon: BriefcaseBusiness, href: "#ilan-sorulari" },
  { title: "Mesajlaşma", description: "Uzmanlarla iletişim kurma ve görüşmelerini takip etme.", icon: MessagesSquare, href: "#mesaj-sorulari" },
  { title: "Teknik destek", description: "Karşılaştığın sorunu bize anlat, talebini hesabından takip et.", icon: LifeBuoy, href: "/giris?callbackUrl=%2Fdestek" },
];

function GuestSupport() {
  return <>
    <header className={styles.guestHero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}><Headphones size={17} aria-hidden="true" /> Frenaw destek merkezi</span>
        <h1>Nasıl yardımcı<br />olabiliriz?</h1>
        <p>Bir sorunda takılıp kalma. Yardım konularını keşfet ya da hesabına giriş yaparak destek talebini bize ilet.</p>
        <a className={styles.heroLink} href="#yardim-konulari">Yardım konularına göz at <ArrowDown size={17} aria-hidden="true" /></a>
      </div>
      <div className={styles.heroPhoto}>
        {/* Local responsive images are served directly by the Cloudflare Worker. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/frenaw-destek.webp" srcSet="/images/frenaw-destek-small.webp 720w, /images/frenaw-destek.webp 1280w" sizes="(max-width: 760px) calc(100vw - 60px), (max-width: 1200px) 46vw, 530px" width={1280} height={714} fetchPriority="high" alt="Kulaklık takan, gülümseyen bir kadının yer aldığı Frenaw destek merkezi görseli" />
      </div>
    </header>
    <section className={styles.guestPanel} aria-labelledby="talepler-baslik">
      <span className={styles.panelIcon}><Ticket size={29} strokeWidth={1.5} aria-hidden="true" /></span>
      <div className={styles.panelCopy}><h2 id="talepler-baslik">Destek taleplerin tek bir yerde.</h2><p>Yeni bir talep oluşturmak, yanıtları okumak ve önceki görüşmelerini görmek için hesabına giriş yap.</p><span><LockKeyhole size={13} aria-hidden="true" /> Taleplerini yalnızca sen ve yetkili destek ekibi görebilir.</span></div>
      <div className={styles.guestActions}><Link className={styles.primaryAction} href="/giris?callbackUrl=%2Fdestek">Giriş yap <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className={styles.secondaryAction} href="/giris?mode=kayit&callbackUrl=%2Fdestek">Hesap oluştur</Link></div>
    </section>
    <section id="yardim-konulari" className={styles.topics} aria-labelledby="yardim-baslik">
      <div className={styles.sectionHeading}><h2 id="yardim-baslik">Nereden başlayalım?</h2><p>Aradığın konuya daha kolay ulaş.</p></div>
      <div className={styles.topicGrid}>{topics.map(({ title, description, icon: Icon, href }) => <Link key={title} className={styles.topic} href={href}><span className={styles.topicIcon}><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p><span className={styles.topicLink}>{title === "Teknik destek" ? "Talep oluştur" : "Bilgi al"} <ArrowUpRight size={16} aria-hidden="true" /></span></Link>)}</div>
    </section>
    <section className={styles.faqLayout} aria-labelledby="destek-sss">
      <div className={styles.faqIntro}><span className={styles.eyebrow}>Hızlı yanıtlar</span><h2 id="destek-sss">Aklına takılanlar.</h2><p>Başlamadan önce bilmek istediklerini burada bulabilirsin.</p><Link href="/rehber"><BookOpen size={17} aria-hidden="true" /> Frenaw rehberlerini keşfet <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      <div className={styles.faq}>
        <details id="hesap-sorulari"><summary>Destek talebi için hesabım olması gerekiyor mu?<ChevronDown size={19} aria-hidden="true" /></summary><p>Evet. Taleplerini hesabınla ilişkilendirmek ve yanıtları yalnızca sana gösterebilmek için giriş yapman gerekiyor. Henüz hesabın yoksa <Link href="/giris?mode=kayit&callbackUrl=%2Fdestek">hesap oluşturabilirsin.</Link></p></details>
        <details id="ilan-sorulari"><summary>İlan veya teklifimle ilgili nasıl yardım alırım?<ChevronDown size={19} aria-hidden="true" /></summary><p>Giriş yaptıktan sonra yeni destek talebinde “İlan ve teklif” kategorisini seç. İlgili ilanın bağlantısını ve yaşadığın sorunu açıklamana ekleyebilirsin.</p></details>
        <details id="mesaj-sorulari"><summary>Bir mesajı veya kullanıcıyı nasıl bildiririm?<ChevronDown size={19} aria-hidden="true" /></summary><p>Mesajlar sayfasındaki bildirme ve engelleme seçeneklerini kullanabilirsin. Konuyu ayrıca iletmek istersen “Mesajlaşma ve güvenlik” kategorisinde destek talebi oluşturabilirsin.</p></details>
        <details><summary>Oluşturduğum talebin yanıtını nereden görebilirim?<ChevronDown size={19} aria-hidden="true" /></summary><p>Hesabına giriş yapıp bu sayfadaki “Taleplerim” bölümünü aç. İlgili talebi seçerek yanıtları okuyabilir, ek bilgi gönderebilir ve talebinin durumunu takip edebilirsin.</p></details>
        <details><summary>Teknik bir sorunu anlatırken neler eklemeliyim?<ChevronDown size={19} aria-hidden="true" /></summary><p>Sorunun yaşandığı sayfanın bağlantısını, kullandığın cihaz ve tarayıcıyı, gördüğün hata mesajını ve sorun oluşmadan önce yaptığın işlemleri yazman incelemeyi kolaylaştırır.</p></details>
      </div>
    </section>
    <aside className={styles.guideBanner}><span><ShieldCheck size={26} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>İlk projen için küçük bir yol haritası.</h2><p>Proje kapsamını netleştirmek ve doğru uzmanla başlamak için rehberimize göz at.</p></div><Link href="/rehber/freelance-proje-briefi">Rehberi oku <ArrowUpRight size={17} aria-hidden="true" /></Link></aside>
  </>;
}

export default async function SupportPage() {
  const session = await auth();
  return (
    <section className={`container ${styles.page}`}>
      {session?.user?.id ? <><header className={styles.heading}>
        <p className="eyebrow">Frenaw destek</p>
        <h1>Nasıl yardımcı olabiliriz?</h1>
        <p>Hesabın, ilanların veya platformla ilgili konularda talep oluştur ve yanıtları buradan takip et.</p>
      </header>
      <SupportClient /></> : <GuestSupport />}
    </section>
  );
}
