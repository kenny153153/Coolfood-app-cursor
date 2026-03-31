import {
  Product,
  ProductType,
  ProductClassification,
  PricingMode,
  ProductGroup,
  SupabaseProductGroupRow,
  Category,
  User,
  Order,
  OrderStatus,
  SaleChannel,
  MaterialType,
  MemberType,
  SupabaseProductRow,
  SupabaseCategoryRow,
  SupabaseMemberRow,
  SupabaseOrderRow,
  SlideshowItem,
  SupabaseSlideshowRow,
  StandaloneRecipe,
  SupabaseRecipeRow,
  RecipeCategory,
  Ingredient,
  SupabaseIngredientRow,
  IngredientCategory,
  ProcessingType,
  SupabaseProcessingTypeRow,
  MaterialProcessingEntry,
  SupabaseMaterialProcessingRow,
  StockLot,
  StockLotStatus,
  SupabaseStockLotRow,
  Coupon,
  CouponType,
  SupabaseCouponRow,
  MemberCoupon,
  MemberCouponStatus,
  MemberCouponSource,
  SupabaseMemberCouponRow,
  WholesaleBrand,
} from './types';

export const mapProductRowToProduct = (row: SupabaseProductRow): Product => ({
  id: row.id,
  name: row.name,
  categories: row.categories || [],
  price: row.price,
  memberPrice: row.member_price,
  stock: row.stock,
  trackInventory: row.track_inventory,
  tags: row.tags || [],
  image: row.image,
  description: row.description ?? undefined,
  gallery: row.gallery ?? undefined,
  recipes: row.recipes ?? undefined,
  bulkDiscount: row.bulk_discount ?? undefined,
  origin: row.origin ?? undefined,
  weight: row.weight ?? undefined,
  seoTitle: row.seo_title ?? undefined,
  seoDescription: row.seo_description ?? undefined,
  imageAlt: row.image_alt ?? undefined,
  nameEn: row.name_en ?? undefined,
  descriptionEn: row.description_en ?? undefined,
  costPrice: row.cost_price ?? undefined,
  costItemIds: row.cost_item_ids ?? undefined,
  ingredientId: row.ingredient_id ?? undefined,
  yieldRate: row.yield_rate ?? undefined,
  processingCost: row.processing_cost ?? undefined,
  packagingCost: row.packaging_cost ?? undefined,
  miscCost: row.misc_cost ?? undefined,
  legacyId: row.legacy_id ?? undefined,
  saleChannel: (['retail', 'wholesale', 'both'].includes(row.sale_channel ?? '') ? row.sale_channel as SaleChannel : 'retail'),
  purchaseLimit: row.purchase_limit ?? undefined,
  productType: (['standalone', 'processed', 'raw_material', 'in_house', 'third_party'].includes(row.product_type ?? '') ? row.product_type as ProductType : 'standalone'),
  processingTypeId: row.processing_type_id ?? undefined,
  parentIngredientId: row.parent_ingredient_id ?? undefined,
  packSize: row.pack_size ?? undefined,
  packWeightLb: row.pack_weight_lb ?? undefined,
  groupId: row.group_id ?? undefined,
  variantLabel: row.variant_label ?? undefined,
  pricingMode: (['fixed_pack', 'by_piece'].includes(row.pricing_mode ?? '') ? row.pricing_mode as PricingMode : undefined),
  processingSpec: row.processing_spec ?? undefined,
});

