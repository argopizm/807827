// tc_verified = 1 rows predate the live NVİ check and are never shown as matched.
export const identityMatched = 2;

const endpoint = "https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx";

export type IdentityInput = { tc: string; firstName: string; lastName: string; birthYear: number };

export function validTcNumber(value: string) {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = Array.from(value, Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  if ((((odd * 7 - even) % 10) + 10) % 10 !== d[9]) return false;
  return d.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10 === d[10];
}

export function identityName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
  return name.length >= 2 && name.length <= 60 && /^[A-ZÇĞİÖŞÜÂÎÛ]+(?: [A-ZÇĞİÖŞÜÂÎÛ]+)*$/u.test(name) ? name : null;
}

export function identityBirthYear(value: unknown) {
  const year = typeof value === "string" ? Number(value.trim()) : value;
  const latest = new Date().getUTCFullYear() - 18;
  return typeof year === "number" && Number.isInteger(year) && year >= 1900 && year <= latest ? year : null;
}

// Inputs only travel in this request; callers must never log or persist them.
export async function checkIdentity(input: IdentityInput): Promise<"match" | "no_match" | "unavailable"> {
  const body = '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
    '<TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">' +
    `<TCKimlikNo>${input.tc}</TCKimlikNo><Ad>${input.firstName}</Ad><Soyad>${input.lastName}</Soyad><DogumYili>${input.birthYear}</DogumYili>` +
    "</TCKimlikNoDogrula></soap:Body></soap:Envelope>";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: '"http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"' },
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return "unavailable";
    const result = /<TCKimlikNoDogrulaResult>(true|false)<\/TCKimlikNoDogrulaResult>/.exec(await response.text())?.[1];
    return result === "true" ? "match" : result === "false" ? "no_match" : "unavailable";
  } catch {
    return "unavailable";
  }
}
