"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LockKeyhole, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import styles from "./settings.module.css";

type Settings = { email: string; hasPassword: boolean; emailChangeEnabled: boolean; pendingEmail: string | null };

export default function AccountSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingError, setLoadingError] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ action: string; text: string; error: boolean } | null>(null);
  const [reauthenticate, setReauthenticate] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/user/account", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ayarlar yüklenemedi.");
      setSettings(data);
    }).catch((error) => { if (!controller.signal.aborted) setLoadingError(error.message); });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(action); setMessage(null); setReauthenticate(false);
    try {
      const response = await fetch("/api/user/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...Object.fromEntries(values), accepted: values.get("accepted") === "on" }) });
      const data = await response.json();
      if (!response.ok) { setReauthenticate(Boolean(data.reauthenticate)); throw new Error(data.error || "İşlem tamamlanamadı."); }
      if (data.signOut) { await signOut({ callbackUrl: action === "delete" ? "/giris?notice=account-deleted" : "/giris?notice=password-changed" }); return; }
      setMessage({ action, text: "Yeni adresine doğrulama bağlantısı gönderildi. Bağlantıyı onaylayana kadar mevcut adresin korunur.", error: false });
      setSettings((current) => current ? { ...current, pendingEmail: String(values.get("email") ?? "") } : current);
      form.reset();
    } catch (error) { setMessage({ action, text: (error as Error).message, error: true }); }
    finally { setBusy(""); }
  }
  const feedback = (action: string) => message?.action === action && <p role={message.error ? "alert" : "status"} className={styles.feedback} data-error={message.error}>{message.text}{reauthenticate && <Link href="/giris?callbackUrl=%2Fhesabim%2Fayarlar">Yeniden giriş yap →</Link>}</p>;
  function currentPassword(prefix: string) {
    return settings?.hasPassword ? <label htmlFor={prefix + "-current"}>Mevcut şifren<input id={prefix + "-current"} name="currentPassword" type="password" autoComplete="current-password" maxLength={256} required /></label> : <p className={styles.hint}>Sosyal hesabınla giriş yaptın. Güvenlik için bu işlemi giriş yaptıktan sonraki beş dakika içinde tamamla. <Link href="/giris?callbackUrl=%2Fhesabim%2Fayarlar">Yeniden giriş yap</Link></p>;
  }
  if (loadingError) return <section className={styles.card}><p role="alert">{loadingError}</p><Link href="/giris?callbackUrl=%2Fhesabim%2Fayarlar">Yeniden giriş yap</Link></section>;
  if (!settings) return <p role="status">Hesap ayarların yükleniyor…</p>;
  return <div className={styles.layout}>
    <section className={styles.profileCard}><span className={styles.icon}><UserRound size={25} aria-hidden="true" /></span><div><h2>Profil bilgilerin</h2><p>Görünen adını veya marka adını, kullanıcı adını, profil görselini, uzmanlığını ve iletişim tercihlerini hesabından düzenleyebilirsin.</p></div><Link href="/hesabim/profil">Profilimi düzenle <ArrowUpRight size={17} aria-hidden="true" /></Link></section>
    <div className={styles.grid}>
      <section className={styles.card} aria-labelledby="password-title"><span className={styles.icon}><LockKeyhole size={23} aria-hidden="true" /></span><h2 id="password-title">{settings.hasPassword ? "Şifreni değiştir" : "Giriş şifresi oluştur"}</h2><p>Güncelleme tamamlandığında tüm cihazlardaki oturumların kapanır. Yeni şifrenle yeniden giriş yapabilirsin.</p><form onSubmit={(event) => submit(event, "password")} className={styles.form}>{currentPassword("password")}<label htmlFor="new-password">Yeni şifren<input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required /></label><label htmlFor="confirm-password">Yeni şifreni tekrar yaz<input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={256} required /></label>{feedback("password")}<button className={styles.primary} disabled={Boolean(busy)}>{busy === "password" ? "Güncelleniyor…" : "Şifreyi güncelle"}</button></form></section>
      <section className={styles.card} aria-labelledby="email-title"><span className={styles.icon}><Mail size={23} aria-hidden="true" /></span><h2 id="email-title">E-posta adresini değiştir</h2><p>Şu an kullandığın adres: <strong className={styles.email}>{settings.email}</strong></p><p>Yeni adresine gönderilen bağlantıyı onayladıktan sonra değişiklik tamamlanır ve tüm oturumların kapanır.</p>{settings.pendingEmail && <p className={styles.feedback}>Doğrulama bekliyor: {settings.pendingEmail}</p>}{settings.emailChangeEnabled ? <form onSubmit={(event) => submit(event, "email")} className={styles.form}>{currentPassword("email")}<label htmlFor="new-email">Yeni e-posta adresin<input id="new-email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>{feedback("email")}<button className={styles.primary} disabled={Boolean(busy)}>{busy === "email" ? "Gönderiliyor…" : "Doğrulama bağlantısı gönder"}</button></form> : <p className={styles.feedback}>E-posta değişikliği için doğrulama gönderimi henüz etkin değil. Mevcut adresin korunuyor.</p>}</section>
    </div>
    <section className={styles.card}><span className={styles.icon}><ShieldCheck size={24} aria-hidden="true" /></span><h2>Oturumlarını kapat</h2><p>Bu cihazdaki hesabından güvenli biçimde çıkış yapabilirsin.</p><button type="button" className={styles.secondary} onClick={() => signOut({ callbackUrl: "/" })}>Bu cihazdan çıkış yap</button></section>
    <section className={styles.danger}><span className={styles.icon}><Trash2 size={24} aria-hidden="true" /></span><h2>Hesabını sil</h2><p>Profil ve giriş bilgilerin kaldırılır; ilanların yayından alınır, hizmetlerin ve sana ait destek talepleri silinir. Gönderdiğin mesajların içeriği kaldırılır. Karşı tarafın görüşme geçmişinde “Silinen kullanıcı” ve silinen mesaj açıklaması kalabilir. İşlem ilişkilerini koruyan teknik kimlikler kalır; bu işlem tüm verilerin anonimleştirildiği anlamına gelmez.</p><p>Yedeklerin silinmesi ve geçerli saklama gerekçeleri hakkında <Link href="/gizlilik">gizlilik açıklamasını</Link> inceleyebilirsin. Hesap silme geri alınamaz.</p><details><summary>Hesap silme adımlarını göster</summary><form onSubmit={(event) => submit(event, "delete")} className={styles.form}>{currentPassword("delete")}<label htmlFor="delete-confirmation">Onaylamak için HESABIMI SİL yaz<input id="delete-confirmation" name="confirmation" autoComplete="off" required /></label><label className={styles.accept}><input type="checkbox" name="accepted" required /><span>Hesabımın kapatılacağını ve yukarıdaki silme işlemlerinin geri alınamayacağını anladım.</span></label>{feedback("delete")}<button className={styles.deleteButton} disabled={Boolean(busy)}>{busy === "delete" ? "Hesap siliniyor…" : "Hesabımı kalıcı olarak sil"}</button></form></details></section>
  </div>;
}
