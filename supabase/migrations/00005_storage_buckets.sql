-- ============================================
-- OCCHIALE Migration 00005
-- Create Storage Buckets + RLS Policies
-- ============================================

-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('prescriptions', 'prescriptions', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('store-assets', 'store-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ===== PRODUCT-IMAGES POLICIES =====

-- Public can view product images
CREATE POLICY "product_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Store members can upload product images (folder = store_id)
CREATE POLICY "product_images_member_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- Store owner/admin can update product images
CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE public.user_is_owner_or_admin(id)
    )
  );

-- Store owner/admin can delete product images
CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE public.user_is_owner_or_admin(id)
    )
  );

-- ===== PRESCRIPTIONS POLICIES =====

-- Store members can view prescriptions
CREATE POLICY "prescriptions_member_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- Store members can upload prescriptions
CREATE POLICY "prescriptions_member_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- Store owner/admin can delete prescriptions
CREATE POLICY "prescriptions_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores
      WHERE public.user_is_owner_or_admin(id)
    )
  );

-- ===== STORE-ASSETS POLICIES =====

-- Public can view store assets (logos, branding)
CREATE POLICY "store_assets_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

-- Store owner/admin can upload assets
CREATE POLICY "store_assets_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-assets'
    AND public.user_is_owner_or_admin(((storage.foldername(name))[1])::uuid)
  );

-- Store owner/admin can update assets
CREATE POLICY "store_assets_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'store-assets'
    AND public.user_is_owner_or_admin(((storage.foldername(name))[1])::uuid)
  );

-- Store owner/admin can delete assets
CREATE POLICY "store_assets_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-assets'
    AND public.user_is_owner_or_admin(((storage.foldername(name))[1])::uuid)
  );
