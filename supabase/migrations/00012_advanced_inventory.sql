-- ============================================
-- OCCHIALE Migration 00012
-- Advanced Inventory: Batches, Movements, ABC
-- ============================================

-- 1. Inventory Batches
CREATE TABLE IF NOT EXISTS inventory_batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  entry_date timestamptz NOT NULL DEFAULT now(),
  expiry_date timestamptz,
  entry_cost integer NOT NULL DEFAULT 0, -- In cents
  initial_qty integer NOT NULL,
  current_qty integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_batches_product ON inventory_batches(product_id);
CREATE INDEX idx_inventory_batches_expiry ON inventory_batches(expiry_date);

-- 2. Inventory Movements (Audit Log)
CREATE TYPE inventory_movement_type AS ENUM ('entry', 'sale', 'return', 'adjustment', 'transfer', 'loss');

CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES inventory_batches(id) ON DELETE SET NULL,
  type inventory_movement_type NOT NULL,
  quantity integer NOT NULL, -- Positive for entry/return, negative for sale/loss
  reason text,
  reference_id uuid, -- Order ID, Adjustment ID, etc.
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

-- 3. ABC Analysis View
-- Calculates A (top 70% revenue), B (next 20%), C (bottom 10%)
CREATE OR REPLACE VIEW inventory_abc_analysis AS
WITH product_revenue AS (
  SELECT
    p.id as product_id,
    p.store_id,
    p.name,
    p.brand,
    p.category,
    COALESCE(SUM(oi.unit_price * oi.quantity), 0) as total_revenue,
    COALESCE(SUM(oi.quantity), 0) as total_units_sold
  FROM products p
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id
  WHERE o.status != 'cancelled' OR o.status IS NULL
  GROUP BY p.id, p.store_id, p.name, p.brand, p.category
),
revenue_ranked AS (
  SELECT
    *,
    SUM(total_revenue) OVER (PARTITION BY store_id ORDER BY total_revenue DESC) as cumulative_revenue,
    SUM(total_revenue) OVER (PARTITION BY store_id) as total_store_revenue
  FROM product_revenue
),
revenue_percentage AS (
  SELECT
    *,
    CASE 
      WHEN total_store_revenue = 0 THEN 0
      ELSE (cumulative_revenue / total_store_revenue) * 100 
    END as cumulative_percentage
  FROM revenue_ranked
)
SELECT
  *,
  CASE
    WHEN cumulative_percentage <= 70 THEN 'A'
    WHEN cumulative_percentage <= 90 THEN 'B'
    ELSE 'C'
  END as abc_class
FROM revenue_percentage;

-- 4. Automatically update product.stock_qty trigger
CREATE OR REPLACE FUNCTION sync_product_stock_qty()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET stock_qty = stock_qty + NEW.quantity,
        updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET stock_qty = stock_qty - OLD.quantity,
        updated_at = now()
    WHERE id = OLD.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_product_stock_qty
AFTER INSERT OR DELETE ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION sync_product_stock_qty();
