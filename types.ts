
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

export type MaterialType = 'meat' | 'third_party';

// ─── CRUD-level permission per module (Enterprise Security) ─────
export type CrudOp = 'read' | 'create' | 'update' | 'delete' | 'export';

export interface ModulePermission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export interface AdminPermissions {
  global_dashboard: ModulePermission;
  new_order: ModulePermission;
  orders: ModulePermission;
  dispatch: ModulePermission;
  warehouse_ops: ModulePermission;
  production: ModulePermission;
  accounting: ModulePermission;
  wholesale_clients: ModulePermission;
  sales_reps: ModulePermission;
  inventory: ModulePermission;
  pricing: ModulePermission;
  dashboard: ModulePermission;
  members: ModulePermission;
  slideshow: ModulePermission;
  recipes: ModulePermission;
  ingredients: ModulePermission;
  costs: ModulePermission;
  language: ModulePermission;
  settings: ModulePermission;
  admin_management: ModulePermission;
  quotations: ModulePermission;
}

export type AdminRole =
  | 'super_admin' | 'admin'
  | 'customer_service' | 'buyer' | 'accountant'
  | 'factory' | 'sales_rep';

export interface AdminAccount {
  id: string;
  name: string;
  phone: string;
  role: AdminRole;
  roleDisplayName?: string;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface StaffRoleTemplate {
  id: string;
  name: string;
  displayName: string;
  isSystem: boolean;
  modulePermissions: AdminPermissions;
  sortOrder: number;
}

// ─── Multi-brand workspace types ────────────────────────────────

export type Workspace = 'WHOLESALE' | 'COOLFOOD_RETAIL';

export type WholesaleBrand = 'GHFOODS' | 'COOLFOOD';

export type StaffRole =
  | 'super_admin' | 'admin'
  | 'customer_service' | 'buyer' | 'accountant'
  | 'factory' | 'sales_rep'
  | 'ghfoods_staff' | 'coolfood_staff' | 'warehouse';

export type AdminModuleId =
  | 'dashboard' | 'inventory' | 'orders' | 'members' | 'slideshow'
  | 'pricing' | 'costs' | 'ingredients' | 'language' | 'recipes'
  | 'settings' | 'admin_management'
  | 'global_dashboard' | 'new_order'
  | 'dispatch' | 'warehouse_ops' | 'accounting' | 'production'
  | 'whatsapp_orders' | 'tricolor_print' | 'wholesale_clients'
  | 'sales_reps' | 'quotations' | 'legacy_features';

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
  materialType?: MaterialType; // 原材料分類: meat=肉類原材料, third_party=第三方產品
  saleChannel?: SaleChannel; // @deprecated — 渠道由產品規格決定
  notes?: string;
  stockQty?: number;        // 庫存數量
  stockUnit?: string;       // 庫存單位（預設同 unit）
  minStockAlert?: number;   // 低庫存警報
  committedQty?: number;    // 待出 — 已確認訂單但未出貨
  incomingQty?: number;     // 待入 — 已下 PO 但未收貨
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
  material_type?: string | null;
  sale_channel?: string | null;
  notes?: string | null;
  stock_qty?: number;
  stock_unit?: string | null;
  min_stock_alert?: number | null;
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
  productType?: ProductType; // standalone / processed / raw_material / in_house
  processingTypeId?: string; // FK → processing_types.id
  parentIngredientId?: string; // FK → ingredients.id (加工來源原材料)
  packSize?: string;         // 包裝規格描述 e.g. '5磅/包'
  packWeightLb?: number;     // 包裝重量(磅)
  groupId?: string;           // FK → product_groups.id
  variantLabel?: string;      // 規格標籤 e.g. '原件', '切粒', '1kg'
  pricingMode?: PricingMode;  // 'fixed_pack' | 'by_piece' (抄碼)
  processingSpec?: string;    // 選中的加工規格 e.g. '2MM', '500g'
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
  role: string;
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
  memberId?: string;
}

/** One line item stored in orders.line_items JSONB. */
export interface OrderLineItem {
  product_id: string;
  name: string;
  unit_price: number;
  qty: number;
  line_total: number;
  unit?: string;
  /** Product image URL/base64 for display in order details */
  image?: string | null;
  processing_type_id?: string;
  processing_type_name?: string;
  processing_spec?: string;
  line_note?: string;
  pricing_mode?: PricingMode;
  actual_weight_lb?: number;
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
  member_id?: string | null;
  wholesale_brand?: string | null;
  wholesale_client_id?: string | null;
  route_id?: string | null;
  client_code?: string | null;
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
  product_type?: string | null;
  processing_type_id?: string | null;
  parent_ingredient_id?: string | null;
  pack_size?: string | null;
  pack_weight_lb?: number | null;
  group_id?: string | null;
  variant_label?: string | null;
  pricing_mode?: string | null;
  processing_spec?: string | null;
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
  role: string;
  admin_permissions?: Record<string, boolean | ModulePermission> | null;
  member_type?: string | null;            // 'retail' | 'wholesale'
  wholesale_price_tier?: string | null;   // e.g. 'P0', 'P3'
  addresses?: UserAddress[] | null;
  security_level?: number | null;         // hierarchy: higher sees lower staff (min 1)
  must_change_password?: boolean | null;  // force password change on next login
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
  inventoryEnforcementEnabled?: boolean;
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
  voucherNumber?: string;
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
  voucherNumber?: string;
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
  voucherNumber?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'credit_note' | 'debit_note';
  date: string;
  relatedOrderId?: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  createdAt?: string;
}

