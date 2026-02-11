-- ============================================
-- OCCHIALE Migration 00004
-- NOTIFY trigger for Meilisearch sync
-- Fires on product INSERT/UPDATE/DELETE
-- ============================================

-- Create a function that sends a NOTIFY event when products change.
-- This can be used by a listener (e.g., Supabase webhook or custom listener)
-- to trigger Meilisearch re-indexing for the affected store.

CREATE OR REPLACE FUNCTION notify_product_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  affected_store_id uuid;
BEGIN
  -- Determine the affected store_id
  IF TG_OP = 'DELETE' THEN
    affected_store_id := OLD.store_id;
  ELSE
    affected_store_id := NEW.store_id;
  END IF;

  -- Build the notification payload
  payload := jsonb_build_object(
    'operation', TG_OP,
    'store_id', affected_store_id,
    'product_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    'timestamp', now()
  );

  -- Send notification on the 'product_changes' channel
  PERFORM pg_notify('product_changes', payload::text);

  -- Return the appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach the trigger to the products table
DROP TRIGGER IF EXISTS trg_product_change_notify ON products;

CREATE TRIGGER trg_product_change_notify
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_product_change();

-- Add a comment explaining the purpose
COMMENT ON FUNCTION notify_product_change() IS
  'Sends a pg_notify event on the product_changes channel whenever a product is inserted, updated, or deleted. Used to trigger Meilisearch re-indexing.';
