
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  TO_PACK = 'to_pack',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  ABNORMAL = 'abnormal'
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  steps: string[];
  ingredients: string[];
}

export interface BulkDiscount {
  threshold: number;
  type: 'fixed' | 'percent'; // 'fixed' means new unit price, 'percent' means % off unit price
  value: number;
}

export interface Product {
  id: string;
  name: string;
  categories: string[]; // Changed from string to string[]
  price: number;
  memberPrice: number;
  stock: number;
  trackInventory: boolean; // Added for optional stock tracking
  tags: string[];
  image: string; // Base64 or URL
  description?: string;
  gallery?: string[];
  recipes?: Recipe[];
  bulkDiscount?: BulkDiscount;
  origin?: string;
  weight?: string;
}

export interface CartItem extends Product {
  qty: number;
}

/** Detailed address for retail (e.g. Hong Kong). Use formatAddressLine() for display. */
export interface UserAddress {
  id: string;
  label: string;
  /** Legacy single-line; prefer district + street + building + floor + flat */
  detail?: string;
  district?: string;   // 地區 e.g. 九龍、旺角
  street?: string;     // 街道/門牌
  building?: string;   // 大廈名稱
  floor?: string;     // 樓層
  flat?: string;      // 室/單位
  isDefault: boolean;
  contactName: string;
  phone: string;
  altContactName?: string;
  altPhone?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  points: number;
  walletBalance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  role: 'customer' | 'admin';
  addresses?: UserAddress[];
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  trackingNumber?: string;
}

/** One line item stored in orders.line_items JSONB. */
export interface OrderLineItem {
  product_id: string;
  name: string;
  unit_price: number;
  qty: number;
  line_total: number;
  /** Product image URL/base64 for display in order details */
  image?: string | null;
}

/** Supabase public.orders table – column names must match exactly (snake_case). id may be bigint (number) or text. */
export interface SupabaseOrderRow {
  id: string | number;
  customer_name: string;
  customer_phone?: string | null;
  total: number;
  subtotal?: number;
  delivery_fee?: number;
  status: string;
  order_date: string;
  items_count: number;
  line_items?: OrderLineItem[];
  delivery_method?: string;
  delivery_address?: string | null;
  delivery_district?: string | null;
  delivery_street?: string | null;
  delivery_building?: string | null;
  delivery_floor?: string | null;
  delivery_flat?: string | null;
  contact_name?: string | null;
  delivery_alt_contact_name?: string | null;
  delivery_alt_contact_phone?: string | null;
  waybill_no?: string | null;
  tracking_number?: string | null;
  sf_responses?: unknown | null;
}

/** Supabase public.products table – column names must match (snake_case). */
export interface SupabaseProductRow {
  id: string;
  name: string;
  categories: string[];
  price: number;
  member_price: number;
  stock: number;
  track_inventory: boolean;
  tags: string[];
  image: string;
  description?: string | null;
  gallery?: string[] | null;
  recipes?: Recipe[] | null;
  bulk_discount?: BulkDiscount | null;
  origin?: string | null;
  weight?: string | null;
}

/** Supabase public.categories table – column names must match (snake_case). */
export interface SupabaseCategoryRow {
  id: string;
  name: string;
  icon: string;
}

/** Supabase public.members table – column names must match (snake_case). Phone required, email optional. */
export interface SupabaseMemberRow {
  id: string;
  name: string;
  email?: string | null;
  password_hash?: string | null;
  phone_number: string;
  points: number;
  wallet_balance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  role: 'customer' | 'admin';
  addresses?: UserAddress[] | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

/** One slide in the store-front advertisement slideshow (image or video). */
export interface SlideshowItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  sortOrder: number;
}

/** Supabase public.slideshow table – column names must match (snake_case). */
export interface SupabaseSlideshowRow {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string | null;
  sort_order: number;
}

export interface GlobalPricingRules {
  memberDiscountPercent: number; // e.g. 15 for 15% off
  autoApplyMemberPrice: boolean;
  roundToNearest: number; // e.g. 0.1 or 1
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];
  markupPercent?: number; // Global markup on base cost
}

export interface DeliveryTier {
  min: number;
  fee: number;
}

export interface DeliveryRules {
  freeThreshold: number;
  baseFee: number;
  coldChainSurcharge: number;
  lockerDiscount: number;
  residentialSurcharge?: number;
  tieredFees?: DeliveryTier[];
}

export interface SiteConfig {
  logoText: string;
  logoIcon: string;
  accentColor?: string;
  pricingRules?: GlobalPricingRules;
  deliveryRules?: DeliveryRules;
}
