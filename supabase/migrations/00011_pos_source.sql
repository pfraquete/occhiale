-- Add source to orders to distinguish between Online and POS
ALTER TABLE orders ADD COLUMN source text DEFAULT 'online' CHECK (source IN ('online', 'pos'));

-- Optional: Add metadata for POS specific info (like specific terminal or cashier ID)
-- For now source is enough to differentiate.

-- Refresh the view/types after this
