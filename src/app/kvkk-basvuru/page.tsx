import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "KVKK başvurusu";
const description = "Kişisel verilerinize ilişkin haklarınız ve veri sorumlusuna başvuru usulü.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/kvkk-basvuru", index: false });

export default function DataRequestPage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Başvuru iletişim bilgileri</h2>
        <DataController />
      </section>
      <section>
        <h2>Başvuru usulü</h2>
        <p>Hesabınızda kayıtlı e-posta adresinizden <a href="mailto:destek@frenaw.com">destek@frenaw.com</a> adresine başvurabilirsiniz. Konuya “KVKK başvurusu” yazıp talebinizi açıkça belirtin. Başvurunuzun usulü ve gerekli unsurları için <a href="https://www.kvkk.gov.tr/Icerik/6938/Kurumumuza-Yapilan-Sikayetlerin-Usul-Sartlarina-Iliskin-Kamuoyu-Duyurusu" target="_blank" rel="noopener noreferrer">Kişisel Verileri Koruma Kurumunun açıklamasını</a> inceleyebilirsiniz. Tebliğ’deki diğer başvuru yöntemlerine ilişkin haklarınız saklıdır. Kimlik bilgilerinizi genel destek, ilan veya sohbet alanına göndermeyin.</p>
      </section>
      <section>
        <h2>Yanıt süresi</h2>
        <p>Veri sorumlusuna usulüne uygun ulaşan başvurular, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde sonuçlandırılır.</p>
      </section>
    </PolicyPage>
  );
}
