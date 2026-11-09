# Frenaw

Komisyonsuz freelancer keşfi, proje ilanları, hizmet kataloğu, teklif takibi, site içi mesajlaşma ve destek. Next.js 16, Auth.js ve Cloudflare Workers üzerinde OpenNext kullanır.

## GitHub ve Hoplite

Güncel kaynak deposu: [argopizm/807827](https://github.com/argopizm/807827). Canlı uygulama [frenaw.com](https://frenaw.com) üzerindeki `frenaw` Worker'ıdır. Üretim akışı 9 Kasım 2026 tarihinde GitHub `main` → Cloudflare Workers Builds → `npm run build:cf` → `npx wrangler deploy` olarak bağlanmıştır. Deneme dallarının üretim bağlayıcılarıyla yayınlanması kapalıdır.

Hoplite kurulumu, güncel özellikler ve bilinen eksikler için [HOPLITE.md](HOPLITE.md) okuyun. `.hoplite/settings.json` temiz ortamda kurulum ve 3000 portunda önizleme komutlarını tanımlar. Üretim anahtarları ve kullanıcı verileri depoda bulunmaz.

## Yerel önizleme

```sh
npm ci
node scripts/hoplite-setup.mjs
npm run dev -- --hostname 127.0.0.1
```

Auth.js için yerel bir `AUTH_SECRET` tanımlayın. Yerel uygulama varsayılan olarak `.wrangler/state/v3` altındaki D1 verisini kullanır. Yalıtılmış bir test için Wrangler'a `--persist-to <test-klasörü>` ve Next'e `FRENAW_LOCAL_D1_STATE=<test-klasörü>/v3` verin. Kimlik doğrulaması kapalıdır. Test veritabanında gerçek kişisel veri kullanmayın.

| Ayar | Kullanım |
| --- | --- |
| `AUTH_SECRET` | Auth.js oturum anahtarı. Ortam başına ayrı değer. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | İsteğe bağlı Google OAuth. |
| `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL` | E-posta doğrulaması. Yayından önce doğrulanmış gönderici ve çalışan dönüş adresi gerekir. |
| `NEXT_PUBLIC_SITE_URL` | Herkese açık canonical alan adı. Alan adı bağlandıktan sonra değiştirin. |
| `NEXT_PUBLIC_SITE_INDEXABLE=true` | Yalnızca üretim derlemesinde. Önizlemeler dizine kapalı kalır. |
| `FRENAW_LEGAL_NAME`, `FRENAW_LEGAL_ADDRESS`, `FRENAW_LEGAL_EMAIL`, `FRENAW_LEGAL_KEP` | Yasal sayfalarda veri sorumlusu olan gerçek kişinin adı, soyadı, başvuru adresi ve e-postası. KEP varsa eklenir. Metinler hukuk incelemesinden sonra yayımlanır. |
| `CHAT_SOCKET_URL` | Yayındaki sohbet Worker'ının `wss://` adresi. Bu ayar ve `CHAT_EVENTS` bağlayıcısı yoksa tarayıcı aralıklı sorgulama kullanır. |

## Veritabanı ve yetki

`db/migrations` sürümlü şemadır. `db/schema.sql` önceki şemanın referansıdır. Uygulama istek sırasında tablo veya sütun oluşturmaz. Üretime geçmeden önce mevcut D1 şemasını ve yedeğini doğrulayın, migration'ları ayrı önizleme veritabanına uygulayın, veri taşıma ve geri dönüşü deneyin. Yeni sohbet tabloları geçerli eski konuşmaları kopyalar ve eski tabloyu korur.

Destek yetkisi, yetkili bir yönetim işlemiyle `support_staff` tablosuna var olan bir hesap eklenerek verilir. Destek çalışanları atanabilir talepleri ve bildirilen mesajları görebilir. Özel konuşma geçmişi bu yetkiyle açılmaz.

## Anlık mesaj olayları

`workers/chat` ayrı Cloudflare Worker tanımıdır. Worker'ı önce bir önizleme ortamında çalıştırın. Uygulama Worker’ının Wrangler yapılandırmasında `CHAT_EVENTS` Durable Object bağlayıcısını Worker'ın `ChatEvents` sınıfına bağlayın ve `CHAT_SOCKET_URL` değerini ayarlayın. Worker'ın `APP_ORIGINS` listesinde yalnızca kullanılacak HTTPS uygulama adresleri bulunmalıdır. WebSocket mesaj içeriğini taşımaz. Oturum ve konuşma üyeliği D1 erişiminden önce uygulama API'sinde kontrol edilir.

## Yayın öncesi

1. Önizlemede `npm run lint` ve `npm run build:cf` çalıştırın; Cloudflare derlemesi Next.js tür denetimini de yapar. Proje Workers ve OpenNext kullanır; eski Pages projesini üretim yayını için kullanmayın. Birleştirme sonrasında Workers Builds sonucunu kontrol edin.
2. Ayrı hesaplarla ilan, teklif, değerlendirme, mesaj ve destek akışlarını sınayın. Doğrulanmış e-posta göndericisini, Google dönüş adreslerini, Worker bağlayıcısını ve destek yetkilerini kontrol edin.
3. İşleten gerçek kişinin başvuru iletişim bilgileri ve hukuk onayından sonra belgeleri, alan adını, yönlendirmeleri ve Search Console'u devreye alın.
4. NVİ eşleşmesi `/dogrulama` sayfasında isteğe bağlıdır ve yalnızca NVİ'nin canlı KPSPublic servisini kullanır. Girilen bilgiler saklanmaz, loglanmaz; yalnızca `tc_verified = 2` sonucu tutulur. Eski `tc_verified = 1` değerleri gösterilmez. Eşleşme resmî kimlik teyidi olarak sunulmaz.

## Üretim yapılandırması

`npm run build:cf` yalnızca derler. `npm run preview`, derlenmiş uygulamayı yerel Workers ortamında açar. Bu komutlar siteyi yayımlamaz. Canlı migration ve alan adı geçişini doğrulanmış yedek ve geri dönüş planıyla uygulayın.

Sohbet Worker’ı için uygulama yapılandırmasına aşağıdaki bağlayıcı eklenir. Ardından `CHAT_SOCKET_URL` değeri, çalışan sohbet Worker’ının `wss://` adresine ayarlanır.

```toml
[[durable_objects.bindings]]
name = "CHAT_EVENTS"
class_name = "ChatEvents"
script_name = "frenaw-chat"
```

Kimlik bilgileri sıfır saklama kapsamındadır. Hesaplar, sohbetler ve destek geçmişi kalıcı D1 verisidir. Bireysel ve ücretsiz işletim, KVKK veri sorumlusunun kimliği ve gerçek veri akışlarının açıklanması gerekliliğinden ayrı değerlendirilir.

## 7 Kasım 2026 canlı yayın durumu

- Canlı uygulama `https://frenaw.com`, Cloudflare Worker adı `frenaw`.
- `www.frenaw.com` ana alan adına kalıcı yönlendirilir. Workers.dev ve önizleme adresleri kapalıdır.
- Önceki `807827.pages.dev` Pages projesi ayrı kalır. GitHub'a gönderim bu yeni Worker'ı otomatik güncellemez; Workers Builds bağlantısı ayrıca kurulmalıdır.
- Yeni sürüm için `npm run build:cf`, ardından `npx wrangler deploy` çalıştırılır. Üretim derlemesinde `NEXT_PUBLIC_SITE_URL=https://frenaw.com` ve `NEXT_PUBLIC_SITE_INDEXABLE=true` gerekir. Yerel `.env.production.local` bu değerleri içerir; dosya Git'e dahil edilmez.
- `AUTH_SECRET` ve `RESEND_API_KEY` Cloudflare secrets olarak tanımlıdır; kaynak dosyaya yazılmaz.
- Gelen destek e-postası Cloudflare Email Routing ile işletmecinin doğrulanmış Gmail hesabına iletilir. Resend, yalnızca frenaw.com için gönderim yetkili anahtarla hesap doğrulamalarını gönderir. Gelen posta kutusu ve Resend gönderimi ayrı işlevlerdir.
- Hesap ayarları `/hesabim/ayarlar`: profil düzenleme bağlantısı, şifre değiştirme, yeni adresi doğrulayarak e-posta değiştirme ve hesap silme. Şifre/e-posta değişikliği ile silme işlemleri oturum sürümünü artırır ve diğer cihazları da geçersiz kılar.
- Silmede kişi bilgileri temizlenir, destek talepleri ve hizmetler silinir, ilanlar kapatılır ve kullanıcının mesaj içeriği kaldırılır. İlişkisel teknik kimlikler ve sağlayıcı yedekleri aynı anda yok edilmez. Tam anonimleştirme veya sıfır kayıt iddiası yapılmaz.
- 0001–0006 migration'ları canlı D1'e uygulandı. Eski `users.created_at` eksikliği giderildi; eski sayısal `jobs.id`, mevcut kimlik değerleri korunarak TEXT şemasına geçirildi. Taşıma öncesi SQL yedeği proje dışındaki özel çalışma klasöründe tutulur.
- İşletmecinin mevcut hesabı `support_staff` yetkisiyle destek kuyruğuna erişebilir. Normal kullanıcılar destek kuyruğuna ve başkasının taleplerine erişemez.
- Google/GitHub/Discord/Microsoft/Apple girişleri bu yayında etkin değildir; sağlayıcı uygulama kayıtları ve anahtarları gereklidir. NVİ eşleşmesi isteğe bağlı olarak açıktır (sıfır saklama).
- Yasal sayfalarda bilinen veri sorumlusu adı ve destek e-postası gösterilir. Açık posta adresi, saklama takvimi ve yurt dışı aktarım dayanağı ile hukuk incelemesi tamamlanmamıştır; belgeler tamamlanmış uyum beyanı değildir.

## Herkese açık görünen adlar

0007 migration'ı, özel ad soyaddan ayrı `users.display_name` alanını ekler. Kullanıcı kayıt sırasında ve profil panelinde boşluk içerebilen görünen ad/marka adı seçer. `username`, büyük/küçük harf duyarsız benzersiz profil bağlantısıdır; harf, sayı ve alt çizgi kullanır. Eski hesaplarda görünen ad seçilene kadar açık kullanıcı adı kullanılır. Özel `full_name`/eski `name` alanları profil, metadata, arama, hizmet, ilan, yorum ve mesaj kişi adlarına kaynak olmaz. Görünen adlar aynı olabilir; profil bağlantıları farklı olmalıdır.

## 8 Kasım 2026 hesap ve profil yenilemesi

- `/giris`, mevcut renk paletini koruyan tam ekran giriş/kayıt düzenidir. Kalıcı site başlığı giriş ekranına geçişte ortalanmış logo kapsülüne daralır; çıkışta tekrar genişler. Hareket azaltma tercihine uyulur.
- Kayıt alanları özel ad soyad, herkese açık görünen ad, e-posta ve şifredir. Profil bağlantısı görünen addan otomatik ve benzersiz üretilir; sonradan düzenlenebilir.
- `/profilim` oturum sahibinin herkese açık profil önizlemesine gider. Sahibi düzenle/kopyala kontrollerini görür. `/hesabim/profil` canlı önizlemeli, mobil düzenle/önizle sekmeli özel düzenleyicidir.
- Yetenek önerileri 919 farklı etiketten oluşan yerel katalogdan gelir. Katalog genel hizmet terminolojisiyle hazırlanmıştır; başka bir platformun tüm etiketlerinin birebir aktarımı iddiası yoktur. Kategoriye göre öneri, klavye seçimi, eş anlamlı normalleştirme, elle ekleme ve en fazla 20 etiket desteklenir.
- E-posta doğrulama ve adres değişikliği ekranları durum kartlarıyla yenilenmiştir. Doğrulama açık kullanıcı eylemiyle yapılır. Giriş dönüşünde token yalnızca ilgili sekmenin sessionStorage alanında süreli tutulur, URL'den kaldırılır ve işlem sonrasında temizlenir.
- Bu arayüz sürümü yeni D1 migration gerektirmez; canlı şema 0007'dir. Sosyal giriş sağlayıcıları ayrıca yapılandırılmadıkça etkin olmaz.

## İlanlar ve hizmetler görsel yenilemesi

İlan listesi, ana sayfadaki son ilanlar ve hizmet listesi ortak `MarketplaceCard` bileşenini kullanır. Görseller, ilanın veya hizmetin üst kategorisine ait yerel WebP temsilleridir; kullanıcı portföyü olarak sunulmaz. Liste başlıklarına kategori filtreleri ve görsel alanlar, boş sonuçlara uygun yönlendirmeler eklendi. İlan ve hizmet detayları ortak `ProjectDetail.module.css` üzerinden mobil uyumlu düzenlenir. Teklif ve mesajlaşma API'leri korunur; ilan kapalıysa yeni teklif çağrısı gösterilmez. Hizmet sahibi kendi hizmetinde yönetim bağlantısını görür. Hizmet yayınlama formu ve ziyaretçi giriş kartı aynı tasarıma taşındı. Hareket azaltma tercihinde yeni animasyonlar kapatılır. Yeni migration veya bağımlılık gerekmez.

## Teklif ayrıntıları, mesajlar ve CLS

0008 migration'ı teklif açıklaması, tam sayı kuruş cinsinden TL fiyatı ve teslim günü alanlarını ekler. Eski teklifler NULL değerlerle korunur. Yeni teklif için üç alan da zorunludur; form açılışı kayıt oluşturmaz. Tekrar gönderim aynı içerikle idempotenttir, farklı tutarla sessiz güncelleme yapılmaz. Ayrıntılar yalnızca ilgili freelancer ve ilan sahibinin özel API/panelinde gösterilir; hesap silme bu alanları temizler. Şemayı uygulamadan önce üretim yedeği alın ve 0008'i uygulayın, sonra Worker'ı yayınlayın.

Mesajlar arayüzü yerel konuşma araması, okunmamış filtresi, profil bağlantıları, gün ayraçları, okunma simgeleri ve mobil tek panel düzeniyle yenilendi. WebSocket bağlantısı olmadığında mevcut aralıklı güncelleme kullanılır; karşı tarafın çevrimiçi olduğu iddia edilmez. Mesaj bildirme ve engelleme erişim kontrolleri korunur.

CLS için ön yüklenen isteğe bağlı yerel fontlar, sabit hesap kontrolü alanı, sabit belge kaydırma oluğu ve freelancer rayında önceden ayrılmış maksimum yükseklik kullanılır. Ana içerikte padding animasyonu kaldırılır; giriş başlığının kapsüle dönüşmesi korunur. Lighthouse ölçümleri çalışma klasöründe saklanır; tek laboratuvar sonucu gerçek kullanıcıların tüm koşullarını temsil etmez.
