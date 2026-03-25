/**
 * Coupon API — POST /api/coupon-api
 * Actions: redeem-points (customer redeems points for a coupon)
 */
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

  const memberId = (body.memberId as string || '').trim();
  const couponId = (body.couponId as string || '').trim();

  if (!memberId || !couponId) {
    return res.status(400).json({ error: 'Missing memberId or couponId' });
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
