import Link from "next/link";
import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Kullanım koşulları";
const description = "Frenaw’ın rolü, proje ilanları, kullanıcı davranışları, kimlik eşleşmesi ve destek süreçleri.";

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
        <h2>Kabul</h2>
        <p>Frenaw’a üye olarak veya platformu kullanarak bu koşulları kabul etmiş olursunuz. Koşulları kabul etmiyorsanız platformu kullanmayın.</p>
      </section>
      <section>
        <h2>Proje ve ücret koşulları</h2>
        <p>Frenaw, bireysel olarak yürütülen ve kullanıcılarından platform kullanım ücreti ya da komisyon almayan bir projedir. Bağımsız uzmanların ve proje sahiplerinin birbirini bulmasına yardımcı olur. Taraflar çalışma kapsamını, teslimi ve ücreti kendi aralarında belirler. Frenaw proje bedelini tahsil etmez, ödeme aracılığı veya emanet hizmeti sunmaz.</p>
      </section>
      <section>
        <h2>Frenaw’ın rolü ve sorumluluğun sınırı</h2>
        <ul>
          <li>Frenaw, kullanıcılar arasındaki işlerin, sözleşmelerin ve ödemelerin tarafı değildir. İşin kalitesi, teslimi, ödenmesi ve vergisel yükümlülükler taraflara aittir.</li>
          <li>Kullanıcı içerikleri yayımlanmadan önce denetlenmez. Profil, ilan, hizmet ve değerlendirmelerdeki bilgilerin doğruluğu paylaşan kullanıcının sorumluluğundadır.</li>
          <li>Platform ücretsiz ve “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışma garantisi verilmez. Kanunen sınırlandırılamayan sorumluluklar saklıdır.</li>
        </ul>
      </section>
      <section>
        <h2>Hesap ve içerik kuralları</h2>
        <ul>
          <li>Üyelik yalnızca 18 yaşını doldurmuş kişiler içindir.</li>
          <li>Hesap bilgilerini doğru tutun ve şifrenizi kimseyle paylaşmayın. Başkası adına hesap açmayın ve kötüye kullanım amacıyla birden çok hesap oluşturmayın.</li>
          <li>Yalnızca yayımlamaya yetkili olduğunuz görsel ve metinleri kullanın. Aldatıcı teklif, dolandırıcılık, taciz, nefret söylemi, spam ve hukuka aykırı içerik paylaşmayın.</li>
          <li>Değerlendirmelerde kendi çalışma deneyiminizi aktarın. Kişisel bilgileri veya gizli proje içeriğini izinsiz paylaşmayın.</li>
          <li>Platformu otomatik araçlarla toplu veri çekmek, güvenlik önlemlerini aşmak veya hizmeti aksatmak için kullanmayın.</li>
        </ul>
      </section>
      <section>
        <h2>Kimlik eşleşmesi</h2>
        <p>İsteğe bağlı <Link href="/dogrulama">kimlik doğrulamada</Link> yalnızca kendi bilgilerinizi kullanabilirsiniz. “NVİ eşleşmesi” işareti, girilen bilgilerin NVİ kaydıyla uyuştuğunu gösterir; kişinin güvenilirliğine veya hesabı kullananın kimliğine dair bir garanti değildir. Başkasının bilgileriyle doğrulama yapan hesabın işareti kaldırılır ve hesap kapatılabilir.</p>
      </section>
      <section>
        <h2>İçeriğin kaldırılması ve hesabın kapatılması</h2>
        <p>Bu koşullara veya hukuka aykırı içerikler kaldırılabilir, ilgili hesap kısıtlanabilir veya kapatılabilir. Kararlara <Link href="/destek">Destek merkezi</Link> üzerinden itiraz edebilirsiniz. Hesabınızı dilediğiniz zaman <Link href="/hesabim/ayarlar">hesap ayarlarından</Link> silebilirsiniz.</p>
      </section>
      <section>
        <h2>İletişim ve şikâyet</h2>
        <p>Site içi mesajlaşmayı kullanabilir veya isteğe bağlı dış iletişim bağlantılarını paylaşabilirsiniz. Hesap sorunları, şikâyet ve moderasyon itirazları için <Link href="/destek">Destek merkezi</Link> üzerinden talep açabilirsiniz.</p>
      </section>
      <section>
        <h2>Değişiklikler ve uygulanacak hukuk</h2>
        <p>Koşullar güncellenebilir; güncel metin ve tarihi bu sayfada yayımlanır. Önemli değişiklikler kayıtlı e-posta adresinize veya site içinde duyurulur. Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır.</p>
      </section>
    </PolicyPage>
  );
}
