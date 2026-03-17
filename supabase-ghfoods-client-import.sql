-- Auto-generated import from 客戶資料.xls
-- Run AFTER supabase-sales-commission-migration.sql

-- ═══ Step 1: Insert Sales Representatives ═══

INSERT INTO sales_representatives (name, brand) VALUES ('A1', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('AKINA', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('ALICE', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('B/B', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('BOEY.', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('BOSCO', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('CC001', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('CC003', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('CC005', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('CC011', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('CC012', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('DICKY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('EILLE', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('ELLIE', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('FACEBOOK', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('JACKY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('JIMMY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KAREN', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KATIE', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KEN', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KINKI', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KIT', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KY/BOEY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KY/BOEY.', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KY/BRUCE', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('KY/CS', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('LENA', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('LEO', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('M LEUNG', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('MAY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('OSCAR', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('PEGGY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('PETER', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('SANDY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('SLEEK', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('WILLIAM', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('Y/BOEY', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('俊哥', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('范生', 'GHFOODS') ON CONFLICT DO NOTHING;
INSERT INTO sales_representatives (name, brand) VALUES ('飛', 'GHFOODS') ON CONFLICT DO NOTHING;

-- ═══ Step 2: Insert Wholesale Clients ═══
-- First pass: all clients (parent_client_id set in step 3)

INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A', 'Foodgaeden', '', '28689155', NULLIF('',''), NULLIF('',''), '荔枝角長義街9號D2 1期3樓303號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0001', '榮希有限公司 (火炭)', '', '', NULLIF('38475981',''), NULLIF('',''), '火炭坳背灣街38-40號華衛工貿中心1415室', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002', 'Red Rice 米飯主題餐廳(OFFICE)', 'Kat Yip', '', NULLIF('2898 8553',''), NULLIF('',''), '', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-01', 'Red Rice 米飯主題餐廳 (六合街)', '', '3622 3880', NULLIF('',''), NULLIF('',''), '九龍新蒲崗六合街11-13號', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-02', 'Red Rice 米飯主題餐廳 (荔枝角)', '', '', NULLIF('',''), NULLIF('',''), '長沙灣長沙灣道 833 號', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-03', '時代冰室(馬鞍山)', '', '', NULLIF('',''), NULLIF('',''), '馬鞍山西沙路632號,頌安商場1樓113室', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-04', '時代冰室(九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣常悅道20號環球工商大廈地下1B號舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-05', '時代冰室(沙田沙角村)', '', '', NULLIF('',''), NULLIF('',''), '沙田沙角村沙角商場2樓222舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-06', '時代冰室(慈雲山)', '', '', NULLIF('',''), NULLIF('',''), '九龍慈雲山毓華里12-14號地舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-07', 'Red Rice 米飯主題餐廳 (屯門)', '', '', NULLIF('',''), NULLIF('',''), '屯門屯利街1號華都商場3樓5B1號舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-08', '時代冰室(長沙灣)', '', '', NULLIF('',''), NULLIF('',''), '長沙灣青山道305號地下1B舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-09', '時代冰室(新浦崗祟齡街)', '', '', NULLIF('',''), NULLIF('',''), '新蒲崗崇齡街81-83號地下', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-10', '時代冰室(太子)', '', '', NULLIF('',''), NULLIF('',''), '深水步長沙灣道21-25號地下A鋪', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-11', '神燈燒(旺角)', '', '9533 3767 家豪', NULLIF('',''), NULLIF('',''), '油麻地彌敦道565號至567號LG', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-12', '拾元店(九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣常悅道20號環球工商大廈地下', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-13', '堅韓牛 (旺角)', '', '', NULLIF('2898 8553',''), NULLIF('',''), '旺角彌敦道726號726大廈16樓', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0002-14', '拾元店(新浦崗崇齡街)', '', '', NULLIF('',''), NULLIF('',''), '新蒲崗崇齡街81-83號地下', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003', '大喜屋日本料理 (OFFICE)', '', '', NULLIF('27212821',''), NULLIF('1M+031',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-01', '殿大喜屋日本料理 (尖沙咀)', '', '', NULLIF('27212821',''), NULLIF('',''), '九龍尖沙咀金巴利道26號1樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-02', '樂天大喜屋日本料理 (旺角)', '', '3188 8818 / 3188', NULLIF('',''), NULLIF('',''), '九龍旺角彌敦道593-601號創興廣場2樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-03', '大喜屋日本料理(沙田)', '', '', NULLIF('27212821',''), NULLIF('',''), '沙田廣場1樓33,44-46號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-04', '極尚大瀛喜日本料理 (旺角)', '', '', NULLIF('2721-2821',''), NULLIF('',''), '旺角彌敦道 655 號 5 樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-05', '極尚大喜屋日本料理 (銅鑼灣一期)', '', '3188 8838', NULLIF('',''), NULLIF('',''), '銅鑼灣軒尼詩道489號銅鑼灣廣場一期9樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-06', '極尚大瀛喜日本料理 (銅鑼灣二期)', '', '31888008/3188800', NULLIF('',''), NULLIF('',''), '銅鑼灣駱克道 463-483 銅鑼灣廣場二期11樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-07', '極尚大瀛喜日本料理 (觀塘)', '', '31882628 /', NULLIF('',''), NULLIF('',''), '觀塘觀塘道 414 號 1 亞太中心 5 樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-08', '極尚大瀛喜日本料理 (元朗)', '', '3188 3330/3188', NULLIF('',''), NULLIF('',''), '元朗元龍街9號形點1期2樓2001A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-09', '極尚大喜屋日本料(觀塘)', '', '', NULLIF('27212821',''), NULLIF('',''), '觀塘開源道79號鱷魚恤中心3樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-10', '極尚大喜屋日本料理(旺角)', '', '31888818', NULLIF('',''), NULLIF('',''), '旺角彌敦道639號雅蘭中心4樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-11', '大喜屋工場(土瓜灣)', '', '', NULLIF('',''), NULLIF('',''), '土瓜灣道94美華工業大廈B座 7樓9室', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0003-12', '極尚大瀛喜日本料理(荃灣)', '', '', NULLIF('27212821',''), NULLIF('',''), '荃灣廣場 6樓609-613', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0004', '博愛醫院(OFFICE)', '', '', NULLIF('',''), NULLIF('1M+025',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0004-01', '博愛醫院戴均護理安老院(天水圍)(車期二、四、六)', '', '', NULLIF('2447 3886',''), NULLIF('2448 2290',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0004-02', '博愛醫院賽馬會護理安老院(元朗)', '', '2478 5838', NULLIF('',''), NULLIF('',''), '元朗坳頭(係博愛醫院隔離)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0004-03', '博愛醫院楊晉培護理安老院(元朗屏廈路)', '', '2472 1377', NULLIF('',''), NULLIF('',''), '元朗屏廈路廈村沙州里村58號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0004-04', '博愛醫院百周年陳是紀念護養院暨日間中心(元朗)(車期一、五)', '', '', NULLIF('2712 0998',''), NULLIF('2712 0977',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005', '冷凍先生有限公司', '', '', NULLIF('',''), NULLIF('1M+020',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-01', '富豪U購華潤(沙田)', '', '9872 4582', NULLIF('',''), NULLIF('',''), '沙田大涌橋路富豪花園商場地下3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-02', '啟業U購華潤(九龍灣)', '', '', NULLIF('24143736',''), NULLIF('',''), '九龍灣啟業商場地下１號舖', 'GHFOODS', 'P0', 50, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-03', '宏景華潤(鑽石山)', '', '9124 6841', NULLIF('',''), NULLIF('',''), '鑽石山斧山道185號宏景花園一樓D&E舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-04', '和田村U購店(屯門)', '', '', NULLIF('24143736',''), NULLIF('',''), '屯門和田村和田商場1樓103號鋪', 'GHFOODS', 'P0', 50, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-06', '三聖村華潤(屯門)1:00前', '', '9872 4582 潘生', NULLIF('',''), NULLIF('',''), '屯門三聖村商場地下3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-07', '富善街市(大埔)  (加多兩包冰', '', '', NULLIF('24143736',''), NULLIF('',''), '大埔富善村街市 SS12號', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-08', '牛頭角華潤(牛頭角)', '', '6708 2658', NULLIF('',''), NULLIF('',''), '九龍牛頭角上村商場 5 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-09', '天恩華潤(天水圍)', '', '', NULLIF('2414 3736',''), NULLIF('',''), '天水圍天恩村天恩商場一樓102號舖(凍肉部)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-10', '碧堤U購(深井)', '', '', NULLIF('24143736',''), NULLIF('',''), '青山公路33號碧提坊第三層10號舖', 'GHFOODS', 'P0', 50, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-11', '太子U購(太子)', '', '', NULLIF('24143736',''), NULLIF('',''), '太子道西181-183號美輪大廈地下', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-12', '牽晴間U購(粉嶺)', '', '', NULLIF('24143736',''), NULLIF('',''), '粉嶺一鳴路牽晴間商場地下U購超級市場(凍肉', 'GHFOODS', 'P0', 50, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0005-14', '滿東村U購(東涌)12點前送到', '', '', NULLIF('24143736',''), NULLIF('',''), '東涌滿東村滿樂坊地下G08號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0006-01', '和氣食堂 (黃大仙)', '', '2641 8829', NULLIF('',''), NULLIF('',''), '黃大仙中心南館地下G12A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0006-02', '和氣食堂 (沙田)', '', '2637 1800', NULLIF('',''), NULLIF('',''), '沙田河畔花園地下35號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0006-03', '和氣食堂 (屯門)', '', '66030554', NULLIF('',''), NULLIF('',''), '屯門寶怡花園商場地下9-11號', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0006-4', 'EAT燒肉和氣(沙田)', '', '', NULLIF('',''), NULLIF('',''), '沙田河畔花園19-20號鋪地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0007-01', 'CLUB ONE (淺水灣)', '', '', NULLIF('',''), NULLIF('',''), '淺水灣海灘道16號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0007-02', 'CLUB ONE (西港城大舞台)', '', '26209327', NULLIF('',''), NULLIF('',''), '香港德輔道中323號西港城2樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0008-01', 'Kampoeng (銅鑼灣)', '', '2488 1492', NULLIF('',''), NULLIF('',''), '銅鑼灣糖街1-5號銅鑼灣商業大廈地庫', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0008-02', 'Warung Chandra(旺角)', '', '', NULLIF('',''), NULLIF('',''), '旺角道93號華懋王子大廈地下3A鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0009-01', '牛知己韓湯火鍋放題 (元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗安寧路 38 號世宙3座地下 26, 27舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0009-02', '知漁滋味(元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗安寧路 38 號世宙3座地下 26, 27舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0009-03', '韓牛牧場 (銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣登龍街28號永光中心3樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0010-01', '漁之部屋 (天晉匯)12:00前送達', '', '2886 5550', NULLIF('',''), NULLIF('',''), '將軍澳唐俊街12號天晉匯1樓101號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0010-02', '漁屋日本料理 (大埔)', '', '2724 4808', NULLIF('',''), NULLIF('',''), '大埔安慈路1號海寶花園地下8A-9A號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0010-03', '漁屋日本料理 (荃新天地)', '', '2481 2688', NULLIF('',''), NULLIF('',''), '荃灣楊屋道18號荃新天地二期UG09-11舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0011-01', '冰室小菜館(深水步青山道)', '', '9517 1211', NULLIF('',''), NULLIF('',''), '深水步青山道156-162號永基商業大廈地下A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0011-02', '冰室小菜館 (油麻地)', '', '9383 3759', NULLIF('',''), NULLIF('',''), '九龍油麻地彌敦道509號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0011-03', '冰室小菜館(土瓜灣)10點前送', '', '9517 1211', NULLIF('',''), NULLIF('',''), '九龍土瓜灣北帝街12-16號地下及馬坑涌道2A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012', '金坊泰國美食(OFFICE)', '', '', NULLIF('',''), NULLIF('',''), '荃灣柴灣角街 84至92號 順豐工業中心 28樓H室', 'GHFOODS', 'P0', 90, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-01', '金坊泰國美食 (將軍澳)', '', '', NULLIF('29972118',''), NULLIF('',''), '將軍澳新都城二期 2016舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-02', '金坊泰國美食 (紅磡)', '', '2334 3271', NULLIF('',''), NULLIF('',''), '紅磡民泰街 43 號地下 C1 舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-03', '金坊泰國美食 (荃灣)[荃興徑]送貨時間：12點前，3點後', '', '', NULLIF('2334 4422',''), NULLIF('29972118',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-04', '金坊泰國美食 (荃灣)[兆和街]', '', '2744 4366', NULLIF('',''), NULLIF('',''), '荃灣兆和街 38-40 號荃灣美食城 3 樓全層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-05', '金坊泰國美食(荃灣工場）11時前 或者兩點後', '', '', NULLIF('29972118',''), NULLIF('',''), '荃灣柴灣角街 84至92號 順豐工業中心 20樓G', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0012-06', '大城船麵(銅鑼灣)(早到,一定要放入廚房)', '', '', NULLIF('2997 2118',''), NULLIF('',''), '銅鑼灣謝斐道483-499號新城大廈地下G&H鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013', '美利飲食有限公司 (大埔)', '', '3746 9769 , 2304', NULLIF('2304 6390',''), NULLIF('1M+060',''), '新界大埔汀角路55號太平工業中心第2座9樓A、B、D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-00', '美利小食部', '', '', NULLIF('',''), NULLIF('1M+060',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-01', '香港真光書院(鴨利洲)', '', '6220 1568', NULLIF('',''), NULLIF('',''), '香港鴨利洲利東?道一號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-02', '聖公會林護紀念中學(葵涌)', '', '6359 8059', NULLIF('',''), NULLIF('',''), '新界葵涌葵盛圍397號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-03', '香港四邑商工總會陳南昌紀念中學(葵涌)', '', '5506 1763萍姐', NULLIF('',''), NULLIF('',''), '新界葵涌祖堯村敬祖路12號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-04', '港九街坊婦女會孫方中書院(大埔)', '', '6760 0823', NULLIF('',''), NULLIF('',''), '新界大埔大埔公路大埔滘段4643號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-05', '聖馬可中學(筲箕灣)', '', '9420 0295', NULLIF('',''), NULLIF('',''), '香港筲箕灣愛秩序灣愛賢街18號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-06', '西貢祟真天主教學校(中學部)', '', '9805 1598', NULLIF('',''), NULLIF('',''), '新界西貢普通道', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-07', '東華三院郭一葦中學(天水圍)', '', '6078 5422', NULLIF('',''), NULLIF('',''), '新界天水圍聚星路3號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-08', '香港真光中學(銅鑼灣)', '', '9465 5196', NULLIF('',''), NULLIF('',''), '香港大坑道50號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-09', '藍田聖保祿中學(藍田)', '', '9573 7115', NULLIF('',''), NULLIF('',''), '九龍觀塘藍田安田街10號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-10', '潮州會館中學(馬鞍山)', '', '9030 2051', NULLIF('',''), NULLIF('',''), '新界沙田馬鞍山恆安村', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-11', '大埔舊墟公立小學(大埔)', '', '98001207', NULLIF('',''), NULLIF('',''), '大埔安祥路10號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-12', '新生命教育平安福音中學(屯門)', '', '93289208', NULLIF('',''), NULLIF('',''), '新界屯門恆貴街三號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-13', '迦密中學 (何文田)', '', '60439666', NULLIF('',''), NULLIF('',''), '九龍何文田忠孝街55號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-14', '田家炳中學(粉嶺)', '', '6292 8532', NULLIF('',''), NULLIF('',''), '粉嶺維翰路一號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-15', '保良局羅傑承(一九八三)中學 (青衣)', '', '61753558(劉小姐)', NULLIF('',''), NULLIF('',''), '青衣青康路12號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-16', '李求恩記念中學 (九龍城)', '', '69081870', NULLIF('',''), NULLIF('',''), '九龍新蒲崗太子道東596號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-17', '羅定邦中學(大埔)', '', '94801263', NULLIF('',''), NULLIF('',''), '新界大埔馬聰路8號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-18', '十八鄉鄉事委員會公益社小學(天水圍)', '', '55973623', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-19', '伊利沙伯舊生會中學(天水圍)', '', '', NULLIF('2304 6390',''), NULLIF('',''), '天水圍天城路18號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-20', '迦密唐賓南紀念中學(屯門)', '', '', NULLIF('2304 6390',''), NULLIF('',''), '屯門湖月街2號', 'GHFOODS', 'P0', 90, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-21', '香港道教聯合會圓玄學院第二中學(大埔 富善)', '', '9383 0315', NULLIF('',''), NULLIF('',''), '大埔 富善', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-22', '佐敦谷聖若瑟天主教小學(牛頭角)', '', '93798483', NULLIF('',''), NULLIF('',''), '九龍牛頭角彩霞道80號.', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-23', '大埔浸信會公立學校(大埔)', '', '55453239', NULLIF('',''), NULLIF('',''), '新界大埔廣福部', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-24', '瑪利諾修院小學(九龍塘)中午1:00 前到', '', '', NULLIF('2304 6390',''), NULLIF('',''), '九龍塘窩打老道130號', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-25', '德貞女子中學(深水埗)', '', '', NULLIF('2304 6390',''), NULLIF('',''), '深水埗興華街西9號', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0013-26', '聖公會基樂小學(樂華北邨)', '', '93798483 梁小姐', NULLIF('',''), NULLIF('',''), '九龍牛頭角樂華邨', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0014-01', '德美壽司 (沙田)', '', '2341 0123', NULLIF('',''), NULLIF('',''), '沙田沙田圍路9-11號田園閣地下E舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0014-02', '鮨岐壽司(紅磡)', '', '', NULLIF('3753 3162',''), NULLIF('',''), '紅磡必嘉街92-112號紅磡灣中心地下11號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'EILLE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0014-03', '德美壽司 (大埔)', '', '9031 2356', NULLIF('',''), NULLIF('',''), '大埔汀角路翠和里1A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0014-04', '德美壽司 (紅磡德民街)', '', '23348884', NULLIF('',''), NULLIF('',''), '紅磡黃埔新村德民街31號地下1B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0015-01', '山旮旯 (銅鑼灣)(已結業)', '', '2871 2269', NULLIF('',''), NULLIF('',''), '銅鑼灣摩利臣山道84-86號帆船酒店地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0015-02', '留白 (尖沙咀)-原名山旮旯', '', '2868 4333', NULLIF('',''), NULLIF('',''), '尖沙咀博物館道18號, 西九文化區自由空間地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0016-01', '金域冰室 (銅鑼灣)', '', '', NULLIF('23380235',''), NULLIF('',''), '銅鑼灣渣甸街54-58號地下1-2號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0016-02', '金域冰室 (旺角)', '', '', NULLIF('23380235',''), NULLIF('',''), '旺角 豉油街60-102號 鴻都大廈 地下A2舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0016-03', '維記 (西營盤)', '', '', NULLIF('23380235',''), NULLIF('',''), '堅尼地城科士街36號', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0017-01', '炙和味日本料理(屯門)', '', '6194 7822', NULLIF('',''), NULLIF('',''), '屯門時代廣場北翼地下41-42號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0017-02', '炙和味日本料理(荃灣)', '', '6194 7822 (Dee', NULLIF('',''), NULLIF('',''), '新界荃灣荃華街3號悅來坊地庫一樓B119A號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0017-03', '炙尚串燒料理(沙田)', '', '', NULLIF('',''), NULLIF('',''), '沙田橫壆街1-15號好運中心3樓3107-3108號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0018-01', '令和鍋物酒場(尖沙咀)放後門', '', '9337 6625', NULLIF('',''), NULLIF('',''), '尖沙咀厚福街9號豪華閣1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0018-02', '令和鍋物酒場 (旺角) 放後門', '', '2481 1388', NULLIF('',''), NULLIF('',''), '旺角彌敦道613號飛達商業中心1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0018-03', 'OPPA韓國燒肉店 (大埔)12點 要後門入放廚房', '', '3565', NULLIF('',''), NULLIF('',''), '大埔舊墟直街4-20號美新大廈地下B2舖', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0018-04', 'OPPA韓國燒肉店 (旺角) 放後門,影相', '', '2381 2193', NULLIF('',''), NULLIF('',''), '旺角洗衣街117號建煌華廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-01', '延記點心有限公司(觀塘)(11點前必須要到)', '', '53085234', NULLIF('',''), NULLIF('',''), '觀塘 成運工業大廈 4樓21室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-02', '本延鍋物有限公司(灣仔)', '', '', NULLIF('',''), NULLIF('',''), '灣仔謝斐道379-389號地下 6-7號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-03', '延燒肉(中環)', '', '6530 0722', NULLIF('',''), NULLIF('',''), '中環九如坊6-10號林氏大廈地下B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-04', '知延屋(歌賦街)', '', '9163 1049', NULLIF('',''), NULLIF('',''), '中環歌賦街12號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-05', '知延屋(北角)', '', '94382429', NULLIF('',''), NULLIF('',''), '北角七姊妹道NO.100-104天順樓地下B3店', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0019-06', '知延食堂', '', '94382429', NULLIF('',''), NULLIF('',''), '尖沙咀金馬倫道19號A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0020-01', '燒皇燒烤專門店 (新蒲崗)', '', '', NULLIF('',''), NULLIF('',''), '新蒲崗衍慶街34號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0020-02', '燒皇燒烤專門店 (荃灣)', '', '63534343', NULLIF('',''), NULLIF('',''), '荃灣鱟地坊 87 號華成樓 B座地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0020-03', '燒皇燒烤雞保煲專門店 (上水)', '', '', NULLIF('',''), NULLIF('',''), '上水符興街3號地舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0020-04', '泰皇殿(荃灣)', '', '', NULLIF('',''), NULLIF('',''), '鱟地坊48-68號祐建樓地下B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0021', '美利飲食服務有限公司 (屯門)', '', '2454 8993', NULLIF('',''), NULLIF('',''), '新界屯門天后路18號南豐工業城第五座7樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0022', '億鋒有限公司(豚王)觀塘', '', '95039228', NULLIF('',''), NULLIF('',''), '九龍觀塘海濱道139-141號海濱中心2樓201-3號室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0023', '心意飲食公司(金基)', '', '24246297', NULLIF('',''), NULLIF('',''), '葵涌大連排道35-41號金基工業大廈地下A1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0024', '台灣客棧(葵涌)貨放貨倉，不可放廳面', '', '56289966', NULLIF('',''), NULLIF('',''), '葵涌和宜合道151號勝利工業大廈地下A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0024-1', '濠景小籠包(葵涌)貨放貨倉，不可放廳面', '', '56289966', NULLIF('',''), NULLIF('',''), '葵涌和宜合道151號勝利工業大廈地下A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025', '星聚-牛摩', '', '37095027', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-1', '牛摩 (沙田)十一點開一定要有公司印收(冇人先放後門)', '', '', NULLIF('26061222',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-10', '牛摩(深水埗）篤篤船麵十一點開一定要有公司印收', '', '', NULLIF('27207328',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-11', '南昌漁釧 (深水?)(送貨時間11:00-4:00)', '', '2720 7311', NULLIF('',''), NULLIF('1M+015',''), '九龍深水?深旺
道28號V-WALK 地下G19號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-12', 'wake up bistro(粉嶺)', '', '3003 3886', NULLIF('',''), NULLIF('1M+015',''), '粉嶺聯和市場聯和道51號聯和趁墟RETAIL ZONE STALL S17-S36舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-2', '牛摩(將軍澳)十一點開一定要有公司印收', '', '23513381', NULLIF('',''), NULLIF('30',''), '將軍澳貿業路8號新都城中心2期2樓2060-2062號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-3', '牛摩  (上水)十一點開一定要有公司印收', '', '39984630', NULLIF('',''), NULLIF('',''), '上水龍琛路39號上水廣場5樓513號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-4', '牛摩 (荃灣) 十一點開一定要有公司印收', '', '23208260', NULLIF('',''), NULLIF('',''), '荃灣眾安街68號千色匯I期2樓2031號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-5', '牛摩 (屯門)十一點開一定要有公司印收', '', '26130088', NULLIF('',''), NULLIF('',''), '屯門屯隆街2號屯門時代廣場南翼3樓21號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-6', '氣噗噗 (馬鞍山)十一點開一定要有公司印收', '', '28058393', NULLIF('',''), NULLIF('1M+015',''), '馬鞍山鞍祿街18號MOSTown新港城中心(5期)2樓2724-2730號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-7', '牛摩(調景嶺)', '', '', NULLIF('',''), NULLIF('1M+015',''), '將軍澳調景嶺景嶺路8號都會駅2樓L2-K01A及L2-039號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-8', 'HOKO Farm (鑽石山)', '', '37095020', NULLIF('',''), NULLIF('',''), '九龍鑽可山荷里活廣場2樓288號', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0025-9', '麗春園(天後)', '', '2899 0882', NULLIF('',''), NULLIF('',''), '香港天后電氣道68號金輪天地19樓', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0026', '八號碼頭點心蒸飯專門店(荔枝角)', '黃小姐', '2310 1189', NULLIF('',''), NULLIF('',''), '荔枝角青山道489-491號香港工業中心A座地下A4B號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0027', '尚好環球(土瓜灣)', '', '36862516', NULLIF('',''), NULLIF('',''), '土瓜灣長寧街11號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0028', '華峰美食(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘駿業里10號業運工業大廈1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0029', '犀牛犀牛(將軍澳)', '', '62117716', NULLIF('',''), NULLIF('',''), '將軍澳至善街3號G08A鋪(澳南海岸)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0030', '進域餐飲集團有限公司(官塘)12點後開門', '', '', NULLIF('',''), NULLIF('',''), '香港觀塘興業街31號興業中心7樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0030-01', '小熊餐飲有限公司(觀塘)', '', '68244003', NULLIF('',''), NULLIF('',''), '觀塘興業中心8樓a及b室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0031', '思神食品超市(紅磡)', '', '53617022', NULLIF('',''), NULLIF('',''), '九龍馬頭圍道96號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0032', '豐受居酒屋(觀塘)九點左右到', '', '62869939', NULLIF('',''), NULLIF('1M+015',''), '觀塘鴻圖道83號東瀛遊廣場地下A號鋪(請用KG計)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0033', '山戶屋(觀塘)', '', '23336662', NULLIF('',''), NULLIF('',''), '觀塘道398號Eastcore1樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0034', '嫲嫲上海私房菜(觀塘)', '', '96846110', NULLIF('',''), NULLIF('',''), '觀塘興業街16-18號美興工業大廈A座6樓7室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0035', '93親古食堂(將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '新界將軍澳唐明街1號富康花園地下46舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0036', '阿元來了(觀塘)', '', '37059848', NULLIF('',''), NULLIF('',''), '觀塘鴻圖道28號地下後座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0037', '寶園餐廳(將軍澳)', '', '63502240', NULLIF('',''), NULLIF('',''), '將軍澳毓雅里9號慧安商場大堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0038', 'Rainbow Eat(觀塘)', '', '61539623', NULLIF('',''), NULLIF('李小姐',''), '官塘駿業里6號
富利工業大廈14樓B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0038-01', '印度餐廳(將軍澳)', '', '6153-9623', NULLIF('',''), NULLIF('0',''), '將軍澳毓雅里9號
寶琳慧安商場一樓B66-67號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0039', 'Leteatgo(油塘)', '', '96200393', NULLIF('',''), NULLIF('',''), '油塘茶果嶺道610號生利工業中心6/F 9室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0040', '舌丼日式餐廳', 'Jacky 大廚', '6621 5434', NULLIF('',''), NULLIF('',''), '官塘開源道62號
駱駝漆大廈3座1字樓R室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0041', 'FaceToFace Kitchen & Bar (灣仔)', '', '96826126', NULLIF('',''), NULLIF('',''), '香港灣仔譚臣道8號威利商業大厦地下C鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0042', '一樂燒(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘巧明街105號好運工業大廈7樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0043', '正品專賣(觀塘)', '', '', NULLIF('',''), NULLIF('0',''), '香港九龍觀塘興業街16-18號美興工業大廈A座11字樓8室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0044', '韓風(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘開源道60號駱駝漆大廈3座6樓S2室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0045', '山打根( 將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳唐俊街23號Monterey 商場地舖G12', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0046', '豬隊友(觀塘牛頭角)', '', '6086-1940', NULLIF('',''), NULLIF('',''), '牛頭角通明街3號興達大廈地下3B舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0046-01', '豬隊友（尖沙咀）盡量12點後送', '', '', NULLIF('',''), NULLIF('',''), '尖沙咀加拿分道8-12E號嘉芬大廈地下I舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0046-02', '豬隊友(荃灣)', '', '', NULLIF('',''), NULLIF('',''), '荃灣鱟地坊76-78號 天保大樓 地下F2舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0046-03', '豬隊友中央廚房(新蒲崗)', '', '', NULLIF('',''), NULLIF('',''), '九龍新蒲崗大有街33號佳力工業大廈23樓2號室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0046-04', '茶角(西灣河)', '', '62072287', NULLIF('',''), NULLIF('',''), '西灣河筲箕灣道 57-87號 太安樓地下 A25B 號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0047', '唷溫體牛火鍋(旺角) 3:00後送', '', '23632838', NULLIF('',''), NULLIF('',''), '旺角黑布街97號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0048', 'NeNe Chicken (東港城)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳重華路8號東港城2樓225號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0049', 'Times Coffee(觀塘)', '', '53653963', NULLIF('',''), NULLIF('',''), '觀塘興業街美興工業大廈一樓C1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0050', '山見台式火鍋', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0050-01', '山見台式火鍋 (荃灣如心廣場)一定要蓋章', '', '26200332', NULLIF('',''), NULLIF('',''), '荃灣楊屋道8號如心廣場1期1樓126-127號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0050-02', '山見台式火鍋(觀塘)一定要蓋章', '', '36282339', NULLIF('',''), NULLIF('',''), '觀塘觀塘道418號創紀之城五期apm5樓L5-1號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0050-03', '山見(屯門)', '', '23318002', NULLIF('',''), NULLIF('',''), '屯門屯順街1號屯門市廣場1期3樓3229號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0050-04', '山見台式火鍋 (雅蘭中心)旺角', '', '23118002', NULLIF('',''), NULLIF('',''), '旺角彌敦道639號雅蘭中心2樓201號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0051-01', '丸亀製麵 (太古城中心)', '', '', NULLIF('',''), NULLIF('0',''), '太古太古城道18號太古城中心B1樓Apita TKS-03號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0051-02', '丸亀製麵 (觀塘海濱匯)', '', '', NULLIF('',''), NULLIF('',''), '觀塘海濱道77號海濱匯2樓3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0051-03', '丸亀製麵 (新都城中心二期)', '', '', NULLIF('',''), NULLIF('0',''), '將軍澳寶琳欣景路8號新都城中心二期高層地下UG051E號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-01', '粵藝館(尖沙咀海運大廈)送後門', '', '22972022', NULLIF('',''), NULLIF('procurement@thefoodstory.hk',''), '尖沙咀廣東道3-27號海港城海運大廈3樓OT310號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-02', '松藝館(尖沙咀)', '', '28852030', NULLIF('',''), NULLIF('1M+015',''), '尖沙咀廣東道3-27號海港城海運大廈3樓OTE303號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-03', 'HUSO(中環)', '', '58011280', NULLIF('',''), NULLIF('',''), '中環皇后大道中74號石板街酒店1樓2號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-04', 'Camellia(尖沙咀)', '', '28852320', NULLIF('',''), NULLIF('1M+015',''), '尖沙咀梳士巴利道18號維港文化匯K11 Musea 地下033號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-05', '粵藝館(銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣勿地臣街1號時代廣場10樓1001A號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0052-06', '月山(中環)', '', '6823 9102', NULLIF('',''), NULLIF('1M+015',''), '中環皇后大道中80號
H Queen’s 19樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0053', '彩福皇宴(安達中心)', '', '27663538', NULLIF('',''), NULLIF('',''), '尖沙咀麼地道65號安達中心13樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0054-01', '同昇有限公司(寫字樓)', '', '', NULLIF('',''), NULLIF('',''), '柴灣祥利街29號國貿中心12樓1202室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0054-02', '拍檔極品海南雞飯(天后)', '', '', NULLIF('',''), NULLIF('',''), '天后電氣道54號亨環‧天后地下5號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0054-03', '拍檔極品海南雞飯(油塘)', '', '9230 9121', NULLIF('',''), NULLIF('',''), '九龍油塘大本型MTR層M08號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0055', '品味冰室(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘開源道55號開聯工業中心A座地下5號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0056', '創意廚房(新蒲崗)', '', '6106 8181', NULLIF('',''), NULLIF('',''), '新蒲崗景福街110號超達工業大廈7樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0057', '頤和家麵館(觀塘)', '', '9717 8938', NULLIF('',''), NULLIF('',''), '觀塘巧運工業大廈11樓A室A5單位', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0058', '富記燒味（觀塘）', '', '55380911', NULLIF('',''), NULLIF('',''), '九龍觀塘協和街113號B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0059', 'GALI.HK(觀塘)', '', '6153 9623', NULLIF('',''), NULLIF('',''), '九龍觀塘駿業里6號富利工業大廈14樓 B 室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0059-01', 'YANTO YEA(將軍澳寶琳)11:30後收錢', '', '', NULLIF('',''), NULLIF('',''), '將軍澳寶琳毓雅里9號慧安商場1樓B66-B67號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0059-02', 'YANTO YEA(北角)', '', '61539623', NULLIF('',''), NULLIF('',''), '北角電氣道城市花園地下10座FLAT/RM 45', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0060', '啟鑽醉和里（鑽石山）', '', '5114 1484', NULLIF('',''), NULLIF('',''), '九龍鑽石山彩虹道235號啟鑽商場1樓104號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0061', '基督教小天使（麗晶）幼稚園(九龍灣)', '', '2755 0198', NULLIF('',''), NULLIF('',''), '九龍灣麗晶花園21至22座地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0062-01', '喰屋 (愉景新城 荃灣)', '', '9721 4375', NULLIF('',''), NULLIF('',''), '荃灣愉景新城2樓L2 2013號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0062-02', 'SONIA COFFEE (MOKO旺角)', 'ISSAC YAU', '9721 4375', NULLIF('',''), NULLIF('',''), '旺角太子道西193號MOKO新世紀廣場MTR樓M52號舖', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0062-03', '喰屋 (MIKIKI 新蒲崗)11點前到貨', '', '9721 4375', NULLIF('',''), NULLIF('',''), '新蒲崗太子道東638號MIKIKI G樓G05B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0063', '健營料理有限公司(鰂魚涌)', '', '6239 7603', NULLIF('',''), NULLIF('',''), '鰂魚涌東達中心5樓503E室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0064', '五餅二魚(飲食業福音團契有限公司)', '', '27397388', NULLIF('',''), NULLIF('',''), '油塘高輝道17號油塘工業城B1座11樓18室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0065', 'TKO瀛樂(將軍澳)', '', '', NULLIF('',''), NULLIF('0',''), '新界西貢將軍澳康城路1號THE LOHAS康城353 A號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0066', 'LOVEBEE(觀塘)', 'manny lai', '61882227', NULLIF('',''), NULLIF('',''), '觀塘巧明街94-96號
鴻圖中心地下5c 鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0066-01', 'love Bee(觀塘鴻泰)', '', '6188 2227', NULLIF('',''), NULLIF('',''), '觀塘鸿圖道37~39號，鴻泰工業大厦地下6號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0067', '二記車仔滷麵', '', '93544534', NULLIF('',''), NULLIF('',''), '九龍觀塘藍田滙景廣場3樓50B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0068', '趴地龍有限公司（觀塘）', '', '6684 2351', NULLIF('',''), NULLIF('',''), '觀塘駿業里66號葉運工業大廈14樓G室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0069', '釀鑫餐飲管理有限公司', '', '9082 5588', NULLIF('',''), NULLIF('',''), '葵德街16號金德工業大廈B座912室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0070', 'characteristic house BBQ & PARTYROOM （門口寫永陽雲石）', '', '', NULLIF('96561458',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0071', 'TASTY FOODS SUPPLY LIMITED', '', '93142368', NULLIF('',''), NULLIF('',''), '新蒲崗六合街六合工業大廈
16/F
FLAT/RM A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0072', '騰龍麵包西餅有限公司', '', '60139454', NULLIF('',''), NULLIF('',''), '黃大仙竹園道55號天馬苑商場1/F FLAT/RM FF02', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0073', 'Chapter Coffee (10點送貨收現金)', '', '91667676', NULLIF('',''), NULLIF('0',''), '九龍塘聯福道30號香港浸會大學賽馬會創意校園一樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0074', '小肥肥(新蒲崗)', '', '67968173', NULLIF('',''), NULLIF('',''), '新蒲崗景福街63號康樂街大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0075', 'Hamsta(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘巧明街106號冠力工業大廈15樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0076', 'GOODATE SHABU SHABU(鑽石山)', '', '64629586', NULLIF('',''), NULLIF('',''), '鑽石山龍蟠街NO.3荷里活廣場3樓311A&311B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0076-01', 'GOODATE SHABU SHABU(旺角)', '', '', NULLIF('',''), NULLIF('',''), '亞皆老街8號朗豪坊13/F SHOP L13-06', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0076-02', 'GOODATE SHABUSHABU(柴灣)', '', '', NULLIF('',''), NULLIF('',''), '柴灣盛泰道杏花?杏花新城2/F SHOP209', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0076-03', 'GOODATE SHABUSHABU(MIKIKI)', '', '', NULLIF('',''), NULLIF('',''), '新蒲崗太子道東638號MIKIKI,1/F SHOP NO.111', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0076-04', 'GOODATE SHABUSHABU(將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳坑口重華路8號東港城1樓196&197A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0077', '廚烤工坊(油塘)', '', '95187274', NULLIF('',''), NULLIF('',''), '油塘嘉華商場176 B號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0078', '炙藝煮意有限公司', '', '51120435', NULLIF('',''), NULLIF('',''), '觀塘敬業街65-67號敬運工業大廈2樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0079', 'HENRY', '', '', NULLIF('',''), NULLIF('',''), '觀塘巧明街94號鴻圖中心9樓九B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0080', '小甜包有限公司(新蒲崗）', '', '9836 5903', NULLIF('',''), NULLIF('',''), '新蒲崗衍慶街19號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0081', '小野人(將軍澳)', '', '9126 2251', NULLIF('',''), NULLIF('0',''), '將軍澳 唐俊街23號 Monterey Place G25A舖 （KOKA 小野人', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0082', '點茶工坊(觀塘)', '', '60527633', NULLIF('',''), NULLIF('',''), '鴻圖道79嘉士亞洲工業大廈1/F PORTION B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083', 'T.Co (中環)', '', '5512 1345', NULLIF('',''), NULLIF('',''), '中環威靈頓街20號威靈頓公爵大廈地下D鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083-01', 'T.Co(旺角)', '', '5512 1345', NULLIF('',''), NULLIF('0',''), '九龍旺角西洋菜南街2J-2Q號 新江大樓地下06號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083-02', 'T.Co (觀塘)', '', '5512 1345', NULLIF('',''), NULLIF('',''), '觀塘開源道63號福昌大廈地下A6 舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083-03', 'ZENAROSA FOOD CORP LIMITED(尖沙咀)', '', '', NULLIF('',''), NULLIF('',''), '九龍尖沙咀加拿分道45-47號宏生大廈地下A4鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083-04', 'ZW PARTNERS COMPANY LIMITED(啟德)', '', '5512 1345', NULLIF('',''), NULLIF('',''), '啟德沐翠街雙子匯2期B1/F SHOP NO.B169-B170', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0083-05', 'T.CO(荔枝角)', '', '5512 1345', NULLIF('',''), NULLIF('',''), '九龍荔枝角長裕街2號嘉圖工廠大廈1樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0085', '瀛逸派對美食(觀塘)', '', '9631 5577', NULLIF('',''), NULLIF('0',''), '觀塘駿業街60號
駿運工業大廈14樓E室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0086', 'JUST STEAK(坑口)', '', '', NULLIF('',''), NULLIF('0',''), '將軍澳坑口常寧路2號TKO Gateway東翼1樓140-141號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0087', '重力網絡有限公司(觀塘)', '', '93383927', NULLIF('',''), NULLIF('',''), '觀塘興業街29號萬有引力大廈3樓303室放門口', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'WILLIAM' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0088', '新南苑  (彩虹)', '', '9311 8877', NULLIF('',''), NULLIF('',''), '彩虹貴池徑4號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0089', '早鳥咖啡有限公司(新蒲崗）', '', '95009029', NULLIF('',''), NULLIF('0',''), '香港新蒲崗爵祿街98號爵祿居地下A鋪 送貨前聯絡客人', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090', '百階(香港)有限公司', '', '61595400', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-01', 'POKKA CAFE(荃灣千色)10:30AM後送貨', '', '', NULLIF('',''), NULLIF('',''), '荃灣眾安街千色匯二期68號地下1-6號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-02', 'PICK COFFEE(青衣)11:30AM後送', '', '24972381', NULLIF('',''), NULLIF('',''), '青衣青敬路33號青衣城第2層201號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-03', 'PICK COFFEE(元朗)11:30AM後送', '', '25570855', NULLIF('',''), NULLIF('',''), '元朗元龍街9號形點1期1樓1078號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-04', 'PICK COFFEE(樂富)10:30AM後送', '', '23389580', NULLIF('',''), NULLIF('',''), '樂富中心第二層2101號鋪UN2-16單位', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-05', 'JUST STEAK(HK) Ltd.10:30AM後送', '', '27013632', NULLIF('',''), NULLIF('',''), '將軍澳厚德邨TKO Gateway東翼1樓140-141號鋪位', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-06', 'Silicon Lane Just Steak(白石)10:30AM後送', '', '', NULLIF('',''), NULLIF('',''), '大埔優景里63號Silicon Lane地下25號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-07', '中央廚房(柴灣)', '', '23674101', NULLIF('',''), NULLIF('',''), '柴灣嘉業街12號百樂門大廈5樓G室(收貨部)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0090-08', 'PICK COFFEE(太古誠品)', '', '37088501', NULLIF('',''), NULLIF('0',''), '香港鰂魚涌太古城道18號太古城中心地下G016號鋪(誠品書店內)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0091', '新星科技有限公司（觀塘）', '', '9132 6923', NULLIF('',''), NULLIF('',''), '觀塘偉業街172號 建德工業大廈12樓B室 lot a', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0092', '峻旭有限公司(沙田)提前致電98059259收貨', '', '98059259', NULLIF('',''), NULLIF('0',''), '沙田52號大涌橋路
富豪花園麗人閣大堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0093', '三月見(啟德)', '', '54039646', NULLIF('',''), NULLIF('',''), '九龍城啟仁苑零售大樓地下02號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0093-01', 'WOW PASTA(土瓜灣)', '', '66852186', NULLIF('',''), NULLIF('',''), '土瓜灣馬頭角道50號迎豐1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0094', 'BARBECUE FOR FRIENDS LIMITED(觀塘)', '', '51745013', NULLIF('',''), NULLIF('',''), '觀塘偉業街172堅德工業大廈12/F B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0095', '正好小食(觀塘)', '', '95861888', NULLIF('',''), NULLIF('',''), '九龍觀塘馬蹄徑1號寶恩大廈地下4號A號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0096', '龍小館(九龍灣)', '', '67300248', NULLIF('',''), NULLIF('',''), '九龍灣常悦道環球工商大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0097-01', '四季悅日本餐廳(金鍾)12:30-2:00不收貨', '', '22195222', NULLIF('',''), NULLIF('',''), '金鍾夏慤道16遠東金融中心UG樓A1號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0097-02', '四季悅日本餐廳(九龍灣)12:30-2:00不收貨', '', '22940088', NULLIF('',''), NULLIF('45',''), '九龍灣宏泰道23號Manhattan Place 1樓101-105號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0098', 'party room (九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣寶隆中心A座715', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0099', '藍地為食妹（觀塘）', '', '', NULLIF('',''), NULLIF('',''), '九龍觀塘藍田滙景廣場3樓40號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0100', '驛系家研作有限公司(觀塘)', '', '93699777', NULLIF('',''), NULLIF('',''), '觀塘康寧道NO.89 G/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0101', '曜財建築顧問有限公司(觀塘)', '', '9029 5898', NULLIF('',''), NULLIF('',''), '觀塘鯉魚門道新城工商中心422室4569#', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0102', '城覓科技(香港)有限公司(將軍澳)', '', '97847680', NULLIF('',''), NULLIF('',''), '新界西貢區康城路1號日出康城首都會餐廳', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0103', '智鮮食品供應鏈有限公司', '', '', NULLIF('',''), NULLIF('',''), '大角咀通洲街雲之端5/F RM509', 'GHFOODS', 'P0', 7, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0104-01', '爪物超市-黃埔店', '', '/54424457/906295', NULLIF('',''), NULLIF('0',''), '紅磡順景街黃埔花園黃埔天地
時尚坊第二期地下G22-G23,G26&B34', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0105', 'WOW Pasta (牛頭角）', '', '6685 2186', NULLIF('',''), NULLIF('',''), '香港牛頭角偉業街93號1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0106', 'ARO LITIMED(觀塘)', '', '92351778', NULLIF('',''), NULLIF('',''), '觀塘巧明街114迅達工業大廈2/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0107', '川針引線(九龍城)', '', '98459088', NULLIF('',''), NULLIF('',''), '九龍城賈炳達道128 號九龍城廣場B1/F B10鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0108', '味.傳奇有限公司(觀塘)', '', '5622 8328', NULLIF('',''), NULLIF('',''), '觀塘偉業街93號3樓全層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0109', '綠人工作室(牛頭角)', '', '', NULLIF('',''), NULLIF('',''), '牛頭角大業街海洋工業大廈5/F flat B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('A0110', '真鐸學校(鑽石山)', '', '2326 5111', NULLIF('',''), NULLIF('',''), '鑽石山斧山道171號真鐸學校1/F家政室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0001', '靚湯工房飲食有限公司(觀塘)', '', '2191 3133', NULLIF('',''), NULLIF('',''), '九龍官塘偉業街209-211號富合工業大廈12樓C室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0002', 'Worldnice (官塘)', 'Chistina', '', NULLIF('2164 2333 / 3697',''), NULLIF('',''), '九龍官塘偉業街209-211號，富合工業大廈12樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0003', 'Hamsta Crown Corner (觀塘)', '', '3702 1852', NULLIF('',''), NULLIF('',''), '觀塘巧明街106號冠力工業大廈15樓01室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0004', '牛助 (將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳唐俊街12號天晉匯2期119B舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0005', '上海小籠皇 (將軍澳)', '', '60804021 (田生)', NULLIF('',''), NULLIF('',''), '將軍澳新都城 2 期 1 樓 1009', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0006', '十勝牛和食料理 (油塘)', '', '2408 6568', NULLIF('',''), NULLIF('',''), '油塘高超道 38 號大本型 316 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0007', 'IMM 阿來 (將軍澳)', '', '9255 5597', NULLIF('',''), NULLIF('',''), '將軍澳富康花園地下 30 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0008', '鳥棲 (觀塘)', '', '6797 7420 葉生', NULLIF('',''), NULLIF('',''), '觀塘開源道60號駱駝漆大廈3座5樓s室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0009', '泰坊 (觀塘) (現金客戶)11點後有錢收', '', '', NULLIF('',''), NULLIF('',''), '觀塘成業街15-17號成運工業大廈1樓9-11號店', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0010', 'Kitchen N429 (官塘)', '', '', NULLIF('',''), NULLIF('',''), '官塘大業街29號，Flat A 4/F 海洋工業大廈', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0011', '韓閣 (將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳欣景路8號,新都城中心2期1015號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0012', '哥哥添飯 (觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘道388號創紀之城一期地下6號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KATIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0013', '鶴崎日本料理(觀塘)', '', '90949446', NULLIF('',''), NULLIF('',''), '觀塘偉業街223-231號宏利金融中心商場一樓7號', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0014', 'HANS DELI(官塘)', '', '', NULLIF('',''), NULLIF('',''), '官塘成業街15-17號成運工業大廈12樓1室', 'GHFOODS', 'P0', 15, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0015', '奧古好叉好味(葵芳)', '', '91981234(郭生', NULLIF('',''), NULLIF('0',''), '葵芳大連排道182-190號金龍工業中心4座4樓E&F室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0016', '四川風味小吃有限公司(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘開源道55號開聯工業中心A座5樓08室', 'GHFOODS', 'P0', 15, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0017', '愷旺有限公司(觀塘)', '', '64446694', NULLIF('',''), NULLIF('',''), '觀塘開源道開聯工業中心a座1204室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0018', '新南苑大排檔(牛頭角)', '', '6703 1547', NULLIF('',''), NULLIF('',''), '牛頭角牛頭角道183號市政大廈1樓16至18號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019', '瑞士咖啡室 (樂富)', '', '3188 1490', NULLIF('',''), NULLIF('',''), '樂富聯合道198號樂富廣場1期1樓1119-1120號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-01', '瑞士咖啡室 (葵涌)9:00前送達', '', '21530370', NULLIF('',''), NULLIF('',''), '葵涌葵昌路9-15號貴豐工業大廈地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-02', '瑞士咖啡室(荔枝角)10:00前送達', '', '', NULLIF('',''), NULLIF('',''), '荔枝角青山道658號福至工業大廈地舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-03', 'Wc life is good(灣仔)11：00前送到', '', '34682971', NULLIF('',''), NULLIF('',''), '灣仔春園街13號地鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-04', '廉記(柴灣)', '', '34228871', NULLIF('',''), NULLIF('',''), '柴灣華廈街2號環翠商場2樓205號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-05', 'WC祥香園餐廳(灣仔)', '', '', NULLIF('',''), NULLIF('',''), '灣仔灣仔道128-150號明豐大廈1樓B號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019-06', '瑞士(中環)', '', '', NULLIF('',''), NULLIF('',''), '中環利源西街12號地舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0019A', '瑞士咖啡室', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0020', '元福日本料理 (九龍塘)', '', '', NULLIF('',''), NULLIF('',''), '九龍塘聯合道 320 號建新中心地下低層', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0021', '汶萊餐廳(牛頭角)', '', '9673 8666', NULLIF('',''), NULLIF('',''), '牛頭角順利邨平台3/F B13-B14號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0022', 'KENJI (新蒲崗)', '', '6846 2627', NULLIF('',''), NULLIF('',''), '新蒲崗太子道東706號太子工業大廈9樓B座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0023', '元福茶房(九龍塘)', '', '6255 9237', NULLIF('',''), NULLIF('',''), '九龍塘聯合道320號建新中心地下低層12號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0024', '良興凍肉公司(黃大仙)', '', '9333 5755(曾生)', NULLIF('',''), NULLIF('',''), '黃大仙竹園道15號竹園南竹園市場WCY128號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0025', '半島冰廳 (黃大仙)', '', '3792 0111', NULLIF('',''), NULLIF('0',''), '黃大仙竹園道15號竹園廣場地下竹園市場地下W-CY101號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0026', 'AS CAFE (九龍灣)', '', '9166 9753鄭生', NULLIF('',''), NULLIF('',''), '九龍灣展貿徑1號九龍灣國際展貿中心B1 層B139', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0027', '金豆 (九龍灣)', '', '9443 0362(楊小', NULLIF('',''), NULLIF('',''), '九龍灣常悅道19號福康大廈1樓7室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0028', '森美奧廚房 (慈雲山)', '', '9348 8096', NULLIF('',''), NULLIF('',''), '九龍慈雲山毓華街23號慈雲山中心5樓508號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0029', '和味居 (紅磡)', '', '', NULLIF('',''), NULLIF('',''), '紅磡馬頭圍道88號地下D舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0031', '文苑IK(黃大仙)', '', '9257-7583', NULLIF('',''), NULLIF('',''), '九龍黃大仙竹園道55號天馬苑商場2樓S02號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0032', '食道樂 (九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣啟興道2號太平洋貿易中心5樓28室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0033', '852 Kitchen (觀塘)', '', '9095 8975', NULLIF('',''), NULLIF('',''), '觀塘巧明街駱駝漆工業中心三期地下B1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0034', 'Pastime cafe 聚點 (黃埔鋪)11：30後才收到票', '', '', NULLIF('',''), NULLIF('',''), '黃埔花園第11期 G/F 地下 G2  & G2A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0034-01', 'Pastime cafe 聚點(佐敦)', '', '26691733', NULLIF('',''), NULLIF('',''), '九龍佐敦炮台街29-31號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0035', '果肉網絡有限公司(觀塘)', '', '9745 8123', NULLIF('',''), NULLIF('',''), '觀塘成業街11-13號華成工商中心11樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0036', '好煮意(鑽石山)', '', '9819 8885', NULLIF('',''), NULLIF('',''), '鑽石山鳳德道111號鳳德街市G樓S14號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0037', '通記緻藍天餐廳(將軍澳)', '', '5117 9368', NULLIF('',''), NULLIF('',''), '將軍澳日出康城緻藍天2/F會所餐廳通記冰室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0038', '樂翠園海鮮菜館(觀塘)', '', '6432 6719 鵝姐', NULLIF('',''), NULLIF('',''), '觀塘宜安街4號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0039', 'YUMMYDAY INDUSTRIAL 天美(葵涌)', '', '', NULLIF('',''), NULLIF('0',''), '葵涌 華星街8號，華達工業中心，B座
12樓，07室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0040', '笑口常開(荃灣)', '', '92008001', NULLIF('',''), NULLIF('紀生',''), '荃富街12-28號
富麗花園商場地下37號A地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0041', '銘興山西刀削麵(紅磡)', '', '', NULLIF('',''), NULLIF('',''), '紅磡民泰街2-32號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0042', '地中海概念有限公司(油塘)', '', '', NULLIF('',''), NULLIF('',''), '油塘茶果嶺道610號生利工業大廈6樓609', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0043', '泰作 (青衣)(11:59-2:30不準入車場)', '', '', NULLIF('',''), NULLIF('',''), '青衣青敬路31-33號青衣城1 ，3樓302號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0044', '紅山餐廳(葵涌)', '', '34212772', NULLIF('',''), NULLIF('',''), '葵涌大連排道36-40號貴盛工業大廈地下B舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0045', '霸王餐室(葵涌)', '', '97462482', NULLIF('',''), NULLIF('',''), '葵涌打磚坪街1-15號寶星中心地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0046', '芮碗麵(荃景圍)', '', '66391789', NULLIF('',''), NULLIF('',''), '荃灣荃景圍荃灣中心第一期地下S52號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0047', '阿瀦媽串串屋(葵涌)', '', '9362 4123', NULLIF('',''), NULLIF('',''), '青山道539號昌宏大廈地下10號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0048', '80s catering(葵芳)', '', '95753999', NULLIF('',''), NULLIF('',''), '葵涌葵喜街13號永恆工業大廈1205室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0049', '富興行(青衣)', '', '', NULLIF('',''), NULLIF('',''), '青衣偉力工業大廈 A座4樓 16-18 室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0050', 'Mr burger(青衣)', '', '', NULLIF('',''), NULLIF('',''), '青衣細山路2-16美景花園地鋪28號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0051', '佳美食品(葵涌)', '', '96364137', NULLIF('',''), NULLIF('',''), '葵涌打磚坪街49-53號華基工業大廈1期20樓E', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0052', '印度餐廳(將軍澳寶琳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳寶琳慧安商場一樓B66-67號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PETER' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0053', '連文記冰室 (九龍灣)', '', '36145882', NULLIF('',''), NULLIF('',''), '九龍灣宏光道1號億京中心地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0054', '家雞煲(葵盛)', '', '6600 0577', NULLIF('',''), NULLIF('',''), '葵盛西邨7座地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0055', '妤意（葵盛西邨家雞煲）', '', '66000577', NULLIF('',''), NULLIF('',''), '新界葵涌葵盛西邨7座地下2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0056', '富恆(葵涌)', '', '9500-1368', NULLIF('',''), NULLIF('',''), '葵涌葵盛西邨商埸街市82號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0057', '卞迪屋食品（牛頭角）', '', '96367939', NULLIF('',''), NULLIF('',''), '牛頭角3號得寶商場地下木馬工房FC05鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0058', '司務道幼稚園(將軍澳)', '', '2701 0939', NULLIF('',''), NULLIF('',''), '將軍澳寶林邨寶泰樓地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0059', '佛教密宗香港雷藏寺(新浦崗)蓮隆法師收', '', '93439439', NULLIF('',''), NULLIF('',''), '新浦崗五芳街10號,新寶中心31字樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0060', '豐味窯雞有限公司(觀塘道)', '', '54088778', NULLIF('',''), NULLIF('0',''), '香港九龍觀塘道448 至458號觀塘工業中心第1期7樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0061', '鬍鬚佬(將軍澳)', '', '9300 0517', NULLIF('',''), NULLIF('',''), '將軍澳寶林新都城第三期地下G23號店鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0061-01', '鬍鬚佬(土瓜灣)', '', '9300 0517', NULLIF('',''), NULLIF('',''), '土瓜灣啟岸地下6號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0062', '權哥火鍋(觀塘)', '', '54096721', NULLIF('',''), NULLIF('',''), '觀塘駿業街67號駿業熟食中心1樓45號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0062-01', '權哥火鍋(觀塘)-豬加工廠', '', '54096721', NULLIF('',''), NULLIF('',''), '觀塘駿業街67號駿業熟食中心1樓45號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0063', '雋樂幼稚園(牛頭角)', '', '9642 1616', NULLIF('',''), NULLIF('',''), '香港九龍牛頭角下村貴華樓地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC005' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0064', '阿元廚房（觀塘）按門鐘有人開門', '', '95755507', NULLIF('',''), NULLIF('1M+000',''), '觀塘偉業街128號7樓A室( 由海濱入口明街後巷 紫色車房對面)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0065', '小火焰韓式咖啡廳 (樂富)9:30開門', '', '3618 8203', NULLIF('',''), NULLIF('',''), '樂富聯合道198號樂富廣場A區1樓1171-1179號舖', 'GHFOODS', 'P0', 20, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0066', '百豐企業有限公司(將軍澳私房菜)', 'Carmen', '92203897', NULLIF('',''), NULLIF('',''), '將軍澳富康花園七座11樓H室（到前半小時致電）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0067', '鱘龍食品公司', '', '9663 1434', NULLIF('',''), NULLIF('',''), '紅磡民裕街47-53號凱旋工商中心二期10樓L1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0068', 'party boom（觀塘）', '', '', NULLIF('',''), NULLIF('',''), '觀塘凱滙5樓會所BBQ場', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0069', '香港到會有限公司(觀塘)', '', '55070089', NULLIF('',''), NULLIF('',''), '觀塘觀塘道316-328號志聯工廠大廈6樓A室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0070', 'TWO POINT ZERO COMPANY LIMITED', '', '97931983', NULLIF('',''), NULLIF('',''), '啟德承豐道33號啟德郵輪碼頭2樓201號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0071', 'DRC catering(新蒲崗)', '', '93670577', NULLIF('',''), NULLIF('',''), '新蒲崗啟德工業大廈二期5樓E', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('B0072', '攤位(黃生)', '', '98066667', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0001', '港南食品有限公司(屯門)', '', '3568 4519', NULLIF('',''), NULLIF('',''), '新界屯門建發街17號同德工業大廈1樓A室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0002', '水圍車聚餐館 (元朗)', '', '9338-1781', NULLIF('',''), NULLIF('0',''), '元朗大棠道水蕉老圍196地下(第二個牌坊前/旭明花園對面)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0003', '新順福食品有限公司 (元朗)', '', '2461', NULLIF('',''), NULLIF('',''), '送貨地址:新界元朗逢吉鄉直入到尾', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0004', '4889 (元朗)', '', '9668 7836 陳小姐', NULLIF('',''), NULLIF('',''), '元朗教育路號嘉城廣場地下號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0006', '您的冰室(屯門)', '', '9775 0381 黃生', NULLIF('',''), NULLIF('0',''), '屯門青翠徑 9 號多寶大廈地下 33 號舖(景峰輕鐵站對面)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0007', '大雞大 (屯門友愛村)', '', '9657 8575', NULLIF('',''), NULLIF('',''), '屯門友愛村愛勇街 4 號愛定商場地下 S-112號店', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0008', '河內越式小館(元朗)', '', '5115 5673 葉生', NULLIF('',''), NULLIF('',''), '元朗鳳攸街 3 號好順景大廈 1 座 33號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0009', '金銀屋 (屯門)如前舖不見客人,請去後舖找客人', '', '6990 6333', NULLIF('',''), NULLIF('',''), '屯門青河坊2號麗寶大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0010', '小吉西餐 (屯門)', '', '', NULLIF('',''), NULLIF('',''), '屯門大興街1號大興村大興商場1樓L204號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0011', 'Twomoms Korean Food(元朗)', '', '55006954', NULLIF('',''), NULLIF('',''), '元朗鳳群街2號 年發大廈 G/F 13號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0012', '赤鳥 (屯門)', '', '6156 6591', NULLIF('',''), NULLIF('1M+015',''), '屯門青菱徑 3 號東威閣 U- TOWN 時尚 電腦城商場 G12號(如太早就寫字數代收)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0013', '天澗居酒屋 (元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗教育路79-81號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0014', 'Doris 私房菜(加洲花園)', '', '90317689', NULLIF('',''), NULLIF('',''), '元朗加州花園,偉仕居紅花徑7號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0015', '盈小館(元朗)', '', '63868836', NULLIF('',''), NULLIF('',''), '元朗元朗潭尾青山公路米埔段168號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0016', '君皓飲食有限公司-醉美島(元朗)', '', '6289 5328', NULLIF('',''), NULLIF('',''), '元朗鳳攸南街好順利大廈2座地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0017', '博藝小館(屯門)', '', '67715528', NULLIF('',''), NULLIF('',''), '屯門鄉事會路83號瓏門5樓會所', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0018', '煇煌越式法包(屯門)', '', '96031590', NULLIF('',''), NULLIF('',''), '屯門青柏徑6號鹿苑大廈16號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0019', '華麗行貿易有限公司(屯門)', '', '245601000', NULLIF('',''), NULLIF('',''), '新界屯門建群街3號永發工業大廈12樓C室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0020', '恩華(屯門)', '', '95342298', NULLIF('',''), NULLIF('0',''), '新界屯門青楊街10號鴻昌工業中心二期2樓A及B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0021', 'Nice Moment (元朗)', '', '95110428', NULLIF('',''), NULLIF('',''), '元朗盈福街5號幸福樓地下A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0022', '青榕臺(屯門)', '', '9339 8596', NULLIF('',''), NULLIF('',''), '屯門青榕街8號青榕臺', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0023', '君愉美食(元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗大堂路熟食市埸C004鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0024', '川仔(屯門)', '', '53981656', NULLIF('',''), NULLIF('',''), '屯門青山坊2號華樂大廈地下58號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0025', '鳥正(錦田)4:30-5-30 Pm', '', '92408212', NULLIF('',''), NULLIF('',''), '錦田波地路3號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC012' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0026', '天瀛國際企業(香港)有限公司', '', '9700 6737 Natalie', NULLIF('',''), NULLIF('1M+030',''), 'Hoi Fung Yuen Ko Po San Tsuen Kam Tin Yuen Long', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'M LEUNG' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0027', '民旺(元朗鳳琴街)', '', '', NULLIF('',''), NULLIF('',''), '元朗鳳琴街22号金龍樓地下20A号舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0028', '脆味批(屯門)', '', '98411279', NULLIF('',''), NULLIF('',''), '屯門景峰徑景峰花園商場地下G19舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0029', '鎮興隆(元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗又新街38號地下4號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0030', '微風食品(屯門)', '', '6672 8672', NULLIF('',''), NULLIF('',''), '屯門得利工業中心B座1204室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0031', '江南食客(元朗)', '', '', NULLIF('',''), NULLIF('',''), '元朗康樂路7-11號，康寧樓地下A鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0032', '麼麼茶（屯門）', '', '+852 6272 2922', NULLIF('',''), NULLIF('',''), '屯門青山公路舊咖啡灣麼麼茶小食亭', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0033', '牛蓋
（屯門）', '', '', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0034', '哩道(元朗)', '', '6919 9972', NULLIF('',''), NULLIF('',''), '元朗鳳攸南街3號好順景大廈2座地下13號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0035', '米家食品（屯門）', '', '97742801', NULLIF('',''), NULLIF('',''), '屯門工業中心E座8樓4室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0036', '華富蛋行(屯門)', '', '60933258', NULLIF('',''), NULLIF('',''), '屯門康寶路海聯貨倉', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0037', '榮頌團契有限公司（屯門）', '葉生', '5132 0469', NULLIF('',''), NULLIF('',''), '新界青山公路16米半屯門小欖村47號（小欖路 近帝濤灣必須電話帶路）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0038', 'M&P kingdom (屯門)', '', '96409616', NULLIF('',''), NULLIF('',''), '屯門華運工業大廈8樓05室密碼5798', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0039', '罧懿一蘿(屯門)', '', '62453588', NULLIF('',''), NULLIF('',''), '青棉徑5號金寶大廈地下1號舖(罧懿一蘿)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0040', '勁有米(屯門)', '', '60943988', NULLIF('',''), NULLIF('',''), '屯門湖秀路2號悅湖山莊商場127號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0041', 'YSK LIMITED(屯門)', '', '61604242', NULLIF('',''), NULLIF('',''), '屯門掃管笏珺瓏灣1期2A座20樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'B/B' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0042', '興盛小館(葵興)', '', '94594585', NULLIF('',''), NULLIF('',''), '葵涌葵興道100號葵涌中心地下A5號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0043', '小鎮廚房(屯門)', '', '6734 8791', NULLIF('',''), NULLIF('',''), '屯門湖秀街2號悅湖山莊商場地下118號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0044', '龍九冰室（元朗）', '', '9785 1223', NULLIF('',''), NULLIF('',''), '元朗安寧路188號安寧大廈地下C鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0045', '元朗攸潭美農樂營有限公司', '', '9033 2021', NULLIF('',''), NULLIF('',''), '元朗攸潭美村農樂營（google 導航）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0046', '食住上(屯門)', '', '97219596', NULLIF('',''), NULLIF('',''), '屯門南浪海灣5座地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0047', '台嵐(香港)有限公司(屯門)', '', '53001444', NULLIF('',''), NULLIF('',''), '屯門業旺路6-8號聯昌中心18樓1808室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0048', 'So Good(屯門)11:00先開始有人付現金', '', '9716 6764', NULLIF('',''), NULLIF('',''), '屯門掃管笏邨249號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0049', '潮英園 CHILL RESTAURANT(屯門)', '', '9010 3182', NULLIF('',''), NULLIF('',''), '屯門欣寶路菁田商場地下G02舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0050', '食品採購有限公司(元朗)', '', '6228 4642', NULLIF('',''), NULLIF('',''), '元朗唐人新村屏唐東街9號合興大廈二樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0051', '大欖燒烤(屯門) (1點後送貨)', '', '53465562', NULLIF('',''), NULLIF('',''), '屯門大欖涌村 LOT 263B DD385', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0051-01', '大美督TLCBBQ 1:00後送', '', '95001593', NULLIF('',''), NULLIF('',''), '大埔大尾篤汀角路 202', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0051-02', '大欖燒烤-金龍工場(葵涌)', '', '', NULLIF('',''), NULLIF('',''), '葵涌大連排道152-160號金龍工業中心一期4樓E室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0051-03', '大欖燒烤工場（荃灣白田壩街）送貨前要聯絡客人', '', '', NULLIF('6343 0491/ 9501',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0052', '現金客(屯門紫田村)', 'ICY LAU', '61471206', NULLIF('',''), NULLIF('',''), '屯門紫田村275號（老人院“如意之家”旁邊，兆康康寶路茵翠豪庭前方100米路口左轉）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0053', 'PROTEIN TO GO(上環)', '盧生', '65779182', NULLIF('',''), NULLIF('',''), '香港上環永樂街1-3號
世瑛大廈6樓01室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0053-1', 'PROTEIN TO GO', '', '65779182', NULLIF('',''), NULLIF('0',''), '香港黃竹坑黃竹坑道44號
盛德工業大廈11樓C室(C2單位)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0054', '伍業有限公司(葵涌)', '', '6050 0837', NULLIF('',''), NULLIF('',''), '葵涌宏達工業中心915', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0055', '周柏曦一口小食到會（屯門）', '', '9108 8200', NULLIF('',''), NULLIF('0',''), '好收成工業大廈屯門震寰路9號RM 502  
5/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0056', 'Plant N Plate Limited', '', '66026823', NULLIF('',''), NULLIF('',''), '新界荃灣馬角街8-12號新豐工業大廈703室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0057', '嘉壹材料有限公司( 荃灣)', '', '9750 8553', NULLIF('',''), NULLIF('',''), '荃灣柴灣角街銓通工業大廈22樓 D8室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0057-01', '想你曲奇有限公司(葵涌)', '', '9750 8553', NULLIF('',''), NULLIF('',''), '葵涌高威工業中心B 座 14 樓 1413F 室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0058', 'AITCH''S BILTONG LIMITED', '', '', NULLIF('',''), NULLIF('',''), '葵涌打磚坪街58-76和豐工業中心5/F 14', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0059', '喰屋(荃灣OP MALL)', '', '60360132', NULLIF('',''), NULLIF('',''), '荃灣大河道100號海之戀商場地下G22-G23號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0060', '錦綉花園鄉村俱樂部有限公司', '', '54049269', NULLIF('',''), NULLIF('',''), '香港元朗錦綉花園市中心

錦綉花園鄉村俱樂部有限公司', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0061', '雲薇有限公司（屯門）', '', '97777538', NULLIF('',''), NULLIF('',''), '屯門震寰路9號好收成工業大廈6樓606室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0062', '兆盈豐品有限公司(66729167 )', '高生', '5913 4369', NULLIF('',''), NULLIF('',''), '新界葵涌梨木樹32號金運工業大廈2座4樓C室(A部份)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0063', 'Tee Rak Company Limited', '黃小姐', '61866145', NULLIF('',''), NULLIF('',''), '天水圍天靖街3號天盛商場地下天盛街市M419號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0064', 'We serve kitchen catering Limited(荃灣)', '', '97115729', NULLIF('',''), NULLIF('',''), '葵興大連排道金基工業大廈20樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0065', 'SPOON LAB(葵涌)', '黎生', '65789379', NULLIF('',''), NULLIF('',''), '新界葵涌大連排道144-150號金豐工業大廈第一座3樓J室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0066', '牛格有限公司', '', '70748806', NULLIF('',''), NULLIF('',''), '荃灣白田壩街華偉工業大廈607室101號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0067', '花沐(天水圍)', '胡生', '64634652', NULLIF('',''), NULLIF('',''), '天水圍天瑞(I & II)邨商業/停車場大樓街地下T2號檔', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0068', '二郎燒雞扒(天水圍)', '', '63003959', NULLIF('',''), NULLIF('',''), '天水圍天悅?T TOWN G/F ,T MARKET ,TT1039', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0069', '老厝邊-德安食品有限公司', '', '93263375', NULLIF('',''), NULLIF('',''), '葵涌永業街14-20號華榮工業大廈7樓C室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0070', 'Pizza Time 比薩時光(銅鑼灣)樓下大門密碼：R3789', '', '', NULLIF('94226669',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0070-01', 'Pizza Time (西營盤）', '', '94226669', NULLIF('',''), NULLIF('',''), '香港西營盤水街47號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0070-02', '', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0071', '泰●初夏', '', '26230075', NULLIF('',''), NULLIF('',''), '荃灣青山公路398 D.PARK 2樓SHOP2030', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0072', '海潤午餐（香港）有限公司 (荃灣)', '', '', NULLIF('',''), NULLIF('',''), '荃灣青山公路611-619東南工業大廈16/F', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0073', '韓奶奶拌飯(元朗)', '', '90406134', NULLIF('',''), NULLIF('',''), '元朗鳳攸南街3號好順景大廈地下no.3', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0075', '永咖豐有限公司(荃灣）', '', '6392 3180', NULLIF('',''), NULLIF('',''), '荃灣馬角街8號新豐工業大廈k2/18 1/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0076', '龍門居冰室(屯門)', '張小姐', '9782 3415', NULLIF('',''), NULLIF('',''), '送到龍門居倉街市M50號舖,使用(1001)密碼鎖送貨入去', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0077', '韓正屋韓國料理（荃灣）10點開門收現金', '', '6382 1885', NULLIF('',''), NULLIF('',''), '荃灣海壩街22-32號華達樓地下E號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0078', '求其食(荃灣)', '', '91703911', NULLIF('',''), NULLIF('',''), '新界荃灣荃運工業大廈2期14樓L1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0079', '癸酉拉麵(荃灣)', '', '64888671', NULLIF('',''), NULLIF('',''), '荃灣 大壩街 1號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0080', 'We catering International Iimited', '', '91398961', NULLIF('',''), NULLIF('',''), '荃灣柴灣角街84-92號順豐工業中心18樓M室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0081', 'THE HOUSE OF FINE FOODS LIMITED', '', '', NULLIF('',''), NULLIF('',''), '青衣航運路 36號亞洲物流中心8樓 801室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0082', '咪走！雞(葵涌)', '', '', NULLIF('',''), NULLIF('0',''), '葵涌工業街10-14號
華發工業大廈后座304室 A1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0083', '廣源肉食公司（荃灣）', '', '', NULLIF('',''), NULLIF('',''), '麗城花園第3期 麗城薈街市M11至M12號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0085', '寶諾發展有限公司（荃灣）', '', '', NULLIF('',''), NULLIF('',''), '白田壩街 53-61號華偉工業大廈13樓 16B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0086', '青善日本料理 (屯門)', '', '26660980', NULLIF('',''), NULLIF('',''), '香港屯門青善街22號康景花園地下3-4號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0087', 'DAYDAY WASH (HK) LIMITED(元朗) (提前1小時聯絡客人收貨）', '', '', NULLIF('6469 7235',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0088', '甜辣江湖飲食有限公司(沙田)', '', '56685396', NULLIF('',''), NULLIF('',''), '小瀝源路68廣源邨廣源市場5/F STALL S-KY70', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0089', '想你曲奇有限公司', '', '97508553', NULLIF('',''), NULLIF('0',''), '葵涌永健路16-20高威工業中心14/F BLK B FLAT1413F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0090', '茶皇', '', '', NULLIF('',''), NULLIF('',''), '葵青和宜合道63號麗晶中心A座地下G01鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0091', '香港叁食餐飲有限公司(元朗)', '', '93562260', NULLIF('',''), NULLIF('',''), '新界元朗民合徑8號幸福樓二期地下1號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0092', '御髮有限公司(葵涌)', '', '52729010', NULLIF('',''), NULLIF('',''), '葵涌和豐工業中心68, 7/F ROOM 722', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0093', '酸火火（葵涌）', '', '6688 7228', NULLIF('',''), NULLIF('',''), '葵涌大窩口街市3號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0094', 'BENCH CAFE(荃灣)', '', '57409886', NULLIF('',''), NULLIF('0',''), '新界荃灣芙蓉街13-17號及大壩街3號芙蓉樓地下D號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0095', '豆姐美食(元朗)最後一單送貨', '', '65335455', NULLIF('',''), NULLIF('',''), '元朗鳳攸東街9號好順意大廈G/F SHOP48', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0096', 'Dor Dor Chill Party House(荃灣)', '', '93251557', NULLIF('',''), NULLIF('',''), '柴灣角街66號金熊工業中心A座2樓A3室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0097', '北川國際有限公司(荃灣)', '', '31522999', NULLIF('31522990',''), NULLIF('0',''), '荃灣荃灣西沙咀道40-50號榮豐工業大廈ROOM2403', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('C0098', '超電工程拓展有限公司( 葵昌路)', '', '5206 8945', NULLIF('',''), NULLIF('',''), '葵涌葵昌路18－24號美順工業大廈地下B-C室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0001', '魚陣營(黃竹坑)', '', '', NULLIF('',''), NULLIF('',''), '黃竹坑業勤街35號金來工業大廈1座地下-送倉', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0002', '便食部落(中央廚房)黃竹坑', '', '', NULLIF('',''), NULLIF('',''), '香港黃竹坑業勤街35號金來工業大廈1座1樓E', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0002-1', '便食部落有限公司(黃竹坑)', '', '', NULLIF('',''), NULLIF('',''), '香港黃竹坑業勤街35號金來工業大廈1座1樓E', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0003', '暹羅苑 (北角)', '', '2561 7288', NULLIF('',''), NULLIF('',''), '北角七姊妹道116-122 號地下B號舖', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0004', '禮賓閣餐廳 (銅鑼灣)', '', '3580 8022', NULLIF('',''), NULLIF('',''), '銅鑼灣銅鑼灣道3-17號國泰大廈地下1-2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0005', 'DARE (西營盤)', '', '', NULLIF('',''), NULLIF('',''), '水街2a-2c 號荔安大廈地下低層F及G舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0006', '敢壽司(薄扶林道)', '', '9515 2395', NULLIF('',''), NULLIF('',''), '薄扶林道35-37號地庫前座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0007', '船渦 (銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣謝斐道500號維安商業大廈3/F', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0008', '激安(筲箕灣)', '', '', NULLIF('',''), NULLIF('',''), '筲箕灣新成街 8 號新城中心地下 F 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0009', '廣大藥業公司 (跑馬地)', '', '2575 0379', NULLIF('',''), NULLIF('',''), '香港跑馬地景光街8號景光樓地下3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0010', '錫子園(銅鑼灣)', '', '2387 9388', NULLIF('',''), NULLIF('',''), '銅鑼灣記利佐治街1號金百利廣場5樓R2舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0011', '藝穗會(中環)', '', '93455237 Joe', NULLIF('',''), NULLIF('',''), '中環下亞厘畢道2號南座', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0012', 'ABC CAKE HOUSE(灣仔)', '', '25330301', NULLIF('',''), NULLIF('',''), '灣仔皇后大道東255號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0013', '同天食品有限公司(西區副食品)', '', '5661 5165 蔡生', NULLIF('',''), NULLIF('',''), '西環豐物道8號西區副食品批發市場 1 樓 D 14', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0014', '無二(中環)', '', '2338 8353', NULLIF('',''), NULLIF('',''), '中環港景街1號國際金融中心2樓2016舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0015', '項頂食品有限公司 (筲箕灣)遇手卷', '', '', NULLIF('',''), NULLIF('',''), '筲箕灣東大街42-52號杜雲里4號地下G5舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0016', '川婆婆 (銅鑼灣)', '', '6211 8295/9660', NULLIF('',''), NULLIF('',''), '銅鑼灣利園山道5號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0017', '泰妹麵有限公司(西灣河)', '', '95304982', NULLIF('',''), NULLIF('',''), '西灣河筲箕灣道57-87號太安樓地下 A5', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0018', '初心16號廚房(北角)', '', '', NULLIF('',''), NULLIF('0',''), '北角電氣道233號城市花園商場(城市中心)1樓47A&59(16號廚房)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0019', '中環薈( 中環)', '', '', NULLIF('',''), NULLIF('1M+045',''), '香港中環永樂街33號皇后大道中181 & 183號 新紀元廣場低座2樓208-214鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0020', '睿私房菜(銅鑼灣)', '', '60373288', NULLIF('',''), NULLIF('',''), '銅鑼灣耀華街38號ZING28樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0021', '星記海鮮飯店 (中環)', '', '2970 0988', NULLIF('',''), NULLIF('',''), '香港中環擺花街1-7號1號廣場2樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0022', '炊燒(銅鑼灣)', '', '66989198', NULLIF('',''), NULLIF('',''), '銅鑼灣渣甸坊48號采怡閣地下1號C鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0023', '康隆南亞食品(柴灣)紅色假期不收貨', '', '3844 4590', NULLIF('',''), NULLIF('',''), '柴灣新業街9號新業大廈1樓 A室 4樓及7樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0024', '薔紅餐廳(灣仔)', '', '2838 3784', NULLIF('',''), NULLIF('',''), '灣仔莊士敦道194-204號灣仔商業中心1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0025', '赤板日本料理(天后 )', '', '', NULLIF('',''), NULLIF('',''), '天后電氣道68號金輪天地20樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0026', '花街道Hanakaido(銅鑼灣)', '', '97330265', NULLIF('',''), NULLIF('',''), '銅鑼灣渣匐坊48號采怡閣地下4號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0027', '東館 tung club(西環)', '', '67365770', NULLIF('',''), NULLIF('',''), '堅尼地城北街五福大廈地下shop12B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0028', '叁兄優質食材(鰂魚涌)逢星期一休息', '', '62024261', NULLIF('',''), NULLIF('',''), '鰂魚涌英皇道1028號海山樓地下C12號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0029', '基督教國際神召會', '', '蔡姑娘 9128 3243', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0029-01', '基督教國際神召會(北角)', '', '9128 3243', NULLIF('',''), NULLIF('',''), '北角英皇道 483 號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0029-02', '基督教國際神召會(柴灣)', '', '9128 3243', NULLIF('',''), NULLIF('',''), '柴灣環翠道 121 號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0030', '晴天見（銅鑼灣）', '', '63093280', NULLIF('',''), NULLIF('',''), '銅鑼灣波斯富街52號地下（軒尼詩大廈）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0031', '蘭桂巷', '', '90610135', NULLIF('',''), NULLIF('',''), '中環德己立街21號, 店舖B, UG/F The Plaza', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0032', '點子廚房', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0033', '睿私房菜(銅鑼灣)', '', '60373288', NULLIF('',''), NULLIF('',''), '銅鑼灣耀華街38 號 Zing! 28/f', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0034', '揚食屋（中環）', '', '', NULLIF('',''), NULLIF('',''), '中環士丹利街33號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0035', '真滋味美食(西環)-12點後送貨，早送貨品會被充公的', '', '', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PEGGY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0036', '包龍星(北角)', '', '', NULLIF('',''), NULLIF('',''), '北角英皇道442-456號美輪大廈地下6號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0037', '九町屋(北角)', '', '28937668', NULLIF('',''), NULLIF('',''), '北角水星街6-8號恆寶大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0037-01', '九町屋(九龍灣 )', '', '', NULLIF('',''), NULLIF('',''), '九龍灣德寶商場地下123號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0038', '台南‧台男(銅鑼灣)(不能送貨時間12-2)請送貨前一小時聯繫客，早上沒人在', '', '', NULLIF('5662 2004',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0039', '昇華餐飲(中環)', '', '9717 1350', NULLIF('',''), NULLIF('',''), '干諾道中21-22號華商會所大廈15樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0040', '淘館餐廳(中環)', '', '64477909', NULLIF('',''), NULLIF('0',''), '中環機利文新街4號地下舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0040-1', '淘館餐廳(銅鑼灣)', '', '66148271', NULLIF('',''), NULLIF('',''), '銅鑼灣蘭芳道 17號 地鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0041', '大小姐冰室(北角)', '', '28877087', NULLIF('',''), NULLIF('',''), '北角英皇道165-175號公主大廈01及10-13號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0042', 'Penhouse Infinity LTD( 灣仔)', '', '', NULLIF('',''), NULLIF('',''), '灣仔軒尼詩道353號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0043', '華商會所(中環)', '', '67512238', NULLIF('',''), NULLIF('',''), '中環干諾道中21-22号華商會大廈15樓出電梯口右手邊西餐廳
收款10樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0044', '國福會廚房(銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '香港銅鑼灣糖街8號樂聲大廈2樓
是使用住它大廈旁邊另一部獨立電梯上
國福會廚房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0045', '浙江軒(灣仔)', '', '96733824', NULLIF('',''), NULLIF('',''), '灣仔駱克道300-306號浙江興業大廈1/F', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0046', 'GOOLU(炮台山)', '', '9173-3404', NULLIF('',''), NULLIF('',''), '炮台山電氣道160號木蘭苑地下B4號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0047', '王府(銅鑼灣糖街)', '', '94049775', NULLIF('',''), NULLIF('',''), '銅鑼灣糖街8號2樓。 王府', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0048', '囍簽砵砵雞(西環)', '', '95308661', NULLIF('',''), NULLIF('',''), '堅尼地城北路乍街15號J舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0049', '王府撈麵(銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '禮頓道77號禮頓中心20樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0050', 'COFFEE BAR(柴灣)1點後收貨', '雷小姐', '52267671', NULLIF('',''), NULLIF('',''), '小西灣廣場2樓213B (如知道會早送，早半個鐘打給客人97441212', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0051', 'ZIP(淺水灣)', '', '63613851', NULLIF('',''), NULLIF('',''), '淺水灣海難道28號The  pulse.(三樓全層)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0052', 'Homei(灣仔)', '', '9801-6108', NULLIF('',''), NULLIF('',''), '灣仔司徒拔道,金道27號homei小食亭', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0053', '可可豆腐檔（香港華富）', '', '6465 2741', NULLIF('',''), NULLIF('',''), '香港華富商場1期街市3 0號鋪（可可豆腐檔）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0054', 'Zenon(中環)', '', '+852 5610 5828', NULLIF('',''), NULLIF('',''), '中環威靈頓街86號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0055', 'Obar（銅鑼灣）', '', '97922114', NULLIF('',''), NULLIF('',''), '香港銅鑼灣浣紗街7號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0056', 'Racing Champions Limited (private kitchen only)-灣仔', '', '', NULLIF('9303 7715',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0057', 'OOULI (銅鑼灣) 12-10PM', '', '9515 7653', NULLIF('',''), NULLIF('',''), '香港銅鑼灣糖街31號sugar plus 23樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0058', 'A&P CATERING COMPANY LIMITED(西營盤
)', '', '', NULLIF('6898 5957',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0058-01', 'A&P CATERING COMPANY LIMITED(灣仔)', '', '6898 5957', NULLIF('',''), NULLIF('',''), '香港灣仔東區商業中心B1層12號廚房', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0059', '嘉諾撒医院膳食部(山頂道1号)', '', '94122004', NULLIF('',''), NULLIF('',''), '香港舊山頂道1号、嘉諾撒医院地庫(膳食部)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0060', '丸亀製麵 (銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣軒尼詩道500號希慎廣場11樓1110號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0061', 'HUSO(中環)', '', '58011280', NULLIF('',''), NULLIF('',''), '中環皇后大道中74號石板街酒店1樓2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0062', '和府撈面(銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣羅素街24號2000年廣場地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0063', 'Tallore(灣仔)', '', '66221181程生', NULLIF('',''), NULLIF('',''), '灣仔廈門街7-17號D舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0064', '私人會所（上環）', '', '98692079 房生', NULLIF('',''), NULLIF('',''), '上環德輔道中279號豐和大廈12樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'FACEBOOK' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0065', '生記飯店(灣仔)盡量12點前送', '', '91053427楊先生', NULLIF('',''), NULLIF('',''), '灣仔駱克道353號三湘大廈3樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC005' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0066', '譽燒味(筲箕灣)', '', '26608368', NULLIF('',''), NULLIF('0',''), '香港筲箕灣道57-58號太安樓地下A44A舖阿朱家韓式料理', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0067', '養和醫院(跑馬地)', '', '63230231', NULLIF('',''), NULLIF('',''), '跑馬地山村道2號養和醫院 送7樓員工飯堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC005' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0068', '臻滋味(西環)', '楊生', '6996 7099', NULLIF('',''), NULLIF('',''), '西環皇后大道西484-496號 & 山道17-25號新安大樓地下令閣樓A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0069', '路邊攤(西營盤)', '', '9584 0204', NULLIF('',''), NULLIF('',''), '西營盤第二街119號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0069-01', '路邊攤(中環怡和大廈)', '', '9584 0204', NULLIF('',''), NULLIF('',''), '中環康樂廣場1號怡和大廈LG樓BaseHall 02', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0069-02', '野豬(銅鑼灣)', '', '95240804', NULLIF('',''), NULLIF('',''), '銅鑼灣澳門逸園9/F全層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0070', '千樂燒味餐室(北角)', '', '', NULLIF('',''), NULLIF('',''), '北角七姊妹道112-114號合偉大廈地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0071', '嘉之荳（華富村）', '', '9588 6144', NULLIF('',''), NULLIF('',''), '華富村街市73號檔,到貨前通知客人去收貨', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0072', 'Club Albergue 1601', '', '', NULLIF('',''), NULLIF('0',''), '銅鑼灣勿地臣街1號時代廣場食通天11樓1105號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0073', '高尚廚房(黃竹坑）', '', '5903 9029', NULLIF('',''), NULLIF('',''), '香港仔黃竹坑道49-51號得力工業大廈17樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0074', 'BBQ Chicken(柴灣)', '', '57348480', NULLIF('',''), NULLIF('',''), '柴灣吉勝大廈2樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0075', '倪好', '', '67458020', NULLIF('',''), NULLIF('',''), '上環皇后大道中340號華秦國際大廈G層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0076', 'Shiro bakery(灣仔)(上午11點至下午8點有人)', '', '5335 2018', NULLIF('',''), NULLIF('',''), '灣仔港灣道2號香港藝術中心4樓408室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0077', 'Hier(鰂魚涌)', '', '6013 3699', NULLIF('',''), NULLIF('',''), '鰂魚涌海光街34號 hier', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0078', '1號廚房(灣仔)(如致電給客請用WHATSAPP)', '', '9600 1937 , 9643', NULLIF('',''), NULLIF('',''), '灣仔軒尼詩道397號東區商業中心地庫', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0079', '花都餐廳(灣仔)', '', '', NULLIF('',''), NULLIF('',''), '灣仔堅拿道西10號冠景樓1樓B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080', 'BBQ Chicken(中環)', '', '57348480', NULLIF('',''), NULLIF('',''), '中環域多利皇后街裕成商業大廈地下及1樓', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-01', 'HANYANG(中環)', '', '5610 5828', NULLIF('',''), NULLIF('',''), '中環雲咸街43-55號余悅禮行地下D & E號舖', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-02', 'SAMSIC(中環三食)', '', '5610 5828', NULLIF('',''), NULLIF('',''), '中環蘇豪些利街2號LL Tower地舖', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-03', 'JEJUSIC 濟州食(中環)', '', '5610 5828', NULLIF('',''), NULLIF('',''), '中環閣麟街48號地鋪', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-05', 'BMJ SOLSOT LIMITED(中環)', '', '5610 5828', NULLIF('',''), NULLIF('',''), '中環砵典乍街10號致生大廈地鋪', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-06', 'SAMSIC THE BEACH(淺水灣)一、三、五', '', '', NULLIF('',''), NULLIF('',''), '淺水灣海灘道28The Pulse 1/F SHOP112B', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-07', 'SAMSIC(尖沙咀)', '', '5610 5828', NULLIF('',''), NULLIF('',''), '加連威老道12號加連威大廈地下', 'GHFOODS', 'P0', 37, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0080-08', 'BMJ DOTOM LITIMED', '', '', NULLIF('',''), NULLIF('0',''), '中環威靈頓街97威利大廈
1/F room101 & G/F UPPER shop1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0081', 'Penna ‧ Moon Garden (銅鑼灣)12點後才有人收貨付錢', '', '', NULLIF('6012 5835',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0082', '昭和食堂
(灣仔)', '', '', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0083', 'THE BIG BITE(西環)', '', '9467 6525', NULLIF('',''), NULLIF('',''), '西環加倫臺8-16號嘉利大廈地下B舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0084', '圍爐順德菜(銅鑼灣)', '', '9888 6213', NULLIF('',''), NULLIF('',''), '銅鑼灣糖街25-31號Sugar+ 16樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0085', '同益食品有限公司(香港仔田灣)', '', '9633 0796', NULLIF('',''), NULLIF('',''), '香港仔田灣富澤大廈地下高層5號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0086', '深宵(筲箕灣)送貨到前要聯絡客人', '', '9332 4510', NULLIF('',''), NULLIF('',''), '香港鰂魚涌英皇道879號麗華樓地下A部份', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0087', '華富凍肉(華富)', '', '90174774', NULLIF('',''), NULLIF('',''), '香港華富一邨街市', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '飛' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0088', 'BADI EATS LIMITED(銅鑼灣)', '', '5588 4308', NULLIF('',''), NULLIF('',''), '銅鑼灣銅鑼灣道3-17號國泰大廈A1地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0089', '澳純國際有限公司', '', '61336334', NULLIF('',''), NULLIF('',''), '香港灣仔港灣道26號華潤大廈16樓1607-08室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0090', 'hahahappy.p (鰂魚涌)', '', '6172 3177', NULLIF('',''), NULLIF('',''), '鰂魚涌海光街11號漢威大廈地下4號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0091', '築地日本料理(銅鑼灣)', '', '2504 3338', NULLIF('',''), NULLIF('',''), '銅鑼灣記利佐治街1號金百利廣場7樓R1室', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0092', '蛋白質料理所(上環)', '', '6191 0342', NULLIF('',''), NULLIF('0',''), '香港區上環永樂街1-3號 世瑛大廈 9樓901室A部分', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0093', 'BAGELS(荃灣)', '', '69401943', NULLIF('',''), NULLIF('',''), '荃灣華偉工業大廈13樓11室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0093-01', 'BAGELS(中環)', '', '69401943', NULLIF('',''), NULLIF('',''), '中環街市2樓219號', 'GHFOODS', 'P0', 7, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0094', 'YANTO YEA(北角)', '', '61539623', NULLIF('',''), NULLIF('',''), '將軍澳寶琳毓雅里9號慧安商場1樓B66號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0095', 'MUNCHY CONCEPT COMEPANY LIMITED', '', '91762139', NULLIF('',''), NULLIF('',''), '香港南區
黃竹坑道46號
新興工業大廈4/F FLAT/RM NO.2', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0096', 'MR. KOREA BBQ LIMITED(銅鑼灣)', '', '96368752', NULLIF('',''), NULLIF('',''), '駱克道491-499號京都廣場5/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0097', 'YA JANG', '', '53440045', NULLIF('',''), NULLIF('',''), '上環香馨里3號文咸西街52號G/F A&B SHOP', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'B/B' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0098', '刀馬旦(北角）', '', '6297 1657', NULLIF('',''), NULLIF('',''), '北角炮台山蜆殼街6-16號寶榮大廈地下B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0099', '森の食堂(數碼港)', '', '54329888', NULLIF('',''), NULLIF('',''), '數碼港商場4樓SHOP403', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0101', 'NUTRITION KITCHEN HK(1300-1400 午膳時間 不要送貨)', '', '', NULLIF('64472109',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0102', '坤豪豬肉枱(上環街市)', '', '9151 0538', NULLIF('',''), NULLIF('',''), '皇后大道中345號上環市政大廈1字樓檔位M26', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0103', '五星茶餐廳(灣仔)', '', '', NULLIF('',''), NULLIF('',''), '灣仔謝斐道110-116號地舖 SHOP 3', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0104', '九町屋(天后)', '', '51176529', NULLIF('',''), NULLIF('',''), '天后水星街17號山河大廈地下A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0105', '佛教李嘉誠護理安老院(大坑道）', '', '28811801', NULLIF('',''), NULLIF('',''), '香港大坑道133號8樓廚房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0106', 'ULURU(灣仔)', '', '60154188', NULLIF('',''), NULLIF('',''), '灣仔春園街1-11春暉大廈1/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0107', 'PETSONA LIMITED(黃竹坑)', '杜小姐', '54495887', NULLIF('',''), NULLIF('',''), '香港黃竹坑業勤街33-35號金來工業大廈一座2樓F室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0108', '祥發燒味小廚(跑馬地)', '', '67492061', NULLIF('',''), NULLIF('',''), '跑馬地黃泥涌熟食中心2樓CF5', 'GHFOODS', 'P0', 7, 'weekly', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0109', 'TJM LIMITED(灣仔)', '', '60784502', NULLIF('',''), NULLIF('',''), '灣仔汕頭街4號廣泰樓G/F SHOP B1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0110', '南川韓食(皇后大道西)', '', '6292 8818', NULLIF('',''), NULLIF('0',''), '皇后大道西423-425號,屈地街石塘坊創業中心1樓110舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0111', '廚坊直餸食品工坊(黃竹坑)', '陳生', '64431988', NULLIF('',''), NULLIF('',''), '香港仔黃竹坑業勤街33-35金來工業大廈BLK2 18/F FLAT A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0112', '筷鑊食堂(銅鑼灣)', '', '55747575', NULLIF('',''), NULLIF('',''), '銅鑼灣希雲街22-24號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0113', '茶記(鴨脷洲大街)', '', '60720489', NULLIF('',''), NULLIF('',''), '鴨脷洲大街102陳屋村地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0115', 'THE SPOON(中環)', '', '', NULLIF('',''), NULLIF('',''), '中環歌賦街24號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0116', 'AL PHOENIX(鰂魚涌)', '', '90606320', NULLIF('',''), NULLIF('',''), '鰂魚涌英皇道728 K11 ATELIER SHOP G03', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0117', '辣先峰(北角)', '', '67948656', NULLIF('',''), NULLIF('',''), '北角和富道明輝大廈地下1號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0118', '好正(駱克道)', '', '', NULLIF('',''), NULLIF('',''), '駱克道382號莊士企業大廈地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0119', '維食香港有限公司(灣仔)', '', '62371164', NULLIF('',''), NULLIF('',''), '灣仔駱克道57-73粵海華美灣際酒店G/F', 'GHFOODS', 'P0', 0, 'weekly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0120', '東華三院方樹泉安老廚房(筲箕灣)', '', '98107075', NULLIF('',''), NULLIF('0',''), '筲箕灣寶文街6號東華三院方樹泉社會服務大樓一樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0121', '豬腳小姐(柴灣)', '', '65470407', NULLIF('',''), NULLIF('',''), '柴灣利眾街40號富誠大廈A庭16樓A3室(J單位)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0122', '文記(尖沙咀)', '', '', NULLIF('',''), NULLIF('',''), '海防道390號熟食檔地下14號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0123', '段純貞牛肉麵(SOUTHSIDE)', '', '97886683', NULLIF('',''), NULLIF('',''), '黃竹坑香葉道11號THE SOUTHSIDE 2樓205號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('D0124', '天福凍肉有限公司(柴灣)', '', '25694644', NULLIF('',''), NULLIF('',''), '柴灣安業街3號新藝工業大廈11樓F室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0001', '御升台之源(尖沙咀新港中心)', '', '', NULLIF('',''), NULLIF('',''), '尖沙咀新港中心地庫B01', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0002', '十勝牛和食料理 (九龍灣啟德)', '', '28073218', NULLIF('',''), NULLIF('',''), '九龍灣啟德晴朗商場B區地下B020號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0002-02', '十勝牛（九龍安達邨）', '', '', NULLIF('',''), NULLIF('',''), '九龍秀茂坪安達邨安達商場L12號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0003', '鮨德有限公司(荔枝角)', '', '3619 0644', NULLIF('8148 7368',''), NULLIF('1M+015',''), '九龍荔枝角寶輪街1號曼克頓山曼坊商場1樓101A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0004', '夜見燒鳥 (大角咀)(放正門)', '', '6675 4337', NULLIF('',''), NULLIF('',''), '大角咀塘尾道205號地下', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005', 'Goobne Chicken(尖沙咀The Hart)', '', '23110001', NULLIF('',''), NULLIF('',''), '尖沙咀赫德道4號The Hart 2樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-01', 'Goobne Chicken(旺角)', '', '', NULLIF('',''), NULLIF('',''), '旺角彌敦道628號瓊華中心15樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-02', 'Goobne Chicken (銅鑼灣V Point )', '', '', NULLIF('',''), NULLIF('',''), '銅鑼灣登龍街18號V Point 25樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-03', 'Goobne Chicken (荃新天地1期)', '', '', NULLIF('',''), NULLIF('',''), '荃灣楊屋道1號荃新天地1期地下G29號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-04', 'Goobne Chicken (天晉匯2期 )收貨:11am to 22pm.', '', '2712 0002', NULLIF('',''), NULLIF('',''), '將軍澳唐賢街19號天晉匯2期1樓119A鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-05', 'Goobne chicken(東涌東薈城）', '', '2818 2088', NULLIF('',''), NULLIF('',''), '東涌達東路20號東薈城名店倉7樓701號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-06', 'Goobne Chicken (中環威靈頓街)', '', '2907-2323', NULLIF('',''), NULLIF('',''), '中環威靈頓街2-8號威靈頓廣場M88 5樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-07', 'Goobne Chicken (屯門時代廣場北翼)', '', '', NULLIF('',''), NULLIF('',''), '屯門屯隆街2號屯門時代廣場北翼地下45-46號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0005-08', 'GOOBNE(啟德)', '', '', NULLIF('',''), NULLIF('',''), '香港九龍啟德協調道2號AIRSIDE 5樓510號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0006', 'Pastime burger & bar (佐敦)', '', '3170 6390', NULLIF('',''), NULLIF('',''), '九龍廣東道513號, 玉器交易廣場地下F店', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0007', 'Pastime café (佐敦)', '', '6078 0764', NULLIF('',''), NULLIF('',''), '廣東道513地下F鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0008', '泰爸爸 (大角咀)', '', '2838 8255', NULLIF('',''), NULLIF('',''), '九龍大角咀海泓道1號奧海城第3期地下G26', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0009', '廚尊 (旺角)', '', '', NULLIF('',''), NULLIF('',''), '旺角上海街618號2樓', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0010', '第一餐飲有限公司(太子)', '', '6600 8090 陳小姐', NULLIF('',''), NULLIF('',''), '太子西洋菜南街258-260號長寧大廈地下CD1舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E00100', '港女廚房（環球）有限公司', '', '', NULLIF('',''), NULLIF('',''), '九龍紅磡鶴園街2G恆豐工業大樓二期F座8樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0011', '博日式料理(美孚)', '', '', NULLIF('',''), NULLIF('1M+030',''), '美孚新村第六期恆柏街2-7號地下N29C2&N29C3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0012', '飯意冰室一蚊凍肉(荔枝角)', '', '22678080', NULLIF('',''), NULLIF('0',''), '荔枝角長沙灣道883號億利工業中心地下3和5號舖', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0013', '小城日和 (荔枝角)', '', '', NULLIF('',''), NULLIF('',''), '荔枝角宇晴匯37B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0013-01', '波士(西營盤)', '', '', NULLIF('',''), NULLIF('',''), '西營盤水街5號昌榮閣地下1號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0015', '威記粥品(深水埗)', '', '6078 0764', NULLIF('',''), NULLIF('',''), '深水埗汝州街226號地下C號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0016', 'MR. HOT POT(尖沙咀)', '', '98020346', NULLIF('',''), NULLIF('',''), '尖沙咀厚褔街8號H811樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0017', 'Hoo Brands Ltd(尖沙咀)', '', 'Jenny 5408 8803', NULLIF('',''), NULLIF('',''), '尖沙咀厚福街12-12A藍馬商業大廈22樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0019', '川婆婆(尖沙咀)', '', '2369 8616 / 6211', NULLIF('',''), NULLIF('',''), '尖沙咀寶勒巷 26-36號華寶大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0020', '探燒 ( 旺角 )', '', '5611 7543', NULLIF('',''), NULLIF('',''), '旺角通菜街華發大廈B舖地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0021', '街角咖啡 (佐敦)', '', '6939 5693', NULLIF('',''), NULLIF('',''), '佐敦柯士甸道83號柯士甸廣場地下8B舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0022', '龍傑有限公司(紅磡)', '', '66213489', NULLIF('',''), NULLIF('',''), '必嘉街紅磡中心7A,7B.7C鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0023', 'Geda Bar & Restaurant (尖沙咀)', '', '', NULLIF('',''), NULLIF('',''), '尖沙咀天文台道8號6樓2室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0024', 'Day N nite(尖沙咀)', '', '9166 9753', NULLIF('',''), NULLIF('',''), '尖沙咀天文台圍2-4號翠景閣地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0025', '今晚煮角 (深水埗)', '', '62760985', NULLIF('',''), NULLIF('',''), '深水埗順寧道483號 順景華庭地下6A號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0026', '聖德肋撒醫院(太子)', '', '62876540', NULLIF('',''), NULLIF('',''), '太子道327號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0027', '火鍋堂(通菜街)(2:00後)', '', '61345553', NULLIF('',''), NULLIF('',''), '旺角通菜街1A-1L號威達商業大廈地下M號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0028', '西記粥店 (太子)', '', '', NULLIF('',''), NULLIF('',''), '九龍太子太子道西133號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0029', '月目私房菜(荔枝角)2:00 後有人收貨', '馬生', '64708418', NULLIF('',''), NULLIF('',''), '香港九龍荔枝角長沙灣道883號億利工業中心2樓05室', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0030', '君怡軒 (油麻地)', '', '', NULLIF('2405 1989',''), NULLIF('',''), '九龍衛理道 18 號君頤峰會所五樓', 'GHFOODS', 'P0', 75, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0031', '順昌糧食公司(荔景邨)', '', '94393536', NULLIF('',''), NULLIF('',''), '荔景邨曰景樓6號地鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0032', '文怡餐飲有限公司(深水埗)', '', '92841248', NULLIF('',''), NULLIF('',''), '九龍欽州街37A號深水埗警署E座地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0033', '邁爵斯 majesty(太子)', '', '61883411 鄧小姐', NULLIF('',''), NULLIF('',''), '太子塘尾道福華街15號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0034', '威威小食(旺角) 請1030 後送', '', '60550435', NULLIF('',''), NULLIF('',''), '登打士街43A 威威小食( Aeon 對面)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0035', '雲中川小鍋米線(長沙灣)', '', '55784664', NULLIF('',''), NULLIF('',''), '長沙灣元州街1E鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0036', '快馬鮮生(紅磡)', '', 'Vince  9280 4011', NULLIF('',''), NULLIF('',''), '紅磡必嘉街紅磡灣中心鴻勝閣7A, 7B,7C號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0037', '喵汪膳工房(長沙灣)', '', '93526395', NULLIF('',''), NULLIF('',''), '長沙灣青山道696號時采中心1102室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0038', '大樹燒烤(尖沙咀)', '', '6998 4005', NULLIF('',''), NULLIF('',''), '尖沙咀厚福街8號 12樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0039', '璨年華國際(深水埗)', '', '6434 4786', NULLIF('',''), NULLIF('',''), '深水埗基隆街107號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0040', '淥烚年代（尖沙咀）', '', '63485233', NULLIF('',''), NULLIF('',''), '尖沙咀 寶豐大厦2樓 淥烚年代', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0041', '鱘味鐵板燒(尖沙咀)12 點後先有人返', '', '6081 0243', NULLIF('',''), NULLIF('',''), '尖沙咀科學館道14號新文華中心1樓155-156號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0042', '壽司盛(旺角)', '', '90134495', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0043', 'COFTEA(大角咀)', '', '67312923', NULLIF('',''), NULLIF('0',''), '大角咀海景街36-46號富貴大廈西座地下4號及23號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0044', 'Foodgarden(荔枝角)', '', '28689155', NULLIF('',''), NULLIF('',''), '荔枝角長義街9號D2 1期3樓303號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0045', '菜籃子海鮮肉菜(深水埗)', '', '', NULLIF('',''), NULLIF('',''), '深水埗大南街278A地下2號鋪', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0046', '肥媽小食（九龍城）', '', '5689 9059', NULLIF('',''), NULLIF('',''), '九龍城龍崗道27號地下B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0046-01', '肥媽小食(天水圍)', '', '', NULLIF('',''), NULLIF('',''), '天水圍新北江一樓c59b', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0048', '龍津燒（深水埗）', '', '5910 6050', NULLIF('',''), NULLIF('0',''), '深水埗黃竹街37-41號崇德大廈地下b及b1地舖（龍津粉麵）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0049', '金蘭拉麵（紅磡）', '', '', NULLIF('',''), NULLIF('',''), '紅磡環海街7號大環山游泳池1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0050', '譽港點心專門店（新蒲崗）', '點心阿漢', '90183854', NULLIF('',''), NULLIF('',''), '新蒲崗彩虹道242號采頤花園地下210-214號舖。
譽港點心專門店 。', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0051', 'GOODIN'' OUT(大角咀)', '', '91366851', NULLIF('',''), NULLIF('',''), '大角咀嘉善街25號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0052', '最雞Chickenest(石硤尾)', '', '', NULLIF('',''), NULLIF('',''), '石硤尾偉智里2號金玉大廈地下205號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0053', '有情有味(油麻地)', '', '', NULLIF('',''), NULLIF('',''), '油麻地西貢街地下2L', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0054', 'Meow Tea (荔枝角)', '', '6856 7711', NULLIF('',''), NULLIF('',''), '荔枝角長沙灣道883號億利工業中心地下6號A3舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0054-01', 'Meow Tea（新蒲崗）', '', '6856 7711', NULLIF('',''), NULLIF('',''), '新蒲崗大有街33號佳力工業大廈地下3A號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0055', 'GROUP81 CO LTD-存倉費', '', '', NULLIF('',''), NULLIF('',''), 'ROOM B3 5/F LLADRO CENTRE72-80 HOI YUEN ROEAD KWUN TONG KOWLOONHONG KONG', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0056', '韓正屋韓國料理(土瓜灣)', '', '6382 1885', NULLIF('',''), NULLIF('',''), '土瓜灣北帝街38號地下4號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0057', '香港聯合有限公司(旺角新填地街)', '', '96135185', NULLIF('',''), NULLIF('',''), '旺角新填地街419號新天地酒店', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'PEGGY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0058', 'URBAN ROASTED RESORT(深水陟)', '', '57267046', NULLIF('',''), NULLIF('',''), '大南街98號98地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0059', '立哥麵家(深水埔)12點後有人', '', '91872896', NULLIF('',''), NULLIF('',''), '九龍深水埔欽州街37K號西九龍中心8F 05-06號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0060', '青木有限公司(旺角)', '', '', NULLIF('',''), NULLIF('',''), '旺角荷里活中心18/F5,6室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0061', '滷冰花(大角咀）', '', '66186144', NULLIF('',''), NULLIF('',''), '大角咀角祥街58號大滿樓地下G', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0062', '明乾薈(紅磡中國人壽中心)', '', '9476 0600', NULLIF('',''), NULLIF('',''), '紅磡紅鸞道18號中國人壽中心二樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0063', '茶跡有限公司(尖沙咀)', '', '9885 3588', NULLIF('',''), NULLIF('',''), '九龍尖沙咀尖沙咀南道 81 號南海公寓地下 J 鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0064', '城寨風味(九龍城)', '', '66968888/9556598', NULLIF('',''), NULLIF('',''), '九龍城賈炳道128號九龍城廣場1樓126號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0064-01', '香港到會有限公司', '', '55070089', NULLIF('',''), NULLIF('',''), '觀塘觀塘道316-328號志聯工廠大廈6樓A室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0065', '香港基督教青年會(尖沙咀)', '', '2268 7000', NULLIF('',''), NULLIF('',''), '香港九龍尖沙咀梳士巴利道41 號(B1地庫)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0066', 'Lily Treats-龍達實業集團有限公司 (荔枝角)', '', '90263789', NULLIF('',''), NULLIF('',''), '荔枝角永康街18號，永康中心15樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0067', '螺螄町（旺角）', '', '', NULLIF('',''), NULLIF('',''), '華發大廈1T-1M F舖(係探燒隔離)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0068', '天下無雙有限公司（尖沙咀）', '', '68838188', NULLIF('',''), NULLIF('',''), '亞士厘道16號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0069', '齊惜福有限公司(長沙灣)-無限空間', '黃生', '60948124', NULLIF('',''), NULLIF('',''), '長沙灣東京街12號 麗閣邨麗薇樓 地下5A&5B 無限空間', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0070', '立成環球食品', '', '63023999', NULLIF('',''), NULLIF('',''), '深水埗長沙灣道185號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0071', 'mountain coffee(深水埗)', '尤生', '60297738', NULLIF('',''), NULLIF('',''), 'Mountain 牛角包窩夫專門店 (深水埗)
深水埗青山道3及5號建新大廈地下E 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0071-01', 'Pacific Coffee(旺角太子)', '', '91293960李小姐', NULLIF('',''), NULLIF('0',''), '旺角太子道西193號MOKO新世紀廣場4樓433號舖', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0072', '2.0Cafe（啟德）', '', '9793 1983', NULLIF('',''), NULLIF('',''), '啟德郵輪碼頭 2樓201鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0073', '楊記', '', '2366 6878', NULLIF('',''), NULLIF('',''), '新蒲崗六合街8號六合工業大廈14樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC001' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0074', '粵藝館(尖沙咀海運大廈)', '', '22972022', NULLIF('',''), NULLIF('0',''), '尖沙咀廣東道3-27號海港城海運大廈3樓OT310號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0075', '蘇媽廚房（新浦崗）', '', '65351931', NULLIF('',''), NULLIF('',''), '新浦崗六合街8號六合大廈16樓F室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0076', 'HUSO(中環)', '', '58011280', NULLIF('',''), NULLIF('',''), '中環皇后大道中74號石板街酒店1樓2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0077', 'Camellia(尖沙咀)', '', '28852320', NULLIF('',''), NULLIF('0',''), '尖沙咀梳士巴利道18號維港文化匯K11 Musea 地下033號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0078', '松藝館(尖沙咀)', '', '28852030', NULLIF('',''), NULLIF('0',''), '尖沙咀廣東道3-27號海港城海運大廈3樓OTE303號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0079', '三尖外賣煲仔飯（彌敦道）', '', '9223 3975', NULLIF('',''), NULLIF('',''), '彌敦道317-321金漢大廈地下E舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0080', '千目(大角咀)11點開門', '', '61678812', NULLIF('',''), NULLIF('',''), '大角咀大全街34號   店名京都', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'FACEBOOK' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0081', 'GALBI TOWN（尖沙咀）12點后開門', '', '6473 2989', NULLIF('',''), NULLIF('',''), '尖沙咀堪富利士道8號格蘭中心1樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0082', '2派克雞排(紅磡)', '連生', '92235890', NULLIF('',''), NULLIF('',''), '紅磡蕪湖街123號2派克雞排(門口隔離海德豪苑1樓開lift轉右門口即是)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0083', 'YSK LIMITED(尖沙咀)', '', '', NULLIF('',''), NULLIF('',''), '尖沙咀海港城OCEAN CTR 9/F 913B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0084', '老朱串燒（九龍佐敦）', '', '9032 6300朱生', NULLIF('',''), NULLIF('',''), '九龍佐敦上海街137-139號海豐大廈地下B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0085', '我貓Cafe(
佐敦)', '', '', NULLIF('52883030',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0086', '粉制良品(深水埗)', '', '52228085', NULLIF('',''), NULLIF('',''), '九龍深水埗桂林街143F至H號常福大廈F3號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'FACEBOOK' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0087', '名與山西刀削麵(尖沙咀)', '', '6305 1126', NULLIF('',''), NULLIF('',''), '尖沙咀厚福街2號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'SLEEK' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0088', '啤啤Bear韓國包車(尖沙咀)', '', '5532 0461', NULLIF('',''), NULLIF('',''), '尖沙咀諾士佛臺1號8樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0089', '永共嚐(尖沙咀)', '', '65108398', NULLIF('',''), NULLIF('0',''), '尖沙咀赫德道2號地舖
Bar pacific日間平台', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0090', 'HEAHA HEAHA(尖沙咀)', '', '9220 4403', NULLIF('',''), NULLIF('',''), '尖沙咀寶勒巷10號9樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0091', 'Rico Rico(尖沙咀)', '宇師傅', '34602787', NULLIF('',''), NULLIF('',''), '尖沙咀柯士甸道西1號ELEMENTS圓方火區1樓1001號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0091-01', 'Mikiki(新蒲崗)', '', '67607895', NULLIF('',''), NULLIF('',''), '新蒲崗太子道東638號MikikiG樓G11號鋪', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0092', '串門子(紅磡)', '', '9584 7262', NULLIF('',''), NULLIF('',''), '紅磡必嘉街87號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0093', '樂好有限公司(深水埗)', '', '52886233', NULLIF('',''), NULLIF('',''), '深水埗欽州街37K西九龍中心8樓8F37', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0094', '新南苑私房菜(尖沙咀)', '', '9300 1479', NULLIF('',''), NULLIF('',''), '尖沙咀寶勒巷萬事昌廣場2樓201室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0095', 'Lady Nara(尖沙咀)', '', '21533730', NULLIF('',''), NULLIF('0',''), '尖沙咀廣東道3-27號海港城港威商場3樓3303號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0096', 'Kitchen Mug(荔枝角)', '', '9362 4858', NULLIF('',''), NULLIF('',''), '荔枝角長沙灣長順街1號新昌工業大廈8樓812室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0097', '泰泰(佐敦)', '', '9016 1330', NULLIF('',''), NULLIF('',''), '佐敦吳松街182號榮國中心地下B-D號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0098', '御珍堂有限公司(旺角)早啲送盡量10點', '', '67048875', NULLIF('',''), NULLIF('',''), '香港旺角豉油街126號明威閣2樓8號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0099', '百本會員中心(旺角)10:30am後收貨', 'Dicky Liu', '9585 8470', NULLIF('',''), NULLIF('',''), '旺角彌敦道612-618號好望角大廈8樓 801室 (山東街入口)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0100', '港女廚房（環球）有限公司', '', '', NULLIF('',''), NULLIF('',''), '九龍紅磡鶴園街2G恆豐工業大樓二期F座8樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0100-01', '港女廚房(中環)  9250 3275 (2pm後有人收貨)', '', '9250 3275', NULLIF('',''), NULLIF('0',''), '中環海濱活動空間，龍和道9號+Booth no(到迴旋打給客人出來接貨', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0100-02', '港女廚房(佐敦)11:00am 後有人收貨', '', '9211 8099', NULLIF('',''), NULLIF('',''), '佐敦彌敦道204-206號遠東發展大廈B鋪地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0101', 'SING CUP火鍋', '', '59304328', NULLIF('',''), NULLIF('',''), '大角咀利得街11號利奧坊1樓1503&1504號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0102', '鍾爺爺海鮮火鍋剌身專門店', 'TONY', '94914950', NULLIF('',''), NULLIF('',''), 'G/F YIU CHUNG BUILDING 368&368A-B PRORTLAND STREET MONG KOK KL', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0103', '咩記打邊爐', '', '', NULLIF('',''), NULLIF('0',''), '旺角通菜街德發大廈2/F
3-8室和10-12室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0104', '小聚嚐鮮主理(紅磡)十一點半有人收貨', '', '94941345', NULLIF('',''), NULLIF('',''), '紅磡黃埔美食坊1樓111號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0105', '宏江有限公司(何文田)', '', '66603898', NULLIF('',''), NULLIF('',''), '何文田
京士柏山
83號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0106', '本多屋(大角咀)', '', '6675 4337', NULLIF('',''), NULLIF('',''), '大角咀塘尾道 197-199號好世界洋樓地下18號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0107', 'KITCHEN AO菁花飲食(荃灣)', '', '65111936', NULLIF('',''), NULLIF('',''), '荃灣柴灣角金熊工業中心


66-82  12/F   D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0108', '侯爵會有限公司(尖沙咀)', '', '91487147', NULLIF('',''), NULLIF('',''), '尖沙咀麼地道華憖廣埸UG2', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'B/B' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0109', 'T.CO MONG KOK', '', '', NULLIF('',''), NULLIF('',''), '旺角西洋菜南街2J-2Q號新江大樓地下6號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0110', 'D32 Catering Group Limited(佐敦)', '', '94941345', NULLIF('',''), NULLIF('',''), '彌敦道380號逸東酒店地庫2號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0111', '一盅點心(長沙灣)', '', '5169 3239', NULLIF('',''), NULLIF('',''), '長沙灣青山道152號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0112', 'THE DUTCH HOUSE', '', '98887282', NULLIF('',''), NULLIF('',''), '九龍廣東道116-120號海威商業中心16/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0113', '泰味食品有限公司(旺角)', '', '69075037', NULLIF('',''), NULLIF('',''), '旺角豉油街126，2/F kitchen no.17', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0114', '樹內貝果有限公司(旺角)', '', '68491718', NULLIF('',''), NULLIF('',''), '旺角彌敦道707-713號銀高國際大廈17樓b室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0115', '梁慶記全蛋竹昇麵食有限公司（旺角）', '', '', NULLIF('',''), NULLIF('',''), '九龍旺角鼓油街74號鴻都大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'LENA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0116', '萬方圓南昌拌粉瓦罐湯11:00-17:00', '', '94226669', NULLIF('',''), NULLIF('',''), '旺角豉油街126號2樓7號廚房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0117', '鹿角巷', '', '95795790', NULLIF('',''), NULLIF('0',''), '尖沙咀彌敦道27-33號良士大廈地下F舖（iSquare對面）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0118', 'Loft green mama(LOFT 206)佐敦', '', '92118099', NULLIF('',''), NULLIF('',''), '佐敦彌敦道204至206號遠東發展大廈惠康旁邊', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0119', '韓食屋(長沙灣)', '歐陽先生', '63585280', NULLIF('',''), NULLIF('',''), '長沙灣青山道489-491號香港工業中心G/F,BLK A,FLAT A2F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0120', '長沙灣街坊福利會林譚燕華幼稚園', '', '6683 1907', NULLIF('',''), NULLIF('',''), '九龍長沙灣荔枝角道608號麗翠苑麗翠商場一樓', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0121', 'One more Rep(荔枝角)', '', '55928777', NULLIF('',''), NULLIF('',''), '長沙灣青山道588-592號永盛工業大廈9樓9室', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0122', 'LAB EAT RESTAURANT & BAR(旺角)', '', '', NULLIF('',''), NULLIF('0',''), '旺角T.O.P This is our Place5樓502號鋪及鋪側露天座位', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0123', '浩銘記(尖沙咀)', '', '60850859', NULLIF('',''), NULLIF('',''), '厚福街5-6號多富閣地下4號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0124', '歡喜家(香港)餐飲有限公司', '', '65502966', NULLIF('',''), NULLIF('',''), '土瓜灣路NO.287土瓜灣大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0125', 'CATFE LIMITED(旺角)', '', '', NULLIF('',''), NULLIF('',''), '旺角彌敦道577高氏大樓ROOM BC,4/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0126', 'SANDWICHOLOGY(尖沙咀)', '', '55484301', NULLIF('',''), NULLIF('',''), '尖沙咀棉登徑8號SHOP17 G/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0127', 'NON CAFE(尖沙咀)', '', '', NULLIF('',''), NULLIF('',''), '尖沙咀亞士厘道24-38天星大廈G/F UNITC2', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0128', 'LE CAFE', '', '', NULLIF('',''), NULLIF('',''), '紅磡寶其利街33-41號華寶大廈G/F FLAT4', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0129', '晚吹GoldClub 
(荔枝角)貨入冰櫃', '', '', NULLIF('93383927',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'WILLIAM' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0130', 'Tsim house', 'Cherry Ng', '93383927', NULLIF('',''), NULLIF('',''), '尖沙咀金巴利道35號金巴利中心4樓403室Pw:0927', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'WILLIAM' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131', '蔓味盒子(香港)有限公司(旺角)', '', '51219677', NULLIF('',''), NULLIF('',''), '旺角豉油街126號2樓Freshlane K27厨房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-01', '蔓味盒子(上環)', '', '55720457', NULLIF('',''), NULLIF('',''), '上環樂基商業中心2樓 K27', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-02', '蔓味盒子(葵芳)', '', '56164869', NULLIF('',''), NULLIF('',''), '葵芳華豐工業中心第二期10樓3A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-03', '蔓味盒子（荃灣）', '', '51219677', NULLIF('',''), NULLIF('',''), '荃灣馬角街新豐工業大廈1樓K17', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-05', '蔓味盒子（觀塘）', '苑', '62175217', NULLIF('',''), NULLIF('',''), '觀塘怡生工業中心H座1樓H03', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-06', '蔓味盒子（葵涌）', '', '55026802', NULLIF('',''), NULLIF('',''), '葵涌打磚砰街和豐工業中心702A室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-07', '蔓味盒子-九龍灣', '', '55026802', NULLIF('',''), NULLIF('',''), '九龍灣臨興街2號美羅中心1期G/F5號舖，！0830', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-08', '蔓味盒子(铜锣湾)', '靜雯', '5974 0425', NULLIF('',''), NULLIF('',''), '香港灣仔軒尼詩道397號東區商業大廈B層11號廚房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-09', '蔓味盒子(新蒲崗)', '', '90626983', NULLIF('',''), NULLIF('',''), '太子道东, 泰景工业大楼6樓a16', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0131-10', '蔓味盒子(荔枝角)', '', '59831608', NULLIF('',''), NULLIF('',''), '深水埗区荔枝角长裕街2号 二號廚房', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0132', '八和私房菜(尖沙咀)', '', '63111008', NULLIF('',''), NULLIF('',''), '尖沙咀堪富利士道11號堪富利士大廈2樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0133', '善茶  調茶絲(尖沙咀)', '鄧小姐', '63008700', NULLIF('',''), NULLIF('',''), '尖沙咀彌敦道36-44號重慶大廈 health 慶方地庫  S06鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0134', 'OCEAN(尖沙咀)', '', '62378218', NULLIF('',''), NULLIF('',''), '尖沙咀金馬倫道22-24號東麗中心4樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0135', '凱龍飲食有限公司(長沙灣)', '', '65787072', NULLIF('',''), NULLIF('',''), '長沙灣路833長沙灣廣場3/F FLAT/RM302', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0136', '厚福館(尖沙咀)', '', '56115889', NULLIF('',''), NULLIF('',''), '尖沙咀柯士甸路20-20A號保發商業大廈地鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0137', '彩鳳國際(香港)有限公司(旺角)', '', '61338166', NULLIF('',''), NULLIF('',''), '旺角登打士街53-55號地下6號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0138', 'LA LUNA(尖沙咀)', '', '65929284', NULLIF('',''), NULLIF('',''), '尖沙咀金巴利道63號嘉新大廈地下SHOPB', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0139', 'T.CO(荔枝角)', '', '5512 1345', NULLIF('',''), NULLIF('',''), '九龍荔枝角長裕街2號嘉圖工廠大廈1樓D室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('E0140', '南記牛什粉麵(深水埗)', '', '5400 8472', NULLIF('',''), NULLIF('',''), '深水埗福華街128號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0001', '鐵板漁屋日本料理(荃灣)', '', '', NULLIF('21207738',''), NULLIF('',''), '荃灣大河道98號如心廣場 2 期地下G01 號舖', 'GHFOODS', 'P0', 45, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0002', '金屋泰國菜館 (荃灣)', '', '2944 9128/5182', NULLIF('',''), NULLIF('',''), '荃灣楊屋道69-71號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0003', '一品點心有限公司 (葵涌)11:45-1:00不設收貨', '', '2803 0885', NULLIF('2803 0884',''), NULLIF('0',''), '新界葵涌打磚坪街 49-53號華基工業大廈1期32樓A室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0005', '食臺(葵芳)星期一休息', '', '3686 0348', NULLIF('',''), NULLIF('',''), '葵芳榮芳路97-111號葵祥大廈地下E1舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'LEO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0006', '金源 (青衣)', '', '24318175', NULLIF('',''), NULLIF('',''), '青衣楓樹窩路10號青衣商場地下S8號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0007', '燒烤堂工場 (葵涌)', '', '9575 9364(楊生)', NULLIF('',''), NULLIF('',''), '葵涌大連排道21-33號宏達工業中心13樓B18室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0008', '千島櫻 (荃灣)', '', '', NULLIF('3741 0108',''), NULLIF('',''), '荃灣大河道100號海之戀商場3樓3013號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0009', '星色有限公司 (葵涌)', '', '', NULLIF('',''), NULLIF('',''), '葵涌大連排道162-170號金龍工業中心2期2樓G室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0010', '三潤(葵涌)', '', '92721110', NULLIF('',''), NULLIF('',''), '葵涌大圓街22號瑞榮工廈2樓c(到時致電開門)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0011', '順華肉食(葵涌)', '', '23388782', NULLIF('',''), NULLIF('',''), '葵涌禾塘咀街87-89號美涌大廈地下7號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0013', 'Hudson Logistics(Warehouse) Co., Ltd.(葵興)', '', '', NULLIF('',''), NULLIF('',''), '新界葵涌大連排道58-66號樂聲工業中心21樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0014', 'Seoul Recipe (荃灣)', '', '9500 7114', NULLIF('',''), NULLIF('',''), '荃灣沙咀道391-407號寶業大廈A座7樓704室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '俊哥' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0015', 'ZEN ONE INTERNATIONAL(荃灣)', '', '', NULLIF('',''), NULLIF('0',''), '香港新界荃灣青山道491-501嘉力工業中心A座11樓1-4,號室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0016', '家家樂餐廳 (葵涌)', '', '', NULLIF('',''), NULLIF('',''), '新界葵涌大隴街昌榮樓109號地下3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0017', '口岸飯堂 (港珠奧口岸)', '', '64615340', NULLIF('',''), NULLIF('0',''), '東涌順暉路33號 港珠澳聯檢大樓香港口岸地下 317號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0018', 'Running Pig Suncyan Limited(荃灣)', '', '62872858', NULLIF('',''), NULLIF('',''), '嘉力工業中心B座1018室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0019', '昇薈三座(東涌)', '', '94249530', NULLIF('',''), NULLIF('',''), '東涌 昇薈三座地下交收', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0020', '漢堡英雄(荃灣)', '', '9657 1831', NULLIF('',''), NULLIF('',''), '荃灣荃景圍208號荃德花園地下13B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0022', '裕林貨倉凍房有限公司(葵涌)', '', '26145801', NULLIF('',''), NULLIF('',''), '新界葵涌葵樂街2-28號C座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0023', '喜愛食材有限公司(葵涌)', '', '9547 4484', NULLIF('',''), NULLIF('',''), '葵涌 國瑞路88號新豐中心 B座 6樓18室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0024', '恆信物流倉有限公司 (葵涌樂聲)', '', '22323709', NULLIF('',''), NULLIF('',''), '葵涌大連排道 樂聲工業中心 21 B', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0025', '紅日茶餐廳(葵涌)8:30前', '', '3188 0400', NULLIF('3188 4340',''), NULLIF('0',''), '葵涌華星街1-7號美華工業大廈C座地下(大連排道門口入,可直推入廚房)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0025-01', '西餐工房(葵涌)8:30前', '', '3188 0400', NULLIF('3188 4340',''), NULLIF('0',''), '葵涌華星街1-7號美華工業大廈C座地下(大連排道門口入,可直推入廚房)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0025-03', 'Lee 18 Ltd', '', '67300248', NULLIF('',''), NULLIF('0',''), '葵涌華星街1-7號美華工業大廈C座地下(大連排道門口入,可直推入廚房)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0026', '串串居 (葵涌)', '', '3483 4832', NULLIF('',''), NULLIF('',''), '葵涌葵涌道1009號珍寶大樓地下E舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0027', '香港食肉獸(葵涌)', '', '92988399', NULLIF('',''), NULLIF('',''), '葵涌麗瑤邨街市18號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0028', '好日子凍肉(馬灣)', '', '5291 3110', NULLIF('',''), NULLIF('',''), '馬灣大街村東5號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0029', '有時小店(葵涌)', '', '9222 2372', NULLIF('',''), NULLIF('0',''), '葵涌大隴街129-151號葵都大廈地下6號鋪(送貨時間11am - 8pm)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0031', '藍天海岸(東涌)', '', '94249530', NULLIF('',''), NULLIF('',''), '東涌 藍天海岸 一座地下交收', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0032', '叁廚(葵興大連排道)', '', '9101 5108', NULLIF('',''), NULLIF('',''), '葵涌工業街2-8號力豐工業大廈3樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0033', '德嘉食堂(樂聲)', '', '2429 8130', NULLIF('',''), NULLIF('',''), '葵涌大連排道58-66號樂聲工業中心', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0034', '馬記茶餐廳(葵涌)', '', '2425 3403', NULLIF('',''), NULLIF('',''), '葵涌石蔭路19號成城大廈地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0035', '綠園茶餐廳( 梨木樹)', '', '62219084', NULLIF('',''), NULLIF('',''), '梨木樹商場103號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0036', 'SKY LIGHT(葵涌)', '', '68235322', NULLIF('',''), NULLIF('',''), '葵涌華星街16-18號寶盈工業大廈24樓D室6838*', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0037', '軒記茶座(葵涌)', '', '6466 1002', NULLIF('',''), NULLIF('',''), '葵涌 葵涌路1001號德昌大廈 地下14室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0038', '世錦桌球會(葵涌)', '', '63366846 耀哥', NULLIF('',''), NULLIF('',''), '葵涌石籬和宜合道26-30號和宜商場地下4號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0039', '耀琳投資有限公司(青衣)', '', '63030348', NULLIF('',''), NULLIF('',''), '青衣長達路偉力工業大廈A座4樓16-18室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0039-01', '耀琳投資有限公司(東涌)', '', '61139978', NULLIF('',''), NULLIF('',''), '赤鱲角航天城東路20號前小小入閘警衛講飯堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0040', '緣味道(荃灣）', '', '6905 1308', NULLIF('',''), NULLIF('',''), '柴灣角街致利工業大廈23A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0041', '冠荃(荃灣)', '', '2405 2345', NULLIF('',''), NULLIF('',''), '荃灣大涌道8號TCL工業中心地下1號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0042', '閨家食品(葵涌)', '', '56002854', NULLIF('',''), NULLIF('',''), '打磚坪街 華基工業大廈2期 19/F D', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0043', '金發冰室(機場亞洲博覽)', '', '6308-0555', NULLIF('',''), NULLIF('',''), '亞洲博覽館地下5號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0044', '本意本味有限公司(葵芳)', '', '2153 3575', NULLIF('',''), NULLIF('',''), '葵涌葵豐街33-39號華豐工業中心12樓C-D室', 'GHFOODS', 'P0', 15, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0045', '越姑娘正宗越南料理(荃灣）', '', '67632211', NULLIF('',''), NULLIF('',''), '荃灣香車街21號海霸樓地下6A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0046', '秀吉食堂(青衣)', '', '94483324', NULLIF('',''), NULLIF('0',''), '青衣西山路2-16號美林花園九座,三樓,107-113號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0047', '韓一韓正屋國料理（荃灣）', '', '63821885', NULLIF('',''), NULLIF('',''), '荃灣海壩街24號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JACKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0048', 'Million (FAR EAST) Logistics Limited (萬安)', '', '3588 8180 /', NULLIF('',''), NULLIF('',''), '葵涌嘉定路1-11號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0049', '鮮美食(荃灣)', '', '+852 6063 2624', NULLIF('',''), NULLIF('',''), '荃灣嘉力工業中心7樓02室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0050', '千味廚房(葵涌)', '', '96289783', NULLIF('',''), NULLIF('',''), '葵涌健全街6-8號裕林第三天工業大廈6樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0051', '蘇哈哈泰國美食（葵涌）', '', '6623 1634', NULLIF('',''), NULLIF('',''), '葵昌中心地下2號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0052', 'Prizesmart Food Limited(荃灣)', '', '3705 8934', NULLIF('',''), NULLIF('',''), '新界荃灣荃景圍202號, 家興大廈地下D號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0053', '標準食品國際有限公司', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0054', '世華茶餐廳', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0055', '小幸冰室-黃金飲食有限公司(葵涌）', '', '5915 6590', NULLIF('',''), NULLIF('',''), '葵涌大白田街29號19-31號安盛大廈地下', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0056', '東華三院周演森小學(青衣)需要開收據', '吳主任', '24331081/9628', NULLIF('',''), NULLIF('',''), '青衣青芊街8號東華三院周演森小學地下家教會室，校務處收貨', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0057', '順豐行食品有限公司(荃灣)', '', '3702 0726', NULLIF('',''), NULLIF('',''), '荃灣沙咀道荃運工業中心1期9樓D2室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0058', '泓玥食品貿易有限公司(荃灣)', '', '61911395', NULLIF('',''), NULLIF('',''), '荃灣柴灣角街34-36號萬達來工業中心', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0059', '紅山餐廳（葵涌）', '', '60949585', NULLIF('',''), NULLIF('0',''), '大連排道36-40號第1期地下B舖貴盛工業大廈一期', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0060', '丸亀製麵 (荃灣廣場)', '', '', NULLIF('',''), NULLIF('',''), '荃灣大壩街4-30號荃灣廣場L1樓139&142號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0061', '葵興花園酒家', '', '2481 0818', NULLIF('',''), NULLIF('',''), '葵涌禾塘咀街葵興商場1樓101號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0062', '好餸(葵涌)', '', '9466 3081', NULLIF('',''), NULLIF('',''), '葵涌永建路16-20號高威工業中心A座5樓01室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0063', 'MY串寶(葵涌)', '', '51080023', NULLIF('',''), NULLIF('',''), '葵涌光輝圍41-45號萬成樓地下3A號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0064', '卡馬到會外賣有限公司', '', '52663007', NULLIF('',''), NULLIF('',''), '葵福路金發工業大廈二期3樓E室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0065', '耀永國際發展有限公司（荃灣）', '', '52010328', NULLIF('',''), NULLIF('',''), '新界荃灣德士古道120號 安泰國際中心201', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0066', '一人燒肉(荃灣)', '', '54049151', NULLIF('',''), NULLIF('',''), '荃灣眾安街2-8號周合成大廈一樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0067', '無牆有限公司(葵昌路)', 'MayChong', '9029 5898', NULLIF('',''), NULLIF('',''), '葵涌葵昌路26號豪華工業大廈4樓D07室
銀色玻璃大門用密碼入去', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0067-01', '羊羊派對(觀塘)', '', '', NULLIF('',''), NULLIF('',''), '九龍觀塘鯉魚門道新城工商中心422室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0068', '為食坊', '', '9387 0125', NULLIF('',''), NULLIF('',''), '葵涌大連排道宏達工業中心706', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0069', 'Pizza banana(葵涌)', '', '5505 3535', NULLIF('',''), NULLIF('',''), '葵涌永建路高威工業中心A座16樓1602', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0070', '輝記飯店(馬灣)', '', '9029 8420', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0071', '永創集團控股有限公司(葵昌路)', '', '6368 6963', NULLIF('',''), NULLIF('',''), '葵昌路9-15號貴豐工業大廈地下B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0072', 'Lacasa Atelier(葵涌)', '', '90295898', NULLIF('',''), NULLIF('',''), '葵涌工業街華發工業大廈後座22樓 
 Innowork大門密碼：2356#
05L房門密碼：283900*', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0073', '品味冰室(葵涌)', '', '', NULLIF('',''), NULLIF('0',''), '葵涌大連排道42號貴盛工業大廈第二期地下E號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0074', '新強記凍肉公司(青衣)', '', '9710 4443', NULLIF('',''), NULLIF('',''), '青衣青綠街38號青衣市政街市15-16號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0075', '宅巷小廚(荃灣)營業時間7:30AM-2:30PM', '陸生', '9732 6356', NULLIF('',''), NULLIF('',''), '荃灣橫龍街43-47號龍力工業大廈地下1號舖A部份', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BRUCE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0076', '7號廚房(荃灣)', '', '9025 7044', NULLIF('',''), NULLIF('',''), '荃灣馬角街8-12號新豐工業大廈1樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0077', 'LONGISLAND LEATHER COMPANY(荃灣)', '', '6576 2420', NULLIF('',''), NULLIF('',''), '葵涌業成街18號星星中心10樓1019室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0078', 'Fancy Kitchen(青衣)', '', '6104 3981', NULLIF('',''), NULLIF('',''), '青衣長達路14-20號偉力工業大廈B座1611室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KEN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0079', 'SWIFTAD LIMITED', '', '', NULLIF('',''), NULLIF('1M+030',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0080', 'Lee 18 Ltd (葵涌)', '', '', NULLIF('',''), NULLIF('0',''), '葵涌華星街1-7號美華工業大廈C座地下(大連排道門口入,可直推入廚房)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('G0081', '明愛聖若瑟中學(青衣)', '', '9278 8391', NULLIF('',''), NULLIF('',''), '青衣青衣邨楓樹窩路10號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0002', '鼎鋮小食 (馬鞍山)', '', '6505 8108', NULLIF('',''), NULLIF('',''), '馬鞍山恆安村街市38號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0003', 'HERE (大埔)', '', '6175 0057(傑仔)', NULLIF('',''), NULLIF('',''), '大埔昌運中心G/F A10', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KINKI' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0004', '哥哥添飯 (火炭)', '', '2455 2877', NULLIF('',''), NULLIF('',''), '新界沙田火炭坳背灣街 14-24 號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KATIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0005', '廉記冰室 (大埔)', '', '3791 2858 孫經理', NULLIF('',''), NULLIF('',''), '大埔廣福村廣福商場平台 P101-101A 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0006', '冬菇亭 (大埔)', '', '9272 1110', NULLIF('',''), NULLIF('',''), '大埔廣福村冬菇亭，近馮梁結中學', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0007', '食肉獸 (錦田)', '', '9838 7230', NULLIF('',''), NULLIF('',''), '新界八鄉錦上路水盞田村121號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0008', '神之手卷(大埔)', '', '9877 1377', NULLIF('',''), NULLIF('',''), '大埔廣福道70-78號寶康大廈C2鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0009', '樂得軒COMPANYSUBLIME(石門)', '', '68271299', NULLIF('',''), NULLIF('',''), '京瑞廣場二期一樓102A1號-08單位', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0010', '森美奧廚房 (粉嶺)', '', '', NULLIF('',''), NULLIF('',''), '粉嶺新運路38號祥華村祥華商場三樓 L305 店', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0011', '廣源小廚茶餐廳(沙田)', '', '3580 1101', NULLIF('',''), NULLIF('',''), '沙田小瀝源路68號廣源商場三座6號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0012', '泰屋(馬鞍山)', '', '', NULLIF('',''), NULLIF('',''), '馬鞍山恆錦街1號恆安街市 42號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0014', 'Chapter ONE(大埔)11:00後', '', '98831756', NULLIF('',''), NULLIF('',''), '大埔仁興街12號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0015', 'DR. COW(大圍)', '', '7072 7998 彭生', NULLIF('',''), NULLIF('',''), '大圍下徑口村31號地下 A 舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0016', '旺記點心小廚(大埔)(貨送後欄)', '', '2341 3339', NULLIF('',''), NULLIF('',''), '大埔太和路2-4號翠怡花園地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0017', '世味細味(火炭）', '', '96094618', NULLIF('',''), NULLIF('',''), '火炭山尾街37-41號華樂工業中心B座13樓33室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0018', '瀛東(沙田)11:30後送', '', '', NULLIF('',''), NULLIF('',''), '新界沙田盛田街1號秦石邨街市地下24-25號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ELLIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0019', '泰星士多(沙田馬場)', '', '90288076', NULLIF('',''), NULLIF('',''), '沙田馬場職員宿舍駿恆閣(地下交收)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0020', '美思食品有限公司(大埔', '', '92232012', NULLIF('',''), NULLIF('',''), '大埔汀角路55號太平工業大廈3樓2座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0021', '健康飲食集團有限公司(大埔)', '', '2662 2202', NULLIF('2129 4242',''), NULLIF('35',''), '香港大埔汀角路57號太平工業中心第一座地下A廠工場', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0022', '一豚豬手專門店 (火炭廠房)', '', '2363 3887', NULLIF('',''), NULLIF('',''), '火炭坳背灣街49號協力工業大廈一樓一室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0022-01', '一豚豬手專門店(屯門)', '', '', NULLIF('',''), NULLIF('0',''), '屯門青楊街8號，得利工業中心地庫6號找倉務負責人，阿滿', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0023', 'Jack''s Terrazza (大美督)', '', '26625666', NULLIF('',''), NULLIF('',''), '大埔汀角路大美督村67號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0024', '龍華酒店(沙田)一式三份發票', '面部榮哥珍姐', '66821156', NULLIF('',''), NULLIF('',''), '沙田下禾輋村22號龍華酒店
找廚房大佬 瀝哥 文哥', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0025', '百喜粥店(沙田)', '', '', NULLIF('',''), NULLIF('',''), '沙田長城街，置富第一城。G88-89', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0026', '芯意零售(大埔)', '', '賴61700663', NULLIF('',''), NULLIF('',''), '大埔昌運中心1樓107鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0027', '鵬記肉食公司(大埔墟)', '', '', NULLIF('',''), NULLIF('',''), '大埔墟街市地下N2舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0028', '大眾樂 (粉嶺)', '', '2256 4485', NULLIF('',''), NULLIF('',''), '粉嶺牽情間4-5號地鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0029', '荷曄庭園景餐廳(大埔)', '', '97909695', NULLIF('',''), NULLIF('',''), '大埔林村放馬埔43號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0030', '金田井駄菓子屋(上水)', '', '23322263', NULLIF('',''), NULLIF('',''), '上水天平路48號天平商場地下114-118店鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0030-01', '金田井駄菓子屋(大埔)', '', '23389263', NULLIF('',''), NULLIF('',''), '大埔運頭塘新城曉運路10號14-15號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0031', '越瀧棧東南亞(粉嶺)', '', '9013 7031', NULLIF('',''), NULLIF('',''), '粉嶺皇后山村皇后山商場街市P1樓8號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0032', '龍騰大排檔(粉嶺)', '', '6696 7274', NULLIF('',''), NULLIF('',''), '粉嶺 軍地馬料水新村 55號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0033', '椰子媽（沙田）', '', '67743444', NULLIF('',''), NULLIF('',''), '沙田廣源邨地下5號舖椰子媽', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0034', '大廚大排檔(粉嶺)', '', '', NULLIF('',''), NULLIF('',''), '新界粉嶺聯和墟新街市2樓22號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC012' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0035', '森港客家菜(粉嶺)11:30前送到', '', '', NULLIF('',''), NULLIF('',''), '聯和墟新街市熟食中心2樓6號舖森港客家菜', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0036', '陳沛海鮮(大埔)', '', '', NULLIF('',''), NULLIF('',''), '大埔墟街市地下F63檔', 'GHFOODS', 'P0', 7, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC012' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0037', '秦 餐廳（粉嶺）-早車，10點前到', '', '', NULLIF('',''), NULLIF('',''), '粉嶺聯和道1號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038', '太平洋酒吧', '', '', NULLIF('',''), NULLIF('1M+030',''), '紅磡鶴園街2G號恆豐工業大廈2期十一樓D2室Office', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC012' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-01', '01太平洋酒吧(紅磡機利士)', '', '', NULLIF('',''), NULLIF('',''), '九龍紅磡機利士北路671號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-02', '02太平洋酒吧（紅磡機利士北路663號）', '', '', NULLIF('',''), NULLIF('',''), '九龍紅磡機利士北路663號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-03', '03太平洋(土瓜灣長城商場)', '', '', NULLIF('',''), NULLIF('',''), '土瓜灣譚公道16-26號長城商場地下2號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-04', '', '', '55068936', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-05', '05太平洋 (牛頭角)', '', '56672945', NULLIF('',''), NULLIF('',''), '牛頭角道77號淘大花園R座地下Moon ocean', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-06', '06太平洋 (深水埗海旭閣)', '', '', NULLIF('',''), NULLIF('',''), '九龍深水埗元洲街298號海旭閣地下A號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-07', '07太平洋 (深水步元洲街)', '', '', NULLIF('',''), NULLIF('',''), '九龍深水步元洲街68號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-08', '08太平洋 (康寧道)', '', '', NULLIF('',''), NULLIF('',''), '九龍觀塘康寧道66號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-09', '09太平洋 (九龍鳳德道)', '', '', NULLIF('',''), NULLIF('',''), '九龍鳳德道31號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-12', '12太平洋 (荃灣)', '', '', NULLIF('',''), NULLIF('',''), '新界荃灣青山公路415號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-13', '13太平洋(上水符興街)', '', '6347 0343', NULLIF('',''), NULLIF('',''), '上水符興街41A-41B', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-16', '16太平洋 (觀塘聯安街)', '', '', NULLIF('',''), NULLIF('',''), '九龍觀塘聯安街9-15號永毅大廈地下5號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-17', '17太平洋 (九龍新蒲崗)', '', '', NULLIF('',''), NULLIF('',''), '九龍新蒲崗彩虹道70號衍慶大廈地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-18', '18太平洋 (葵涌)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界葵涌青山公路501-503號及 507-511友成大樓地下C,D及E號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-19', '19太平洋酒吧(荃灣聯仁街)', '', '55068936', NULLIF('',''), NULLIF('',''), '新界荃灣449約2134地段聯仁街12-26號', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-20', '20太平洋 (沙田)', '', '', NULLIF('',''), NULLIF('',''), '新界沙田大涌橋路34-36號麗豪酒店地下6號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-21', '21太平洋 (將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳唐德街9號將軍澳中心B1樓B02號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-22', '22太平洋 (葵芳)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界葵新界葵涌葵芳榮芳路77-85號葵樂大廈地下D號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-23', '23太平洋 (九龍)', '', '', NULLIF('',''), NULLIF('',''), '九龍聯合道78號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-27', '27太平洋 (大角咀)', '', '', NULLIF('',''), NULLIF('',''), '九龍大角咀杉樹街3至11號德安樓地下4號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-28', '28太平洋 (九龍城南角道)', '', '', NULLIF('',''), NULLIF('',''), '九龍城南角道24號景輝閣地下B舖及地庫', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-29', '29太平洋 (沙田大圍)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界沙田大圍積存街82-86號年豐樓地下A及B號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-30', '30太平洋 (屯門井財街)', '', '', NULLIF('',''), NULLIF('',''), '新界屯門井財街21號協邦大廈地下A號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-31', '31太平洋 (香港仔大道)', '', '', NULLIF('',''), NULLIF('1M+030',''), '香港香港仔香港仔大道238號南灣御園地下1及2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-32', '32太平洋 (屯門青山公路新墟段)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界屯門青山公路新墟段169-181號錦興大廈地下1-3號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-33', '33太平洋 (筲箕灣)', '', '', NULLIF('',''), NULLIF('',''), '香港筲箕灣南康街18號康華大廈地下3號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-37', '37太平洋 (北角)', '', '', NULLIF('',''), NULLIF('',''), '香港北角渣華道196-202號嘉富大廈地下1&2號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-38', '38太平洋酒吧(粉嶺聯興街33號)', '', '', NULLIF('',''), NULLIF('',''), '聯和墟 聯興街33號地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-39', '39太平洋 (西營盤)', '', '', NULLIF('',''), NULLIF('1M+030',''), '香港西營盤皇后大道西330-336號新昇大廈地下A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-61', '61太平洋 (觀塘)', '', '', NULLIF('',''), NULLIF('',''), '觀塘雲漢街89-113號建泰樓地下D及D1號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-62', '62太平洋 (大埔廣福道)', '', '', NULLIF('',''), NULLIF('',''), '新界大埔廣福道51-59號中嘉閣B1號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-63', '63太平洋(粉嶺和泰街19號 )', '', '5991 0211', NULLIF('',''), NULLIF('',''), '聯和墟太平洋和泰街19號地下及閣樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-68', '68太平洋 (北角和富道)', '', '', NULLIF('',''), NULLIF('',''), '香港北角和富道74-82號仁寶閣地庫', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-69', '69太平洋 (葵涌名堂大樓)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界葵涌青山公路444-448號名堂大樓A座地下B,C舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-70', '70太平洋 (柴灣環翠道)', '', '', NULLIF('',''), NULLIF('',''), '香港柴灣環翠道120號仁樂大廈B座A鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-71', '71太平洋 (九龍城太子道西)', '', '', NULLIF('',''), NULLIF('0',''), '九龍九龍城太子道西368-374號龍珠樓地下1號舖及地庫', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-72', '72太平洋 (大角咀塘尾道)', '', '', NULLIF('',''), NULLIF('1M+030',''), '九龍大角咀塘尾道55號新興鋼具商業大廈地下A舖及地庫', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-73', '73太平洋 (元朗珍珠樓)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界元朗青山公路元朗段1號珍珠樓地下4及9號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-77', '77太平洋 (長沙灣南洋大廈)', '', '', NULLIF('',''), NULLIF('1M+030',''), '九龍長沙灣長沙灣道286-300號及九江街126-130號,南洋大廈地下E及F舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-78', '78太平洋 (旺角彌敦道)', '', '', NULLIF('',''), NULLIF('1M+030',''), '九龍旺角彌敦道594-596號旺角新城1樓入口及2樓全層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-79', '79太平洋 (上環德輔道西)', '', '5368 9175', NULLIF('',''), NULLIF('',''), '香港上環德輔道西60-64號西城六十地下A鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-81', '81太平洋 (英皇道)', '', '', NULLIF('',''), NULLIF('1M+030',''), '香港北角炮台山英皇道58-60號康福園地下A及B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-82', '82太平洋 (九龍佐敦)', '', '', NULLIF('',''), NULLIF('',''), '九龍佐敦官涌街24-30號喜滿懷大廈地下2號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-83', '83太平洋 (元朗好悅洋)', '', '', NULLIF('',''), NULLIF('',''), '元朗安良里5號好悅洋地下1,2號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-86', '86太平洋 (筲箕灣道華堂大廈)', '', '', NULLIF('',''), NULLIF('',''), '西灣河筲箕灣道38-40號華堂大廈地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-87', '87太平洋 (天水圍)', '', '', NULLIF('',''), NULLIF('1M+030',''), '天水圍天瑞路88?俊宏軒商場地下G09,G09A及G10號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-88', '88太平洋酒吧（上水）', '', '', NULLIF('',''), NULLIF('',''), '上水馬會道166號地下4號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-89', '89太平洋 MoonOcean(銅鑼灣)', '', '', NULLIF('',''), NULLIF('',''), '香港銅鑼灣耀華街38號ZING!1樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-91', '91太平洋 (旺角文華商場)', '', '', NULLIF('',''), NULLIF('',''), '旺角砵蘭街240-244號文華商場3樓B舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-92', '92太平洋 (將軍澳唐俊街)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新界將軍澳唐俊街28號OCEAN POPWALK地下G08號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-93', '93太平洋 (尖沙咀赫德道)', '', '5401 7944', NULLIF('',''), NULLIF('',''), '尖沙咀赫德道2號金輪商業中心地下', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-96', '96太平洋 (大圍積存街)', '', '', NULLIF('',''), NULLIF('1M+030',''), '大圍積存街82-86號年豐樓下地下C舖(AB鋪 BARPACIFIC (黑白門口)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-98', '98太平洋 (屯門海珠路)', '', '', NULLIF('',''), NULLIF('',''), '屯門海珠路2號海典軒地下3號鋪', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-99', '99太平洋 (屯門湖翠路)', '', '', NULLIF('',''), NULLIF('',''), '屯門湖翠路2號美樂花園地下42&56號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-K1', 'K1太平洋 (旺角砵蘭街)', '', '', NULLIF('',''), NULLIF('',''), '旺角砵蘭街240-244號文華商場(MPM)3樓', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-K2', 'K2太平洋 (新將軍澳唐俊街)', '', '', NULLIF('',''), NULLIF('1M+030',''), '新將軍澳唐俊街28號OCEAN POPWALK 地下G08號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-K3', 'K3太平洋 (沙田麗豪酒店)', '', '', NULLIF('',''), NULLIF('',''), '新界沙田大涌橋路34-36號麗豪酒店地下7號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-K6', 'K6太平洋 (寶琳新都城)', '', '', NULLIF('',''), NULLIF('',''), '寶琳新都城中心3期地下G35舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0038-K7', 'K7太平洋 (元朗馬田路)', '', '', NULLIF('',''), NULLIF('',''), '元朗馬田路8O號御庭居商場地下及閣樓3號舖', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0039', '順景(上水)', '', '', NULLIF('',''), NULLIF('',''), '上水嘉富坊3號，上水貿易廣場，B座一樓9室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0040', '聚悅庭(粉嶺)', '', '61216243', NULLIF('',''), NULLIF('',''), '粉嶺華明商場G05', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0041', '尋味(大圍)', '', '93336762', NULLIF('',''), NULLIF('',''), '大圍田心村地下199號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0042', '哥哥添飯妹妹泡茶(大埔)', '', '', NULLIF('',''), NULLIF('',''), '大埔大明里6號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KATIE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0043', '金城(火炭)', '', '2148-6218', NULLIF('',''), NULLIF('',''), '火炭坳背灣街14-24號金豪工業大廈2期15樓O室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0044', '金城家系拉麵(粉嶺)', '', '67437178', NULLIF('',''), NULLIF('0',''), '香港新界粉嶺新運路8號
粉嶺中心地下123號A-B舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'ALICE' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0045', '金翠寶海鮮(沙田)', '', '26066122', NULLIF('',''), NULLIF('',''), '沙田穗禾路13號穗禾苑商場地下G09及G10號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0046', 'Easy eat(沙田)', '', '', NULLIF('',''), NULLIF('',''), '美林街市73號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0047', 'Kopi coffee（大埔）', '', '+852 6035 9108', NULLIF('',''), NULLIF('',''), '大埔翠樂街美豐花園地下7號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0048', '嚐樂冰室(大圍)7 :00am-5：00pm', '', '63381709', NULLIF('',''), NULLIF('',''), '大圍翠田街新田村66號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0049', '金堡(大埔)', '', '51371022', NULLIF('',''), NULLIF('',''), '大埔頌雅路11號富蝶邨斑蝶樓地下LG04號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0050', 'Bites bro (中文大學)', '', '', NULLIF('',''), NULLIF('0',''), '香港中文大學新亞書院梁雄姬樓 地下 新亞書院飯堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0051', '小香豬凍肉(西貢)', '', '55453194周生', NULLIF('',''), NULLIF('',''), '西貢街市地下M1鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0052', '快達食品有限公司', '', '9284 6898', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0053', '陶明居(粉嶺)', '', '9133 5432', NULLIF('',''), NULLIF('',''), '新界粉嶺聯和墟和泰街8-10號和泰樓地下H及I舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0054', '加法集團(粉嶺)', '', '+852 6818 8738', NULLIF('',''), NULLIF('',''), '粉嶺安樂邨 豐盈工貿中心 4樓C', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0055', 'Curry Boy(大圍)', '', '91067361', NULLIF('',''), NULLIF('',''), '沙田積運街2-8號海福花園商場地下22號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0056', '天鑽廚房有限公司(大埔)', '', '91255842', NULLIF('',''), NULLIF('',''), '大埔山塘路8號天鑽會所餐廳', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0057', '多多車仔麵( 大埔)', '', '6823 6511', NULLIF('',''), NULLIF('',''), '大埔安泰路1號 大冉2廣場第1層56號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'BOSCO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0057-01', '多多串燒( 大埔)', '', '6823 6511', NULLIF('',''), NULLIF('0',''), '大埔安泰路1號 大埔廣場第1層56號鋪(貨送車仔麵)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'BOSCO' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0058', '燒烤局（上水）', '', '6157 6374', NULLIF('',''), NULLIF('',''), '上水天光甫63號，華園u turn 一直行到橙色木屋', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0059', '小肥豬扒餐廳(大圍)', '楊', '', NULLIF('',''), NULLIF('',''), '沙田大圍
海福花園商場地下14號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0060', 'Pub Solution (沙田)', '', '', NULLIF('',''), NULLIF('0',''), '沙田圍沙角街8-12號花園城一期地下4號舖(4A,4B,4C & 4D)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0061', '沙頭角農莊(塘肚村)收貨時間8點一12點', '', '9467 1621', NULLIF('',''), NULLIF('',''), '沙頭角農莊(塘肚村)', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0062', '麻甩爐海鮮雞煲私房菜(送貨時間11 - 3  ，5：30後)', '', '', NULLIF('66210776',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0063', '同信家長教師會(大埔)', '', '62844470', NULLIF('',''), NULLIF('',''), '大埔碗窰怡翠山莊二期', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0064', '童樂（大圍）11:00 後先有人收貨', '', '6338 4636', NULLIF('',''), NULLIF('0',''), '新界大圍積運街2-8號海福花園商場地下31-C1號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0065', '萍姐食堂(大埔)', '', '95120614', NULLIF('',''), NULLIF('',''), '大埔工業邨大富街4號1樓飯堂', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0066', '錦成企業公司(火炭)', '', '9322 3166', NULLIF('',''), NULLIF('',''), '火炭駿洋邨駿逸樓23樓08室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0067', '同信會家教會（大埔）', '', '62844470', NULLIF('',''), NULLIF('',''), '大埔碗窰怡翠山莊二期', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0068', '天外天1972(大埔)', '', '6033 7900', NULLIF('',''), NULLIF('',''), '大埔寶湖道街市 P1', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0069', '香港永年車仔麵茶冰廳(沙田)', '', '9221 0358', NULLIF('',''), NULLIF('',''), '沙田沙田正街18號新城市廣場一期1樓113號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0069-01', '香港永年車仔麵茶冰廳(新蒲崗)', '', '9221 0358', NULLIF('',''), NULLIF('',''), '新蒲崗爵祿街39號啟德工業大廈E座5樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'JIMMY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0070', '一屋之煮(大圍)下午一點半至七點', '', '', NULLIF('',''), NULLIF('',''), '大圍道24-26號富昌樓地下6號舖 （馬會對面）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0071', '蒲田活鰻(火炭)', '', '54487502', NULLIF('',''), NULLIF('',''), '火炭黃竹洋街15 －21號華聯工業中心A座7樓25室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0072', 'MY湯(火炭)', '', '6403 5957', NULLIF('',''), NULLIF('',''), '火炭銀禧花園開心市集15號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0073', 'New Bon Marine (HK) Limited (火炭)', '', '61069988', NULLIF('',''), NULLIF('',''), '火炭黃竹洋街5-7號', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0074', '現金客-葉生(西貢)', '', '9466 9995', NULLIF('',''), NULLIF('',''), '西貢蠔涌新村395號地下交收(南邊圍路入)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0075', '釜山炸雞批薩(馬鞍山)', '', '90187877', NULLIF('',''), NULLIF('',''), '馬鞍山二期地下23-26號舖新港城', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC011' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0076', '現金客-梁小姐(大圍)97727278', '梁小姐', '97727278', NULLIF('',''), NULLIF('',''), '大圍新村
培橋書院?層消防欄停', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0077', '長運食品零售發展有限公司（大圍）', '', '92072077', NULLIF('',''), NULLIF('',''), '大圍成運路安豪工業大廈17-19號L舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0078', '藍地雞煲', '', '68100500', NULLIF('',''), NULLIF('',''), '荃灣嘉力工業中心B座 1202', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0079', '喰屋(上水中心)', '', '5111 7506', NULLIF('',''), NULLIF('15',''), '新界上水智昌路3號上水中心第二層2043至2044號鋪及2043至2044號鋪鄰近空間', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'Y/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0080', '香港金庄國際食品', '', '26169323', NULLIF('',''), NULLIF('',''), '香港將軍澳日出康城首都3座21樓LD室', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0081', '新環球(香港)有限公司', '', '60942789', NULLIF('',''), NULLIF('',''), '新界沙田火炭禾香街12-36號百適一倉地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0082', '香港戒毒會(上水)', '', '92212358', NULLIF('',''), NULLIF('',''), '上水坑頭路108號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0083', '惠澤餐飲有限公司（沙田）', '', '59008645', NULLIF('',''), NULLIF('',''), '新界沙田大涌橋路20-30號河畔花園1樓32號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0084', '世外桃源', '', '94444009', NULLIF('',''), NULLIF('',''), '香園圍口岸，173 蓮麻坑路，打鼓嶺北', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0085', '二當家粉麵(粉嶺)', '', '26035668', NULLIF('',''), NULLIF('',''), '粉嶺聯和墟聯興街23號 二當家粉麵', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0086', '肥老虎(大埔) 加冰袋', '', '64899918', NULLIF('',''), NULLIF('',''), '大埔北盛街9號翠河花園6號地鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0087', '三鮮坊有限公司', '', '51037373', NULLIF('',''), NULLIF('',''), '上水龍豐花園LEVEL1 SHOP30', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0088', '國金全貿易有限公司（大美督）', '', '97745414', NULLIF('',''), NULLIF('',''), '大美督村145號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0089', '靠父幹車仔麵(十一點前)(大圍)', '', '60428234', NULLIF('',''), NULLIF('',''), '大圍積信街31/51號安信地下Q鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0090', '燊城(太和)', '', '65819966', NULLIF('',''), NULLIF('',''), '太和翠怡街3號翠怡花園1樓SHOP12', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0091', '韓食研究所(沙田站)', '', '6184 6607', NULLIF('',''), NULLIF('',''), '沙田港鐵沙田站SHT 34號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0092', '飯飯之交( 大圍)', '', '9689 6245', NULLIF('',''), NULLIF('',''), '大圍車公廟路18號香港伍倫貢學院1樓 小食部', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'WILLIAM' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0093', '明愛樂進學校(沙田)', '', '60821992', NULLIF('',''), NULLIF('',''), '沙田文禮路30號學生宿舍', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0095', '熾滷賣滷有限公司(火炭)', 'Ivy', '6704 3760', NULLIF('',''), NULLIF('',''), '香港火炭拗背灣街 49 號協力工業大廈高層地
下 1(A)室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0096', '一茶一味有限公司', '', '54019895', NULLIF('',''), NULLIF('',''), '沙田火炭村60號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0097', '撈得掂（粉嶺）', '', '62338758', NULLIF('',''), NULLIF('',''), '粉嶺皇后山街市商業檔位25檔', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0098', '東華三院莫黃鳳儀安老院(沙田）', '院舍職員', '26042293', NULLIF('',''), NULLIF('',''), '新翠邨新儀樓3字樓1至60室 
(要致電26042293叫院舍職員開lift門）', 'GHFOODS', 'P0', 7, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY.' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0100', '爪物超柿(沙田)貨到通知', '', '60610764', NULLIF('',''), NULLIF('',''), '沙田希爾頓中心3樓68-74號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0101', 'OP CAFE(火炭)', '', '6223 9624', NULLIF('',''), NULLIF('',''), '火炭駿景路1號駿景廣場地下G92-93號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0102', '安富小廚有限公司(東涌交收)', '', '84940726', NULLIF('',''), NULLIF('',''), '長洲大興堤路17 G/F', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0103', '優質生活會館有限公司(上水)', '', '95001869', NULLIF('',''), NULLIF('',''), '上水上水貿易廣場B座209室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0104', 'THAI FOOD(青衣)', '', '64388112', NULLIF('',''), NULLIF('',''), '青衣青衣長發廣場地下SHOP5', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0105', '福滿堂北京烤鴨(秦石)', '', '91026770', NULLIF('',''), NULLIF('',''), '沙田大圍盛田街21號秦石街市5，6號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0106', '恩榮護老有限公司（上水）', '', '23880925', NULLIF('',''), NULLIF('',''), '北區古洞北福利服務綜合大樓3樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0107', '熙貝香港貿易有限公司(粉嶺)', '', '', NULLIF('',''), NULLIF('',''), '皇后山商場5號舖7–11隔離', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/BOEY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0108', '珍珀雅集(粉嶺)', '', '9754 1891', NULLIF('',''), NULLIF('',''), '粉嶺聯和道75A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('K0109', '樂凱撒(馬鞍山)', '', '54934953', NULLIF('',''), NULLIF('',''), '馬鞍山新港城中心LEVEL2 SHOP NO.2129', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0001', '溢利食品(香港)有限公司', '', '2816 6788', NULLIF('',''), NULLIF('',''), '香港九龍長沙灣大南西街609號永義廣場10樓C室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0002', '廣興公司(旺角)', '', '2808 2809', NULLIF('',''), NULLIF('',''), '九龍旺角深圳街7號閣樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0003', '文宋貿易有限公司(油塘)', '姚小姐', '2618 2233', NULLIF('2778 1828',''), NULLIF('',''), '九龍油塘高輝道17號高輝油塘工業城B座12樓17室', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0004', '豐菓明家有限公司', '', '', NULLIF('',''), NULLIF('1M+000',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0005', 'NS FOOD GLOBAL(石門)', '', '', NULLIF('',''), NULLIF('',''), '沙田石門安睦街28號永得利中心14樓A室', 'GHFOODS', 'P0', 60, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0006', '俊興冷凍食品有限公司', '', '2156 0660', NULLIF('',''), NULLIF('',''), '葵涌大連排道58-66號樂聲工業中心16樓B座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0007', '珠明肉食有限公司(柴灣)', '', '2558 9311', NULLIF('',''), NULLIF('',''), '香港柴灣永泰道50號港利中心4- 5號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0008', '明溢貿易有限公司(屯門)', '', '3483 8099', NULLIF('',''), NULLIF('',''), '屯門建發街17號同德工業大廈1樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0009', '虎雲食品有限公司(屯門)', '', '', NULLIF('',''), NULLIF('',''), '屯門震寰路3號, 德榮工業大廈18樓 C 室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0010', '寶升凍肉公司(屯門)', '', '6188 0588', NULLIF('',''), NULLIF('',''), '屯門建群街3號永發工業大廈2樓G-H 室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0011', '祥昇國際貿易有限公司(荃灣)', '', '3797 5670', NULLIF('',''), NULLIF('',''), '香港新界荃灣海盛路9號有線大廈39樓08室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0012', '瀧和食品貿易有限公司(荃灣)', '', '3619 2084', NULLIF('',''), NULLIF('',''), '新界荃灣海盛路11號ONE MIDTWON 18樓19室', 'GHFOODS', 'P0', 15, 'biweekly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('M0013', '香港鴻興公司', '', '2543 0219', NULLIF('',''), NULLIF('',''), '新界葵芳葵豐街2-16號鍾意恆勝中心8樓804G室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('P00', 'P0報價', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('P001', 'P1報價', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('P002', 'P2報價', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('P004', '張冠華報價 5%', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('P006', 'P3報價', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Q0001', '日出康城-通記冰室(將軍澳)', '', '', NULLIF('',''), NULLIF('15',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0001', 'COOL FOOD', '', '6901 5672 謝生', NULLIF('',''), NULLIF('',''), '葵涌大連排道58-66號樂聲工業中心16樓B座', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0002', 'BIGBIG SHOP', '', '51351661', NULLIF('',''), NULLIF('',''), '葵涌大連排道58-66號樂聲工業中心16樓B座', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0003', 'FOODPANDA', '', '6081 9620', NULLIF('',''), NULLIF('',''), '葵涌大連排道58-66號樂聲工業中心16樓B座', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0004', 'Gourmet Spot 美食部落(將軍澳)', '', '', NULLIF('',''), NULLIF('',''), '將軍澳尚德廣場 2 樓 233B 舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0005', '肉冰Chill (將軍澳明德店)11點', '', '', NULLIF('',''), NULLIF('',''), '將軍澳坑口明德商場地下46-47鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0006', '進昇有限公司 (觀塘)', '', '5712 4866/5533', NULLIF('',''), NULLIF('',''), '官塘敬業街59號敬業工廠大廈11樓B16室(門3839)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0007', '運陞國際有限公司(坑口)', '', '6514 2148 蔡生', NULLIF('',''), NULLIF('',''), '坑口南豐廣場1樓B15號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0008', '好達食品(觀塘)', '', '9720 0301 謝小姐', NULLIF('',''), NULLIF('',''), '觀塘成業街19-21號成業工業大廈2樓33室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0009', '山田海國際有限公司(觀塘)', '', '6549 8303 Austin', NULLIF('',''), NULLIF('',''), '觀塘駱駝漆大廈三期 3 樓 R 室', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0010', '明洞(觀塘)', '', '51351661', NULLIF('',''), NULLIF('',''), '觀塘開源道60號駱駝漆大廈三座三樓T室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0011', 'Seoul雜貨店(觀塘)', '', '6081 9620', NULLIF('',''), NULLIF('',''), '觀塘利安道32號順利紀律部隊宿舍商場2樓9號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0012', 'KACHA LIMITED(觀塘)', '', '6026 1899', NULLIF('',''), NULLIF('',''), '觀塘鴻圖道52號3樓B室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0013', '優鮮(九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣淘大商場三期一樓216舖', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0014', '老饕(土瓜灣)', '', '9858 2898 廖生', NULLIF('',''), NULLIF('',''), '土瓜灣北帝街38號 4 號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0015', '百里鮮達(土瓜灣)', '', '9223 8153', NULLIF('',''), NULLIF('0',''), '九龍土瓜灣環安街 24號 Soda mall 地下01D號鋪A部份', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0016', 'Gourmet Spot 560 美食部落(慈雲山)', '', 'Ivan 9625 8853', NULLIF('',''), NULLIF('',''), '慈雲山中心560鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0017', '源智國際MART6(九龍灣)', '', '', NULLIF('',''), NULLIF('',''), '九龍灣德福廣場一期舖頭G32', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0018', '聚佳選食品超市(紅磡)', '', '6901 5672 謝生', NULLIF('',''), NULLIF('',''), '紅磡馬頭圍道96號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0019', '愈記食品批發有限公司(美家士多)(黃大仙)', '', '6026 1899', NULLIF('',''), NULLIF('',''), '黃大仙啟德花園購物商場地下9號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0020', '肉冰Chill (天水圍)', '', '92126591', NULLIF('',''), NULLIF('',''), '天水圍天澤商場112G 店', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0021', '高尚煮意 (元朗)', '', '69023118', NULLIF('',''), NULLIF('',''), '元朗同樂街11號,橋德徑大橋街市則', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0022', 'Freeze Style 優質食材專門店(屯門)', '', '6345 6725 吳小姐', NULLIF('',''), NULLIF('',''), '屯門華都商場 43 號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0023', 'Eat Plus 食家優質食材 (屯門)', '', '68783821 /', NULLIF('',''), NULLIF('',''), '屯門翠寧花園5A舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0024', 'Circle Market (元朗)', '', '9858 2756', NULLIF('',''), NULLIF('',''), '元朗錦繡花園C段7街2號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0025', '元朗人氣店 (元朗)', '', '6553 5865', NULLIF('',''), NULLIF('',''), '元朗建業街56號地鋪8B-C', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0026', '酒肉朋友(元朗)', '', '9159 5995', NULLIF('',''), NULLIF('',''), '元朗媽廟路 12 至 42 號永發大廈地下R號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0027', 'F5 優質食材專門店(元朗)', '', '6618 7757', NULLIF('',''), NULLIF('',''), '元朗媽橫路 37 號福昌樓地下 8 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0028', 'F5 FOODS LIMITED(屯門)', '', '6618 7757', NULLIF('',''), NULLIF('',''), '屯門啓豐商場地下36號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0029', 'McCaine Wines (灣仔)', '', '9375 1716 陳小姐', NULLIF('',''), NULLIF('',''), '灣仔駱克道54-62 號博匯大廈1606室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0030', 'Meatastic Limited(柴灣)', '', '5316 1113 譚先生', NULLIF('',''), NULLIF('0',''), '柴灣道111號(近泰民街)東港城商場G樓 137-139號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0031', 'Kpickup (銅鑼灣)', '', '+852 6218 0717', NULLIF('',''), NULLIF('',''), '銅鑼灣希雲街13號地下', 'GHFOODS', 'P0', 15, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0032', '邦爺優質食材(太子)', '', '5668 0881', NULLIF('',''), NULLIF('',''), '太子界限街38號M二地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0033', '909 優質凍肉(黃大仙)', '', '9208 2853 Mandy', NULLIF('',''), NULLIF('',''), '九龍黃大仙下邨龍達樓-貨到樓下取', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0034', '驚安燒肉商店(尖沙咀)', '', '9677 3181', NULLIF('',''), NULLIF('',''), '尖沙咀金馬倫道48號中國保險大廈3樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0035', '邦爺優質食材(葵涌廣場)', '', '9687 9007', NULLIF('',''), NULLIF('',''), '葵涌廣場2樓 2013舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0036', '富興達有限公司(葵涌)', '欣', '2690 1313', NULLIF('2698 2236',''), NULLIF('',''), '葵涌和塘咀道31-39號香港毛紡工業大廈17樓1702室', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0037', '盈利發(葵涌)', '', '9272 1110', NULLIF('',''), NULLIF('',''), '葵涌葵豐街53號7樓701室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0038', '青涌優質食品(青衣)', '', '6497 6972', NULLIF('',''), NULLIF('',''), '青衣涌美村 123 號後座 C (涌美牌坊對面)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0039', '家味工房(荃灣)', '', '26189028', NULLIF('',''), NULLIF('',''), '荃灣海濱花園平台商場26B鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0040', '浩治(葵涌)', '', '5988 3054', NULLIF('',''), NULLIF('',''), '葵涌禾塘咀街31-39號香港毛紡工業大廈24樓2室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'SANDY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0041', 'Chefs Concept(禾輋街市)', '', '', NULLIF('',''), NULLIF('',''), '沙田禾輋街市 M01& 02', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0042', '義祿商店(沙角頭) 送粉嶺', '', '6340 8607 張小姐', NULLIF('',''), NULLIF('',''), '粉嶺聯和墟帝庭軒同綠悠之間(即和滿街) 避車處', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0043', '一屋之煮(大圍) 10:30先開', '', '6335 5369 陳小姐', NULLIF('',''), NULLIF('',''), '大圍積富街57-69號積富樓地下D舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0044', 'AfterTaste回味優質食材專門店(沙田)', '', '6685 6609', NULLIF('',''), NULLIF('',''), '沙田中心3樓31K舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0045', '名鮮店(石門)', '', '9222 1291 / 6768', NULLIF('',''), NULLIF('',''), '沙田安群街 3 號京瑞廣場 1期地下 33 號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0046', '貢友(西貢)', '', '', NULLIF('',''), NULLIF('',''), '西貢德隆前街19A號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0047', '添飯送有限公司(沙田)', '', '', NULLIF('',''), NULLIF('',''), '沙田賽馬會職員宿舍駿喜閣A座G1號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0048', 'A&J Gourmet (馬灣)(車期二、四、六)', '', '9266 6630 周生', NULLIF('',''), NULLIF('',''), '新界馬灣珀林路田寮新村50號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0049', '甘肉滿堂(紅磡)(進興)', 'Rocky', '9500 4763', NULLIF('',''), NULLIF('',''), '紅磡黃埔天地11期聚寶坊商場地下 G7B鋪（船景街近德安街麥當勞旁）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0049-1', '甘肉滿堂(紅磡)', 'Rocky', '9500 4763', NULLIF('',''), NULLIF('',''), '紅磡黃埔天地11期聚寶坊商場地下 G7B鋪（船景街近德安街麥當勞旁）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0050', '埋嚟鮮(荃灣)', '', '9230 3520', NULLIF('',''), NULLIF('',''), '荃灣河背街46-48號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0051', 'EAT 燒肉 (沙田) 現金', '', '6031 8563', NULLIF('',''), NULLIF('',''), '沙田大涌橋路20-30號河畔花園1樓19-20號鋪', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0052', '佳利雜貨 (鰂魚涌)', '', '9487 6666', NULLIF('',''), NULLIF('',''), '鰂魚涌鰂魚涌街太平街市10號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0053', '滷水得燒臘飯店(大窩口)', '', '', NULLIF('',''), NULLIF('',''), '荃灣大窩口道15號大窩口商場地下A08號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'DICKY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0054', '老潮直銷店(九龍城)', '', '9285 8505', NULLIF('',''), NULLIF('',''), '九龍城福佬村道92號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0055', '日食部落(屯門良景)', '', '6121 9350', NULLIF('',''), NULLIF('',''), '屯門 良景商場 L342號鋪 (10:30- 19:30)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0056', '恒昌隆糧油雜貨(天水圍)', '', '5162 2776', NULLIF('',''), NULLIF('',''), '天水圍天澤街市地下1-2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0057', '匯一食品(土瓜灣北帝街)', '', '5460 7607', NULLIF('',''), NULLIF('',''), '土瓜灣北帝街東裕大廈65號D舖', 'GHFOODS', 'P0', 30, 'monthly', (SELECT id FROM sales_representatives WHERE name = 'OSCAR' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0058', '豪氣(元朗)', '', '95186713', NULLIF('',''), NULLIF('',''), '元朗裕景坊玉成大廈地下C舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0059', '肉販佬(元朗)', '', '5137 8352', NULLIF('',''), NULLIF('',''), '元朗大橋街市M9', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0060', 'SUN鮮食品(大窩口)', '', '+852 6623 7317', NULLIF('',''), NULLIF('',''), '荃灣大窩口國瑞路1號河背村牌坊「Sun鮮」', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061', '家園辦事處(新蒲崗)', '', '3987 7800', NULLIF('',''), NULLIF('',''), '九龍新蒲崗八達街9號威達工貿商業中心22樓1室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-01', '家園(筲箕灣分店)', '', '2967 1788', NULLIF('',''), NULLIF('',''), '筲箕灣南安街11號地舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-02', '家園(鴨脷洲店)', '', '2331 2050', NULLIF('',''), NULLIF('',''), '鴨脷洲邨利福樓低座地下2號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-03', '家園(彩虹分店)', '', '2217 7286', NULLIF('',''), NULLIF('',''), '彩虹邨金碧樓30號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-04', '家園(深水埗店)', '', '2728 9399', NULLIF('',''), NULLIF('',''), '深水埗基隆街222號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-05', '家園(土瓜灣店)', '', '2111 0642', NULLIF('',''), NULLIF('',''), '土瓜灣炮仗街26-28號永健樓地下A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-06', '家園(觀塘店)', '', '3541 9926', NULLIF('',''), NULLIF('',''), '觀塘瑞和街146號合和大廈地下5號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-07', '家園(九龍城店)', '', '2723 0006', NULLIF('',''), NULLIF('',''), '九龍城衙前圍道144號錦利閣地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-08', '家園(牛頭角店)', '', '3563 8176', NULLIF('',''), NULLIF('',''), '牛頭角道249號觀塘花園大廈喜鵲樓地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-09', '家園(新蒲崗店)', '', '3565 1130', NULLIF('',''), NULLIF('',''), '九龍新蒲崗仁愛街16號地下（仁愛大廈E舖）', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-10', '家園(天水圍)', '', '2613 8152', NULLIF('',''), NULLIF('',''), '天水圍天慈商場104號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-11', '家園(荃灣店)', '', '3460 2491', NULLIF('',''), NULLIF('',''), '荃灣福來邨永嘉樓8號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-12', '家園(沙田乙明邨店)', '', '3904 2615', NULLIF('',''), NULLIF('',''), '沙田乙明邨明信樓地下47號', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-13', '家園(葵盛東店)', '', '39877800', NULLIF('',''), NULLIF('',''), '葵涌葵盛東商場136號? (2023年3月重開)', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-14', '家園(大埔店)', '', '2336 5480', NULLIF('',''), NULLIF('',''), '大埔懷義街8號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0061-15', '家園(元朗店)', '', '', NULLIF('',''), NULLIF('',''), '元朗壽富街29號，興隆中心地下11號舖', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '范生' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0062', '唐順興燒味', '', '', NULLIF('',''), NULLIF('',''), '荃灣新村街42號', 'GHFOODS', 'P0', 30, 'monthly', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('R0063', '味純有限公司', '', '5611 6918,', NULLIF('',''), NULLIF('',''), '葵涌打磚坪街85-89號 葵匯工業大廈15樓全層', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('S0001', '員工', '5.00 %', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('S0002', '福食', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('S0003', 'OSCAR (鄧生)', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('S0004', '試板', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0001', '現金客(P3)', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0001-01', '郭小姐(何文田)', '', '91943707', NULLIF('',''), NULLIF('',''), '何文田山道 7號 俊惠園 C座 貨到前通知', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0001-02', 'ICY LAU (屯門紫田村)', '', '61471206', NULLIF('',''), NULLIF('',''), '屯門紫田村275號
老人院“如意之家”旁邊，兆康康寶路茵翠豪庭前方100米路口左轉', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0002', '俊哥客戶', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = '俊哥' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0003', '門市', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0004', '小惠(樂聲17樓)', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0005', 'OZ WAGYU', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0006', '百匯 (自取)', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0007', 'Souvenir (上門到取)- Joyce', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KAREN' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0008', '健哥朋友', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0009', '睇板', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0010', '乳豬零售', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0011', '現金客（P0）', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0012', '廣州市金莊食品有限公司', '', '13682222777', NULLIF('',''), NULLIF('',''), '廣州市海珠區石崗路8號之14-8號之16自編1號', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0013', '進興食品有限公司', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0014', '攤位-黃生(澳門）', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'CC003' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0015', '現金客(P2)', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0016', '現金客天水圍天壇街', '', '6413 4552', NULLIF('',''), NULLIF('',''), '天水圍天壇街迴旋處交收', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0017', '梅大嬸(元朗)', '', '93235661', NULLIF('',''), NULLIF('',''), '元朗八鄉河背村356號地下', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0018', 'HGCmore', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', NULL, true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0019', '現金客-葉生自取', '', '51320469', NULLIF('',''), NULLIF('',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KIT' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0020', '寶林現金客', '', '60332330', NULLIF('',''), NULLIF('',''), '將軍澳富康花園6座37樓F室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0021', '元朗現金客(八鄉羅屋村)', '', '9199 4809', NULLIF('',''), NULLIF('',''), '元朗八鄉羅屋村149號二樓', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'KY/CS' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0022', '下輋村現金客(元朗)', '', '60782732', NULLIF('',''), NULLIF('',''), '元朗粉錦公路下輋村193A', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0023', '修小姐(鴨脷洲)', '', '91235609', NULLIF('',''), NULLIF('',''), '鴨脷洲海怡半島13A座 貨到前通知91235609', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0024', '現金客P1', '', '', NULLIF('',''), NULLIF('0',''), '', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'A1' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0025', 'ICY LAU (屯門紫田村)', '', '61471206', NULLIF('',''), NULLIF('',''), '屯門紫田村275號
老人院“如意之家”旁邊，兆康康寶路茵翠豪庭前方100米路口左轉', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0026', '郭小姐(何文田)', '', '91943707', NULLIF('',''), NULLIF('',''), '何文田山道 7號 俊惠園 C座 貨到前通知', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'MAY' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;
INSERT INTO wholesale_clients (client_code, company_name, contact_name, phone, fax, email, address, brand, price_tier, payment_terms_days, payment_terms_type, salesperson_id, is_active)
  VALUES ('Z0027', '廖小姐(樂富)', '', '9612 6618', NULLIF('',''), NULLIF('',''), '樂富橫頭磡村宏業樓608室', 'GHFOODS', 'P0', 0, 'cod', (SELECT id FROM sales_representatives WHERE name = 'AKINA' AND brand = 'GHFOODS' LIMIT 1), true)
  ON CONFLICT DO NOTHING;

-- ═══ Step 3: Set parent_client_id for branches ═══

UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-13' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0002-14' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0003' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0003-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0004' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0004-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0004' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0004-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0004' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0004-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0004' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0004-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0005-14' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0006' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0006-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0006' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0006-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0006' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0006-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0006' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0006-4' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0007' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0007-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0007' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0007-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0008' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0008-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0008' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0008-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0009' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0009-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0009' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0009-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0009' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0009-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0010' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0010-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0010' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0010-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0010' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0010-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0011' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0011-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0011' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0011-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0011' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0011-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0012' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0012-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-00' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-13' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-14' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-15' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-16' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-17' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-18' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-19' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-20' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-21' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-22' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-23' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-24' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-25' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0013-26' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0014' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0014-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0014' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0014-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0014' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0014-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0014' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0014-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0015' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0015-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0015' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0015-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0016' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0016-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0016' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0016-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0016' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0016-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0017' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0017-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0017' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0017-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0017' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0017-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0018' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0018-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0018' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0018-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0018' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0018-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0018' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0018-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0019-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0020' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0020-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0020' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0020-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0020' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0020-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0020' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0020-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0024' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0024-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-2' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-3' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-4' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-5' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-6' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-7' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-8' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0025-9' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0030' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0030-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0038-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0046' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0046-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0046' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0046-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0046' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0046-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0046' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0046-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0050' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0050-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0050' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0050-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0050' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0050-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0050' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0050-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0051-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0051-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0051-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0052' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0052-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0054' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0054-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0054' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0054-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0054' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0054-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0059' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0059-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0059' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0059-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0062' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0062-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0062' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0062-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0062' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0062-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0066' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0066-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0076' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0076-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0076' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0076-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0076' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0076-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0076' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0076-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0083' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0083-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0083' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0083-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0083' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0083-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0083' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0083-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0083' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0083-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0090' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0090-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0093' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0093-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0097' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0097-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0097' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0097-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'A0104' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'A0104-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0019' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0019-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0034' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0034-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0061-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'B0062' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'B0062-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0051-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0051-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0051' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0051-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0053' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0053-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0057' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0057-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0070' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0070-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'C0070' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'C0070-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0002-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0029' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0029-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0029' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0029-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0037' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0037-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0040' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0040-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0058' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0058-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0069' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0069-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0069' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0069-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0080' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0080-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'D0093' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'D0093-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0002' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0002-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0005' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0005-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0013' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0013-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0046' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0046-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0054' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0054-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0064' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0064-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0071' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0071-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0091' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0091-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0100' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0100-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0100' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0100-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'E0131' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'E0131-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'G0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'G0025-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'G0025' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'G0025-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'G0039' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'G0039-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'G0067' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'G0067-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0022' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0022-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0030' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0030-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-13' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-16' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-17' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-18' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-19' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-20' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-21' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-22' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-23' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-27' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-28' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-29' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-30' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-31' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-32' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-33' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-37' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-38' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-39' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-61' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-62' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-63' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-68' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-69' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-70' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-71' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-72' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-73' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-77' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-78' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-79' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-81' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-82' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-83' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-86' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-87' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-88' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-89' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-91' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-92' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-93' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-96' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-98' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-99' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-K1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-K2' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-K3' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-K6' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0038' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0038-K7' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0057' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0057-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'K0069' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'K0069-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0049' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0049-1' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-02' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-03' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-04' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-05' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-06' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-07' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-08' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-09' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-10' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-11' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-12' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-13' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-14' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'R0061' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'R0061-15' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'Z0001' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'Z0001-01' AND brand = 'GHFOODS';
UPDATE wholesale_clients SET parent_client_id = (SELECT id FROM wholesale_clients WHERE client_code = 'Z0001' AND brand = 'GHFOODS' LIMIT 1) WHERE client_code = 'Z0001-02' AND brand = 'GHFOODS';