export const mapProductToRow = (product: Product): SupabaseProductRow => ({
  id: product.id,
  name: product.name,
  categories: product.categories,
  price: product.price,
  member_price: product.memberPrice,
  stock: product.stock,
  track_inventory: product.trackInventory,
  tags: product.tags,
  image: product.image,
  description: product.description ?? null,
  gallery: product.gallery ?? null,
  recipes: product.recipes ?? null,
  bulk_discount: product.bulkDiscount ?? null,
  origin: product.origin ?? null,
  weight: product.weight ?? null,
  seo_title: product.seoTitle ?? null,
  seo_description: product.seoDescription ?? null,
  image_alt: product.imageAlt ?? null,
  name_en: product.nameEn ?? null,
  description_en: product.descriptionEn ?? null,
  cost_price: product.costPrice ?? null,
  cost_item_ids: product.costItemIds ?? null,
  ingredient_id: product.ingredientId ?? null,
  yield_rate: product.yieldRate ?? null,
  processing_cost: product.processingCost ?? 0,
  packaging_cost: product.packagingCost ?? 0,
  misc_cost: product.miscCost ?? 0,
  legacy_id: product.legacyId ?? null,
  sale_channel: product.saleChannel ?? 'retail',
  purchase_limit: product.purchaseLimit ?? null,
  product_type: product.productType ?? 'standalone',
  processing_type_id: product.processingTypeId ?? null,
  parent_ingredient_id: product.parentIngredientId ?? null,
  pack_size: product.packSize ?? null,
  pack_weight_lb: product.packWeightLb ?? null,
  group_id: product.groupId ?? null,
  variant_label: product.variantLabel ?? null,
  pricing_mode: product.pricingMode ?? null,
  processing_spec: product.processingSpec ?? null,
});

