import { emailVerificationConfig } from "@/lib/email-verification";

export async function sendAccountEmail(to: string, subject: string, text: string): Promise<boolean> {
  const config = emailVerificationConfig();
  if (!config) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, to: [to], subject, text }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return Boolean(response?.ok);
}
