import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import IdentityCheck from "./IdentityCheck";

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
          <p>Ad, soyad, T.C. kimlik numarası ve doğum yılınız anlık olarak NVİ kayıtlarıyla karşılaştırılır. İsteğe bağlıdır; hiçbir bilgi kaydedilmez.</p>
        </div>
        <IdentityCheck />
        <div className="identity-footer">
          <Link href="/kimlik-dogrulama-aydinlatma">Kimlik doğrulama aydınlatma metni</Link>
          <p>Kimlik numaranızı veya kimlik belgenizi sohbet ya da destek taleplerinde paylaşmayın.</p>
          <Link href="/hesabim" className="btn-secondary">Hesabıma dön</Link>
        </div>
      </div>
    </div>
  );
}
