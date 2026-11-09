import Link from "next/link";
import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Kimlik doğrulama";
const description = "İsteğe bağlı NVİ eşleşme sorgusunda kişisel verilerin işlenmesine ilişkin aydınlatma metni.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/kimlik-dogrulama-aydinlatma", index: false });

export default function VerificationNoticePage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Veri sorumlusu</h2>
        <DataController />
      </section>
      <section>
        <h2>Hangi veriler, hangi amaçla işlenir?</h2>
        <p>Kimlik doğrulama isteğe bağlıdır. Başlatırsanız adınız, soyadınız, T.C. kimlik numaranız ve doğum yılınız, yalnızca bu bilgilerin Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü (NVİ) kayıtlarıyla eşleşip eşleşmediğini öğrenmek için kullanılır. Eşleşme olursa hesabınızda yalnızca “eşleşti” işareti tutulur ve profilinizde “NVİ eşleşmesi” ifadesi gösterilir.</p>
      </section>
      <section>
        <h2>Sıfır saklama</h2>
        <ul>
          <li>Girdiğiniz dört bilgi veritabanına, günlük kayıtlarına, destek kayıtlarına veya tarayıcı depolamasına yazılmaz. Sorgu sonucu döner dönmez bellekten atılır ve form temizlenir.</li>
          <li>Kimlik numaranızdan türetilmiş bir özet veya şifreli kopya da tutulmaz. Bu nedenle aynı kişinin birden fazla hesapta doğrulama yapması teknik olarak engellenmez.</li>
          <li>Başarısız denemelerde de bilgi kaydedilmez. Kötüye kullanımı önlemek için yalnızca hesap ve bağlantı başına deneme sayısı geçici olarak bellekte sayılır.</li>
          <li>NVİ’nin sorguyu kendi sistemlerinde nasıl kaydettiği Frenaw’ın kontrolünde değildir.</li>
        </ul>
      </section>
      <section>
        <h2>Aktarılan taraflar ve toplama yöntemi</h2>
        <p>Bilgiler, doğrulama formuna sizin girmenizle elektronik ortamda toplanır. Frenaw’ın barındırıldığı Cloudflare altyapısı üzerinden şifreli bağlantıyla NVİ’nin herkese açık T.C. kimlik numarası doğrulama servisine iletilir. Başka hiçbir kişi veya kuruluşla paylaşılmaz.</p>
      </section>
      <section>
        <h2>Hukuki sebep</h2>
        <p>Doğrulama isteğe bağlı olduğundan bu veriler KVKK’nın 5. maddesinin 1. fıkrası uyarınca açık rızanıza dayanılarak işlenir. Rıza vermemeniz platformun diğer özelliklerini kullanmanıza engel değildir. Profilinizdeki işareti kaldırmak için destek talebi açabilir veya hesabınızı silebilirsiniz.</p>
      </section>
      <section>
        <h2>İşaretin anlamı</h2>
        <p>“NVİ eşleşmesi” yalnızca girilen dört bilginin NVİ kaydıyla uyuştuğunu gösterir. Hesabı kullanan kişinin o bilgilerin sahibi olduğunu, resmî bir kimlik onayını veya kişinin güvenilirliğini kanıtlamaz. Başkasına ait bilgilerle doğrulama yapmak yasaktır ve hesabın kapatılmasına yol açabilir.</p>
      </section>
      <section>
        <h2>Haklarınız</h2>
        <p>KVKK’nın 11. maddesindeki haklarınızı <Link href="/kvkk-basvuru">KVKK başvurusu</Link> sayfasındaki usulle kullanabilirsiniz.</p>
      </section>
    </PolicyPage>
  );
}
