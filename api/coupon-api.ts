/**
 * Coupon API — POST /api/coupon-api
 * Actions: redeem-points (customer redeems points for a coupon)
 *
 * Security: verifies customer session via x-member-id + x-session-token
 * headers before allowing any points operation.
 */
import { createHash, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

type Req = {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => void };
};

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(32);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function getSupabaseAdmin() {
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceRoleKey) return null;
  return {
    client: createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }),
    url: supabaseUrl,
    key: serviceRoleKey,
  };
}

async function verifyCustomerSession(
  headers: Record<string, string | string[] | undefined>,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ ok: boolean; memberId?: string }> {
  const memberId = safeTrim(headers['x-member-id'] as string);
  const sessionToken = safeTrim(headers['x-session-token'] as string);
  if (!memberId || !sessionToken) return { ok: false };

  const res = await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,password_hash`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  );
  const rows = await res.json();
  const member = Array.isArray(rows) ? rows[0] : null;
  if (!member) return { ok: false };

  const expected = sha256(`session:${member.id}:${member.password_hash ?? ''}`);
  if (!constantTimeCompare(sessionToken, expected)) return { ok: false };

  return { ok: true, memberId: member.id };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const action = body.action as string;

  if (action !== 'redeem-points') {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server config missing' });

  const session = await verifyCustomerSession(req.headers ?? {}, admin.url, admin.key);
  if (!session.ok) {
    return res.status(401).json({ error: '未授權：需要登入', code: 'UNAUTHORIZED' });
  }

  const memberId = session.memberId!;
  const couponId = (body.couponId as string || '').trim();

  if (!couponId) {
    return res.status(400).json({ error: 'Missing couponId' });
  }

  try {
    const { client } = admin;

    const { data: coupon } = await client
      .from('coupons').select('*').eq('id', couponId).eq('is_active', true).maybeSingle();
    if (!coupon) return res.status(404).json({ error: 'Coupon not found or inactive' });
    if (!coupon.points_cost || coupon.points_cost <= 0) return res.status(400).json({ error: 'This coupon cannot be redeemed with points' });

    const { data: member } = await client
      .from('members').select('points').eq('id', memberId).maybeSingle();
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.points < coupon.points_cost) return res.status(400).json({ error: 'Not enough points', code: 'INSUFFICIENT_POINTS' });

    // Check if already redeemed this coupon
    const { data: existing } = await client
      .from('member_coupons')
      .select('id')
      .eq('member_id', memberId)
      .eq('coupon_id', couponId)
      .eq('source', 'points_shop');
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Already redeemed this coupon', code: 'ALREADY_REDEEMED' });
    }

    // Deduct points
    const newPoints = member.points - coupon.points_cost;
    const { error: ptsErr } = await client
      .from('members').update({ points: newPoints }).eq('id', memberId);
    if (ptsErr) return res.status(500).json({ error: 'Failed to deduct points' });

    // Create member_coupon
    const expiresAt = new Date(Date.now() + (coupon.expiry_days || 30) * 86400000).toISOString();
    const mcId = `mc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { error: mcErr } = await client.from('member_coupons').insert({
      id: mcId,
      member_id: memberId,
      coupon_id: couponId,
      status: 'available',
      source: 'points_shop',
      expires_at: expiresAt,
    });
    if (mcErr) {
      // Rollback points
      await client.from('members').update({ points: member.points }).eq('id', memberId);
      return res.status(500).json({ error: 'Failed to assign coupon' });
    }

    // Increment distributed_count
    await client.from('coupons')
      .update({ distributed_count: (coupon.distributed_count || 0) + 1 })
      .eq('id', couponId);

    return res.status(200).json({ success: true, newPoints, memberCouponId: mcId });
  } catch (e) {
    console.error('[coupon-api] Error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
