-- ═══════════════════════════════════════════════════════════════════
-- Order Status Migration & New Columns
-- Run in Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1) Add payment_intent_id for Airwallex refund support
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- 2) Add delivery_date for scheduled delivery
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_date TEXT;

-- 3) Migrate old status values to new enum
-- processing → preparing
UPDATE public.orders SET status = 'preparing' WHERE status = 'processing';

-- ready_for_pickup → shipping (發貨中)
UPDATE public.orders SET status = 'shipping' WHERE status = 'ready_for_pickup';

-- completed → delivered
UPDATE public.orders SET status = 'delivered' WHERE status = 'completed';

-- abnormal → shipping (keep active, admin can update)
UPDATE public.orders SET status = 'shipping' WHERE status = 'abnormal';

-- refund → refunded
UPDATE public.orders SET status = 'refunded' WHERE status = 'refund';

-- 4) Create index on payment_intent_id for refund lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);

-- 5) Create index on status for faster tab filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
