import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from './_adminAuth.js';

type Req = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: any;
};

type Res = {
  status: (code: number) => { json: (body: any) => void };
};

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const action = req.body?.action;
  const auth = await verifyAdminRequest(req, 'warehouse_ops', action === 'create_child_product' ? 'create' : undefined);
  if (!auth.ok) return res.status(auth.status || 401).json({ ok: false, error: auth.error || 'Unauthorized' });

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ ok: false, error: 'Server config missing' });

  const supabase = createClient(supabaseUrl.replace(/\/$/, ''), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (action !== 'create_child_product') {
      return res.status(400).json({ ok: false, error: 'Unknown action' });
    }

    const input = req.body?.row || {};
    const row = {
      id: safeTrim(input.id) || `P-${Date.now()}`,
      name: safeTrim(input.name),
      categories: Array.isArray(input.categories) ? input.categories : [],
      price: Number(input.price) || 0,
      member_price: Number(input.member_price) || 0,
      stock: Number(input.stock) || 0,
      track_inventory: input.track_inventory !== false,
      tags: Array.isArray(input.tags) ? input.tags : [],
      image: safeTrim(input.image) || '🥩',
      description: safeTrim(input.description) || null,
      ingredient_id: safeTrim(input.ingredient_id) || null,
      parent_ingredient_id: safeTrim(input.parent_ingredient_id) || null,
      processing_type_id: safeTrim(input.processing_type_id) || null,
      yield_rate: Number(input.yield_rate) || null,
      processing_cost: Number(input.processing_cost) || 0,
      packaging_cost: Number(input.packaging_cost) || 0,
      misc_cost: Number(input.misc_cost) || 0,
      sale_channel: ['retail', 'wholesale', 'both'].includes(input.sale_channel) ? input.sale_channel : 'both',
      product_type: 'processed',
      pack_size: safeTrim(input.pack_size) || null,
      pack_weight_lb: input.pack_weight_lb == null ? null : Number(input.pack_weight_lb),
      variant_label: safeTrim(input.variant_label) || null,
      pricing_mode: ['fixed_pack', 'by_piece'].includes(input.pricing_mode) ? input.pricing_mode : 'fixed_pack',
    };

    if (!row.name) return res.status(400).json({ ok: false, error: '請輸入下料名稱' });
    if (!row.ingredient_id || !row.parent_ingredient_id) return res.status(400).json({ ok: false, error: '缺少母料' });
    if (!row.processing_type_id) return res.status(400).json({ ok: false, error: '請選擇切割／包裝方法' });
    if (row.yield_rate == null || row.yield_rate < 0.5 || row.yield_rate > 1) {
      return res.status(400).json({ ok: false, error: '出成率必須介乎 0.5 至 1' });
    }

    const { data, error } = await supabase.from('products').insert(row).select('*').single();
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Server error' });
  }
}
