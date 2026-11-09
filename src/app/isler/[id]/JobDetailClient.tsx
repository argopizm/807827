"use client";

import Link from "next/link";
import CategoryImage from "@/components/CategoryImage";
import { getCategory } from "@/lib/categories";
import styles from "@/components/ProjectDetail.module.css";
import ProposalComposer from "@/components/ProposalComposer";
import { useSession } from "next-auth/react";
import {
  Calendar, Wallet, User,
  Handshake, MessageSquare, ArrowLeft, LogIn, Loader2, ArrowUpRight, FileText, ShieldCheck, Sparkles, ClipboardCheck
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  client: string;
  client_id: string;
  client_username: string | null;
  client_jobs: number;
  client_rating: number;
  budget: string;
  category: string;
  created_at: string;
  status: string;
  description: string;
}

export default function JobDetailClient({ job }: { job: Job }) {
  const { data: session, status } = useSession();
  const isOwnJob = session?.user?.id === job.client_id;
  const isOpen = job.status === "open";
  const chatHref = "/mesajlar?to=" + encodeURIComponent(job.client_id);

  const group = getCategory(job.category);
  const loginHref = "/giris?callbackUrl=" + encodeURIComponent("/isler/" + job.id);
  const statusLabel = isOpen ? "Teklife açık" : job.status === "active" || job.status === "in_progress" ? "Devam ediyor" : job.status === "completed" ? "Tamamlandı" : "Kapalı";
  return <div className={"container " + styles.page}>
    <Link href="/ilanlar" className={styles.back}><ArrowLeft size={15}/> Tüm proje ilanları</Link>
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.meta}><span className={styles.category}>{job.category}</span><span><Calendar size={13}/>{job.created_at}</span><span className={styles.status}>{statusLabel}</span></div>
        <h1>{job.title}</h1>
        <div className={styles.byline}><span className={styles.avatar} aria-hidden="true">{job.client.slice(0,1).toLocaleUpperCase("tr-TR")}</span><span><strong>{job.client}</strong> tarafından yayınlandı.</span></div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true"><CategoryImage slug={group?.slug ?? "is-yonetim"} title="" eager/><div className={styles.visualNote}><Sparkles size={23}/><span>İyi işler, doğru insanlarla başlar.</span></div></div>
    </header>
    <div className={styles.grid}>
      <div className={styles.main}>
        <section className={styles.card} aria-labelledby="project-detail-title">
          <div className={styles.heading}><span><FileText size={19}/></span><h2 id="project-detail-title">Projenin detayları</h2></div>
          <div className={styles.facts}><div className={styles.fact}><Wallet size={22}/><div><small>PROJE BÜTÇESİ</small><strong>{job.budget}</strong></div></div><div className={styles.fact}><User size={22}/><div><small>İŞVEREN</small><strong>{job.client}</strong></div></div></div>
          <div className={styles.body}>{job.description.trim() ? job.description.split("\n").map((line,i)=><p key={i}>{line || "\u00a0"}</p>) : <p>İlan sahibi henüz ayrıntılı açıklama eklememiş. Kapsamı görüşme sırasında netleştirebilirsin.</p>}</div>
        </section>
        <section className={styles.guide} aria-labelledby="project-guide-title"><ClipboardCheck size={39}/><div><h2 id="project-guide-title">Aynı beklentide buluşun.</h2><p>Başlamadan önce teslim listesini, çalışma takvimini ve revizyon kapsamını birlikte netleştirin. Anlaşmanın ayrıntılarını yazılı tutun.</p><Link href="/rehber/freelance-proje-briefi">İyi bir proje briefi nasıl hazırlanır? <ArrowUpRight size={15}/></Link></div></section>
      </div>
      <aside className={styles.sidebar}>
        <section className={styles.card + " " + styles.action} aria-labelledby="project-action-title">
          <span className={styles.actionIcon}><Handshake size={25}/></span>
          <h2 id="project-action-title">{isOwnJob ? "Projen burada yayında." : isOpen ? "Bu işte sen de varsın." : "Projenin son durumu"}</h2>
          {status === "loading" ? <p role="status"><Loader2 className="spin" size={19}/> Hesabın kontrol ediliyor…</p> : isOwnJob ? <><p>İlanını ve gelen teklifleri hesabından takip edebilirsin.</p><div className={styles.buttons}><Link href="/hesabim" className={styles.button}>Teklifleri yönet <ArrowUpRight size={16}/></Link></div></> : !isOpen ? <><p>Bu proje şu anda yeni teklif almıyor. Uzmanlığına uygun diğer açık ilanları keşfedebilirsin.</p><div className={styles.buttons}><Link href="/ilanlar" className={styles.button}>Açık projeleri keşfet <ArrowUpRight size={16}/></Link></div></> : status === "unauthenticated" ? <><p>İlan sahibini tanı, projenin kapsamını konuş ve kendi teklifinle iş birliğine katıl.</p><div className={styles.buttons}><Link href={loginHref} className={styles.button}><LogIn size={17}/> Giriş yap ve devam et</Link></div></> : <>
            <p>Uzmanlığını paylaş. İlan sahibine mesaj gönder veya bu proje için teklif ver.</p>
            <ProposalComposer jobId={job.id} title={job.title}/>
            <div className={styles.buttons}><Link href={chatHref} className={styles.button + " " + styles.secondary}><MessageSquare size={17}/> İlan sahibine mesaj gönder</Link></div>
          </>}
          <div className={styles.safety}><ShieldCheck size={16}/><span>Frenaw ödeme aracılığı yapmaz. Ücreti ve teslim koşullarını birlikte belirleyin; iş tamamlanmadan tam ödeme yapmaktan kaçının.</span></div>
        </section>
        <section className={styles.card} aria-label="İşveren hakkında"><div className={styles.client}><span className={styles.avatar} aria-hidden="true">{job.client.slice(0,1).toLocaleUpperCase("tr-TR")}</span><div><small>İŞVERENİ TANI</small><strong>{job.client}</strong></div></div><div className={styles.clientStats}><div><strong>{job.client_jobs}</strong><span>Tamamlanan iş</span></div><div><strong>{job.client_rating > 0 ? job.client_rating.toFixed(1).replace(".",",") : "—"}</strong><span>Değerlendirme puanı</span></div></div>{job.client_username && <Link href={"/profil/"+encodeURIComponent(job.client_username)} className={styles.profileLink}>Profili keşfet <ArrowUpRight size={16}/></Link>}</section>
      </aside>
    </div>
  </div>;
}