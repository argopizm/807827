"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "Sunucu yapılandırma hatası. Lütfen Google yerine e-posta ile giriş yapmayı deneyin.",
  AccessDenied: "Erişim reddedildi.",
  Verification: "Doğrulama hatası.",
  OAuthCallback: "Google girişi sırasında hata oluştu. Tekrar deneyin.",
  Default: "Bir hata oluştu. Tekrar deneyin.",
};

export default function GirisPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"giris" | "kayit">("giris");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);

  // Hata parametresi varsa göster
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setMsg({ type: "error", text: errorMessages[err] ?? errorMessages.Default });
  }, [searchParams]);

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const handleGoogle = async () => {
    setLoading(true);
    setMsg(null);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const name = mode === "kayit" ? (form.elements.namedItem("name") as HTMLInputElement)?.value : null;

    if (mode === "kayit") {
      // Kayıt
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "error", text: data.error ?? "Kayıt başarısız." });
          setLoading(false);
          return;
        }
        setMsg({ type: "success", text: "Kayıt başarılı! Şimdi giriş yapılıyor..." });
        // Otomatik giriş
        const result = await signIn("credentials", { email, password, callbackUrl: "/", redirect: false });
        if (result?.error) {
          setMsg({ type: "error", text: "Kayıt tamam, ancak otomatik giriş başarısız. Manuel giriş yapın." });
          setMode("giris");
        } else {
          window.location.href = result?.url ?? "/";
        }
      } catch {
        setMsg({ type: "error", text: "Bağlantı hatası. Tekrar deneyin." });
      }
    } else {
      // Giriş
      const result = await signIn("credentials", { email, password, callbackUrl: "/", redirect: false });
      if (result?.error) {
        setMsg({ type: "error", text: "E-posta veya şifre hatalı." });
      } else if (result?.url) {
        window.location.href = result.url;
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card glass-card">
        <div className="auth-logo">
          <span className="gradient-text">Freelancer</span> Türkiye
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "giris" ? "active" : ""}`} onClick={() => { setMode("giris"); setMsg(null); }}>Giriş Yap</button>
          <button className={`auth-tab ${mode === "kayit" ? "active" : ""}`} onClick={() => { setMode("kayit"); setMsg(null); }}>Kaydol</button>
          <div className={`auth-tab-indicator ${mode === "kayit" ? "right" : ""}`} />
        </div>

        {msg && (
          <div className={`auth-msg ${msg.type}`}>
            {msg.type === "error" && <AlertCircle size={15} />}
            {msg.type === "success" && <CheckCircle2 size={15} />}
            <span>{msg.text}</span>
          </div>
        )}

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          {loading ? "Yönlendiriliyor..." : mode === "giris" ? "Google ile Giriş Yap" : "Google ile Kaydol"}
        </button>

        <div className="auth-divider"><span>veya e-posta ile</span></div>

        <form className="auth-form" onSubmit={handleEmailSubmit}>
          {mode === "kayit" && (
            <div className="input-group">
              <label><User size={14} /> Ad Soyad</label>
              <input name="name" type="text" placeholder="Adınız Soyadınız" required minLength={2} />
            </div>
          )}
          <div className="input-group">
            <label><Mail size={14} /> E-posta</label>
            <input name="email" type="email" placeholder="ornek@email.com" required />
          </div>
          <div className="input-group">
            <label><Lock size={14} /> Şifre</label>
            <div className="password-wrap">
              <input name="password" type={show ? "text" : "password"} placeholder={mode === "kayit" ? "En az 8 karakter" : "Şifreniz"} required minLength={mode === "kayit" ? 8 : 1} />
              <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "kayit" && (
            <p className="auth-notice">Kaydolarak <a href="#">Kullanım Şartlarını</a> kabul etmiş olursunuz.</p>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <><Loader2 className="spin" size={18} /> İşleniyor...</> : <>{mode === "giris" ? "Giriş Yap" : "Hesap Oluştur"} <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "giris"
            ? <>Hesabın yok mu? <button onClick={() => { setMode("kayit"); setMsg(null); }}>Kaydol</button></>
            : <>Hesabın var mı? <button onClick={() => { setMode("giris"); setMsg(null); }}>Giriş Yap</button></>}
        </p>
      </div>
    </div>
  );
}
