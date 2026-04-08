-- ============================================================================
-- Digital Pixel Studio - Project Management Platform
-- Supabase Schema Migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'pm', 'vendedor', 'finance');

CREATE TYPE business_unit AS ENUM ('pixel-factory', 'oromo', 'picbox');

CREATE TYPE project_status AS ENUM (
  'pendiente',
  'presupuesto_confirmado',
  'en_operacion',
  'operado',
  'finalizado',
  'cancelado'
);

CREATE TYPE payment_status AS ENUM ('pagado_100', 'parcial', 'pendiente');

CREATE TYPE sync_status AS ENUM ('running', 'success', 'error');

CREATE TYPE comision_rol AS ENUM (
  'vendedor',
  'pm',
  'productor',
  'direccion_ventas',
  'direccion_operacion'
);

-- ============================================================================
-- 2. UTILITY: updated_at TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- 3a. users - Team members linked to Supabase Auth
-- --------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE REFERENCES auth.users(id),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'vendedor',
  hubspot_owner_id TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- 3b. projects - Sourced from HubSpot deals
-- --------------------------------------------------------------------------
CREATE TABLE projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hubspot_deal_id       TEXT UNIQUE,
  deal_name             TEXT NOT NULL,
  business_unit         business_unit,
  vendedor_id           UUID REFERENCES users(id),
  pm_id                 UUID REFERENCES users(id),
  product_type          TEXT,
  event_date            DATE,
  close_date            DATE,
  currency              TEXT NOT NULL DEFAULT 'MXN',
  status                project_status NOT NULL DEFAULT 'pendiente',
  payment_status        payment_status NOT NULL DEFAULT 'pendiente',
  notes                 TEXT,
  anticipo_requerido    NUMERIC(12,2),
  anticipo_pagado       BOOLEAN DEFAULT FALSE,
  fecha_limite_pago     DATE,
  presupuesto_confirmado BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- 3c. project_financials - 1:1 with projects
