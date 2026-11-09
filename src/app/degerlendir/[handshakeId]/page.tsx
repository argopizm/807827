import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import ReviewClient from "./ReviewClient";


export const metadata: Metadata = {
  title: "İşi değerlendir",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ handshakeId: string }> }) {
  const { handshakeId } = await params;
  const session = await auth();
  const reviewer = session?.user?.id;
  if (!reviewer) {
    return <div className="review-page container"><p>Bir işi değerlendirmek için hesabınıza giriş yapın.</p><Link href="/giris">Giriş yap</Link></div>;
  }

  const db = await getDB();
  const eligible = await db?.prepare(
    "SELECT h.id FROM handshakes h JOIN jobs j ON j.id = h.job_id AND j.client_id = h.client_id " +
    "WHERE h.id = ? AND h.status = 'completed' AND j.status = 'completed' AND (h.client_id = ? OR h.freelancer_id = ?)",
  ).bind(handshakeId, reviewer, reviewer).first();
  if (!eligible) {
    return <div className="review-page container"><p>Bu iş için değerlendirme formu açılmadı.</p><Link href="/hesabim">Hesabıma dön</Link></div>;
  }

  const existing = await db?.prepare("SELECT id FROM reviews WHERE handshake_id = ? AND reviewer_id = ?")
    .bind(handshakeId, reviewer).first();
  if (existing) {
    return <div className="review-page container"><p>Bu işi daha önce değerlendirdiniz.</p><Link href="/hesabim">Hesabıma dön</Link></div>;
  }

  return <ReviewClient handshakeId={handshakeId} />;
}
