import type { D1Database } from "@/lib/db";
import { canPublish, emailVerificationError } from "@/lib/email-verification";
import { checkIdentity, identityBirthYear, identityMatched, identityName, validTcNumber } from "@/lib/identity-check";
import { privateApi, privateJson } from "@/lib/private-api";
import { clientAddress, limitRequests, rateLimitResponse, readJson } from "@/lib/request-security";

async function matched(db: D1Database, userId: string) {
  const user = await db.prepare("SELECT tc_verified FROM users WHERE id = ? AND deleted_at IS NULL").bind(userId).first<{ tc_verified: number | null }>();
  return user?.tc_verified === identityMatched;
}

export function GET(request: Request) {
  return privateApi(request, async (db, userId) => privateJson({ matched: await matched(db, userId), canCheck: await canPublish(db, userId) }));
}

export function POST(request: Request) {
  return privateApi(request, async (db, userId) => {
    const body = await readJson(request);
    if (!body) return privateJson({ error: "Geçersiz istek." }, 400);
    if (body.consent !== true) return privateJson({ error: "Devam etmek için aydınlatma metnini okuyup onay kutusunu işaretleyin." }, 400);

    const tc = typeof body.tc === "string" ? body.tc.trim() : "";
    const firstName = identityName(body.firstName);
    const lastName = identityName(body.lastName);
    const birthYear = identityBirthYear(body.birthYear);
    if (!validTcNumber(tc) || !firstName || !lastName || !birthYear) {
      return privateJson({ error: "Adınızı ve soyadınızı kimlik kartınızdaki gibi, T.C. kimlik numaranızı 11 hane ve doğum yılınızı 4 hane olarak girin." }, 400);
    }
    // Tight limits keep the endpoint from becoming a lookup oracle for other people's data.
    if (!limitRequests("identity:" + userId, 5, 3600) || !limitRequests("identity-ip:" + clientAddress(request.headers), 10, 3600)) {
      return rateLimitResponse(3600);
    }
    if (!await canPublish(db, userId)) return privateJson({ error: emailVerificationError }, 403);
    if (await matched(db, userId)) return privateJson({ matched: true });

    const result = await checkIdentity({ tc, firstName, lastName, birthYear });
    if (result === "unavailable") {
      return privateJson({ error: "NVİ doğrulama servisine şu anda ulaşılamıyor. Bilgileriniz kaydedilmedi; daha sonra tekrar deneyin." }, 503);
    }
    if (result === "no_match") {
      return privateJson({ error: "Bilgiler NVİ kayıtlarıyla eşleşmedi. Bilgileriniz kaydedilmedi. Ad ve soyadınızı kimlik kartınızdaki gibi yazdığınızdan emin olun." }, 422);
    }
    await db.prepare("UPDATE users SET tc_verified = ? WHERE id = ? AND deleted_at IS NULL").bind(identityMatched, userId).run();
    return privateJson({ matched: true });
  });
}
