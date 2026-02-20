-- =====================================================
-- Synergos CRM Module - Schema Extension (Pure Neon)
-- Adds Lead Tracking & Chat History to PWA Engine
-- =====================================================

-- 1. Leads / Conversations (Visitantes del Chat)
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identification
    session_id VARCHAR(100) NOT NULL, -- From Landing Page
    email VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'customer', 'archived')),
    source VARCHAR(50) DEFAULT 'landing_chat',
    
    -- Metadata
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one lead per session per tenant
    UNIQUE(tenant_id, session_id)
);

-- 2. Chat Messages (Historial)
CREATE TABLE IF NOT EXISTS crm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- Denormalized for RLS speed
    
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON crm_leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_session ON crm_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead ON crm_messages(lead_id);

-- 4. Enable RLS (Standard Postgres Security)
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Simple policies for Neon logic if needed, or leave open for service role)
-- For now, we allow the service role (used by N8N/Admin) to do everything.
-- We can add specific policies if we implement a frontend dashboard reading this directly.
CREATE POLICY "Enable read access for authenticated users" ON crm_leads FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON crm_leads USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON crm_messages FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON crm_messages USING (true) WITH CHECK (true);
