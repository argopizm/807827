/**
 * NVI (Nüfus ve Vatandaşlık İşleri) Kamu SOAP API'si üzerinden TC Kimlik No doğrulaması yapar.
 */
export async function verifyTCNo(data: {
  tcNo: string;
  firstName: string;
  lastName: string;
  birthYear: number;
}) {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${data.tcNo}</TCKimlikNo>
      <Ad>${data.firstName.toLocaleUpperCase("tr-TR")}</Ad>
      <Soyad>${data.lastName.toLocaleUpperCase("tr-TR")}</Soyad>
      <DogumYili>${data.birthYear}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch("https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula",
      },
      body: soapEnvelope,
    });

    const xml = await response.text();
    const resultMatch = xml.match(/<TCKimlikNoDogrulaResult>(true|false)<\/TCKimlikNoDogrulaResult>/);
    
    return resultMatch ? resultMatch[1] === "true" : false;
  } catch (error) {
    console.error("NVI Verification Error:", error);
    return false;
  }
}
