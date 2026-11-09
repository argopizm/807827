import Link from "next/link";
import { auth } from "@/auth";
import AccountSettings from "./AccountSettings";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const session = await auth();
  return <div className={"container " + styles.page}>
    <Link className={styles.back} href="/hesabim">← Hesabıma dön</Link>
    <header className={styles.heading}><span>Frenaw · Hesap ayarları</span><h1>Hesabının kontrolü sende.</h1><p>Giriş bilgilerini güncelle, profilini düzenle veya hesabını kapat.</p></header>
    {session?.user?.id ? <AccountSettings /> : <section className={styles.card}><h2>Önce hesabına giriş yap.</h2><p>Bu işlemleri yalnızca kendi hesabında yapabilirsin.</p><Link className={styles.primary} href="/giris?callbackUrl=%2Fhesabim%2Fayarlar">Giriş yap</Link></section>}
  </div>;
}
