"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Wallet, Tag, AlignLeft, Send, Loader2, ShieldCheck, Code2 } from "lucide-react";

export default function PostJobPage() {
  const { status } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    category: "Yazılım",
    budget: "",
    skills: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="auth-loading">
        <Loader2 className="spin" size={36} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="auth-required">
        <div className="glass-card auth-required-card">
          <ShieldCheck size={44} color="var(--primary)" />
          <h2>İlan Vermek İçin Giriş Yapın</h2>
          <p>Ücretsiz iş ilanı yayınlamak için hesabınıza giriş yapmanız gerekmektedir.</p>
          <a href="/giris" className="btn-primary" style={{ textDecoration: "none" }}>
            Giriş Yap / Kayıt Ol
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İlan oluşturulamadı.");
        setSubmitting(false);
        return;
      }
      window.location.href = `/isler/${data.id}`;
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  return (
    <div className="post-job container">
      <div className="form-wrapper glass-card">
        <div className="form-header">
          <h1>Yeni İş İlanı Yayınla</h1>
          <p>Projenizin detaylarını girin ve komisyon ödemeden doğru uzmanla anlaşın.</p>
        </div>

        {error && <p className="auth-msg error" style={{ marginBottom: 20 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="input-group">
            <label>
              <Briefcase size={16} /> İş Başlığı
            </label>
            <input
              type="text"
              placeholder="Örn: Kurumsal web sitesi geliştirme"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>
                <Tag size={16} /> Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Yazılım">Yazılım</option>
                <option value="Tasarım">Tasarım</option>
                <option value="Pazarlama">Pazarlama</option>
                <option value="Çeviri">Çeviri</option>
                <option value="Video">Video</option>
                <option value="Seslendirme">Seslendirme</option>
              </select>
            </div>

            <div className="input-group">
              <label>
                <Wallet size={16} /> Bütçe
              </label>
              <input
                type="text"
                placeholder="Örn: ₺10.000 - ₺15.000"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label>
              <Code2 size={16} /> Aranan Yetenekler (virgülle ayırın)
            </label>
            <input
              type="text"
              placeholder="Örn: React, Next.js, Figma"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>
              <AlignLeft size={16} /> İş Detayları
            </label>
            <textarea
              rows={6}
              placeholder="İşin kapsamını, beklentilerinizi ve teslim süresini açıkça belirtin..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="spin" size={18} /> Yayınlanıyor...</>
            ) : (
              <><Send size={18} /> İlanı Yayınla</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