export const mapIngredientRowToIngredient = (row: SupabaseIngredientRow): Ingredient => ({
  id: row.id,
  legacyId: row.legacy_id ?? undefined,
  name: row.name,
  nameEn: row.name_en ?? undefined,
  baseCostPerLb: row.base_cost_per_lb,
  supplier: row.supplier ?? undefined,
  marketBenchmark: row.market_benchmark ?? undefined,
  unit: row.unit || 'lb',
  category: row.category ?? undefined,
  materialType: (['meat', 'third_party'].includes(row.material_type ?? '') ? row.material_type as MaterialType : 'meat'),
  saleChannel: (['retail', 'wholesale', 'both'].includes(row.sale_channel ?? '') ? row.sale_channel as SaleChannel : undefined),
  notes: row.notes ?? undefined,
  stockQty: row.stock_qty ?? 0,
  stockUnit: row.stock_unit ?? undefined,
  minStockAlert: row.min_stock_alert ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapIngredientToRow = (ing: Ingredient): SupabaseIngredientRow => ({
  id: ing.id,
  legacy_id: ing.legacyId ?? null,
  name: ing.name,
  name_en: ing.nameEn ?? null,
  base_cost_per_lb: ing.baseCostPerLb,
  supplier: ing.supplier ?? null,
  market_benchmark: ing.marketBenchmark ?? null,
  unit: ing.unit || 'lb',
  category: ing.category ?? null,
  material_type: ing.materialType ?? 'meat',
  sale_channel: ing.saleChannel ?? null,
  notes: ing.notes ?? null,
  stock_qty: ing.stockQty ?? 0,
  stock_unit: ing.stockUnit ?? null,
  min_stock_alert: ing.minStockAlert ?? null,
});

/** Compute the per-lb cost of a product using the ingredient -> product formula.
 *  When materialProcessingEntries is provided and the product has both ingredientId and processingTypeId,
 *  yield rate and processing cost are pulled from the matrix (原材料 × 加工方式) first.
 *  Falls back to product-level yieldRate / processingCost, then to legacy costPrice. */
export const computeProductCost = (
  product: Product,
  ingredient: Ingredient | undefined,
  costItems: { id: string; defaultPrice: number }[],
  materialProcessingEntries?: MaterialProcessingEntry[],
): number => {
  let yieldRate = product.yieldRate;
  let processingCostVal = product.processingCost || 0;

  if (materialProcessingEntries && product.ingredientId && product.processingTypeId) {
    const matEntry = materialProcessingEntries.find(
      e => e.ingredientId === product.ingredientId && e.processingTypeId === product.processingTypeId
    );
    if (matEntry) {
      if (matEntry.yieldRateOverride != null && matEntry.yieldRateOverride > 0) yieldRate = matEntry.yieldRateOverride;
      if (matEntry.surchargeOverride != null) processingCostVal = matEntry.surchargeOverride;
    }
  }

  let baseMaterialCost = product.costPrice || 0;
  if (ingredient && yieldRate && yieldRate > 0) {
    baseMaterialCost = ingredient.baseCostPerLb / yieldRate;
  } else if (ingredient) {
    baseMaterialCost = ingredient.baseCostPerLb;
  }

  const packaging = product.packagingCost || 0;
  const misc = product.miscCost || 0;

  const extraCost = (product.costItemIds || []).reduce(
    (sum, cid) => sum + (costItems.find(ci => ci.id === cid)?.defaultPrice || 0),
    0
  );

  return baseMaterialCost + processingCostVal + packaging + misc + extraCost;
};

/** Compute the per-pack cost for a fixed_pack product (per-lb cost × packWeightLb).
 *  For by_piece products, returns the per-lb cost unchanged. */
export const computePackCost = (
  perLbCost: number,
  packWeightLb: number | undefined,
  pricingMode: string | undefined,
): number => {
  if (pricingMode === 'fixed_pack' && packWeightLb && packWeightLb > 0) {
    return perLbCost * packWeightLb;
  }
  return perLbCost;
};

export const mapCategoryRowToCategory = (row: SupabaseCategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  sortOrder: row.sort_order ?? 0,
});

export const mapCategoryToRow = (category: Category): SupabaseCategoryRow => ({
  id: category.id,
  name: category.name,
  icon: category.icon,
  sort_order: category.sortOrder ?? 0,
});

export const mapMemberRowToUser = (row: SupabaseMemberRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email ?? undefined,
  phoneNumber: row.phone_number ?? undefined,
  points: row.points,
  tier: row.tier,
  role: row.role,
  memberType: (row.member_type === 'wholesale' ? 'wholesale' : 'retail') as MemberType,
  wholesalePriceTier: row.wholesale_price_tier ?? undefined,
  wholesaleStatus: (['pending', 'approved', 'rejected'].includes(row.wholesale_status ?? '') ? row.wholesale_status as 'pending' | 'approved' | 'rejected' : undefined),
  wholesaleBrand: (row.wholesale_brand === 'GHFOODS' || row.wholesale_brand === 'COOLFOOD') ? row.wholesale_brand as WholesaleBrand : undefined,
  companyName: row.company_name ?? undefined,
  businessType: row.business_type ?? undefined,
  branchCount: row.branch_count ?? undefined,
  brDocUrl: row.br_doc_url ?? undefined,
  storefrontPhotoUrl: row.storefront_photo_url ?? undefined,
  storefrontPreparing: row.storefront_preparing ?? undefined,
  deliveryAddress: row.delivery_address ?? undefined,
  brUpdateRequired: row.br_update_required ?? undefined,
  addresses: row.addresses ?? undefined,
  clientCode: row.client_code ?? undefined,
  fax: row.fax ?? undefined,
  district: row.district ?? undefined,
  routeId: row.route_id ?? undefined,
  creditLimit: row.credit_limit ?? 0,
  parentMemberId: row.parent_member_id ?? undefined,
  salespersonId: row.salesperson_id ?? undefined,
  paymentTermsDays: row.payment_terms_days ?? 0,
  paymentTermsType: (['cod', 'weekly', 'biweekly', 'monthly'].includes(row.payment_terms_type ?? '') ? row.payment_terms_type as 'cod' | 'weekly' | 'biweekly' | 'monthly' : 'cod'),
  discountPercent: row.discount_percent ?? 0,
  wholesaleNotes: row.wholesale_notes ?? undefined,
  isWholesaleActive: row.is_wholesale_active ?? true,
});

