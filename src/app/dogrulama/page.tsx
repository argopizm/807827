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

      <style jsx>{`
        .verify-page {
          padding-top: 80px;
          display: flex;
          justify-content: center;
        }
        .verify-card {
          width: 100%;
          max-width: 500px;
          padding: 48px;
          text-align: center;
        }
        .verify-header {
          margin-bottom: 40px;
        }
        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .icon { color: var(--primary); }
        .verify-header h1 { font-size: 28px; margin-bottom: 12px; }
        .verify-header p { color: var(--text-muted); font-size: 15px; }

        .verify-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 12px;
          color: white;
          font-family: inherit;
        }
        .notice {
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }
        .verify-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .success-state h2 { font-size: 24px; }
        .error-msg { color: var(--accent); font-size: 14px; margin-top: 10px; text-align: center; }
      `}</style>
    </div>
  );
}
