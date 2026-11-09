import Link from "next/link";
import PolicyPage, { DataController } from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Gizlilik ve aydınlatma";
const description = "Ziyaret, üyelik, profil, mesajlaşma, destek ve kimlik doğrulama işlemlerinde kişisel verilerin kullanımı.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/gizlilik", index: false });

export default function PrivacyPage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Veri sorumlusu</h2>
        <p>Frenaw bireysel olarak işletilir. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu aşağıdaki gerçek kişidir.</p>
        <DataController />
      </section>
      <section>
        <h2>Hangi bilgiler kullanılır?</h2>
        <ul>
          <li><strong>Kimlik ve hesap:</strong> ad soyad, görünen ad, kullanıcı adı, hesap rolü, 18 yaş beyanı.</li>
          <li><strong>İletişim:</strong> e-posta adresi ve doğrulama durumu; profilinizde paylaşmayı seçtiğiniz WhatsApp, Discord ve portföy bağlantıları.</li>
          <li><strong>Güvenlik:</strong> parolanın geri döndürülemez özeti, oturum sürümü, e-posta doğrulama bağlantılarının özetleri, kötüye kullanımı önlemek için geçici olarak bellekte tutulan istek sayaçları.</li>
          <li><strong>Profil ve içerik:</strong> unvan, kategori, yetenekler, tanıtım yazısı, profil görseli bağlantısı; ilanlar, hizmetler, teklifler (açıklama, TL tutarı, teslim süresi), değerlendirmeler.</li>
          <li><strong>Mesaj ve destek:</strong> site içi mesajlar, okundu bilgisi, engelleme ve şikâyet kayıtları; destek talepleri ve yanıtları.</li>
          <li><strong>Kimlik doğrulama:</strong> yalnızca başlatırsanız ad, soyad, T.C. kimlik no ve doğum yılı anlık sorgu için kullanılır ve saklanmaz; yalnızca eşleşme sonucu tutulur. Ayrıntılar <Link href="/kimlik-dogrulama-aydinlatma">kimlik doğrulama aydınlatmasında</Link>.</li>
        </ul>
        <p>Ad soyad ve e-posta herkese açık değildir. Profil, ilan, değerlendirme ve mesajlarda seçtiğiniz görünen ad gösterilir. Teklif ayrıntılarını yalnızca ilgili freelancer ile ilan sahibi görür.</p>
      </section>
      <section>
        <h2>Toplama yöntemi ve hukuki sebepler</h2>
        <p>Veriler kayıt, profil, ilan, teklif, mesaj, destek ve doğrulama formlarına girdiğiniz bilgilerden ve oturum çerezleri aracılığıyla elektronik ortamda toplanır. KVKK’nın 5. maddesindeki şu sebeplere dayanılır:</p>
        <ul>
          <li>Üyelik, profil, ilan, teklif, mesajlaşma ve destek hizmetlerinin sunulması: sözleşmenin kurulması ve ifası (m.5/2-c).</li>
          <li>Hesap güvenliği, kötüye kullanım ve spamın önlenmesi, şikâyetlerin incelenmesi: veri sorumlusunun meşru menfaati (m.5/2-f).</li>
          <li>KVKK başvurularının yanıtlanması ve yetkili makam taleplerinin karşılanması: hukuki yükümlülük (m.5/2-ç).</li>
          <li>Uyuşmazlık durumunda kayıtların kullanılması: bir hakkın tesisi, kullanılması veya korunması (m.5/2-e).</li>
          <li>Herkese açık olmasını seçtiğiniz profil ve iletişim bilgileri: ilgili kişinin kendisi tarafından alenileştirilmesi (m.5/2-d).</li>
          <li>İsteğe bağlı NVİ kimlik eşleşme sorgusu: açık rıza (m.5/1).</li>
        </ul>
      </section>
      <section>
        <h2>Aktarılan taraflar</h2>
        <ul>
          <li><strong>Cloudflare, Inc.:</strong> barındırma, veritabanı (D1), içerik dağıtımı ve gelen destek e-postalarının yönlendirilmesi.</li>
          <li><strong>Resend:</strong> hesap ve e-posta değişikliği doğrulama iletilerinin gönderimi. Alıcı adresi ve ileti içeriği işlenir.</li>
          <li><strong>Google LLC (Gmail):</strong> destek@frenaw.com adresine gönderdiğiniz e-postalar, veri sorumlusunun Gmail posta kutusuna iletilir.</li>
          <li><strong>NVİ:</strong> yalnızca kimlik doğrulamayı başlatırsanız, eşleşme sorgusu için.</li>
          <li><strong>Diğer kullanıcılar:</strong> mesajlar görüşmenin katılımcılarına, teklif ayrıntıları ilgili taraflara, herkese açık profil bilgileri ziyaretçilere gösterilir.</li>
          <li><strong>Destek personeli:</strong> destek talepleri ve şikâyet edilen mesajın içeriği. Özel konuşma geçmişinin tamamına erişim verilmez.</li>
          <li><strong>Yetkili kamu kurumları:</strong> yalnızca hukuken zorunlu olduğunda.</li>
        </ul>
        <p>Cloudflare, Resend ve Google’ın sunucuları yurt dışında bulunabileceğinden bu hizmetler kullanıldığında veriler yurt dışına aktarılabilir.</p>
      </section>
      <section>
        <h2>Reklam, analitik ve satış</h2>
        <p>Frenaw reklam, ziyaretçi analitiği veya pazarlama bülteni kullanmaz. Kişisel veriler satılmaz ve reklam amacıyla paylaşılmaz.</p>
      </section>
      <section>
        <h2>Hesap ayarları ve silme</h2>
        <p>Profilinizi, şifrenizi ve e-posta adresinizi <Link href="/hesabim/ayarlar">hesap ayarlarından</Link> düzenleyebilirsiniz. E-posta değişikliği yeni adrese gönderilen bağlantıyla tamamlanır. Şifre ve e-posta değişikliğinde diğer oturumlar da kapatılır.</p>
        <p>Hesap silindiğinde giriş ve profil bilgileri ile kimlik eşleşme işareti kaldırılır; hizmetler ve hesaba ait destek talepleri silinir, ilanlar kapatılır ve gönderilen mesajların içeriği kaldırılır. Hesapla ilişkili teklifler iptal edilir; açıklama, fiyat ve teslim süresi alanları temizlenir. Diğer katılımcıların kayıtlarını korumak için işlem ilişkilerini taşıyan teknik kimlikler ile “Silinen kullanıcı” açıklaması kalabilir. Bu işlem tüm kayıtların anonimleştirilmesi anlamına gelmez. Altyapı yedekleri aynı anda silinmez; sağlayıcının yedek saklama döngüsüne tabidir.</p>
      </section>
      <section>
        <h2>Güvenlik</h2>
        <p>Bağlantılar HTTPS ile şifrelenir. Parolalar geri döndürülemez biçimde özetlenir, doğrulama bağlantıları yalnızca özet olarak saklanır ve özel verilere erişim her istekte hesap yetkisiyle kontrol edilir. Hiçbir sistem tam güvenlik garantisi veremez; bir ihlal fark edilirse KVKK’daki bildirim yükümlülükleri yerine getirilir.</p>
      </section>
      <section>
        <h2>Haklarınız</h2>
        <p>KVKK’nın 11. maddesi kapsamındaki haklarınızı ve başvuru yöntemlerini <Link href="/kvkk-basvuru">KVKK başvurusu</Link> sayfasında bulabilirsiniz. Çerez kullanımı için <Link href="/cerezler">çerez politikasını</Link> inceleyin.</p>
      </section>
    </PolicyPage>
  );
}
