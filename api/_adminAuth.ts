/**
 * Shared admin authentication helper for API routes.
 * Validates that the request comes from an authenticated admin user
 * OR from an internal server-to-server call using the service role key.
 *
 * Usage in API handlers:
 *   const authResult = await verifyAdminRequest(req);
 *   if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });
 */

export type AdminAuthResult = {
  ok: boolean;
  adminId?: string;
  role?: string;
  status?: number;
  error?: string;
};

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Check if request comes from an internal server-to-server call */
function isInternalCall(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const secret = safeTrim(req.headers?.['x-internal-secret'] as string);
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  return !!secret && !!serviceRoleKey && secret === serviceRoleKey;
}

export async function verifyAdminRequest(
  req: { headers?: Record<string, string | string[] | undefined> }
): Promise<AdminAuthResult> {
  // Allow internal server-to-server calls (e.g. confirm-payment calling sf-order)
  if (isInternalCall(req)) {
    return { ok: true, adminId: 'internal', role: 'system' };
  }

  const adminId = safeTrim(req.headers?.['x-admin-id'] as string);
  const adminRole = safeTrim(req.headers?.['x-admin-role'] as string);

  if (!adminId || !adminRole) {
    return { ok: false, status: 401, error: '未授權：需要管理員登入' };
  }

  // Validate against DB
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, status: 500, error: 'Server config missing' };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=id,role`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const data = await res.json();
    const admin = Array.isArray(data) ? data[0] : null;

    if (!admin) {
      return { ok: false, status: 403, error: '權限不足：非管理員帳號' };
    }

    return { ok: true, adminId: admin.id, role: admin.role };
  } catch {
    return { ok: false, status: 500, error: '驗證失敗' };
  }
}
