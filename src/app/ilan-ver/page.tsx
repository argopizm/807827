"use client";

import { useState } from "react";
import { Briefcase, DollarSign, Tag, AlignLeft, Send } from "lucide-react";

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Yazılım",
    budget: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("İlan gönderildi:", formData);
    alert("İlanınız başarıyla oluşturuldu! (Simülasyon)");
  };

  return (
    <div className="post-job container">
      <div className="form-wrapper glass-card">
        <div className="form-header">
          <h1 className="gradient-text">Yeni İlan Oluştur</h1>
          <p>İşinizi en iyi anlatan detayları girin ve doğru freelancer'ı bulun.</p>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="input-group">
            <label>
              <Briefcase size={18} /> İş Başlığı
            </label>
            <input
              type="text"
              placeholder="Örn: Modern bir e-ticaret sitesi tasarımı"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>
                <Tag size={18} /> Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Yazılım</option>
                <option>Tasarım</option>
                <option>Pazarlama</option>
                <option>Çeviri</option>
                <option>Video & Animasyon</option>
              </select>
            </div>

            <div className="input-group">
              <label>
                <DollarSign size={18} /> Bütçe Aralığı
              </label>
              <input
                type="text"
                placeholder="Örn: 5000 - 10000 TL"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label>
              <AlignLeft size={18} /> İş Detayları
            </label>
            <textarea
              rows={6}
              placeholder="İşin detaylarını, beklentilerinizi ve teslim süresini buraya yazın..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn-primary submit-btn">
            <Send size={18} /> İlanı Yayınla
          </button>
        </form>
      </div>

      <style jsx>{`
        .post-job {
          padding-top: 60px;
          display: flex;
          justify-content: center;
        }
        .form-wrapper {
          width: 100%;
          max-width: 800px;
          padding: 48px;
        }
        .form-header {
          margin-bottom: 40px;
          text-align: center;
        }
        .form-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .form-header p {
          color: var(--text-muted);
        }

        .job-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        input, select, textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--foreground);
          font-family: inherit;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        
        .submit-btn {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 16px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-wrapper {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
