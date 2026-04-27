"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ReviewPage({ params }: { params: { handshakeId: string } }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Lütfen bir puan seçin!");
    setSubmitted(true);
  };

  return (
    <div className="review-page container">
      <div className="review-card glass-card">
        {submitted ? (
          <div className="success-state">
            <CheckCircle2 size={64} color="var(--success)" />
            <h1>Değerlendirmeniz Alındı!</h1>
            <p>Geri bildiriminiz platform güvenliği için çok değerlidir. Teşekkürler!</p>
            <button className="btn-primary" onClick={() => window.location.href = "/"}>Ana Sayfaya Dön</button>
          </div>
        ) : (
          <>
            <div className="review-header">
              <h1 className="gradient-text">İşi Değerlendirin</h1>
              <p>El sıkıştığınız bu iş tamamlandı mı? Deneyiminizi paylaşın.</p>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="rating-selector">
                <label>Memnuniyet Puanınız</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className={star <= (hover || rating) ? "active" : ""}
                    >
                      <Star size={40} fill={star <= (hover || rating) ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <span className="rating-text">
                  {rating === 1 && "Çok Kötü"}
                  {rating === 2 && "Kötü"}
                  {rating === 3 && "Orta"}
                  {rating === 4 && "İyi"}
                  {rating === 5 && "Harika!"}
                </span>
              </div>

              <div className="input-group">
                <label><MessageSquare size={16} /> Yorumunuz (Opsiyonel)</label>
                <textarea
                  placeholder="Freelancer/Müşteri ile iletişiminiz nasıldı? İş kalitesinden memnun kaldınız mı?"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary submit-btn">
                <Send size={18} /> Değerlendirmeyi Gönder
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .review-page {
          padding-top: 80px;
          display: flex;
          justify-content: center;
        }
        .review-card {
          width: 100%;
          max-width: 600px;
          padding: 48px;
          text-align: center;
        }
        .review-header { margin-bottom: 40px; }
        .review-header h1 { font-size: 32px; margin-bottom: 12px; }
        .review-header p { color: var(--text-muted); }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
          text-align: left;
        }
        .rating-selector {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rating-selector label { font-weight: 600; color: var(--text-muted); }
        .stars {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .stars button {
          color: var(--glass-border);
          transition: all 0.2s ease;
        }
        .stars button.active { color: var(--warning); transform: scale(1.1); }
        .rating-text {
          font-weight: 700;
          color: var(--warning);
          height: 20px;
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
        textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 16px;
          color: white;
          font-family: inherit;
          font-size: 15px;
          resize: none;
        }
        textarea:focus { outline: none; border-color: var(--primary); }

        .submit-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 16px;
        }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .success-state h1 { font-size: 28px; }
      `}</style>
    </div>
  );
}
