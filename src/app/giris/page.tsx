"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";

export default function GirisPage() {
  const [mode, setMode] = useState<"giris" | "kayit">("giris");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />

      <div className="auth-card glass-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="gradient-text">Freelancer</span> Türkiye
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "giris" ? "active" : ""}`}
            onClick={() => setMode("giris")}
          >
            Giriş Yap
          </button>
          <button
            className={`auth-tab ${mode === "kayit" ? "active" : ""}`}
            onClick={() => setMode("kayit")}
          >
            Kaydol
          </button>
          <div className={`auth-tab-indicator ${mode === "kayit" ? "right" : ""}`} />
        </div>

        {/* Google OAuth Button */}
        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {mode === "giris" ? "Google ile Giriş Yap" : "Google ile Kaydol"}
        </button>

        <div className="auth-divider">
          <span>veya e-posta ile devam et</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {mode === "kayit" && (
            <div className="input-group">
              <label><User size={14} /> Ad Soyad</label>
              <input type="text" placeholder="Adınız Soyadınız" />
            </div>
          )}

          <div className="input-group">
            <label><Mail size={14} /> E-posta</label>
            <input type="email" placeholder="ornek@email.com" />
          </div>

          <div className="input-group">
            <label><Lock size={14} /> Şifre</label>
            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "kayit" ? "En az 8 karakter" : "Şifreniz"}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "giris" && (
            <a href="#" className="forgot-link">Şifremi unuttum</a>
          )}

          {mode === "kayit" && (
            <p className="auth-notice">
              Kaydolarak <a href="#">Kullanım Şartlarını</a> ve{" "}
              <a href="#">Gizlilik Politikasını</a> kabul etmiş olursunuz.
            </p>
          )}

          <button type="submit" className="btn-primary auth-submit">
            {mode === "giris" ? "Giriş Yap" : "Hesap Oluştur"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          {mode === "giris" ? (
            <>Hesabın yok mu? <button onClick={() => setMode("kayit")}>Kaydol</button></>
          ) : (
            <>Zaten hesabın var mı? <button onClick={() => setMode("giris")}>Giriş Yap</button></>
          )}
        </p>
      </div>
    </div>
  );
}
