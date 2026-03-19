/**
 * Shared admin authentication helper for API routes.
 * Validates that the request comes from an authenticated admin user
 * OR from an internal server-to-server call using the service role key.
 *
 * Enterprise Security: optionally enforces module + CRUD operation checks.
 *
 * Usage in API handlers:
 *   const authResult = await verifyAdminRequest(req);
 *   if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });
 *
 * With module+operation check:
 *   const authResult = await verifyAdminRequest(req, 'accounting', 'create');
 *   if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });
 */

export type CrudOp = 'read' | 'create' | 'update' | 'delete' | 'export';

export interface ModulePermission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export type AdminAuthResult = {
  ok: boolean;
  adminId?: string;
  role?: string;
  status?: number;
  error?: string;
};

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function isInternalCall(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const secret = safeTrim(req.headers?.['x-internal-secret'] as string);
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  return !!secret && !!serviceRoleKey && secret === serviceRoleKey;
}

/** Normalize legacy boolean or new CRUD permission value */
function normalizePermValue(val: boolean | ModulePermission | undefined | null): ModulePermission {
  if (!val) return { read: false, create: false, update: false, delete: false, export: false };
  if (typeof val === 'boolean') {
    return val
      ? { read: true, create: true, update: true, delete: true, export: true }
      : { read: false, create: false, update: false, delete: false, export: false };
  }
  return { read: !!val.read, create: !!val.create, update: !!val.update, delete: !!val.delete, export: !!val.export };
}

export async function verifyAdminRequest(
  req: { headers?: Record<string, string | string[] | undefined> },
  requiredModule?: string,
  requiredOp?: CrudOp
): Promise<AdminAuthResult> {
  if (isInternalCall(req)) {
    return { ok: true, adminId: 'internal', role: 'system' };
  }

  const adminId = safeTrim(req.headers?.['x-admin-id'] as string);
  const adminRole = safeTrim(req.headers?.['x-admin-role'] as string);

  if (!adminId || !adminRole) {
    return { ok: false, status: 401, error: '未授權：需要管理員登入' };
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, status: 500, error: 'Server config missing' };
  }

  try {
    const selectCols = requiredModule
      ? 'id,role,admin_permissions'
      : 'id,role';

    const res = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=${selectCols}`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const data = await res.json();
    const admin = Array.isArray(data) ? data[0] : null;

    if (!admin) {
      return { ok: false, status: 403, error: '權限不足：非管理員帳號' };
    }

    // super_admin bypasses all module/op checks
    if (admin.role === 'super_admin') {
      return { ok: true, adminId: admin.id, role: admin.role };
    }

    // Module + operation level check (Enterprise Security)
    if (requiredModule) {
      const perms = admin.admin_permissions as Record<string, boolean | ModulePermission> | null;
      if (!perms) {
        return { ok: false, status: 403, error: `權限不足：無法存取 ${requiredModule}` };
      }

      const modulePerm = normalizePermValue(perms[requiredModule]);

      if (!modulePerm.read) {
        return { ok: false, status: 403, error: `權限不足：無法存取 ${requiredModule}` };
      }

      if (requiredOp && requiredOp !== 'read' && !modulePerm[requiredOp]) {
        return { ok: false, status: 403, error: `權限不足：無法在 ${requiredModule} 執行 ${requiredOp} 操作` };
      }
    }

    return { ok: true, adminId: admin.id, role: admin.role };
  } catch {
    return { ok: false, status: 500, error: '驗證失敗' };
  }
}
