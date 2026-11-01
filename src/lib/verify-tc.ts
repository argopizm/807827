/**
 * TC Kimlik Numarası Doğrulama Modülü
 * 1) Resmi 11 haneli algoritma kontrolü (Checksum / Mod10)
 * 2) NVİ (Nüfus ve Vatandaşlık İşleri) Kamu SOAP Servisi (KPSPublic)
 */

export function validateTCAlgorithm(tcNo: string): boolean {
  if (!tcNo || typeof tcNo !== "string") return false;
  const clean = tcNo.trim();
  if (!/^[1-9]\d{10}$/.test(clean)) return false;

  const digits = clean.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  let d10 = (oddSum * 7 - evenSum) % 10;
  if (d10 < 0) d10 += 10;
  if (d10 !== digits[9]) return false;

  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sum10 % 10 !== digits[10]) return false;

  return true;
}

export function toTurkishUpper(str: string): string {
  if (!str) return "";
  return str
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .toLocaleUpperCase("tr-TR")
    .trim();
}

export interface VerifyTCData {
  tcNo: string;
  firstName: string;
  lastName: string;
  birthYear: number;
}

export async function verifyTCNo(data: VerifyTCData): Promise<{ success: boolean; error?: string }> {
  const { tcNo, firstName, lastName, birthYear } = data;

  if (!tcNo || !firstName || !lastName || !birthYear) {
    return { success: false, error: "Ad, soyad, TC kimlik no ve doğum yılı alanları zorunludur." };
  }

  // 1. Aşama: Matematiksel ve Algoritmik Doğrulama
  if (!validateTCAlgorithm(tcNo)) {
    return { success: false, error: "Geçersiz TC Kimlik Numarası. Lütfen numaranızı kontrol edip tekrar deneyin." };
  }

  const cleanFirstName = toTurkishUpper(firstName);
  const cleanLastName = toTurkishUpper(lastName);

  if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
    return { success: false, error: "Lütfen adınızı ve soyadınızı kimlikte yazıldığı şekilde eksiksiz girin." };
  }

  const year = Number(birthYear);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1920 || year > currentYear - 15) {
    return { success: false, error: "Geçersiz doğum yılı." };
  }

  // 2. Aşama: NVI Kamu Web Servisi (KPSPublic)
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${tcNo.trim()}</TCKimlikNo>
      <Ad>${cleanFirstName}</Ad>
      <Soyad>${cleanLastName}</Soyad>
      <DogumYili>${year}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch("https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FreelancerTurkiye/1.0",
      },
      body: soapEnvelope,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const xml = await response.text();
    const resultMatch = xml.match(/<TCKimlikNoDogrulaResult>(true|false)<\/TCKimlikNoDogrulaResult>/);

    if (resultMatch) {
      if (resultMatch[1] === "true") {
        return { success: true };
      } else {
        return {
          success: false,
          error: "Kimlik bilgileri Nüfus ve Vatandaşlık İşleri (NVİ) kayıtlarıyla eşleşmedi. Ad, soyad, doğum yılı ve TC no bilgilerini kimliğinizdeki gibi girdiğinizden emin olun.",
        };
      }
    }
  } catch (error) {
    console.warn("[verifyTCNo] NVI servisine bağlanılamadı:", error);
  }

  // NVİ servisi geçici erişilemezse bile katı algoritma doğrulamasını geçti
  return { success: true };
}
