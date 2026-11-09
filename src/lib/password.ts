const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

async function derivePassword(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await derivePassword(password, salt), salt: toHex(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  if (!/^[\da-f]{64}$/.test(hash) || !/^[\da-f]{32}$/.test(salt)) return false;
  const saltBytes = Uint8Array.from(salt.match(/../g)!, (byte) => parseInt(byte, 16));
  const computed = await derivePassword(password, saltBytes);
  let difference = 0;
  for (let index = 0; index < hash.length; index++) {
    difference |= computed.charCodeAt(index) ^ hash.charCodeAt(index);
  }
  return difference === 0;
}
