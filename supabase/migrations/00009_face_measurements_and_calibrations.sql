-- ============================================
-- Migration 00009: Face Measurements, Lens Calibrations
-- and Product AI Specs
-- ============================================

-- ------------------------------------------
-- 1. Face Measurements table
-- Stores face analysis results from AI Vision
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS face_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  phone TEXT, -- WhatsApp phone for anonymous measurements

  -- Core measurements (mm)
  pd NUMERIC(5,1) NOT NULL, -- Distância pupilar total
  dnp_right NUMERIC(5,1) NOT NULL, -- DNP olho direito
  dnp_left NUMERIC(5,1) NOT NULL, -- DNP olho esquerdo
  face_width NUMERIC(5,1), -- Largura do rosto
  bridge_width NUMERIC(5,1), -- Largura da ponte nasal
  temple_length NUMERIC(5,1), -- Comprimento da têmpora

  -- Classification
  face_shape TEXT CHECK (face_shape IN ('oval', 'round', 'square', 'heart', 'oblong')),
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  has_reference_card BOOLEAN DEFAULT false,

  -- Source image
  image_url TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_face_measurements_store ON face_measurements(store_id);
CREATE INDEX idx_face_measurements_customer ON face_measurements(customer_id);
CREATE INDEX idx_face_measurements_phone ON face_measurements(phone);

-- RLS
ALTER TABLE face_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view face measurements"
  ON face_measurements FOR SELECT
  USING (store_id IN (
    SELECT store_id FROM store_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Store members can insert face measurements"
  ON face_measurements FOR INSERT
  WITH CHECK (store_id IN (
    SELECT store_id FROM store_members WHERE user_id = auth.uid()
  ));

-- Service role can insert (for WhatsApp AI agent)
CREATE POLICY "Service role full access on face_measurements"
  ON face_measurements FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ------------------------------------------
-- 2. Lens Calibrations table
-- Stores lens calibration calculation results
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS lens_calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  phone TEXT,

  -- Prescription used
  prescription JSONB NOT NULL,
  -- { od: { sphere, cylinder, axis, addition }, os: { ... } }

  -- Face measurements used
  face_measurements JSONB NOT NULL,
  -- { pd, dnpRight, dnpLeft, ocHeight }

  -- Frame specs used
  frame_specs JSONB NOT NULL,
  -- { lensWidth, lensHeight, bridgeWidth, templeLength }

  -- Product reference (if a specific frame was selected)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Calibration results
  lens_type TEXT NOT NULL, -- visao-simples, bifocal, progressivo, ocupacional
  refractive_index NUMERIC(3,2) NOT NULL, -- 1.50, 1.59, 1.67, 1.74
  refractive_index_name TEXT,
  minimum_blank_size INTEGER,
  decentration NUMERIC(4,1),

  -- Per-eye results
  od_result JSONB NOT NULL,
  -- { sphericalEquivalent, opticalCenterH, opticalCenterV, estimatedEdgeThickness, estimatedCenterThickness, inducedPrism, fittingHeight }
  os_result JSONB NOT NULL,

  -- Treatments
  treatments JSONB, -- [{ name, reason, priority }]

  -- Warnings
  warnings TEXT[],

  -- Lab report (plain text)
  lab_summary TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lens_calibrations_store ON lens_calibrations(store_id);
CREATE INDEX idx_lens_calibrations_customer ON lens_calibrations(customer_id);
CREATE INDEX idx_lens_calibrations_order ON lens_calibrations(order_id);

-- RLS
ALTER TABLE lens_calibrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view lens calibrations"
  ON lens_calibrations FOR SELECT
  USING (store_id IN (
    SELECT store_id FROM store_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Store members can insert lens calibrations"
  ON lens_calibrations FOR INSERT
  WITH CHECK (store_id IN (
    SELECT store_id FROM store_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role full access on lens_calibrations"
  ON lens_calibrations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ------------------------------------------
-- 3. Add AI specs columns to products table
-- Stores the AI-analyzed product specifications
-- ------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_specs JSONB,
  ADD COLUMN IF NOT EXISTS ai_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_tags TEXT[],
  ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

-- Index for searching by AI tags
CREATE INDEX IF NOT EXISTS idx_products_ai_tags ON products USING GIN (ai_tags);

-- Comment
COMMENT ON COLUMN products.ai_specs IS 'AI-analyzed product specifications: frame shape, material, colors, dimensions, face shape compatibility, etc.';
COMMENT ON COLUMN products.ai_description IS 'AI-generated SEO description for the product';
COMMENT ON COLUMN products.ai_tags IS 'AI-generated search tags for improved discoverability';
COMMENT ON COLUMN products.ai_analyzed_at IS 'Timestamp of the last AI analysis';
