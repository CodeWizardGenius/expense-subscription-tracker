-- ============================================================
-- profiles tablosu genişletme — Mevcut verilere DOKUNMAZ
-- Supabase SQL Editor'de veya migration olarak çalıştırın
-- Tarih: 2026-02-22
-- ============================================================

-- 1) Kullanıcı adı (benzersiz)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2) Tema tercihi (dark/light/system — varsayılan: dark)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_theme_preference
  CHECK (theme_preference IN ('dark', 'light', 'system'));

-- 3) Bildirim ayarı (varsayılan: açık)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 4) Soft-delete (hesap silindi mi?)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- (Opsiyonel) RLS Politikası — Kullanıcılar yalnızca kendi
-- profillerini güncelleyebilsin.
-- Eğer bu politika zaten mevcutsa aşağıdaki bloğu ÇALIŞTIRMAYIN.
-- ============================================================

-- CREATE POLICY "Users can update their own profile"
--   ON public.profiles
--   FOR UPDATE
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);
