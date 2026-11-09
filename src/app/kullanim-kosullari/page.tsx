import Link from "next/link";
import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Kullanım koşulları";
const description = "Frenaw’ın rolü, proje ilanları, kullanıcı davranışları ve destek süreçleri.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/kullanim-kosullari", index: false });

export default function TermsPage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Platformu işleten kişi</h2>
        <DataController />
      </section>
      <section>
        <h2>Proje ve ücret koşulları</h2>
        <p>Frenaw, bireysel olarak yürütülen ve kullanıcılarından platform kullanım ücreti ya da komisyon almayan bir projedir. Bağımsız uzmanların ve proje sahiplerinin birbirini bulmasına yardımcı olur. Taraflar çalışma kapsamını, teslimi ve ücreti kendi aralarında belirler. Bu sürüm proje bedelini tahsil etmez veya üzerinden komisyon almaz.</p>
      </section>
      <section>
        <h2>Hesap ve içerik kuralları</h2>
        <ul>
          <li>Üyelik yalnızca 18 yaşını doldurmuş kişiler içindir.</li>
          <li>Hesap bilgilerini doğru tutun. Başkası adına hesap açmayın ve kötüye kullanım amacıyla birden çok hesap oluşturmayın.</li>
          <li>Yalnızca yayımlamaya yetkili olduğunuz görsel ve metinleri kullanın. Aldatıcı teklif, taciz, spam ve hukuka aykırı içerik paylaşmayın.</li>
          <li>Değerlendirmelerde kendi çalışma deneyiminizi aktarın. Kişisel bilgileri veya gizli proje içeriğini izinsiz paylaşmayın.</li>
        </ul>
      </section>
      <section>
        <h2>İletişim ve şikâyet</h2>
        <p>Site içi mesajlaşmayı kullanabilir veya isteğe bağlı dış iletişim bağlantılarını paylaşabilirsiniz. Hesap sorunları, şikâyet ve moderasyon itirazları için <Link href="/destek">Destek merkezi</Link> üzerinden talep açabilirsiniz.</p>
      </section>
    </PolicyPage>
  );
}
