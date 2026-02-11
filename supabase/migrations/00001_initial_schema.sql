-- ============================================================================
-- OCCHIALE - Multi-Tenant Optical Store SaaS Platform
-- Initial Schema Migration
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS (SECURITY DEFINER - bypass RLS to avoid recursion)
-- ============================================================================

-- Function to get all store IDs that the current user is a member of
CREATE OR REPLACE FUNCTION public.user_store_ids()
RETURNS TABLE(store_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sm.store_id
  FROM public.store_members sm
  WHERE sm.user_id = auth.uid();
END;
$$;

-- Function to get the user's role for a specific store
CREATE OR REPLACE FUNCTION public.user_store_role(p_store_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.store_members
  WHERE store_id = p_store_id AND user_id = auth.uid();

  RETURN user_role;
END;
$$;

-- Function to check if user is owner or admin of a store
CREATE OR REPLACE FUNCTION public.user_is_owner_or_admin(p_store_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ===== STORES =====
CREATE TABLE stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  whatsapp_number text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

COMMENT ON TABLE stores IS 'Multi-tenant stores (óticas). Each store is isolated.';
COMMENT ON COLUMN stores.slug IS 'URL-safe unique identifier (lowercase, alphanumeric + hyphens)';
COMMENT ON COLUMN stores.settings IS 'Store-specific configuration: theme, business hours, policies, etc.';

-- ===== STORE MEMBERS =====
CREATE TABLE store_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

COMMENT ON TABLE store_members IS 'Users associated with stores and their roles';
COMMENT ON COLUMN store_members.role IS 'owner: full control, admin: manage store, member: read access';

-- ===== PRODUCTS =====
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sku text,
  name text NOT NULL,
  description text,
  description_seo text,
  price integer NOT NULL CHECK (price >= 0),
  compare_price integer CHECK (compare_price IS NULL OR compare_price >= 0),
  category text NOT NULL CHECK (category IN ('grau', 'sol', 'infantil', 'lentes', 'acessorios')),
  brand text,
  images text[] NOT NULL DEFAULT '{}',
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  stock_qty integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Optical products: frames, sunglasses, lenses, accessories';
COMMENT ON COLUMN products.price IS 'Price in cents (BRL)';
COMMENT ON COLUMN products.compare_price IS 'Original price for sale display (in cents)';
COMMENT ON COLUMN products.specs IS 'Product specifications: frame_shape, material, face_shapes, gender, color, bridge, temple_length, lens_width, etc.';

-- ===== CUSTOMERS =====
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  cpf text,
  face_shape text CHECK (face_shape IN ('oval', 'round', 'square', 'heart', 'oblong', NULL)),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ltv integer NOT NULL DEFAULT 0 CHECK (ltv >= 0),
  engagement_score integer NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  last_purchase_at timestamptz,
  nps_score integer CHECK (nps_score IS NULL OR (nps_score >= 0 AND nps_score <= 10)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, email),
  UNIQUE(store_id, phone)
);

COMMENT ON TABLE customers IS 'Store customers with CRM data';
COMMENT ON COLUMN customers.user_id IS 'Reference to auth.users if customer has an account';
COMMENT ON COLUMN customers.ltv IS 'Lifetime value in cents (BRL)';
COMMENT ON COLUMN customers.engagement_score IS 'Engagement score from 0-100';
COMMENT ON COLUMN customers.preferences IS 'Customer preferences: style, colors, brands, etc.';

-- ===== PRESCRIPTIONS =====
CREATE TABLE prescriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  od_sphere numeric(5,2),
  od_cylinder numeric(5,2),
  od_axis integer CHECK (od_axis IS NULL OR (od_axis >= 0 AND od_axis <= 180)),
  os_sphere numeric(5,2),
  os_cylinder numeric(5,2),
  os_axis integer CHECK (os_axis IS NULL OR (os_axis >= 0 AND os_axis <= 180)),
  addition numeric(4,2),
  dnp numeric(4,1),
  doctor_name text,
  doctor_crm text,
  prescription_date date,
  image_url text,
  expires_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE prescriptions IS 'Optical prescriptions for customers';
COMMENT ON COLUMN prescriptions.od_sphere IS 'Right eye sphere (OD - Olho Direito)';
COMMENT ON COLUMN prescriptions.os_sphere IS 'Left eye sphere (OS - Olho Sinistro)';
COMMENT ON COLUMN prescriptions.dnp IS 'Near pupillary distance in mm';
COMMENT ON COLUMN prescriptions.image_url IS 'URL to prescription image in Supabase Storage';

-- ===== ORDERS =====
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  shipping_cost integer NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  discount integer NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total integer NOT NULL CHECK (total >= 0),
  payment_method text CHECK (payment_method IN ('pix', 'credit_card', 'boleto', 'whatsapp')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  shipping_address jsonb,
  shipping_tracking text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, order_number)
);

COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON COLUMN orders.order_number IS 'Auto-generated order number (store-scoped)';
COMMENT ON COLUMN orders.subtotal IS 'Subtotal in cents (BRL)';
COMMENT ON COLUMN orders.total IS 'Final total in cents (BRL)';
COMMENT ON COLUMN orders.payment_id IS 'External payment provider ID (Stripe, Mercado Pago, etc.)';

-- ===== ORDER ITEMS =====
CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  lens_config jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE order_items IS 'Line items for orders';
COMMENT ON COLUMN order_items.unit_price IS 'Unit price in cents (BRL) at time of purchase';
COMMENT ON COLUMN order_items.lens_config IS 'Lens configuration: lens_type, lens_material, treatments[], prescription_id';

-- ===== WHATSAPP CONVERSATIONS =====
CREATE TABLE whatsapp_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  phone text NOT NULL,
  agent_state text NOT NULL DEFAULT 'idle' CHECK (agent_state IN ('idle', 'greeting', 'browsing', 'recommending', 'prescription', 'checkout', 'support', 'human_takeover')),
  is_ai_active boolean NOT NULL DEFAULT true,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative', NULL)),
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, phone)
);

