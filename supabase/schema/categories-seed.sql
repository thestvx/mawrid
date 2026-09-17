-- ============================================
-- Mawrid: categories seed (digital-plus3 style)
-- Run this in Supabase SQL Editor.
-- Idempotent: safe to run repeatedly (upsert on slug).
-- ============================================

insert into public.categories (name, name_en, slug, icon, enabled, sort_order)
values
  ('الذكاء الاصطناعي', 'Artificial Intelligence', 'artificial-intelligence', 'psychology', true, 10),
  ('شات جي بي تي', 'ChatGPT', 'chatgpt', 'smart_toy', true, 20),
  ('جوجل جيمناي', 'Google Gemini', 'google-gemini', 'auto_awesome', true, 30),
  ('بيربلكستي', 'Perplexity', 'perplexity', 'explore', true, 40),
  ('جرامرلي', 'Grammarly', 'grammarly', 'edit_document', true, 50),
  ('التصميم والإبداع', 'Design & Creative', 'design', 'palette', true, 60),
  ('أدوبي', 'Adobe', 'adobe', 'brush', true, 70),
  ('كانفا', 'Canva', 'canva', 'image', true, 80),
  ('فري بيك', 'Freepik', 'freepik', 'photo_library', true, 90),
  ('إنفاتو', 'Envato Elements', 'envato', 'dashboard', true, 100),
  ('الألعاب', 'Gaming', 'gaming', 'sports_esports', true, 110),
  ('ستيم', 'Steam', 'steam', 'videogame_asset', true, 120),
  ('إكس بوكس وإي إيه بلاي', 'Xbox & EA Play', 'xbox', 'gamepad', true, 130),
  ('البرمجيات والاشتراكات', 'Software & Subscriptions', 'software', 'code_blocks', true, 140),
  ('ويندوز', 'Windows', 'windows', 'desktop_windows', true, 150),
  ('مايكروسوفت أوفيس', 'Microsoft Office', 'microsoft-office', 'description', true, 160),
  ('التجارة الإلكترونية', 'E-Commerce Services', 'ecommerce', 'shopping_bag', true, 170),
  ('الدورات والتعليم', 'Courses & Education', 'courses', 'school', true, 180),
  ('الأعمال والمحاسبة', 'Business & Accounting', 'business', 'account_balance', true, 190),
  ('الأكثر مبيعاً', 'Best Sellers', 'best-sellers', 'local_fire_department', true, 200)
on conflict (slug) do update set
  name = excluded.name,
  name_en = excluded.name_en,
  icon = excluded.icon,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order;