-- --------------------------------------------------------------------------
CREATE TABLE project_financials (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Venta
  venta_presupuesto       NUMERIC(12,2) DEFAULT 0,
  venta_real              NUMERIC(12,2) DEFAULT 0,

  -- Costos
  costos_presupuesto      NUMERIC(12,2) DEFAULT 0,
  costos_real             NUMERIC(12,2) DEFAULT 0,

  -- Gasolina
  gasolina_presupuesto    NUMERIC(12,2) DEFAULT 0,
  gasolina_real           NUMERIC(12,2) DEFAULT 0,

  -- Internet
  internet_presupuesto    NUMERIC(12,2) DEFAULT 0,
  internet_real           NUMERIC(12,2) DEFAULT 0,

  -- Operacion
  operacion_presupuesto   NUMERIC(12,2) DEFAULT 0,
  operacion_real          NUMERIC(12,2) DEFAULT 0,

  -- Instalacion
  instalacion_presupuesto NUMERIC(12,2) DEFAULT 0,
  instalacion_real        NUMERIC(12,2) DEFAULT 0,

  -- Ubers
  ubers_presupuesto       NUMERIC(12,2) DEFAULT 0,
  ubers_real              NUMERIC(12,2) DEFAULT 0,

  -- Extras
  extras_presupuesto      NUMERIC(12,2) DEFAULT 0,
  extras_real             NUMERIC(12,2) DEFAULT 0,

  -- Viaticos
  viaticos_venta          NUMERIC(12,2) DEFAULT 0,
  viaticos_gasto          NUMERIC(12,2) DEFAULT 0,
  viaticos_uber           NUMERIC(12,2) DEFAULT 0,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_project_financials_updated_at
  BEFORE UPDATE ON project_financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- 3d. hubspot_sync_log - Tracks sync operations
-- --------------------------------------------------------------------------
CREATE TABLE hubspot_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type       TEXT NOT NULL,
  status          sync_status NOT NULL DEFAULT 'running',
  deals_synced    INTEGER DEFAULT 0,
  deals_created   INTEGER DEFAULT 0,
  deals_updated   INTEGER DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- --------------------------------------------------------------------------
-- 3e. comision_reglas - Commission rules
-- --------------------------------------------------------------------------
CREATE TABLE comision_reglas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rol             comision_rol NOT NULL,
  porcentaje      NUMERIC(5,2) NOT NULL,
  base_calculo    TEXT NOT NULL DEFAULT 'utilidad_bruta',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_comision_reglas_updated_at
  BEFORE UPDATE ON comision_reglas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX idx_users_auth_id           ON users(auth_id);
CREATE INDEX idx_users_hubspot_owner_id  ON users(hubspot_owner_id);

CREATE INDEX idx_projects_hubspot_deal_id ON projects(hubspot_deal_id);
CREATE INDEX idx_projects_vendedor_id     ON projects(vendedor_id);
CREATE INDEX idx_projects_pm_id           ON projects(pm_id);
CREATE INDEX idx_projects_status          ON projects(status);
CREATE INDEX idx_projects_event_date      ON projects(event_date);

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubspot_sync_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comision_reglas    ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role from the users table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's id from the users table
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------------
-- 5a. users table policies
-- --------------------------------------------------------------------------

-- Admin: full access
CREATE POLICY "admin_users_all" ON users
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Everyone else: read all users (needed for UI lookups)
CREATE POLICY "authenticated_users_select" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- --------------------------------------------------------------------------
-- 5b. projects table policies
-- --------------------------------------------------------------------------

-- Admin: full access
CREATE POLICY "admin_projects_all" ON projects
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Finance: read all projects
CREATE POLICY "finance_projects_select" ON projects
  FOR SELECT USING (get_user_role() = 'finance');

-- Vendedores: see only their own projects
CREATE POLICY "vendedor_projects_select" ON projects
  FOR SELECT USING (
    get_user_role() = 'vendedor'
    AND vendedor_id = get_user_id()
  );

-- PMs: see their assigned projects
CREATE POLICY "pm_projects_select" ON projects
  FOR SELECT USING (
    get_user_role() = 'pm'
    AND pm_id = get_user_id()
  );

-- --------------------------------------------------------------------------
-- 5c. project_financials table policies
-- --------------------------------------------------------------------------

-- Admin: full access
CREATE POLICY "admin_financials_all" ON project_financials
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Finance: read all financials
CREATE POLICY "finance_financials_select" ON project_financials
  FOR SELECT USING (get_user_role() = 'finance');

-- Vendedores: see financials of their own projects
CREATE POLICY "vendedor_financials_select" ON project_financials
  FOR SELECT USING (
    get_user_role() = 'vendedor'
    AND project_id IN (
      SELECT id FROM projects WHERE vendedor_id = get_user_id()
    )
  );

-- PMs: see financials of their assigned projects
CREATE POLICY "pm_financials_select" ON project_financials
  FOR SELECT USING (
    get_user_role() = 'pm'
    AND project_id IN (
      SELECT id FROM projects WHERE pm_id = get_user_id()
    )
  );

-- --------------------------------------------------------------------------
-- 5d. hubspot_sync_log policies
-- --------------------------------------------------------------------------

-- Admin: full access
CREATE POLICY "admin_sync_log_all" ON hubspot_sync_log
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- 5e. comision_reglas policies
-- --------------------------------------------------------------------------

-- Admin: full access
CREATE POLICY "admin_comision_all" ON comision_reglas
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Everyone else: read commission rules
CREATE POLICY "authenticated_comision_select" ON comision_reglas
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 6. SEED DATA
-- ============================================================================

-- --------------------------------------------------------------------------
-- 6a. Commission rules
-- --------------------------------------------------------------------------
INSERT INTO comision_reglas (rol, porcentaje, base_calculo) VALUES
  ('vendedor',            4.50, 'utilidad_bruta'),
  ('pm',                  3.00, 'utilidad_bruta'),
  ('productor',           2.00, 'utilidad_bruta'),
  ('direccion_operacion', 0.75, 'utilidad_bruta'),
  ('direccion_ventas',    0.75, 'utilidad_bruta');

-- --------------------------------------------------------------------------
-- 6b. Team members (auth_id left NULL until they sign up in Supabase Auth)
-- --------------------------------------------------------------------------
INSERT INTO users (email, full_name, role, hubspot_owner_id, is_active) VALUES
  ('daniel@digitalpixel.studio',  'Daniel Cebada',      'admin',    '26405238',  TRUE),
  ('pris@digitalpixel.studio',    'Pricila Dominguez',  'vendedor', '26395721',  TRUE),
  ('gaby@digitalpixel.studio',    'Gabriela Gutierrez', 'vendedor', '414692018', TRUE),
  ('mar@digitalpixel.studio',     'Maria Gaytan',       'vendedor', '618845046', TRUE),
  ('samuel@digitalpixel.studio',  'Samuel Hernandez',   'vendedor', NULL,        FALSE),
  ('joyce@digitalpixel.studio',   'Joyce Perez',        'pm',       NULL,        TRUE),
  ('oscar@digitalpixel.studio',   'Oscar Andrade',      'pm',       NULL,        TRUE),
  ('alvaro@pixelplay.mx',         'Alvaro Solis',       'pm',       NULL,        TRUE),
  ('joel@digitalpixel.studio',    'Joel Rivera',        'pm',       NULL,        TRUE),
  ('lalo@digitalpixel.studio',    'Eduardo Martinez',   'pm',       NULL,        TRUE),
  ('marlene@digitalpixel.studio', 'Marlene Rosas',      'finance',  NULL,        TRUE),
  ('diana@digitalpixel.studio',   'Diana Lopez',        'pm',       NULL,        TRUE),
  ('ivan@digitalpixel.studio',    'Ivan Torres',        'pm',       NULL,        TRUE),
  ('harol@digitalpixel.studio',   'Harol Sanchez',      'vendedor', '88208161',  TRUE),
  ('erick@digitalpixel.studio',   'Erick Ramirez',      'vendedor', '80956812',  TRUE);

-- ============================================================================
-- Done. All tables, indexes, RLS policies, and seed data are ready.
-- ============================================================================
