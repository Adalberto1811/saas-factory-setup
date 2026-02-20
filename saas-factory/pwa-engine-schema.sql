-- =====================================================
-- Synergos PWA Engine - Database Schema
-- Run this in Neon SQL Editor or via migration
-- =====================================================

-- 1. Tenants Table (Clientes del Sistema)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 2. Branding Config (Configuración Visual por Tenant)
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) DEFAULT '#6366f1',
    secondary_color VARCHAR(7) DEFAULT '#f472b6',
    background_color VARCHAR(7) DEFAULT '#0f172a',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    app_icon_url TEXT,
    pwa_name VARCHAR(50) NOT NULL,
    pwa_short_name VARCHAR(20),
    pwa_description TEXT,
    theme_color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- 3. Push Subscriptions (Suscriptores Centralizados)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    tags JSONB DEFAULT '[]',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    last_push_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(tenant_id, endpoint)
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_branding_tenant ON branding_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_push_tenant ON push_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_push_active ON push_subscriptions(is_active) WHERE is_active = true;

-- 5. Insert First Tenant: Performance Swimming Evolutions
INSERT INTO tenants (name, slug) VALUES 
    ('Performance Swimming Evolutions', 'performance-swimming')
ON CONFLICT (slug) DO NOTHING;

-- 6. Insert Branding for Performance Swimming
INSERT INTO branding_config (tenant_id, primary_color, secondary_color, pwa_name, pwa_short_name, pwa_description)
SELECT 
    id,
    '#22c55e',
    '#3b82f6',
    'PSE Coach',
    'PSE',
    'Tu asistente personal de natación impulsado por IA'
FROM tenants WHERE slug = 'performance-swimming'
ON CONFLICT (tenant_id) DO NOTHING;

-- Verification Query
SELECT t.name, t.slug, t.api_key, b.primary_color, b.pwa_name 
FROM tenants t 
LEFT JOIN branding_config b ON t.id = b.tenant_id;
