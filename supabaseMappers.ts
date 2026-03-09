import {
  Product,
  Category,
  User,
  Order,
  OrderStatus,
  SaleChannel,
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
  SupabaseIngredientRow
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
  saleChannel: (['retail', 'wholesale', 'both'].includes(row.sale_channel ?? '') ? row.sale_channel as SaleChannel : 'both'),
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
  sale_channel: product.saleChannel ?? 'both',
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
  notes: row.notes ?? undefined,
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
  notes: ing.notes ?? null,
});

/** Compute the final cost of a product using the ingredient -> product formula.
 *  Formula: (ingredient.baseCostPerLb / yieldRate) + processingCost + packagingCost + miscCost + extraCostItems
 *  Falls back to legacy costPrice if no ingredient is linked. */
export const computeProductCost = (
  product: Product,
  ingredient: Ingredient | undefined,
  costItems: { id: string; defaultPrice: number }[]
): number => {
  let baseMaterialCost = product.costPrice || 0;

  if (ingredient && product.yieldRate && product.yieldRate > 0) {
    baseMaterialCost = ingredient.baseCostPerLb / product.yieldRate;
  } else if (ingredient) {
    baseMaterialCost = ingredient.baseCostPerLb;
  }

  const processing = product.processingCost || 0;
  const packaging = product.packagingCost || 0;
  const misc = product.miscCost || 0;

  const extraCost = (product.costItemIds || []).reduce(
    (sum, cid) => sum + (costItems.find(ci => ci.id === cid)?.defaultPrice || 0),
    0
  );

  return baseMaterialCost + processing + packaging + misc + extraCost;
};

export const mapCategoryRowToCategory = (row: SupabaseCategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon
});

export const mapCategoryToRow = (category: Category): SupabaseCategoryRow => ({
  id: category.id,
  name: category.name,
  icon: category.icon
});

export const mapMemberRowToUser = (row: SupabaseMemberRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email ?? undefined,
  phoneNumber: row.phone_number ?? undefined,
  points: row.points,
  walletBalance: row.wallet_balance,
  tier: row.tier,
  role: row.role,
  memberType: (row.member_type === 'wholesale' ? 'wholesale' : 'retail') as MemberType,
  wholesalePriceTier: row.wholesale_price_tier ?? undefined,
  addresses: row.addresses ?? undefined
});

export const mapUserToMemberRow = (user: User, passwordHash?: string | null): SupabaseMemberRow => {
  const row: SupabaseMemberRow = {
    id: user.id,
    name: user.name,
    email: user.email?.trim() || null,
    phone_number: user.phoneNumber?.trim() ?? '',
    points: user.points,
    wallet_balance: user.walletBalance,
    tier: user.tier,
    role: user.role,
    member_type: user.memberType || 'retail',
    wholesale_price_tier: user.memberType === 'wholesale' ? (user.wholesalePriceTier || 'P0') : null,
    addresses: user.addresses ?? null
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
  trackingNumber: row.waybill_no ?? row.tracking_number ?? undefined
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
