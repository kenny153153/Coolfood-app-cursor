
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MessageCircle, Search, Plus, Trash2, Save, Printer,
  RefreshCw, ChevronDown, Sparkles, User, Phone, MapPin,
  Calendar, FileText, Package, X, Check, Copy, Zap,
  ClipboardList, AlertTriangle,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import { buildPickingSlipHtml, getBusinessLabel } from './printUtils';
import type { PickingOrderData } from './printUtils';
import type { WholesaleBrand, WholesaleOrderLine } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface ClientOption {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  address: string;
  brand: WholesaleBrand;
  priceTier: string;
  routeId: string | null;
  clientCode: string;
}

interface ProductOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  unit: string;
  weight?: string;
  categories?: string[];
  saleChannel?: string;
  productType?: string;
  processingTypeName?: string;
  packSize?: string;
  ingredientId?: string;
  parentIngredientId?: string;
  groupId?: string;
  variantLabel?: string;
  pricingMode?: string;
}

interface ProductGroupOption {
  id: string;
  name: string;
  classification: string;
  ingredientId?: string;
  specs: ProductOption[];
}

interface ProcessingTypeOption {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  spec?: string;
  sortOrder: number;
}

interface ProcessingMatrixEntry {
  ingredientId: string;
  processingTypeId: string;
}

interface ClientPreference {
  ingredientId: string;
  processingTypeId: string;
  defaultSpec?: string;
  note?: string;
}

interface ParsedLine {
  productName: string;
  qty: number;
  unit: string;
  matched?: ProductOption;
  note?: string;
  processingCode?: string;
  processingSpec?: string;
}

const EMPTY_LINE: WholesaleOrderLine = {
  productId: undefined,
  productName: '',
  qty: 0,
  unit: '磅',
  unitPrice: 0,
  discount: 0,
  lineTotal: 0,
  processingTypeId: undefined,
  processingTypeName: undefined,
  processingSpec: undefined,
  lineNote: undefined,
};

const BASE_UNITS = ['磅', '斤', '件', '包', '盒', '箱', '碟', '隻', '條', '塊', '盤', '份', '打', 'kg', 'pc'];

const NewOrderPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand, availableWholesaleBrands, setWholesaleBrand } = useWorkspace();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp parse
  const [waMessage, setWaMessage] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);

  // Client selection
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);

  // Order form
  const [orderLines, setOrderLines] = useState<WholesaleOrderLine[]>([{ ...EMPTY_LINE }]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);

  // Product search per row
  const [activeProductRow, setActiveProductRow] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [specPickerRow, setSpecPickerRow] = useState<{ idx: number; group: ProductGroupOption } | null>(null);

  // Processing types & matrix
  const [processingTypes, setProcessingTypes] = useState<ProcessingTypeOption[]>([]);
  const [processingMatrix, setProcessingMatrix] = useState<ProcessingMatrixEntry[]>([]);
  const [clientPreferences, setClientPreferences] = useState<ClientPreference[]>([]);

  // Correction memory
  const [corrections, setCorrections] = useState<any[]>([]);
  const parsedSnapshotRef = useRef<WholesaleOrderLine[]>([]);

  // Last price lookup: key = productName → { price, qty, unit, date }
  const [lastPriceMap, setLastPriceMap] = useState<Record<string, { price: number; qty: number; unit: string; date: string }>>({});

  useEffect(() => {
    if (!selectedClient) { setLastPriceMap({}); return; }
    (async () => {
      const { data } = await supabase.from('orders')
        .select('line_items, order_date')
        .eq('customer_name', selectedClient.companyName)
        .eq('order_type', 'wholesale')
        .order('order_date', { ascending: false })
        .limit(10);
      if (!data) return;
      const map: Record<string, { price: number; qty: number; unit: string; date: string }> = {};
      for (const row of data as any[]) {
        for (const item of row.line_items || []) {
          if (!map[item.name]) {
            map[item.name] = { price: item.unit_price, qty: item.qty, unit: item.unit || '', date: row.order_date?.slice(0, 10) || '' };
          }
        }
      }
      setLastPriceMap(map);
    })();
  }, [selectedClient]);

  // Dynamic units (base + custom from site_config)
  const [customUnitLabels, setCustomUnitLabels] = useState<string[]>([]);
  const allUnits = useMemo(() => {
    const merged = [...BASE_UNITS];
    for (const u of customUnitLabels) {
      if (u && !merged.includes(u)) merged.push(u);
    }
    return merged;
  }, [customUnitLabels]);

  const [productGroupOptions, setProductGroupOptions] = useState<ProductGroupOption[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clientsRes, productsRes, correctionsRes, unitsRes, ptRes, matrixRes, groupsRes] = await Promise.all([
      supabase.from('wholesale_clients').select('id, company_name, contact_name, phone, address, brand, price_tier, route_id, client_code').eq('is_active', true),
      supabase.from('products').select('id, name, name_en, price, weight, categories, sale_channel, product_type, processing_type_id, pack_size, processing_types(name), ingredient_id, parent_ingredient_id, group_id, variant_label, pricing_mode').order('name'),
      supabase.from('parsing_corrections').select('original_text, corrected_product_name, corrected_qty, corrected_unit').order('created_at', { ascending: false }).limit(40),
      supabase.from('site_config').select('value').eq('id', 'custom_units').single(),
      supabase.from('processing_types').select('id, code, name, name_en, spec, sort_order').eq('is_active', true).order('sort_order'),
      supabase.from('material_processing_matrix').select('ingredient_id, processing_type_id').eq('is_available', true),
      supabase.from('product_groups').select('id, name, classification, ingredient_id').eq('is_active', true).order('name'),
    ]);
    if (clientsRes.data) {
      setClients(clientsRes.data.map((c: any) => ({
        id: c.id, companyName: c.company_name, contactName: c.contact_name || '',
        phone: c.phone || '', address: c.address || '', brand: c.brand,
        priceTier: c.price_tier || 'P0', routeId: c.route_id, clientCode: c.client_code || '',
      })));
    }
    const allProducts: ProductOption[] = [];
    if (productsRes.data) {
      const mapped = productsRes.data
        .filter((p: any) => {
          const ch = p.sale_channel || 'retail';
          return ch === 'wholesale' || ch === 'both';
        })
        .map((p: any) => ({
          id: p.id, name: p.name, nameEn: p.name_en || undefined,
          price: p.price, unit: '磅',
          weight: p.weight || undefined,
          categories: p.categories || [],
          saleChannel: p.sale_channel || 'retail',
          productType: p.product_type || 'standalone',
          processingTypeName: p.processing_types?.name || undefined,
          packSize: p.pack_size || undefined,
          ingredientId: p.ingredient_id || undefined,
          parentIngredientId: p.parent_ingredient_id || undefined,
          groupId: p.group_id || undefined,
          variantLabel: p.variant_label || undefined,
          pricingMode: p.pricing_mode || undefined,
        }));
      allProducts.push(...mapped);
      setProducts(mapped);
    }
    if (groupsRes.data && allProducts.length > 0) {
      const groups: ProductGroupOption[] = [];
      for (const g of groupsRes.data as any[]) {
        const specs = allProducts.filter(p => p.groupId === g.id);
        if (specs.length > 0) {
          groups.push({ id: g.id, name: g.name, classification: g.classification, ingredientId: g.ingredient_id || undefined, specs });
        }
      }
      const groupedIds = new Set(groups.flatMap(g => g.specs.map(s => s.id)));
      const ungrouped = allProducts.filter(p => !groupedIds.has(p.id));
      for (const p of ungrouped) {
        groups.push({ id: `_ug_${p.id}`, name: p.name, classification: 'raw_material', specs: [p] });
      }
      setProductGroupOptions(groups);
    }
    if (correctionsRes.data) {
      const seen = new Set<string>();
      const deduped = correctionsRes.data.filter((c: any) => {
        const key = c.original_text.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setCorrections(deduped.slice(0, 30));
    }
    if (unitsRes.data?.value && Array.isArray(unitsRes.data.value)) {
      setCustomUnitLabels(unitsRes.data.value.map((u: any) => u.label).filter(Boolean));
    }
    if (ptRes.data) {
      setProcessingTypes(ptRes.data.map((pt: any) => ({
        id: pt.id, code: pt.code, name: pt.name,
        nameEn: pt.name_en || undefined, spec: pt.spec || undefined,
        sortOrder: pt.sort_order,
      })));
    }
    if (matrixRes.data) {
      setProcessingMatrix(matrixRes.data.map((m: any) => ({
        ingredientId: m.ingredient_id,
        processingTypeId: m.processing_type_id,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Processing helpers ──────────────────────────────────────────

  const getIngredientId = useCallback((productId: string | undefined): string | undefined => {
    if (!productId) return undefined;
    const p = products.find(x => x.id === productId);
    return p?.parentIngredientId || p?.ingredientId;
  }, [products]);

  const getAvailableProcessing = useCallback((productId: string | undefined): ProcessingTypeOption[] => {
    const ingId = getIngredientId(productId);
    if (!ingId) return [];
    return processingMatrix
      .filter(m => m.ingredientId === ingId)
      .map(m => processingTypes.find(pt => pt.id === m.processingTypeId))
      .filter((pt): pt is ProcessingTypeOption => !!pt)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [getIngredientId, processingMatrix, processingTypes]);

  const getSpecOptions = useCallback((processingTypeId: string | undefined): string[] => {
    if (!processingTypeId) return [];
    const pt = processingTypes.find(p => p.id === processingTypeId);
    if (!pt?.spec) return [];
    return pt.spec.split(/\s*[/／]\s*/).map(s => s.trim()).filter(Boolean);
  }, [processingTypes]);

  const getClientPreference = useCallback((ingredientId: string | undefined): ClientPreference | undefined => {
    if (!ingredientId) return undefined;
    return clientPreferences.find(cp => cp.ingredientId === ingredientId);
  }, [clientPreferences]);

  const loadClientPreferences = useCallback(async (clientId: string) => {
    try {
      const { data } = await supabase.from('client_product_preferences')
        .select('ingredient_id, default_processing_type_id, default_spec, note')
        .eq('client_id', clientId);
      if (data) {
        setClientPreferences(data.map((d: any) => ({
          ingredientId: d.ingredient_id,
          processingTypeId: d.default_processing_type_id,
          defaultSpec: d.default_spec || undefined,
          note: d.note || undefined,
        })));
      }
    } catch {
      setClientPreferences([]);
    }
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientPreferences(selectedClient.id);
    } else {
      setClientPreferences([]);
    }
  }, [selectedClient, loadClientPreferences]);

  const formatProductDisplay = (line: WholesaleOrderLine): string => {
    let display = line.productName;
    if (line.processingTypeName && line.processingTypeName !== '原件') {
      display += ` 【${line.processingTypeName}${line.processingSpec ? ` ${line.processingSpec}` : ''}】`;
    }
    if (line.lineNote) {
      display += ` (${line.lineNote})`;
    }
    return display;
  };

  // ── WhatsApp parsing (AI-powered + regex fallback) ────────────

  const parseWhatsAppMessage = async () => {
    if (!waMessage.trim()) return;
    setIsParsing(true);

    let parsed: ParsedLine[] = [];

    try {
      parsed = await parseWithAI();
    } catch (err) {
      console.warn('[WhatsApp Parse] AI failed, falling back to regex:', err);
      parsed = parseWithRegex();
    }

    setParsedLines(parsed);

    if (parsed.length > 0) {
      const newLines: WholesaleOrderLine[] = parsed.map(p => {
        let ptId: string | undefined;
        let ptName: string | undefined;
        let pSpec: string | undefined;
        let lineNote: string | undefined = p.note || undefined;

        if (p.processingCode) {
          const pt = processingTypes.find(t => t.code === p.processingCode);
          if (pt) { ptId = pt.id; ptName = pt.name; }
        }
        if (p.processingSpec) pSpec = p.processingSpec;

        if (!ptId && p.matched?.id && selectedClient) {
          const ingId = getIngredientId(p.matched.id);
          const pref = getClientPreference(ingId);
          if (pref) {
            ptId = pref.processingTypeId;
            ptName = processingTypes.find(t => t.id === pref.processingTypeId)?.name;
            pSpec = pSpec || pref.defaultSpec;
            if (!lineNote && pref.note) lineNote = pref.note;
          }
        }

        return {
          productId: p.matched?.id,
          productName: p.matched?.name || p.productName,
          qty: p.qty,
          unit: p.unit,
          unitPrice: p.matched?.price || 0,
          discount: 0,
          lineTotal: p.qty * (p.matched?.price || 0),
          processingTypeId: ptId,
          processingTypeName: ptName,
          processingSpec: pSpec,
          lineNote,
        };
      });
      setOrderLines(newLines);
      parsedSnapshotRef.current = newLines.map(l => ({ ...l }));
    }

    // Try to auto-detect client from message
    if (!selectedClient) {
      const allText = waMessage.toLowerCase();
      const match = clients.filter(c => c.brand === wholesaleBrand).find(c =>
        allText.includes(c.companyName.toLowerCase()) ||
        allText.includes(c.phone)
      );
      if (match) setSelectedClient(match);
    }

    setIsParsing(false);
    showToast(`已解析 ${parsed.length} 項產品`);
  };

  const parseWithAI = async (): Promise<ParsedLine[]> => {
    const productPayload = products.map(p => ({
      id: p.id, name: p.name, nameEn: p.nameEn || undefined,
      price: p.price, weight: p.weight || undefined,
    }));

    const clientNames = clients
      .filter(c => c.brand === wholesaleBrand)
      .flatMap(c => [c.companyName, c.contactName].filter(Boolean));

    const extraUnits = allUnits.filter(u => !BASE_UNITS.includes(u));

    const ptPayload = processingTypes.map(pt => ({
      code: pt.code, name: pt.name, spec: pt.spec || undefined,
    }));

    const prefPayload = clientPreferences.length > 0
      ? clientPreferences.map(cp => {
          const pt = processingTypes.find(t => t.id === cp.processingTypeId);
          const prod = products.find(p => (p.parentIngredientId || p.ingredientId) === cp.ingredientId);
          return { ingredientName: prod?.name || cp.ingredientId, processingName: pt?.name || '', spec: cp.defaultSpec };
        })
      : undefined;

    const adminHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const session = JSON.parse(localStorage.getItem('coolfood_admin_session') || '{}');
      if (session?.id) { adminHeaders['x-admin-id'] = session.id; adminHeaders['x-admin-role'] = session.role || ''; }
    } catch { /* ignore */ }
    const resp = await fetch('/api/parse-whatsapp-order', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        message: waMessage,
        products: productPayload,
        clientNames,
        corrections: corrections.length > 0 ? corrections : undefined,
        extraUnits: extraUnits.length > 0 ? extraUnits : undefined,
        processingTypes: ptPayload.length > 0 ? ptPayload : undefined,
        clientPreferences: prefPayload,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.error || `API ${resp.status}`);
    }

    const { data } = await resp.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('AI returned empty result');
    }

    return data.map((item: any) => {
      const matchedProduct = item.productId
        ? products.find(p => p.id === item.productId)
        : undefined;
      return {
        productName: item.productName || item.originalText,
        qty: Number(item.qty) || 1,
        unit: item.unit || '磅',
        matched: matchedProduct
          ? { ...matchedProduct }
          : undefined,
        note: item.note || undefined,
        processingCode: item.processingCode || undefined,
        processingSpec: item.processingSpec || undefined,
      };
    });
  };

  const parseWithRegex = (): ParsedLine[] => {
    const cnNumMap: Record<string, string> = {
      '一': '1', '二': '2', '兩': '2', '三': '3', '四': '4', '五': '5',
      '六': '6', '七': '7', '八': '8', '九': '9', '十': '10', '半': '0.5',
    };
    const replaceCnNum = (s: string) =>
      s.replace(/[一二兩三四五六七八九十半]/g, m => cnNumMap[m] ?? m);

    const rawLines = waMessage.split('\n').filter(l => l.trim());
    const lines: string[] = [];
    for (const raw of rawLines) {
      lines.push(...raw.split(/[，,、]+/).map(s => s.trim()).filter(Boolean));
    }

    const parsed: ParsedLine[] = [];
    const unitRe = '磅|斤|件|包|盒|箱|碟|隻|條|塊|盤|份|打|kg|pc|lb';
    const nameQtyPattern = new RegExp(`^(.+?)\\s*[xX×]\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitRe})?`, 'i');
    const nameNumUnitPattern = new RegExp(`^(.+?)(\\d+(?:\\.\\d+)?)\\s*(${unitRe})`, 'i');
    const qtyNamePattern = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${unitRe})?\\s*(.+)`, 'i');

    for (const line of lines) {
      const trimmed = replaceCnNum(line.trim());
      if (!trimmed || /^(你好|hi|hello|ok|好|thanks|謝|thx|收到|明天|後天|唔該|盡量|\d{1,2}[月/]\d{1,2})/i.test(trimmed)) continue;

      let productName = '';
      let qty = 0;
      let unit = '磅';

      const m1 = trimmed.match(nameQtyPattern);
      const m4 = trimmed.match(nameNumUnitPattern);
      const m2 = trimmed.match(qtyNamePattern);

      if (m1) {
        productName = m1[1].trim();
        qty = parseFloat(m1[2]);
        unit = m1[3] || '磅';
      } else if (m4) {
        productName = m4[1].trim();
        qty = parseFloat(m4[2]);
        unit = m4[3] || '磅';
      } else if (m2 && m2[3]) {
        productName = m2[3].trim();
        qty = parseFloat(m2[1]);
        unit = m2[2] || '磅';
      } else {
        productName = trimmed;
        qty = 1;
      }

      if (productName) {
        const scored = products
          .map(p => ({ product: p, score: fuzzyScore(productName, p.name) }))
          .filter(s => s.score > 0.3)
          .sort((a, b) => b.score - a.score);

        const matched = scored[0]?.product;
        parsed.push({ productName, qty, unit, matched: matched || undefined });
      }
    }

    return parsed;
  };

  const fuzzyScore = (input: string, target: string): number => {
    const a = input.toLowerCase().replace(/[（(）)]/g, '');
    const b = target.toLowerCase().replace(/[（(）)]/g, '');
    if (a === b) return 1;
    if (b.includes(a)) return 0.85;
    if (a.includes(b)) return 0.8;
    const aChars = new Set(a);
    let hits = 0;
    for (const c of b) { if (aChars.has(c)) hits++; }
    return hits / Math.max(a.length, b.length);
  };

  const saveCorrection = async (
    originalText: string,
    correctedProductId: string | undefined,
    correctedProductName: string,
    correctedQty: number,
    correctedUnit: string,
  ) => {
    try {
      await supabase.from('parsing_corrections').insert({
        original_text: originalText,
        corrected_product_id: correctedProductId || null,
        corrected_product_name: correctedProductName,
        corrected_qty: correctedQty,
        corrected_unit: correctedUnit,
        brand: wholesaleBrand,
      });
      setCorrections(prev => {
        const next = [{ original_text: originalText, corrected_product_name: correctedProductName, corrected_qty: correctedQty, corrected_unit: correctedUnit }, ...prev];
        return next.slice(0, 30);
      });
    } catch (e) {
      console.warn('[Correction] Failed to save:', e);
    }
  };

  const applyParsedLines = () => {
    if (parsedLines.length === 0) return;
    const newLines: WholesaleOrderLine[] = parsedLines.map(p => {
      let ptId: string | undefined;
      let ptName: string | undefined;
      let pSpec: string | undefined;
      if (p.processingCode) {
        const pt = processingTypes.find(t => t.code === p.processingCode);
        if (pt) { ptId = pt.id; ptName = pt.name; }
      }
      if (p.processingSpec) pSpec = p.processingSpec;
      return {
        productId: p.matched?.id,
        productName: p.matched?.name || p.productName,
        qty: p.qty,
        unit: p.unit,
        unitPrice: p.matched?.price || 0,
        discount: 0,
        lineTotal: p.qty * (p.matched?.price || 0),
        processingTypeId: ptId,
        processingTypeName: ptName,
        processingSpec: pSpec,
        lineNote: p.note || undefined,
      };
    });
    setOrderLines(newLines);
  };

  // ── Line item operations ──────────────────────────────────────

  const correctionTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const updateLine = (idx: number, field: keyof WholesaleOrderLine, value: any) => {
    setOrderLines(prev => {
      const next = [...prev];
      const line = { ...next[idx], [field]: value };
      if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
        if (line.pricingMode === 'by_piece' && line.actualWeight && line.actualWeight > 0) {
          line.lineTotal = line.actualWeight * line.unitPrice * (1 - line.discount / 100);
        } else {
          line.lineTotal = line.qty * line.unitPrice * (1 - line.discount / 100);
        }
      }
      next[idx] = line;

      // Auto-save correction when user changes qty/unit on an AI-parsed line (debounced)
      const snapshot = parsedSnapshotRef.current[idx];
      if (snapshot?.productName && (field === 'qty' || field === 'unit')) {
        if (correctionTimeoutRef.current[idx]) clearTimeout(correctionTimeoutRef.current[idx]);
        correctionTimeoutRef.current[idx] = setTimeout(() => {
          const original = parsedLines[idx]?.productName || snapshot.productName;
          const finalLine = { ...line };
          if (finalLine.qty !== snapshot.qty || finalLine.unit !== snapshot.unit) {
            saveCorrection(original, finalLine.productId, finalLine.productName, finalLine.qty, finalLine.unit);
          }
        }, 1500);
      }

      return next;
    });
  };

  const selectProductGroup = (idx: number, group: ProductGroupOption) => {
    if (group.specs.length === 1) {
      selectSpec(idx, group, group.specs[0]);
    } else {
      setSpecPickerRow({ idx, group });
      setActiveProductRow(null);
      setProductSearch('');
    }
  };

  const selectSpec = (idx: number, group: ProductGroupOption, spec: ProductOption) => {
    const snapshot = parsedSnapshotRef.current[idx];
    const wasAIParsed = snapshot && snapshot.productName;
    const isDifferentProduct = wasAIParsed && snapshot.productName !== spec.name;

    const ingId = spec.parentIngredientId || spec.ingredientId;
    const pref = ingId ? getClientPreference(ingId) : undefined;
    const isByPiece = spec.pricingMode === 'by_piece';

    setOrderLines(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        productId: spec.id,
        productName: `${group.name} ${spec.variantLabel || ''}`.trim(),
        groupId: group.id,
        groupName: group.name,
        specId: spec.id,
        unitPrice: spec.price,
        pricingMode: (spec.pricingMode || 'fixed_pack') as any,
        unit: isByPiece ? '磅' : (next[idx].unit || '磅'),
        lineTotal: isByPiece ? 0 : next[idx].qty * spec.price * (1 - next[idx].discount / 100),
        processingTypeId: pref?.processingTypeId || undefined,
        processingTypeName: pref?.processingTypeId ? processingTypes.find(t => t.id === pref.processingTypeId)?.name : undefined,
        processingSpec: pref?.defaultSpec,
        lineNote: pref?.note,
      };
      return next;
    });
    setSpecPickerRow(null);
    setActiveProductRow(null);
    setProductSearch('');

    if (isDifferentProduct) {
      const original = parsedLines[idx]?.productName || snapshot.productName;
      saveCorrection(original, spec.id, spec.name, snapshot.qty, snapshot.unit);
    }
  };

  const selectProduct = (idx: number, product: ProductOption) => {
    const group = productGroupOptions.find(g => g.specs.some(s => s.id === product.id));
    if (group) {
      selectSpec(idx, group, product);
    } else {
      setOrderLines(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], productId: product.id, productName: product.name, unitPrice: product.price, lineTotal: next[idx].qty * product.price * (1 - next[idx].discount / 100) };
        return next;
      });
      setActiveProductRow(null);
      setProductSearch('');
    }
  };

  const addLine = () => setOrderLines(prev => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (idx: number) => setOrderLines(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const subtotal = orderLines.reduce((s, l) => s + l.lineTotal, 0);

  // ── Save order ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedClient) { showToast('請選擇客戶', 'error'); return; }
    if (orderLines.every(l => !l.productName)) { showToast('請添加至少一項產品', 'error'); return; }

    setSaving(true);
    const lineItems = orderLines
      .filter(l => l.productName)
      .map(l => ({
        product_id: l.productId || '',
        name: l.productName,
        unit_price: l.unitPrice,
        qty: l.qty,
        line_total: l.lineTotal,
        unit: l.unit || undefined,
        processing_type_id: l.processingTypeId || undefined,
        processing_type_name: l.processingTypeName || undefined,
        processing_spec: l.processingSpec || undefined,
        line_note: l.lineNote || undefined,
        pricing_mode: l.pricingMode || undefined,
        actual_weight_lb: l.actualWeight || undefined,
      }));

    const payload = {
      id: Date.now(),
      customer_name: selectedClient.companyName,
      customer_phone: selectedClient.phone,
      total: subtotal,
      subtotal: subtotal,
      status: 'paid',
      order_date: new Date().toISOString(),
      items_count: lineItems.length,
      line_items: lineItems,
      delivery_date: deliveryDate,
      delivery_address: selectedClient.address,
      order_type: 'wholesale',
      wholesale_brand: wholesaleBrand,
      wholesale_client_id: selectedClient.id,
      route_id: selectedClient.routeId,
      client_code: selectedClient.clientCode || null,
      payment_method: 'credit',
    };

    const { data, error } = await supabase.from('orders').insert(payload).select('id').single();
    if (error) {
      showToast(`儲存失敗：${error.message}`, 'error');
      setSaving(false);
      return;
    }

    // Auto-create accounts receivable entry
    await supabase.from('accounts_receivable').insert({
      client_id: selectedClient.id,
      client_name: selectedClient.companyName,
      brand: wholesaleBrand,
      order_id: data.id?.toString(),
      invoice_date: new Date().toISOString().slice(0, 10),
      amount: subtotal,
      paid_amount: 0,
      status: 'pending',
      credit_terms: 'cod',
    });

    // Auto-save client product preferences for lines with processing info
    if (selectedClient) {
      const prefsToSave = orderLines
        .filter(l => l.productId && l.processingTypeId)
        .map(l => {
          const ingId = getIngredientId(l.productId);
          return ingId ? {
            client_id: selectedClient.id,
            ingredient_id: ingId,
            default_processing_type_id: l.processingTypeId,
            default_spec: l.processingSpec || null,
            note: l.lineNote || null,
            last_ordered_at: new Date().toISOString(),
          } : null;
        })
        .filter(Boolean);
      if (prefsToSave.length > 0) {
        try {
          await supabase.from('client_product_preferences')
            .upsert(prefsToSave, { onConflict: 'client_id,ingredient_id,default_processing_type_id' });
        } catch { /* table may not exist yet */ }
      }
    }

    setSavedOrderId(data.id?.toString() || null);
    setSaving(false);
    showToast('訂單已儲存');
  };

  const handlePrint = (type: 'tricolor' | 'picking' | 'delivery') => {
    const titles: Record<string, string> = {
      tricolor: '三色單',
      picking: '執貨紙',
      delivery: '送貨單',
    };
    showToast(`正在生成 ${titles[type]}...`);
    // Print generation would trigger browser print dialog with formatted content
    setTimeout(() => {
      const printContent = generatePrintHtml(type);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }, 300);
  };

  const generatePrintHtml = (type: string) => {
    const validLines = orderLines.filter(l => l.productName);
    const today = new Date().toLocaleDateString('zh-TW');
    const orderId = savedOrderId || '—';
    const clientName = selectedClient?.companyName || '—';
    const clientPhone = selectedClient?.phone || '—';
    const clientAddr = selectedClient?.address || '—';
    const clientCode = selectedClient?.clientCode || '';

    if (type === 'picking') {
      return generatePickingHtml(validLines);
    }

    if (wholesaleBrand === 'GHFOODS') {
      return generateGHFoodsPrintHtml(type, validLines, today, orderId, clientName, clientPhone, clientAddr, clientCode);
    }
    return generateCoolfoodPrintHtml(type, validLines, today, orderId, clientName, clientPhone, clientAddr, clientCode);
  };

  const generatePickingHtml = (validLines: WholesaleOrderLine[]) => {
    const now = new Date();
    const orderData: PickingOrderData = {
      orderId: savedOrderId || '—',
      customerName: selectedClient?.companyName || '—',
      clientCode: selectedClient?.clientCode || '',
      deliveryDate: deliveryDate,
      businessLabel: getBusinessLabel('wholesale', wholesaleBrand),
      timestamp: `${now.toLocaleDateString('zh-TW')} ${now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`,
      items: validLines.map(l => ({
        productName: l.productName,
        qty: l.qty,
        unit: l.unit,
        processingType: l.processingTypeName,
        processingSpec: l.processingSpec,
        lineNote: l.lineNote,
      })),
      orderNotes: orderNotes || undefined,
    };
    return buildPickingSlipHtml([orderData]);
  };

  const generateGHFoodsPrintHtml = (
    type: string, validLines: WholesaleOrderLine[], today: string,
    orderId: string, clientName: string, clientPhone: string, clientAddr: string, clientCode: string,
  ) => {
    const isDelivery = type === 'delivery';
    const totalAmount = validLines.reduce((s, l) => s + l.lineTotal, 0);
    const totalPkgs = validLines.length;
    const displayName = clientCode ? `(${clientCode})${clientName}` : clientName;

    const ROW_TOP = 54;
    const ROW_H = 7.2;

    const itemRows = validLines.map((l, i) => {
      const y = ROW_TOP + i * ROW_H;
      const procTag = l.processingTypeName && l.processingTypeName !== '原件'
        ? ` 【${l.processingTypeName}${l.processingSpec ? ' ' + l.processingSpec : ''}】`
        : '';
      const noteTag = l.lineNote ? ` (${l.lineNote})` : '';
      return `
        <span class="f" style="top:${y}mm;left:7mm;width:12mm;text-align:center">${i + 1}</span>
        <span class="f" style="top:${y}mm;left:52mm;width:85mm">${l.productName}${procTag}${noteTag}</span>
        <span class="f" style="top:${y}mm;left:150mm;width:22mm;text-align:right">${l.qty}${l.unit}</span>
        ${!isDelivery ? `
        <span class="f" style="top:${y}mm;left:175mm;width:28mm;text-align:right">${l.unitPrice.toFixed(2)} / ${l.unit}</span>
        <span class="f" style="top:${y}mm;left:208mm;width:28mm;text-align:right">${l.lineTotal.toFixed(2)}</span>
        ` : ''}`;
    }).join('');

    const pkgsY = ROW_TOP + Math.max(validLines.length, 7) * ROW_H + 2;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>進興 三色紙</title>
<style>
  @page { size: 241mm 140mm; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:'Courier New','NSimSun',monospace;
    font-size:11px;
    width:241mm;height:140mm;
    position:relative;
    color:#000;
    background:transparent;
  }
  .f{position:absolute;white-space:nowrap;overflow:hidden}
  @media print{
    body{margin:0;padding:0;width:241mm;height:140mm;background:transparent}
  }
</style></head><body>

  <!-- ===== Customer info (left column) ===== -->
  <span class="f" style="top:22mm;left:48mm;width:100mm;font-size:12px">${displayName}</span>
  <span class="f" style="top:28mm;left:22mm;width:130mm;font-size:10px">${clientAddr}</span>
  <span class="f" style="top:38mm;left:32mm;width:60mm;font-size:10px">${clientPhone}</span>

  <!-- ===== Invoice info (right column) ===== -->
  <span class="f" style="top:18mm;left:152mm;width:85mm;font-size:9px;text-align:right">${today}</span>
  <span class="f" style="top:22mm;left:195mm;width:42mm;font-size:11px;text-align:right">${orderId}</span>
  <span class="f" style="top:28mm;left:195mm;width:42mm;font-size:10px;text-align:right">${deliveryDate}</span>
  <span class="f" style="top:38mm;left:210mm;width:28mm;font-size:10px;text-align:right">C.O.D</span>

  <!-- ===== Item rows (variable data only, no headers/borders) ===== -->
  ${itemRows}

  <!-- ===== Totals ===== -->
  <span class="f" style="top:${pkgsY}mm;left:135mm;width:30mm;text-align:center;font-size:11px;font-weight:bold">共${totalPkgs}項</span>
  ${!isDelivery ? `<span class="f" style="top:${pkgsY + 8}mm;left:200mm;width:38mm;text-align:right;font-size:13px;font-weight:bold">${totalAmount.toFixed(2)}</span>` : ''}

  <!-- ===== Remarks ===== -->
  ${orderNotes ? `<span class="f" style="top:${pkgsY + 8}mm;left:10mm;width:130mm;font-size:9px">${orderNotes}</span>` : ''}

</body></html>`;
  };

  const generateCoolfoodPrintHtml = (
    type: string, validLines: WholesaleOrderLine[], today: string,
    orderId: string, clientName: string, clientPhone: string, clientAddr: string, clientCode: string,
  ) => {
    const isDelivery = type === 'delivery';
    const totalAmount = validLines.reduce((s, l) => s + l.lineTotal, 0);
    const emptyRows = Math.max(0, 10 - validLines.length);

    const copies = isDelivery
      ? [{ label: '送貨單（司機用）', sublabel: 'DELIVERY NOTE', showPrice: false }]
      : [
          { label: '正本 ORIGINAL', sublabel: '客戶存根', showPrice: true },
          { label: '副本 COMPANY COPY', sublabel: '公司存根', showPrice: true },
        ];

    const pages = copies.map((copy, pageIdx) => `
<div class="page ${pageIdx > 0 ? 'page-break' : ''}">
  <div class="header">
    <div class="brand-block">
      <div class="brand-name">Coolfood</div>
      <div class="brand-sub">批發部 Wholesale Division</div>
    </div>
    <div class="copy-label">${copy.label}</div>
  </div>

  <div class="info-section">
    <div class="info-left">
      <div class="info-row"><span class="lbl">客戶</span><span class="val">${clientCode ? `(${clientCode}) ` : ''}${clientName}</span></div>
      <div class="info-row"><span class="lbl">電話</span><span class="val">${clientPhone}</span></div>
      <div class="info-row"><span class="lbl">地址</span><span class="val">${clientAddr}</span></div>
    </div>
    <div class="info-right">
      <div class="info-row"><span class="lbl">單號</span><span class="val">#${orderId}</span></div>
      <div class="info-row"><span class="lbl">日期</span><span class="val">${today}</span></div>
      <div class="info-row"><span class="lbl">送貨日</span><span class="val">${deliveryDate}</span></div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="width:30px">#</th>
      <th>品名</th>
      <th style="width:50px">數量</th>
      <th style="width:45px">單位</th>
      ${copy.showPrice ? '<th style="width:65px">單價 ($)</th><th style="width:70px">金額 ($)</th>' : ''}
    </tr></thead>
    <tbody>
    ${validLines.map((l, i) => {
      const procTag = l.processingTypeName && l.processingTypeName !== '原件'
        ? ` <span style="color:#7c3aed;font-weight:700">【${l.processingTypeName}${l.processingSpec ? ' ' + l.processingSpec : ''}】</span>`
        : '';
      const noteTag = l.lineNote ? ` <span style="color:#666;font-size:9px">(${l.lineNote})</span>` : '';
      return `<tr>
      <td class="ctr">${i + 1}</td>
      <td>${l.productName}${procTag}${noteTag}</td>
      <td class="num">${l.qty}</td>
      <td class="ctr">${l.unit}</td>
      ${copy.showPrice ? `<td class="num">${l.unitPrice.toFixed(2)}</td><td class="num">${l.lineTotal.toFixed(2)}</td>` : ''}
    </tr>`;}).join('')}
    ${Array(emptyRows).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td>' + (copy.showPrice ? '<td></td><td></td>' : '') + '</tr>').join('')}
    </tbody>
  </table>

  ${copy.showPrice ? `<div class="total-bar"><span>合計 Total</span><span class="total-amount">$${totalAmount.toFixed(2)}</span></div>` : ''}
  ${orderNotes ? `<p class="notes"><strong>備註:</strong> ${orderNotes}</p>` : ''}

  <div class="footer-sig">
    <div class="sig-box"><div class="sig-label">客戶簽收</div><div class="sig-line"></div></div>
    <div class="sig-box"><div class="sig-label">送貨員</div><div class="sig-line"></div></div>
    <div class="sig-box"><div class="sig-label">日期</div><div class="sig-line"></div></div>
  </div>

  ${copy.label.includes('副本') ? '<div class="copy-notice">* 此副本經客戶簽收後由司機帶回公司存檔</div>' : ''}
</div>`).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Coolfood 批發</title>
<style>
  @page { size: A5 portrait; margin: 5mm; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a2e;line-height:1.35}
  .page{width:148mm;min-height:200mm;padding:5mm;position:relative;page-break-after:always}
  .page:last-child{page-break-after:auto}
  .page-break{page-break-before:always}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:3mm;margin-bottom:3mm;border-bottom:2px solid #0ea5e9}
  .brand-name{font-size:22px;font-weight:900;color:#0ea5e9;letter-spacing:0.5px}
  .brand-sub{font-size:9px;color:#64748b;font-weight:600}
  .copy-label{font-size:11px;font-weight:800;color:#fff;background:#0ea5e9;padding:3px 12px;border-radius:4px;align-self:center}
  .info-section{display:flex;gap:4mm;margin-bottom:3mm;padding:2mm;background:#f8fafc;border-radius:4px;border:1px solid #e2e8f0}
  .info-left{flex:1.2}.info-right{flex:0.8}
  .info-row{display:flex;gap:4px;padding:1px 0;font-size:10px}
  .info-row .lbl{color:#64748b;font-weight:700;min-width:36px}
  .info-row .val{color:#1a1a2e;font-weight:600}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th{background:#0ea5e9;color:#fff;font-weight:700;padding:3px 4px;text-align:center;font-size:9px;text-transform:uppercase;letter-spacing:0.5px}
  td{border:1px solid #cbd5e1;padding:2.5px 4px}
  td.num{text-align:right;font-variant-numeric:tabular-nums}
  td.ctr{text-align:center}
  tbody tr:nth-child(even){background:#f8fafc}
  .total-bar{display:flex;justify-content:space-between;align-items:center;margin-top:2mm;padding:3px 8px;background:#0ea5e9;color:#fff;border-radius:4px;font-weight:800;font-size:13px}
  .total-amount{font-size:15px}
  .notes{margin-top:2mm;font-size:9px;color:#475569;padding:2mm;background:#fffbeb;border:1px solid #fde68a;border-radius:3px}
  .footer-sig{display:flex;justify-content:space-between;margin-top:4mm;gap:3mm}
  .sig-box{flex:1;text-align:center}
  .sig-label{font-size:8px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8mm}
  .sig-line{border-top:1px solid #cbd5e1;margin-top:1mm}
  .copy-notice{text-align:center;font-size:8px;color:#94a3b8;font-style:italic;margin-top:2mm}
  @media print{
    body{margin:0;padding:0}
    .page{width:148mm;padding:5mm}
    th{background:#0ea5e9 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    tbody tr:nth-child(even){background:#f8fafc !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .total-bar{background:#0ea5e9 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .copy-label{background:#0ea5e9 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style></head><body>
${pages}
</body></html>`;
  };

  const resetForm = () => {
    setSelectedClient(null);
    setClientSearch('');
    setOrderLines([{ ...EMPTY_LINE }]);
    setOrderNotes('');
    setWaMessage('');
    setParsedLines([]);
    setSavedOrderId(null);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDeliveryDate(d.toISOString().slice(0, 10));
  };

  const filteredClients = clients
    .filter(c => c.brand === wholesaleBrand)
    .filter(c => {
      if (!clientSearch) return true;
      const q = clientSearch.toLowerCase();
      return c.companyName.toLowerCase().includes(q) ||
        c.phone.includes(clientSearch) ||
        c.contactName.toLowerCase().includes(q) ||
        c.clientCode.toLowerCase().includes(q);
    });

  const filteredProductGroups = productGroupOptions.filter(g =>
    !productSearch || g.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    g.specs.some(s => s.name.toLowerCase().includes(productSearch.toLowerCase()) || (s.variantLabel || '').toLowerCase().includes(productSearch.toLowerCase()))
  ).slice(0, 10);

  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Already saved → show print options ────────────────────────
  if (savedOrderId) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <Check size={36} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">訂單已儲存</h2>
            <p className="text-sm text-slate-400 font-bold mt-1">
              單號 #{savedOrderId} · {selectedClient?.companyName} · {WHOLESALE_BRAND_META[wholesaleBrand].label}
            </p>
          </div>

          <div className={`grid ${wholesaleBrand === 'GHFOODS' ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
            <button
              onClick={() => handlePrint('tricolor')}
              className="flex flex-col items-center gap-2 p-5 bg-rose-50 border border-rose-200 rounded-2xl hover:bg-rose-100 transition-colors"
            >
              <Printer size={24} className="text-rose-500" />
              <span className="text-xs font-black text-rose-600">{wholesaleBrand === 'GHFOODS' ? '三色紙' : '正本 / 副本'}</span>
            </button>
            <button
              onClick={() => handlePrint('picking')}
              className="flex flex-col items-center gap-2 p-5 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors"
            >
              <ClipboardList size={24} className="text-amber-500" />
              <span className="text-xs font-black text-amber-600">執貨紙</span>
            </button>
            {wholesaleBrand !== 'GHFOODS' && (
              <button
                onClick={() => handlePrint('delivery')}
                className="flex flex-col items-center gap-2 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors"
              >
                <FileText size={24} className="text-emerald-500" />
                <span className="text-xs font-black text-emerald-600">送貨單</span>
              </button>
            )}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700"
            >
              <Plus size={16} /> 繼續下一張訂單
            </button>
            <button
              onClick={() => {
                handlePrint('tricolor');
                handlePrint('picking');
                if (wholesaleBrand !== 'GHFOODS') handlePrint('delivery');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800"
            >
              <Printer size={16} /> 全部列印
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Brand selector */}
      {availableWholesaleBrands.length > 1 && (
        <div className="flex items-center gap-2">
          {availableWholesaleBrands.map(brand => {
            const meta = WHOLESALE_BRAND_META[brand];
            const isActive = wholesaleBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => { setWholesaleBrand(brand); setSelectedClient(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  isActive
                    ? `${meta.colorClasses.accent} ${meta.colorClasses.text} ${meta.colorClasses.border} border shadow-sm`
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{meta.icon}</span> {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: WhatsApp paste area ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <MessageCircle size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">WhatsApp 智能解析</h3>
                <p className="text-[10px] text-slate-400 font-bold">貼上客人訊息，一鍵自動填單</p>
              </div>
            </div>

            <textarea
              value={waMessage}
              onChange={e => setWaMessage(e.target.value)}
              placeholder="貼上 WhatsApp 對話內容...&#10;例：&#10;肥牛 x5磅&#10;豬扒 3件&#10;雞翼 10磅"
              className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={parseWhatsAppMessage}
                disabled={!waMessage.trim() || isParsing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {isParsing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isParsing ? 'AI 解析中...' : 'AI 智能解析'}
              </button>
              <button
                onClick={() => { setWaMessage(''); setParsedLines([]); }}
                className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-black hover:bg-slate-200"
              >
                清除
              </button>
            </div>

            {/* Parsed results preview */}
            {parsedLines.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  解析結果 · {parsedLines.length} 項
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {parsedLines.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-bold">
                      {p.matched ? (
                        <Check size={12} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                      )}
                      <span className="truncate flex-1">
                        {p.productName}
                        {p.processingCode && <span className="text-violet-500 font-bold ml-1">【{p.processingCode}{p.processingSpec ? ` ${p.processingSpec}` : ''}】</span>}
                        {p.note && <span className="text-slate-400 font-normal ml-1">({p.note})</span>}
                      </span>
                      <span className="text-slate-400">{p.qty} {p.unit}</span>
                      {p.matched && <span className="text-emerald-500 text-[10px]">→ {p.matched.name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Client info card (shown when selected) */}
          {selectedClient && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-900">客戶資料</h4>
                <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-600"><User size={12} className="text-slate-400" /> {selectedClient.companyName}</div>
                <div className="flex items-center gap-1.5 text-slate-600"><Phone size={12} className="text-slate-400" /> {selectedClient.phone}</div>
                <div className="flex items-center gap-1.5 text-slate-600 col-span-2"><MapPin size={12} className="text-slate-400" /> {selectedClient.address || '—'}</div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${WHOLESALE_BRAND_META[selectedClient.brand].colorClasses.accent} ${WHOLESALE_BRAND_META[selectedClient.brand].colorClasses.text}`}>
                  {WHOLESALE_BRAND_META[selectedClient.brand].label}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-600">{selectedClient.priceTier}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order form ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Client selector + date */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client search */}
              <div ref={clientRef} className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">客戶 *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={selectedClient ? selectedClient.companyName : clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); setShowClientDropdown(true); }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="搜尋客戶名稱 / 電話..."
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
                {showClientDropdown && !selectedClient && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-slate-400 font-bold text-center">找不到符合的客戶</p>
                    ) : (
                      filteredClients.slice(0, 8).map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedClient(c); setShowClientDropdown(false); setClientSearch(''); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{c.clientCode ? `(${c.clientCode}) ` : ''}{c.companyName}</p>
                            <p className="text-[10px] text-slate-400">{c.phone} · {c.priceTier}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${WHOLESALE_BRAND_META[c.brand].colorClasses.accent} ${WHOLESALE_BRAND_META[c.brand].colorClasses.text}`}>
                            {WHOLESALE_BRAND_META[c.brand].label}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Delivery date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">送貨日期 *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order lines table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                <h3 className="font-black text-sm text-slate-900">訂單明細</h3>
                <span className="text-[10px] font-bold text-slate-400">{orderLines.filter(l => l.productName).length} 項</span>
              </div>
              <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black hover:bg-slate-200">
                <Plus size={12} /> 添加行
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-2.5 text-left w-8">#</th>
                    <th className="px-3 py-2.5 text-left">產品名稱</th>
                    <th className="px-3 py-2.5 text-center w-24">數量</th>
                    <th className="px-3 py-2.5 text-center w-20">單位</th>
                    <th className="px-3 py-2.5 text-center w-28">單價 ($)</th>
                    <th className="px-3 py-2.5 text-center w-20">折扣%</th>
                    <th className="px-3 py-2.5 text-right w-28">小計</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.map((line, idx) => {
                    const availProc = getAvailableProcessing(line.productId);
                    const specOpts = getSpecOptions(line.processingTypeId);
                    const showProcessingRow = line.productId && (availProc.length > 0 || line.processingTypeId || line.lineNote);
                    return (
                    <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-slate-400 font-bold align-top pt-3">{idx + 1}</td>
                      <td className="px-3 py-2 relative">
                        <input
                          value={line.productName}
                          onChange={e => { updateLine(idx, 'productName', e.target.value); setProductSearch(e.target.value); setActiveProductRow(idx); }}
                          onFocus={() => { setActiveProductRow(idx); setProductSearch(line.productName); }}
                          onBlur={() => setTimeout(() => setActiveProductRow(null), 200)}
                          placeholder="輸入或搜尋產品..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none focus:border-blue-300"
                        />
                        {line.productName && lastPriceMap[line.productName] && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-bold"
                            title={`上次 ${lastPriceMap[line.productName].date}: ${lastPriceMap[line.productName].qty}${lastPriceMap[line.productName].unit} @ $${lastPriceMap[line.productName].price}`}>
                            上次 ${lastPriceMap[line.productName].price}/{lastPriceMap[line.productName].unit} ({lastPriceMap[line.productName].date})
                          </span>
                        )}
                        {activeProductRow === idx && productSearch && !specPickerRow && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                            {filteredProductGroups.map(g => (
                              <button
                                key={g.id}
                                onMouseDown={() => selectProductGroup(idx, g)}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left gap-2 border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-bold text-slate-700 truncate">{g.name}</span>
                                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-violet-50 text-violet-500 rounded text-[9px] font-bold">{g.specs.length} 款</span>
                                </div>
                                <ChevronDown size={12} className="text-slate-300 flex-shrink-0" />
                              </button>
                            ))}
                            {filteredProductGroups.length === 0 && (
                              <div className="px-4 py-3 text-center text-slate-300 text-xs font-bold">找不到產品</div>
                            )}
                          </div>
                        )}
                        {specPickerRow && specPickerRow.idx === idx && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-violet-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                            <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                              <span className="text-[10px] font-black text-violet-700">{specPickerRow.group.name} — 選擇規格</span>
                              <button onMouseDown={() => { setSpecPickerRow(null); setActiveProductRow(idx); }} className="text-[9px] text-violet-500 font-bold hover:underline">← 返回</button>
                            </div>
                            {specPickerRow.group.specs.map(spec => (
                              <button
                                key={spec.id}
                                onMouseDown={() => selectSpec(idx, specPickerRow.group, spec)}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-violet-50/50 text-left gap-2 border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-bold text-slate-700">{spec.variantLabel || spec.name}</span>
                                  {spec.pricingMode === 'by_piece' && <span className="px-1 py-0.5 bg-pink-50 text-pink-600 rounded text-[8px] font-black">抄碼</span>}
                                  {spec.pricingMode !== 'by_piece' && <span className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold">定裝</span>}
                                </div>
                                <span className="text-xs text-slate-400 flex-shrink-0">${spec.price}{spec.pricingMode === 'by_piece' ? '/磅' : ''}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {showProcessingRow && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {availProc.length > 0 && (
                              <select
                                value={line.processingTypeId || ''}
                                onChange={e => {
                                  const ptId = e.target.value || undefined;
                                  const pt = ptId ? processingTypes.find(t => t.id === ptId) : undefined;
                                  setOrderLines(prev => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], processingTypeId: ptId, processingTypeName: pt?.name, processingSpec: undefined };
                                    return next;
                                  });
                                }}
                                className="px-2 py-1 bg-violet-50 border border-violet-200 rounded-md text-[10px] font-bold text-violet-700 outline-none focus:border-violet-400 cursor-pointer"
                              >
                                <option value="">原件（不加工）</option>
                                {availProc.map(pt => (
                                  <option key={pt.id} value={pt.id}>{pt.name}{pt.nameEn ? ` ${pt.nameEn}` : ''}</option>
                                ))}
                              </select>
                            )}
                            {specOpts.length > 0 && (
                              <select
                                value={line.processingSpec || ''}
                                onChange={e => updateLine(idx, 'processingSpec', e.target.value || undefined)}
                                className="px-2 py-1 bg-amber-50 border border-amber-200 rounded-md text-[10px] font-bold text-amber-700 outline-none focus:border-amber-400 cursor-pointer"
                              >
                                <option value="">規格...</option>
                                {specOpts.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            )}
                            <input
                              value={line.lineNote || ''}
                              onChange={e => updateLine(idx, 'lineNote', e.target.value || undefined)}
                              placeholder="備註..."
                              className="flex-1 min-w-[60px] px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold outline-none focus:border-blue-300 placeholder:text-slate-300"
                            />
                          </div>
                        )}
                        {line.pricingMode === 'by_piece' && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-bold text-pink-500">🏷️ 抄碼 ${line.unitPrice}/磅</span>
                            <span className="text-[9px] text-slate-400">實際重量:</span>
                            <input
                              type="number"
                              value={line.actualWeight || ''}
                              onChange={e => {
                                const w = parseFloat(e.target.value) || 0;
                                setOrderLines(prev => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], actualWeight: w || undefined, lineTotal: w > 0 ? w * next[idx].unitPrice * (1 - next[idx].discount / 100) : 0 };
                                  return next;
                                });
                              }}
                              placeholder="待秤..."
                              className="w-20 px-2 py-1 bg-pink-50 border border-pink-200 rounded-md text-[10px] font-bold text-pink-700 outline-none focus:border-pink-400 placeholder:text-pink-300"
                              min="0"
                              step="0.1"
                            />
                            <span className="text-[9px] text-slate-400">磅</span>
                            {line.actualWeight && line.actualWeight > 0 && (
                              <span className="text-[10px] font-black text-emerald-600">= ${(line.actualWeight * line.unitPrice).toFixed(1)}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top pt-3">
                        <input
                          type="number"
                          value={line.qty || ''}
                          onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td className="px-3 py-2 align-top pt-3">
                        <select
                          value={line.unit}
                          onChange={e => updateLine(idx, 'unit', e.target.value)}
                          className="w-full px-1 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none"
                        >
                          {allUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top pt-3">
                        <input
                          type="number"
                          value={line.unitPrice || ''}
                          onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-3 py-2 align-top pt-3">
                        <input
                          type="number"
                          value={line.discount || ''}
                          onChange={e => updateLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-black align-top pt-3">
                        {line.pricingMode === 'by_piece' && !line.actualWeight ? (
                          <span className="text-amber-500 text-xs">待秤</span>
                        ) : (
                          <span className="text-slate-800">${line.lineTotal.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top pt-3">
                        <button onClick={() => removeLine(idx)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <textarea
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="訂單備註（可選）"
                    className="w-64 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold resize-none h-16 outline-none focus:border-blue-300"
                  />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-slate-400 font-bold">
                    {orderLines.filter(l => l.productName).length} 項產品
                  </p>
                  <p className="text-2xl font-black text-slate-900">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-slate-200 bg-white text-slate-500 rounded-xl text-sm font-black hover:bg-slate-50"
            >
              清空重填
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedClient}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              儲存訂單
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPanel;
