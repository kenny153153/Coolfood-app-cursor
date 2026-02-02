-- Run in Supabase SQL Editor after creating tables.

-- Categories
INSERT INTO public.categories (id, name, icon) VALUES
  ('hot', '店長推介', '🔥'),
  ('beef', '頂級牛肉', '🥩'),
  ('pork', '黑豚系列', '🥓'),
  ('seafood', '環球海鮮', '🦐'),
  ('hotpot', '火鍋配料', '🍢'),
  ('snacks', '炸物小食', '🍗')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (id, name, categories, price, member_price, stock, track_inventory, tags, image, description, origin, weight)
VALUES
  ('P-001', '美國 Prime 級肉眼 (300g)', '["beef"]', 128, 108, 25, true, '["熱賣","厚切"]', '🥩', '嚴選美國 Prime 級別，肉質鮮嫩，油花分佈均勻。', '美國', '300g'),
  ('P-002', '澳洲 M5 和牛肩胛 (250g)', '["beef"]', 138, 118, 18, true, '["人氣","油花"]', '🥩', '澳洲 M5 級和牛，口感柔嫩，油香濃郁。', '澳洲', '250g'),
  ('P-003', '西班牙黑毛豬梅頭 (300g)', '["pork"]', 88, 78, 30, true, '["回購"]', '🥓', '油花細緻，口感彈牙。', '西班牙', '300g'),
  ('P-004', '北海道帶子 (6 粒)', '["seafood"]', 158, 138, 20, true, '["海鮮","急凍"]', '🦐', '肉質鮮甜，適合煎炒。', '日本', '6pcs'),
  ('P-005', '潮州手打牛肉丸', '["hotpot"]', 65, 58, 40, true, '["火鍋"]', '🍢', '彈牙多汁，火鍋必備。', '香港', '300g'),
  ('P-006', '日式炸雞塊', '["snacks"]', 52, 45, 35, true, '["小食"]', '🍗', '外脆內嫩，方便加熱。', '日本', '250g')
ON CONFLICT (id) DO NOTHING;

-- Members (test login: chris@example.com / password123)
-- password_hash = SHA-256 hex of "password123"
INSERT INTO public.members (id, name, email, password_hash, phone_number, points, wallet_balance, tier, role, addresses)
VALUES
  ('u1', 'Chris Wong', 'chris@example.com', '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', '98765432', 450, 1000, 'Gold', 'customer',
   '[{\"id\":\"a1\",\"label\":\"屋企\",\"detail\":\"旺角亞皆老街8號朗豪坊辦公大樓 50樓\",\"contactName\":\"Chris Wong\",\"phone\":\"98765432\",\"isDefault\":true}]'),
  ('u2', '陳大文', 'taiman@gmail.com', '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', '65432109', 120, 50, 'Bronze', 'customer', NULL),
  ('u3', '張小明', 'siuming@outlook.com', '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', '51234567', 2800, 15.5, 'VIP', 'customer', NULL),
  ('admin1', 'Admin', 'admin@fridge-link.hk', '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', '00000000', 0, 0, 'Gold', 'admin', NULL)
ON CONFLICT (id) DO NOTHING;

-- Set test password for existing members (password: password123)
UPDATE public.members SET password_hash = '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090'
WHERE email IN ('chris@example.com', 'taiman@gmail.com', 'siuming@outlook.com', 'admin@fridge-link.hk');
