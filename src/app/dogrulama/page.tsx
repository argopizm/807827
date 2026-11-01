"use client";

import { useState } from "react";
import { ShieldCheck, User, Calendar, Fingerprint, Loader2 } from "lucide-react";

export default function VerificationPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_tc",
          tcNo,
          firstName,
          lastName,
          birthYear: Number(birthYear),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Kimlik bilgileri doğrulanamadı.");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page container">
      <div className="verify-card glass-card">
        <div className="verify-header">
          <div className="icon-wrapper">
            <ShieldCheck size={48} className="icon" />
          </div>
          <h1>Kimlik Doğrulama</h1>
          <p>
            Hesabınızı NVI üzerinden doğrulayarak &quot;Kimlik Onaylı&quot; rozeti kazanın ve 
            müşterilerinize güven verin.
          </p>
        </div>

        {status === "success" ? (
          <div className="success-state">
            <ShieldCheck size={64} color="var(--success)" />
            <h2>Tebrikler!</h2>
            <p>Kimliğiniz başarıyla doğrulandı. Rozetiniz profilinize eklendi.</p>
            <a href="/hesabim" className="btn-primary" style={{ textDecoration: "none" }}>
              Panele Git
            </a>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="verify-form">
            <div className="input-row">
              <div className="input-group">
                <label><User size={16} /> Ad (Kimlikteki gibi)</label>
                <input
                  type="text"
                  placeholder="ALİ"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label><User size={16} /> Soyad (Kimlikteki gibi)</label>
                <input
                  type="text"
                  placeholder="YILMAZ"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label><Fingerprint size={16} /> TC Kimlik No</label>
              <input
                type="text"
                maxLength={11}
                placeholder="11 haneli TC Kimlik No"
                value={tcNo}
                onChange={(e) => setTcNo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label><Calendar size={16} /> Doğum Yılı</label>
              <input
                type="number"
                min={1920}
                max={new Date().getFullYear() - 15}
                placeholder="1995"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
              />
            </div>

            <p className="notice">
              * Bilgileriniz sadece NVI doğrulama amacıyla kullanılır ve asla sistemimizde saklanmaz.
            </p>

            <button type="submit" className="btn-primary verify-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : "Şimdi Doğrula"}
            </button>

            {status === "error" && (
              <p className="auth-msg error" style={{ marginTop: 16 }}>{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
