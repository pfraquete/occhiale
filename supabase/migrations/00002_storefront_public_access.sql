-- ============================================
-- Migration 00002: Storefront Public Access
-- Allow anonymous visitors to see active stores and products
-- Allow authenticated consumers to see their own data
-- ============================================

-- 1. Public access to active stores (anonymous visitors)
CREATE POLICY "stores_public_select" ON public.stores
  FOR SELECT
  USING (is_active = true);

-- 2. Public access to active products of active stores
CREATE POLICY "products_public_select" ON public.products
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = products.store_id AND s.is_active = true
    )
  );

-- 3. Authenticated consumers can see their own customer records
CREATE POLICY "customers_self_select" ON public.customers
  FOR SELECT
  USING (user_id = auth.uid());

-- 4. Authenticated consumers can update their own customer records
CREATE POLICY "customers_self_update" ON public.customers
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Authenticated consumers can see their own orders (via customer.user_id)
CREATE POLICY "orders_customer_select" ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = orders.customer_id AND c.user_id = auth.uid()
    )
  );

-- 6. Authenticated consumers can see items of their own orders
CREATE POLICY "order_items_customer_select" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id AND c.user_id = auth.uid()
    )
  );
