-- ═══════════════════════════════════════════════════
-- Wholesale Client → Member Merge Migration
-- Merges wholesale_clients operational fields into members table.
-- After this migration, wholesale_clients is kept read-only for reference;
-- all new operations use members exclusively.
-- ═══════════════════════════════════════════════════

-- 1. Add operational columns to members (from wholesale_clients)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS client_code TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS fax TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS district TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS route_id UUID DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS parent_member_id TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS salesperson_id UUID DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS payment_terms_type TEXT DEFAULT 'cod'
  CHECK (payment_terms_type IS NULL OR payment_terms_type IN ('cod', 'weekly', 'biweekly', 'monthly'));
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS wholesale_notes TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_wholesale_active BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.members.client_code IS 'Wholesale client code e.g. A0002-01';
COMMENT ON COLUMN public.members.fax IS 'Fax number';
COMMENT ON COLUMN public.members.district IS 'Delivery district';
COMMENT ON COLUMN public.members.route_id IS 'FK to delivery_routes for dispatch';
COMMENT ON COLUMN public.members.credit_limit IS 'Credit limit for AR';
COMMENT ON COLUMN public.members.parent_member_id IS 'Parent member ID for branch relationships';
COMMENT ON COLUMN public.members.salesperson_id IS 'FK to sales_representatives';
COMMENT ON COLUMN public.members.payment_terms_days IS 'Credit period in days';
COMMENT ON COLUMN public.members.payment_terms_type IS 'Payment type: cod/weekly/biweekly/monthly';
COMMENT ON COLUMN public.members.discount_percent IS 'Client-specific discount percentage';
COMMENT ON COLUMN public.members.wholesale_notes IS 'Operational notes for wholesale client';
COMMENT ON COLUMN public.members.is_wholesale_active IS 'Whether this wholesale account is operationally active';

-- 2. Index for client_code lookup
CREATE INDEX IF NOT EXISTS idx_members_client_code
  ON public.members (client_code)
  WHERE client_code IS NOT NULL;

-- 3. Migrate data from wholesale_clients into members
-- For each wholesale_client, find a matching member by phone + brand.
-- If a matching member exists, populate the new operational fields.
-- If no matching member exists, create a new member row.
DO $$
DECLARE
  wc RECORD;
  matched_member_id TEXT;
