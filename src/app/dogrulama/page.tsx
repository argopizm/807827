"use client";

import { useState } from "react";
import { ShieldCheck, User, Calendar, Fingerprint, Loader2 } from "lucide-react";

export default function VerificationPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    // Simülasyon: Gerçek API çağrısı burada lib/verify-tc.ts üzerinden yapılacak
    setTimeout(() => {
      setLoading(false);
      setStatus("success"); // Simülasyon sonucu
    }, 2000);
  };

  return (
    <div className="verify-page container">
      <div className="verify-card glass-card">
        <div className="verify-header">
          <div className="icon-wrapper">
            <ShieldCheck size={48} className="icon" />
          </div>
          <h1 className="gradient-text">Kimlik Doğrulama</h1>
          <p>
            Hesabınızı NVI üzerinden doğrulayarak "Onaylı Profil" rozeti kazanın ve 
            müşterilerinize güven verin.
          </p>
        </div>

        {status === "success" ? (
          <div className="success-state">
            <ShieldCheck size={64} color="var(--success)" />
            <h2>Tebrikler!</h2>
            <p>Kimliğiniz başarıyla doğrulandı. Rozetiniz profilinize eklendi.</p>
            <button className="btn-primary" onClick={() => window.location.href = "/dashboard"}>
              Panele Git
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="verify-form">
            <div className="input-row">
              <div className="input-group">
                <label><User size={16} /> Ad</label>
                <input type="text" placeholder="ALİ" required />
              </div>
              <div className="input-group">
                <label><User size={16} /> Soyad</label>
                <input type="text" placeholder="YILMAZ" required />
              </div>
            </div>

            <div className="input-group">
              <label><Fingerprint size={16} /> TC Kimlik No</label>
              <input type="text" maxLength={11} placeholder="12345678901" required />
            </div>

            <div className="input-group">
              <label><Calendar size={16} /> Doğum Yılı</label>
              <input type="number" min={1900} max={new Date().getFullYear()} placeholder="1995" required />
            </div>

            <p className="notice">
              * Bilgileriniz sadece doğrulama amaçlı kullanılır ve asla sistemimizde saklanmaz.
            </p>

            <button type="submit" className="btn-primary verify-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : "Şimdi Doğrula"}
            </button>
            
            {status === "error" && (
              <p className="error-msg">Bilgiler doğrulanamadı. Lütfen kontrol edip tekrar deneyin.</p>
            )}
          </form>
        )}
      </div>


    </div>
  );
}
