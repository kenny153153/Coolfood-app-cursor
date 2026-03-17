-- ============================================================
-- Supabase migration: Add email + legacy_code to suppliers table
-- and import 供應商明細 data from legacy system
-- Total: 335 suppliers
-- ============================================================

-- 1. Add new columns to suppliers table
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS legacy_code text;

-- 2. Import supplier data from legacy system (供應商明細.xlsx)

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1004', 'NS FOOD GLOBAL LTD.', '沙田石門安睦街永得利中心14樓A室', '3549 8020   5175 6571', NULL, 'nsglobal@nsfoodglobal.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1005', 'SEOGWIPOSI LIVESTOCK COOPERATIVE', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1006', 'SKY 38 LIMITED', 'Shop  No. 26/27, G/F., Yuccie Square,No. 38 On Ning Road, Yuen Long, N.T.', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1007', 'TAEHWARAM GREEN FOOD', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1008', 'TOQUE MODA LIMITED', '屯門青楊街1號世紀城市工業大廈15/F E室', '5115 1593', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1009', 'UNITED WORLD ENTERPRISES PTY LTD', 'AUSTRALIA', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1010', '一方食品亞洲有限公司', '九龍荔枝角瓊林街93號龍翔工業大廈2樓B室', '3422 8718   會計部 陳小姐', '3422 8518', 'connie@foodsource.com.hk', '9272 6732', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1011', '一品點心有限公司', 'FLAT A, 32/F, PHASE 1, VIGOR IND. BLDG.,NO. 49-53 TA CHUEN PING ST., KWAI CHUNG', '2803 0885', '2803 0884', 'sales@yummydimsum.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1012', '一峰行有限公司', '葵涌葵昌路50號葵昌中心9樓05室', '2855 8880', '2855 8810', NULL, '9025 3100', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1013', '力生環球有限公司', 'Unit 7, 11/F, Thriving Industrial Centre26-38 Sha Tsui Rd., Tsuen Wan', '2690 9800', '3019 7645', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1014', '力翹海產有限公司', '火炭坳背灣街2-12號威力工業中心1樓H室', '2606 2048', '2606 2050', NULL, '羅生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1015', '三友食品貿易有限公司', '葵涌藍田街18號創新科技中心八樓807室', '3611 9700', '3594 6132', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1016', '三明有限公司', '九龍旺角上海街433號興華中心2101室', '2388 1780', '2388 1760', NULL, '阿鋒、豪哥', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1017', '上民凍肉食品有限公司', '新界葵涌國瑞路88號新豐中心207室', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1018', '大亞食品有限公司', '香港新界葵涌健康街2-6號飛亞工業中心16樓7室', '3113 8298', '3113 8293', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1019', '大昌貿易行有限公司 (CU095)', '九龍灣啟祥道20號大昌行集團大廈8樓', '2768 3129 / 2768 321   9028 3417張生行街', NULL, NULL, '張生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1020', '大津物產(香港)有限公司', '荃灣白田霸街36-44號信義工業大廈5字樓B室', '2149 5266 / 會計部 謝小姐   6021 0382 運輸 強哥', '2149 5277', NULL, '蔡小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1021', '中村食品(香港)有限公司', '新界荃灣柴灣角街38-40號銓通工業大廈21樓C', '2409 1373', '2409 1351', 'info@nakamurafood.com', '6107 4060黃小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1022', '天成食品貿易有限公司', '新界沙田大炭黃竹洋街15-21號華聯工業中心B座10樓', '2786 3002', '2786 9449', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1023', '天壹食品有限公司', '青衣長達路1-33號青衣工業中心C座1303室', '2882 8911', '2882 8950', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1024', '文宋貿易公司', '九龍油塘高輝道17號高輝油塘工業城B座12樓17室', '2618 2233   2618 2200', '2778 1828', NULL, '姚小姐2205 1668', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1025', '文苑乳豬', '九龍深水步大埔道105號新輝大廈地下低座', '2728 5727', '2728 7601', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1026', '日川亞太(香港)有限公司', 'Unit 1, 19/F, EW International Tower,120-124 Texaco Road, Tsuen Wan, H.K.', '2512 2900 / 2512 233', '2571 7872', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1027', '日昇食品公司', '英涌葵喜街26-32號金發工業大廈1期26樓A室', '2814 9591', '2873 2658', 'ysfc@biznetvigator.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1028', '日信國際食品有限公司', '香港中環德輔道中222號偉利大廈9樓', '2850 7568', '2850 7508', 'account@frozenfood.com.hk', '歐陽小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1029', '日健日本食品有限公司', '筲箕灣東大街11B金發大廈地下', '2568 8118', '2567 4084', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1030', '北歐國際食品有限公司', '新界火炭禾穗街5-13號CDC中心9樓', '2730 1266 , 2730 232   2601 7863 張小姐', '2607 5375', NULL, '丘生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1031', '台揚食品有限公司', '灣仔軒尼詩道253-261號依時商業大廈11樓110室', '2877 7908   9828 0010', '2877 7910', 'product@oceantaifoods.com.hk', '黃生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1032', '美利飲食服務有限公司', '新界屯門天后路18號南豐工業城第五座7樓', '2454 8993', '2455 5299', 'info@murray.com.hk', '9864 4371黃小姐IDY', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1033', '四洲貿易有限公司 (CM0015F)', '香港九龍灣宏泰道23號Manhattan Place 21樓', '2219 5069   9026 2687', '2163 9899   6290 1894謝小姐行街', NULL, '區生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1034', '四海環球食品有限公司', '香港仔黃竹坑業勤街33號金來工業大廈2期3樓A室', '2108 7500, 2555 7473', '2873 4814', NULL, '吳小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1035', '永祥公司', '新界粉嶺東閣圍136號地下', '6823 0432', '3905 6938', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1036', '永富食品發展有限公司', '香港柴灣永泰道50號港利中心 17樓3室', '2499 8580', '2499 7001', 'pracylo1020@gmail.com', '9680 5100 盧小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1037', '永進食品有限公司', '香港九龍渡船街28號寶時商業中心4樓1-5室', '2380 9211', '2381 1918', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1038', '生益食品有限公司', 'Rm. 408-409, Wing Tuck Commerical Centre177-183, Wing Lok Street, Sheung Wan, HK', '2815 0323', '2850 6301', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1039', '先進食品國際有限公司', '香港沙田火炭坳背灣街38-40號華衛工貿中心8樓806室', '3525 1835', '3525 1834', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1040', '全記食品有限公司', '荃灣青山道459-469號華力工業中心三字樓G室', '2414 2683', '2414 3736', NULL, '94391312馬小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1041', '合群企業投資有限公司', '九龍長沙灣道680號麗新商業中心9樓901室', '2744 0201', '2780 9222', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1042', '合群食品有限公司', '香港九龍永康街42號義德工廠大廈地下A舖', '2742 8401', '2742 8788', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1043', '合群國際有限公司', '九龍永康街42號義德工廠大廈2樓A室', '2785 2291', '2785 8090', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1044', '同富食品有限公司', '荃灣德士古道72-76號興業中心5樓', '3468 8233', '3468 5922', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1045', '多寶食品公司', '新界屯門坭圍村花炮會101號信箱', '2477 8861', '2473 5114', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1046', '安珂有限公司', '新界沙田火炭，禾香街9-15號力堅工業大廈9樓F室', '3612 9056 / 6429 960', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1047', '安得利香港餐飲有限公司', '47-51 KWAI FUNG CRESCENT KWAI CHUNG NT HONG KONG', '2494 2180   9437 4211', '2489 8861', NULL, '李生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1049', '安勤行有限公司', '香港干諾道中122-124號，海港商業大廈8字樓', '2543 8420', '2544 9359', NULL, '劉生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1050', '安機源優質食材有限公司', NULL, '2494 2005', '2702 1290', NULL, '6747 4522', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1051', '旭盛行(香港)有限公司', 'Room 1709, 17/F, Kowloon Plaza,485 Castle Peak Road, Cheung Sha Wan,HK', '2742 1896', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1052', '有成拓展有限公司', '新界元朗唐人新村新灰街2號盛力工業中心A座地下4-5號舖', '2479 1398', '2470 9180', 'success_hong@yahoo.com.hk', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1053', '百利食品國際有限公司', '九龍觀塘成業街16號怡生工業中心10樓B座', '3568 9170', '3568 1518', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1054', '百嘉米格(香港)食品有限公司', '新界葵涌青山公路403-413號匯城集團大廈23樓 A-D室', '3922 7323', '2545 1138', NULL, '劉小姐 9729 5313', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1055', '利豐肉食海產有限公司', '新界葵涌健康街18號恆亞中心2樓204-209室', '3798 3968', '3798 3944/3798 3955', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1056', '利寶凍肉有限公司', '九龍旺角南頭街11號地下', '2148 0201, 2380 9720', '2148 0204', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1057', '宏高海產食品有限公司', '火炭坳背灣街49-51號協力工業大廈9樓908室', '2690 4866', '2690 4877', 'fion@vss.com.hk', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1058', '宏偉貿易公司', 'Room 39, 7/F, Block G,East Sun Industrial Centre,16 Shing Yip Street, Kwun Tong,KL', '3900 0564', '3900 0565', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1059', '形澧食品有限公司', '葵涌梨木道79號亞洲貿易中心33樓', '2385 8005 / 直線 : 240   9086 7977 樂', '2385 8055', NULL, '樂仔', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1060', '形翱有限公司', 'Flat D, 18/F, First Asia Tower,8 Fui Yiu Kok Street, Tsuen Wan HK', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1061', '快迅食品有限公司', '香港新界橫龍街78-84號正好大廈15字樓B室', '3426 4879', '2857 7910', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1062', '李樹國際有限公司', 'RM.6, 1/F, FAT LEE MANSION,33-36 CARNARVON ROAD, TSIMSHATSUI KWOLOON, HK', '2366 1071', '2721 8447', 'leeshuhk@netvigator.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1063', '玖紫八方有限公司', '荔枝角永康街23-27號安泰工業大廈B座330室', '3480 7729   9863 7193 鄧生', '3621 0949', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1064', '良記', '九龍油麻地炮台街16號地下', '2384 0360', '2781 2551', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1065', '京都日本食品(香港)有限公司', '新界葵涌打磚坪街49-53號華基工業大廈1期4樓A室', '3844 0000', '3844 0099', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1066', '其他公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1067', '味珍味(香港)有限公司', '香港新界青衣長達路33號青衣工業中心第一期8樓B1室', '2495 1261', '2433 0186', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1068', '和風食品公司', '新界屯門建發里2號華運工業大廈15字數 I 室', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1069', '昌記食品(香港)有限公司', '新界葵涌華星街8號華達工業中心B座18樓16室', '2776 1121, 2319 0029', '2788 1654', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1070', '明邦(香港)有限公司', '九龍油塘高輝道7號高輝工業大廈C座9樓5室', '3106 3410   8211 6177', '2125 7658', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1071', '明輝海產凍肉有限公司', '香港九龍大角咀橡樹街25-27號地下', '2396 9582,2396 9583,', '2398 7699', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1072', '明興凍肉食品有限公司', '九龍葵涌葵發路2-12號大德工業大廈10樓A室', '2898 4886', '2898 4018', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1073', '東方產品供應有限公司', '九龍油塘四山街 4 號華輝工業大廈 7 字樓A室', '2389 5222', '2357 1286', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1074', '東浩冷凍食品公司', 'Rm 1703, Blk B, Wai Lik Ind. Bldg.,14-20 Cheung Tat Rd., Tsing Yi, N.T.', '2834 9273', '2834 9247', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1075', '松記海鮮凍肉有限公司', NULL, '2716 4928', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1076', '秉全國際食品有限公司', 'Unit 703, 7/F., Shun Kwong Commercial Building, 8 Des Voeux Road West, HK.', '2868 3335', '2104 9883', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1077', '虎雲食品有限公司', '屯門震寰路3號德榮工業大廈18樓C室', '3560 6461', '3596 3177', NULL, '張小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1078', '金山洋行', '九龍長沙灣瓊林街111號擎天廣場19樓C&D室', '2602 7773 , 3528 550   9461 4152', '2609 5570', NULL, 'Otto Chan', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1079', '金沅貿易有限公司', '九龍灣宏光道興力工業中心401室', '2528 4388', '2527 5388', 'goldocean401@outlook.com', 'Fanny 94002481陳小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1080', '金洋香港國際有限公司', '香港元朗宏業東街18號宏業工貿中心7樓A室', '5702 2327', '36188912', 'yammiey@hkchedr,com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1081', '金瀚食品貿易公司', '香港九龍東頭村旺東樓街市SS35,SS48-49號', '2382 2644,   92373525司機', NULL, NULL, '9097 0432', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1082', '青藏耗牛', '九龍觀塘興業街16-18號，美興工業大廈A座2', '2389 6108 / 2389 681', '2389 6659', NULL, 'Maggie Wu', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1083', '俊興冷凍食品有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1084', '俊興貿易(國際)有限公司', '葵涌華星街2-6號安達工業大廈5A', '2117 0925', '2153 1882', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1085', '保發食品有限公司', '元朗工業村福喜街67-73號地下大昌行食品加', '2898 9962/56612623CA   3500 4733 A/C', '2595 9412', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1086', '信二貿易有限公司', '新界元朗合財街2號富財樓二樓1號室', '2411 0800', '2411 0068', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1087', '信希食品有限公司', '香港西環干諾道西188號香港商業中心23樓2316室', '2723 9663', '2713 3929', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1088', '信德冷凍食品有限公司', '香港九龍灣常悅道9號企業廣場1期11樓05室', '2815 2038', '2964 0161', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1089', '城仔記鮮肉店', '大埔壚新街市 M22號', '2651 2080 / 9276 076', '2442 3577', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1090', '威亞食品有限公司', 'Room 4, 17/F, Chueng Tat Centre,18 Cheung Lee Street, Chai Wan, HK', '2898 9823', '2898 9802', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1091', '威信國際冷凍食品(香港)有限公司', 'Room 2104 B-F, Nan Fung Centre, 264-298Castle Peak Road , Tsuen Wan , NT', '3678 0888 , 直線 Peter   9217 5417 peter', '2413 6255', NULL, 'Peter', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1092', '思恆貿易公司', '香港西環干諾道西188號香港商業中心9樓13B室', '2153 2772', '2153 2773', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1093', '恆信食品貿易有限公司', 'Flat F, Blk 2, 21/F, Kingswin Ind. Bldg.32-40 Lei Muk Rd., Kwai Chung, N.T.', '2426 2324, 2426 2013', '2422 9080', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1094', '恆盛食品貿易有限公司', '新界荃灣青山道公路459-469號華力工業中心8樓L-M室', '2419 8360', '2419 8308', 'choshan.c@hangshing.com', '山', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1095', '星匯食品有限公司', '九龍油塘高輝道17號油塘工業城B座12樓17室', '2866 6677', '2866 6677', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1096', '昭楠貿易有限公司', '新界荃灣沙咀道66A豪力中心8樓08室', '2698 0529', '2698 0537', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1097', '活海食品有限公司', '香港黃竹坑業勤街33-35號金來工業大廈第二期地下B2室', '2555 6998', '2552 6282', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1098', '盈星國際貿易有限公司 ( CH16 )', '香港上環永樂街177-183號永德商業中心2204室', '2545 7818 / 2545 782', '2542 2378', NULL, '李小姐5577 8279', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1099', '美亞食品貿易有限公司', '新界健康街9-11號裕林工業大廈第3期1樓全層', '2610 2118/2725 1115   6200 7899何生', '2423 7509', 'queenie.leung@amerasiafood.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1100', '美暉集團有限公司', '香港柴灣新業街6號安力工業中心十四樓18室', '3160 3882', '3690 1433', 'brightmate88@yahoo.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1101', '香港元盛興土產食品有限公司', '香港堅尼地城域多利道64號廣基工業大廈1樓A&B座', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1102', '香港食品(集團)有限公司 ( C041 )', '九龍長沙灣長裕街10號億京廣場2期22樓A-C室', '2711 3000', '2711 3999', NULL, '羅先生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1103', 'Bonlicious LTD', 'Flat D, 10/F, Summit Industrial Building, 9 Sun Yip ST. 
Chai Wan  HongKong', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1104', '哲朗食品有限公司', '長沙灣荔枝角道808號好運工業中心10樓09室', '2533 5933', '2833 2863', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1105', '家宴環球', '九龍觀塘開源道55號開聯工業中心A座1330', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1106', '振超有限公司', '葵涌和宜合道63號麗晶中心A座7樓707室', '2891 1137/9885 9879', '2591 0327', NULL, '吳生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1107', '朗進國際有限公司', '九龍新蒲崗三祝街12-14號榮森工業第二大廈三樓', '3643 0000', '2322 6035', NULL, '張生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1108', '泰興食品貿易行有限公司', '九龍科學館道14號新文華中心B座602-603室', '2723 2733', '2301 4232', 'info@taihingfoods.com.hk', '陳小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1109', '浩浚國際貿易有限公司', '荃灣柴灣角街30-32號京華工廠貨倉大廈12樓A室', '3590 8005', '3590 2460', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1110', '浩新貿易有限公司', 'UNIT A-D, 23/F., NATHAN COMM. BLDG.,430-436 NATH ROAD, KLN., HONG KONG', '2391 9398', '2787 1173', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1111', '浩運食品有限公司', '荃灣柴灣角街66-82號金熊工業中心19字樓H室', '2898 8299', '2898 9682', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1112', '海盛食品有限公司', '香港柴灣嘉業街18號明報工業中心B座1910-1911室', '2563 8878   9348 6058吳生', '3105 1795', NULL, '6538 7352 SUKI', '15days', 15, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1113', '海通貿易(香港)有限公司', '新界葵涌工業街23-31號美聯工業大廈14B', '3996 7092', '8148 2102', NULL, 'Alice Koo', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1114', '海富寶國際有限公司', '香港新界葵涌國瑞路116-122號城市工業中心1樓H&J室', '2529 8649', '2529 0339 / 2866 990', 'wholesale@seabo.co', 'Sandy Wong', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1115', '海發冷凍食品有限公司', '香港葵涌葵豐街33-39號華豐工業中心一座3樓D室', '2397 0008', '2397 1898', NULL, '陳生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1116', '海新海產有限公司', '沙田火炭坳背灣街57-59號利達工業中心7樓22室', '3460 4400 / 6152 709', '3460 4411', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1117', '海潤餐飲服務有限公司', '香港荃灣青山公路611-619號東南工業大廈16樓', '2583 3688', '2583 3666', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1118', '海寶物產有限公司 ( A0856 )', '香港柴灣祥利街9號祥利工業大廈8樓A&B座', '3696 5788, 2558 4302', '3696 5778, 2889 2191', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1119', '珠明肉食有限公司', '香港柴灣永泰道50號港利中心3-5號地下', '2558 9311', '2889 2279', 'kit.leung@chimingmeat.com.hk', '梁生98474984', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1120', '益騰創建有限公司', '土瓜灣農圃道18號地下3號舖', '3708 9350', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1121', '偉森有限公司', '香港上環蘇杭街99號嘉發商業中心13字樓B', '2545 5830', '2543 9380', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1122', '偉發海產食品有限公司', 'Room 304, 3/F,Eastern Centre, 1065 King''s Road,Quarry Bay, Hong Kong', '2565 1088', '2565 7139', 'sales@waifatseafood.com.hk', '9642 0272', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1123', '偉興行控股有限公司', '新界屯門新墟村第二台46號地下', '2442 4903', '2442 4920', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1124', '偉豐實業集團有限公司', '九龍尖沙咀梳士巴利道3號星光行17樓1710室', '2735 5863', '2735 9198', 'wfoods@outlook.com', '許小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1125', '國威廈門豬肉', '九龍灣宏泰道3-5號合力工業中心B座5樓16室', '2570 9968', '2234 5787', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1126', '域鴻有限公司', '葵涌華星街2-6號安達工業大廈5A', '2568 6811', '2153 1882', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1127', '基利行有限公司', '尖沙咀漆咸圍2-4號金時商業大廈3樓5室', '3119 7713', '3119 7716', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1128', '康利達食品海產有限公司', '新界荃灣海盛路3號TML廣場30字樓A2-A3室', '2332 9893   6425 0841', '2332 6981', NULL, '呂生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1129', '康宏貿易公司', '香港荃灣沙咀道26-38號匯力工業中心6樓21室', '3499 1989', '3499 1683', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1130', '強記中港食品有限公司', '九龍大角咀博文街10號A地下', '2395 1717 / 8200 171', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1132', '御海國際食品有限公司', '新界葵涌國瑞路116-122號城市工業中心2樓工場F', '2494 4970 / 6829 069', '2439 4070', NULL, '陳小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1133', '添福餐飲食品發展有限公司', '九龍觀塘開源道60號駱駝漆大廈3座10A室', '2994 6838', '2994 6822', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1134', '祥信凍肉食品公司', '九龍福榮街218號美居中心65號舖', '2741 8432', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1135', '第一亞洲食品飲料有限公司', '沙田石門安麗街11號企業中心25樓11室', '2367 3238', '2367 3696', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1136', '蛇王協祥佳有限公司', '九龍深水步鴨寮街170號地舖', '2386 9064', '2728 5600', NULL, '94946104周小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1137', '凱天資本有限公司', '尖沙咀東部加連威道100號港晶中心10樓1001室', '3467 6888', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1138', '富丞有限公司', '紅磡馬頭圍道21號義達工業大廈4樓B座', '2281 4871   9585 9785方生', '2665 4755', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1139', '富成環球海產有限公司', '新界葵涌大連排道36-40號貴盛工業大廈1期6樓a室', '2386 5143   9585 9785 方生', '2387 4188', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1140', '富昌肉食公司', '大埔富善街54號地舖', '2643 4986', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1141', '富海食品(香港)有限公司', '新界葵涌藍田街18號創新科技中心1702室', '3956 1298 / 31041156   9887 8877', '3954 5848', NULL, '何先生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1142', '富興食品批發市場', '新界元朗泰利街18號榮華中心9樓E室', '2474 0468', '2474 0478', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1143', '湋源食品公司', '九龍大角咀中匯街號地下', '2391 6183 , 2393 339', '9258 8241 林生', NULL, '林生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1144', '湖記食品有限公司', '九龍觀塘敬業街41號四洲集團中心', '2163 9934/2163 9700(   2163 9999', '2163 9886,2163 9888', NULL, '傅生94364045', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1145', '琪昌燒臘食品有限公司', '荃灣白田壩街53-61號華偉工業大廈1707室', '2416 3332, 9020 5707', '2416 3698', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1146', '登豐國際有限公司', '新界荃灣青山道264-298號，南豐中心1108室', '2402 8813', '2402 1631', NULL, '麥小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1147', '華明貿易有限公司', '香港柴灣永泰道50號港利中心116樓1603室', '2499 3344', '2499 7001', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1148', '華潤五豐國際分銷有限公司', '香港西九龍欽州街西89號潤發大廈3樓', '2593 7682 / 2593 768', '2881 0318 / 2881 143', NULL, '岑小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1149', '華豐海產貿易公司', '香港皇后大道中368號偉利大廈六樓九號室', '2541 2228', '2544 4994', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1150', '進浩食品有限公司', '葵涌國瑞路88號新豐中心地下2號舖', '2387 7282', '2418 2122', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1151', '隆順環球海產貿易有限公司', '香港新界葵涌葵豐街47-51號5樓', '2573 7433', '2838 4071', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1152', '集美貿易公司', '新界葵涌大連排道42-46號貴盛工業大廈二期11字樓H07室', '2156 0501', '3621 0528', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1153', '順隆食品發展有限公司', '香港新界元朗宏業東街18號宏業工貿中心7A-B', '2868 6061', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1154', '匯洋海產有限公司', '九龍青山道485號九龍廣場11樓02室', '3564 8669', '3563 9790', NULL, '周小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1155', '匯盈食品有限公司', '新界沙田火炭坳背灣街2-12號威力工業中心11樓A1室', '2690 4089   9356 9835', '2690 0502', 'yiukeungko@gmail.com', '高生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1156', '匯慶行有限公司', '油麻地新填街27號閣樓', '9837 7413 鄧生', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1157', '慎昌有限公司', '香港九龍灣啟祥道20號大昌行集團大廈7樓', '2262 1798   62933565', '2692 1696', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1158', '新世界食品有限公司', '1/F, Philip House, No.5 Kimberley St.,Tsim Sha Tsui, KL', '2311 3723', '2301 2539', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1159', '新永興食品有限公司', '荃灣沙咀道57號荃運工業中心2期17樓F室', '2402 8933', '2402 8902', 'swhfood@yahoo.com.hk', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1160', '新田食品有限公司', '九龍大角咀中匯街58號地下', '2390 6859', '2398 0761', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1161', '新江公司', '九龍深水步青山道60號興業大廈E座地下後舖', '2748 0316', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1162', '新國華肉食公司', '九龍九龍城城南道53至55號地舖', '2369 6751', '2369 6832', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1163', '新華日本食品有限公司', '新界屯門湖山路215-239號新華集團中心', '2404 3988   9733 1507', '2441 3525', NULL, 'Ivy Leung', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1164', '新順福食品有限公司', '新界元朗宏業南街12-18號新順福中心5樓
倉:元朗錦田逢吉鄉 DD107 LOT 342 SB', '2461 0190   9452 2204 郭生SALES', '2454 1075', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1165', '新興城有限公司', '葵涌和塘咀道31-39號香港毛紡工業大廈17樓1703室', '2788 1283', '2776 7802', NULL, 'Leo', '15days', 15, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1166', '新環球(香港)有限公司', '新界沙田火炭禾香街12-36號百適一倉地下', '2690 2830', '2690 1931', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1167', '源江國際有限公司', '九龍彌敦道552號龍馬大廈10樓', '2332 6613', '2332 9885', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1168', '源隆行環球凍肉有限公司', '九龍九龍城城南道75-77號', '2383 9977', '2718 4847', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1169', '溢利食品(香港)有限公司', '香港九龍長沙灣大南西街609號永義廣場10樓C室', '2816 6788', '2817 0218', 'proceedsfood.co@gmail.com', '鄧生 / 廖生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1170', '溢峻貿易有限公司', '九龍大埔道70號太子中心地下1B號舖', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1171', '萬永國際有限公司', '香港新界葵涌葵榮路29-37號成美工業大廈3/FA2室', '3706 8449', '3709 6211', 'rebecca@foreverwinn.com', '伍小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1172', '萬安(遠東)有限公司', '葵涌嘉定路1-11號', '3588 8180 / 35888109   2889 2213', '2889 2009', 'boboso@millionfareast.com', 'BOBO 蘇小姐6077 9665', '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1173', '萬利食品公司', '新界元朗宏業東街22號安勁工業大廈2樓B座', '2482 1100', '2482 5812', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1174', '萬里海產凍肉有限公司', '新界葵涌健康街2-6號飛亞工業中心14樓5室', '2154 3081', '2154 3086', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1175', '萬泰貿易(國際)有限公司', 'Flat A-B, 16/F, Nathan Tower,518-520 Nathan Road, Yau Ma Tei, Kowloon', '2771 6790', '2780 3197', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1176', '萬祥興業有限公司', 'Workshop B6, 29/F, TML Tower,NO.3 Hoi Shing Road, Tsuen Wan, N.T.', '3702 6068', '3997 3159', 'jasonng@luckymasterhk.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1177', '萬駿貿易公司', '葵涌大連排道貴盛工業大廈二期1樓H37', '2428 3186', '3747 2645', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1178', '裕東食品發展有限公司', 'Unit 1910, 19/F, Block C,Wah Lok Industrial Centre,31-35 Shan Mei Streetm Fo Tan, Shatin,NT', '2382 3969 / 2624 938', '2624 9209', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1179', '運裕通食品有限公司', '香港皇后大道中237號太興中心第一期23樓B室', '2544 7038', '2543 5545', 'wyt@on_mets.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1180', '嘉百利食品有限公司', '沙田橫壆街1-15號好運中心松林閣20/F, A室', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1181', '滿冠集團有限公司', 'UNIT 1, 15/F., BLOCK 5,Nan Fung Industrial City,18 Tin Hau Road Tuen Mun, NT', '3620 8534', '3622 9839', NULL, '莫小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1182', '滿記凍肉有限公司', '新界火炭坳背灣街57-59號利達工業中心4樓414-416室', '2609 4882, 2601 6096', '2690 0106', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1183', '漢國貿易(國際)有限公司', '觀塘駿業街49號佳貿中心603室', '2458 0332', '2457 3615', 'ken@concordtrading.com.hk', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1184', '漢隆貿易有限公司', 'Room 704, Tung Wai Commercial Building,NOS, 109-111 Gloucester Road,Wan Chai, Hong Kong', '2861 1618', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1185', '領先環球食品有限公司', '香港新界葵涌貨櫃碼頭路88號永得利廣場1座903室', '3108 9988   6223 3343', '38903890', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1186', '廣勝(香港)有限公司', '新界荃灣橫龍街59-71號荃灣工業大廈10樓A座1013A室', '2524 6888/2524 6851', '2524 6630', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1187', '廣順有限公司', 'Unit 11, 5/F, Sun Fung Centre88 Kwok Shui Road. Kwai Chung. N.T.', '2673 3888', '2713 2888', NULL, '劉生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1188', '廣興公司', '九龍旺角深圳街7號閣樓', '2380 1079   2808 2809', '2808 2328   23997272', 'kwonghingcokwing2022@gmail.com', '郭生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1189', '廣聯貿易有限公司', '九龍亞皆老街16-16B旺角商業大廈7樓D室', '2191 8298   6208 0756', '2264 6655', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1190', '德麗海產貿易有限公司', '九龍新蒲崗大有街29號宏基中心1206室', '9220 0380', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1191', '慶豐貿易有限公司', '荃灣白田壩街23-39號長豐工業大廈高座10樓05室', '3460 3295', '2819 6565', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1192', '遨信發展有限公司', '葵涌大連排道36-40號貴盛工業大廈第一期11樓B座', '3974 5261   3421 0103', '3421 0810', 'wsoceanthree@gmail.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1193', '新澤興凍肉批發', '新界大埔大光里大運大廈14號C地舖', '2657 6608, 2657 6828', '2657 6708', 'taipochakhing@yahoo.com.hk', '林小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1194', '興利(祥記)食品有限公司', '葵涌大連排道172-180號金龍工業中心第3座3樓D室', '2392 1012, 2392 5435', '2392 5206', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1195', '營匯食品有限公司', '香港鴨利洲利興街10號港灣工貿408-9室', '2555 9218', '2555 9223', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1196', '聯合林記食品有限公司', '九龍長沙灣醫局街555號怡高工業中心9樓902', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1197', '聯泰行海產(父子)有限公司', 'Rm 1505, Arion Comm. Centre,2-12 Queen''s Rd., West, Hong Kong', '2544 6861', '2544 1295', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1198', '聯發凍肉公司', 'Shop M4, G/F, Tai Kok Tsui Municipal Se Tai Kok Tsui Municipal Services Buliding,63 Fuk Tsun Street, Tai Kok Tsui, KLN', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1199', '薈星香港餐飲服務有限公司', '葵芳葵德街16-26號金德工業大廈9樓903室', '3188 4270', '3106 0906', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1200', '駿利貿易公司', '九龍大角咀洋松街73-79號君豪工商中心11字樓B2室', '2915 1266', '2915 1262', NULL, '馬國雄', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1201', '駿豐世貿企業有限公司', '新界荃灣海盛路11號One Midtown 43樓01-08', '2947 0682   9076 6915', '2947 0680', NULL, '球哥', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1202', '駿豐國際食品有限公司', NULL, '3741 0703', '3741 2756', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1203', '鮮運食品有限公司', 'RM1406&8, Hong Kong Plaza,186-191,Connaught Road West, Hong Kong', '2546 1757', '2559 0069', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1204', '鴻天食品有限公司', '屯門震寰路3號德榮工業大廈7樓D7023室', '3168 8700', '3168 8703', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1205', '鴻泰企業公司', '葵涌國瑞路116-122號城市工業中心12樓F室', '2410 1651', '2485 1472 , 2426 891', NULL, '符先生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1206', '瀧和食品貿易有限公司', '新界荃灣海盛路11號ONE MIDTWON 18樓19室', '3619 2084', '3114 1992', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1207', '寶記食品有限公司', 'Unit 10B, 13/F, BLK 3 Nan Fung Ind. City18 Tin Hau Rd, Tuen Mun, N.T.', '6080 0857', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1208', '耀興行食品供應有限公司', '青衣長達路1-33號青衣工業中心第二期C座15樓C室', '2433 3208,2433 3128', '2497 1107', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1209', '加多利食品公司', '新界元朗八鄉橫台山DD111,LOT2908', '3956 3347', '3956 3125', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1210', '瑪希有限公司', '香港九龍長沙灣道760-762號白港紗廠工業大廈五期二樓c2室', '3891 2616', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1211', '香港鴻興公司', '新界葵芳葵豐街2-16號鍾意恆勝中心8樓804G室', '2543 0219', '2544 7987', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1212', '好景食品有限公司', '新界葵涌嘉定路8號,裕林第二工業大廈9樓B室', '2155 0805', '2155 0806', 'info.goodviewf@gmail.com', '伍生或陳小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1213', '亞洲生活有限公司', '新界葵青青衣青衣航運路38號招商局物流中心7樓', '3643 1729   3643 1706', '3643 1532', NULL, '3585 8860會計部', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1214', '裕林貨倉凍房有限公司', '新界葵涌葵樂街2-28號C座', '2614 5801', '2614 4628', NULL, NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1215', '藝康化工有限公司', '九龍觀塘榮業街2號振萬廣場15樓', '2341 4202   2372 7776 會計部', '2797 9030', 'ar.hk@ecolab.com', NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1216', '新柏霖有限公司', '香港北角渣華道8號威邦商業中心17樓1707室', '3703 4633   3703 4626', '3011 1102', 'docs.sunpaklam@gmail.com', NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1217', 'DEOYUK', '663, Haso-ro, Aewol-eup, Jeju-si, Republic of Korea', '+82-64-759-8754', '+85-64-759-8755', 'jejuthe6@naver.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1218', 'OZ WAGYU', NULL, '6412 8069   9812 6728', NULL, NULL, 'VINCENT SHEK', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1219', 'LLC. CHERKIZOVO TH', '143060,Russian Eederation Odinzovo City', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1220', '富德萊國際食品有限公司', '香港九龍紅磡鶴園東街1號富恆工業大廈4樓413A室', '2116 0851', '3998 4274', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1221', '供港食品採購商聯合會有限公司', '九龍青山道704號合興工業大廈8樓E5室', '3998 4461', NULL, 'For HKBS@gmail.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1222', 'SEOGWIPOSI LIVESTOCK COOPERATIVE', '1914-11,JUNGSANGANSEO-RO,ANDEOK-MYEON,
SEOGWIPO-SI,JEJU SPECIAL
 SELF-GOVERNING PROVINCE ,KOREA', '82 64 794 5651', '82 64 794 5650', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1223', '豐菓集團有限公司', NULL, NULL, NULL, NULL, NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1224', '金聯咖啡有限公司', '九龍大角咀洋松街64號長發工業大廈9樓7室', '2393 3672   6489 8938', '2393 3017', NULL, '9850 1003', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1225', '駿豐食品有限公司', '新界元朗屏山庸園路11-13號', '2158 6876   WHATSAPP:6621 8602', '3764 5218', NULL, '梁生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1226', '偉森貿易公司', '九龍荔枝角青山道682-684號潮流工貿中心11樓11室', '3523 0445   3523 0446', '3523 0447', 'wellsum.co@yahoo.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1227', '天恒食品有限公司', '荃灣灰?角街28號美德大廈6樓D室', '2555 7779', '2555 7899', 'tinhang@biznetvigator.com', '9454 5420文哥', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1228', '美豐食品(香港)有限公司', '香港上環干諾道西20-20A中英大廈5樓504室', '3705 3148', '3705 3180', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1229', '福明食品公司', '屯門青楊街1號世界城市工業大廈15樓E室', '9188 8083', NULL, 'fmfoodco@gmail.com', 'ANGLE', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1230', 'TRUSTY YEARS FOOD TRADING LIMITED', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1231', '駿業食品貿易有限公司', '新界葵涌葵昌路26-38號豪華工業大廈A座15樓16室', '3590 2422', '3590 5434', NULL, '馬仔', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1232', '祥昇國際貿易有限公司', '香港新界荃灣海盛路9號有線大廈39樓08室', '3797 5670', '3705 2844', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1233', '旭日國際食品有限公司', '新界葵豐街1-15號盈豐大廈A座15樓25室', '2911 0118,26500202   2899 0225', '2880 0518', NULL, '9238 4710', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1234', '萬潤食品貿易有限公司', '新界屯門天向路18號南豐工業城1座10樓1-8室', '2471 0933', '2471 0588', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1235', '莊主薈揚盛世發展有限公司', '灣仔駱克道332-334號啟光商業大廈7樓', '53988018/52261849黃生', NULL, NULL, '61110171莊生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1236', 'Nihon Shokken Holdings Co., Ltd.', '香港筲箕灣 興民街68號 海天廣場11樓01-03室', '2967 5811', '2967 5411', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1237', '長昇貿易有限公司', '香港新界荃灣海盛路3號TML廣場11樓C5室', '3797 7308', '3797 7320', 'uptradingltd@gmail.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1238', '鳥取食品有限公司', '沙田山尾街31-41號華樂工業中心E座4樓5-8室', '5545 0052', '3020 6865', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1239', '品珍醬園有限公司', '新界元朗洪水橋丹桂村362號', '2477 9596', '2476 3037', 'info@punchun.com', '9505 2182', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1240', '鴻華餐飲供應公司', '荃灣美環街1-6號時貿中心27樓10室', '2893 3628', '2893 3213', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1241', '香港宏達有限公司', '新界葵涌健全街6-8號裕林第三工業大廈10樓B室', '2870 2809', '2870 2806', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1242', '長明國際(香港)集團有限公司', '香港新界葵涌葵昌路9-15號地下', '3612 0482   3612 0483', '3612 0490', NULL, '5331 0923', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1243', '新記', '中環結志街14號地下', '2544 7369', '2543 4260', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1244', 'YAICHI TOMO', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1245', '萬利龍有限公司', '香港葵涌永業街14-20號華榮工業大廈4樓4A室', '2666 5357   3615 1094', '3003 3061', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1246', '明溢貿易有限公司', '香港新界屯門建發17號同德工業大廈1樓B座', '3483 8066', '2325 0122', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1247', 'Trade81 Limited', '觀塘開源道61號米蘭中心10樓', '2989 1166', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1248', '益豐海產貿易公司', '九龍新界火炭山尾街31-41號華樂工業中心第二期F座3字樓43室', '2816 5838', '2904 9357', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1249', '地中海概念有限公司', '油塘茶果嶺道610號生利工業大廈6樓609', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1250', '嘉明海產(國際)有限公司', '香港屯門湖山路215-239號新華集團中心', '2404 3898', '2441 2030', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1251', '澳利高食品國際有限公司', '新界葵涌葵榮路29-37號成美工業大廈9樓A室', '2552 9266', '2552 9909', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1252', '唐順興家禽(香港)有限公司', '新界元朗屏山庸園路11-13號', '2639 2239   2158 6882', '2668 1806', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1253', '晨達發展有限公司', '香港上環干諾道西21-24號海景商業大廈20字樓2001室', '2145 4228', '2145 4681', 'silverdd@netvigator.com', '9872 0681', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1254', '金隴(香港)投資有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1255', '本意本味有限公司', '新界葵涌葵豐街33-39號,華豐工業中心1座12樓C及D室', '2153 3575', NULL, NULL, '5264 1280馬老闆', '7days', 7, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1256', '標準食品國際有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1257', '進陞食品有限公司', '香港新界火炭黃竹洋街15-21號華聯工業中心b座12樓10室', '3956 8037', '3956 8607', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1258', '萬域亞洲食品有限公司', '香港新業街8號八號商業廣場12樓10室', '2511 2889', '2511 2098', NULL, '5540 2000黃生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1259', '佳佳好食品有限公司', '新界屯門海榮路9號萬能閣3樓320室', '3579 8050', '2155 9988', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1260', '文樂(冷凍)物流有限公司', '火炭禾香街5-19號力堅工業大廈1樓A室', '2665 7788', '2665 1130', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1261', '廣東鴻福貿易有限公司', '廣東省東莞南城區雅園中心路2號佳美科技產業園101室', '0769-82862323', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1262', 'GUANGDONG SKY BRIGHT GROUP CO.,LTD.', 'RM. 1601-1603, 1606-1608, 1610, NO. 21 JIHUA 5TH RD,
ZUMIAO STREET, CHANCHENG DISTRICT, FOSHAN,
GUANGDONG, CHINA', '+86 757 8363 3678', '+86 757 8363 3773', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1263', '泓玥食品貿易有限公司(荃灣)', '荃灣柴灣角街34-36號萬達來工業中心', '61911395   28062128', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1264', '廣州市金莊食品有限公司', '荃灣青山公路-荃灣段東南工業大廈地庫', '51359128', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1265', '香港捷菱有限公司(C17188-00)', '新界大埔工業邨大順街11-13號', '2662 7160   2663 1012', '2663 3960', NULL, '黎小姐', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1266', '佳潤國際貿易有限公司', '新界荃灣海盛路11號ONE MIDTOWN 31樓05-07室', '3579 8050', '2155 9988', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1267', '權哥火鍋(觀塘)', '觀塘駿業街67號駿業熟食中心1樓45號', '54096721', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1268', '力生米業(香港)有限公司', '香港新界元朗洪水橋田廈路125B-2地下', '2447 0692', '2616 0152', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1269', '康隆南亞食品', '柴灣新業街9號新業大廈4樓及7樓', '3844 4590', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1270', '現金購貨', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1271', '全安達冷鏈包裝科技(深圳)有限公司', '深圳市光明區馬田街道水口社區第四工業區第十八棟', '0755-2972 2828', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1272', '三泰食品環球有限公司', '沙田火炭黃竹洋街15-21號華聯工業中心A座7樓01-02室', '2368 8639   2368 8811', NULL, NULL, '6168 5189 ROY', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1273', '大富有限公司', '新界葵涌大連排道35-41號金基工業大廈8數', '24853423', '24853253', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1274', '新永發貿易有限公司', '新界元朗擔杆洲路', '2337 8281   2337 8837', '2777 7026', NULL, '6577 4175/5118 7771', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1275', '捷榮冷凍食品管理有限公司', '葵涌葵德街15-33葵德工業中心1第一座八樓G-H室', '2429 0585', NULL, NULL, '6032 3545杜生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1276', '天糧環球有限公司', NULL, '9825 0835', NULL, NULL, 'JENNY', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1277', 'SUNMED BIOSCIENCES LIMITED', '上環永樂街116-118號昌生商業大廈3樓A', '5100 7464', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1278', '傲誠餐飲服務有限公司', '基灣橫龍街14-22號德士古道工業中心B座3樓08室', '3974 6831', '39746822', NULL, NULL, '15days', 15, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1279', '芝麻綠豆餐飲有限公司', '葵涌打磚坪街85-89號葵涌工業大廈15樓', '93865522', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1280', '食鮮優質食材有限公司', '葵涌打磚坪街華基工業大廈一座2/FG室', NULL, NULL, NULL, NULL, '15days', 15, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1281', '有聯國際貿易有限公司', '香港九龍灣啟祥9號信和中心5樓511室', '3579 5617', '2148 5900', NULL, '9193 5617', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1282', 'Dream Trade', '香港九龍觀塘興業街14號永興工業大廈10樓c4室', '2344 9313   9282 2114', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1283', '天瀛國際企業(香港)有限公司', 'Hoi Fung Yuen Ko Po San Tsuen Kam Tin Yuen Long', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1284', '三興貿易公司', NULL, '2638 2183', '2638 2716', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1285', '味純有限公司', '葵涌打磚坪街85-89號 葵匯工業大廈15樓全層', '6688 0317', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1286', '麒麟行調味品國際有限公司', '香港西環士美菲路32號地下
香港西環士美菲路34號地下(工廠)', '2817 7444/28172150   2817 7821', '28559042', NULL, '9776 9858', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1287', '嘉橋環球有限公司', '九龍紅磡馬頭圍道39號紅磡商業中心A座10樓1005室', '2317 3057', NULL, NULL, 'ALAN 9666 2763', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1288', '友合有限公司', '九龍荔枝角長裕街11號定豐中心10樓1007室', '2102 7145', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1289', '東韋國際有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1290', '三星貿易公司', '香港荃灣葵涌國瑞路88號新豐中心A座2字樓8號', '2480 1982', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1291', '廣州市輝景服飾輔料有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1292', '禾之家素食有限公司', '新界荃灣柴灣角街95號華俊工業中心9樓907室', '2498 8728', '2492 2999', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1293', 'DUSTYKID FOODS LIMITED', 'ROOM 812, 8/F SUN CHEONG INDUSTRIAL BLDG.
1-3 CHEUNG SHUN ST LAI CHI KOK, KIN HONG KONG', NULL, NULL, 'acct..dustykidfood@gmail.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1294', 'SWIFTAD LIMITED', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1295', '宏豐國際食品有限公司', '新界葵涌嘉慶品6-10號僑光工業大廈3樓全層', '3580 8966   9238 4710', '3580 8415', NULL, '江生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1296', '好餸(葵涌)', '葵涌永建路16-20號高威工業中心A座5樓01室', NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1297', '皇品有限公司', NULL, '2790 3800', '2790 3836', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1298', '明浩國際貿易(香港)有限公司', '新界葵涌大連排道31-41號金基工業大廈12樓B室', '2419 7727', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1299', '善富食品有限公司', '荃灣白田壩街53-61號華偉工業大廈813室', '2402 1177', '2402 2318', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1300', 'Fancy Kitchen(青衣)', '青衣長達路14-20號偉力工業大廈B座1611室', '6104 3981', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1301', '新南苑私房菜(尖沙咀)', NULL, '9300 1479', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1302', '藍地雞煲', '荃灣嘉力工業中心B座 1202', '68100500', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1303', '寰宇美食有限公司', '元朗工業村福喜街67-73號地下大昌行食品加', '2898 9962/56612623CA', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1304', '楊記', '九龍新蒲崗六合街8號六合工業大廈14樓D座1403室', '2366 6878', '2368 8308', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1305', '海泉食品有限公司', '新界荃灣沙咀道29-35號科技中心2606室', '2313 5905', NULL, NULL, '6093 8148', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1306', '快達食品有限公司', '沙田火炭禾香街9-15號力堅工業大廈1樓AB室', '6905 5878', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1307', '竣榮行', NULL, '2320 6022', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1308', '宏偉貿易公司', '九龍官塘成業街16號怡生工業中心G座7/F39室', '3900 0564   3900 0565', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1309', '光揚食品有限公司', NULL, '6707 3697', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1310', '倬領環球食品有限公司', NULL, '3870 6100', '3870 6199', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1311', '深圳市好易廚餐飲服務有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('1312', '大豐聯達有限公司', '葵涌大連排道21-33號宏達工業中心8樓02室', '2790 5518', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('G0001', 'LAM SIU KEI', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1001', '三喜國際食品有限公司', '葵涌葵福路14-16號華福工業大廈12樓G室', '2614 6922   2614 3806', '2612 4208', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1002', '百事美企業公司', '香港西環域多利道62號耀基工廠大廈18字樓B室', '2819 1660', '2855 9626', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1003', '景新實業有限公司', '屯門新安街十八號怡華工業大廈1樓', '2463 0883   6300 7737', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1004', '信盟有限公司', '沙田安麗街18號達利廣場11樓1105室', '2388 7370   9411 7132', '2374 0931', NULL, '黃生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1005', '中信膠袋公司', '荃灣青山道491-501號嘉力工業大廈B座4字樓7號室', '2413 2638', '2413 2614', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1006', '惠民清潔公司', '九龍麗景村和景樓1214室', '2785 1231   8209 8959', '2156 1998', NULL, NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1007', '駿業汽車公司', '九龍深水步九江街143號地下', '2360 2173   9453 4349', '2729 3123', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1008', 'D3 PACKAGING CO., LIMITED', '香港新界荃灣橫龍街43-47號龍力工業大廈12樓06室', '3705 9211', '3705 9233', NULL, NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1009', '金榮包裝科技有限公司', '荃灣柴灣角街95號華俊工業中心2樓4室', '9217 4580', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1010', '鴻達行', '新浦崗爵綠街41號啟德工業大廈B28號', '3427 3199   6857 8670', '3428 2377', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1011', '星輝(遠東)有限公司', 'FLAT F,16/F,CENTURY INDUSTRIAL CENTRE,NO.33-35 AU PUI WAN STREET,FOTAN,NT', '2363 2226   9877 6698', '8343 9994', NULL, '胡生', 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1012', 'PANTECH LIMITED', '觀塘道448-458號官塘工業中心3期8樓D室', '2793 1710', '2793 1229', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1013', 'SINOPEC (Hong Kong)Petrol Filling Station Company', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1014', '永恆清潔用品公司', '元朗流浮山沙橋村深灣路124號', '2470 7136   9101 5265', '2464 9354', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1015', '香港包裝器材中心有限公司', '葵涌葵福路93號中信電訊大廈21樓02-03室', '2610 2277    9449 1836', '2484 9275   24257647', 'info@hkpecmsg.com', NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1016', '香港文儀批發中心', '九龍荔枝角永明街1號恆昌工廠大廈3字樓C室', '2361 2107', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1017', '二極冷凍廚具有限公司', '葵涌打磚坪街49-53號華基工業大廈1座10樓M室', '2117 0132', '3427 3115', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1018', '紀田亞洲有限公司', NULL, '26199912   94316467何小姐', '2151 9820', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1019', '德利行糧油批發有限公司', '葵涌禾塘咀街31-39號香港毛紡工業大廈地下 1號鋪', '2422 2997', '2401 2218', NULL, NULL, '30days', 30, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1020', 'GLOBAL E-TRADING SERVICES LIMITED', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1021', '隆盛祥合記', NULL, '28187495', '28551781', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1022', '靜崗', NULL, '9708 3039 ALIEN', NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('S1023', '順利軟硬膠製品廠有限公司', '九龍油塘崇信街二號油塘工業大廈第一座一樓A座', '2379 5132', '2379 5301', NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('X0001', '張世怡', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('X0002', '荃灣工商界慶祝國慶常委會', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('X0003', '中石化(香港)油站有限公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (legacy_code, name, address, phone, fax, email, contact_name, payment_terms, payment_terms_days, default_currency, is_active, warehouse_locations)
VALUES ('X0004', '立新工程公司', NULL, NULL, NULL, NULL, NULL, 'cod', 0, 'HKD', true, '{}')
ON CONFLICT DO NOTHING;