COMMENT ON TABLE whatsapp_conversations IS 'WhatsApp conversation threads with AI agent state';
COMMENT ON COLUMN whatsapp_conversations.agent_state IS 'Current state of the AI agent in the conversation flow';
COMMENT ON COLUMN whatsapp_conversations.is_ai_active IS 'Whether AI agent is actively handling conversation or handed off to human';

-- ===== WHATSAPP MESSAGES =====
CREATE TABLE whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('customer', 'assistant', 'system')),
  content text NOT NULL,
  media_url text,
  media_type text,
  tool_calls jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE whatsapp_messages IS 'Individual messages within WhatsApp conversations';
COMMENT ON COLUMN whatsapp_messages.tool_calls IS 'Array of function calls made by AI agent (search products, create order, etc.)';

-- ===== SEO PAGES =====
CREATE TABLE seo_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  meta_description text,
  content_html text,
  schema_json jsonb,
  page_type text NOT NULL CHECK (page_type IN ('category', 'brand', 'guide', 'blog', 'landing')),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

COMMENT ON TABLE seo_pages IS 'SEO-optimized pages for organic traffic';
COMMENT ON COLUMN seo_pages.schema_json IS 'Schema.org structured data (JSON-LD)';

-- ===== CRM AUTOMATIONS =====
CREATE TABLE crm_automations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('post_purchase', 'birthday', 'prescription_expiring', 'inactivity', 'nps_detractor', 'lens_reorder', 'abandoned_cart')),
  delay_hours integer NOT NULL DEFAULT 0 CHECK (delay_hours >= 0),
  action_type text NOT NULL CHECK (action_type IN ('whatsapp_message', 'email', 'internal_alert', 'tag_customer')),
  template text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE crm_automations IS 'Automated CRM workflows and triggers';
COMMENT ON COLUMN crm_automations.delay_hours IS 'Delay in hours before executing the action';
COMMENT ON COLUMN crm_automations.template IS 'Message template with variable placeholders';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Stores
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_slug ON stores(slug);

