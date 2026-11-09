"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";

type Status = { matched: boolean; canCheck: boolean } | "loading" | "signed-out" | "error";
const empty = { firstName: "", lastName: "", tc: "", birthYear: "" };

export default function IdentityCheck() {
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/user/identity", { cache: "no-store", signal: abort.signal })
      .then(async (response) => {
        if (response.status === 401) return setStatus("signed-out");
        if (!response.ok) throw new Error();
        setStatus(await response.json());
      })
      .catch(() => { if (!abort.signal.aborted) setStatus("error"); });
    return () => abort.abort();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/user/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.matched) setStatus({ matched: true, canCheck: true });
      else setMessage(data.error || "Doğrulama tamamlanamadı. Daha sonra tekrar deneyin.");
    } catch {
      setMessage("Bağlantı kurulamadı. Bilgileriniz kaydedilmedi.");
    } finally {
      // The form never keeps identity input after a submission.
      setForm(empty);
      setBusy(false);
    }
  }

  const field = (key: keyof typeof empty) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));

  if (status === "loading") return <p className="notice"><Loader2 size={14} /> Yükleniyor…</p>;
  if (status === "signed-out") return <p>Doğrulama için önce <Link href="/giris">hesabınıza giriş yapın</Link>.</p>;
  if (status === "error") return <p role="alert">Doğrulama durumu yüklenemedi. Sayfayı yenileyin.</p>;
  if (status.matched) {
    return (
      <div className="success-state">
        <BadgeCheck size={40} className="icon" aria-hidden="true" />
        <p><strong>Bilgileriniz NVİ kayıtlarıyla eşleşti.</strong> Profilinizde “NVİ eşleşmesi” işareti gösterilir. Girdiğiniz kimlik bilgileri kaydedilmedi.</p>
        <Link href="/profilim" className="btn-secondary">Profilimi gör</Link>
      </div>
    );
  }
  if (!status.canCheck) return <p>Doğrulamadan önce <Link href="/hesabim">Hesabım</Link> sayfasından e-posta adresinizi doğrulayın.</p>;

  return (
    <form className="verify-form" onSubmit={submit} autoComplete="off">
      <div className="input-row">
        <div className="input-group"><label htmlFor="identity-first">Ad</label><input id="identity-first" value={form.firstName} onChange={field("firstName")} maxLength={60} required /></div>
        <div className="input-group"><label htmlFor="identity-last">Soyad</label><input id="identity-last" value={form.lastName} onChange={field("lastName")} maxLength={60} required /></div>
      </div>
      <div className="input-row">
        <div className="input-group"><label htmlFor="identity-tc">T.C. kimlik no</label><input id="identity-tc" value={form.tc} onChange={field("tc")} inputMode="numeric" pattern="[0-9]{11}" maxLength={11} required /></div>
        <div className="input-group"><label htmlFor="identity-year">Doğum yılı</label><input id="identity-year" value={form.birthYear} onChange={field("birthYear")} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="1990" required /></div>
      </div>
      <label className="identity-consent">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span><Link href="/kimlik-dogrulama-aydinlatma" target="_blank">Aydınlatma metnini</Link> okudum. Bu dört bilginin yalnızca eşleşme sorgusu için NVİ’ye iletilmesine açık rıza veriyorum.</span>
      </label>
      {message && <p role="alert" className="identity-error">{message}</p>}
      <button className="btn-primary verify-btn" type="submit" disabled={busy || !consent}>
        {busy ? <Loader2 size={16} /> : <ShieldCheck size={16} />} {busy ? "Sorgulanıyor…" : "NVİ ile eşleştir"}
      </button>
      <p className="notice">Bilgiler saklanmaz ve kaydedilmez. Eşleşme, hesabı kullanan kişinin kimliğini kanıtlamaz; yalnızca girilen bilgilerin NVİ kaydıyla uyuştuğunu gösterir.</p>
    </form>
  );
}
