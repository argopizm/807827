"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import "./profile-refresh.css";
import { Star, ArrowLeft, ArrowUpRight, Copy, Check, MessageSquare, Pencil, ArrowRight } from "lucide-react";

export interface ProfileData {
  id: string;
  username: string;
  name: string;
  title?: string;
  category?: string;
  bio: string;
  avatar: string;
  rating: number;
  jobs_done: number;
  user_type: string;
  skills: string[];
  links: { whatsapp?: string; discord?: string; portfolio?: string };
}

export interface ReviewItem {
  id: string;
  author: string;
  project: string;
  rating: number;
  text: string;
  date: string;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toLocaleUpperCase("tr");
}

function Stars({ value }: { value: number }) {
  return (
    <span className="pr-stars" aria-label={`5 üzerinden ${value}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= value ? "currentColor" : "none"} strokeWidth={i <= value ? 0 : 1.5} />
      ))}
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36A9.4 9.4 0 0 1 2.6 12.05C2.6 6.85 6.84 2.6 12.06 2.6a9.4 9.4 0 0 1 9.44 9.45c0 5.2-4.24 9.45-9.45 9.45M20.08 4A11.3 11.3 0 0 0 12.05.67C5.79.67.69 5.77.69 12.04c0 2 .52 3.96 1.52 5.68L.6 23.6l6.03-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.36-5.1 11.36-11.37 0-3.04-1.18-5.89-3.33-8.04" />
    </svg>
  );
}
function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.37-.44.86-.61 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.88.9a.08.08 0 0 0-.04.1c.36.7.78 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03M8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42m7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42" />
    </svg>
  );
}

export default function ProfileClient({ profile, reviews, owner = false, preview = false }: { profile: ProfileData; reviews: ReviewItem[]; owner?: boolean; preview?: boolean }) {
  const NameHeading = preview ? "h3" : "h1";
  const [copied, setCopied] = useState(false);
  const hasContact = profile.links.whatsapp || profile.links.portfolio || profile.links.discord;

  const copyDiscord = async () => {
    if (!profile.links.discord || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(profile.links.discord);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={"pr-page" + (preview ? " pr-preview" : "")}>

      {/* ─── Üst bant ─── */}
      <header className="pr-head">
        <div className="container">
          {!preview && <Link href={owner ? "/hesabim" : "/profil"} className="pr-back"><ArrowLeft size={15} /> {owner ? "Hesap panelim" : "Freelancer bul"}</Link>}
          {owner && !preview && <div className="pr-owner-note"><span>Bu senin herkese açık profilin.</span><Link href="/hesabim/profil">Profilini geliştirmeye devam et <ArrowRight size={13}/></Link></div>}
          <div className="pr-head-row">
            <div className="ava pr-ava">
              {profile.avatar ? <Image unoptimized src={profile.avatar} alt="" width={88} height={88} referrerPolicy="no-referrer" /> : initials(profile.name)}
            </div>
            <div className="pr-id">
              <NameHeading>
                {profile.name}
              </NameHeading>
              <p className="pr-title">{profile.title ?? (profile.user_type === "freelancer" ? "Freelancer" : "İşveren")}</p>
              <div className="pr-meta">
                <span>@{profile.username}</span>
                {profile.category && <span>{profile.category}</span>}
              </div>
            </div>
            {!preview && <div className="pr-head-actions">{owner ? <><Link href="/hesabim/profil" className="btn-primary"><Pencil size={16}/> Profilimi düzenle</Link><button className="btn-secondary" type="button" onClick={async () => { try { await navigator.clipboard.writeText(location.origin + "/profil/" + encodeURIComponent(profile.username)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}</button></> : <Link href={"/mesajlar?to=" + encodeURIComponent(profile.id)} className="btn-primary"><MessageSquare size={16}/> Mesaj gönder</Link>}</div>}
          </div>

          <dl className="pr-stats">
            <div><dt>Puan</dt><dd>{profile.rating > 0 ? profile.rating.toFixed(1).replace(".", ",") : "–"}<small> / 5</small></dd></div>
            <div><dt>Tamamlanan iş</dt><dd>{profile.jobs_done}</dd></div>
            <div><dt>Değerlendirme</dt><dd>{reviews.length}</dd></div>
          </dl>
        </div>
      </header>

      {/* ─── Gövde ─── */}
      <div className="container pr-body">
        <div className="pr-main">
          <section className="pr-sec">
            <h2>Hakkında</h2>
            <p className="pr-bio">{profile.bio || "Henüz biyografi eklenmemiş."}</p>
          </section>

          {profile.skills.length > 0 && (
            <section className="pr-sec">
              <h2>Yetenekler</h2>
              <div className="tags">{profile.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            </section>
          )}

          <section className="pr-sec">
            <div className="pr-sec-head">
              <h2>Değerlendirmeler <span className="pr-count">{reviews.length}</span></h2>
              {profile.rating > 0 && (
                <span className="pr-avg"><Stars value={Math.round(profile.rating)} /> {profile.rating.toFixed(1).replace(".", ",")}</span>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="pr-empty" style={{ paddingTop: 12 }}>Henüz değerlendirme yapılmamış.</p>
            ) : (
              <ul className="pr-reviews">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <div className="pr-review-top">
                      <div>
                        <strong>{r.project}</strong>
                        <span>{r.author} · {r.date}</span>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p>{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="pr-side">
          <div className="pr-box">
            <h3>İletişim</h3>
            {profile.links.whatsapp && (
              <a href={`https://wa.me/${profile.links.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow ugc" className="pr-link">
                <span className="pr-link-ic"><WhatsAppIcon /></span>
                <span className="pr-link-tx"><b>WhatsApp</b><small>Doğrudan mesaj gönderin</small></span>
                <ArrowUpRight size={16} />
              </a>
            )}
            {profile.links.portfolio && (
              <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer nofollow ugc" className="pr-link">
                <span className="pr-link-ic"><ArrowUpRight size={18} /></span>
                <span className="pr-link-tx"><b>Portfolyo</b><small>{profile.links.portfolio.replace(/^https?:\/\//, "")}</small></span>
                <ArrowUpRight size={16} />
              </a>
            )}
            {profile.links.discord && (
              <button type="button" onClick={copyDiscord} className="pr-link" aria-label={copied ? "Discord kullanıcı adı kopyalandı" : "Discord kullanıcı adını kopyala"}>
                <span className="pr-link-ic"><DiscordIcon /></span>
                <span className="pr-link-tx"><b>Discord</b><small>{profile.links.discord}</small></span>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
            {!hasContact && <p className="pr-empty">{owner ? "Profilini düzenleyerek iletişim bağlantılarını buraya ekleyebilirsin." : "Bu kullanıcıyla Frenaw üzerinden iletişime geçebilirsiniz."}</p>}
          </div>

        </aside>
      </div>
    </div>
  );
}