-- Store Members
CREATE INDEX idx_store_members_store_id ON store_members(store_id);
CREATE INDEX idx_store_members_user_id ON store_members(user_id);

-- Products
CREATE INDEX idx_products_store_id_active ON products(store_id, is_active);
CREATE INDEX idx_products_store_id_category ON products(store_id, category);
CREATE INDEX idx_products_store_id_brand ON products(store_id, brand);

-- Customers
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_store_id_phone ON customers(store_id, phone);
CREATE INDEX idx_customers_store_id_email ON customers(store_id, email);
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Prescriptions
CREATE INDEX idx_prescriptions_customer_id ON prescriptions(customer_id);
CREATE INDEX idx_prescriptions_store_id ON prescriptions(store_id);

-- Orders
CREATE INDEX idx_orders_store_id_status ON orders(store_id, status);
CREATE INDEX idx_orders_store_id_created_at ON orders(store_id, created_at DESC);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- WhatsApp Conversations
CREATE INDEX idx_whatsapp_conversations_store_id_last_message ON whatsapp_conversations(store_id, last_message_at DESC);
CREATE INDEX idx_whatsapp_conversations_customer_id ON whatsapp_conversations(customer_id);

-- WhatsApp Messages
CREATE INDEX idx_whatsapp_messages_conversation_id_created_at ON whatsapp_messages(conversation_id, created_at);

-- SEO Pages
CREATE INDEX idx_seo_pages_store_id_page_type ON seo_pages(store_id, page_type);
CREATE INDEX idx_seo_pages_store_id_slug ON seo_pages(store_id, slug);

-- CRM Automations
CREATE INDEX idx_crm_automations_store_id ON crm_automations(store_id);

-- ============================================================================
-- TRIGGERS - AUTO UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_automations_updated_at
  BEFORE UPDATE ON crm_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automations ENABLE ROW LEVEL SECURITY;

-- ===== STORES POLICIES =====
-- Owner can do everything
CREATE POLICY stores_owner_all ON stores
  FOR ALL
  USING (owner_id = auth.uid());

-- Members can read stores they belong to
CREATE POLICY stores_members_select ON stores
  FOR SELECT
  USING (id IN (SELECT store_id FROM public.user_store_ids()));

-- ===== STORE MEMBERS POLICIES =====
-- Owner/admin can manage members
CREATE POLICY store_members_owner_admin_all ON store_members
  FOR ALL
  USING (public.user_is_owner_or_admin(store_id));

-- Members can read their own membership
CREATE POLICY store_members_self_select ON store_members
  FOR SELECT
  USING (user_id = auth.uid());

-- ===== PRODUCTS POLICIES =====
-- Members can read products from their stores
CREATE POLICY products_members_select ON products
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY products_owner_admin_insert ON products
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY products_owner_admin_update ON products
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY products_owner_admin_delete ON products
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== CUSTOMERS POLICIES =====
-- Members can read customers from their stores
CREATE POLICY customers_members_select ON customers
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY customers_owner_admin_insert ON customers
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY customers_owner_admin_update ON customers
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY customers_owner_admin_delete ON customers
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== PRESCRIPTIONS POLICIES =====
-- Members can read prescriptions from their stores
CREATE POLICY prescriptions_members_select ON prescriptions
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY prescriptions_owner_admin_insert ON prescriptions
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY prescriptions_owner_admin_update ON prescriptions
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY prescriptions_owner_admin_delete ON prescriptions
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== ORDERS POLICIES =====
-- Members can read orders from their stores
CREATE POLICY orders_members_select ON orders
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY orders_owner_admin_insert ON orders
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY orders_owner_admin_update ON orders
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY orders_owner_admin_delete ON orders
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== ORDER ITEMS POLICIES =====
-- Members can read order items from their stores (join through orders)
CREATE POLICY order_items_members_select ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- Owner/admin can insert/update/delete (join through orders)
CREATE POLICY order_items_owner_admin_insert ON order_items
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

