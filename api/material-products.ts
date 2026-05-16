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
  const requiredOp =
    action === 'create_child_product' || action === 'create_mother_material' || action === 'import_mother_materials' ? 'create'
      : action === 'update_mother_material' || action === 'bulk_update_mother_materials' || action === 'assign_product_to_mother' || action === 'save_child_order_map' || action === 'sync_child_names_by_mother' ? 'update'
        : action === 'get_child_order_map' ? 'read'
        : action === 'delete_child_product' || action === 'delete_mother_materials' ? 'delete'
          : undefined;
  const auth = await verifyAdminRequest(req, 'warehouse_ops', requiredOp);
  if (!auth.ok) return res.status(auth.status || 401).json({ ok: false, error: auth.error || 'Unauthorized' });

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ ok: false, error: 'Server config missing' });

  const supabase = createClient(supabaseUrl.replace(/\/$/, ''), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const normalizeMotherMaterialInput = (input: any) => ({
    name: safeTrim(input.name),
    name_en: safeTrim(input.name_en ?? input.nameEn) || null,
    base_cost_per_lb: Number(input.base_cost_per_lb ?? input.baseCostPerLb) || 0,
    supplier: safeTrim(input.supplier) || null,
    market_benchmark: safeTrim(input.market_benchmark ?? input.marketBenchmark) || null,
    unit: safeTrim(input.unit) || 'lb',
    category: safeTrim(input.category) || null,
    material_type: safeTrim(input.material_type ?? input.materialType) || 'meat',
    notes: safeTrim(input.notes) || null,
  });

  try {
    if (action === 'get_child_order_map') {
      const { data, error } = await supabase.from('site_config').select('value').eq('id', 'material_child_order_map').maybeSingle();
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data: (data?.value && typeof data.value === 'object') ? data.value : {} });
    }

    if (action === 'save_child_order_map') {
      const ingredientId = safeTrim(req.body?.ingredientId);
      const orderedProductIds = Array.isArray(req.body?.orderedProductIds) ? req.body.orderedProductIds.map(safeTrim).filter(Boolean) : [];
      if (!ingredientId) return res.status(400).json({ ok: false, error: '缺少母料 ID' });

      const { data: existing, error: existingError } = await supabase.from('site_config').select('value').eq('id', 'material_child_order_map').maybeSingle();
      if (existingError) return res.status(400).json({ ok: false, error: existingError.message });

      const prevMap = (existing?.value && typeof existing.value === 'object') ? existing.value as Record<string, string[]> : {};
      const nextMap: Record<string, string[]> = { ...prevMap };
      if (orderedProductIds.length === 0) delete nextMap[ingredientId];
      else nextMap[ingredientId] = orderedProductIds;
      const { error } = await supabase.from('site_config').upsert({ id: 'material_child_order_map', value: nextMap });
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data: nextMap });
    }

    if (action === 'create_mother_material') {
      const row = normalizeMotherMaterialInput(req.body?.row || {});
      if (!row.name) return res.status(400).json({ ok: false, error: '請輸入母料名稱' });
      if (!['meat', 'third_party'].includes(row.material_type)) row.material_type = 'meat';

      const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'import_mother_materials') {
      const rows = Array.isArray(req.body?.rows)
        ? req.body.rows.map(normalizeMotherMaterialInput).filter((row: any) => row.name)
        : [];
      if (rows.length === 0) return res.status(400).json({ ok: false, error: '沒有可匯入的母料資料' });
      rows.forEach((row: any) => {
        if (!['meat', 'third_party'].includes(row.material_type)) row.material_type = 'meat';
      });

      const { data, error } = await supabase.from('ingredients').insert(rows).select('*');
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'update_mother_material') {
      const id = safeTrim(req.body?.id);
      const patch = req.body?.patch || {};
      if (!id) return res.status(400).json({ ok: false, error: '缺少母料 ID' });

      const payload: Record<string, any> = {};
      if ('name' in patch) {
        const name = safeTrim(patch.name);
        if (!name) return res.status(400).json({ ok: false, error: '請輸入母料名稱' });
        payload.name = name;
      }
      if ('nameEn' in patch || 'name_en' in patch) payload.name_en = safeTrim(patch.nameEn ?? patch.name_en) || null;
      if ('category' in patch) payload.category = safeTrim(patch.category) || null;
      if ('unit' in patch) payload.unit = safeTrim(patch.unit) || 'lb';
      if ('materialType' in patch) payload.material_type = safeTrim(patch.materialType) || 'meat';
      if ('material_type' in patch) payload.material_type = safeTrim(patch.material_type) || 'meat';
      if ('baseCostPerLb' in patch) payload.base_cost_per_lb = Number(patch.baseCostPerLb) || 0;
      if ('base_cost_per_lb' in patch) payload.base_cost_per_lb = Number(patch.base_cost_per_lb) || 0;
      if ('supplier' in patch) payload.supplier = safeTrim(patch.supplier) || null;
      if ('marketBenchmark' in patch || 'market_benchmark' in patch) payload.market_benchmark = safeTrim(patch.marketBenchmark ?? patch.market_benchmark) || null;
      if ('notes' in patch) payload.notes = safeTrim(patch.notes) || null;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ ok: false, error: '沒有可更新的母料資料' });
      }

      const { data, error } = await supabase.from('ingredients').update(payload).eq('id', id).select('*').single();
      if (error) return res.status(400).json({ ok: false, error: error.message });
      if (payload.name && req.body?.syncChildNames) {
        const newMotherName = safeTrim(payload.name);
        const oldMotherName = safeTrim(req.body?.oldName);
        const { data: kids, error: kidsError } = await supabase
          .from('products')
          .select('id,name,processing_type_id,variant_label,ingredient_id,product_type')
          .eq('ingredient_id', id);
        if (kidsError) return res.status(400).json({ ok: false, error: kidsError.message });

        const processedKids = (kids || []).filter((k: any) => k.ingredient_id && k.product_type === 'processed');
        if (processedKids.length > 0) {
          const ptIds = Array.from(new Set(processedKids.map((k: any) => safeTrim(k.processing_type_id)).filter(Boolean)));
          const ptNameMap = new Map<string, string>();
          if (ptIds.length > 0) {
            const { data: ptRows, error: ptError } = await supabase
              .from('processing_types')
              .select('id,name')
              .in('id', ptIds);
            if (ptError) return res.status(400).json({ ok: false, error: ptError.message });
            (ptRows || []).forEach((pt: any) => ptNameMap.set(safeTrim(pt.id), safeTrim(pt.name)));
          }

          for (const kid of processedKids) {
            const procName = ptNameMap.get(safeTrim(kid.processing_type_id)) || safeTrim(kid.variant_label);
            let suffix = procName;
            if (!suffix) {
              const n = safeTrim(kid.name);
              if (oldMotherName && n.startsWith(`${oldMotherName}-`)) suffix = n.slice(oldMotherName.length + 1);
              else if (n.includes('-')) suffix = n.slice(n.indexOf('-') + 1);
              else suffix = n;
            }
            const nextName = suffix ? `${newMotherName}-${suffix}` : newMotherName;
            const { error: renameError } = await supabase.from('products').update({ name: nextName }).eq('id', kid.id);
            if (renameError) return res.status(400).json({ ok: false, error: renameError.message });
          }
        }
      }
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'sync_child_names_by_mother') {
      const id = safeTrim(req.body?.id);
      const newMotherName = safeTrim(req.body?.newName);
      const oldMotherName = safeTrim(req.body?.oldName);
      if (!id || !newMotherName) return res.status(400).json({ ok: false, error: '缺少母料資料' });
      const { data: kids, error: kidsError } = await supabase
        .from('products')
        .select('id,name,processing_type_id,variant_label,ingredient_id,product_type')
        .eq('ingredient_id', id);
      if (kidsError) return res.status(400).json({ ok: false, error: kidsError.message });

      const processedKids = (kids || []).filter((k: any) => k.ingredient_id && k.product_type === 'processed');
      const ptIds = Array.from(new Set(processedKids.map((k: any) => safeTrim(k.processing_type_id)).filter(Boolean)));
      const ptNameMap = new Map<string, string>();
      if (ptIds.length > 0) {
        const { data: ptRows, error: ptError } = await supabase.from('processing_types').select('id,name').in('id', ptIds);
        if (ptError) return res.status(400).json({ ok: false, error: ptError.message });
        (ptRows || []).forEach((pt: any) => ptNameMap.set(safeTrim(pt.id), safeTrim(pt.name)));
      }

      let updatedCount = 0;
      for (const kid of processedKids) {
        const procName = ptNameMap.get(safeTrim(kid.processing_type_id)) || safeTrim(kid.variant_label);
        let suffix = procName;
        if (!suffix) {
          const n = safeTrim(kid.name);
          if (oldMotherName && n.startsWith(`${oldMotherName}-`)) suffix = n.slice(oldMotherName.length + 1);
          else if (n.includes('-')) suffix = n.slice(n.indexOf('-') + 1);
          else suffix = n;
        }
        const nextName = suffix ? `${newMotherName}-${suffix}` : newMotherName;
        const { error: renameError } = await supabase.from('products').update({ name: nextName }).eq('id', kid.id);
        if (renameError) return res.status(400).json({ ok: false, error: renameError.message });
        updatedCount += 1;
      }
      return res.status(200).json({ ok: true, data: { updatedCount } });
    }

    if (action === 'bulk_update_mother_materials') {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(safeTrim).filter(Boolean) : [];
      const patch = req.body?.patch || {};
      if (ids.length === 0) return res.status(400).json({ ok: false, error: '缺少母料 ID' });

      const payload: Record<string, any> = {};
      if ('category' in patch) payload.category = safeTrim(patch.category) || null;
      if ('unit' in patch) payload.unit = safeTrim(patch.unit) || 'lb';
      if ('materialType' in patch) payload.material_type = safeTrim(patch.materialType) || 'meat';
      if ('baseCostPerLb' in patch) payload.base_cost_per_lb = Number(patch.baseCostPerLb) || 0;
      if ('supplier' in patch) payload.supplier = safeTrim(patch.supplier) || null;
      if (Object.keys(payload).length === 0) return res.status(400).json({ ok: false, error: '沒有可更新的母料資料' });

      const { data, error } = await supabase.from('ingredients').update(payload).in('id', ids).select('*');
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'delete_mother_materials') {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(safeTrim).filter(Boolean) : [];
      if (ids.length === 0) return res.status(400).json({ ok: false, error: '缺少母料 ID' });
      const deleteLinkedChildren = req.body?.deleteLinkedChildren === true;

      const { data: childRows, error: childCountError } = await supabase
        .from('products')
        .select('id,ingredient_id,product_type')
        .in('ingredient_id', ids)
        .eq('product_type', 'processed');
      if (childCountError) return res.status(400).json({ ok: false, error: childCountError.message });
      const childCount = (childRows || []).length;
      if (childCount > 0 && !deleteLinkedChildren) {
        return res.status(409).json({ ok: false, error: `母料下有 ${childCount} 筆子料，請確認是否一併刪除`, childCount });
      }
      if (childCount > 0 && deleteLinkedChildren) {
        const childIds = (childRows || []).map((r: any) => safeTrim(r.id)).filter(Boolean);
        const { error: childDeleteError } = await supabase.from('products').delete().in('id', childIds);
        if (childDeleteError) return res.status(400).json({ ok: false, error: childDeleteError.message });
      }

      const { error: unlinkByIngredientError } = await supabase
        .from('products')
        .update({ ingredient_id: null, parent_ingredient_id: null })
        .in('ingredient_id', ids);
      if (unlinkByIngredientError) return res.status(400).json({ ok: false, error: unlinkByIngredientError.message });

      const { error: unlinkByParentError } = await supabase
        .from('products')
        .update({ ingredient_id: null, parent_ingredient_id: null })
        .in('parent_ingredient_id', ids);
      if (unlinkByParentError) return res.status(400).json({ ok: false, error: unlinkByParentError.message });

      const { error: unlinkGroupError } = await supabase
        .from('product_groups')
        .update({ ingredient_id: null })
        .in('ingredient_id', ids);
      if (unlinkGroupError) return res.status(400).json({ ok: false, error: unlinkGroupError.message });

      const { data, error } = await supabase.from('ingredients').delete().in('id', ids).select('*');
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data, deletedChildCount: childCount });
    }

    if (action === 'assign_product_to_mother') {
      const productId = safeTrim(req.body?.productId);
      const ingredientId = safeTrim(req.body?.ingredientId);
      if (!productId) return res.status(400).json({ ok: false, error: '缺少產品 ID' });
      if (!ingredientId) return res.status(400).json({ ok: false, error: '請選擇母料' });

      const { data, error } = await supabase
        .from('products')
        .update({ ingredient_id: ingredientId, parent_ingredient_id: ingredientId })
        .eq('id', productId)
        .select('*')
        .single();
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'delete_child_product') {
      const productId = safeTrim(req.body?.productId);
      if (!productId) return res.status(400).json({ ok: false, error: '缺少下料 ID' });

      const { data: product, error: lookupError } = await supabase
        .from('products')
        .select('id,name,ingredient_id,parent_ingredient_id,processing_type_id,product_type')
        .eq('id', productId)
        .single();
      if (lookupError || !product) return res.status(404).json({ ok: false, error: lookupError?.message || '找不到下料' });
      if (!product.ingredient_id || !product.processing_type_id || product.product_type !== 'processed') {
        return res.status(400).json({ ok: false, error: '這不是商品樹下的下料，不能在此刪除' });
      }

      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data: product });
    }

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
