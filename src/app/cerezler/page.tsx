import PolicyPage from "@/components/PolicyPage";
import { publicMetadata } from "@/lib/seo";

const title = "Çerez politikası";
const description = "Frenaw’da oturum için kullanılan çerezler ve tercihlerinizi yönetme yolları.";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({ title, description, path: "/cerezler", index: false });

export default function CookiePolicyPage() {
  return (
    <PolicyPage title={title} description={description}>
      <section>
        <h2>Kullanılan çerezler</h2>
        <p>Frenaw yalnızca hizmetin çalışması için zorunlu birinci taraf çerezleri kullanır. Bu çerezler oturum açma ve güvenlik için gerekli olduğundan ayrı onay alınmaz.</p>
        <ul>
          <li><strong>authjs.session-token</strong> (canlı sitede <code>__Secure-</code> önekiyle): oturumunuzu açık tutan şifreli belirteç. Çıkış yapana kadar, en fazla 30 gün geçerlidir.</li>
          <li><strong>authjs.csrf-token</strong> (canlı sitede <code>__Host-</code> önekiyle): giriş formlarını sahte isteklere karşı korur. Tarayıcı oturumu boyunca geçerlidir.</li>
          <li><strong>authjs.callback-url</strong> (canlı sitede <code>__Secure-</code> önekiyle): girişten sonra döneceğiniz sayfayı hatırlar. Tarayıcı oturumu boyunca geçerlidir.</li>
        </ul>
        <p>Google ile giriş etkinleştirilirse giriş işlemi sırasında kısa ömürlü güvenlik çerezleri de oluşturulabilir. Şu anda sosyal giriş etkin değildir.</p>
      </section>
      <section>
        <h2>Tarayıcı depolaması</h2>
        <p>E-posta doğrulama bağlantısıyla gelip giriş yapmanız gerektiğinde, bağlantıdaki tek kullanımlık belirteç yalnızca ilgili sekmenin oturum depolamasında (sessionStorage) kısa süreli tutulur ve işlem bitince silinir. Kimlik doğrulama bilgileri tarayıcıda saklanmaz.</p>
      </section>
      <section>
        <h2>Reklam ve analitik</h2>
        <p>Frenaw sayfalarında reklam, ziyaretçi analitiği, sosyal medya izleme veya oturum kaydı betiği bulunmaz. Bu tür bir araç eklenirse bu liste güncellenir ve gerekli olduğunda önceden onayınız alınır.</p>
      </section>
      <section>
        <h2>Tarayıcı tercihleri</h2>
        <p>Çerezleri tarayıcı ayarlarından temizleyebilir veya engelleyebilirsiniz. Oturum çerezlerini engellemek giriş ve hesabınıza özel işlemlerin çalışmasını engeller.</p>
      </section>
    </PolicyPage>
  );
}
