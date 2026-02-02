/** Hash password for storage. Uses SHA-256 (no salt for demo; use Supabase Auth in production). */
export async function hashPassword(plain: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Compare plain password with stored hash. */
export async function verifyPassword(plain: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash) return false;
  const h = await hashPassword(plain);
  return h === storedHash;
}