BEGIN
  FOR wc IN
    SELECT * FROM public.wholesale_clients WHERE is_active = TRUE
  LOOP
    -- Try to find a matching member by phone number + brand
    SELECT id INTO matched_member_id
    FROM public.members
    WHERE phone_number = wc.phone
      AND member_type = 'wholesale'
      AND (wholesale_brand = wc.brand OR wholesale_brand IS NULL)
    LIMIT 1;

    IF matched_member_id IS NOT NULL THEN
      -- Update existing member with operational data
      UPDATE public.members SET
        client_code = COALESCE(client_code, wc.client_code),
        district = COALESCE(district, wc.district),
        route_id = COALESCE(route_id, wc.route_id),
        credit_limit = GREATEST(credit_limit, COALESCE(wc.credit_limit, 0)),
        salesperson_id = COALESCE(salesperson_id, wc.salesperson_id),
        payment_terms_days = COALESCE(NULLIF(payment_terms_days, 0), wc.payment_terms_days, 0),
        payment_terms_type = CASE WHEN payment_terms_type = 'cod' AND wc.payment_terms_type IS NOT NULL THEN wc.payment_terms_type ELSE payment_terms_type END,
        discount_percent = GREATEST(discount_percent, COALESCE(wc.discount_percent, 0)),
        wholesale_notes = COALESCE(wholesale_notes, wc.notes),
        fax = COALESCE(fax, wc.fax),
        delivery_address = COALESCE(delivery_address, wc.address),
        wholesale_brand = COALESCE(wholesale_brand, wc.brand),
        is_wholesale_active = wc.is_active
      WHERE id = matched_member_id;
    ELSE
      -- Create a new member for this wholesale_client (no login account yet)
      INSERT INTO public.members (
        id, name, phone_number, email, points, tier, role,
        member_type, wholesale_price_tier, wholesale_status, wholesale_brand,
        company_name, delivery_address, client_code, fax, district,
        route_id, credit_limit, salesperson_id,
        payment_terms_days, payment_terms_type, discount_percent,
        wholesale_notes, is_wholesale_active
      ) VALUES (
        'wc-' || wc.id,
        COALESCE(wc.contact_name, wc.company_name),
        COALESCE(wc.phone, ''),
        wc.email,
        0, 'Bronze', 'customer',
        'wholesale', COALESCE(wc.price_tier, 'P0'), 'approved', wc.brand,
        wc.company_name, wc.address, wc.client_code, wc.fax, wc.district,
        wc.route_id, COALESCE(wc.credit_limit, 0), wc.salesperson_id,
        COALESCE(wc.payment_terms_days, 0), COALESCE(wc.payment_terms_type, 'cod'),
        COALESCE(wc.discount_percent, 0),
        wc.notes, wc.is_active
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Handle parent_client_id → parent_member_id mapping
    IF wc.parent_client_id IS NOT NULL THEN
      UPDATE public.members
      SET parent_member_id = (
        SELECT m2.id FROM public.members m2
        INNER JOIN public.wholesale_clients pc ON pc.phone = m2.phone_number AND pc.brand = m2.wholesale_brand
        WHERE pc.id = wc.parent_client_id
        LIMIT 1
      )
      WHERE id = COALESCE(matched_member_id, 'wc-' || wc.id);
    END IF;
  END LOOP;
END $$;

-- Also migrate inactive wholesale_clients
DO $$
DECLARE
  wc RECORD;
  matched_member_id TEXT;
BEGIN
  FOR wc IN
    SELECT * FROM public.wholesale_clients WHERE is_active = FALSE
  LOOP
    SELECT id INTO matched_member_id
    FROM public.members
    WHERE phone_number = wc.phone
      AND member_type = 'wholesale'
      AND (wholesale_brand = wc.brand OR wholesale_brand IS NULL)
    LIMIT 1;

    IF matched_member_id IS NOT NULL THEN
      UPDATE public.members SET
        client_code = COALESCE(client_code, wc.client_code),
        district = COALESCE(district, wc.district),
        route_id = COALESCE(route_id, wc.route_id),
        credit_limit = GREATEST(credit_limit, COALESCE(wc.credit_limit, 0)),
        salesperson_id = COALESCE(salesperson_id, wc.salesperson_id),
        payment_terms_days = COALESCE(NULLIF(payment_terms_days, 0), wc.payment_terms_days, 0),
        payment_terms_type = CASE WHEN payment_terms_type = 'cod' AND wc.payment_terms_type IS NOT NULL THEN wc.payment_terms_type ELSE payment_terms_type END,
        discount_percent = GREATEST(discount_percent, COALESCE(wc.discount_percent, 0)),
        wholesale_notes = COALESCE(wholesale_notes, wc.notes),
        fax = COALESCE(fax, wc.fax),
        delivery_address = COALESCE(delivery_address, wc.address),
        wholesale_brand = COALESCE(wholesale_brand, wc.brand),
        is_wholesale_active = FALSE
      WHERE id = matched_member_id;
    ELSE
      INSERT INTO public.members (
        id, name, phone_number, email, points, tier, role,
        member_type, wholesale_price_tier, wholesale_status, wholesale_brand,
        company_name, delivery_address, client_code, fax, district,
        route_id, credit_limit, salesperson_id,
        payment_terms_days, payment_terms_type, discount_percent,
        wholesale_notes, is_wholesale_active
      ) VALUES (
        'wc-' || wc.id,
        COALESCE(wc.contact_name, wc.company_name),
        COALESCE(wc.phone, ''),
        wc.email,
        0, 'Bronze', 'customer',
        'wholesale', COALESCE(wc.price_tier, 'P0'), 'approved', wc.brand,
        wc.company_name, wc.address, wc.client_code, wc.fax, wc.district,
        wc.route_id, COALESCE(wc.credit_limit, 0), wc.salesperson_id,
        COALESCE(wc.payment_terms_days, 0), COALESCE(wc.payment_terms_type, 'cod'),
        COALESCE(wc.discount_percent, 0),
        wc.notes, FALSE
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4. Rebuild members_safe view to include all new columns
DO $$
DECLARE
  col_list TEXT;
  safe_cols TEXT[] := ARRAY[
    'id','name','email','phone_number','points',
    'tier','role','admin_permissions','member_type',
    'wholesale_price_tier','wholesale_status','wholesale_brand',
    'company_name','business_type','branch_count',
    'br_doc_url','storefront_photo_url','storefront_preparing',
    'delivery_address','br_update_required','addresses',
    'security_level','session_issued_at',
    'client_code','fax','district','route_id','credit_limit',
    'parent_member_id','salesperson_id','payment_terms_days',
    'payment_terms_type','discount_percent','wholesale_notes',
    'is_wholesale_active'
  ];
  existing_cols TEXT[] := '{}';
  c TEXT;
BEGIN
  EXECUTE 'DROP VIEW IF EXISTS public.members_safe CASCADE';

  FOREACH c IN ARRAY safe_cols LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='members' AND column_name=c
    ) THEN
      existing_cols := existing_cols || c;
    END IF;
  END LOOP;

  col_list := array_to_string(existing_cols, ', ');
  EXECUTE 'CREATE VIEW public.members_safe AS SELECT ' || col_list || ' FROM public.members';
END $$;

-- 5. Update existing orders: remap wholesale_client_id to member id where possible
-- This ensures old orders link to the correct member
DO $$
DECLARE
  ord RECORD;
  new_member_id TEXT;
BEGIN
  FOR ord IN
    SELECT o.id, o.wholesale_client_id
    FROM public.orders o
    WHERE o.wholesale_client_id IS NOT NULL
  LOOP
    -- First try: direct member with prefixed id
    SELECT id INTO new_member_id
    FROM public.members WHERE id = 'wc-' || ord.wholesale_client_id
    LIMIT 1;

    -- Second try: match by phone from original wholesale_clients
    IF new_member_id IS NULL THEN
      SELECT m.id INTO new_member_id
      FROM public.members m
      INNER JOIN public.wholesale_clients wc ON wc.phone = m.phone_number AND wc.brand = m.wholesale_brand
      WHERE wc.id = ord.wholesale_client_id
      LIMIT 1;
    END IF;

    IF new_member_id IS NOT NULL THEN
      UPDATE public.orders SET wholesale_client_id = new_member_id WHERE id = ord.id;
    END IF;
  END LOOP;
END $$;

-- 6. Similarly remap accounts_receivable.client_id
DO $$
DECLARE
  ar RECORD;
  new_member_id TEXT;
BEGIN
  FOR ar IN
    SELECT a.id, a.client_id
    FROM public.accounts_receivable a
    WHERE a.client_id IS NOT NULL
  LOOP
    SELECT id INTO new_member_id
    FROM public.members WHERE id = 'wc-' || ar.client_id
    LIMIT 1;

    IF new_member_id IS NULL THEN
      SELECT m.id INTO new_member_id
      FROM public.members m
      INNER JOIN public.wholesale_clients wc ON wc.phone = m.phone_number AND wc.brand = m.wholesale_brand
      WHERE wc.id = ar.client_id
      LIMIT 1;
    END IF;

    IF new_member_id IS NOT NULL THEN
      UPDATE public.accounts_receivable SET client_id = new_member_id WHERE id = ar.id;
    END IF;
  END LOOP;
END $$;

-- 7. Remap stock_lots.reserved_for_client_id
DO $$
DECLARE
  sl RECORD;
  new_member_id TEXT;
BEGIN
  FOR sl IN
    SELECT s.id, s.reserved_for_client_id
    FROM public.stock_lots s
    WHERE s.reserved_for_client_id IS NOT NULL
  LOOP
    SELECT id INTO new_member_id
    FROM public.members WHERE id = 'wc-' || sl.reserved_for_client_id
    LIMIT 1;

    IF new_member_id IS NULL THEN
      SELECT m.id INTO new_member_id
      FROM public.members m
      INNER JOIN public.wholesale_clients wc ON wc.phone = m.phone_number AND wc.brand = m.wholesale_brand
      WHERE wc.id = sl.reserved_for_client_id
      LIMIT 1;
    END IF;

    IF new_member_id IS NOT NULL THEN
      UPDATE public.stock_lots SET reserved_for_client_id = new_member_id WHERE id = sl.id;
    END IF;
  END LOOP;
END $$;
