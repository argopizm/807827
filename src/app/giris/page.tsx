"use client";

import { useState, useEffect, Suspense } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

import styles from "./auth.module.css";

const errorMessages: Record<string, string> = {
  Configuration: "Sunucu yapılandırma hatası. E-posta ile giriş yapmayı deneyin.",
  AccessDenied: "Erişim reddedildi.",
  Verification: "Doğrulama hatası.",
  OAuthCallback: "Google girişi sırasında hata oluştu. Tekrar deneyin.",
  Default: "Bir hata oluştu. Tekrar deneyin.",
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function internalCallback(value: string | null): string | undefined {
  if (!value?.startsWith("/") || value.startsWith("//")) return undefined;
  try {
    const url = new URL(value, "https://frenaw.invalid");
    if (url.origin !== "https://frenaw.invalid" || url.pathname.startsWith("/api/") || url.pathname === "/giris") return undefined;
    return url.pathname + url.search + url.hash;
  } catch {
    return undefined;
  }
}

// useSearchParams is wrapped in Suspense below
function GirisForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update } = useSession();
  const callbackUrl = internalCallback(searchParams.get("callbackUrl"));
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [hideUrlError, setHideUrlError] = useState(false);
  const mode = searchParams.get("mode") === "kayit" ? "kayit" : "giris";
  function setMode(next: "giris" | "kayit") { const query = new URLSearchParams(searchParams.toString()); query.set("mode", next); query.delete("error"); query.delete("notice"); router.replace("/giris?" + query.toString(), { scroll: false }); }
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    getProviders().then((providers) => { if (active) setGoogleEnabled(Boolean(providers?.google)); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const err = hideUrlError ? null : searchParams.get("error");
  const notices: Record<string, string> = { "account-deleted": "Hesabınız silindi ve oturumlarınız kapatıldı.", "password-changed": "Şifreniz güncellendi. Yeni şifrenizle giriş yapın.", "email-changed": "E-posta adresiniz güncellendi. Yeni adresinizle giriş yapın." };
  const notice = notices[searchParams.get("notice") ?? ""];
  const visibleMessage = msg ?? (notice ? { type: "success", text: notice } : null) ?? (err ? { type: "error", text: errorMessages[err] ?? errorMessages.Default } : null);

  const handleGoogle = async () => {
    setLoading(true);
    setMsg(null);
    setHideUrlError(true);
    try {
      await signIn("google", { callbackUrl: callbackUrl ?? "/profilim" });
    } catch {
      setMsg({ type: "error", text: "Google girişi şu anda kullanılamıyor." });
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setHideUrlError(true);
    setMsg(null);
    setLoading(true);
    const values = new FormData(e.currentTarget);
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");
    const onboardingUrl = callbackUrl ? "/onboarding?callbackUrl=" + encodeURIComponent(callbackUrl) : "/onboarding";

    try {
      if (mode === "kayit") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.get("name"), display_name: values.get("display_name"), email, password, adult: values.get("adult") === "on" }),
        });
        const data = await response.json();
        if (!response.ok) {
          setMsg({ type: "error", text: data.error ?? "Kayıt başarısız." });
          return;
        }
        const result = await signIn("credentials", { email, password, callbackUrl: onboardingUrl, redirect: false });
        if (!result || result.error) {
          setMsg({ type: "info", text: "Kayıt tamamlandı. Şimdi giriş yapabilirsiniz." });
          setMode("giris");
          return;
        }
        await update();
        router.replace(onboardingUrl);
        router.refresh();
        return;
      }

      const result = await signIn("credentials", { email, password, callbackUrl: callbackUrl ?? "/profilim", redirect: false });
      if (!result || result.error) {
        setMsg({ type: "error", text: result?.error === "CredentialsSignin"
          ? "E-posta veya şifre hatalı. Sosyal hesapla kaydolduysanız aynı giriş yöntemini kullanın."
          : "Giriş tamamlanamadı. Daha sonra tekrar deneyin." });
        return;
      }
      await update();
      router.replace(callbackUrl ?? "/profilim");
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Bağlantı hatası. Tekrar deneyin." });
    } finally {
      setLoading(false);
    }
  };

  return <div className={styles.page}>
    <section className={styles.formSide} aria-labelledby="auth-heading">
      <div className={styles.formWrap} key={mode}>
        <Link href="/" className={styles.back}><ArrowLeft size={15} /> Ana sayfaya dön</Link>
        <header className={styles.heading}><span className={styles.eyebrow}>FRENAW’A HOŞ GELDİN</span><h1 id="auth-heading">{mode === "giris" ? "Tekrar hoş geldin." : "Yeni bir başlangıç."}</h1><p>{mode === "giris" ? "Hesabına giriş yap." : "Ücretsiz hesabını oluştur."}</p></header>
        {visibleMessage && <div role={visibleMessage.type === "error" ? "alert" : "status"} className={styles.message} data-error={visibleMessage.type === "error"}>{visibleMessage.type === "error" ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}<span>{visibleMessage.text}</span></div>}
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          {mode === "kayit" && <><label htmlFor="register-name">Ad soyad<input id="register-name" name="name" autoComplete="name" placeholder="Adın ve soyadın" required minLength={2} maxLength={100}/></label><label htmlFor="register-display">Kullanıcı adı / marka adı<input id="register-display" name="display_name" autoComplete="nickname" placeholder="Roel Cloud" required minLength={2} maxLength={80}/></label></>}
          <label htmlFor="login-email">E-posta<input id="login-email" name="email" type="email" autoComplete="email" placeholder="ornek@email.com" required maxLength={254}/></label>
          <label htmlFor="login-password">Şifre<span className={styles.password}><input id="login-password" aria-label="Şifre" name="password" type={show ? "text" : "password"} autoComplete={mode === "kayit" ? "new-password" : "current-password"} placeholder={mode === "kayit" ? "En az 8 karakter" : "Şifren"} minLength={mode === "kayit" ? 8 : 1} maxLength={256} required/><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}>{show ? <EyeOff size={19}/> : <Eye size={19}/>}</button></span></label>
          {mode === "kayit" && <label className={styles.consent}><input type="checkbox" name="adult" required/><span>18 yaşını doldurdum ve <Link href="/kullanim-kosullari" target="_blank">kullanım koşullarını</Link> kabul ediyorum. <Link href="/gizlilik" target="_blank">Gizlilik</Link></span></label>}
          <button className={styles.submit} disabled={loading}>{loading ? <><Loader2 size={19} className="spin"/> İşleniyor…</> : <>{mode === "giris" ? "Giriş yap" : "Hesap oluştur"}<ArrowRight size={18}/></>}</button>
        </form>
        {googleEnabled && <><div className={styles.divider}><span>veya</span></div><button className={styles.google} onClick={handleGoogle} disabled={loading}><GoogleIcon/> Google ile devam et</button></>}
        <p className={styles.switch}>{mode === "giris" ? "Henüz hesabın yok mu?" : "Zaten hesabın var mı?"} <button type="button" disabled={loading} onClick={() => { setMode(mode === "giris" ? "kayit" : "giris"); setMsg(null); setHideUrlError(true); }}>{mode === "giris" ? "Kaydol" : "Giriş yap"}</button></p>
      </div>
    </section>
    <aside className={styles.scene} aria-label="Frenaw ile birlikte üret">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/frenaw-hero.webp" alt="Bir proje üzerinde fikirlerini paylaşan çalışma arkadaşları" width={1280} height={1280} fetchPriority="high"/>
      <div className={styles.sceneShade}/><div className={styles.orbit} aria-hidden="true"/><div className={styles.sceneCopy}><span>FİKRİNDEN FAZLASI VAR.</span><h2 key={mode}>{mode === "giris" ? "Güzel işler birlikte çıkar." : "Bir fikrin var. Birlikte büyütelim."}</h2><p>Doğru insanlarla tanış. Birlikte üret.</p><div className={styles.sceneFoot}><span>Frenaw</span><span>%0 platform komisyonu</span></div></div>
    </aside>
  </div>;
}

export default function GirisPage() {
  return <Suspense fallback={<div className={styles.loading}><Loader2 className="spin" size={28}/></div>}><GirisForm/></Suspense>;
}
