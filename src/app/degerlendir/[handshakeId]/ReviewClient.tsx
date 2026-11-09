"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ReviewClient({ handshakeId }: { handshakeId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Lütfen bir memnuniyet puanı seçin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handshakeId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Değerlendirme gönderilemedi.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-page container">
      <div className="review-card glass-card">
        {submitted ? (
          <div className="success-state">
            <CheckCircle2 size={64} color="var(--success)" />
            <h1>Değerlendirmeniz Kaydedildi</h1>
            <p>Geri bildiriminiz platform güvenliği için çok değerlidir. Teşekkürler!</p>
            <Link href="/" className="btn-primary">Ana sayfaya dön</Link>
          </div>
        ) : (
          <>
            <div className="review-header">
              <h1>İşi Değerlendirin</h1>
              <p>Tamamlanan bu iş için deneyiminizi paylaşın.</p>
            </div>

            {error && <p className="auth-msg error" style={{ marginBottom: 16 }}>{error}</p>}

            <form onSubmit={handleSubmit} className="review-form">
              <div className="rating-selector">
                <label>Memnuniyet Puanınız</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={star + ' puan'}
                      aria-pressed={rating === star}
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
                  {rating === 5 && "Mükemmel"}
                </span>
              </div>

              <div className="input-group">
                <label htmlFor="review-comment"><MessageSquare size={16} /> Yorumunuz</label>
                <textarea
                  placeholder="İletişim ve iş kalitesi nasıldı?"
                  id="review-comment"
                  maxLength={1500}
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                {loading ? <><Loader2 className="spin" size={18} /> Gönderiliyor...</> : <><Send size={18} /> Değerlendirmeyi Gönder</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
