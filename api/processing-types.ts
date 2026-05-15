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

const STANDARD_PROCESSING_TYPES = [
  { code: 'shred', name: '切絲', name_en: 'Shredded', spec: null, sort_order: 1 },
  { code: 'dice', name: '切粒', name_en: 'Diced', spec: null, sort_order: 2 },
  { code: 'slice2mm', name: '切片2mm', name_en: 'Sliced 2mm', spec: '2mm', sort_order: 3 },
  { code: 'slice4mm', name: '切片4mm', name_en: 'Sliced 4mm', spec: '4mm', sort_order: 4 },
  { code: 'steak', name: '切扒', name_en: 'Steak-cut', spec: null, sort_order: 5 },
  { code: 'strip', name: '切條', name_en: 'Strips', spec: null, sort_order: 6 },
];

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const action = req.body?.action;
  const input = req.body?.row || {};
  const auth = await verifyAdminRequest(
    req,
    'warehouse_ops',
    action === 'list' ? 'read' : action === 'delete' ? 'delete' : action === 'seed_standard' ? 'create' : action === 'upsert' ? (input.id ? 'update' : 'create') : undefined
  );
  if (!auth.ok) return res.status(auth.status || 401).json({ ok: false, error: auth.error || 'Unauthorized' });

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ ok: false, error: 'Server config missing' });

  const supabase = createClient(supabaseUrl.replace(/\/$/, ''), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (action === 'list') {
      const { data, error } = await supabase.from('processing_types').select('*').order('sort_order');
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'seed_standard') {
      const rows = STANDARD_PROCESSING_TYPES.map(row => ({
        ...row,
        surcharge_pork_chicken: 0,
        surcharge_beef_lamb_seafood: 0,
        requires_repackaging: false,
        default_pack_weight_lb: null,
        is_active: true,
      }));
      const { data, error } = await supabase
        .from('processing_types')
        .upsert(rows, { onConflict: 'code' })
        .select('*');
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'upsert') {
      const row = {
        ...(input.id ? { id: input.id } : {}),
        code: safeTrim(input.code).toLowerCase(),
        name: safeTrim(input.name),
        name_en: safeTrim(input.name_en) || null,
        spec: safeTrim(input.spec) || null,
        surcharge_pork_chicken: 0,
        surcharge_beef_lamb_seafood: 0,
        requires_repackaging: false,
        default_pack_weight_lb: null,
        sort_order: Number(input.sort_order) || 0,
        is_active: input.is_active !== false,
      };

      if (!row.code || !row.name) return res.status(400).json({ ok: false, error: '請輸入代碼和名稱' });

      const { data, error } = await supabase.from('processing_types').upsert(row).select('*').single();
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'delete') {
      const id = safeTrim(req.body?.id);
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const { error } = await supabase.from('processing_types').delete().eq('id', id);
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Server error' });
  }
}
