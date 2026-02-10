import {
  Product,
  Category,
  User,
  Order,
  OrderStatus,
  SupabaseProductRow,
  SupabaseCategoryRow,
  SupabaseMemberRow,
  SupabaseOrderRow,
  SlideshowItem,
  SupabaseSlideshowRow
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
  weight: row.weight ?? undefined
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
  weight: product.weight ?? null
});

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
  if (normalized === 'paid' || normalized === 'success') {
    return OrderStatus.PROCESSING;
  }
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
