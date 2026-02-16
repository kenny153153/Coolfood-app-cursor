/**
 * Salted SHA-256 password hashing.
 * Format stored: "salt:hash" where salt is 16 random hex chars.
 * Backward-compatible: verifyPassword handles both old (unsalted) and new (salted) formats.
 */

function generateSalt(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Hash password with a random salt. Returns "salt:hash" string. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = generateSalt();
  const hash = await sha256(salt + plain);
  return `${salt}:${hash}`;
}

/** Compare plain password against stored hash. Supports both salted ("salt:hash") and legacy unsalted formats. */
export async function verifyPassword(plain: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    // New salted format: "salt:hash"
    const [salt, hash] = storedHash.split(':');
    const computed = await sha256(salt + plain);
    return computed === hash;
  }
  // Legacy unsalted format: direct SHA-256
  const legacy = await sha256(plain);
  return legacy === storedHash;
}