export const mapUserToMemberRow = (user: User, passwordHash?: string | null): SupabaseMemberRow => {
  const row: SupabaseMemberRow = {
    id: user.id,
    name: user.name,
    email: user.email?.trim() || null,
    phone_number: user.phoneNumber?.trim() ?? '',
    points: user.points,
    tier: user.tier,
    role: user.role,
    member_type: user.memberType || 'retail',
    wholesale_price_tier: user.memberType === 'wholesale' ? (user.wholesalePriceTier || 'P0') : null,
    wholesale_status: user.wholesaleStatus ?? null,
    wholesale_brand: user.wholesaleBrand ?? null,
    company_name: user.companyName ?? null,
    business_type: user.businessType ?? null,
    branch_count: user.branchCount ?? null,
    br_doc_url: user.brDocUrl ?? null,
    storefront_photo_url: user.storefrontPhotoUrl ?? null,
    storefront_preparing: user.storefrontPreparing ?? null,
    delivery_address: user.deliveryAddress ?? null,
    br_update_required: user.brUpdateRequired ?? null,
    addresses: user.addresses ?? null,
    client_code: user.clientCode ?? null,
    fax: user.fax ?? null,
    district: user.district ?? null,
    route_id: user.routeId ?? null,
    credit_limit: user.creditLimit ?? 0,
    parent_member_id: user.parentMemberId ?? null,
    salesperson_id: user.salespersonId ?? null,
    payment_terms_days: user.paymentTermsDays ?? 0,
    payment_terms_type: user.paymentTermsType ?? 'cod',
    discount_percent: user.discountPercent ?? 0,
    wholesale_notes: user.wholesaleNotes ?? null,
    is_wholesale_active: user.isWholesaleActive ?? true,
  };
  if (passwordHash !== undefined) row.password_hash = passwordHash;
  return row;
};

export const normalizeOrderStatus = (status: string | null | undefined): OrderStatus => {
  const normalized = String(status ?? '').toLowerCase();
  if ((Object.values(OrderStatus) as string[]).includes(normalized)) {
    return normalized as OrderStatus;
  }
  if (normalized === 'paid' || normalized === 'success') return OrderStatus.PAID;
  if (normalized === 'processing') return OrderStatus.PREPARING;
  if (normalized === 'ready_for_pickup') return OrderStatus.SHIPPING;
  if (normalized === 'completed') return OrderStatus.DELIVERED;
  if (normalized === 'abnormal') return OrderStatus.SHIPPING;
  if (normalized === 'refund') return OrderStatus.REFUNDED;
  return OrderStatus.PENDING_PAYMENT;
};

export const mapOrderRowToOrder = (row: SupabaseOrderRow): Order => ({
  id: typeof row.id === 'number' ? `ORD-${row.id}` : row.id,
  customerName: row.customer_name,
  total: row.total,
  status: normalizeOrderStatus(row.status),
  date: row.order_date,
  items: row.items_count,
  trackingNumber: row.waybill_no ?? row.tracking_number ?? undefined,
  orderType: (row.order_type === 'wholesale' ? 'wholesale' : 'retail') as 'retail' | 'wholesale',
  memberId: row.member_id ?? undefined,
});

export const mapSlideshowRowToItem = (row: SupabaseSlideshowRow): SlideshowItem => ({
  id: row.id,
  type: row.type as 'image' | 'video',
  url: row.url,
  title: row.title ?? undefined,
  sortOrder: row.sort_order
});

export const mapSlideshowItemToRow = (item: SlideshowItem): SupabaseSlideshowRow => ({
  id: item.id,
  type: item.type,
  url: item.url,
  title: item.title ?? null,
  sort_order: item.sortOrder
});

export const mapRecipeRowToRecipe = (row: SupabaseRecipeRow, linkedProductIds: string[] = []): StandaloneRecipe => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  mediaUrl: row.media_url ?? '',
  mediaType: (row.media_type as 'image' | 'video') ?? 'image',
  cookingTime: row.cooking_time ?? 0,
  servingSize: row.serving_size ?? '1-2人份',
  tags: row.tags ?? [],
  categoryIds: row.category_ids ?? [],
  ingredientsRaw: row.ingredients_raw ?? [],
  steps: row.steps ?? [],
  linkedProductIds,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapRecipeToRow = (recipe: StandaloneRecipe): Omit<SupabaseRecipeRow, 'created_at' | 'updated_at'> => ({
  id: recipe.id,
  title: recipe.title,
  description: recipe.description,
  media_url: recipe.mediaUrl,
  media_type: recipe.mediaType,
  cooking_time: recipe.cookingTime,
  serving_size: recipe.servingSize,
  tags: recipe.tags,
  category_ids: recipe.categoryIds,
  ingredients_raw: recipe.ingredientsRaw,
  steps: recipe.steps,
});

