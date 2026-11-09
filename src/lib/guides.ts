export interface GuideSection {
  title: string;
  body: string;
  points?: string[];
  example?: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  topic: "Proje planlama" | "Uzman seçimi" | "Freelancer için" | "Birlikte çalışma";
  image: string;
  takeaway: string;
  sections: GuideSection[];
  checklist: string[];
  action: { title: string; href: string };
}

export function guideReadTime(guide: Guide) {
  const text = [guide.title, guide.description, guide.takeaway, ...guide.checklist,
    ...guide.sections.flatMap((section) => [section.title, section.body, section.example ?? "", ...(section.points ?? [])])].join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 180));
}

export const GUIDES: Guide[] = [
  {
    slug: "freelance-proje-briefi",
    title: "Freelance proje briefi nasıl hazırlanır?",
    description: "Hedef, teslim listesi, bütçe ve geri bildirim düzenini anlaşılır bir proje briefine dönüştürün.",
    topic: "Proje planlama",
    image: "is-yonetim",
    takeaway: "İyi bir brief, uzmana yalnızca ne üreteceğini değil, sonucun neden önemli olduğunu da anlatır. Kapsamı somutlaştırmak, tekliflerin aynı iş için verilmesini sağlar.",
    checklist: ["Projenin amacını ve hedef kitlesini yazdım.", "Teslim sayısını, dosya biçimlerini ve kapsam dışındaki işleri belirttim.", "İlk taslak, geri bildirim ve teslim tarihlerini ayırdım.", "Örnekleri, mevcut dosyaları ve bütçe aralığını ekledim.", "Teklifi değerlendirecek ve geri bildirim verecek kişiyi belirledim."],
    sections: [
      {
        title: "İhtiyacı bir cümlede anlatın",
        body: "Çözülecek problemi ve çalışmanın nerede kullanılacağını yazın. Örneğin yeni bir kahve markasının e-ticaret açılışı için üç ürün sayfası ve bir ana sayfa tasarımına ihtiyacı olduğunu belirtin. Hedef kitleyi, mevcut malzemeleri ve varsa benzer örnekleri ekleyin.",
        example: "Yeni kahve markamız için mobilde kolay gezilen bir ana sayfa ve üç ürün sayfası istiyoruz. Amacımız, ilk kez gelen ziyaretçinin ürün farklarını anlayıp ürün seçebilmesi. Metinler ve ürün fotoğrafları tarafımızdan sağlanacak.",
      },
      {
        title: "Teslim listesini somutlaştırın",
        body: "Her teslimin sayısını, dosya biçimini ve kabul koşulunu yazın. Kaynak dosyaların, mobil ekranların, düzenlenebilir şablonların ve ticari kullanım haklarının dahil olup olmadığını baştan netleştirin.",
        points: ["Ekran veya tasarım adedi: Hangi sayfalar ve durumlar hazırlanacak?", "Teslim biçimi: Düzenlenebilir dosya mı, yayına hazır çıktı mı?", "Kapsam dışı: Metin yazımı, görsel üretimi veya geliştirme ayrıca mı ele alınacak?"],
      },
      {
        title: "Teklifleri karşılaştırılabilir hâle getirin",
        body: "Bütçe aralığını, ilk taslak tarihini ve geri bildirimden kimin sorumlu olduğunu belirtin. Teklifte süre, teslim listesi, revizyon hakkı ve ek iş ücretinin ayrı açıklanmasını isteyin.",
      },
      {
        title: "Takvimi ve karar noktalarını görünür yapın",
        body: "Tek bir son tarih yerine ilk taslağı ne zaman inceleyeceğinizi, geri bildirimi ne zaman vereceğinizi ve son teslimi ayrı yazın. Bir ekipten görüş alacaksanız yorumları tek kişide toplayın. İçerik, erişim veya onay gecikirse takvimin nasıl güncelleneceğini önceden konuşun. Böylece uzman, üretim süresiyle bekleme süresini ayırabilir.",
        example: "Pazartesi mevcut dosyaları paylaşacağız. Perşembe ilk taslağı inceleyip cuma tek bir geri bildirim listesi göndereceğiz. Onaylanan tasarımın son dosyaları bir sonraki hafta teslim edilecek.",
      },
    ],
    action: { title: "Proje ilanı ver", href: "/ilan-ver" },
  },
  {
    slug: "freelancer-nasil-secilir",
    title: "Projeniz için freelancer nasıl seçilir?",
    description: "Portföyü, iş örneklerini ve teklif kapsamını değerlendirerek projeniz için doğru uzmanı bulun.",
    topic: "Uzman seçimi",
    image: "grafik-tasarim",
    takeaway: "Portföy, kapsam ve iletişim birlikte değerlendirilmelidir. Tek bir görsel ya da ücret yerine, uzmanın sizin ihtiyacınıza nasıl yaklaştığına bakın.",
    checklist: ["Projemle benzer teslimler içeren örnekleri inceledim.", "Uzmanın örnek çalışmadaki rolünü öğrendim.", "Tekliflerdeki teslimleri ve revizyonları aynı başlıklarda karşılaştırdım.", "İlk kontrol noktasını ve iletişim düzenini konuştum.", "Belirsiz kalan maddeleri işe başlamadan önce yazılı olarak netleştirdim."],
    sections: [
      {
        title: "Portföyde projenize yakın örneği bulun",
        body: "Sektörün birebir aynı olması gerekmez. Teslim biçimi, hedef kitle ve teknik kısıtlar açısından benzer bir örnek arayın. Uzmandan örnekte kendi rolünü ve karşılaştığı bir sorunu nasıl çözdüğünü anlatmasını isteyin.",
        points: ["İş örneğinin hangi kısmını kendisi hazırlamış?", "Başlangıçtaki ihtiyaç neymiş, sonuç nasıl değerlendirilmiş?", "Projenizdeki cihaz, dil veya teslim kısıtına benzer bir durumla çalışmış mı?"],
      },
      {
        title: "Ücreti kapsamla birlikte okuyun",
        body: "Teklifleri teslim adedi, kullanılacak araçlar, revizyon sayısı, iletişim sıklığı ve iş sonrası destek üzerinden karşılaştırın. En düşük fiyatın kapsam dışında bıraktığı maddeleri yazılı olarak netleştirin.",
      },
      {
        title: "Geri bildirim düzenini belirleyin",
        body: "İlk kontrol noktasını ve yanıt sürelerini baştan konuşun. Paylaştığınız belgelerde gereksiz müşteri bilgilerini temizleyin. İlk işte kapsamı küçük tutmak, birlikte çalışma biçimini görmenizi sağlar.",
      },
      {
        title: "Karar vermeden önce kısa bir kapsam özeti isteyin",
        body: "Görüşmenin sonunda uzmandan anladığı ihtiyacı kendi cümleleriyle özetlemesini isteyin. Bu özetin sizin briefinizle örtüşmesi, yanlış anlaşılmaları erkenden ortaya çıkarır. Açık olmayan maddeleri açıklığa kavuşturun; çalışma ilerlerken kullanılacak tek bir güncel kapsam metni üzerinde anlaşın.",
        example: "İlk aşamada yalnızca ana sayfa ve ürün sayfası tasarlanacak. Geliştirme ve içerik girişi bu teklifin dışında. Taslak üzerinde tek listede toplanan iki tur geri bildirimle ilerleyeceğiz.",
      },
    ],
    action: { title: "Freelancer profillerini incele", href: "/profil" },
  },
  {
    slug: "wordpress-uzmani-secmek",
    title: "WordPress uzmanından teklif alırken ne sorulur?",
    description: "WordPress proje tekliflerini site hızı, bakım, lisanslar ve teslim kapsamına göre karşılaştırın.",
    topic: "Uzman seçimi",
    image: "yazilim-teknoloji",
    takeaway: "Bir WordPress teklifinde sayfa tasarımı, içerik girişi, kurulum, lisanslar ve bakım farklı işlerdir. Her birinin kimin sorumluluğunda olduğunu ayrı konuşun.",
    checklist: ["Sayfaları, dil seçeneklerini ve gerekli işlevleri listeledim.", "Tema, eklenti ve barındırma sorumluluklarını netleştirdim.", "Mevcut sayfa adreslerini ve taşınacak içerikleri paylaştım.", "Mobil görünüm ve formlar için kabul koşullarını belirledim.", "Yönetim erişimi, yedek ve bakım kapsamını teslim listesine ekledim."],
    sections: [
      {
        title: "Mevcut altyapıyı ve beklentiyi paylaşın",
        body: "Yeni site ile mevcut sitenin taşınması farklı iş yükleridir. Sayfa sayısını, form veya ödeme ihtiyacını, dil seçeneklerini ve kullanılacak barındırma hizmetini belirtin. Mevcut site taşınacaksa adreslerin değişip değişmeyeceğini yazın.",
        points: ["Hangi sayfalarda özgün tasarım, hangilerinde ortak şablon kullanılacak?", "Metin ve görselleri kim hazırlayıp sisteme girecek?", "Mevcut içerik, form ve bağlantılar nasıl taşınacak?"],
      },
      {
        title: "Lisans ve teslim sorumluluklarını ayırın",
        body: "Tema, eklenti ve barındırma masraflarının kime ait olduğunu sorun. Yönetici hesabı, yedek, içerik düzenleme eğitimi ve kaynak dosyaların teslimde yer almasını istediğinizi belirtin.",
      },
      {
        title: "Yayın kontrolünü teklife ekleyin",
        body: "Mobil sayfaları, form teslimini, 404 yönlendirmelerini ve sayfa hızını birlikte doğrulamak için bir kontrol listesi belirleyin. Bakım süresini ve sonraki güncellemelerin ücretini yayından önce netleştirin.",
      },
      {
        title: "Teslimden sonraki küçük işleri de konuşun",
        body: "Sitenin yayınlanmasıyla içerik güncellemeleri sona ermez. Yeni bir yazı yayınlama, görsel değiştirme ve form mesajlarını takip etme gibi günlük işleri kimin yapacağını belirleyin. Kısa bir kullanım anlatımı veya düzenli bir teslim belgesi isteyin. Sonradan eklenen yeni özelliklerle teslimdeki hataların giderilmesini ayrı değerlendirin.",
        example: "Teslimde yönetici erişimi, mevcut yedeğin konumu ve içerik düzenleme adımları paylaşılacak. Yeni sayfa tasarımı ayrıca tekliflendirilecek; teslim kapsamındaki eksikler aynı kontrol listesi üzerinden tamamlanacak.",
      },
    ],
    action: { title: "WordPress kategorisini incele", href: "/kategoriler/yazilim-teknoloji/wordpress" },
  },
  {
    slug: "freelancer-profili-hazirlama",
    title: "İşinizi anlatan bir freelancer profili nasıl hazırlanır?",
    description: "Uzmanlığınızı net bir başlık, açıklayıcı iş örnekleri ve anlaşılır bir profil metniyle sunun.",
    topic: "Freelancer için", image: "is-yonetim",
    takeaway: "Profiliniz, sizi ilk kez gören kişinin hangi ihtiyacını çözebileceğinizi anlamasını sağlamalı. Genel sıfatlardan çok, sunduğunuz teslimleri ve çalışma biçiminizi anlatın.",
    sections: [
      { title: "Başlığınızda sunduğunuz işi söyleyin", body: "Birbirinden farklı bütün yeteneklerinizi tek satıra sığdırmak yerine en çok çalışmak istediğiniz alanı öne çıkarın. İşverenin arayabileceği hizmeti kendi kelimelerinizle yazın. Deneyiminizi abartmadan, çalışma alanınızı ve teslim ettiğiniz çıktıyı somutlaştırın.", example: "‘Yaratıcı ve çalışkan freelancer’ yerine ‘Küçük markalar için logo ve görsel kimlik tasarımcısı’ daha açık bir başlangıçtır. Yazılım alanında ise ‘React ile web arayüzleri geliştiren frontend geliştirici’ kullanılabilir." },
      { title: "Profil açıklamasını üç soruya göre kurun", body: "İlk paragrafta ne yaptığınızı, devamında hangi tür ihtiyaçlarla çalıştığınızı ve son bölümde işin nasıl ilerlediğini anlatın. Kullandığınız araçları bir hizmetin yerine koymayın; bu araçlarla hangi sonuca ulaştığınızı açıklayın. Metni kısa paragraflara bölmek profilin taranmasını kolaylaştırır.", points: ["Kimler için hangi problemi çözüyorsunuz?", "Çalışma sonunda hangi dosya, ekran veya içerik teslim ediliyor?", "Brief, ilk taslak ve geri bildirim süreciniz nasıl ilerliyor?"] },
      { title: "Portföyde yalnızca sonucu göstermeyin", body: "Her örneğin yanına ihtiyacı, sizin rolünüzü ve teslimi anlatan kısa bir açıklama ekleyin. Ekip çalışmasında yalnızca katkı verdiğiniz bölümü sahiplenin. Kişisel deneme projelerini bu şekilde etiketleyin; gerçek müşteri işi gibi sunmayın. Paylaşma izniniz olmayan müşteri belgelerini portföye eklemeyin.", example: "Kişisel çalışma: Bir kahve markası için ürün sayfası tasarladım. Araştırma, tel kafes ve arayüz tasarımı bana ait. Geliştirme yapılmadı; teslim, masaüstü ve mobil tasarım dosyalarından oluşuyor." },
      { title: "Yetenek ve kategori seçimlerini güncel tutun", body: "Frenaw profilinizde ana çalışma alanınızı ve gerçekten hizmet verebildiğiniz yetenekleri seçin. Bir uzmanlıkta örnek işiniz yoksa bunu deneyimli olduğunuz alanlarla aynı ağırlıkta sunmayın. Zamanla çalışmalarınız değiştiğinde başlığı, açıklamayı ve iş örneklerini birlikte gözden geçirin. Herkese açık profilinizi bir ziyaretçi gibi okuyarak eksik veya belirsiz ifadeleri yakalayabilirsiniz." },
    ],
    checklist: ["Başlığım sunduğum hizmeti açıkça anlatıyor.", "Açıklamamda teslimleri ve çalışma biçimimi belirttim.", "İş örneklerinde kendi rolümü açıkladım.", "Kişisel denemeleri ve ekip çalışmalarını doğru etiketledim.", "Kategorim ve yeteneklerim güncel."],
    action: { title: "Profilini düzenle", href: "/hesabim" },
  },
  {
    slug: "etkili-freelance-teklif",
    title: "Kopya metin yerine projeye özel teklif nasıl yazılır?",
    description: "İhtiyacı anladığınızı gösteren, teslimleri ve çalışma planını açıkça anlatan bir freelance teklif hazırlayın.",
    topic: "Freelancer için", image: "yazi-ceviri",
    takeaway: "İyi teklif, profilinizin tekrarından oluşmaz. İşverenin ihtiyacını nasıl ele alacağınızı, hangi çıktıları sunacağınızı ve hangi konuların açıklığa kavuşması gerektiğini gösterir.",
    sections: [
      { title: "İhtiyacı anladığınızı ilk paragrafta gösterin", body: "İlandan anladığınız sorunu bir veya iki cümleyle özetleyin. Her ilana aynı giriş metnini göndermek yerine, teslim veya hedef kitleye ilişkin bir ayrıntıya değinin. İlanda yazmayan özellikleri kesinmiş gibi varsaymayın. Belirsizlik varsa bunu soruya dönüştürün.", example: "İlanınızdan, mevcut ürün fotoğraflarını kullanarak mobil ağırlıklı bir katalog hazırlamak istediğinizi anlıyorum. Teklifimi on ürün için hazırladım; ek dil veya farklı ölçüler gerekiyorsa kapsamı birlikte güncelleyebiliriz." },
      { title: "Yapılacak işi teslimlere bölün", body: "Çalışma planını genel ifadeler yerine kontrol edilebilir çıktılarla anlatın. Böylece hem siz hem işveren ilerlemeyi aynı başlıklardan takip edebilirsiniz. Kapsam dışında kalan işi de görünür kılın; örneğin tasarım teklifinin uygulama geliştirmeyi içermediğini belirtin.", points: ["Başlangıç: Gerekli dosyaların ve beklentilerin netleştirilmesi.", "Ara teslim: İlk taslak veya örnek ekranın incelenmesi.", "Son teslim: Onaylanan dosyalar, biçimler ve kısa kullanım notu."] },
      { title: "Süreyi ve revizyonu belirsiz bırakmayın", body: "Takvimin hangi dosyalar veya onaylar geldikten sonra başlayacağını yazın. Bir revizyon turunun nasıl toplanacağını açıklayın. Yeni bir sayfa, farklı bir dil veya yön değişikliği gibi ek taleplerin mevcut kapsamdan nasıl ayrılacağını konuşun. Çalışma koşulları değişirse güncel özeti mesajlaşmada tekrar paylaşın." },
      { title: "İlgili bir örnekle ve net soruyla bitirin", body: "Bütün portföyünüz yerine projeye yakın bir veya iki örneğe yönlendirin. Bu örneklerdeki rolünüzü kısaca belirtin. Son paragrafta işe başlamadan önce yanıtını bilmeniz gereken soruları sorun. Teklifte garanti edemeyeceğiniz satış, sıralama veya gelir sonuçları vaat etmeyin.", example: "Benzer bir katalog çalışmam profilimde yer alıyor. Başlamadan önce nihai ürün listesinin ve kullanılacak fotoğrafların hazır olup olmadığını öğrenmek isterim. İlk taslağı buna göre planlayabiliriz." },
    ],
    checklist: ["İlandaki ihtiyaca özel bir giriş yazdım.", "Teslimleri ve kapsam dışı işleri belirttim.", "Takvimin başlangıç koşulunu açıkladım.", "Revizyon biçimini ve açık sorularımı ekledim.", "İlgili iş örneğine yönlendirdim."],
    action: { title: "Açık proje ilanlarını keşfet", href: "/ilanlar" },
  },
  {
    slug: "revizyon-ve-geri-bildirim",
    title: "Revizyon ve geri bildirim süreci nasıl yönetilir?",
    description: "Dağınık yorumları uygulanabilir bir geri bildirim listesine dönüştürün, değişen kapsamı zamanında netleştirin.",
    topic: "Birlikte çalışma", image: "is-yonetim",
    takeaway: "Geri bildirim, istenen sonucu ve mevcut taslağın hangi noktada buna ulaşamadığını anlatınca uygulanabilir hâle gelir. Aynı sürüm üzerinde, tek listede ilerleyin.",
    sections: [
      { title: "Yorumun nedenini açıklayın", body: "‘Daha modern olsun’ gibi yoruma açık bir cümle yerine, hangi kullanıcı ihtiyacının karşılanmadığını yazın. Yorumu ilgili sayfa, zaman kodu veya dosya adıyla ilişkilendirin. Beğendiğiniz kısımları da belirtmek, uzmanın korunması gereken yönleri anlamasına yardımcı olur.", example: "‘Buton küçük’ yerine ‘Mobil ürün sayfasında satın alma düğmesi görselin altında kayboluyor; ziyaretçinin sonraki adımı daha kolay fark etmesini istiyoruz’ yazılabilir." },
      { title: "Aynı sürüm için tek bir liste paylaşın", body: "Ekipteki yorumları göndermeden önce bir araya getirin. Birbiriyle çelişen istekleri kendi içinizde karara bağlayın. Listede önemli konuları önceleyin ve her maddenin hangi sürüme ait olduğunu yazın. Yeni bir dosya geldikten sonra önceki dosyaya yorum eklemek karışıklık yaratabilir.", points: ["Öncelik: Teslimi engelleyen eksik veya yanlışlar.", "İyileştirme: Mevcut hedefe ulaşmayı kolaylaştıran düzenlemeler.", "Yeni fikir: Başlangıç kapsamına eklenen farklı ihtiyaçlar."] },
      { title: "Düzeltme ile yeni kapsamı ayırın", body: "Başlangıçta kararlaştırılan bir teslimdeki eksik ile sonradan eklenen yeni bir sayfa aynı iş değildir. Yeni talepleri ayrı listeleyin; süre ve ücret üzerindeki etkisini birlikte değerlendirin. Uzman da kapsam değişikliğini uygulamadan önce etkisini açıkça anlatmalı. Güncel kararları tek bir özet mesajda toplamak iki tarafın da takip etmesini kolaylaştırır." },
      { title: "Her turu kısa bir onayla kapatın", body: "Düzenlenen maddeleri birlikte gözden geçirin ve açık kalan konuları belirtin. Onaylanan bölümleri sonraki turda yeniden açmak gerekiyorsa bunun nedenini açıklayın. Son teslimin hangi sürüm olduğunu net şekilde işaretleyin. Dosya isimlerinde sürüm ve tarih kullanmak, görüşmelerde aynı dosyadan söz ettiğinizden emin olmanızı sağlar.", example: "Geri bildirim listesindeki ilk dört madde tamamlandı. Mobil menüyle ilgili son madde bir sonraki taslakta incelenecek. Onaylanan renkler ve masaüstü yerleşim korunacak." },
    ],
    checklist: ["Yorumlarımda ilgili dosya veya ekranı belirttim.", "İstediğim değişikliğin nedenini anlattım.", "Ekip yorumlarını tek listede topladım.", "Yeni kapsamı düzeltmelerden ayırdım.", "Tur sonunda onaylanan ve açık kalan maddeleri yazdım."],
    action: { title: "Mesajlarına git", href: "/mesajlar" },
  },
  {
    slug: "proje-teslim-kontrol-listesi",
    title: "Freelance projede teslim nasıl kontrol edilir?",
    description: "Dosyaları, erişimleri ve kabul koşullarını birlikte gözden geçirerek daha düzenli bir proje teslimi yapın.",
    topic: "Birlikte çalışma", image: "yazilim-teknoloji",
    takeaway: "Teslimi ‘dosyayı gönderdim’ mesajından ibaret bırakmayın. Anlaşılan çıktıların nerede olduğunu, nasıl kullanılacağını ve hangi maddelerin açık kaldığını birlikte kayda geçirin.",
    sections: [
      { title: "Başlangıçtaki teslim listesine geri dönün", body: "Projeyi değerlendirirken yeni oluşan beklentiler yerine üzerinde anlaşılan kapsamı esas alın. Her teslimin karşısına dosya veya bağlantısını ekleyin. Eksik kalan bir madde varsa tamamlanma planını ayrıca yazın. Yeni bir ihtiyaç çıktıysa mevcut işin kabul koşuluyla karıştırmadan ayrı değerlendirin.", points: ["Dosya adedi, sayfa veya video süresi anlaşılan kapsamla örtüşüyor mu?", "İstenen kaynak dosyalar ve dışa aktarma biçimleri teslim edilmiş mi?", "Kararlaştırılan cihaz, boyut veya dil seçenekleri yer alıyor mu?"] },
      { title: "Dosyayı gerçek kullanım yerinde açın", body: "Görseli kullanılacağı ölçüde, videoyu hedef ekran oranında ve web sayfasını ilgili cihazlarda inceleyin. Yalnızca önizleme görüntüsüne bakmak bazı eksikleri gizleyebilir. Dosyaların açıldığını, bağlantıların çalıştığını ve gerekli içeriğin eksiksiz olduğunu kontrol edin. Bulduğunuz sorunları dosya ve sürüm adıyla listeleyin." },
      { title: "Erişimleri ve kullanım notlarını teslim alın", body: "Projenin türüne göre hesap yetkileri, düzenlenebilir kaynaklar veya kısa bir kullanım anlatımı gerekebilir. Hangi erişimin kimde kalacağını belirleyin. Hesap şifrelerini açık mesajlarda paylaşmak yerine kullanılan hizmetin kullanıcı daveti veya yetkilendirme seçeneklerini tercih edin. Lisanslı bileşenlerin ve sonradan yenilenecek hizmetlerin listesini isteyin." },
      { title: "Açık maddeleri ve sonraki iletişimi netleştirin", body: "Tamamlananları, bekleyen düzeltmeleri ve sonradan ele alınacak yeni istekleri ayrı başlıklarda özetleyin. İş sonrası destek konuşulduysa kapsamını ve başvuru biçimini yeniden hatırlatın. Frenaw’da çalışma tamamlandığında değerlendirme yaparken iletişim, kapsam ve teslim deneyiminizi somut örneklerle anlatın.", example: "Teslim edilenler: Onaylı logo dosyaları, vektörel kaynaklar ve kısa kullanım notu. Açık madde: Küçük boyutlu simge çıktısı yenilenecek. Sonradan istenen katalog tasarımı ayrı bir proje olarak ele alınacak." },
    ],
    checklist: ["Teslim listesindeki her maddeyi dosya veya bağlantıyla eşleştirdim.", "Dosyaları gerçek kullanım ortamında açtım.", "Kaynakları ve gerekli erişimleri kontrol ettim.", "Açık düzeltmeleri ve yeni talepleri ayırdım.", "Son sürümü ve sonraki iletişim biçimini netleştirdim."],
    action: { title: "Proje briefi rehberini incele", href: "/rehber/freelance-proje-briefi" },
  },
  {
    slug: "logo-tasarimi-briefi",
    title: "Logo tasarımı için nasıl bir brief hazırlanır?",
    description: "Markanın karakterini, kullanım alanlarını ve dosya ihtiyaçlarını tasarımcıya açıkça aktarın.",
    topic: "Proje planlama", image: "grafik-tasarim",
    takeaway: "Logo briefinde yalnızca sevdiğiniz renkleri anlatmayın. Markanın kim için var olduğunu, nerelerde görüneceğini ve nasıl bir izlenim bırakmasını istediğinizi paylaşın.",
    sections: [
      { title: "Markayı ve hedef kitleyi tanımlayın", body: "Marka adını doğru yazımıyla, varsa sloganıyla ve sunduğunuz ürün veya hizmetle birlikte paylaşın. Hedef kitlenin kim olduğunu ve markanın hangi ihtiyacını karşıladığını anlatın. ‘Herkese hitap eden’ bir tanım yerine öncelikli müşterinizi seçin. Markanız için önemli olan üç niteliği nedenleriyle yazın.", example: "Mahalledeki küçük üreticilerden kahve alan bir marka kuruyoruz. Hedefimiz, evde kahve hazırlamayı seven ama teknik terimlerden uzak duran kişiler. Sıcak, sade ve ulaşılabilir bir kimlik istiyoruz." },
      { title: "Beğendiğiniz örneklerin nedenini anlatın", body: "Örnek logoları birebir kopyalama isteği olarak değil, yön göstermek için paylaşın. Bir örnekte tipografiyi, diğerinde sadeliği beğeniyor olabilirsiniz. İstemediğiniz çağrışımları da açıklayın. Tasarımcıdan her örneğin aynısını bir araya getirmesini beklemek yerine markanız için yeni bir yorum geliştirmesini isteyin." },
      { title: "Kullanım alanlarını ve teslimleri listeleyin", body: "Sosyal medya profili, web sitesi, kartvizit, ambalaj veya tabela farklı ihtiyaçlar doğurur. Öncelikli kullanım yerlerini belirtin. Küçük bir profil simgesinde de görünür olması gerekiyorsa bunu baştan söyleyin. Teklifte logo çalışmasıyla ek kurumsal kimlik tasarımlarını ayrı ele alın.", points: ["Ana logo, gerekiyorsa yatay veya dikey düzen.", "Açık ve koyu zeminlerde kullanılacak sürümler.", "Vektörel kaynak dosyalar ve ihtiyaç duyulan görsel çıktılar.", "Renk değerleri ve kullanımına ilişkin kısa açıklama."] },
      { title: "Karar ve revizyon düzenini baştan konuşun", body: "Taslakları kimlerin değerlendireceğini ve yorumların kim tarafından iletileceğini belirleyin. Kaç yaklaşımın sunulacağını, revizyonların nasıl ele alınacağını ve son dosyaların hangi onaydan sonra hazırlanacağını netleştirin. Karar verirken yalnızca kişisel beğeninize değil, başta yazdığınız hedef kitleye ve kullanım alanlarına dönün." },
    ],
    checklist: ["Marka adını, hizmeti ve hedef kitleyi anlattım.", "İstenen karakteri nedenleriyle tanımladım.", "Örneklerde neyi beğendiğimi açıkladım.", "Kullanım alanlarını ve dosya biçimlerini belirttim.", "Taslak, karar ve revizyon sürecini konuştum."],
    action: { title: "Logo tasarımı uzmanlığını keşfet", href: "/kategoriler/grafik-tasarim/logo-tasarimi" },
  },
  {
    slug: "video-projesi-planlama",
    title: "Video projesini kurguya başlamadan nasıl planlarsınız?",
    description: "Mesajı, yayın kanalını, ham görüntüleri ve teslim biçimlerini tek bir video briefinde toplayın.",
    topic: "Proje planlama", image: "video-animasyon",
    takeaway: "Bir videonun süresi tek başına kapsamı anlatmaz. Çekim, senaryo, kurgu, altyazı ve farklı ekran oranları için gereken işleri ayrı belirtin.",
    sections: [
      { title: "Tek bir ana mesaj seçin", body: "İzleyicinin videoyu gördükten sonra neyi anlamasını veya hangi adımı atmasını istediğinizi yazın. Bir ürün tanıtımıyla kullanım anlatımı farklı kurgular gerektirir. Hedef kitleyi ve yayınlanacağı yeri belirtin. Bütün marka hikâyesini kısa bir videoya sığdırmak yerine öncelikli mesaja karar verin.", example: "Yeni termosumuzun çantada kolay taşındığını anlatan kısa bir ürün videosu istiyoruz. Ana mesaj kullanım kolaylığı olacak. Video dikey olarak yayınlanacak; ürün ayrıntıları ve kısa altyazılar içerecek." },
      { title: "Hazır malzemeyi ve üretilecekleri ayırın", body: "Mevcut ham görüntüleri, fotoğrafları, logo dosyalarını ve metinleri listeleyin. Yeni çekim, seslendirme veya animasyon gerekiyorsa bunları kurgu işinden ayrı belirtin. Ham görüntülerin toplam uzunluğu ve düzeni de teklif için önemlidir. Dosyaları anlaşılır klasörlere ayırmak, uzmanın malzemeyi değerlendirmesini kolaylaştırır.", points: ["Görüntüler hazır mı, yeni çekim yapılacak mı?", "Senaryoyu, metinleri ve seslendirmeyi kim hazırlayacak?", "Müzik ve kullanılan görsellerin temini kimin sorumluluğunda?", "Altyazı ve farklı dil sürümleri gerekiyor mu?"] },
      { title: "Versiyonları ve çıktı biçimlerini netleştirin", body: "Ana videonun yanında kısa kesit, farklı ekran oranı veya altyazısız bir sürüm istiyorsanız bunu teslim listesine ekleyin. Her versiyonun aynı kurgunun yeniden boyutlandırılması mı, ayrı bir anlatım mı olduğunu belirtin. Video dosyasının yanı sıra kurgu proje dosyasını da istiyorsanız kullanılan araç ve bağımlılıkları konuşun." },
      { title: "Geri bildirimi zaman koduyla verin", body: "İlk taslakta genel akışı değerlendirin; son tura yeni bir senaryo değişikliği bırakmamaya çalışın. Ayrıntılı yorumlarda dakika ve saniye yazın. Değişmesini istediğiniz bölümü ve nedenini açıklayın. Altyazıları, marka adlarını ve son çağrı metnini son dışa aktarmadan önce birlikte gözden geçirin.", example: "00:12–00:16 aralığında ürün adı okunmadan sahne değişiyor. Bu planın biraz daha uzun kalmasını istiyoruz. 00:24’teki son metin, güncel marka yazımıyla değiştirilecek." },
    ],
    checklist: ["Hedef kitleyi ve ana mesajı belirledim.", "Çekim, kurgu, ses ve altyazı sorumluluklarını ayırdım.", "Hazır dosyaları ve eksik malzemeleri listeledim.", "Süreyi, ekran oranlarını ve gerekli sürümleri yazdım.", "Geri bildirimleri zaman koduyla iletmeyi planladım."],
    action: { title: "Video ve animasyon alanlarını keşfet", href: "/kategoriler/video-animasyon" },
  },
  {
    slug: "web-sitesi-proje-kapsami",
    title: "Web sitesi projesinde kapsam nasıl netleştirilir?",
    description: "Sayfaları, kullanıcı akışlarını, içerikleri ve mobil beklentileri karşılaştırılabilir bir web projesi kapsamına dönüştürün.",
    topic: "Proje planlama", image: "yazilim-teknoloji",
    takeaway: "‘Bir web sitesi istiyorum’ iyi bir başlangıç olsa da teklif için yeterli değildir. Sayfaları, yapılacak işlemleri ve her işin sorumlusunu görünür kılın.",
    sections: [
      { title: "Sayfalardan önce kullanıcı ihtiyacını yazın", body: "Ziyaretçinin siteye neden geleceğini ve hangi işlemi tamamlamasını istediğinizi anlatın. Hizmetleri tanıtmak, teklif toplamak ve içerik yayınlamak farklı işlevler gerektirir. Öncelikli kullanıcı akışını birkaç cümleyle yazmak, hem tasarım hem geliştirme kapsamını netleştirir.", example: "Ziyaretçi hizmetleri inceleyecek, uygun paketi seçip teklif formu gönderecek. İlk sürümde üyelik veya çevrim içi ödeme olmayacak. Formun hangi adrese ulaşacağını ve gönderim sonrasında ne gösterileceğini birlikte belirleyeceğiz." },
      { title: "Sayfa listesini ve işlevleri ayrı tutun", body: "Bir sayfanın tasarlanması, içindeki bütün işlevlerin geliştirilmesini kendiliğinden anlatmaz. Her sayfada ziyaretçinin ne yapabileceğini yazın. Boş liste, hata mesajı ve işlem sonucu gibi durumları da düşünün. Üyelik, arama, dil seçimi veya yönetim ekranı varsa bunları ayrı maddeler olarak ele alın.", points: ["Sayfa: Ana sayfa, hizmet ayrıntısı, hakkımızda ve iletişim.", "İşlev: Teklif formu, arama, içerik düzenleme veya kullanıcı hesabı.", "Durum: Form hatası, başarılı gönderim ve bulunamayan sayfa."] },
      { title: "İçerik ve mobil beklentileri paylaşın", body: "Metin, görsel ve marka dosyalarını kimin hazırlayacağını belirleyin. İçerik miktarı bilinmeden taslak sayfa sayısı yanıltıcı olabilir. Mobilde menünün, formların ve uzun içeriklerin nasıl kullanılacağını briefin parçası yapın. Tasarım dosyası, çalışan site ve içerik girişinin farklı teslimler olabileceğini tekliflerde açıkça karşılaştırın." },
      { title: "İlk sürümü ve sonraki istekleri ayırın", body: "Yayın için gerekli olanlarla daha sonra eklenebilecek fikirleri iki listede toplayın. Böylece ilk sürümün teslim koşulu belirginleşir. Alan adı, barındırma, erişimler, yayınlama ve kullanım anlatımı sorumluluklarını netleştirin. Son kontrolde anlaşılan kullanıcı akışını gerçek cihazlarda baştan sona birlikte izleyin.", example: "İlk sürüm: Hizmet sayfaları, iletişim formu ve mobil görünüm. Sonraki aşama: Blog ve ikinci dil. Teslim kontrolü: Menüden hizmete ulaşma, formu doldurma ve sonuç mesajını görme." },
    ],
    checklist: ["Sitenin amacını ve öncelikli kullanıcı akışını yazdım.", "Sayfaları ve işlevleri ayrı listeledim.", "İçerik hazırlama ve giriş sorumluluklarını belirledim.", "Mobil görünümü ve önemli hata durumlarını kapsama ekledim.", "İlk sürümü, yayınlama işlerini ve sonraki fikirleri ayırdım."],
    action: { title: "Yazılım ve teknoloji alanlarını keşfet", href: "/kategoriler/yazilim-teknoloji" },
  },
];
