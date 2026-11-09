import Link from "next/link";
import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Gizlilik ve aydınlatma";
const description = "Ziyaret, üyelik, profil, mesajlaşma ve destek işlemlerinde kişisel verilerin kullanımı.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/gizlilik", index: false });

export default function PrivacyPage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Veri sorumlusu</h2>
        <DataController />
      </section>
      <section>
        <h2>Hangi bilgiler kullanılır?</h2>
        <ul>
          <li>Üyelik ve giriş için e-posta, kullanıcı adı, hesap rolü, parolanın doğrulamada kullanılan güvenli özeti ve giriş sağlayıcısının gerekli hesap bilgileri.</li>
          <li>Profil ve keşif için yayınlanmasını seçtiğiniz uzmanlık, portföy ve iletişim bilgileri.</li>
          <li>Ad soyad hesap bilgisi olarak tutulur ve profil adınıza otomatik aktarılmaz. Herkese açık profil, ilan ve mesajlarda seçtiğiniz görünen ad veya marka adı kullanılır; ayrı kullanıcı adınız profil bağlantınızı belirler.</li>
          <li>İlan, teklif, değerlendirme, mesaj ve destek için bu işlemlerde paylaştığınız içerik ve işlem bilgileri.</li>
          <li>Teklif açıklaması, TL tutarı ve gün cinsinden teslim süresi ilgili freelancer ve ilan sahibine gösterilir; herkese açık ilan sayfasında yayınlanmaz.</li>
          <li>Hizmetin çalışması ve kötüye kullanımın önlenmesi için gerekli oturum ve güvenlik bilgileri.</li>
        </ul>
      </section>
      <section>
        <h2>İşleme amaçları ve alıcılar</h2>
        <p>Veriler hesabı işletmek, ilgili özellikleri sunmak, taleplere cevap vermek ve hizmeti korumak için kullanılır. Altyapı Cloudflare hizmetleriyle çalışır. Google ile giriş seçildiğinde giriş sağlayıcısıyla hesap bağlantısı için gerekli bilgiler işlenir. Mesajlar görüşmenin katılımcılarına, destek talepleri ise ilgili kullanıcı ve yetkili personele açıktır. Bildirilen mesajın içeriği şikâyetin incelenmesi için yetkili personele açılır. E-posta doğrulaması etkinleştirilirse doğrulama iletisi Resend aracılığıyla gönderilir.</p>
        <p>Her işlem için somut hukuki sebep, barındırma ve hizmet sağlayıcılarının fiilî konumları, varsa yurt dışı aktarım dayanağı ve saklama süreleri üretim sürümünden önce kesinleştirilecektir.</p>
      </section>
      <section>
        <h2>Kimlik doğrulama</h2>
        <p>T.C. kimlik numarasıyla doğrulama kapalıdır. Kimlik bilgilerinizi ilan, profil, mesaj ve destek alanlarında paylaşmayın. <Link href="/kimlik-dogrulama-aydinlatma">Doğrulama hakkında bilgi alın.</Link></p>
      </section>
      <section>
        <h2>Hesap ayarları ve silme</h2>
        <p>Profilinizi, şifrenizi ve e-posta adresinizi <Link href="/hesabim/ayarlar">hesap ayarlarından</Link> düzenleyebilirsiniz. E-posta değişikliği yeni adrese gönderilen bağlantıyla tamamlanır. Şifre ve e-posta değişikliğinde diğer oturumlar da kapatılır.</p>
        <p>Hesap silindiğinde giriş ve profil bilgileri kaldırılır; hizmetler ve hesaba ait destek talepleri silinir, ilanlar kapatılır ve gönderilen mesajların içeriği kaldırılır. Hesapla ilişkili teklifler iptal edilir; açıklama, fiyat ve teslim süresi alanları temizlenir. Diğer katılımcıların kayıtlarını korumak için işlem ilişkilerini taşıyan teknik kimlikler ile “Silinen kullanıcı” açıklaması kalabilir. Bu işlem tüm kayıtların anonimleştirilmesi anlamına gelmez. Altyapı yedekleri aynı anda silinmez; sağlayıcının yedek saklama döngüsüne tabidir.</p>
      </section>
      <section>
        <h2>Haklarınız</h2>
        <p>KVKK’nın 11. maddesi kapsamında erişim, düzeltme, şartları varsa silme veya yok etme ve diğer haklarınız için <Link href="/kvkk-basvuru">başvuru usulünü</Link> inceleyin.</p>
      </section>
    </PolicyPage>
  );
}
