import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, FileText, MessageCircle, ShieldCheck, Sparkles, ClipboardCheck } from "lucide-react";
import { auth } from "@/auth";
import CategoryImage from "@/components/CategoryImage";
import { categoryPath, categoryTitle, getCategory } from "@/lib/categories";
import { publicMetadata, summarize } from "@/lib/seo";
import { getService } from "../data";
import styles from "@/components/ProjectDetail.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const service = await getService(id);
  return publicMetadata({
    title: service ? service.title : "Hizmet bulunamadı",
    description: service ? summarize(service.description) : "Aradığınız hizmet artık yayında olmayabilir.",
    path: "/hizmetler/" + encodeURIComponent(id),
    index: Boolean(service && service.description.length >= 120),
  });
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).id);
  if (!service) notFound();
  const session = await auth();
  const owner = session?.user?.id === service.freelancer_id;
  const group = getCategory(service.category);
  const profileHref = "/profil/" + encodeURIComponent(service.username);
  return <article className={"container " + styles.page}>
    <Link href="/hizmetler" className={styles.back}><ArrowLeft size={15}/> Tüm hizmetler</Link>
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.meta}><Link href={categoryPath(service.category)} className={styles.category}>{categoryTitle(service.category)}</Link><span className={styles.status}>Yayında</span></div>
        <h1>{service.title}</h1>
        <div className={styles.byline}><span className={styles.avatar} aria-hidden="true">{service.name.slice(0,1).toLocaleUpperCase("tr-TR")}</span><span><Link href={profileHref}><strong>{service.name}</strong></Link> tarafından sunuluyor.</span></div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true"><CategoryImage slug={group?.slug ?? "is-yonetim"} title="" eager/><div className={styles.visualNote}><Sparkles size={23}/><span>Doğru yetenek, fikrine yeni bir yön verir.</span></div></div>
    </header>
    <div className={styles.grid}>
      <div className={styles.main}>
        <section className={styles.card} aria-labelledby="scope-title"><div className={styles.heading}><span><FileText size={19}/></span><h2 id="scope-title">Bu hizmette neler var?</h2></div><div className={styles.body}>{service.description}</div><div className={styles.scopeNote}><Check size={16}/> Teslim kapsamını, süreyi ve revizyonları başlamadan önce freelancer ile netleştir.</div></section>
        <section className={styles.guide}><ClipboardCheck size={39}/><div><h2>Önce konuşun, sonra başlayın.</h2><p>İhtiyacını ve beklediğin sonucu paylaş. Örnek çalışmalar, teslim biçimi ve çalışma takvimi üzerinden ortak bir kapsam oluşturun.</p><Link href="/rehber/freelancer-nasil-secilir">Doğru freelancer’ı seçme rehberi <ArrowUpRight size={15}/></Link></div></section>
      </div>
      <aside className={styles.sidebar}>
        <section className={styles.card + " " + styles.action} aria-labelledby="service-action-title"><div className={styles.price}><small>HİZMET ÜCRETİ / FİYAT ARALIĞI</small><strong>{service.budget_range}</strong></div><h2 id="service-action-title">{owner ? "Bu hizmet sana ait." : "Fikrini birlikte büyütün."}</h2><p>{owner ? "Yayın durumunu hizmet yönetimi ekranından değiştirebilirsin." : "Proje ayrıntılarını anlat. Son fiyatı ve çalışma koşullarını uzmanla doğrudan görüş."}</p><div className={styles.buttons}>{owner ? <Link className={styles.button} href="/hizmetler/yayinla">Hizmetlerimi yönet <ArrowUpRight size={17}/></Link> : <Link className={styles.button} href={"/mesajlar?to="+encodeURIComponent(service.freelancer_id)}><MessageCircle size={17}/> Freelancer’a mesaj gönder</Link>}<Link href={profileHref} className={styles.button + " " + styles.secondary}>Profili keşfet <ArrowUpRight size={17}/></Link></div><div className={styles.safety}><ShieldCheck size={16}/><span>Frenaw platform komisyonu almaz ve ödeme aracılığı yapmaz. Ücret ve teslim koşullarını taraflar belirler.</span></div></section>
        <section className={styles.card}><div className={styles.client}><span className={styles.avatar} aria-hidden="true">{service.name.slice(0,1).toLocaleUpperCase("tr-TR")}</span><div><small>HİZMETİ SUNAN UZMAN</small><strong>{service.name}</strong></div></div><p className={styles.body}>Görüşmeyi Frenaw’da sürdürebilir veya karşılıklı tercihinizle dış iletişim kanallarını kullanabilirsiniz.</p></section>
      </aside>
    </div>
  </article>;
}