export const mapRecipeCategoryRow = (row: { id: string; name: string; icon: string; sort_order: number; category_type?: string }): RecipeCategory => ({
  id: row.id,
  name: row.name,
  icon: row.icon ?? '📁',
  sortOrder: row.sort_order ?? 0,
  categoryType: (row.category_type === 'meat' ? 'meat' : 'method'),
});

export const mapIngredientCategoryRow = (row: { id: string; name: string; emoji: string; sort_order: number }): IngredientCategory => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji ?? '📦',
  sortOrder: row.sort_order ?? 0,
});

// ── Processing Types mappers ──

export const mapProcessingTypeRow = (row: SupabaseProcessingTypeRow): ProcessingType => ({
  id: row.id,
  code: row.code,
  name: row.name,
  nameEn: row.name_en ?? undefined,
  spec: row.spec ?? undefined,
  surchargePorkChicken: row.surcharge_pork_chicken,
  surchargeBeefLambSeafood: row.surcharge_beef_lamb_seafood,
  requiresRepackaging: row.requires_repackaging,
  defaultPackWeightLb: row.default_pack_weight_lb ?? undefined,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export const mapProcessingTypeToRow = (pt: ProcessingType): Omit<SupabaseProcessingTypeRow, 'created_at'> => ({
  id: pt.id,
  code: pt.code,
  name: pt.name,
  name_en: pt.nameEn ?? null,
  spec: pt.spec ?? null,
  surcharge_pork_chicken: pt.surchargePorkChicken,
  surcharge_beef_lamb_seafood: pt.surchargeBeefLambSeafood,
  requires_repackaging: pt.requiresRepackaging,
  default_pack_weight_lb: pt.defaultPackWeightLb ?? null,
  sort_order: pt.sortOrder,
  is_active: pt.isActive,
});

export const mapMaterialProcessingRow = (row: SupabaseMaterialProcessingRow): MaterialProcessingEntry => ({
  id: row.id,
  ingredientId: row.ingredient_id,
  processingTypeId: row.processing_type_id,
  productId: row.product_id ?? undefined,
  surchargeOverride: row.surcharge_override ?? undefined,
  yieldRateOverride: row.yield_rate_override ?? undefined,
  isAvailable: row.is_available,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
});

export const mapMaterialProcessingToRow = (entry: MaterialProcessingEntry): Omit<SupabaseMaterialProcessingRow, 'created_at'> => ({
  id: entry.id,
  ingredient_id: entry.ingredientId,
  processing_type_id: entry.processingTypeId,
  product_id: entry.productId ?? null,
  surcharge_override: entry.surchargeOverride ?? null,
  yield_rate_override: entry.yieldRateOverride ?? null,
  is_available: entry.isAvailable,
  notes: entry.notes ?? null,
});

// ── Stock Lot mappers ──

const VALID_LOT_STATUSES: StockLotStatus[] = ['available', 'reserved', 'depleted', 'expired'];

export const mapStockLotRow = (row: SupabaseStockLotRow): StockLot => ({
  id: row.id,
  ingredientId: row.ingredient_id,
  brand: row.brand ?? undefined,
  supplierId: row.supplier_id ?? undefined,
  supplierName: row.supplier_name ?? undefined,
  goodsReceiptItemId: row.goods_receipt_item_id ?? undefined,
  receivedDate: row.received_date,
  expiryDate: row.expiry_date ?? undefined,
  quantityReceived: row.quantity_received,
  quantityRemaining: row.quantity_remaining,
  unit: row.unit || 'lb',
  costPerUnit: row.cost_per_unit,
  storageLocation: row.storage_location ?? undefined,
  reservedForClientId: row.reserved_for_client_id ?? undefined,
  lotStatus: (VALID_LOT_STATUSES.includes(row.lot_status as StockLotStatus) ? row.lot_status as StockLotStatus : 'available'),
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapStockLotToRow = (lot: StockLot): Omit<SupabaseStockLotRow, 'created_at' | 'updated_at'> => ({
  id: lot.id,
  ingredient_id: lot.ingredientId,
  brand: lot.brand ?? null,
  supplier_id: lot.supplierId ?? null,
  supplier_name: lot.supplierName ?? null,
  goods_receipt_item_id: lot.goodsReceiptItemId ?? null,
  received_date: lot.receivedDate,
  expiry_date: lot.expiryDate ?? null,
  quantity_received: lot.quantityReceived,
  quantity_remaining: lot.quantityRemaining,
  unit: lot.unit,
  cost_per_unit: lot.costPerUnit,
  storage_location: lot.storageLocation ?? null,
  reserved_for_client_id: lot.reservedForClientId ?? null,
  lot_status: lot.lotStatus,
  notes: lot.notes ?? null,
});

// ── Product Groups mappers ──

export const mapProductGroupRow = (row: SupabaseProductGroupRow): ProductGroup => ({
  id: row.id,
  name: row.name,
  nameEn: row.name_en ?? undefined,
  classification: (['raw_material', 'third_party', 'in_house'].includes(row.classification) ? row.classification as ProductClassification : 'raw_material'),
  ingredientId: row.ingredient_id ?? undefined,
  image: row.image ?? undefined,
  category: row.category ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapProductGroupToRow = (group: ProductGroup): Omit<SupabaseProductGroupRow, 'created_at' | 'updated_at'> => ({
  id: group.id,
  name: group.name,
  name_en: group.nameEn ?? null,
  classification: group.classification,
  ingredient_id: group.ingredientId ?? null,
  image: group.image ?? null,
  category: group.category ?? null,
  is_active: group.isActive,
});

// ── Coupon mappers ──

const VALID_COUPON_TYPES: CouponType[] = ['fixed_amount', 'percentage', 'free_delivery', 'free_product'];

export const mapCouponRowToCoupon = (row: SupabaseCouponRow): Coupon => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  couponType: (VALID_COUPON_TYPES.includes(row.coupon_type as CouponType) ? row.coupon_type as CouponType : 'fixed_amount'),
  discountValue: row.discount_value,
  linkedProductId: row.linked_product_id ?? undefined,
  minSpend: row.min_spend,
  pointsCost: row.points_cost ?? undefined,
  expiryDays: row.expiry_days,
  isWelcomeCoupon: row.is_welcome_coupon,
  isPointsShop: row.is_points_shop,
  maxDistribution: row.max_distribution ?? undefined,
  distributedCount: row.distributed_count,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapCouponToRow = (c: Coupon): Omit<SupabaseCouponRow, 'created_at' | 'updated_at'> => ({
  id: c.id,
  name: c.name,
  description: c.description ?? null,
  coupon_type: c.couponType,
  discount_value: c.discountValue,
  linked_product_id: c.linkedProductId ?? null,
  min_spend: c.minSpend,
  points_cost: c.pointsCost ?? null,
  expiry_days: c.expiryDays,
  is_welcome_coupon: c.isWelcomeCoupon,
  is_points_shop: c.isPointsShop,
  max_distribution: c.maxDistribution ?? null,
  distributed_count: c.distributedCount,
  is_active: c.isActive,
});

const VALID_MC_STATUSES: MemberCouponStatus[] = ['available', 'used', 'expired'];
const VALID_MC_SOURCES: MemberCouponSource[] = ['admin', 'welcome', 'points_shop'];

export const mapMemberCouponRow = (row: SupabaseMemberCouponRow): MemberCoupon => ({
  id: row.id,
  memberId: row.member_id,
  couponId: row.coupon_id,
  status: (VALID_MC_STATUSES.includes(row.status as MemberCouponStatus) ? row.status as MemberCouponStatus : 'available'),
  source: (VALID_MC_SOURCES.includes(row.source as MemberCouponSource) ? row.source as MemberCouponSource : 'admin'),
  usedAt: row.used_at ?? undefined,
  usedOrderId: row.used_order_id ?? undefined,
  expiresAt: row.expires_at ?? undefined,
  createdAt: row.created_at,
  coupon: row.coupons ? mapCouponRowToCoupon(row.coupons) : undefined,
});
