"use client";

import Link from "next/link";
import { ArrowUpRight, Check, FilePlus2, Lightbulb, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import CategoryOptions from "@/components/CategoryOptions";
import { categoryTitle } from "@/lib/categories";
import styles from "../services.module.css";

type OwnedService = { id: string; title: string; category: string; status: "published" | "hidden"; budget_range: string };

async function serviceRequest<T>(method = "GET", body?: object): Promise<T> {
  const response = await fetch("/api/hizmetler", {
    method, cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
  return result;
}

export default function ServiceManager() {
  const [items, setItems] = useState<OwnedService[] | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<{ id: string; fingerprint: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await serviceRequest<{ services: OwnedService[] }>();
      setItems(result.services);
    } catch (error) { setNotice((error as Error).message); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const fields = { title: values.get("title"), category: values.get("category"), description: values.get("description"), budget: values.get("budget") };
    const fingerprint = JSON.stringify(fields);
    if (pending.current?.fingerprint !== fingerprint) pending.current = { id: crypto.randomUUID(), fingerprint };
    setBusy(true);
    setNotice("");
    try {
      await serviceRequest("POST", { ...fields, id: pending.current.id });
      pending.current = null;
      form.reset();
      setNotice("Hizmetin yayınlandı.");
      await refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }

  async function changeStatus(service: OwnedService) {
    setBusy(true);
    setNotice("");
    try {
      await serviceRequest("PATCH", { id: service.id, status: service.status === "published" ? "hidden" : "published" });
      await refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }

  return <>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.manager}>
    <form className={styles.form} onSubmit={publish}>
      <h2><FilePlus2 size={22}/> Yeteneğini hizmete dönüştür.</h2>
      <label>Hizmet başlığı<input name="title" minLength={8} maxLength={140} placeholder="Örn. Küçük işletmeler için WordPress sitesi kurarım" required /></label>
      <label>Kategori<select name="category" defaultValue="" required><CategoryOptions allLabel="Kategori seçin" /></select></label>
      <label>Ücret veya fiyat aralığı<input name="budget" maxLength={100} placeholder="Örn. 5.000 TL’den başlayan" required /></label>
      <label>Teslim kapsamı<textarea name="description" rows={6} minLength={60} maxLength={8000} placeholder="Neleri teslim edeceğini, tahmini süreyi, revizyon kapsamını ve müşteriden gereken bilgileri açıkla." required /></label>
      <p className={styles.help}>İletişim için profilindeki görünürlük ayarlarını kullan. Açıklamaya kimlik, parola veya ödeme bilgisi ekleme.</p>
      <button className="btn-primary" disabled={busy}>{busy ? "Kaydediliyor…" : <><Send size={16}/> Hizmeti yayınla</>}</button>
    </form>
    <aside className={styles.tips}><span><Lightbulb size={25}/></span><h2>İyi bir hizmet, net bir anlatım.</h2><p>İnsanların sunduğun işi ilk bakışta anlamasını sağla. Beklentileri baştan konuşmak, iş birliğini kolaylaştırır.</p><ul><li><Check size={15}/> Ne yaptığını anlatan somut bir başlık seç.</li><li><Check size={15}/> Teslim edilecek dosyaları, süreyi ve revizyon kapsamını belirt.</li><li><Check size={15}/> Ücretin hangi kapsam için geçerli olduğunu açıkla.</li></ul><Link href="/rehber/freelance-proje-briefi">Kapsamı birlikte netleştirme rehberi <ArrowUpRight size={15}/></Link></aside>
    </div>
    <section className={styles.owned} aria-labelledby="owned-services-title">
      <h2 id="owned-services-title">Hizmetlerim</h2>
      {items === null ? <p role="status">Hizmetlerin yükleniyor…</p> : !items.length ? <p className={styles.ownedEmpty}>Burada senin hizmetlerin yer alacak. Yukarıdaki formdan ilk hizmetini yayınlayarak başlayabilirsin.</p> : items.map((service) => <article key={service.id}>
        <div><h3>{service.status === "published" ? <Link href={"/hizmetler/" + service.id}>{service.title}</Link> : service.title}</h3>
          <p>{categoryTitle(service.category)} · {service.budget_range}</p>
          <small>{service.status === "published" ? "Yayında" : "Gizli"}</small></div>
        <button className="btn-secondary" disabled={busy} onClick={() => changeStatus(service)}>{service.status === "published" ? "Yayından kaldır" : "Yeniden yayınla"}</button>
      </article>)}
    </section>
  </>;
}
