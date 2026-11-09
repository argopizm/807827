// Only pass static table aliases from application queries to this helper.
export function publicNameSql(alias = "") {
  const prefix = alias ? alias + "." : "";
  return "CASE WHEN " + prefix + "deleted_at IS NOT NULL THEN 'Silinen kullanıcı' ELSE " +
    "COALESCE(NULLIF(TRIM(" + prefix + "display_name), ''), NULLIF(TRIM(" + prefix + "username), ''), 'Frenaw üyesi') END";
}

export function cleanDisplayName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validDisplayName(value: string) {
  return value.length >= 2 && value.length <= 80 && !/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value);
}

export function cleanUsername(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/^@/, "").toLowerCase() : "";
}

export function validUsername(value: string) {
  return /^[a-z0-9_]{2,64}$/.test(value);
}
