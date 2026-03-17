
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_FAILED = 'payment_failed',
  CANCELLED = 'cancelled',
  PAID = 'paid',
  PREPARING = 'preparing',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  steps: string[];
  ingredients: string[];
}

export interface RecipeIngredientRaw {
  name: string;
  amount: string;
}

export interface RecipeStep {
  order: number;
  content: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  categoryType: 'method' | 'meat';
}

export interface StandaloneRecipe {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  cookingTime: number;
  servingSize: string;
  tags: string[];
  categoryIds: string[];
  ingredientsRaw: RecipeIngredientRaw[];
  steps: RecipeStep[];
  linkedProductIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupabaseRecipeRow {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  cooking_time: number;
  serving_size: string;
  tags: string[];
  category_ids: string[];
  ingredients_raw: RecipeIngredientRaw[];
  steps: RecipeStep[];
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseRecipeProductLinkRow {
  recipe_id: string;
  product_id: string;
}

export type SaleChannel = 'retail' | 'wholesale' | 'both';

export interface AdminPermissions {
  dashboard: boolean;
  inventory: boolean;
  orders: boolean;
  members: boolean;
  slideshow: boolean;
  pricing: boolean;
  recipes: boolean;
  ingredients: boolean;
  costs: boolean;
  language: boolean;
  settings: boolean;
  admin_management: boolean;
}

export type AdminRole = 'super_admin' | 'admin';

export interface AdminAccount {
  id: string;
  name: string;
  phone: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLoginAt?: string;
}

// ─── Multi-brand workspace types ────────────────────────────────

export type Workspace = 'WHOLESALE' | 'COOLFOOD_RETAIL';

export type WholesaleBrand = 'GHFOODS' | 'COOLFOOD';

export type StaffRole =
  | 'super_admin' | 'admin'
  | 'ghfoods_staff' | 'coolfood_staff'
  | 'accountant' | 'buyer' | 'warehouse';

export type AdminModuleId =
  | 'dashboard' | 'inventory' | 'orders' | 'members' | 'slideshow'
  | 'pricing' | 'costs' | 'ingredients' | 'language' | 'recipes'
  | 'settings' | 'admin_management'
  | 'global_dashboard' | 'new_order'
  | 'dispatch' | 'warehouse_ops' | 'accounting' | 'production'
  | 'whatsapp_orders' | 'tricolor_print' | 'wholesale_clients'
  | 'sales_reps';

export interface BulkDiscount {
  threshold: number;
  type: 'fixed' | 'percent'; // 'fixed' means new unit price, 'percent' means % off unit price
  value: number;
}

export interface CostItem {
  id: string;
  name: string;
  defaultPrice: number;
}

/** Raw material / ingredient sourced from suppliers. */
export interface Ingredient {
  id: string;
  legacyId?: string;        // 舊系統 ID（方便對照）
  name: string;
  nameEn?: string;
  baseCostPerLb: number;    // 買入成本（每磅/每單位）
  supplier?: string;
  marketBenchmark?: number; // 市場參考價
  unit: string;             // 'lb' | 'kg' | 'pc' etc.
  category?: string;        // 類別（如 牛肉、豬肉、海鮮）
  saleChannel?: SaleChannel; // 渠道：retail / wholesale / both
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A managed ingredient category (stored in ingredient_categories table). */
export interface IngredientCategory {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

/** Supabase public.ingredients row (snake_case). */
export interface SupabaseIngredientRow {
  id: string;
  legacy_id?: string | null;
  name: string;
  name_en?: string | null;
  base_cost_per_lb: number;
  supplier?: string | null;
  market_benchmark?: number | null;
  unit: string;
  category?: string | null;
  sale_channel?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  legacyId?: string;        // 舊系統 ID（方便對照）
  name: string;
  nameEn?: string;
  categories: string[];
  price: number;
  memberPrice: number;
  stock: number;
  trackInventory: boolean;
  tags: string[];
  image: string;
  description?: string;
  descriptionEn?: string;
  gallery?: string[];
  recipes?: Recipe[];
  bulkDiscount?: BulkDiscount;
  origin?: string;
  weight?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageAlt?: string;
  costPrice?: number;       // Legacy / manual raw material cost per unit
  costItemIds?: string[];   // IDs of applicable CostItem entries (packaging, plates, etc.)
  ingredientId?: string;    // FK → ingredients.id (原材料關聯)
  yieldRate?: number;       // 出成率 0.0-1.0 (e.g. 0.7 = 70%)
  processingCost?: number;  // 加工費
  packagingCost?: number;   // 包裝費 (Skin Pack, 真空袋, etc.)
  miscCost?: number;        // 稅費 / 其他
  saleChannel?: SaleChannel; // 銷售渠道：retail / wholesale / both
  purchaseLimit?: number;   // 每位客人每單限購數量，null = 不限
}

export interface CartItem extends Product {
  qty: number;
}

/** Detailed address for retail (e.g. Hong Kong). Use formatAddressLine() for display. */
export interface UserAddress {
  id: string;
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

export type MemberType = 'retail' | 'wholesale';

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  points: number;
  walletBalance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  role: 'customer' | 'admin';
  memberType: MemberType;                // 零售 / 批發
  wholesalePriceTier?: string;           // 批發 P 等級（如 'P0', 'P3'）— 僅批發會員適用
  addresses?: UserAddress[];
}

export type OrderType = 'retail' | 'wholesale';

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  trackingNumber?: string;
  orderType?: OrderType;
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
  locker_code?: string | null;
  waybill_no?: string | null;
  tracking_number?: string | null;
  sf_responses?: unknown | null;
  payment_intent_id?: string | null;
  delivery_date?: string | null;
  order_type?: string | null;
  payment_method?: string | null;
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
  seo_title?: string | null;
  seo_description?: string | null;
  image_alt?: string | null;
  name_en?: string | null;
  description_en?: string | null;
  cost_price?: number | null;
  cost_item_ids?: string[] | null;
  ingredient_id?: string | null;
  yield_rate?: number | null;
  processing_cost?: number | null;
  packaging_cost?: number | null;
  misc_cost?: number | null;
  legacy_id?: string | null;
  sale_channel?: string | null;
  purchase_limit?: number | null;
}

/** Supabase public.categories table – column names must match (snake_case). */
export interface SupabaseCategoryRow {
  id: string;
  name: string;
  icon: string;
  sort_order?: number;
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
  member_type?: string | null;            // 'retail' | 'wholesale'
  wholesale_price_tier?: string | null;   // e.g. 'P0', 'P3'
  addresses?: UserAddress[] | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder?: number;
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

export type PricingTier = 'guest' | 'member' | 'wallet';

export interface GlobalPricingRules {
  targetMarginFactor?: number;    // 零售目標利潤率因子（如 0.88 = 12% 毛利）→ 建議售價 = 成本 ÷ factor
  retailOverrideIds?: string[];   // 已手動調整價格的產品 ID 列表（用於衝突提示）
  memberDiscountPercent: number;  // 會員折扣 %（如 5 = 減 5%）
  walletDiscountPercent: number;  // 錢包折扣 %（如 5 = 再減 5%）
  autoApplyMemberPrice: boolean;
  roundToNearest: number;         // 四捨五入至最接近整數
  excludedProductIds?: string[];  // 不參與自動折扣的產品 ID
  excludedCategoryIds?: string[];
  markupPercent?: number;
}

/** One wholesale price tier above P0. name encodes the markup: 'P3' → 3% markup (÷0.97). */
export interface WholesalePriceTier {
  name: string;        // e.g. 'P3', 'P5', 'P10'
  factor: number;      // e.g. 0.97, 0.95, 0.90 — P0 price ÷ factor
  description?: string;
}

export interface WholesalePricingRules {
  targetMarginFactor: number;          // 目標利潤率因子（如 0.88 = 12% 毛利）→ P0 = cost ÷ factor
  priceTiers: WholesalePriceTier[];    // 自訂 P 等級（P0 以外的加成等級）
  /** @deprecated kept for backward compat; migrated to priceTiers */
  salesCommissionFactor?: number;
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

export interface ShippingConfig {
  id: string;          // 'sf_delivery' | 'sf_locker'
  label: string;
  fee: number;
  threshold: number;
  updated_at?: string;
}

export interface SiteConfig {
  logoText: string;
  logoIcon: string;
  logoUrl?: string;       // Uploaded logo image URL (Supabase Storage)
  accentColor?: string;
  pricingRules?: GlobalPricingRules;
  wholesalePricingRules?: WholesalePricingRules;
  deliveryRules?: DeliveryRules;
}

// ─── Wholesale operations types ─────────────────────────────────

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export type PaymentTermsType = 'cod' | 'weekly' | 'biweekly' | 'monthly';

export interface WholesaleClient {
  id: string;
  clientCode?: string;
  companyName: string;
  contactName: string;
  phone: string;
  fax?: string;
  email?: string;
  address?: string;
  district?: string;
  brand: WholesaleBrand;
  priceTier: string;
  routeId?: string | null;
  routeName?: string;
  creditLimit: number;
  parentClientId?: string | null;
  parentClientName?: string;
  salespersonId?: string | null;
  salespersonName?: string;
  paymentTermsDays: number;
  paymentTermsType: PaymentTermsType;
  discountPercent: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WholesaleBrandPricing {
  brand: WholesaleBrand;
  targetMarginFactor: number;
  priceTiers: WholesalePriceTier[];
}

// ─── Sales Representative types ──────────────────────────────────

export interface SalesRepresentative {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  brand: WholesaleBrand;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CommissionStatus = 'pending' | 'approved' | 'paid';

export interface SalesCommission {
  id: string;
  salespersonId?: string;
  salespersonName: string;
  clientId?: string;
  clientName: string;
  brand?: WholesaleBrand;
  orderId?: string;
  orderDate?: string;
  orderAmount: number;
  priceTier: string;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
}

// ─── Accounting types ────────────────────────────────────────────

export interface Supplier {
  id: string;
  legacyCode?: string;
  name: string;
  nameEn?: string;
  contactName?: string;
  phone?: string;
  whatsapp?: string;
  fax?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  paymentTermsDays?: number;
  creditLimit?: number;
  defaultCurrency?: string;
  warehouseLocations?: string[];
  lastQuoteDate?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Procurement Comparison types ────────────────────────────────

export interface RawMaterialCatalog {
  id: string;
  canonicalName: string;
  nameEn?: string;
  category?: string;
  subCategory?: string;
  defaultUnit: string;
  specs?: Record<string, any>;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialAlias {
  id: string;
  catalogId: string;
  supplierId?: string;
  aliasName: string;
  brand?: string;
  confidence: number;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt?: string;
}

export interface SupplierQuote {
  id: string;
  supplierId?: string;
  supplierName: string;
  quoteDate: string;
  validUntil?: string;
  sourceType: 'pdf' | 'whatsapp' | 'manual';
  sourceFileUrl?: string;
  originalText?: string;
  parsedAt?: string;
  status: 'draft' | 'parsed' | 'confirmed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lineItems?: QuoteLineItem[];
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  catalogId?: string;
  originalName: string;
  brand?: string;
  origin?: string;
  storageLocation?: string;
  unitPrice: number;
  currency: string;
  unit: string;
  pricePerLb?: number;
  weightPerCase?: string;
  minOrderQty?: number;
  productCode?: string;
  specs?: Record<string, any>;
  matchConfidence: number;
  isConfirmed: boolean;
  notes?: string;
  createdAt?: string;
  // Joined fields for display
  catalogName?: string;
  supplierName?: string;
}

export type JustificationCategory =
  | 'quality' | 'delivery_speed' | 'min_order'
  | 'payment_terms' | 'stock_availability' | 'other';

export interface PurchaseDecision {
  id: string;
  catalogId?: string;
  brand?: string;
  selectedQuoteItemId?: string;
  selectedSupplierId?: string;
  selectedSupplierName: string;
  selectedPrice: number;
  selectedUnit: string;
  lowestQuoteItemId?: string;
  lowestSupplierName?: string;
  lowestPrice: number;
  isLowest: boolean;
  justification?: string;
  justificationCategory?: JustificationCategory;
  decidedBy: string;
  decidedAt?: string;
  purchaseOrderId?: number;
  approvedBy?: string;
  approvedAt?: string;
}

/** Aggregated comparison row for the comparison table UI */
export interface ComparisonRow {
  catalogId: string;
  catalogName: string;
  category?: string;
  brand: string;
  origin?: string;
  quotes: {
    supplierId: string;
    supplierName: string;
    quoteItemId: string;
    unitPrice: number;
    unit: string;
    pricePerLb?: number;
    storageLocation?: string;
    isLowest: boolean;
  }[];
}

export type APStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface AccountPayable {
  id: string;
  supplierId?: string;
  supplierName: string;
  invoiceNumber?: string;
  invoiceDate: string;
  description: string;
  amount: number;
  dueDate?: string;
  status: APStatus;
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  createdAt?: string;
}

export type ARStatus = 'pending' | 'partial' | 'received' | 'overdue';

export interface AccountReceivable {
  id: string;
  clientId?: string;
  clientName: string;
  brand?: WholesaleBrand;
  orderId?: string;
  invoiceDate: string;
  amount: number;
  paidAmount: number;
  status: ARStatus;
  creditTerms?: string;
  paymentMethod?: string;
  receivedDate?: string;
  notes?: string;
  createdAt?: string;
}

export type ExpenseCategory =
  | 'salary' | 'rent' | 'vehicle' | 'packaging'
  | 'equipment' | 'license' | 'utilities' | 'insurance' | 'misc';

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  createdAt?: string;
}

// ─── Order line item (wholesale new order) ───────────────────────

export interface WholesaleOrderLine {
  productId?: string;
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

// ─── Product BOM (配方表) ────────────────────────────────────────

export interface ProductBomEntry {
  id: string;
  productId: string;
  ingredientId: string;
  quantityPerUnit: number;
  unit: string;
  isPrimary: boolean;
  expectedYieldRate?: number;
  notes?: string;
  createdAt?: string;
}

// ─── Production / Factory types ─────────────────────────────────

export interface PackagingMaterial {
  id: string;
  name: string;
  nameEn?: string;
  unit: string;
  costPerUnit: number;
  stockQuantity: number;
  minStockAlert: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductionOrderStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  status: ProductionOrderStatus;
  productionDate: string;
  createdBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  totalInputWeightKg: number;
  totalOutputWeightKg: number;
  yieldRate: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  inputs?: ProductionOrderInput[];
  outputs?: ProductionOrderOutput[];
}

export interface ProductionOrderInput {
  id: string;
  productionOrderId: string;
  ingredientId?: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  weightPerUnitKg: number;
  totalWeightKg: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface ProductionOrderOutput {
  id: string;
  productionOrderId: string;
  productName: string;
  productId?: string;
  saleChannel: SaleChannel;
  quantity: number;
  unitWeightKg: number;
  totalWeightKg: number;
  packagingType?: string;
  packagingMaterialId?: string;
  packagingQuantity: number;
  packagingCostTotal: number;
  estimatedUnitCost: number;
  notes?: string;
}
