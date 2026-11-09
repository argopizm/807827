export type ProposalTerms = { proposal_message: string | null; amount_kurus: number | null; delivery_days: number | null };
export type SavedProposal = ProposalTerms & { id: string; status: string };

// Accept an ungrouped decimal TL amount; store integer kuruş to avoid float rounding.
export function parseProposalAmount(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{1,8}(?:[.,]\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().replace(",", ".").split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount >= 1 && amount <= 1_000_000_000 ? amount : null;
}

export function proposalPrice(amount: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(amount / 100);
}