CREATE POLICY order_items_owner_admin_update ON order_items
  FOR UPDATE
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

CREATE POLICY order_items_owner_admin_delete ON order_items
  FOR DELETE
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

-- ===== WHATSAPP CONVERSATIONS POLICIES =====
-- Members can read conversations from their stores
CREATE POLICY whatsapp_conversations_members_select ON whatsapp_conversations
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY whatsapp_conversations_owner_admin_insert ON whatsapp_conversations
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY whatsapp_conversations_owner_admin_update ON whatsapp_conversations
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY whatsapp_conversations_owner_admin_delete ON whatsapp_conversations
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== WHATSAPP MESSAGES POLICIES =====
-- Members can read messages from their stores (join through conversations)
CREATE POLICY whatsapp_messages_members_select ON whatsapp_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE store_id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- Owner/admin can insert/update/delete (join through conversations)
CREATE POLICY whatsapp_messages_owner_admin_insert ON whatsapp_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

CREATE POLICY whatsapp_messages_owner_admin_update ON whatsapp_messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

CREATE POLICY whatsapp_messages_owner_admin_delete ON whatsapp_messages
  FOR DELETE
  USING (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE public.user_is_owner_or_admin(store_id)
    )
  );

-- ===== SEO PAGES POLICIES =====
-- Members can read SEO pages from their stores
CREATE POLICY seo_pages_members_select ON seo_pages
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY seo_pages_owner_admin_insert ON seo_pages
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY seo_pages_owner_admin_update ON seo_pages
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY seo_pages_owner_admin_delete ON seo_pages
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ===== CRM AUTOMATIONS POLICIES =====
-- Members can read CRM automations from their stores
CREATE POLICY crm_automations_members_select ON crm_automations
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Owner/admin can insert/update/delete
CREATE POLICY crm_automations_owner_admin_insert ON crm_automations
  FOR INSERT
  WITH CHECK (public.user_is_owner_or_admin(store_id));

CREATE POLICY crm_automations_owner_admin_update ON crm_automations
  FOR UPDATE
  USING (public.user_is_owner_or_admin(store_id));

CREATE POLICY crm_automations_owner_admin_delete ON crm_automations
  FOR DELETE
  USING (public.user_is_owner_or_admin(store_id));

-- ============================================================================
-- STORAGE BUCKETS CONFIGURATION
-- ============================================================================

/*
IMPORTANT: Create the following storage buckets manually in the Supabase Dashboard
after running this migration:

1. BUCKET: product-images
   - Type: Public
   - Purpose: Product photos visible to all visitors
   - RLS Policy: Allow public read, only store members can upload/update/delete
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

2. BUCKET: prescriptions
   - Type: Private
   - Purpose: Customer prescription images (LGPD/HIPAA sensitive data)
   - RLS Policy: Only store members can read/upload/update/delete
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, application/pdf

3. BUCKET: store-assets
   - Type: Private
   - Purpose: Store logos, banners, marketing materials
   - RLS Policy: Only store owner/admin can upload/update/delete, members can read
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/svg+xml

EXAMPLE STORAGE POLICY (apply via Supabase Dashboard or SQL):

-- For product-images bucket (public read, store members can write)
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Store members can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- For prescriptions bucket (private, only store members)
CREATE POLICY "Store members can manage prescriptions"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

-- For store-assets bucket (owner/admin write, members read)
CREATE POLICY "Store members can view assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM stores WHERE id IN (SELECT store_id FROM public.user_store_ids())
    )
  );

CREATE POLICY "Store owner/admin can manage assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-assets'
    AND public.user_is_owner_or_admin(((storage.foldername(name))[1])::uuid)
  );
*/

-- ============================================================================
-- INITIAL DATA & HELPER TRIGGERS
-- ============================================================================

-- Trigger to auto-create store_member record when a store is created
CREATE OR REPLACE FUNCTION create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_members (store_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_owner_membership_trigger
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_membership();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
