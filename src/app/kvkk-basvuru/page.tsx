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
        <h2>Haklarınız</h2>
        <p>KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak şunları talep edebilirsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi isteme,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
          <li>Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li>
          <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
        </ul>
      </section>
      <section>
        <h2>Başvuru usulü</h2>
        <p>Hesabınızda kayıtlı e-posta adresinizden <a href="mailto:destek@frenaw.com">destek@frenaw.com</a> adresine başvurabilirsiniz. Konuya “KVKK başvurusu” yazın; başvurunuzda adınızı soyadınızı, iletişim bilginizi ve talebinizi açıkça belirtin. Kimliğinizi doğrulamak için hesabınıza ait olmayan ek bilgi istenmez; gerektiğinde kayıtlı e-posta adresinizden teyit alınır. Başvuru usulü ve gerekli unsurlar için <a href="https://www.kvkk.gov.tr/Icerik/6938/Kurumumuza-Yapilan-Sikayetlerin-Usul-Sartlarina-Iliskin-Kamuoyu-Duyurusu" target="_blank" rel="noopener noreferrer">Kişisel Verileri Koruma Kurumunun açıklamasını</a> inceleyebilirsiniz. Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’deki diğer başvuru yöntemlerine ilişkin haklarınız saklıdır.</p>
        <p>Kimlik numaranızı veya kimlik görselinizi başvuruya eklemeyin; genel destek, ilan veya sohbet alanlarına da göndermeyin.</p>
      </section>
      <section>
        <h2>Yanıt süresi ve ücret</h2>
        <p>Usulüne uygun başvurular talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde yalnızca Kişisel Verileri Koruma Kurulunun belirlediği tarifedeki ücret alınabilir.</p>
      </section>
      <section>
        <h2>Kurula şikâyet</h2>
        <p>Başvurunuz reddedilir, verilen yanıtı yetersiz bulursanız veya süresinde yanıt verilmezse; yanıtı öğrendiğiniz tarihten itibaren otuz gün ve her hâlde başvuru tarihinden itibaren altmış gün içinde Kişisel Verileri Koruma Kuruluna şikâyette bulunabilirsiniz (KVKK m.14).</p>
      </section>
    </PolicyPage>
  );
}
