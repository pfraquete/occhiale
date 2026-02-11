-- ============================================
-- OCCHIALE Migration 00006
-- Atomic stock decrement + restore functions
-- Prevents race conditions on concurrent checkouts
-- ============================================

-- Atomically decrement stock. Returns false if insufficient stock.
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE products
  SET stock_qty = stock_qty - p_quantity,
      updated_at = now()
  WHERE id = p_product_id
    AND stock_qty >= p_quantity;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Restore stock (e.g., when payment fails or order is cancelled).
CREATE OR REPLACE FUNCTION restore_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock_qty = stock_qty + p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;
