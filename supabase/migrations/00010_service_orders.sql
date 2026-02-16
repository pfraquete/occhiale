-- Create Service Orders Table
CREATE TABLE service_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'lab_pending' CHECK (status IN (
    'lab_pending',       -- Aguardando envio para laboratório
    'waiting_material',  -- Aguardando chegada de blocos/armação
    'surfacing',        -- Em surfaçagem
    'mounting',         -- Em montagem
    'quality_control',  -- Em conferência
    'ready_for_pickup', -- Pronto para retirada
    'delivered',        -- Entregue ao cliente
    'cancelled'         -- Cancelado
  )),
  lab_name text,
  external_os_number text,
  expected_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_os_store_status ON service_orders(store_id, status);
CREATE INDEX idx_os_order_id ON service_orders(order_id);

-- Enable RLS
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- Migration Policy
CREATE POLICY "Members can manage OS" ON service_orders
  FOR ALL
  USING (store_id IN (SELECT store_id FROM public.user_store_ids()));

-- Trigger for updated_at
CREATE TRIGGER set_service_orders_updated_at
  BEFORE UPDATE ON service_orders
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);