// ─── Accounting Directory (常用資料) ─────────────────────────────

export type AccountType = 'asset' | 'liability' | 'equity' | 'bank' | 'cash' | 'expense' | 'revenue' | 'payable' | 'receivable' | 'other';

export interface AccountingAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  currency?: string;
  isDefault?: boolean;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

export type ContactType = 'supplier' | 'client' | 'employee' | 'government' | 'landlord' | 'other';

export interface AccountingContact {
  id: string;
  name: string;
  contactType: ContactType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  fpsId?: string;
  defaultPaymentMethod?: string;
  address?: string;
  notes?: string;
  isFrequent: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface PaymentTemplate {
  id: string;
  templateName: string;
  contactId?: string;
  contactName: string;
  accountId?: string;
  accountName: string;
  defaultAmount?: number;
  category?: string;
  description?: string;
  notes?: string;
  createdAt?: string;
}

// ─── Journal Entries (日記帳) ─────────────────────────────────────

export interface JournalEntry {
  id: string;
  voucherNumber: string;
  entryDate: string;
  description: string;
  sourceType?: 'manual' | 'ap' | 'ar' | 'expense';
  sourceId?: string;
  isPosted: boolean;
  createdAt?: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  createdAt?: string;
}

// ─── Order line item (wholesale new order) ───────────────────────

export interface WholesaleOrderLine {
  productId?: string;
  productName: string;
  groupId?: string;
  groupName?: string;
  specId?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  pricingMode?: PricingMode;
  actualWeight?: number;
  processingTypeId?: string;
  processingTypeName?: string;
  processingSpec?: string;
  lineNote?: string;
}

// ─── Processing Types (加工方式) ─────────────────────────────────

export type ProductType = 'standalone' | 'processed' | 'raw_material' | 'in_house' | 'third_party';

export type ProductClassification = 'raw_material' | 'third_party' | 'in_house';

export type PricingMode = 'fixed_pack' | 'by_piece';

export interface ProductGroup {
  id: string;
  name: string;
  nameEn?: string;
  classification: ProductClassification;
  ingredientId?: string;
  image?: string;
  category?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupabaseProductGroupRow {
  id: string;
  name: string;
  name_en?: string | null;
  classification: string;
  ingredient_id?: string | null;
  image?: string | null;
  category?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingType {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  spec?: string;
  surchargePorkChicken: number;
  surchargeBeefLambSeafood: number;
  requiresRepackaging: boolean;
  defaultPackWeightLb?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface SupabaseProcessingTypeRow {
  id: string;
  code: string;
  name: string;
  name_en?: string | null;
  spec?: string | null;
  surcharge_pork_chicken: number;
  surcharge_beef_lamb_seafood: number;
  requires_repackaging: boolean;
  default_pack_weight_lb?: number | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface MaterialProcessingEntry {
  id: string;
  ingredientId: string;
  processingTypeId: string;
  productId?: string;
  surchargeOverride?: number;
  yieldRateOverride?: number;
  isAvailable: boolean;
  notes?: string;
  createdAt?: string;
}

export interface SupabaseMaterialProcessingRow {
  id: string;
  ingredient_id: string;
  processing_type_id: string;
  product_id?: string | null;
  surcharge_override?: number | null;
  yield_rate_override?: number | null;
  is_available: boolean;
  notes?: string | null;
  created_at?: string;
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

// ─── Goods Receiving (收貨入倉) ─────────────────────────────────

export type GoodsReceiptStatus = 'draft' | 'confirmed' | 'cancelled';

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  ingredientId?: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  unit: string;
  unitCost: number;
  lineTotal: number;
  storageLocation?: string;
  brand?: string;
  reservedForClientId?: string;
  notes?: string;
  createdAt?: string;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  purchaseOrderId?: number;
  poNumber?: string;
  supplierName: string;
  receivedBy?: string;
  receivedAt: string;
  deliveryNoteNumber?: string;
  status: GoodsReceiptStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: GoodsReceiptItem[];
}

export type StockMovementType = 'receive' | 'production_out' | 'adjustment' | 'wastage' | 'return';

export interface StockMovement {
  id: string;
  ingredientId?: string;
  productId?: string;
  movementType: StockMovementType;
  quantity: number;
  unit?: string;
  referenceType?: string;
  referenceId?: string;
  performedBy?: string;
  performedAt: string;
  notes?: string;
  ingredientName?: string;
  lotId?: string;
}

// ─── Stock Lots (庫存批次) ──────────────────────────────────────

export type StockLotStatus = 'available' | 'reserved' | 'depleted' | 'expired';

export interface StockLot {
  id: string;
  ingredientId: string;
  brand?: string;
  supplierId?: string;
  supplierName?: string;
  goodsReceiptItemId?: string;
  receivedDate: string;
  expiryDate?: string;
  quantityReceived: number;
  quantityRemaining: number;
  unit: string;
  costPerUnit: number;
  storageLocation?: string;
  reservedForClientId?: string;
  reservedForClientName?: string;
  lotStatus: StockLotStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupabaseStockLotRow {
  id: string;
  ingredient_id: string;
  brand?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  goods_receipt_item_id?: string | null;
  received_date: string;
  expiry_date?: string | null;
  quantity_received: number;
  quantity_remaining: number;
  unit: string;
  cost_per_unit: number;
  storage_location?: string | null;
  reserved_for_client_id?: string | null;
  lot_status: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ─── Quotation types ────────────────────────────────────────────

// ─── Standard Remarks Library (備註檔案) ─────────────────────────

export type RemarkCategory = 'general' | 'delivery' | 'invoice' | 'payment' | 'order' | 'quotation' | 'product';

export interface StandardRemark {
  id: string;
  code: string;
  contentZh: string;
  contentEn: string;
  category: RemarkCategory;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Separate Invoice Entity (獨立發票) ──────────────────────────

export type InvoiceStatus = 'draft' | 'confirmed' | 'sent' | 'partial_paid' | 'paid' | 'cancelled' | 'void';

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  orderId?: string;
  productId?: string;
  productName: string;
  description?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  sortOrder: number;
  notes?: string;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  clientId?: string;
  clientName: string;
  clientCode?: string;
  brand?: WholesaleBrand;
  salespersonId?: string;
  salespersonName?: string;
  deliveryAddress?: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  warehouseId?: string;
  deliveryDate?: string;
  remarksTop?: string;
  remarksBottom?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lineItems?: InvoiceLineItem[];
  linkedOrderIds?: string[];
}

// ─── Client Price History (最後客戶貨物記錄) ─────────────────────

export interface ClientPriceHistory {
  id: string;
  clientId?: string;
  clientName: string;
  productId?: string;
  productName: string;
  unitPrice: number;
  qty?: number;
  unit?: string;
  currency: string;
  sourceType: 'order' | 'invoice' | 'quotation';
  sourceId?: string;
  sourceDate: string;
  createdAt?: string;
}

// ─── Batch Settlement (結數) ─────────────────────────────────────

export type SettlementType = 'ar' | 'ap';

export interface SettlementItem {
  id: string;
  settlementId: string;
  documentType: 'invoice' | 'ar' | 'ap' | 'credit_note' | 'debit_note';
  documentId: string;
  documentNumber: string;
  documentDate?: string;
  originalAmount: number;
  settledAmount: number;
  createdAt?: string;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  settlementType: SettlementType;
  settlementDate: string;
  clientId?: string;
  clientName?: string;
  supplierId?: string;
  supplierName?: string;
  bankAccountId?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  currency: string;
  totalAmount: number;
  discount: number;
  otherCharges: number;
  netAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: SettlementItem[];
}

// ─── Module Lock Dates (設定上鎖日期) ────────────────────────────

export type LockableModule = 
  | 'quotations' | 'orders' | 'invoices'
  | 'purchase_orders' | 'goods_receiving' | 'inventory'
  | 'ar' | 'ap' | 'gl' | 'production';

export interface ModuleLockDate {
  moduleKey: LockableModule;
  lockDate: string;
  updatedBy?: string;
  updatedAt?: string;
}

// ─── Currency (貨幣檔案) ─────────────────────────────────────────

export interface Currency {
  code: string;
  nameZh: string;
  nameEn: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
  isActive: boolean;
  updatedAt?: string;
}

// ─── Stock Valuation (期末結存) ──────────────────────────────────

export type ValuationMethod = 'average_cost' | 'standard_cost' | 'last_purchase';

export interface StockValuationLine {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  stockQty: number;
  averageCost: number;
  standardCost: number;
  lastPurchasePrice: number;
  valuationAmount: number;
}

// ─── Outstanding Order Line (訂單未交貨) ─────────────────────────

export interface OutstandingOrderLine {
  orderId: string;
  orderDate: string;
  deliveryDate?: string;
  clientName: string;
  clientCode?: string;
  productName: string;
  orderedQty: number;
  deliveredQty: number;
  outstandingQty: number;
  unit?: string;
  unitPrice: number;
  outstandingAmount: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface QuotationLineItem {
  productId?: string;
  productName: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
  processingTypeName?: string;
  processingSpec?: string;
  lineNote?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientId?: string;
  clientName: string;
  clientCode?: string;
  brand?: WholesaleBrand;
  status: QuotationStatus;
  quoteDate: string;
  validUntil?: string;
  lineItems: QuotationLineItem[];
  subtotal: number;
  total: number;
  notes?: string;
  convertedOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
}
