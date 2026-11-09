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
        <h2>Oturum ve giriş güvenliği</h2>
        <p>Giriş akışı, oturumun açık tutulması ve yetkisiz isteklerin önlenmesi için Auth.js çerezleri kullanılabilir. Google ile giriş seçildiğinde giriş işlemi için kısa ömürlü doğrulama çerezleri de oluşturulabilir.</p>
      </section>
      <section>
        <h2>Reklam ve analitik</h2>
        <p>Frenaw sayfalarında etkin reklam, ziyaretçi analitiği veya oturum kaydı betiği bulunmaz. İsteğe bağlı izleme ileride eklenirse çerez listesi ve tercih paneli etkinleştirme öncesinde güncellenecektir.</p>
      </section>
      <section>
        <h2>Tarayıcı tercihleri</h2>
        <p>Çerezleri tarayıcı ayarlarından temizleyebilir veya engelleyebilirsiniz. Oturum çerezlerini engellemek giriş ve hesabınıza özel işlemlerin çalışmasını etkileyebilir.</p>
      </section>
    </PolicyPage>
  );
}
