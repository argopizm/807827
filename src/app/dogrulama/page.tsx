import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kimlik doğrulama",
  robots: { index: false, follow: false },
};

export default function VerificationPage() {
  return (
    <div className="verify-page container">
      <div className="form-wrapper glass-card">
        <div className="form-header">
          <ShieldCheck size={32} aria-hidden="true" />
          <h1>Kimlik doğrulama</h1>
          <p>Kimlik doğrulama şu anda kapalı. Bu işlem için kimlik bilgisi istemiyoruz.</p>
        </div>
        <p>Yetkili doğrulama kanalı ve saklama koşulları kesinleştiğinde, hangi bilgilerin nasıl işlendiği bu sayfada açıklanacak.</p>
        <p>Kimlik numaranızı veya kimlik belgenizi sohbet ya da destek taleplerinde paylaşmayın.</p>
        <p><Link href="/kimlik-dogrulama-aydinlatma">Kimlik doğrulama aydınlatması</Link></p>
        <Link href="/hesabim" className="btn-secondary">Hesabıma dön</Link>
      </div>
    </div>
  );
}
