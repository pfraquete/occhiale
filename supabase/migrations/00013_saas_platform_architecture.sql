-- ============================================================================
-- OCCHIALE - SaaS Platform Architecture Migration
-- Adds: Organizations, RBAC, Billing, Audit Logs, Feature Flags
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZATIONS (Multi-Tenant Layer)
-- ============================================================================

CREATE TABLE organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT org_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

COMMENT ON TABLE organizations IS 'Top-level multi-tenant entity. Each organization owns stores and resources.';

-- ===== MEMBERSHIPS =====
CREATE TABLE memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid, -- FK added after roles table creation
  is_active boolean NOT NULL DEFAULT true,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

COMMENT ON TABLE memberships IS 'User membership in organizations with role assignment.';

-- Link stores to organizations
ALTER TABLE stores ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_stores_organization_id ON stores(organization_id);
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

-- ============================================================================
-- 2. RBAC (Role-Based Access Control)
-- ============================================================================

CREATE TABLE roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

COMMENT ON TABLE roles IS 'Roles for RBAC. System roles (is_system=true) are global defaults.';

CREATE TABLE permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(resource, action)
);

COMMENT ON TABLE permissions IS 'Granular permissions: resource + action pairs.';
COMMENT ON COLUMN permissions.resource IS 'Resource identifier: products, orders, customers, billing, settings, etc.';
COMMENT ON COLUMN permissions.action IS 'Action: create, read, update, delete, manage, export';

CREATE TABLE role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Junction table linking roles to their permissions.';

-- Add FK to memberships after roles table exists
ALTER TABLE memberships ADD CONSTRAINT memberships_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

CREATE INDEX idx_roles_organization_id ON roles(organization_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- ============================================================================
-- 3. BILLING ENGINE
-- ============================================================================

CREATE TABLE subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  price_monthly integer NOT NULL DEFAULT 0 CHECK (price_monthly >= 0),
  price_yearly integer NOT NULL DEFAULT 0 CHECK (price_yearly >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing in cents (BRL).';

CREATE TABLE plan_features (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  feature_value jsonb NOT NULL DEFAULT 'true'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

COMMENT ON TABLE plan_features IS 'Features included in each plan. feature_value can be boolean, number (limit), or string.';
COMMENT ON COLUMN plan_features.feature_key IS 'Feature identifier: max_products, max_stores, advanced_reports, ai_chat, whatsapp_integration, etc.';

CREATE TABLE tenant_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'paused')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  trial_end timestamptz,
  cancel_at timestamptz,
  cancelled_at timestamptz,
  payment_provider text CHECK (payment_provider IN ('stripe', 'pagarme', 'manual')),
  payment_provider_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tenant_subscriptions IS 'Active subscriptions linking organizations to plans.';

CREATE TABLE usage_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_value integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, metric_key, period_start)
);

COMMENT ON TABLE usage_tracking IS 'Tracks resource usage per organization per billing period.';
COMMENT ON COLUMN usage_tracking.metric_key IS 'Metric identifier: api_calls, storage_mb, products_count, orders_count, ai_messages, etc.';

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_tenant_subscriptions_org_id ON tenant_subscriptions(organization_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_usage_tracking_org_period ON usage_tracking(organization_id, period_start);

-- ============================================================================
-- 4. AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all important actions.';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: create, update, delete, login, export, invite, etc.';
COMMENT ON COLUMN audit_logs.entity IS 'Entity type: product, order, customer, member, settings, etc.';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity.';

CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- 5. FEATURE FLAGS & EXPERIMENTS
-- ============================================================================

CREATE TABLE feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_organizations uuid[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE feature_flags IS 'Global feature flags for gradual rollout and experimentation.';
COMMENT ON COLUMN feature_flags.rollout_percentage IS 'Percentage of organizations that see this feature (0-100).';
COMMENT ON COLUMN feature_flags.allowed_organizations IS 'Specific organization IDs that always have access.';

CREATE TABLE experiments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE experiments IS 'A/B testing experiments with variant definitions.';
COMMENT ON COLUMN experiments.variants IS 'Array of {key, name, weight} variant objects.';

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);
CREATE INDEX idx_experiments_key ON experiments(key);
CREATE INDEX idx_experiments_active ON experiments(is_active);

-- ============================================================================
-- 6. SEED: DEFAULT ROLES & PERMISSIONS
-- ============================================================================

-- System permissions
INSERT INTO permissions (resource, action, description) VALUES
  ('organization', 'manage', 'Full organization management'),
  ('members', 'create', 'Invite new members'),
  ('members', 'read', 'View team members'),
  ('members', 'update', 'Update member roles'),
  ('members', 'delete', 'Remove members'),
  ('billing', 'manage', 'Manage subscriptions and billing'),
  ('products', 'create', 'Create products'),
  ('products', 'read', 'View products'),
  ('products', 'update', 'Update products'),
  ('products', 'delete', 'Delete products'),
  ('products', 'export', 'Export product data'),
  ('orders', 'create', 'Create orders'),
  ('orders', 'read', 'View orders'),
  ('orders', 'update', 'Update order status'),
  ('orders', 'delete', 'Cancel/delete orders'),
  ('orders', 'export', 'Export order data'),
  ('customers', 'create', 'Create customers'),
  ('customers', 'read', 'View customers'),
  ('customers', 'update', 'Update customer data'),
  ('customers', 'delete', 'Delete customers'),
  ('customers', 'export', 'Export customer data'),
  ('analytics', 'read', 'View analytics dashboards'),
  ('analytics', 'export', 'Export analytics data'),
  ('settings', 'manage', 'Manage store/org settings'),
  ('whatsapp', 'manage', 'Manage WhatsApp integration'),
  ('whatsapp', 'read', 'View WhatsApp conversations'),
  ('pos', 'use', 'Use point of sale'),
  ('inventory', 'manage', 'Manage inventory'),
  ('inventory', 'read', 'View inventory'),
  ('crm', 'manage', 'Manage CRM automations'),
  ('crm', 'read', 'View CRM data'),
  ('fiscal', 'manage', 'Manage fiscal/tax settings'),
  ('fiscal', 'read', 'View fiscal data'),
  ('audit', 'read', 'View audit logs'),
  ('feature_flags', 'manage', 'Manage feature flags (superadmin)')
ON CONFLICT (resource, action) DO NOTHING;

-- System roles (organization_id = NULL means global template)
INSERT INTO roles (organization_id, name, description, is_system) VALUES
  (NULL, 'owner', 'Organization owner with full access', true),
  (NULL, 'admin', 'Administrator with broad access', true),
  (NULL, 'manager', 'Manager with operational access', true),
  (NULL, 'member', 'Regular team member with limited access', true),
  (NULL, 'viewer', 'Read-only access', true);

-- Assign permissions to system roles
-- Owner gets everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'owner' AND r.is_system = true;

-- Admin gets everything except org management and feature flags
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'admin' AND r.is_system = true
  AND NOT (p.resource = 'organization' AND p.action = 'manage')
  AND NOT (p.resource = 'feature_flags' AND p.action = 'manage');

-- Manager gets operational permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'manager' AND r.is_system = true
  AND NOT (p.resource IN ('organization', 'billing', 'feature_flags', 'audit'))
  AND NOT (p.action = 'delete' AND p.resource IN ('members'))
  AND NOT (p.resource = 'settings' AND p.action = 'manage');

-- Member gets read + basic operational
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'member' AND r.is_system = true
  AND (
    p.action = 'read'
    OR (p.resource = 'orders' AND p.action IN ('create', 'update'))
    OR (p.resource = 'customers' AND p.action IN ('create', 'update'))
    OR (p.resource = 'pos' AND p.action = 'use')
  );

-- Viewer gets read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'viewer' AND r.is_system = true
  AND p.action = 'read';

-- ============================================================================
-- 7. SEED: DEFAULT SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, sort_order) VALUES
  ('Free', 'free', 'Para começar. Até 50 produtos e 1 loja.', 0, 0, 0),
  ('Starter', 'starter', 'Para pequenas óticas. Até 500 produtos e 2 lojas.', 9900, 99900, 1),
  ('Pro', 'pro', 'Para óticas em crescimento. Produtos ilimitados e 5 lojas.', 29900, 299900, 2),
  ('Enterprise', 'enterprise', 'Para redes de óticas. Tudo ilimitado + suporte dedicado.', 99900, 999900, 3);

-- Plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value) VALUES
  -- Free plan
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'max_products', '50'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'max_stores', '1'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'max_members', '2'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'whatsapp_integration', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'ai_chat', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'advanced_reports', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'pos', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'crm_automations', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'fiscal_integration', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'free'), 'custom_domain', 'false'),
  -- Starter plan
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'max_products', '500'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'max_stores', '2'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'max_members', '5'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'whatsapp_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'ai_chat', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'advanced_reports', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'pos', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'crm_automations', 'false'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'fiscal_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'starter'), 'custom_domain', 'false'),
  -- Pro plan
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'max_products', '-1'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'max_stores', '5'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'max_members', '15'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'whatsapp_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'ai_chat', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'advanced_reports', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'pos', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'crm_automations', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'fiscal_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'pro'), 'custom_domain', 'true'),
  -- Enterprise plan
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'max_products', '-1'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'max_stores', '-1'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'max_members', '-1'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'whatsapp_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'ai_chat', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'advanced_reports', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'pos', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'crm_automations', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'fiscal_integration', 'true'),
  ((SELECT id FROM subscription_plans WHERE slug = 'enterprise'), 'custom_domain', 'true');

-- ============================================================================
-- 8. RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Helper: get organization IDs for the current user
CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS TABLE(organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.organization_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid() AND m.is_active = true;
END;
$$;

-- Organizations: owner can manage, members can read
CREATE POLICY organizations_owner_all ON organizations
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY organizations_members_select ON organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Memberships: org members can read, owner/admin can manage
CREATE POLICY memberships_select ON memberships
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

CREATE POLICY memberships_self_select ON memberships
  FOR SELECT USING (user_id = auth.uid());

-- Roles & Permissions: readable by anyone (system data)
CREATE POLICY roles_select ON roles
  FOR SELECT USING (true);

CREATE POLICY permissions_select ON permissions
  FOR SELECT USING (true);

CREATE POLICY role_permissions_select ON role_permissions
  FOR SELECT USING (true);

-- Subscription plans & features: publicly readable
CREATE POLICY plans_select ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY plan_features_select ON plan_features
  FOR SELECT USING (true);

-- Tenant subscriptions: org members can read
CREATE POLICY tenant_subscriptions_select ON tenant_subscriptions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Usage tracking: org members can read
CREATE POLICY usage_tracking_select ON usage_tracking
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Audit logs: org members can read
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Feature flags: publicly readable
CREATE POLICY feature_flags_select ON feature_flags
  FOR SELECT USING (true);

-- Experiments: publicly readable
CREATE POLICY experiments_select ON experiments
  FOR SELECT USING (true);

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
  BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create membership when organization is created
CREATE OR REPLACE FUNCTION create_owner_org_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO memberships (organization_id, user_id, role_id, accepted_at)
  VALUES (
    NEW.id,
    NEW.owner_id,
    (SELECT id FROM roles WHERE name = 'owner' AND is_system = true LIMIT 1),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_org_owner_membership_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_org_membership();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
