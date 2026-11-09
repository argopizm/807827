type SpecialtyInput = [slug: string, title: string, ...aliases: string[]];

function specialties(entries: SpecialtyInput[]) {
  return entries.map(([slug, title, ...aliases]) => ({ slug, title, aliases }));
}

export const CATEGORY_GROUPS = [
  {
    slug: "grafik-tasarim",
    title: "Grafik ve Tasarım",
    aliases: ["Tasarım", "Grafik & Tasarım"],
    description: "Marka kimliği, dijital ekranlar ve baskı işleri için görsel tasarım uzmanlarıyla çalışın.",
    guidance: "İlanınıza hedef kitleyi, kullanım alanını, örnek görselleri ve ihtiyaç duyduğunuz kaynak dosya biçimlerini ekleyin. Baskı işleri için ölçüyü ve matbaa gereksinimlerini paylaşın.",
    specialties: specialties([
      ["logo-tasarimi", "Logo Tasarımı", "logo"],
      ["uc-boyutlu-tasarim", "3B Modelleme ve Tasarım", "3D Tasarımlar"],
      ["sosyal-medya-tasarimi", "Sosyal Medya Görselleri"],
      ["brosur-katalog", "Broşür ve Katalog Tasarımı"],
      ["kurumsal-kimlik", "Kurumsal Kimlik ve Kartvizit"],
      ["fotograf-duzenleme", "Fotoğraf Çekimi ve Düzenleme"],
      ["illustrasyon", "İllüstrasyon"],
      ["reklam-gorselleri", "Reklam Görselleri ve Banner"],
      ["davetiye-tasarimi", "Davetiye Tasarımı"],
      ["ambalaj-tasarimi", "Ambalaj ve Etiket Tasarımı"],
      ["sunum-infografik", "Sunum ve İnfografik"],
      ["arayuz-deneyim", "Arayüz ve Kullanıcı Deneyimi", "UI/UX Tasarımı"],
      ["yayinci-tasarimi", "Yayıncılar için Grafik Tasarım"],
      ["karikatur-karakalem", "Karikatür ve Karakalem"],
      ["oyun-sanati", "Oyun Sanatı"],
      ["dovme-tasarimi", "Dövme Tasarımı"],
      ["storyboard", "Storyboard ve Çekim Taslağı"],
      ["diger-grafik", "Diğer Görsel Tasarım İşleri"],
    ]),
  },
  {
    slug: "yazilim-teknoloji",
    title: "Yazılım ve Teknoloji",
    aliases: ["Yazılım", "Yazılım & Teknoloji"],
    description: "Web, mobil, e-ticaret ve veri projeleri için geliştirme, altyapı ve test uzmanlarını keşfedin.",
    guidance: "Mevcut altyapıyı, gerekli entegrasyonları ve ilk sürümde çalışması gereken özellikleri açıklayın. Kaynak kod teslimi, yayınlama ve bakım kapsamını tekliften önce netleştirin.",
    specialties: specialties([
      ["web-gelistirme", "Web Uygulaması Geliştirme", "Web Yazılım"],
      ["wordpress", "WordPress Geliştirme"],
      ["mobil-uygulama", "Mobil Uygulama Geliştirme"],
      ["e-ticaret-yazilim", "E-ticaret Sitesi Geliştirme"],
      ["web-araclari-cms", "Site Oluşturucular ve CMS"],
      ["veri-analizi", "Veri Analizi ve Raporlama", "Data Analizi & Raporlama"],
      ["masaustu-uygulama", "Masaüstü Uygulamaları"],
      ["sunucu-site-kurulum", "Sunucu ve Site Kurulumu"],
      ["teknik-destek", "Teknik Destek ve Sorun Giderme"],
      ["oyun-gelistirme", "Oyun Geliştirme"],
      ["teknoloji-egitimi", "Teknoloji Eğitimi ve Mentorluk"],
      ["alan-adi-barindirma", "Alan Adı ve Barındırma"],
      ["kullanici-testi", "Son Kullanıcı Testleri"],
      ["diger-yazilim", "Diğer Teknoloji ve Otomasyon İşleri"],
    ]),
  },
  {
    slug: "video-animasyon",
    title: "Video ve Animasyon",
    aliases: ["Video", "Video & Animasyon"],
    description: "Çekim, kurgu, tanıtım ve animasyon projeleri için video uzmanlarına ulaşın.",
    guidance: "Tahmini süreyi, yayın kanalını, ekran oranını, ham görüntü durumunu ve altyazı ihtiyacını paylaşın. Müzik ve stok görüntülerin kullanım haklarını teslim kapsamına ekleyin.",
    specialties: specialties([
      ["video-kurgu", "Video Kurgu ve Post Prodüksiyon", "Kurgu"],
      ["video-reklam", "Video Reklam Üretimi"],
      ["animasyon-uc-boyut", "Animasyon ve 3B Hareket"],
      ["video-cekim", "Video Çekimi ve Prodüksiyon"],
      ["video-acilis", "Video Açılışları ve İntrolar"],
      ["etkinlik-videosu", "Özel Gün ve Etkinlik Videoları"],
      ["yayinci-videosu", "Yayıncılar için Video"],
      ["oyunculu-tanitim", "Oyunculu Tanıtım Videoları"],
      ["diger-video", "Diğer Video İşleri"],
    ]),
  },
  {
    slug: "dijital-pazarlama",
    title: "Dijital Pazarlama",
    aliases: ["Pazarlama", "İnternet Reklamcılığı"],
    description: "Reklam yönetimi, organik görünürlük, içerik dağıtımı ve kampanya ölçümü için uzman bulun.",
    guidance: "Hedefinizi, mevcut kanalları, bütçeyi ve ölçülecek sonucu baştan belirtin. Reklam harcamasıyla hizmet ücretini tekliflerde ayrı karşılaştırın.",
    specialties: specialties([
      ["sosyal-medya-yonetimi", "Sosyal Medya Yönetimi"],
      ["reklam-yonetimi", "Dijital Reklam Yönetimi"],
      ["seo", "Arama Motoru Optimizasyonu (SEO)", "Arama Motoru Optimizasyonu"],
      ["icerik-uretici-kampanyalari", "İçerik Üreticisi Kampanyaları", "Influencer Marketing"],
      ["web-analitigi", "Web Analitiği ve Dönüşüm Takibi"],
      ["mobil-reklam", "Mobil Uygulama Reklamları"],
      ["diger-pazarlama", "Diğer Dijital Pazarlama İşleri"],
    ]),
  },
  {
    slug: "ses-muzik",
    title: "Ses ve Müzik",
    aliases: ["Seslendirme", "Ses & Müzik"],
    description: "Seslendirme, özgün müzik, podcast kurgusu ve ses düzenleme projeleri için iş ortakları bulun.",
    guidance: "Metin uzunluğunu, dil ve ses tonunu, yayın mecrasını ve dosya biçimini paylaşın. Ticari kullanım ve müzik lisansının teklif kapsamına dahil olup olmadığını netleştirin.",
    specialties: specialties([
      ["seslendirme-dublaj", "Seslendirme ve Dublaj", "dublaj"],
      ["beste-soz", "Beste ve Şarkı Sözü Yazımı"],
      ["miks-mastering", "Miks ve Mastering"],
      ["jingle", "Jingle ve Reklam Müziği"],
      ["podcast-kurgu", "Podcast Kurgusu"],
      ["diger-ses", "Diğer Ses ve Müzik İşleri"],
    ]),
  },
  {
    slug: "yazi-ceviri",
    title: "Yazı ve Çeviri",
    aliases: ["Çeviri", "Yazı & Çeviri"],
    description: "Metin, çeviri ve yayın hazırlığı için dil, ton ve konu uzmanlığına göre freelancer bulun.",
    guidance: "Kelime sayısını, hedef dili, yayın yerini ve teslim tarihini belirtin. Varsa terminoloji listesini ve örnek metni paylaşarak beklenen tonu somutlaştırın.",
    specialties: specialties([
      ["ceviri-yerellestirme", "Çeviri ve Yerelleştirme", "tercüme"],
      ["metin-yazarligi", "Metin Yazarlığı"],
      ["redaksiyon", "Redaksiyon ve Düzeltme"],
      ["web-icerigi", "Web Sitesi İçeriği"],
      ["cv-on-yazi", "Özgeçmiş ve Ön Yazı", "CV"],
      ["desifre", "Ses ve Video Deşifresi", "transkripsiyon"],
      ["senaryo", "Senaryo ve Yaratıcı Yazı"],
      ["inceleme-yazisi", "İnceleme ve Değerlendirme Yazısı"],
      ["marka-adi-slogan", "Marka Adı ve Slogan"],
      ["basin-bulteni", "Basın Bülteni"],
      ["diger-yazi", "Diğer Yazı ve Çeviri İşleri"],
    ]),
  },
  {
    slug: "is-yonetim",
    title: "İş ve Yönetim",
    aliases: ["İş & Yönetim", "İş Yönetimi", "Danışmanlık"],
    description: "Operasyon, araştırma, veri girişi ve iş geliştirme ihtiyaçları için uzman desteği alın.",
    guidance: "İş yükünü, kullanılan araçları, teslim biçimini ve paylaşılacak verinin kapsamını tarif edin. Erişim yetkilerini yalnızca iş için gereken düzeyde tutun.",
    specialties: specialties([
      ["excel", "Excel ve Hesap Tabloları"],
      ["is-danismanligi", "İş ve Süreç Danışmanlığı"],
      ["urun-veri-girisi", "Ürün ve Veri Girişi"],
      ["sanal-asistan", "Sanal Asistanlık"],
      ["marka-hizmetleri", "Marka Yönetimi Hizmetleri"],
      ["pazar-arastirmasi", "Pazar Araştırması"],
      ["satis-musteri", "Satış ve Müşteri Geliştirme"],
      ["diger-yonetim", "Diğer İş ve Yönetim Hizmetleri"],
    ]),
  },
];

