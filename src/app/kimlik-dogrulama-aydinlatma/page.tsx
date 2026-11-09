import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Kimlik doğrulama";
const description = "Kimlik doğrulamanın güncel durumu ve kimlik bilgilerini paylaşırken dikkat edilmesi gerekenler.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/kimlik-dogrulama-aydinlatma", index: false });

export default function VerificationNoticePage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Doğrulama durumu</h2>
        <p>Frenaw’da T.C. kimlik numarasıyla doğrulama kapalıdır. Kimlik numaranızı veya kimlik görselinizi profil, ilan, mesaj ya da destek talebinde paylaşmayın.</p>
      </section>
      <section>
        <h2>Etkinleştirme koşulları</h2>
        <p>Dört alanlı geçici doğrulama ancak yetkili NVİ kanalı, hukuki işleme dayanağı ve sıfır saklama şartları doğrulanırsa açılacaktır. Özellik açılmadan önce veri sorumlusu, işleme yöntemi, alıcılar ve başvuru haklarını açıklayan nihai aydınlatma metni formun üzerinde sunulacaktır.</p>
      </section>
      <section>
        <h2>Veri sorumlusu</h2>
        <DataController />
      </section>
    </PolicyPage>
  );
}
