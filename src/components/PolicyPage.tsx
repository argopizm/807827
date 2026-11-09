import Link from "next/link";
import type { ReactNode } from "react";
import { runtimeEnv } from "@/lib/runtime-env";
import styles from "./PolicyPage.module.css";

const policyLinks = [
  { href: "/gizlilik", title: "Gizlilik ve aydınlatma" },
  { href: "/cerezler", title: "Çerez politikası" },
  { href: "/kullanim-kosullari", title: "Kullanım koşulları" },
  { href: "/kvkk-basvuru", title: "KVKK başvurusu" },
  { href: "/kimlik-dogrulama-aydinlatma", title: "Kimlik doğrulama" },
];

export default function PolicyPage({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className={'container ' + styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Frenaw · Yasal bilgiler</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <p className={styles.draft}>
        Bu metnin hukuk incelemesi tamamlanmamıştır. Açık posta adresi, ayrıntılı saklama süreleri ve varsa yurt dışı aktarım dayanakları henüz kesinleştirilmemiştir.
      </p>
      <div className={styles.content}>{children}</div>
      <nav className={styles.links} aria-label="İlgili yasal belgeler">
        {policyLinks.filter((policy) => policy.title !== title).map(({ href, title: label }) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
    </article>
  );
}

export function DataController() {
  const name = runtimeEnv("FRENAW_LEGAL_NAME")?.trim();
  const address = runtimeEnv("FRENAW_LEGAL_ADDRESS")?.trim();
  const email = runtimeEnv("FRENAW_LEGAL_EMAIL")?.trim();
  const kep = runtimeEnv("FRENAW_LEGAL_KEP")?.trim();

  if (!name || !email) {
    return <p>Veri sorumlusu olan gerçek kişinin adı, soyadı, başvuru adresi ve e-postası yayın öncesinde eklenecektir.</p>;
  }

  return (
    <dl>
      <div><dt>Ad ve soyad</dt><dd>{name}</dd></div>
      {address && <div><dt>Adres</dt><dd>{address}</dd></div>}
      <div><dt>E-posta</dt><dd>{email}</dd></div>
      {kep && <div><dt>KEP</dt><dd>{kep}</dd></div>}
    </dl>
  );
}
