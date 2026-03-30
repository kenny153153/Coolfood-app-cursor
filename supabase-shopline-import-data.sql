-- Shopline Legacy Member Import
-- Generated from coolfood_ShoplineCustomerReport_20260305163310.xlsx
-- Run AFTER supabase-shopline-import-migration.sql
-- Total: 863 customers

-- Uses a random bcrypt hash that no one knows (members must claim their account)
-- $2a$12$PLACEHOLDER... is a valid bcrypt hash of a 64-char random string

BEGIN;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0001', 'lemon lee', 'my.chaser1019@gmail.com', 'SHOPLINE-0001', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-04 23:19:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0002', 'Fog123', 'andrewktlam@hotmail.com', '67318585', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$354.30", "shopline_join_date": "2026-03-04 15:22:52", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67318585", "shopline_recipient_phone": "67318585"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0003', 'Mickey', 'chunyinma589@gmail.com', 'SHOPLINE-0003', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-04 03:52:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0004', 'qnllnp', 'qnllnp@yahoo.com.hk', 'SHOPLINE-0004', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-03 21:18:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0005', 'charlottekwy', 'charlottekwy@gmail.com', '62134889', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$361.95", "shopline_join_date": "2026-03-03 03:23:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62134889", "shopline_recipient_phone": "62134889"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0006', 'Sze428', 'wingsze.ma@yahoo.com.hk', 'SHOPLINE-0006', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-02 20:30:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0007', 'Crazywtpooh', 'crazywtpooh@yahoo.com.hk', 'SHOPLINE-0007', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-02 17:14:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0008', 'gracel24', 'gracelau1217@gmail.com', 'SHOPLINE-0008', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-03-02 14:02:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0009', 'Natalie', 'yeeki02114@yahoo.com.hk', 'SHOPLINE-0009', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$726.30", "shopline_join_date": "2026-03-01 15:07:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0010', 'Siki_Sisi', 'siki_skylinegtr34@hotmail.com', 'SHOPLINE-0010', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-28 15:45:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0011', 'Alex siu', 'alexsiu119@gmail.com', 'SHOPLINE-0011', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$376.60", "shopline_join_date": "2026-02-27 12:32:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0012', 'Cheung1984', 'fungtin198491@gmail.com', 'SHOPLINE-0012', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-26 15:03:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0013', 'Zoe Ng', 'zoeng1410@gmail.com', 'SHOPLINE-0013', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-26 11:41:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0014', 'Bebe Tsang', 'kelbebetsang220817@gmail.com', 'SHOPLINE-0014', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-26 07:49:51", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0015', 'Zitachan', 'cat1109yee@yahoo.com.hk', 'SHOPLINE-0015', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-25 19:16:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0016', 'Mrs lee', 'tunglio@yahoo.com.hk', 'SHOPLINE-0016', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-25 11:20:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0017', '楊淑萍', 'applecyping@gmail.com', 'SHOPLINE-0017', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$368.60", "shopline_join_date": "2026-02-25 10:27:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0018', 'Vicky Wong', 'vicvicsunny@yahoo.com.hk', 'SHOPLINE-0018', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-24 19:00:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0019', 'Katherinec516', 'katherinec516@gmail.com', '94555417', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.24", "shopline_join_date": "2026-02-24 12:08:47", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94555417", "shopline_recipient_phone": "94555417"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0020', 'Ling', 'christyngdream@hotmail.com', 'SHOPLINE-0020', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-19 22:45:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0021', 'Ben Au', 'benau0315@yahoo.com.hk', 'SHOPLINE-0021', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$492.40", "shopline_join_date": "2026-02-19 15:53:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0022', 'catsun911', 'catcat12348@gmail.com', 'SHOPLINE-0022', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-18 17:32:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0023', 'SETO', 'sttseto@hotmail.com', 'SHOPLINE-0023', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-16 23:57:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0024', 'Gary Yip', 'gary930@ymail.com', 'SHOPLINE-0024', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-16 23:33:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0025', 'Susanne Leung', 'msleung.cg28@gmail.com', 'SHOPLINE-0025', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-13 06:43:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0026', 'chong', '1123279184sara@gmail.com', 'SHOPLINE-0026', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-13 01:23:41", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0027', 'kwok198546', 'kwokwaiyan2018@gmail.com', 'SHOPLINE-0027', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-12 22:50:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0028', '林', 'apowerlam@gmail.com', 'SHOPLINE-0028', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$372.90", "shopline_join_date": "2026-02-12 21:20:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0029', 'Leung kimberley', '17ruemercci@gmail.com', 'SHOPLINE-0029', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$399.00", "shopline_join_date": "2026-02-12 17:12:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0030', 'chinchinxx', 'tszkashop@yahoo.com.hk', '66777737', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$998.00", "shopline_join_date": "2026-02-11 19:59:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66777737", "shopline_recipient_phone": "66777737"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0031', 'Pony', 'pony402002@yahoo.com.hk', 'SHOPLINE-0031', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$558.80", "shopline_join_date": "2026-02-11 17:22:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0032', 'Leung Yuk Ying', 'crayonleung@gmail.com', 'SHOPLINE-0032', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$369.93", "shopline_join_date": "2026-02-11 09:37:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0033', 'tinnyngai', 'tinnyngai@yahoo.com.hk', '69098122', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$498.90", "shopline_join_date": "2026-02-11 09:36:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69098122", "shopline_recipient_phone": "69098122"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0034', 'Chloe Chang', 'ngakiu.c@yahoo.com', '60129069', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$369.08", "shopline_join_date": "2026-02-10 18:30:09", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60129069", "shopline_recipient_phone": "60129069"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0035', 'Cherry Hung', 'cherryhung015@gmail.com', 'SHOPLINE-0035', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$360.00", "shopline_join_date": "2026-02-10 14:21:33", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0036', 'Paomesfamily', 'joeywonghw@hotmail.com', '67687858', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$822.43", "shopline_join_date": "2026-02-10 08:35:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67687858", "shopline_recipient_phone": "67687858"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0037', 'tsangwingyi', 'yi_116@yahoo.com.hk', '93296695', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$779.38", "shopline_join_date": "2026-02-09 19:49:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93296695", "shopline_recipient_phone": "93296695"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0038', 'Katyt', 'katyuv123@gmail.com', 'SHOPLINE-0038', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$635.40", "shopline_join_date": "2026-02-09 19:40:01", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0039', 'Sherry', 'sherry220773@gmail.com', 'SHOPLINE-0039', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-09 18:15:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0040', 'siu hong Wong', 'wongsiuhong529@yahoo.com', '54469945', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$498.20", "shopline_join_date": "2026-02-09 17:21:35", "shopline_email_promo": true, "shopline_fb_promo": true, "shopline_is_member": true, "shopline_contact_phone": "54469945", "shopline_recipient_phone": "54469945"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0041', 'Nicestar', 'lee4skills@gmail.com', 'SHOPLINE-0041', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-09 15:45:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0042', 'Aggiewong', 'pucilastella@gmail.com', 'SHOPLINE-0042', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-08 19:22:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0043', 'Candy', 'candylam27@gmail.com', '93788009', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-08 14:17:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93788009", "shopline_recipient_phone": "93788009", "shopline_bound_phone": "93788009"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0044', '甘小姐', 'winlyh@ymail.com', 'SHOPLINE-0044', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-07 22:39:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0045', '64605130', 'lolita000723@yahoo.com.hk', 'SHOPLINE-0045', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-07 17:19:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0046', 'Kathy Chiu', 'kathychiu1119@yahoo.com', 'SHOPLINE-0046', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-06 06:41:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0047', 'Amyamyamyamy', 'amyamyamyamy@ymail.com', 'SHOPLINE-0047', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$365.60", "shopline_join_date": "2026-02-05 12:02:02", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0048', 'BEE CHEUNG', 'cslbee2003@yahoo.com.hk', 'SHOPLINE-0048', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-05 09:42:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0049', 'snowie', 'shirleyho0804@gmail.com', 'SHOPLINE-0049', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-04 23:17:43", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0050', 'Sunny lo', 'mickymcm@yahoo.com.hk', 'SHOPLINE-0050', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-04 03:35:38", "shopline_email_promo": true, "shopline_fb_promo": true, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0051', 'Cara lau', 'kristilau@yahoo.com.hk', 'SHOPLINE-0051', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-03 18:01:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0052', 'LittleGrace', 'gracechan133@yahoo.com', 'SHOPLINE-0052', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,305.00", "shopline_join_date": "2026-02-03 13:24:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0053', 'Shan', 't.hoishan@yahoo.com', 'SHOPLINE-0053', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-02-01 00:44:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0054', '黃先生', 'tweetywong200@hotmail.com', 'SHOPLINE-0054', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$368.20", "shopline_join_date": "2026-01-30 17:30:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0055', 'Miyama', 'miyama.kaoto@gmail.com', '98000589', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$707.20", "shopline_join_date": "2026-01-30 15:55:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98000589", "shopline_recipient_phone": "98000589", "shopline_bound_phone": "98000589"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0056', '袁洛', 'detevtive@gmail.com', '96723183', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$715.20", "shopline_join_date": "2026-01-29 10:55:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96723183", "shopline_recipient_phone": "96723183"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0057', '陳惠琪', 'corachan3@hotmail.com', '53210393', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$458.76", "shopline_join_date": "2026-01-27 23:19:10", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53210393", "shopline_recipient_phone": "53210393", "shopline_bound_phone": "53210393"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0058', 'Jasmine Lau', 'yasminyas0812@gmail.com', 'SHOPLINE-0058', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$365.70", "shopline_join_date": "2026-01-26 22:01:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0059', 'Jessyeung', 'meimei22083@yahoo.com.hk', 'SHOPLINE-0059', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-26 03:12:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0060', 'Moonlight', 'electricalwater@msn.con', 'SHOPLINE-0060', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-25 21:11:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0061', 'cho ching yi', 'chochingyi@gmail.com', 'SHOPLINE-0061', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-24 23:51:53", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0062', 'Pan Tsang', 'tpandora@hotmail.com', 'SHOPLINE-0062', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-24 17:35:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0063', 'Joel Cheung', 'joel130999@yahoo.com.hk', 'SHOPLINE-0063', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-24 15:10:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0064', 'Simon LEE', 'simonmjn@gmail.com', '97323966', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$390.50", "shopline_join_date": "2026-01-23 22:56:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97323966", "shopline_recipient_phone": "97323966"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0065', 'Wong Tan Yu', 'fishballnjudy@gmail.com', 'SHOPLINE-0065', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$37.45", "shopline_join_date": "2026-01-23 20:54:32", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0066', 'Ishtar Choi', 'ishtarchc@gmail.com', '66505150', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$372.80", "shopline_join_date": "2026-01-23 15:57:08", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66505150", "shopline_recipient_phone": "66505150"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0067', 'gracewong81503', 'gracewong81503@gmail.com', 'SHOPLINE-0067', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-23 09:04:30", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0068', 'Tracy', 'hungwingwa.hw@gmail.com', 'SHOPLINE-0068', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.30", "shopline_join_date": "2026-01-22 13:51:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0069', 'YU Maggie', 'maggieyu91838@gmail.com', '92693096', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$370.80", "shopline_join_date": "2026-01-22 11:04:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "92693096"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0070', 'Yvonne', 'yiplautai@gmail.com', 'SHOPLINE-0070', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-22 07:31:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0071', 'Monna', 'vmonnav@gmail.com', '90786836', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$951.60", "shopline_join_date": "2026-01-21 23:19:47", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90786836", "shopline_recipient_phone": "90786836"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0072', 'terry lo', 'terrylo0810@gmail.com', 'SHOPLINE-0072', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.00", "shopline_join_date": "2026-01-21 19:46:39", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0073', 'kxq', 'ke1741723268@gmail.com', 'SHOPLINE-0073', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-21 02:21:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0074', 'Vic', 'vickong35@gmail.com', 'SHOPLINE-0074', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-21 00:17:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0075', 'Ivy Lam', 'ivylamtszman@gmail.com', 'SHOPLINE-0075', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.30", "shopline_join_date": "2026-01-20 23:46:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0076', 'k271881877', 'k271881877@yahoo.com.hk', '98805298', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$411.30", "shopline_join_date": "2026-01-20 21:50:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98805298", "shopline_recipient_phone": "98805298"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0077', 'ASWT', 'atangsw@gmail.com', 'SHOPLINE-0077', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-20 12:43:33", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0078', 'yeungmelo', 'yeungmelo318@hotmail.com', '56322963', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.31", "shopline_join_date": "2026-01-20 02:36:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "56322963", "shopline_recipient_phone": "56322963"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0079', 'Melody Yeung', 'yeunmelo318@hotmail.com', 'SHOPLINE-0079', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-20 02:33:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0080', 'Mic880', 'mtsp880@gmail.com', 'SHOPLINE-0080', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-19 14:09:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0081', 'Ms luk', 'amazinggrace2024@myyahoo.com', '66283127', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$429.70", "shopline_join_date": "2026-01-19 12:48:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66283127", "shopline_recipient_phone": "66283127"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0082', 'Timmi', 'sotimmi@gmail.com', 'SHOPLINE-0082', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-19 11:06:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0083', 'Ling Wing Chan Chan', 'lantrowing@yahoo.com.hk', 'SHOPLINE-0083', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-19 01:10:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0084', 'Gloria Wong', 'gloriawong99@gmail.com', 'SHOPLINE-0084', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-19 00:21:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0085', 'Bandy', 'bandy@cboat.com.hk', 'SHOPLINE-0085', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-17 19:57:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0086', 'Yim', 'katyub124@gmail.com', 'SHOPLINE-0086', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$408.90", "shopline_join_date": "2026-01-17 18:59:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0087', 'Ping Ping', 'siuping.leung@yahoo.com.hk', 'SHOPLINE-0087', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$777.50", "shopline_join_date": "2026-01-17 18:43:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0088', 'Charlie Wu', 'os608609@gmail.com', 'SHOPLINE-0088', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-17 17:39:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0089', 'Z', 'chyan625@gmail.com', '63340440', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.41", "shopline_join_date": "2026-01-17 09:44:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63340440", "shopline_recipient_phone": "63340440"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0090', 'Evechan', 'ectety2012@gmail.com', '54044988', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,004.90", "shopline_join_date": "2026-01-17 02:43:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "54044988", "shopline_recipient_phone": "54044988"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0091', 'vsuwhw', 'kobechung07@gmail.com', 'SHOPLINE-0091', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-17 01:02:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0092', 'Rick Lam', 'kylkh@yahoo.com.hk', 'SHOPLINE-0092', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-16 09:36:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0093', 'kason199', 'kass199@gmail.com', '62870549', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$486.00", "shopline_join_date": "2026-01-15 12:54:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62870549", "shopline_recipient_phone": "62870549"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0094', 'Kan chung chi', 'kchungchi@gmail.com', 'SHOPLINE-0094', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$369.80", "shopline_join_date": "2026-01-14 22:36:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0095', 'Vanessa Cheung', 'free_bird_sing@yahoo.com.hk', '94719863', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,117.23", "shopline_join_date": "2026-01-14 16:43:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94719863", "shopline_recipient_phone": "94719863"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0096', 'Vanessa Cheung', 'free_bird_sing@yhaoo.com.hk', 'SHOPLINE-0096', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-14 16:20:28", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0097', 'FreemanPOON', 'freemanjoanna88@qq.com', '90806175', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$367.84", "shopline_join_date": "2026-01-13 22:50:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90806175", "shopline_recipient_phone": "90806175", "shopline_bound_phone": "90806175"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0098', 'Joanne Cheng', 'joanne_cch@hotmail.com', 'SHOPLINE-0098', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-13 22:19:28", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0099', 'Anna Chan', 'annamoses630@gmail.com', 'SHOPLINE-0099', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-13 13:14:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0100', 'Sasa', 'tcn0328@gmail.com', 'SHOPLINE-0100', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-13 09:33:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0101', 'Choymanho', 'choymanho@yahoo.com.hk', 'SHOPLINE-0101', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-12 10:58:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0102', 'Carman', 'car_ho@yahoo.com.hk', 'SHOPLINE-0102', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$354.50", "shopline_join_date": "2026-01-11 23:04:26", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0103', 'Winki Sin', 'wingki.sin813@gmail.com', 'SHOPLINE-0103', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-11 22:51:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0104', 'hisarah6890', 'hisarah6890@gmail.com', 'SHOPLINE-0104', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-11 15:56:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0105', 'simon tam', 'simontam.ming@gmail.com', 'SHOPLINE-0105', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-10 21:56:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0106', 'Mei266', 'mimichung2828@yahoo.com.hk', 'SHOPLINE-0106', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-10 18:43:10", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0107', 'yingng1688', 'yingng1688@yahoo.com.hk', 'SHOPLINE-0107', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-10 11:41:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0108', 'as331', 'as331as1971@gmail.com', 'SHOPLINE-0108', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-09 23:34:33", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0109', 'Shirley hui', 'huimummy@gmail.com', 'SHOPLINE-0109', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$82.46", "shopline_join_date": "2026-01-09 17:23:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0110', 'Zoe Leung', 'zoeleung411@gmail.com', 'SHOPLINE-0110', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-09 17:12:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0111', 'Helen Lam', 'lampikyee1@gmail.com', '69368097', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-08 21:36:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69368097", "shopline_bound_phone": "69368097"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0112', 'Tang', 'happymun168@gmail.com', 'SHOPLINE-0112', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-08 12:01:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0113', 'Jackkain', 'jacqueline7599@yahoo.com.hk', '92117152', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$326.32", "shopline_join_date": "2026-01-08 08:10:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92117152"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0114', 'Arthur', 'npaaa@hotmail.com', 'SHOPLINE-0114', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$359.30", "shopline_join_date": "2026-01-08 05:16:30", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0115', 'Jennychau', 'jennychau6824@gmail.com', 'SHOPLINE-0115', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-08 04:49:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0116', '易子凡', 'yanis.zifan.yi@gmail.com', 'SHOPLINE-0116', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.30", "shopline_join_date": "2026-01-07 17:29:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0117', 'helen52790', 'lihaiting2013@gmail.com', '90625992', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$571.60", "shopline_join_date": "2026-01-06 01:32:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90625992", "shopline_recipient_phone": "90625992"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0118', 'Cat', 'catchanz1442121@gmail.com', '94933481', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$361.76", "shopline_join_date": "2026-01-05 22:23:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94933481", "shopline_recipient_phone": "94933481", "shopline_bound_phone": "94933481"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0119', 'Andy Law', 'lawtinwah@gmail.com', 'SHOPLINE-0119', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-04 15:38:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0120', 'chihong', '000555gm@gmail.com', '97738025', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,298.70", "shopline_join_date": "2026-01-04 08:59:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97738025", "shopline_recipient_phone": "97738025"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0121', 'Ms Lam', 'lam1017_2000@yahoo.com.hk', 'SHOPLINE-0121', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$353.50", "shopline_join_date": "2026-01-03 22:18:32", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0122', 'kaman', 'kakimi5354@yahoo.com.hk', '68286286', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$861.30", "shopline_join_date": "2026-01-03 17:05:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "68286286", "shopline_recipient_phone": "68286286"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0123', '陳小姐', 'joannech216@yahoo.com.hk', 'SHOPLINE-0123', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$794.50", "shopline_join_date": "2026-01-03 16:13:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0124', '李太', 'lylin0611@yahoo.com.hk', 'SHOPLINE-0124', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-03 12:33:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0125', 'Dom', 'dc521@ymail.com', 'SHOPLINE-0125', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-03 09:02:10", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0126', 'Dora Tang', 'todora001@gmail.com', 'SHOPLINE-0126', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$163.68", "shopline_join_date": "2026-01-03 07:53:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0127', '詩詩 黃', 'cissywong923@yahoo.com.hk', '98302744', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$402.10", "shopline_join_date": "2026-01-02 19:52:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98302744", "shopline_recipient_phone": "98302744"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0128', 'Ada', 'dadawong726@gmail.com', '62010283', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-02 18:58:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62010283", "shopline_recipient_phone": "62010283"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0129', 'Hiuman Chu', 'chuhiumanman@gmail.com', 'SHOPLINE-0129', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-02 18:56:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0130', 'Ccc902', 'catwan80@gmail.com', 'SHOPLINE-0130', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2026-01-01 12:16:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0131', 'ah7121', 'ah7121@hotmail.com', 'SHOPLINE-0131', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-31 17:19:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0132', 'Miss Lai', 'milly_lai@hotmail.com', 'SHOPLINE-0132', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$677.78", "shopline_join_date": "2025-12-31 13:46:39", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0133', '陳朗而', 'yee830124@yahoo.com.hk', 'SHOPLINE-0133', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-29 23:28:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0134', 'totowong', 'totowong@gmail.com', 'SHOPLINE-0134', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-29 23:26:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0135', 'Mr.Chow Wai  Chun', 'bb246810cc@gmail.com', '94201123', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.80", "shopline_join_date": "2025-12-29 10:21:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94201123", "shopline_recipient_phone": "94201123"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0136', 'Christine Lai', 'tinelai0615@gmail.com', 'SHOPLINE-0136', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-27 03:15:06", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0137', 'yankwok0825', 'yankwok0825@gmail.com', '61114289', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-26 21:19:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61114289", "shopline_recipient_phone": "61114289", "shopline_bound_phone": "61114289"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0138', 'CHU', 'gtoitiald@gmail.com', 'SHOPLINE-0138', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$399.00", "shopline_join_date": "2025-12-26 15:40:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0139', 'Cat Wong', 'catlswong@gmail.com', 'SHOPLINE-0139', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-25 20:49:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0140', 'Winnie Pang', 'winniepc@hotmail.com', 'SHOPLINE-0140', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$361.28", "shopline_join_date": "2025-12-25 16:18:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0141', 'Inti', 'hkgolden.sisters@gmail.com', 'SHOPLINE-0141', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-25 09:07:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0142', 'clarayam28', 'clarayam28@yahoo.com.hk', '96363902', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$399.95", "shopline_join_date": "2025-12-24 09:50:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96363902", "shopline_recipient_phone": "96363902"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0143', 'Jenny Ma', 'jenny168tko@yahoo.com.hk', 'SHOPLINE-0143', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-23 23:20:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0144', 'kittychow', 'g95149913@gmail.com', 'SHOPLINE-0144', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-23 21:31:08", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0145', 'yy', 'yy803.yy@gmail.com', 'SHOPLINE-0145', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-23 17:27:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0146', 'Chigril4668', 'chigril4668@yahoo.com.hk', '62009397', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.54", "shopline_join_date": "2025-12-23 15:04:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62009397", "shopline_recipient_phone": "62009397"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0147', 'yanice_yan', 'csyan1997@yahoo.com.hk', '69926248', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$389.02", "shopline_join_date": "2025-12-23 14:03:42", "shopline_email_promo": true, "shopline_fb_promo": true, "shopline_is_member": true, "shopline_contact_phone": "69926248", "shopline_recipient_phone": "69926248"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0148', 'Shopline User 148', NULL, '69926248', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "69926248"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0149', 'kareeeexd', 'karee_yee14@hotmail.com', '65383518', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$792.58", "shopline_join_date": "2025-12-23 10:20:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65383518", "shopline_recipient_phone": "65383518"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0150', 'catwcy', 'catwcy@ymail.com', 'SHOPLINE-0150', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-23 00:58:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0151', 'Tamutiger', 'manfong@gmail.com', 'SHOPLINE-0151', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-23 00:38:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0152', 'Guill', 'alyanyan@hotmail.com', 'SHOPLINE-0152', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.50", "shopline_join_date": "2025-12-21 23:52:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0153', 'Joe29081', 'joe29081@gmail.com', 'SHOPLINE-0153', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-21 22:46:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0154', 'Claudia Lui', 'claudialui@gmail.gim', 'SHOPLINE-0154', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$367.70", "shopline_join_date": "2025-12-21 20:42:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0155', 'Wing Tung Lee', 'wtleeab@connect.ust.hk', 'SHOPLINE-0155', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$399.00", "shopline_join_date": "2025-12-21 17:46:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0156', 'powerlau', 'powerlau@live.hk', 'SHOPLINE-0156', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-21 15:31:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0157', 'Gabbilee', 'rice6ng@yahoo.com.hk', 'SHOPLINE-0157', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-21 00:53:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0158', 'Lawlaw', 'wingwingyee198410@yahoo.com.hk', 'SHOPLINE-0158', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-20 19:29:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0159', '潘 瑞桂', 'poonshuikwai@yahoo.com.hk', 'SHOPLINE-0159', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-19 21:12:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0160', 'ZHIUHaiping', 'ivymiqihk@gmail.com', 'SHOPLINE-0160', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-19 20:51:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0161', 'Jane Cheung', 'jane98340986@gmail.com', 'SHOPLINE-0161', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-19 11:33:58", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0162', 'Ada Wong', 'adawong115@gmail.com', 'SHOPLINE-0162', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-18 13:53:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0163', 'Rebecca Fung', 'caca1220@yahoo.com.hk', '91062372', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$403.46", "shopline_join_date": "2025-12-16 14:48:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91062372", "shopline_recipient_phone": "91062372"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0164', 'plam2105', 'paulinelam6696@gmail.com', 'SHOPLINE-0164', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$405.40", "shopline_join_date": "2025-12-16 13:07:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0165', 'Lillian', 'lillianchun@outlook.com', '91778865', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$950.94", "shopline_join_date": "2025-12-16 08:15:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91778865", "shopline_recipient_phone": "91778865"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0166', 'Shopline User 166', NULL, '91778865', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "91778865"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0167', 'Sky Chung', 'chungchinglam@gmail.com', 'SHOPLINE-0167', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-14 23:08:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0168', 'Candy Yeung', 'candyyeung1127@yahoo.com.hk', 'SHOPLINE-0168', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-14 19:51:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0169', 'Mico', 'micowong@mail.com', '63548950', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$753.60", "shopline_join_date": "2025-12-14 19:03:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63548950", "shopline_recipient_phone": "63548950", "shopline_bound_phone": "63548950"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0170', 'Wong Yuk Ying', 'wongy4070@gmail.com', '63352683', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,191.00", "shopline_join_date": "2025-12-13 16:12:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63352683", "shopline_recipient_phone": "63352683"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0171', 'Christina Sit', 'christinasit2004@yahoo.com.hk', 'SHOPLINE-0171', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-13 07:28:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0172', 'ibee', 'ibee.tlc@gmail.com', 'SHOPLINE-0172', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-12 21:53:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0173', 'VickiMak', 'vickimakwaiyin@yahoo.com', 'SHOPLINE-0173', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-12 20:26:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0174', 'Carmen Lo', 'hugolo615@yahoo.com.hk', 'SHOPLINE-0174', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-12 10:27:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0175', 'Cindycc1022', 'cindycheung1022@yahoo.com', '98530185', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$375.80", "shopline_join_date": "2025-12-11 23:29:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98530185", "shopline_recipient_phone": "98530185"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0176', 'Monica Chan', 'nahoschan@gmail.com', 'SHOPLINE-0176', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$371.80", "shopline_join_date": "2025-12-11 22:48:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0177', 'Wai Cheuk Hei', 'kevinwai0024@gmail.com', 'SHOPLINE-0177', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$179.50", "shopline_join_date": "2025-12-11 20:40:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0178', 'tiopeter', 'gogofatchoi@yahoo.com.hk', 'SHOPLINE-0178', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-11 20:38:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0179', 'Boyi1101', 'ahbo1101@hotmail.com', 'SHOPLINE-0179', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-11 00:51:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0180', 'yeung', 'yeunghan821@yahoo.com.hk', 'SHOPLINE-0180', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-10 22:45:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0181', 'Tang Yu Chung', 'tangdominic@hotmail.com', '61274743', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$710.90", "shopline_join_date": "2025-12-09 21:04:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "61274743"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0182', 'Heidi Shroff', 'shroffheidi@gmail.com', 'SHOPLINE-0182', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$360.50", "shopline_join_date": "2025-12-09 14:54:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0183', 'Kammy', 'cat8sheep@hotmail.com', '95779966', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,309.66", "shopline_join_date": "2025-12-09 01:07:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95779966", "shopline_recipient_phone": "95779966"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0184', '溫先生', 'wan00123456789@yahoo.com.hk', 'SHOPLINE-0184', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$395.48", "shopline_join_date": "2025-12-08 23:35:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0185', 'tigrrdoghost', 'tigerdoghost@yahoo.com.hk', '93160203', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$392.40", "shopline_join_date": "2025-12-08 19:15:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93160203", "shopline_recipient_phone": "93160203"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0186', 'Daphineng', 'daphinensk@gmail.com', 'SHOPLINE-0186', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 18:37:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0187', 'Mosquito Chan', 'mosquitocwm@gmail.com', '63751315', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 18:12:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63751315", "shopline_recipient_phone": "63751315", "shopline_bound_phone": "63751315"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0188', 'LI KIM HUNG', 'hung88881967@yahoo.com.hk', '63854391', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 17:01:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63854391", "shopline_recipient_phone": "63854391", "shopline_bound_phone": "63854391"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0189', 'Tammy', 'tammy1888@gmail.com', 'SHOPLINE-0189', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 09:41:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0190', 'Shum', 'winniethepooh2909@yahoo.com', '64211756', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,913.90", "shopline_join_date": "2025-12-08 09:25:07", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64211756", "shopline_recipient_phone": "64211756"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0191', 'October1031', 'hoiki1031@hotmail.com', 'SHOPLINE-0191', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 03:06:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0192', 'Yan wan', 'nicolewan0@gmail.com', '53487366', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$397.80", "shopline_join_date": "2025-12-08 00:47:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53487366", "shopline_recipient_phone": "53487366"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0193', 'Amie', 'patpattung@yahoo.com.hk', 'SHOPLINE-0193', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-08 00:10:59", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0194', 'Kent', 'kent.mcy@gmail.com', 'SHOPLINE-0194', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-07 00:37:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0195', 'viann', 'ivy_vievy@hotmail.com', 'SHOPLINE-0195', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-06 16:16:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0196', '黎健文', 'ahlaiahlai88@yahoo.com.hk', '94721182', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$471.50", "shopline_join_date": "2025-12-06 13:45:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94721182", "shopline_recipient_phone": "94721182"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0197', 'Joan', 'pingu723@yahoo.com.hk', 'SHOPLINE-0197', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-06 11:50:09", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0198', 'Moon Chow', 'sinthyachow@yahoo.com.hk', '92206294', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.33", "shopline_join_date": "2025-12-06 11:44:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92206294", "shopline_recipient_phone": "92206294"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0199', 'kinkikwok', 'kinkikaki1114@yahoo.com.hk', 'SHOPLINE-0199', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-05 23:58:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0200', 'Charmaine', 'mydearferrari@hotmail.com', 'SHOPLINE-0200', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-05 10:54:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0201', 'chungjoan15', 'ykchung@qos.edu.hk', 'SHOPLINE-0201', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-05 09:53:15", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0202', 'Leung', 'yukshing0308@gmail.com', 'SHOPLINE-0202', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$1,615.40", "shopline_join_date": "2025-12-05 06:40:59", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0203', 'lan00507', 'lan00507@hotmail.com', 'SHOPLINE-0203', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-04 22:55:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0204', 'Cherry Chak', 'cherrychak2014@gmail.com', 'SHOPLINE-0204', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-04 11:05:02", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0205', 'Venus Kwok', 'ksmvenus@gmail.com', 'SHOPLINE-0205', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$374.10", "shopline_join_date": "2025-12-04 10:39:46", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0206', 'Yoyo Lai', 'riskayoyokay@gmail.com', 'SHOPLINE-0206', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-04 08:03:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0207', 'crystal', 'crystalkyw@yahoo.com.hk', 'SHOPLINE-0207', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-03 21:19:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0208', 'Christal Chan', 'kejin112@icloud.com', 'SHOPLINE-0208', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-03 19:06:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0209', 'Akina', 'akinamakmak@gmail.com', 'SHOPLINE-0209', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-02 09:43:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0210', 'Hau Yee Chan', 'charadonald2003@yahoo.com.hk', 'SHOPLINE-0210', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-01 20:04:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0211', 'Hau Yee Chan', 'charadonald@yahoo.com.hk', 'SHOPLINE-0211', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-01 20:02:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0212', 'Winterlau', 'winterlau0103@yahoo.com.hk', '91691296', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$392.44", "shopline_join_date": "2025-12-01 18:57:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91691296", "shopline_recipient_phone": "91691296"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0213', 'Winky', 'manlaw313@yahoo.com.hk', 'SHOPLINE-0213', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-01 15:15:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0214', 'rubycheung11', 'rubystcheung@gmail.com', '65076705', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,580.70", "shopline_join_date": "2025-12-01 10:42:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65076705", "shopline_recipient_phone": "65076705"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0215', 'Shopline User 215', NULL, '65076705', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "65076705"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0216', 'Moon wong', 'mooncake0021@gmail.com', 'SHOPLINE-0216', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-12-01 00:50:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0217', 'llcheng2', 'amy.1026@hotmail.com', '61527909', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$395.70", "shopline_join_date": "2025-11-30 21:37:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61527909", "shopline_recipient_phone": "61527909"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0218', 'Choi wa Cheng', 'deliasflower@yahoo.com.hk', 'SHOPLINE-0218', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-30 12:09:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0219', '萬貴妃', 'wingki.sin913@gmail.com', 'SHOPLINE-0219', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-30 10:28:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0220', 'Esther Leung', 's.tas.taci@gmail.com', 'SHOPLINE-0220', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-29 16:52:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0221', 'Ball Ng', 'ball0913@gmail.com', 'SHOPLINE-0221', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-27 20:14:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0222', 'Bellwong wong', 'wongbell875@gmail.com', 'SHOPLINE-0222', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-27 20:13:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0223', 'Rainie', 'holoveyee@gmail.com', 'SHOPLINE-0223', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-27 12:05:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0224', 'Cheng Chui Chui', 'chui516@yahoo.com.hk', 'SHOPLINE-0224', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-27 02:32:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0225', 'Tony Wong', 'tonywong1211@hotmail.com', 'SHOPLINE-0225', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-26 19:58:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0226', 'Ruby Chau', 'ruby6chau@gmail.com', 'SHOPLINE-0226', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-26 12:32:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0227', 'Moonlight', 'electricalwater@msn.com', '98207543', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$363.18", "shopline_join_date": "2025-11-26 06:46:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98207543", "shopline_recipient_phone": "98207543", "shopline_bound_phone": "98207543"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0228', 'Wilson tam', 'hoifaitam7990@gmail.com', '98547126', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$375.25", "shopline_join_date": "2025-11-25 16:20:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98547126", "shopline_recipient_phone": "98547126"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0229', 'Shopline User 229', NULL, '98547126', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "98547126"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0230', '周小姐', 'yenchow1985@yahoo.com.hk', 'SHOPLINE-0230', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-25 00:31:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0231', 'Leung Tat Ming', 'leungtatming@yahoo.com.hk', 'SHOPLINE-0231', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-24 10:13:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0232', 'Leung Tat Ming', 'leungtafming@yahoo.com.hk', 'SHOPLINE-0232', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-24 10:11:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0233', 'Annie', 'annie21380@yahoo.com.hk', '94901999', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$452.40", "shopline_join_date": "2025-11-23 22:35:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94901999", "shopline_recipient_phone": "94901999"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0234', 'Eva Chiu', 'zhaolifen88@gmail.com', '95006136', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$378.60", "shopline_join_date": "2025-11-22 16:19:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95006136", "shopline_recipient_phone": "95006136"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0235', 'Milki Chung', 'niccaho516@hotmail.com', '92661155', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$372.60", "shopline_join_date": "2025-11-22 11:26:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92661155", "shopline_bound_phone": "92661155"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0236', 'June1969', 'junewan99@gmail.com', 'SHOPLINE-0236', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-22 03:09:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0237', 'JoannaLam', 'joannalin168@yahoo.com.hk', 'SHOPLINE-0237', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$372.10", "shopline_join_date": "2025-11-21 14:14:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0238', 'leemouwah', 'leemouwah@gmail.com', 'SHOPLINE-0238', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$355.20", "shopline_join_date": "2025-11-21 13:41:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0239', 'CHAU WAN YU', 'tommychau1024@gmail.com', 'SHOPLINE-0239', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$440.00", "shopline_join_date": "2025-11-20 13:00:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0240', 'Philip Lai', 'philip033@gmail.com', 'SHOPLINE-0240', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.05", "shopline_join_date": "2025-11-20 11:14:53", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0241', 'Lam heidi', 'lammanhei613@gmail.com', 'SHOPLINE-0241', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-19 01:04:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0242', 'amychangsy', 'amychangsy@yahoo.com.hk', 'SHOPLINE-0242', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-18 23:49:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0243', 'Lam Ching', 'lamching@hotmail.com', 'SHOPLINE-0243', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-18 22:20:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0244', 'Soniachan', 'piggytree920@gmail.com', 'SHOPLINE-0244', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-18 19:30:57", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0245', 'sharon1230', 'sharon.mwv@gmail.com', '92822925', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.69", "shopline_join_date": "2025-11-18 15:49:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92822925", "shopline_recipient_phone": "92822925"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0246', 'Cheng', 'kamie1023@yahoo.com.hk', 'SHOPLINE-0246', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$846.20", "shopline_join_date": "2025-11-18 13:48:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0247', 'P Law', 'lawprairie@yahoo.com.hk', 'SHOPLINE-0247', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$382.10", "shopline_join_date": "2025-11-18 10:34:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0248', 'kaluntung', 'kalungtung@gmail.com', '98588553', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,156.48", "shopline_join_date": "2025-11-18 09:58:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98588553", "shopline_recipient_phone": "98588553"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0249', 'whoiy', 'whoiy@hotmail.com', 'SHOPLINE-0249', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-18 01:20:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0250', 'Bella', 'bing3716@yahoo.com.hk', 'SHOPLINE-0250', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-17 23:29:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0251', 'Eva', 'evawong@ymail.com', 'SHOPLINE-0251', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-17 21:12:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0252', 'id323623@yahoo.com.hk', 'id323623@yahoo.com.hk', 'SHOPLINE-0252', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-17 07:12:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0253', 'Maggie Ho', 'maggieho110@yahoo.com.hk', '96661002', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$779.30", "shopline_join_date": "2025-11-16 20:08:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96661002", "shopline_recipient_phone": "96661002"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0254', 'Shopline User 254', NULL, '96661002', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "96661002"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0255', 'LEE', 'msyison@gmail.com', 'SHOPLINE-0255', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-16 20:01:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0256', 'Renai', 'yeenam422@yahoo.com.hk', '60414422', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$428.90", "shopline_join_date": "2025-11-16 12:30:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60414422", "shopline_recipient_phone": "60414422"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0257', 'nganfonggg', 'nganfong20@gmail.com', 'SHOPLINE-0257', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-16 11:40:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0258', 'nganfonggg', 'ngabfong20@gmail.com', 'SHOPLINE-0258', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-16 11:39:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0259', 'Angel Lo', 'victorangelcorner2004@yahoo.com.hk', 'SHOPLINE-0259', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-16 05:38:28", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0260', 'YANNY Chu', 'yannyyanny@hotmail.com', 'SHOPLINE-0260', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$469.00", "shopline_join_date": "2025-11-16 00:28:30", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0261', 'JOJOSO', 'star4makeup@gmail.com', 'SHOPLINE-0261', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-16 00:19:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0262', 'meko6789', 'meko1314@yahoo.com', '55981966', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$98.80", "shopline_join_date": "2025-11-15 21:02:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "55981966"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0263', 'pamepoon', 'pameytpoon@gmail.com', 'SHOPLINE-0263', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-15 18:23:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0264', 'catfan', 'catcat.fan@gmail.com', 'SHOPLINE-0264', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$995.54", "shopline_join_date": "2025-11-15 16:50:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0265', 'Laudorothy', 'laudorothy81@hotmail.com', '61806621', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$455.90", "shopline_join_date": "2025-11-15 09:42:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61806621", "shopline_recipient_phone": "61806621"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0266', 'Ken leung', 'kk1728r@yahoo.com.hk', 'SHOPLINE-0266', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$829.40", "shopline_join_date": "2025-11-15 09:07:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0267', 'William Yeung', 'williamywy.cjc@gmail.com', 'SHOPLINE-0267', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-14 22:13:28", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0268', 'jacksonyu35', 'jacksonyu35@hotmail.com', '64763535', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,443.98", "shopline_join_date": "2025-11-14 22:10:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64763535", "shopline_recipient_phone": "64763535"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0269', 'Venus Li', 'venus190@netvigator.com', 'SHOPLINE-0269', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$358.90", "shopline_join_date": "2025-11-14 13:22:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0270', 'Jenny Yip', 'jenclyip@yahoo.com', 'SHOPLINE-0270', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$365.20", "shopline_join_date": "2025-11-13 23:25:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0271', 'Christy810', 'lau_yuenshan@yahoo.com.hk', 'SHOPLINE-0271', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-13 20:50:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0272', '關生', 'sam52ann@gmail.com', 'SHOPLINE-0272', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$360.00", "shopline_join_date": "2025-11-13 12:31:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0273', 'ywkkkkk', 'wingkei467@gmail.com', '97410918', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$683.90", "shopline_join_date": "2025-11-13 09:11:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97410918", "shopline_recipient_phone": "97410918"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0274', 'yanice wan', 'yanicewan01@gmail.com', '96083395', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$567.80", "shopline_join_date": "2025-11-12 19:41:49", "shopline_email_promo": false, "shopline_fb_promo": true, "shopline_is_member": true, "shopline_contact_phone": "62926266", "shopline_recipient_phone": "62926266", "shopline_bound_phone": "96083395"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0275', 'Cherrie Yeung', 'cherrie.1210@yahoo.com.hk', 'SHOPLINE-0275', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-12 19:17:47", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0276', 'Amy Chan', 'cmy_amy@hotmail.com', 'SHOPLINE-0276', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$761.50", "shopline_join_date": "2025-11-12 12:45:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0277', 'Sharon', 'sharon1230_hk@yahoo.com.hk', 'SHOPLINE-0277', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-12 11:27:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0278', 'Tam Yee Ki', 'yeeki02114@yahoo.com', 'SHOPLINE-0278', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$374.40", "shopline_join_date": "2025-11-12 09:46:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0279', 'laiyusum', 'kevin.lai@hotmail.com', 'SHOPLINE-0279', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-11 22:34:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0280', 'ac.bills.inv', 'ac.bills.inv@gmail.com', 'SHOPLINE-0280', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-11 17:08:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0281', 'Jojodorothy', 'dorothy-lover@hotmail.com', '92533445', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$854.81", "shopline_join_date": "2025-11-11 12:03:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92533445", "shopline_recipient_phone": "92533445", "shopline_bound_phone": "92533445"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0282', 'Zerlina Cheung', 'zerlina668@yahoo.com.hk', 'SHOPLINE-0282', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-10 18:40:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0283', 'Miss Maggie', 'nipmaggie@hotmail.com', 'SHOPLINE-0283', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-10 14:42:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0284', 'Kate Cheng', 'katecheng2019@gmail.com', 'SHOPLINE-0284', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-09 21:34:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0285', 'Law', 'apple_233@hotmail.com', 'SHOPLINE-0285', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.60", "shopline_join_date": "2025-11-09 21:13:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0286', 'Mok wang hin', 'benmokssb@gmail.com', 'SHOPLINE-0286', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$361.20", "shopline_join_date": "2025-11-09 03:55:18", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0287', 'Nicole', 'nicolelu@netvigator.com', 'SHOPLINE-0287', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$787.00", "shopline_join_date": "2025-11-09 00:20:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0288', 'Kwanlam042512', 'kwanlam042512@gmail.com', 'SHOPLINE-0288', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-08 10:26:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0289', 'Momong', 'nghauyuen@hotmail.com', '65733554', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$697.10", "shopline_join_date": "2025-11-07 08:40:55", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65733554", "shopline_recipient_phone": "65733554"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0290', 'Momong', 'nghauyuen@hitmail.com', 'SHOPLINE-0290', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-07 08:38:50", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0291', 'Chan kwan ling', 'cherry1114hk@gmail.com', 'SHOPLINE-0291', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-06 22:28:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0292', 'Poon pui ling', 'plpoon@hotmail.com', 'SHOPLINE-0292', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-06 17:42:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0293', 'Fanny Cheung', 'fannycfcheung@yahoo.com.hk', 'SHOPLINE-0293', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-05 13:34:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0294', 'kat727', 'katfin727@gmail.com', '67796341', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,151.57", "shopline_join_date": "2025-11-04 13:36:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67796341", "shopline_recipient_phone": "67796341"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0295', 'tracici', 'tracici@gmail.com', '67638990', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$412.40", "shopline_join_date": "2025-11-04 01:02:46", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67638990", "shopline_recipient_phone": "67638990"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0296', 'Zoewong626', 'zoe.wong626@gmail.com', '52224775', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,171.25", "shopline_join_date": "2025-11-03 13:14:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "52224775", "shopline_recipient_phone": "52224775", "shopline_bound_phone": "52224775"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0297', 'Ivy Chan', 'ivychan512@hotmail.com', '93099269', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$359.20", "shopline_join_date": "2025-11-03 11:39:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93099269", "shopline_recipient_phone": "93099269"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0298', 'Wendy', 'wendy.wy.wong@gmail.com', 'SHOPLINE-0298', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-02 16:57:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0299', 'Yuchi', 'yuchicheung@gmail.com', 'SHOPLINE-0299', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-02 12:36:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0300', 'Linda Chung', 'dadaz29839669@gmail.com', 'SHOPLINE-0300', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-02 00:28:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0301', '螞蟻cheung', 'maykenneth511_biz@yahoo.com.hk', 'SHOPLINE-0301', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$810.90", "shopline_join_date": "2025-11-01 22:04:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0302', 'BChan', 'belindahaha@yahoo.com.hk', 'SHOPLINE-0302', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-01 15:53:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0303', '13691925km', 'kiang7475@yahoo.com.hk', '92157110', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,449.46", "shopline_join_date": "2025-11-01 14:43:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92157110", "shopline_recipient_phone": "92157110"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0304', 'Donut', 'donut.kinder@gmail.com', 'SHOPLINE-0304', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-11-01 11:46:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0305', 'Kelly Choi', 'choikayeekelly@gmail.com', 'SHOPLINE-0305', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-31 22:56:51", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0306', 'Nana', 'huangxiaona860821@gmail.com', '67615500', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$2,494.99", "shopline_join_date": "2025-10-31 10:31:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67615500", "shopline_recipient_phone": "67615500"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0307', 'anna chiu', 'annaxchiu0102@gmail.com', 'SHOPLINE-0307', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-30 18:57:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0308', 'Lai han', 'laihan0819@gmail.com', 'SHOPLINE-0308', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-30 10:13:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0309', 'Fion Cheung', 'fioncheung438@gmail.com', 'SHOPLINE-0309', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-28 18:13:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0310', 'Queenie Cheung', 'lovequeenie720@hotmail.com', 'SHOPLINE-0310', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-28 08:35:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0311', 'Yo Yo Lam', 'yoyolam76@gmail.com', 'SHOPLINE-0311', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$393.30", "shopline_join_date": "2025-10-28 07:50:07", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0312', 'wing sze', 'sze0120@yahoo.com.hk', 'SHOPLINE-0312', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-27 19:22:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0313', 'Dewen ma', 'dewenbeauty@yahool.com.hk', 'SHOPLINE-0313', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.80", "shopline_join_date": "2025-10-27 18:44:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0314', 'anjaychan', 'anjaychan@gmail.com', '51690234', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$717.20", "shopline_join_date": "2025-10-27 13:17:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "51690234", "shopline_recipient_phone": "51690234"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0315', 'Wing NG', 'n_nkawing@yahoo.com.hk', '60108956', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-26 23:13:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "60108956"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0316', 'Sammi lee', 'sammiangelds2205@gmail.com', 'SHOPLINE-0316', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-26 23:10:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0317', 'Ying Ki Tang', 'petertang520778@gmail.com', 'SHOPLINE-0317', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-26 18:56:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0318', 'Veronica Wong', 'veronicawcw@gmail.com', '92378194', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$888.30", "shopline_join_date": "2025-10-26 16:35:53", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92378194", "shopline_recipient_phone": "92378194"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0319', 'howard', 'yumanpoon14022000@gmail.com', 'SHOPLINE-0319', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-26 12:26:43", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0320', 'Siu Winghung', 'hung0623@yahoo.com.hk', 'SHOPLINE-0320', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-25 09:14:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0321', 'ivykinder', 'ivykinder@yahoo.com.hk', 'SHOPLINE-0321', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-25 00:56:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0322', 'coco1001', 'hanghang726@yahoo.com.hk', 'SHOPLINE-0322', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-25 00:00:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0323', 'Carmen Au', 'carmen_rabbit@hotmail.com', 'SHOPLINE-0323', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-24 10:49:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0324', 'boscolau6260221', 'boscolau6260221@gmail.com', 'SHOPLINE-0324', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-24 10:25:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0325', 'wing', 'wingyip668@yahoo.com.hk', 'SHOPLINE-0325', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-23 08:08:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0326', 'Dindin', 'apple425.aa@gmail.com', '92215885', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.96", "shopline_join_date": "2025-10-22 23:05:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92215885", "shopline_recipient_phone": "92215885"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0327', 'cron', 'matthewai1125@gmail.com', 'SHOPLINE-0327', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-22 19:28:59", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0328', 'Cherry Tse', 'oifong_tse@yahoo.com.hk', 'SHOPLINE-0328', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-22 13:39:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0329', 'Jacky', 'hinghing890@gmail.com', 'SHOPLINE-0329', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-22 03:32:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0330', 'Tirzah Sun', 'yatkeisun2@gmail.com', 'SHOPLINE-0330', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$374.20", "shopline_join_date": "2025-10-22 00:42:08", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0331', 'chiangmanting', 'chiangmanting@gmail.com', '91646489', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,545.93", "shopline_join_date": "2025-10-21 16:24:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91646489", "shopline_recipient_phone": "91646489"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0332', 'JoannaLam', 'atta168@yahoo.com.hk', 'SHOPLINE-0332', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$357.60", "shopline_join_date": "2025-10-21 14:26:46", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0333', 'cheng May', 'maycheng116@yahoo.com.hk', 'SHOPLINE-0333', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-21 09:43:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0334', 'Faye ma', 'icemafei@gmail.com', 'SHOPLINE-0334', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$104.50", "shopline_join_date": "2025-10-20 20:52:34", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0335', 'Athena', 'nanalam18@gmail.com', 'SHOPLINE-0335', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.70", "shopline_join_date": "2025-10-20 17:49:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0336', 'Ivy', 'bb_211@yahoo.com.hk', 'SHOPLINE-0336', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-20 15:45:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0337', 'teko chan', 'teko@live.hk', '84033751', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,222.10", "shopline_join_date": "2025-10-20 13:19:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "84033751", "shopline_recipient_phone": "84033751"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0338', 'Linda Ng', 'yuenkwanng1003@gmail.com', 'SHOPLINE-0338', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-20 06:21:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0339', 'janet2307', 'netnet2307@gmail.com', 'SHOPLINE-0339', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-19 17:18:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0340', 'Leo Lee', 'leolee3110@gmail.com', '96690169', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$610.30", "shopline_join_date": "2025-10-18 17:00:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96690169", "shopline_recipient_phone": "96690169"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0341', 'Yim Yi Fung', 'fungyimyi@gmail.com', 'SHOPLINE-0341', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$158.84", "shopline_join_date": "2025-10-18 12:04:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0342', 'Ng Mon', 'yuki_215130@yahoo.com.hk', 'SHOPLINE-0342', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-17 12:48:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0343', 'Coco chung', 'cowboybbg@hotmail.com', 'SHOPLINE-0343', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-16 17:37:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0344', 'Tom Cheung', 'tom_cheung0426@yahoo.com.hk', 'SHOPLINE-0344', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$436.10", "shopline_join_date": "2025-10-16 17:31:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0345', 'Pancil', 'ying012002@yahoo.com.hk', 'SHOPLINE-0345', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$127.30", "shopline_join_date": "2025-10-16 13:41:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0346', 'yenlau', 'yenlau76@yahoo.com.hk', '61280122', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-16 08:26:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61280122", "shopline_recipient_phone": "61280122", "shopline_bound_phone": "61280122"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0347', 'Yanhilda', 'yanhilda@gmail.com', '69003269', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-16 05:42:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "69003269"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0348', 'Ms Chan', 'chn102040@gmail.com', '66059823', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$373.64", "shopline_join_date": "2025-10-15 18:14:02", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66059823", "shopline_recipient_phone": "66059823"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0349', 'Polly', 'seesee3388@yahoo.com.hk', 'SHOPLINE-0349', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$414.80", "shopline_join_date": "2025-10-15 15:19:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0350', 'YUMI WU', 'kinki908@gmail.com', 'SHOPLINE-0350', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-15 09:46:51", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0351', 'Kiu', 'crystalckkwan@gmail.com', '66269997', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,103.85", "shopline_join_date": "2025-10-15 01:34:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66269997", "shopline_recipient_phone": "66269997"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0352', 'Sze Yan', 'yan60931724@gmail.com', '60931724', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$359.48", "shopline_join_date": "2025-10-14 20:36:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60931724", "shopline_recipient_phone": "60931724"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0353', 'Shopline User 353', NULL, '60931724', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "60931724"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0354', 'Dhin', 'hojoantinghin@gmail.com', '91929503', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-14 20:34:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91929503", "shopline_recipient_phone": "91929503", "shopline_bound_phone": "91929503"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0355', 'Shopline User 355', NULL, '91929503', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "91929503"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0356', 'Miki Jan', 'mikijwy@gmail.com', 'SHOPLINE-0356', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$383.00", "shopline_join_date": "2025-10-14 20:28:24", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0357', 'Una Suen', 'kunalaboa@yahoo.com.hk', 'SHOPLINE-0357', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-14 10:56:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0358', 'Lokamha', 'lokamha9135@gmail.com', '98725985', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,266.94", "shopline_join_date": "2025-10-14 09:01:11", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98725985", "shopline_recipient_phone": "98725985", "shopline_bound_phone": "98725985"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0359', 'Tracy', 'tracycheung5260@gmail.com', 'SHOPLINE-0359', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-12 23:08:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0360', 'Adachau', 'adapingping@hotmail.com', 'SHOPLINE-0360', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-12 09:37:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0361', 'wilsontam', 'vp10wilsontam@hotmail.com', '98010292', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$886.70", "shopline_join_date": "2025-10-10 17:14:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98010292", "shopline_recipient_phone": "98010292"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0362', 'hn220222', 'pkxyz1@hotmail.com', '91640099', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$455.30", "shopline_join_date": "2025-10-10 17:10:26", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91640099", "shopline_recipient_phone": "91640099", "shopline_bound_phone": "91640099"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0363', 'aiko chow', 'aikoljcau@yahoo.com.hk', '98236721', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$370.60", "shopline_join_date": "2025-10-09 15:44:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98236721", "shopline_recipient_phone": "98236721"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0364', 'nanacheng0711', 'nanacheng0711@gmail.com', 'SHOPLINE-0364', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-08 23:50:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0365', 'Vikki', 'sung_vikki@yahoo.com.hk', 'SHOPLINE-0365', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-07 11:18:41", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0366', 'Zyx521', 'cecilawcwa@gmail.com', 'SHOPLINE-0366', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-05 00:41:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0367', 'jacky Wong', 'jacky165165@gmail.com', 'SHOPLINE-0367', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$370.20", "shopline_join_date": "2025-10-03 00:05:39", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0368', 'AhLai', 'bennylinhk@gmail.com', '60136845', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-10-02 16:38:55", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "60136845"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0369', 'Nana', 'shanyeung85@gmail.com', 'SHOPLINE-0369', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$418.00", "shopline_join_date": "2025-10-01 03:31:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0370', 'Chelsea', 'chowfan75@gmail.com', '53987159', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-30 00:53:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53987159", "shopline_recipient_phone": "53987159", "shopline_bound_phone": "53987159"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0371', '趙玉明', 'mungchiu8066@gmail.com', 'SHOPLINE-0371', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$431.40", "shopline_join_date": "2025-09-29 23:25:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0372', 'Candy Chow', 'cc_fy@yahoo.com.hk', '91769777', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$745.48", "shopline_join_date": "2025-09-29 12:28:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91769777", "shopline_recipient_phone": "91769777"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0373', 'tchfran', 'tchfran@yahoo.com.hk', '96572886', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,328.40", "shopline_join_date": "2025-09-28 17:09:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96572886", "shopline_recipient_phone": "96572886", "shopline_bound_phone": "96572886"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0374', 'Shopline User 374', NULL, '96572886', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "96572886"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0375', 'lwsliu', 'lwsliu@yahoo.com.hk', 'SHOPLINE-0375', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-27 16:54:47", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0376', 'Annie chan', 'anniechan426438@gmail.com', 'SHOPLINE-0376', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$181.30", "shopline_join_date": "2025-09-27 15:20:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0377', 'Tracy Wong', 'pwwong197339@gmail.com', 'SHOPLINE-0377', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-27 12:11:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0378', '蔡太', 'yilamcheung@hotmail.com', 'SHOPLINE-0378', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,180.70", "shopline_join_date": "2025-09-27 10:26:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0379', 'yaiko yip', 'yaiyip@yahoo.com.hk', 'SHOPLINE-0379', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-27 02:26:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0380', 'fp3628', 'fp3628@yahoo.com.hk', 'SHOPLINE-0380', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-26 13:21:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0381', 'unaleung1224', 'kikileung2002@gmail.com', '92310028', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$444.30", "shopline_join_date": "2025-09-26 09:39:51", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92310028"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0382', 'Annie ch6', 'anniechan426438@gmail.coma', 'SHOPLINE-0382', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$375.20", "shopline_join_date": "2025-09-26 07:58:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0383', 'jane', 'jane.hclau@hotmail.com', 'SHOPLINE-0383', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-25 10:58:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0384', 'Bonnie 張', '86899874@qq.com', 'SHOPLINE-0384', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-25 00:50:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0385', 'Ceci', 'bb268bb@gmail.com', 'SHOPLINE-0385', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-24 17:04:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0386', 'Connie', 'kwanngayee@gmail.com', 'SHOPLINE-0386', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-24 14:42:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0387', 'Patrick Au', 'patrickaaau@gmail.com', 'SHOPLINE-0387', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-24 12:59:28", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0388', 'mrs chan', 'siubo16@yahoo.com', '98488058', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-24 12:23:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "98488058"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0389', '倩兒', 'rubysin551990@gmail.com', 'SHOPLINE-0389', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-23 22:48:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0390', 'Nickyworks', 'nickyworks2016@gmail.com', 'SHOPLINE-0390', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-23 20:34:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0391', 'minki', 'minkey_ho@yahoo.com.hk', 'SHOPLINE-0391', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-23 20:34:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0392', '68989348', 'krsspe2006@yahoo.com.hk', 'SHOPLINE-0392', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$365.20", "shopline_join_date": "2025-09-23 03:04:50", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0393', 'Anna', 'yangfuruo@gmail.com', '46408617', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$779.30", "shopline_join_date": "2025-09-22 16:02:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "46408617", "shopline_recipient_phone": "46408617"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0394', 'Magicbaby', 'magic_kwok2002@yahoo.com.hk', 'SHOPLINE-0394', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-22 12:47:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0395', 'Polly chau', 'ch75fan@yahoo.com.hk', 'SHOPLINE-0395', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-22 12:45:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0396', 'Jan choi', 'lei_lei_tsai@hotmail.com', 'SHOPLINE-0396', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$381.70", "shopline_join_date": "2025-09-21 23:01:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0397', 'Cathleen Yip', 'cathleen_yip@yahoo.com.hk', 'SHOPLINE-0397', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-21 11:09:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0398', 'Bolo', 'lobozical@gmail.com', 'SHOPLINE-0398', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-20 21:09:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0399', 'chankinki0417@gmail.com', 'chankinki0417@gmail.com', 'SHOPLINE-0399', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-20 19:17:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0400', 'Lam wan sin', 'winsylamws@gmail.com', 'SHOPLINE-0400', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$454.30", "shopline_join_date": "2025-09-20 13:56:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0401', 'Cindy Man', 'cindyman83@gmail.com', 'SHOPLINE-0401', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-20 05:46:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0402', 'Linzleetpe', 'linzleetpe@gmail.com', '56820601', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$738.60", "shopline_join_date": "2025-09-19 20:36:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "56820601", "shopline_recipient_phone": "56820601"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0403', 'Wong', 'magwongg@gamil.com', 'SHOPLINE-0403', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$361.30", "shopline_join_date": "2025-09-19 19:22:56", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0404', 'winnieyim341@yahoo.com.hk', 'winnieyim341@yahoo.com.hk', 'SHOPLINE-0404', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-19 16:38:11", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0405', 'Gaby0829', 'huifeifei38@yahoo.com', 'SHOPLINE-0405', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-18 21:37:20", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0406', 'Pollypang', 'tko1038h@yahoo.com.hk', 'SHOPLINE-0406', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-17 21:57:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0407', '劉丁丁', 'bow4794@gmail.com', '94793935', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-17 21:48:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94793935", "shopline_recipient_phone": "94793935", "shopline_bound_phone": "94793935"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0408', 'Ariesgrace', 'ariesgracechan@yahoo.com.hk', '62796360', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$471.39", "shopline_join_date": "2025-09-16 23:39:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62796360", "shopline_recipient_phone": "62796360"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0409', 'joyce', 'joyce3328@yahoo.com.hk', 'SHOPLINE-0409', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-16 17:49:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0410', 'Lee', 'sambylee@gmail.com', '57672134', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$360.52", "shopline_join_date": "2025-09-16 11:34:33", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "57672134", "shopline_recipient_phone": "57672134"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0411', 'mani123', 'manwai_54@hotmail.com', '90874557', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.24", "shopline_join_date": "2025-09-16 09:33:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90874557", "shopline_recipient_phone": "90874557"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0412', 'Siu', 'manmansiu1125@gmail.com', 'SHOPLINE-0412', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-15 23:45:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0413', '袁袁', 'y18565747208@icloud.com', 'SHOPLINE-0413', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-15 22:59:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0414', 'Ivy Tai', 'direct_ivy@yahoo.com.hk', 'SHOPLINE-0414', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-15 15:18:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0415', 'Rita Lam', 'chuichuilam@hotmail.com', 'SHOPLINE-0415', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$359.70", "shopline_join_date": "2025-09-14 23:31:55", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0416', 'Bruceck', 'bruceck@yahoo.com', '98135254', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$468.60", "shopline_join_date": "2025-09-14 21:59:46", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98135254", "shopline_recipient_phone": "98135254"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0417', 'Cat Ng', 'catng911@gmail.com', '98234492', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "9", "shopline_spend": "HK$3,870.23", "shopline_join_date": "2025-09-14 20:51:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98234492", "shopline_recipient_phone": "98234492"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0418', 'Poyanlam', 'poyanlam@gmail.com', 'SHOPLINE-0418', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-14 18:29:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0419', 'Kit201997', 'yck_michael@hotmail.com', '61725859', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,160.27", "shopline_join_date": "2025-09-14 14:44:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61725859"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0420', 'Maggie', 'hl_yip@yahoo.com.hk', 'SHOPLINE-0420', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-14 13:41:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0421', 'cherryto0722', 'cherryto0722@gmail.com', 'SHOPLINE-0421', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-14 04:06:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0422', 'freddywong', 'freddywks@gmail.com', '96698300', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,916.70", "shopline_join_date": "2025-09-13 21:41:32", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96698300", "shopline_recipient_phone": "96698300"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0423', 'Cammy Wong', 'cammy_cw@yahoo.com.hk', '61120749', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$449.20", "shopline_join_date": "2025-09-13 14:19:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61120749", "shopline_recipient_phone": "61120749"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0424', 'Joan Fung', 'joanfunglai@yahoo.com.hk', 'SHOPLINE-0424', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-12 23:10:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0425', 'Lisa', 'lleung.lisa@gmail.com', '93103947', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,470.00", "shopline_join_date": "2025-09-12 19:14:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93103947", "shopline_recipient_phone": "93103947"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0426', 'Shopline User 426', NULL, '93103947', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "93103947"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0427', 'CAROL', 'mama.ganda901@gmail.com', '56895407', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,641.60", "shopline_join_date": "2025-09-12 07:26:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "56895407", "shopline_recipient_phone": "56895407"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0428', 'Ling xu', 'xu.wanling@icloud.com', 'SHOPLINE-0428', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-11 23:11:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0429', 'Zoe', 'wan12212003@yahoo.com.hk', '92150547', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$716.49", "shopline_join_date": "2025-09-11 22:17:26", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92150547", "shopline_recipient_phone": "92150547"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0430', 'Siumui', 'tracy624810@gmail.com', '66801228', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.30", "shopline_join_date": "2025-09-11 13:55:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66801228"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0431', '潤生 王', 'yswong0809@gmail.com', '55379194', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,308.50", "shopline_join_date": "2025-09-11 07:12:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "55379194", "shopline_recipient_phone": "55379194"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0432', 'TOTOA LAU', 'florance_toa@yahoo.com.hk', '92034914', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$839.20", "shopline_join_date": "2025-09-10 22:25:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92034914", "shopline_recipient_phone": "92034914", "shopline_bound_phone": "92034914"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0433', 'Koobie Cheng', 'm04134891@yahoo.com.hk', 'SHOPLINE-0433', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-10 21:05:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0434', '9710 4554', 'letty.pyne@gmail.com', '97104554', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$446.60", "shopline_join_date": "2025-09-10 18:56:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97104554", "shopline_recipient_phone": "97104554", "shopline_bound_phone": "97104554"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0435', 'Wai', 'wai480012@gmail.com', 'SHOPLINE-0435', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$446.80", "shopline_join_date": "2025-09-10 13:35:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0436', 'Peggy', 'peggy_leungks@yahoo.com.hk', '91661021', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-10 12:03:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91661021", "shopline_bound_phone": "91661021"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0437', '王小姐', 'lingwong148@yahoo.com.hk', '91209298', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$364.80", "shopline_join_date": "2025-09-09 23:54:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91209298", "shopline_recipient_phone": "91209298"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0438', 'Kelvin', 'kelyhy@hotmail.com', 'SHOPLINE-0438', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.10", "shopline_join_date": "2025-09-09 23:49:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0439', 'kaming0916', 'daniel_93_2005@yahoo.com.hk', '98796122', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$368.60", "shopline_join_date": "2025-09-09 15:08:39", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98796122"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0440', 'Crystal Yiu', 'yuyu_crystal@hotmail.com', '98063292', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$721.24", "shopline_join_date": "2025-09-08 22:43:05", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98063292", "shopline_recipient_phone": "98063292"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0441', 'Ice He', 'ice34223168@qq.com', 'SHOPLINE-0441', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-08 22:24:10", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0442', 'Ivman Ng', 'wetwet8899@yahoo.com.hk', 'SHOPLINE-0442', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-08 20:16:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0443', 'masukkuen', 'sukkuen_ma@yahoo.com.hk', '96228320', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$797.40", "shopline_join_date": "2025-09-08 10:43:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96228320", "shopline_recipient_phone": "96228320"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0444', 'Mattsonhk', 'alexaykm@yahoo.com', '53138790', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "7", "shopline_spend": "HK$3,414.66", "shopline_join_date": "2025-09-07 12:40:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53138790", "shopline_recipient_phone": "53138790"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0445', 'Mic', 'micmic40@hotmail.com', 'SHOPLINE-0445', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-07 10:19:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0446', 'M.choi', 'mailyng1010@gmail.com', 'SHOPLINE-0446', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-07 09:10:51", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0447', 'Fung yiyi', 'angelfunghk3@gmail.com', 'SHOPLINE-0447', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-07 08:23:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0448', 'Yanneslau', 'lau.yannes@gmail.com', '64729873', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$387.10", "shopline_join_date": "2025-09-07 03:47:57", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64729873", "shopline_recipient_phone": "64729873"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0449', 'Jenny', 'passjenny@yahoo.com.hk', 'SHOPLINE-0449', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-06 13:29:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0450', 'King', 'ivalo73@yahoo.com.hk', 'SHOPLINE-0450', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-06 07:30:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0451', 'Chanchan', 'ylpaman224@gmail.com', 'SHOPLINE-0451', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-06 01:05:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0452', 'MercyS', 'mercyshing@yahoo.com.hk', 'SHOPLINE-0452', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 22:06:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0453', 'cancy tam', 'cancy0708@yahoo.com.hk', 'SHOPLINE-0453', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 17:34:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0454', '冼英', 'sinsiuying@hotmail.com', 'SHOPLINE-0454', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 16:10:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0455', 'terrysy2002', 'terrysy2002@gmail.com', 'SHOPLINE-0455', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 12:42:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0456', 'Charlotte mok', 'mokshuk1031@gmail.com', 'SHOPLINE-0456', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$352.70", "shopline_join_date": "2025-09-05 11:41:53", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0457', 'Zach', 'c98279607@gmail.com', 'SHOPLINE-0457', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 11:24:51", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0458', 'Jamesho', 'balloonnho1105@gmail.com', 'SHOPLINE-0458', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-05 01:41:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0459', '任太', 'edwinayam2022@gmail.com', '91013370', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,521.34", "shopline_join_date": "2025-09-04 08:25:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91013370"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0460', 'EddieTam', 'eddietamwc@yahoo.com.hk', 'SHOPLINE-0460', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-03 13:31:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0461', 'Ngan Chi Pui', 'laam822@gmail.com', 'SHOPLINE-0461', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-02 20:11:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0462', 'Kat', 'shan_yws@yahoo.com.hk', 'SHOPLINE-0462', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-02 17:45:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0463', 'MAN', 'kwokman198812@gmail.com', 'SHOPLINE-0463', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-02 07:36:01", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0464', 'Ling Sin', 'ling11197000@yahoo.com.hk', 'SHOPLINE-0464', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-01 20:55:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0465', 'Daisy Wong', 'siudayhaha@gmail.com', '63366927', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$363.38", "shopline_join_date": "2025-09-01 20:24:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63366927", "shopline_recipient_phone": "63366927"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0466', 'Daphne', 'daphne2344@gmail.com', 'SHOPLINE-0466', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-09-01 15:32:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0467', 'May', 'maykwan123@yahoo.com.hk', '56194735', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-30 17:40:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "56194735", "shopline_recipient_phone": "56194735", "shopline_bound_phone": "56194735"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0468', '曾靜霞', 'sylphytsang@gmail.com', 'SHOPLINE-0468', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-30 12:18:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0469', 'peter Lam', 'lamshuwing10@gmail.om', 'SHOPLINE-0469', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-30 04:43:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0470', 'Jason', 'jasonfkw@yahoo.com.hk', 'SHOPLINE-0470', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-29 20:38:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0471', 'Tsang', 'waifong2211@gmail.com', 'SHOPLINE-0471', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-29 16:09:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0472', 'Daisy', 'daisysusanyy11@hotmail.com', 'SHOPLINE-0472', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-28 23:32:25", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0473', 'Alen mo', 'alenmo@gmail.com', 'SHOPLINE-0473', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$382.00", "shopline_join_date": "2025-08-28 16:36:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0474', 'Angelcps', 'angelpschan@yahoo.com.hk', 'SHOPLINE-0474', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-27 19:20:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0475', 'Carrie Leung', 'carrieleung9215@gmail.com', '94009215', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$435.00", "shopline_join_date": "2025-08-27 13:18:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94009215"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0476', 'Kazufumi Onishi', 'kmwa20042000@gmail.com', 'SHOPLINE-0476', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$624.40", "shopline_join_date": "2025-08-27 13:17:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0477', 'ngoyi0617', 'ngoyi0617@gmail.com', '53456087', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,621.50", "shopline_join_date": "2025-08-27 12:12:18", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53456087", "shopline_recipient_phone": "53456087"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0478', 'sineresa', 'sineresa@yahoo.com.hk', '97760601', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,044.62", "shopline_join_date": "2025-08-26 23:10:59", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97760601"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0479', 'Queenieleung', 'cming_leung@yahoo.com.hk', 'SHOPLINE-0479', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 18:38:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0480', 'Wing', 'dawingtcw@gmail.com', '61872555', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,111.10", "shopline_join_date": "2025-08-26 17:33:26", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "61872555", "shopline_bound_phone": "61872555"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0481', 'ypsw', 'winnie_yim_ps@yahoo.com.hk', '95726457', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$970.40", "shopline_join_date": "2025-08-26 15:10:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95726457", "shopline_recipient_phone": "95726457"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0482', 'Bunnybady', 'bunnybady@hotmail.com', 'SHOPLINE-0482', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 13:06:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0483', 'Oliwu', 'yuching49@gmail.com', '54068985', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$743.66", "shopline_join_date": "2025-08-26 12:39:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "54068985", "shopline_recipient_phone": "54068985"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0484', 'Funky wong', 'funky.bubu@yahoo.com.hk', 'SHOPLINE-0484', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 08:46:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0485', 'Cheung', 'okll000@yahoo.com.hk', 'SHOPLINE-0485', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 05:40:39", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0486', 'Maggie Chan', 'maggie.cws@gmail.com', 'SHOPLINE-0486', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 03:24:33", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0487', 'Tsz ying Chau', 'yingjai0722@gmail.com', 'SHOPLINE-0487', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-26 00:04:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0488', 'candyreporter', 'candyreporter@yahoo.com.hk', '65946616', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$773.21", "shopline_join_date": "2025-08-25 23:16:57", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65946616", "shopline_recipient_phone": "65946616"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0489', 'FH', 'febia.home@gmail.com', 'SHOPLINE-0489', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-25 20:03:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0490', 'Joanne', 'lcp8459@gmail.com', 'SHOPLINE-0490', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-25 18:05:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0491', 'Viann ma', 'viannma116@gmail.com', '98137383', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$776.67", "shopline_join_date": "2025-08-25 15:49:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98137383", "shopline_recipient_phone": "98137383", "shopline_bound_phone": "98137383"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0492', '蘇', 'ben6661333@gmail.com', '63029580', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$367.80", "shopline_join_date": "2025-08-24 14:38:50", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63029580", "shopline_recipient_phone": "63029580", "shopline_bound_phone": "63029580"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0493', 'Shopline User 493', NULL, '63026580', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "63026580"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0494', 'Viniayoung', 'viniayoung@gmail.com', '54825760', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$366.40", "shopline_join_date": "2025-08-24 12:24:29", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "54825760", "shopline_recipient_phone": "54825760"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0495', 'Carmen Fung', 'ayumi4301983@gmail.com', 'SHOPLINE-0495', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.70", "shopline_join_date": "2025-08-23 14:10:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0496', 'Ricky Hau', 'rickyhau118@gmail.com', 'SHOPLINE-0496', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-23 10:28:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0497', 'Grace Cheng', 'soulmei@gmail.com', 'SHOPLINE-0497', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.90", "shopline_join_date": "2025-08-23 07:15:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0498', 'Karmen', 'karmen@hotmail.com.hk', 'SHOPLINE-0498', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.40", "shopline_join_date": "2025-08-23 02:26:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0499', '林宇鋒', 'hkotck@yahoo.com.hk', '63483902', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-22 21:48:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63483902", "shopline_recipient_phone": "63483902", "shopline_bound_phone": "63483902"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0500', 'mi mi', 'mimipig2013@yahoo.com.hk', 'SHOPLINE-0500', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-22 12:42:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0501', 'Miss Siu', 'temple_cute@yahoo.com.hk', 'SHOPLINE-0501', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-22 12:23:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0502', 'kam', 'rainready@gmail.com', 'SHOPLINE-0502', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-22 11:03:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0503', 'Angel', 'yukeeangel@gmail.com', 'SHOPLINE-0503', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-22 10:57:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0504', 'Lau2ve', 'lau2eve@gmail.com', '68485058', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$613.70", "shopline_join_date": "2025-08-21 22:33:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "68485058", "shopline_recipient_phone": "68485058"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0505', 'Lau2ve', 'lau2eve@hotmail.com', 'SHOPLINE-0505', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-21 22:32:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0506', 'Sara Hui', 'sunnysara628@gmail.com', 'SHOPLINE-0506', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$429.90", "shopline_join_date": "2025-08-21 14:56:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0507', 'MissLK', 'icq3hk88@gmail.com', 'SHOPLINE-0507', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-21 12:59:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0508', 'hunghung727', 'kwokkwok2005h@yahoo.com.hk', 'SHOPLINE-0508', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-21 12:05:36", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0509', 'Alex wai', 'alexwai2028@gmail.com', '62191288', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-21 10:25:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62191288", "shopline_recipient_phone": "62191288", "shopline_bound_phone": "62191288"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0510', 'Yan', 'holam0910@yahoo.com.hk', '98646713', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "13", "shopline_spend": "HK$5,484.80", "shopline_join_date": "2025-08-21 06:42:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98646713", "shopline_recipient_phone": "98646713"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0511', 'angel chau', 'angelchau2000@gmail.com', 'SHOPLINE-0511', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$396.70", "shopline_join_date": "2025-08-21 00:29:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0512', 'HoAngel', 'hoangel830@gmail.com', '92857511', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$395.10", "shopline_join_date": "2025-08-20 22:19:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92857511", "shopline_recipient_phone": "92857511"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0513', 'lookling', 'lookling260@gmail.com', '64702183', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$1,880.34", "shopline_join_date": "2025-08-20 20:14:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64702183", "shopline_recipient_phone": "64702183", "shopline_bound_phone": "64702183"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0514', 'Shopline User 514', NULL, '64702183', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "64702183"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0515', 'Cynthia2025', 'cynthia@choei.com.hk', 'SHOPLINE-0515', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-20 14:49:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0516', '彭 sin ying', 'psynicko824@gmail.com', 'SHOPLINE-0516', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-20 14:14:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0517', 'Yau Ying Tung', 'meljiannn@gmail.com', '53686600', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$368.30", "shopline_join_date": "2025-08-20 09:46:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53686600", "shopline_recipient_phone": "53686600"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0518', 'Lily Lau', 'lilylau108@gmail.com', '60133108', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$393.30", "shopline_join_date": "2025-08-19 20:17:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60133108", "shopline_recipient_phone": "60133108"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0519', '蔡', 'ccsun910@yahoo.com', 'SHOPLINE-0519', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-19 18:14:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0520', 'hazelyi', 'chingyingo@yahoo.com.hk', '98588505', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "9", "shopline_spend": "HK$3,862.08", "shopline_join_date": "2025-08-19 08:43:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98588505", "shopline_recipient_phone": "98588505"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0521', 'Siu hon lam', 'siuhonlam@gmail.com', 'SHOPLINE-0521', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$374.70", "shopline_join_date": "2025-08-19 00:06:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0522', 'PanWan', 'jonathanwan914@gmail.com', '93509696', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,076.16", "shopline_join_date": "2025-08-18 23:11:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93509696", "shopline_recipient_phone": "93509696"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0523', 'KWANKEI LAM', 'kwankei00213@gmail.com', 'SHOPLINE-0523', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$468.90", "shopline_join_date": "2025-08-18 22:26:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0524', 'Berber4168', 'kinglaw4168@gmail.com', 'SHOPLINE-0524', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-18 20:43:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0525', 'Frankie Lai', 'laikaka0307@gmail.com', '61881829', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,120.36", "shopline_join_date": "2025-08-18 15:43:47", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61881829", "shopline_recipient_phone": "61881829"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0526', 'kari ming', 'kariming0401@gmail.com', 'SHOPLINE-0526', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-18 12:53:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0527', 'sorussell.s@gmail.com', 'qqqueenielaw0609@gmail.com', 'SHOPLINE-0527', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-18 09:17:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0528', 'Angel Chan', 'chan_kawan@yahoo.com.hk', 'SHOPLINE-0528', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-17 22:11:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0529', 'Wendy wong', 'wendywong3182000@gmail.com', 'SHOPLINE-0529', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-17 19:23:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0530', 'wing1992128', 'anguswong1992@gmail.com', 'SHOPLINE-0530', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-17 18:47:07", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0531', 'Veraliu', 'liukiki_la@yahoo.com.hk', 'SHOPLINE-0531', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-17 08:58:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0532', 'NG WAI TING', 'waingng@yahoo.com.hk', '65944550', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,372.04", "shopline_join_date": "2025-08-16 19:47:12", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65944550", "shopline_recipient_phone": "65944550"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0533', 'Jen tse', 'jenjentse@yahoo.com.hk', 'SHOPLINE-0533', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-15 21:56:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0534', 'stellayeelee', 'stellayeelee@yahoo.com.hk', 'SHOPLINE-0534', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-15 16:52:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0535', 'Ming Lam', 'lnmrowanna@yahoo.com.hk', 'SHOPLINE-0535', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-15 16:27:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0536', 'Vv', 'vvcmy@yahoo.com.hk', '96984891', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$572.38", "shopline_join_date": "2025-08-15 12:28:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96984891"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0537', 'Lilianwu922', 'wuyinkwanlilian@gmail.com', '64384400', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$433.10", "shopline_join_date": "2025-08-15 11:00:53", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64384400"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0538', 'Yanice yan', 'yaniceyan@gmail.com', 'SHOPLINE-0538', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-15 09:51:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0539', 'Ngkalok', 'ngkalokv@gmail.com', 'SHOPLINE-0539', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-15 04:31:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0540', 'Connie Kok', 'kokkwanyee@yahoo.com.hk', 'SHOPLINE-0540', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-14 19:11:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0541', 'Yuki Lee', 'leeyeukkee_yuki@yahoo.com.hk', 'SHOPLINE-0541', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-14 07:36:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0542', 'Belltingling', 'lingtingling@hotmail.com', 'SHOPLINE-0542', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-13 23:48:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0543', 'Candytong0110', 'candytong0110@gmail.com', 'SHOPLINE-0543', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-13 17:19:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0544', 'Firelunsee', 'g382818@yahoo.com.hk', '56836827', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$1,137.61", "shopline_join_date": "2025-08-13 10:28:28", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "56836827", "shopline_recipient_phone": "56836827"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0545', 'Carmen', 'ckml518@hotmail.com', 'SHOPLINE-0545', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-13 10:17:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0546', 'Icy ho', 'icyicy1117@gmail.com', 'SHOPLINE-0546', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-13 04:27:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0547', 'Wai', 'kingwai0827@hotmail.com', '96592755', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$415.75", "shopline_join_date": "2025-08-12 23:32:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96592755", "shopline_recipient_phone": "96592755"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0548', 'Lee', 'circlelee0727@gmail.com', '59305041', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$2,378.81", "shopline_join_date": "2025-08-12 19:41:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "59305041"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0549', 'YEUNG TSUN HIN', 'hinfive5000@gmail.com', '60729061', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$365.75", "shopline_join_date": "2025-08-11 17:31:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60729061", "shopline_recipient_phone": "60729061"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0550', 'Summer', 'sukitcn@gmail.com', 'SHOPLINE-0550', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-11 09:02:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0551', 'So wing', 'sowing11616@gmail.com', '68478454', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$552.80", "shopline_join_date": "2025-08-10 10:56:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "68478454", "shopline_recipient_phone": "68478454", "shopline_bound_phone": "68478454"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0552', 'Esther', 'estherng5@gmail.com', 'SHOPLINE-0552', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-10 00:06:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0553', 'vicky081992', 'vicky111453@yahoo.com', 'SHOPLINE-0553', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-09 13:40:52", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0554', 'Kado1234', 'hey_kago@yahoo.com.hk', '91777010', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "10", "shopline_spend": "HK$3,894.17", "shopline_join_date": "2025-08-09 11:09:52", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91777010", "shopline_recipient_phone": "91777010"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0555', 'Tang Yeeyee', 'moon_eee@hotmail.com', 'SHOPLINE-0555', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-08 03:47:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0556', 'Anya', 'onyi9114@yahoo.com.hk', '61109708', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.10", "shopline_join_date": "2025-08-08 03:02:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61109708", "shopline_recipient_phone": "61109708"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0557', 'Choifamily', 'woodcube@gmail.com', '61523363', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,707.26", "shopline_join_date": "2025-08-07 16:41:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61523363", "shopline_recipient_phone": "61523363"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0558', 'amychiu613', 'amyfeeling2000@yahoo.com.hk', 'SHOPLINE-0558', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-06 23:30:49", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0559', 'TangVen', 'tang.venessa@hotmail.com', 'SHOPLINE-0559', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-06 22:35:28", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0560', 'Arta', 'wetermelon.ming@gmail.com', 'SHOPLINE-0560', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-06 14:48:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0561', 'Kafanry0903', 'fatbee1995@gmail.com', 'SHOPLINE-0561', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-06 10:08:41", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0562', 'Jenny Lai', 'penny.liu.tech@gmail.com', '68751812', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,442.18", "shopline_join_date": "2025-08-06 00:19:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "68751812", "shopline_recipient_phone": "68751812"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0563', 'Shopline User 563', NULL, '68751812', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "68751812"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0564', 'Becky Chan', 'kaerucchichan@yahoo.com.hk', 'SHOPLINE-0564', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-05 22:27:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0565', 'Givy Cheng', 'givycheng@hotmail.com', '62568847', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$381.62", "shopline_join_date": "2025-08-05 18:06:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62568847", "shopline_recipient_phone": "62568847"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0566', 'Vibian91113', 'vivianyuenwl@gmail.com', '84900704', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$800.19", "shopline_join_date": "2025-08-05 17:05:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "84900704", "shopline_recipient_phone": "84900704"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0567', 'Yumi', 'kayu19king@yahoo.com.hk', '98163823', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,165.93", "shopline_join_date": "2025-08-05 16:53:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98163823", "shopline_recipient_phone": "98163823"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0568', 'Esther Ng', 'tissueyiu@gmail.com', '61002954', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$353.02", "shopline_join_date": "2025-08-05 16:05:05", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61002954", "shopline_recipient_phone": "61002954"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0569', 'Margaret', 'margaret_yim@hotmail.com', 'SHOPLINE-0569', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$418.00", "shopline_join_date": "2025-08-05 15:46:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0570', 'cheung', 'dc617hwcheung@gmail.com', 'SHOPLINE-0570', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$359.92", "shopline_join_date": "2025-08-05 15:22:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0571', 'V', 'iamvickylau0527@yahoo.com.hk', 'SHOPLINE-0571', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-05 15:04:43", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0572', 'fang', 'fookcheonghong@live.hk', '63726822', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,722.80", "shopline_join_date": "2025-08-05 14:32:33", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63726822", "shopline_recipient_phone": "63726822"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0573', 'ming1005', 'mingming1005@hotmail.com', '60429838', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$353.21", "shopline_join_date": "2025-08-05 11:31:52", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60429838", "shopline_recipient_phone": "60429838"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0574', 'Tammy tsang', 'kafi823@yahoo.com.hk', 'SHOPLINE-0574', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-05 05:22:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0575', 'Ahpun', 'emmywong219@gmail.com', '62807101', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$391.68", "shopline_join_date": "2025-08-05 05:19:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62807101", "shopline_recipient_phone": "62807101"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0576', 'woyeching', 'yc9377@yahoo.com.hk', 'SHOPLINE-0576', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-04 22:55:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0577', 'Mandy Yam', 'hitomimiuco@gmail.com', 'SHOPLINE-0577', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-04 18:58:32", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0578', 'Nesta au yeung', 'nestaauyeung@yahoo.com.hk', 'SHOPLINE-0578', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-04 17:26:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0579', 'Ice', 'cheukhiuying114@gmail.com', 'SHOPLINE-0579', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-04 07:43:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0580', 'Maggie Fong', 'maggiefong2471@yahoo.com.hk', '51267414', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$375.50", "shopline_join_date": "2025-08-03 22:42:15", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "51267414", "shopline_recipient_phone": "51267414"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0581', 'Yan cheung', 'cwy060821@gmail.com', 'SHOPLINE-0581', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-03 21:28:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0582', 'Daniel', 'hungyanchak@gmail.com', 'SHOPLINE-0582', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$380.80", "shopline_join_date": "2025-08-03 13:36:05", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0583', 'Wing hang Wong', 'sukiweh1213@gmail.com', 'SHOPLINE-0583', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-02 22:18:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0584', 'Cphjoanne', 'cph0727@yahoo.com.hk', '91226297', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,123.20", "shopline_join_date": "2025-08-02 21:43:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91226297", "shopline_recipient_phone": "91226297"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0585', 'Kk907', 'kan.siuwan@gmail.com', '96297823', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$413.90", "shopline_join_date": "2025-08-02 13:40:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96297823", "shopline_recipient_phone": "96297823"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0586', 'shuyi1668@gmail.com', 'shuyi1668@gmail.com', '93091417', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.39", "shopline_join_date": "2025-08-02 13:04:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93091417", "shopline_recipient_phone": "93091417"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0587', 'Carol Fan', 'carolmon0104@gmail.com', '97300425', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-02 10:20:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97300425", "shopline_bound_phone": "97300425"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0588', 'Michelle Chan', 'yeeching_hk@yahoo.com.hk', 'SHOPLINE-0588', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-02 07:36:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0589', 'Michelle Chan', 'yeeching_hk@yagoo.com.hk', 'SHOPLINE-0589', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-02 07:34:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0590', 'Sallywong', 'sallywong0331@gmail.com', 'SHOPLINE-0590', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-08-01 16:41:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0591', 'Flora277', 'floraleung277@hotmail.com', '91525070', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$756.29", "shopline_join_date": "2025-08-01 16:35:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91525070", "shopline_recipient_phone": "91525070"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0592', 'Vycole', 'hkhome05@gmail.com', '95061987', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,571.60", "shopline_join_date": "2025-08-01 15:42:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95061987", "shopline_recipient_phone": "95061987"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0593', 'So Choi Yin', 'janet_so@yahoo.com', '98373281', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$472.50", "shopline_join_date": "2025-08-01 10:16:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98373281", "shopline_recipient_phone": "98373281"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0594', 'Joyce Wong', 'joycewong225@gmail.com', 'SHOPLINE-0594', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-31 23:36:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0595', 'joanna1600', 'joanna1600332885@gmail.com', 'SHOPLINE-0595', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-31 18:57:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0596', 'laukaka', 'laukaka15@gmail.com', 'SHOPLINE-0596', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-31 18:12:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0597', 'Emily Fung', 'emily_tofung@yahoo.com.hk', 'SHOPLINE-0597', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-31 16:09:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0598', 'Shiking0314', 'shiking0314@yahoo.com.hk', 'SHOPLINE-0598', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-31 12:31:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0599', 'yy', 'fvinyan@yahoo.com.hk', '90632723', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$716.90", "shopline_join_date": "2025-07-31 08:54:49", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90632723", "shopline_recipient_phone": "90632723"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0600', '黃小姐', 'natalielywong1121@gmail.com', 'SHOPLINE-0600', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$358.80", "shopline_join_date": "2025-07-30 22:56:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0601', 'Crystallee', 'tylertsoi@yahoo.com.hk', '60841114', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-30 22:49:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60841114", "shopline_recipient_phone": "60841114", "shopline_bound_phone": "60841114"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0602', 'Carrie Lam', 'carrielam1103@hotmail.com', 'SHOPLINE-0602', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$396.00", "shopline_join_date": "2025-07-30 14:10:57", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0603', 'Amykoon', 'rosekoon1995@gmail.com', 'SHOPLINE-0603', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-30 13:07:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0604', 'lam', 'ngaaaaa913@yahoo.com.hk', 'SHOPLINE-0604', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.00", "shopline_join_date": "2025-07-30 10:34:20", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0605', 'Ckw', 'ckw10241024@gmail.com', '93102312', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$372.12", "shopline_join_date": "2025-07-30 02:29:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93102312"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0606', 'Regina wong', 'reginawongyy@gmail.com', 'SHOPLINE-0606', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$600.02", "shopline_join_date": "2025-07-30 00:33:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0607', 'Amy', 'makwunkan@gmail.com', 'SHOPLINE-0607', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$371.45", "shopline_join_date": "2025-07-29 23:11:36", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0608', 'cookielau', 'laucookie1983@gmail.com', '63337315', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$404.51", "shopline_join_date": "2025-07-29 22:59:18", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63337315", "shopline_recipient_phone": "63337315"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0609', 'LEUNG SIU FAN', 'sf_korea@yahoo.com.hk', '98484938', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$751.45", "shopline_join_date": "2025-07-29 22:31:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98484938", "shopline_recipient_phone": "98484938"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0610', 'Wong wai ming', 'nicolawwm@yahoo.com.hk', '97515477', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$822.41", "shopline_join_date": "2025-07-29 20:01:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97515477", "shopline_recipient_phone": "97515477"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0611', 'Joannachow', 'joanna514_514@yahoo.com.hk', '63509993', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,201.56", "shopline_join_date": "2025-07-29 19:16:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63509993", "shopline_recipient_phone": "63509993"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0612', 'Diamond423', 'diamond_taitai@yahoo.com.hk', 'SHOPLINE-0612', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-29 17:43:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0613', 'JL', 'idjoyce@hotmail.com', 'SHOPLINE-0613', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-29 13:19:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0614', 'Karen', 'karenlwlin@gmail.com', '96545203', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$584.25", "shopline_join_date": "2025-07-29 00:04:56", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96545203", "shopline_recipient_phone": "96545203"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0615', 'Yuki', 'yukiyukiyuki107@gmail.com', '95887729', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,204.79", "shopline_join_date": "2025-07-28 22:34:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95887729", "shopline_recipient_phone": "95887729"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0616', 'Bori chung', 'bowiechung_1988@yahoo.com.hk', 'SHOPLINE-0616', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-28 22:08:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0617', 'mkvivian0808', 'mkvivian0808@gmail.com', 'SHOPLINE-0617', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-28 21:38:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0618', 'janelee', 'janeleefa@gmail.com', '67673331', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$367.36", "shopline_join_date": "2025-07-28 16:44:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67673331"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0619', 'szeman', 'cmancman1110@gmail.com', 'SHOPLINE-0619', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$95.00", "shopline_join_date": "2025-07-28 15:41:34", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0620', 'Connie Lam', 'lhkconnie@hotmail.com', 'SHOPLINE-0620', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-28 10:43:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0621', 'Man Sandy', 'manchi12235669@gmail.com', 'SHOPLINE-0621', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-28 03:15:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0622', 'Ivman Ng', 'ivman1003@yahoo.com.hk', 'SHOPLINE-0622', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-28 01:42:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0623', 'Moon', 'moonlin711@gmail.com', 'SHOPLINE-0623', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-27 23:55:39", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0624', 'Bruce Yim', 'bruceyim225@gmail.com', 'SHOPLINE-0624', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$390.20", "shopline_join_date": "2025-07-27 17:59:34", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0625', 'Carol', 'yukkwai.lee@hotmail.com', '67626570', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$370.30", "shopline_join_date": "2025-07-27 17:59:32", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67626570", "shopline_recipient_phone": "67626570"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0626', 'Aki0731', 'aki07312005@yahoo.com.hk', 'SHOPLINE-0626', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-27 12:34:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0627', 'Chan Chau', 'chanchau1014@outlook.com', 'SHOPLINE-0627', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$370.00", "shopline_join_date": "2025-07-27 02:10:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0628', 'tkying0930', 'shita930930@gmail.com', 'SHOPLINE-0628', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-27 00:43:34", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0629', 'sugarcm', 'iloveccmm@gmail.com', 'SHOPLINE-0629', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-26 09:46:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0630', 'Cheung', 'steller690627@gmail.com', 'SHOPLINE-0630', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-25 21:20:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0631', 'Paula Cheung', 'aluapcheung@yahoo.com.hk', 'SHOPLINE-0631', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-25 19:34:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0632', 'Siulailing', 'yylany@hotmail.com', 'SHOPLINE-0632', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$391.00", "shopline_join_date": "2025-07-25 13:21:24", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0633', 'chantc', 'hamster_chantc@hotmail.com', 'SHOPLINE-0633', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-25 07:46:40", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0634', 'YANG SISI', '65586543yss@gmail.com', 'SHOPLINE-0634', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-24 18:07:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0635', 'gigi808808', 'gigi808808@hotmail.com', 'SHOPLINE-0635', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-24 17:58:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0636', 'Shan', 'dsueparker@yahoo.com.hk', '97594633', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,072.30", "shopline_join_date": "2025-07-24 15:21:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97594633", "shopline_recipient_phone": "97594633"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0637', 'Ron.L', 'ron42380@gmail.com', 'SHOPLINE-0637', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-24 05:25:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0638', 'cool', 'ice1988bibi@yahoo.com.hj', 'SHOPLINE-0638', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-23 23:06:05", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0639', 'Chuuu', 'hnybaby51@gmail.com', '69933405', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$389.80", "shopline_join_date": "2025-07-23 22:02:52", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69933405", "shopline_recipient_phone": "69933405"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0640', 'Pinky941100', 'pinky941100@yahoo.com.hk', '64771791', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$363.56", "shopline_join_date": "2025-07-23 22:00:01", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64771791", "shopline_recipient_phone": "64771791"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0641', 'blissfulkara', 'ko.kara@yahoo.com.hk', '95562431', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.70", "shopline_join_date": "2025-07-23 18:59:12", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95562431", "shopline_recipient_phone": "95562431"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0642', 'Peter', 'peter718891@gmail.com', '97768588', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$371.90", "shopline_join_date": "2025-07-23 12:15:20", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97768588", "shopline_recipient_phone": "97768588"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0643', 'Jamesmo', 'siumo319@icloud.com', '90367879', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$364.20", "shopline_join_date": "2025-07-23 11:26:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90367879", "shopline_recipient_phone": "90367879"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0644', 'fanny yiu', '33yiu0120@gmail.com', '62295497', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$689.90", "shopline_join_date": "2025-07-23 10:40:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62295497", "shopline_recipient_phone": "62295497"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0645', 'rainlau2656', 'rainlau2013@gmail.com', '65382654', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$707.75", "shopline_join_date": "2025-07-22 15:52:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65382654", "shopline_recipient_phone": "65382654"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0646', 'Ayp', 'ammikwong@hotmail.com', '96214050', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.44", "shopline_join_date": "2025-07-21 23:46:07", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96214050", "shopline_recipient_phone": "96214050"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0647', 'Jenn chan', 'jenniferdiazchan623@yahoo.com.hk', 'SHOPLINE-0647', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$377.40", "shopline_join_date": "2025-07-21 23:29:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0648', 'troubletom', 'lichiuwai12@gmail.com', 'SHOPLINE-0648', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-21 22:06:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0649', 'Kathy Wong', 'kathywong828@hotmail.com', 'SHOPLINE-0649', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-21 18:36:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0650', 'EzaMan', 'ezaman8464@hotmail.com', '93156414', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$2,058.18", "shopline_join_date": "2025-07-21 15:33:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93156414", "shopline_recipient_phone": "93156414"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0651', 'Ching yuen Wong', 'yuenyuenheidi@hotmail.com', 'SHOPLINE-0651', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-21 12:41:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0652', 'Lianho', 'lianho@gmail.com', 'SHOPLINE-0652', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-21 03:24:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0653', 'Leungkaka', 'leungkahung1988@yahoo.com.hk', 'SHOPLINE-0653', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-21 01:51:12", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0654', 'P8 Grace', 'gyktang@mac.com', '93885299', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$371.80", "shopline_join_date": "2025-07-21 01:26:49", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93885299", "shopline_recipient_phone": "93885299"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0655', 'Manman', 'sammi_wong123@hotmail.com', '98650573', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,743.32", "shopline_join_date": "2025-07-19 08:57:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98650573", "shopline_recipient_phone": "98650573"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0656', 'Winwin', 'rachelcheung5@gmail.com', 'SHOPLINE-0656', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-18 22:50:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0657', 'Co co', 'cocolingmakling@gmail.com', '97717860', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-18 21:39:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97717860", "shopline_bound_phone": "97717860"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0658', 'pauline', 'linlinyeung@hotmail.com', 'SHOPLINE-0658', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-17 16:56:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0659', 'Manda Tang', 'mandatang@hotmail.com', '92197095', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,572.00", "shopline_join_date": "2025-07-17 08:03:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92197095", "shopline_recipient_phone": "92197095"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0660', 'Yu', 'y.gloria@yahoo.com', 'SHOPLINE-0660', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$486.00", "shopline_join_date": "2025-07-16 20:21:51", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0661', 'cimdy2008', 'cimdy2008@gmail.com', 'SHOPLINE-0661', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-16 15:07:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0662', 'Zzzitaaa', 'wisteria1109@yahoo.com.hk', '65777585', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$380.00", "shopline_join_date": "2025-07-16 13:59:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "65777585", "shopline_recipient_phone": "65777585"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0663', 'Mak', 'wingon22237@gmail.com', '92777387', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$2,266.04", "shopline_join_date": "2025-07-16 09:05:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92777387", "shopline_recipient_phone": "92777387"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0664', 'man1218', 'manchow1218@gmail.com', 'SHOPLINE-0664', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-16 06:11:58", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0665', 'Morris', 'morris.yip@gmail.com', 'SHOPLINE-0665', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-15 23:07:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0666', 'Gaby Chan', 'gabriellechanns@gmail.com', 'SHOPLINE-0666', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$366.70", "shopline_join_date": "2025-07-15 20:59:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0667', 'Faith Pang', 'pang_pang100@yahoo.com.hk', '96549095', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$404.32", "shopline_join_date": "2025-07-15 18:43:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96549095", "shopline_recipient_phone": "96549095"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0668', 'MandyLaw', 'lkymandy102@gmail.com', 'SHOPLINE-0668', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-15 14:44:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0669', 'FUNG YI YEE', 'yvonnefung99@gmail.com', '93362110', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "10", "shopline_spend": "HK$3,253.57", "shopline_join_date": "2025-07-15 14:32:15", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93362110", "shopline_recipient_phone": "96013190"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0670', '98151151', 'wcleung2009@gmail.com', 'SHOPLINE-0670', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-15 11:17:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0671', 'Chung CHUNG', 'avechung@yahoo.com.hk', '92209237', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$716.58", "shopline_join_date": "2025-07-14 21:09:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92209237", "shopline_recipient_phone": "92209237"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0672', '張淑瑤', 'i_csy@yahoo.com.hk', '61381668', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "12", "shopline_spend": "HK$4,287.35", "shopline_join_date": "2025-07-14 18:08:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61381668", "shopline_recipient_phone": "61381668", "shopline_bound_phone": "61381668"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0673', 'shum', 'guaimaomaokanshen@gmail.com', 'SHOPLINE-0673', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-14 13:04:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0674', 'Billy Cheng Hon Fai', 'billycheng529@gmail.com', 'SHOPLINE-0674', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-14 11:22:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0675', 'Bikkiwan', 'bikkiwan0214@icloud.com', 'SHOPLINE-0675', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-13 20:08:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0676', 'eris', 'eris.lai@hotmail.com', 'SHOPLINE-0676', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-13 16:10:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0677', 'May Ng', 'nyuenyee@gmail.com', 'SHOPLINE-0677', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-13 01:08:14", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0678', 'Jammy Chen', 'businessclient14@gmail.com', '92798676', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,911.20", "shopline_join_date": "2025-07-13 00:00:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92798676", "shopline_recipient_phone": "92798676"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0679', 'Vivian123', 'ching1390@gmail.com', '69334432', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$383.80", "shopline_join_date": "2025-07-12 23:27:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69334432", "shopline_recipient_phone": "69334432", "shopline_bound_phone": "69334432"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0680', 'Yoyo Ching', 'yoyo_ching117@yahoo.com.hk', 'SHOPLINE-0680', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-12 17:14:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0681', 'Carman Ho', 'lovefreecarman@hotmail.com', 'SHOPLINE-0681', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$414.30", "shopline_join_date": "2025-07-12 13:32:23", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0682', 'June79', 'yuuukkee@yahoo.com.hk', 'SHOPLINE-0682', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-11 03:27:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0683', 'littlecurve', 'littlecurve@hotmail.com', '95120612', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$426.80", "shopline_join_date": "2025-07-10 22:32:43", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95120612", "shopline_recipient_phone": "95120612", "shopline_bound_phone": "95120612"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0684', 'Candywong', 'minicandy101@hotmail.com', '60927767', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,567.89", "shopline_join_date": "2025-07-10 12:26:37", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60927767", "shopline_recipient_phone": "60927767"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0685', 'Icy Ng', 'puiki13@hotmail.com', 'SHOPLINE-0685', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$384.00", "shopline_join_date": "2025-07-10 01:05:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0686', 'VaneWong', 'z935191853@gmail.com', '68883248', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$1,926.65", "shopline_join_date": "2025-07-09 19:45:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "68883248", "shopline_recipient_phone": "68883248"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0687', 'Mi', 'mimifu2012@yahoo.com.hk', 'SHOPLINE-0687', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-09 14:10:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0688', 'kittykwan', 'kittykw2003@gmail.com', '96177155', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$569.10", "shopline_join_date": "2025-07-09 09:08:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96177155", "shopline_recipient_phone": "96177155"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0689', 'Miss Kong', 'zelean@hotmail.com', 'SHOPLINE-0689', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$575.70", "shopline_join_date": "2025-07-09 06:08:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0690', 'Shan1691', 'shanshan1691@hotmail.com', 'SHOPLINE-0690', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-08 17:25:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0691', 'Cynthiasuen', 'coeysuen19950422@gmail.com', '53637848', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$352.45", "shopline_join_date": "2025-07-08 16:43:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "53637848", "shopline_recipient_phone": "61983126"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0692', 'Shopline User 692', NULL, '61983126', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "61983126"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0693', 'Karinsdate', 'karinsdate@hotmail.com', '94874479', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "9", "shopline_spend": "HK$2,925.79", "shopline_join_date": "2025-07-08 07:44:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94874479"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0694', 'tszfaith', 'sleepymomo@live.hk', 'SHOPLINE-0694', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-06 22:24:44", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0695', '陳小姐', 'elainechanhl@gmail.com', '61711654', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,113.53", "shopline_join_date": "2025-07-06 20:48:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61711654", "shopline_recipient_phone": "61711654"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0696', 'Helen Lee', 'helenleekk@yahoo.com.hk', '93455106', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "5", "shopline_spend": "HK$2,042.20", "shopline_join_date": "2025-07-06 18:42:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93455106", "shopline_recipient_phone": "93455106", "shopline_bound_phone": "93455106"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0697', 'Tracy', 'tracylee317@hotmail.com', 'SHOPLINE-0697', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-06 11:11:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0698', 'coeyyeung', 'coeyyeung@hotmail.com.hkp', 'SHOPLINE-0698', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-06 10:47:47", "shopline_email_promo": false, "shopline_fb_promo": true, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0699', 'Adalaipc', 'adalaipc@hotmail.com', 'SHOPLINE-0699', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-06 09:25:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0700', 'yuen', 'yuenyuetheisisi@gmail.com', 'SHOPLINE-0700', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-07-05 20:37:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0701', 'Siuvik', 'siuvik@yahoo.com.hk', '90980835', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$863.81", "shopline_join_date": "2025-07-04 22:01:10", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90980835", "shopline_recipient_phone": "90980835"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0702', 'joswong0703', 'joswong1982@gmail.com', '91617604', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "7", "shopline_spend": "HK$2,583.13", "shopline_join_date": "2025-07-04 18:14:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91617604", "shopline_recipient_phone": "91617604", "shopline_bound_phone": "91617604"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0703', 'Alan Lee', 'alanlee108@gmail.com', '62006746', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$2,120.40", "shopline_join_date": "2025-07-03 18:49:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62006746", "shopline_recipient_phone": "62006746"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0704', 'Sylvia Lam', 'ngenyinglam@gmail.com', '62854529', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,366.67", "shopline_join_date": "2025-07-03 16:46:56", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62854529", "shopline_recipient_phone": "62854529"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0705', 'Carrie', 'carrie22052000@yahoo.com.hk', 'SHOPLINE-0705', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$813.30", "shopline_join_date": "2025-07-03 06:55:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0706', 'Pun', 'dorothy_pun@hotmail.com', '90988564', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$279.95", "shopline_join_date": "2025-07-02 16:14:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90988564"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0707', 'Ms Yu', 'heat1990@hotmail.com', 'SHOPLINE-0707', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$778.05", "shopline_join_date": "2025-07-01 09:10:24", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0708', 'Lannie', 'lannielingling@gmail.com', 'SHOPLINE-0708', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-30 09:52:03", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0709', 'zuki_law', 'zukilaw.zl@gmail.com', '93750823', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.20", "shopline_join_date": "2025-06-30 09:38:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93750823", "shopline_recipient_phone": "93750823"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0710', 'Shopline User 710', NULL, '93750823', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_recipient_phone": "93750823"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0711', 'linghkhkhk', 'linghkhkhk@gmail.com', 'SHOPLINE-0711', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-30 09:11:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0712', 'falconwong', 'falconwong95@gmail.com', '63518369', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "3", "shopline_spend": "HK$1,176.70", "shopline_join_date": "2025-06-29 13:53:27", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63518369", "shopline_recipient_phone": "63518369"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0713', 'Rattilam', 'rattilam@gmail.com', '91008584', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-29 01:47:51", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91008584", "shopline_recipient_phone": "91008584", "shopline_bound_phone": "91008584"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0714', 'yankiseun', 'yanki01215@yahoo.com.hk', 'SHOPLINE-0714', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-28 18:00:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0715', 'Rosit To', 'rosit1983@yahoo.com.hk', '96892979', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$353.00", "shopline_join_date": "2025-06-27 16:30:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96892979", "shopline_recipient_phone": "96892979"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0716', 'Ka Wing', 'sherry9288shum@gmail.com', 'SHOPLINE-0716', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-26 21:35:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0717', 'Yee bing', 'chicheung1965@yahoo.com.hk', 'SHOPLINE-0717', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-26 16:49:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0718', 'JOANNE LAU', 'percyfong@yhoo.com.hk', '66818810', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$373.00", "shopline_join_date": "2025-06-26 10:42:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66818810", "shopline_recipient_phone": "66818810"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0719', 'Olive cheung', 'chuk_ting@yahoo.com.hk', 'SHOPLINE-0719', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$353.20", "shopline_join_date": "2025-06-25 22:48:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0720', 'K K Lai', 'mickykk1818@yahoo.com.hk', '92386808', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "10", "shopline_spend": "HK$5,582.70", "shopline_join_date": "2025-06-25 10:08:10", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92386808", "shopline_recipient_phone": "92386808", "shopline_bound_phone": "92386808"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0721', 'Ma man chi', 'manchi_ma@yahoo.com.hk', '93200440', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$359.96", "shopline_join_date": "2025-06-25 00:33:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93200440", "shopline_recipient_phone": "93200440"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0722', 'Margaret Churng', 'mwsbb@yahoo.com', 'SHOPLINE-0722', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-24 17:34:56", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0723', 'Tmltommy', 'ltmsteinway@gmail.com', 'SHOPLINE-0723', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-23 23:01:25", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0724', 'Lui Ki Ki', 'happy365market@gmail.com', '64897762', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$735.00", "shopline_join_date": "2025-06-23 22:09:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64897762", "shopline_recipient_phone": "64897762"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0725', 'ManChiu', 'lingchiu719@gmail.com', 'SHOPLINE-0725', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-23 18:58:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0726', 'lhwan130', 'lhwan130@gmail.com', '64750375', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$875.20", "shopline_join_date": "2025-06-22 22:23:41", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64750375", "shopline_recipient_phone": "64750375"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0727', 'vivimik', 'cwyvv@yahoo.com', 'SHOPLINE-0727', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-22 12:47:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0728', 'Jy1201', '744486574@qq.com', '44149316', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-22 08:51:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "44149316", "shopline_recipient_phone": "44149316", "shopline_bound_phone": "44149316"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0729', 'Sarahwong22', 'hqh739@gmail.com', 'SHOPLINE-0729', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-21 23:16:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0730', 'beanlaisk', 'beanlaisk@gmail.com', 'SHOPLINE-0730', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-21 09:59:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0731', 'Chan Winnie', '98214242wc@gmail.com', 'SHOPLINE-0731', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-20 09:53:50", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0732', 'Shirley Wong', 'tw.wong@yahoo.com.hk', '94361968', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$375.16", "shopline_join_date": "2025-06-19 11:57:47", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94361968", "shopline_recipient_phone": "94361968"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0733', 'Alex Chan', 'choihonhk@gmail.com', 'SHOPLINE-0733', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-18 17:22:10", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0734', 'manb0512', 'manbbaby0512@gmail.com', '62303071', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.40", "shopline_join_date": "2025-06-18 13:46:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "62303071", "shopline_recipient_phone": "62303071"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0735', 'Winnie Wo', 'winniethewo@gmail.com', 'SHOPLINE-0735', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$374.78", "shopline_join_date": "2025-06-17 09:45:05", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0736', 'oliviachiu', 'chiusauching@yahoo.com.hk', '94257535', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$350.55", "shopline_join_date": "2025-06-16 23:28:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94257535", "shopline_recipient_phone": "94257535"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0737', '李權歡', 'kuenfunli@gmail.com', 'SHOPLINE-0737', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$196.50", "shopline_join_date": "2025-06-15 20:13:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0738', 'Chung Lai Ying', 'gracechung215@icloud.com', 'SHOPLINE-0738', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-14 16:34:58", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0739', 'siuchin', 'cwyellow@yahoo.com', 'SHOPLINE-0739', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-12 20:49:30", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0740', 'Ying', 'tsang197305@yahoo.com.hk', 'SHOPLINE-0740', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-11 22:35:29", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0741', 'Queenie lai', 'queenier423@gmail.com', 'SHOPLINE-0741', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$3,516.68", "shopline_join_date": "2025-06-11 07:03:13", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0742', '黎翠萍', 'emilylai108@gmail.com', '90952489', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,622.17", "shopline_join_date": "2025-06-10 17:52:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90952489", "shopline_recipient_phone": "90952489"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0743', 'Elifwm', 'elivafung@gmail.com', '97468467', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.06", "shopline_join_date": "2025-06-09 18:19:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "97468467", "shopline_recipient_phone": "97468467"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0744', 'Sophie', 'chunwelcome@yahoo.com.hk', '92120958', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$385.80", "shopline_join_date": "2025-06-09 08:47:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92120958", "shopline_recipient_phone": "92120958"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0745', 'Jo Shiu', 'cookingcola.hongkong@gmail.com', 'SHOPLINE-0745', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$352.40", "shopline_join_date": "2025-06-07 10:33:31", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0746', 'puffybb', 'puiying309@hotmail.com', 'SHOPLINE-0746', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-06 18:31:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0747', 'hoiyan0919', 'hoiyan0919@yahoo.com.hk', '96369194', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-06 11:01:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96369194", "shopline_bound_phone": "96369194"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0748', 'Icychan', 'icy-chan@hotmail.com', 'SHOPLINE-0748', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-04 23:20:57", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0749', 'Yoyo Yip', 'sinyungyip@gmail.com', 'SHOPLINE-0749', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-04 23:20:16", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0750', 'June79', 'junewan1384@yahoo.com.hk', 'SHOPLINE-0750', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-04 18:38:11", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0751', 'jolin111256', 'jolinip62@gmail.com', 'SHOPLINE-0751', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-04 14:43:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0752', 'HELEN', 'circle926@hotmail.com', 'SHOPLINE-0752', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-04 12:39:31", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0753', 'Vincy Lee', 'vincyleevc@gmail.com', 'SHOPLINE-0753', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$911.75", "shopline_join_date": "2025-06-04 04:13:06", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0754', 'nambe', 'nambe.ng1024@yahoo.com.hk', 'SHOPLINE-0754', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-06-03 23:12:55", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0755', 'Yan yang', 'wongyang25@gmail.com', '64301764', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$386.36", "shopline_join_date": "2025-06-03 18:16:42", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64301764", "shopline_recipient_phone": "64301764", "shopline_bound_phone": "64301764"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0756', 'KIT', 'mustela13579@yahoo.com.hk', 'SHOPLINE-0756', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$364.60", "shopline_join_date": "2025-06-03 06:54:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0757', 'RaneeKo', 'raneehui128@gmail.com', '98884608', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "11", "shopline_spend": "HK$4,307.86", "shopline_join_date": "2025-06-02 14:09:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "98884608", "shopline_recipient_phone": "98884608"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0758', 'Ming', 'y_mingli2002@yahoo.com.hk', '94184281', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$573.10", "shopline_join_date": "2025-06-01 11:46:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94184281", "shopline_recipient_phone": "94184281", "shopline_bound_phone": "94184281"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0759', 'Momo', 'motakmo@yahoo.com.hk', '91987241', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$465.00", "shopline_join_date": "2025-05-28 17:14:06", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "91987241"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0760', 'Deeichi', 'deeichi@hotmail.com', '91707231', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.12", "shopline_join_date": "2025-05-28 13:07:02", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91707231", "shopline_recipient_phone": "91707231"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0761', 'Cherry ma', 'cherrycoey@gmail.com', 'SHOPLINE-0761', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$376.70", "shopline_join_date": "2025-05-28 09:45:22", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0762', 'Mandy', 'patrickbbchu@gmail.com', 'SHOPLINE-0762', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$607.05", "shopline_join_date": "2025-05-28 02:47:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0763', 'Bianca Yu', 'berniceyu@live.hk', '91090175', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$2,734.32", "shopline_join_date": "2025-05-28 00:43:26", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91090175", "shopline_recipient_phone": "91090175"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0764', 'Calamus', 'calamusw@yahoo.com', 'SHOPLINE-0764', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-26 08:10:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0765', 'Mr.tak', 'hoho1603@netvigator.com', 'SHOPLINE-0765', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-25 11:00:53", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0766', 'tai00', 'maymktai@yahoo.com.hk', '60909227', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-23 23:04:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60909227", "shopline_recipient_phone": "60909227", "shopline_bound_phone": "60909227"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0767', 'Lawyokitty', 'lawyokitty@yahoo.com.hk', 'SHOPLINE-0767', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-22 12:02:08", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0768', 'Jchml1488', 'jchml1488@gmail.com', '91564371', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$357.10", "shopline_join_date": "2025-05-21 09:01:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91564371", "shopline_recipient_phone": "91564371"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0769', 'May Chung', 'mccwk39may@yahoo.com.hk', 'SHOPLINE-0769', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-20 17:22:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0770', 'hoiyan0919', 'hoiyan0919@yaho.com.hk', 'SHOPLINE-0770', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-20 13:34:40", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0771', 'Phoebe', 'lampuiyingg@gmail.com', '66449334', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$351.50", "shopline_join_date": "2025-05-20 10:58:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "66449334", "shopline_recipient_phone": "66449334"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0772', 'Jason', 'linjumwei1215@hotmail.com', '59877549', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-19 19:38:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "59877549", "shopline_bound_phone": "59877549"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0773', 'Garen', 'garen138@gmail.com', 'SHOPLINE-0773', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$362.50", "shopline_join_date": "2025-05-18 00:11:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0774', 'YukiLam', 'angel_yuki2002@yahoo.com.hk', '69092323', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$377.50", "shopline_join_date": "2025-05-16 07:46:49", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69092323", "shopline_recipient_phone": "69092323"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0775', 'fionyau', 'fionyau04@hotmail.com', '90548929', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$802.65", "shopline_join_date": "2025-05-15 19:13:41", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "90548929", "shopline_recipient_phone": "90548929", "shopline_bound_phone": "90548929"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0776', 'Karenkhho', 'karenho9308@gmail.com', 'SHOPLINE-0776', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-15 16:42:17", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0777', 'bergy', 'bergy602@gmail.com', '92716875', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,910.46", "shopline_join_date": "2025-05-15 10:47:21", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92716875", "shopline_recipient_phone": "92716875"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0778', 'makhonam0821', 'makhonam0821@gmail.com', 'SHOPLINE-0778', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-13 20:21:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0779', 'Bergy', 'berg602@gmail.com', '92716875', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-12 12:26:07", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "92716875", "shopline_recipient_phone": "92716875"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0780', 'terryhcw', 'terryho@hotmail.com', '63497588', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$356.40", "shopline_join_date": "2025-05-08 13:04:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63497588", "shopline_recipient_phone": "63497588"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0781', 'Clairol', 'clairolchan@yahoo.com.hk', '96168933', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$644.48", "shopline_join_date": "2025-05-04 22:42:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96168933", "shopline_recipient_phone": "96168933"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0782', 'Carmann Ng', 'carmannng66@gmail.com', 'SHOPLINE-0782', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-04 17:30:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0783', 'Ruby', 'chanlokwunruby@yahoo.com.hk', 'SHOPLINE-0783', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-04 14:50:33", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0784', 'Sandy Lau', 'sandy511hk@hotmail.com', '92610946', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-04 14:43:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "92610946"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0785', 'Bebe', 'kelbebetsang@gmail.com', 'SHOPLINE-0785', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-03 19:52:24", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0786', 'Yan Tam', 'wingyan1127@gmail.com', 'SHOPLINE-0786', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-03 09:58:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0787', 'Pearl So', 'richsophy@126.com', '60154312', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-02 17:31:52", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60154312", "shopline_recipient_phone": "60154312", "shopline_bound_phone": "60154312"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0788', '陳婉玲', 'teresaling1966@yahoo.com.hk', 'SHOPLINE-0788', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-05-01 17:53:36", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0789', 'emma', 'lisuetfa@yahoo.com.hk', 'SHOPLINE-0789', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-30 23:45:07", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0790', 'Ion Lee', 'lee_ion@yahoo.com.hk', 'SHOPLINE-0790', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-30 20:48:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0791', '小芬 陳', 'chen.xf80@yahoo.com.hk', '63598709', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$730.48", "shopline_join_date": "2025-04-30 08:31:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63598709", "shopline_recipient_phone": "63598709", "shopline_bound_phone": "63598709"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0792', 'Bo', 'crazygirl.cpm@gmail.com', '67597215', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-30 00:09:04", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "67597215"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0793', 'Joanmom', 'kimyk120@gmail.com', 'SHOPLINE-0793', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-29 07:59:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0794', 'Chan Chi Fai', 'chifai2018cf@gmail.com', 'SHOPLINE-0794', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-29 04:07:21", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0795', 'stephanie', 'law0878@gmail.com', 'SHOPLINE-0795', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-29 02:56:09", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0796', 'Fanny', 'fannysham1010@gmail.com', '96508888', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-27 20:58:46", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96508888", "shopline_bound_phone": "96508888"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0797', 'Nikki Chan', 'nikkichan2002@gmail.com', 'SHOPLINE-0797', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$214.51", "shopline_join_date": "2025-04-27 19:33:10", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0798', 'Tyra111', 'anna2fuho@gmail.com', 'SHOPLINE-0798', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-27 15:57:22", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0799', 'yik yu lee', 'yuki180@hotmail.com', 'SHOPLINE-0799', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-26 23:26:28", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0800', 'shefali', 'shefali19922001@gmail.com', 'SHOPLINE-0800', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-26 00:57:11", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0801', 'Renmax', 'renmax12495@gmail.com', 'SHOPLINE-0801', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-25 14:33:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0802', 'Kaman1031', 'kaman0524@yahoo.com.hk', 'SHOPLINE-0802', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-04-17 11:39:18", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0803', '王庆锵', 'wonghingcheung@yahoo.com', '91896343', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "7", "shopline_spend": "HK$2,752.61", "shopline_join_date": "2025-04-09 15:20:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91896343", "shopline_recipient_phone": "91896343", "shopline_bound_phone": "91896343"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0804', 'Jack', 'auaucriscris@gmail.com', 'SHOPLINE-0804', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$411.00", "shopline_join_date": "2025-04-07 01:11:01", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0805', 'Jeff Wong', 'heiwahwong@gmail.com', 'SHOPLINE-0805', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$415.00", "shopline_join_date": "2025-04-02 01:03:28", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0806', 'kikihoik', 'kikihoik@gmail.com', '69079708', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$531.33", "shopline_join_date": "2025-03-31 12:25:03", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "69079708"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0807', 'Wong', 'boy24266777@gmail.com', 'SHOPLINE-0807', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-03-28 11:42:26", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0808', 'Ling yiu', 'ling_yiu_8@hotmail.com', '96381733', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-03-04 08:42:35", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "96381733"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0809', 'Tracy hon', 'tracyhon1984@gmail.com', 'SHOPLINE-0809', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-03-04 07:08:04", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0810', 'aprilyu', 'pui1988@yahoo.com.hk', 'SHOPLINE-0810', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-03-03 14:03:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0811', 'Kathy Wong', 'kathywong75828@gmail.com', 'SHOPLINE-0811', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-03-03 12:55:00", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0812', 'Lamhiufai', 'matthewfai0324@yahoo.com.hk', 'SHOPLINE-0812', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$66.50", "shopline_join_date": "2025-02-28 06:04:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0813', 'connie.tung', 'connie.tung35@gmail.com', 'SHOPLINE-0813', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-02-28 00:50:32", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0814', 'Kitty Tsang', 'kittytsang12151215@gmail.com', 'SHOPLINE-0814', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-02-27 21:38:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0815', 'Town Yao', 'hktownyao@gmail.com', 'SHOPLINE-0815', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-02-23 20:34:18", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0816', 'Elle0228', 'elle.0228@hotmail.com', 'SHOPLINE-0816', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-02-08 12:24:54", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0817', 'Karen Chan', 'kayan_329@hotmail.com', '93263431', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$1,009.50", "shopline_join_date": "2025-02-04 13:00:50", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93263431", "shopline_recipient_phone": "93263431"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0818', 'hoi kiu', 'kiu_620@yahoo.com', 'SHOPLINE-0818', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-02-03 01:14:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0819', 'Yan', 'ycyanchan115@gmail.com', 'SHOPLINE-0819', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$379.05", "shopline_join_date": "2025-01-27 13:26:58", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0820', 'Dannyleo', 'dannyleo2002@yahoo.com.hk', 'SHOPLINE-0820', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2025-01-26 18:03:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0821', 'Ho Kai Ming', 'kaiming924@gmail.com', 'SHOPLINE-0821', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$27.55", "shopline_join_date": "2025-01-21 23:47:59", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0822', '東華三院何東安老院', 'nwf_929@yahoo.com.hk', 'SHOPLINE-0822', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$649.00", "shopline_join_date": "2025-01-09 11:25:29", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0823', 'cash0629', 'cash514708866321@gmail.com', '61477729', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$560.00", "shopline_join_date": "2025-01-02 14:02:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "61477729", "shopline_recipient_phone": "61477729"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0824', 'Chu Pak Hei', 'chupakhei11@gmail.com', '63834729', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-12-19 13:54:14", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "63834729"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0825', 'ychktts', 'ychktts@yahoo.com', 'SHOPLINE-0825', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-12-12 17:08:35", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0826', 'Joyce', 'joyce1221@hotmail.com', 'SHOPLINE-0826', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "2", "shopline_spend": "HK$313.50", "shopline_join_date": "2024-11-28 08:36:13", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0827', 'Wing Leung', 'vernonleung624@gmail.com', 'SHOPLINE-0827', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-11-20 00:38:44", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0828', 'Cupid', 'cupidmenyee@gmail.com', 'SHOPLINE-0828', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$286.90", "shopline_join_date": "2024-11-14 13:59:08", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0829', 'suetjb', 'suetjb@yahoo.com.hk', 'SHOPLINE-0829', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$658.00", "shopline_join_date": "2024-11-11 15:14:48", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0830', 'lcy363', 'cylam363@yahoo.com.hk', 'SHOPLINE-0830', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-11-10 15:40:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0831', 'hengbkk', 'hengbkk@yahoo.com', 'SHOPLINE-0831', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-10-25 19:40:45", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0832', 'Raymond Wong', 'raymondwongams@yahoo.com.hk', '91205138', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-10-24 01:01:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "91205138"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0833', 'wongyimping1124', 'wongyimping1124@gmail.com', 'SHOPLINE-0833', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-10-09 17:13:27", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0834', '陳太', 'evian51169748@gamil.com', 'SHOPLINE-0834', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-10-08 12:45:19", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0835', 'Win Leung', 'winnieleungblog@gmail.com', 'SHOPLINE-0835', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$464.55", "shopline_join_date": "2024-09-30 13:24:33", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0836', 'Maiceday', 'maiceday@hotmail.com', 'SHOPLINE-0836', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-09-16 08:13:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0837', 'Cat', 'fancat55@yahoo.com.hk', '60704555', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "4", "shopline_spend": "HK$1,668.00", "shopline_join_date": "2024-09-11 10:59:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "60704555", "shopline_recipient_phone": "60704555", "shopline_bound_phone": "60704555"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0838', 'Wong Lung King', 'sk_lungking@yahoo.com.hk', 'SHOPLINE-0838', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$569.00", "shopline_join_date": "2024-08-25 16:21:16", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0839', 'vincent.chan', 'vincent.chan@jumppoint.io', 'SHOPLINE-0839', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-08-22 18:17:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0840', 'Rachel', 'wingtse923@gmail.com', '60588809', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$108.30", "shopline_join_date": "2024-08-07 09:36:38", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_bound_phone": "60588809"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0841', 'ycj', 'ycj96009@gmail.com', 'SHOPLINE-0841', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-07-31 17:43:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0842', 'Jackychoick', 'jackychoi_ck@yahoo.com.hk', '96879017', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$65.55", "shopline_join_date": "2024-07-29 07:58:56", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "96879017"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0843', 'Yiufunggg', 'fung.829@hotmail.com', 'SHOPLINE-0843', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-07-10 18:24:33", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0844', 'Kin', 'ahkin999@hotmail.com', 'SHOPLINE-0844', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-07-07 22:51:50", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0845', 'Ricky Wong', 'rwongmf@yahoo.com.hk', 'SHOPLINE-0845', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-07-07 13:29:42", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0846', 'Don Chung', 'donchung1823@gmail.com', 'SHOPLINE-0846', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-07-03 02:31:06", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0847', 'jason414hk', 'jason414hk@gmail.com', '95189428', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$503.00", "shopline_join_date": "2024-07-01 03:56:38", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "95189428", "shopline_recipient_phone": "95189428"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0848', 'Anthony', 'anthonychintong@gmail.com', 'SHOPLINE-0848', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-06-26 01:48:57", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0849', 'GerrardChim', 'keechim@yahoo.com.hk', 'SHOPLINE-0849', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-06-07 16:32:59", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0850', 'may', 'lovemayyeung@gmail.com', 'SHOPLINE-0850', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-05-27 17:07:17", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0851', 'Karl95228', 'alex1996129@yahoo.com.hk', '67453690', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "6", "shopline_spend": "HK$3,237.36", "shopline_join_date": "2024-05-23 00:18:15", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "67453690", "shopline_recipient_phone": "67453690", "shopline_bound_phone": "67453690"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0852', 'Hei0722', 'oscarchan98722@gmail.com', '51060150', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$532.00", "shopline_join_date": "2024-05-19 23:54:37", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "51060150", "shopline_recipient_phone": "51060150"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0853', 'cooby.chow', 'cooby.chow@lkk.com', 'SHOPLINE-0853', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-05-03 15:06:51", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": false}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0854', 'Man Kai Wing', 'monkeywing001@gmail.com', '64137999', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$133.00", "shopline_join_date": "2024-04-22 21:40:19", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "64137999"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0855', 'Lui Yuen Fan', 'jojolui0226@gmail.com', '94519692', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-04-14 15:13:00", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "94519692", "shopline_bound_phone": "94519692"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0856', 'Eusebeiachan', 'eusebeiaeusebeia@gmail.com', 'SHOPLINE-0856', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-03-27 14:03:08", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0857', 'Cat', 'monster1412@yahoo.com.hk', '91678807', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "69", "shopline_spend": "HK$12,061.33", "shopline_join_date": "2024-02-21 19:04:54", "shopline_email_promo": false, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "91678807", "shopline_bound_phone": "91678807"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0858', 'Chuen Kei Lo', 'arnoldemail@yahoo.com', '93576192', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-02-07 11:30:23", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_contact_phone": "93576192", "shopline_bound_phone": "93576192"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0859', 'MARK Edward', 'vociferous88@gmail.com', '98600384', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$903.00", "shopline_join_date": "2024-02-06 15:15:48", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true, "shopline_recipient_phone": "98600384", "shopline_bound_phone": "98600384"}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0860', 'Cherry leung', 'cherryleung624@yahoo.com.hk', 'SHOPLINE-0860', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$710.00", "shopline_join_date": "2024-02-04 10:06:58", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0861', 'Roria Wan', 'roria335@netvigator.com', 'SHOPLINE-0861', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-02-04 04:17:45", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0862', 'On5on5', 'wso1974hotmail@gmail.com', 'SHOPLINE-0862', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_join_date": "2024-02-02 14:06:29", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO public.members (id, name, email, phone_number, password_hash, points, tier, role, member_type, must_change_password, import_source, import_metadata)
  VALUES ('shopline-0863', 'SORUSSELL.S@GMAIL.COM', 'sorussell.s@gmail.com', 'SHOPLINE-0863', NULL, 0, 'Bronze', 'customer', 'retail', true, 'shopline', '{"shopline_orders": "1", "shopline_spend": "HK$504.00", "shopline_join_date": "2024-01-31 16:24:01", "shopline_email_promo": true, "shopline_fb_promo": false, "shopline_is_member": true}')
  ON CONFLICT (phone_number) DO NOTHING;

COMMIT;

-- Summary: After running, verify with:
-- SELECT count(*) FROM public.members WHERE import_source = 'shopline';
-- SELECT count(*) FROM public.members WHERE import_source = 'shopline' AND claimed_at IS NULL;
