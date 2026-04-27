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


    </div>
  );
}