export function foldTurkish(value: string) {
  return value.normalize("NFC").trim().toLocaleLowerCase("tr-TR")
    .replace(/[ıi]/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function key(value: string) {
  return foldTurkish(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Group = (typeof CATEGORY_GROUPS)[number];
type Specialty = Group["specialties"][number];

const groupsByKey = new Map<string, Group>();
const specialtiesByKey = new Map<string, { group: Group; specialty: Specialty }>();

for (const group of CATEGORY_GROUPS) {
  for (const name of [group.slug, group.title, ...group.aliases]) groupsByKey.set(key(name), group);
  for (const specialty of group.specialties) {
    for (const name of [specialty.slug, specialty.title, ...specialty.aliases]) {
      specialtiesByKey.set(key(name), { group, specialty });
    }
  }
}

export function getCategory(value: string) {
  const categoryKey = key(value);
  return groupsByKey.get(categoryKey) ?? specialtiesByKey.get(categoryKey)?.group ?? null;
}

export function getSpecialty(category: string, value: string) {
  const match = specialtiesByKey.get(key(value));
  return match && match.group.slug === getCategory(category)?.slug ? match.specialty : null;
}

export function normalizeCategory(value: string): string | null {
  const categoryKey = key(value);
  // Existing listings used these exact title-cased labels for parent categories.
  const legacyGroup = CATEGORY_GROUPS.find((group) => group.aliases.includes(value.trim()));
  if (legacyGroup) return legacyGroup.slug;
  if (categoryKey === "genel") return "Genel";
  return specialtiesByKey.get(categoryKey)?.specialty.slug ?? groupsByKey.get(categoryKey)?.slug ?? null;
}

export function categoryTitle(value: string | null | undefined) {
  const normalized = normalizeCategory(value ?? "");
  return (normalized && (specialtiesByKey.get(normalized)?.specialty.title ?? getCategory(normalized)?.title)) || "Genel";
}

export function categoryPath(value: string) {
  const group = getCategory(value);
  if (!group) return "/kategoriler";
  const specialty = getSpecialty(group.slug, normalizeCategory(value) ?? "");
  return specialty ? "/kategoriler/" + group.slug + "/" + specialty.slug : "/kategoriler/" + group.slug;
}

export function categoryStorageValues(value: string) {
  if (value === "Genel") return ["genel"];
  const group = getCategory(value);
  if (!group) return [];
  const specialty = getSpecialty(group.slug, value);
  const labels = (item: Specialty) => [item.slug, item.title, ...item.aliases].filter((label) => !group.aliases.includes(label));
  return [...new Set((specialty
    ? labels(specialty)
    : [group.slug, group.title, ...group.aliases, ...group.specialties.flatMap(labels)]).map(foldTurkish))];
}
