import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Layers3 } from "lucide-react";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import ServiceManager from "./ServiceManager";
import styles from "../services.module.css";

export const metadata: Metadata = { title: "Hizmetlerini Yönet", robots: { index: false, follow: false } };

export default async function PublishServicePage() {
  const session = await auth();
  if (!session?.user?.id) return <section className={"container " + styles.page}>
    <div className={styles.access}><span><Layers3 size={30}/></span>
    <h1>Hizmetlerini yayınla</h1>
    <p>Uzmanlığını anlat, sunduğun işi görünür kıl. Hizmet eklemek ve yayınlarını yönetmek için freelancer hesabına giriş yap.</p>
    <Link className="btn-primary" href="/giris?callbackUrl=%2Fhizmetler%2Fyayinla">Giriş yap ve başla <ArrowUpRight size={16}/></Link><small>Hizmet yayınlamak ücretsizdir. Platform komisyonu yoktur.</small></div>
  </section>;
  const db = await getDB();
  const account = db && await db.prepare("SELECT user_type FROM users WHERE id = ?").bind(session.user.id).first<{ user_type: string }>();
  if (!account) return <section className={"container " + styles.page}><h1>Hesap yüklenemedi</h1><p>Biraz sonra tekrar deneyin.</p></section>;
  if (account.user_type !== "freelancer") return <section className={"container " + styles.page}>
    <div className={styles.access}><span><BriefcaseBusiness size={30}/></span>
    <h1>Freelancer hizmetleri</h1>
    <p>Hizmet yayınlamak için freelancer hesabı gerekir. İşveren hesabınla proje ilanı oluşturabilirsin.</p>
    <Link className="btn-primary" href="/ilan-ver">Proje ilanı ver <ArrowUpRight size={16}/></Link></div>
  </section>;
  return <section className={"container " + styles.page}>
    <header className={styles.header}>
      <Link href="/hizmetler" className="back-link">← Hizmetlere dön</Link>
      <h1>Hizmetlerini yönet</h1>
      <p>Sunduğun işi ve teslim kapsamını anlat. İlgilenen müşteriler seninle doğrudan konuşsun.</p>
    </header>
    <ServiceManager />
  </section>;
}
