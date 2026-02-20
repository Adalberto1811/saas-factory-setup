-- =====================================================
-- Ads Generator Module - Schema Extension
-- Adds Batch Generation & Whisk Automator Linking
-- =====================================================

CREATE TABLE IF NOT EXISTS ads_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    business_idea TEXT NOT NULL,
    prompts JSONB NOT NULL, -- Array of strings (the 20 prompts)
    image_urls JSONB DEFAULT '[]', -- Array of strings (linked after Whisk generation)
    
    character_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_ads_batch_tenant ON ads_batch(tenant_id);

-- Enable RLS
ALTER TABLE ads_batch ENABLE ROW LEVEL SECURITY;

-- Allow service role access
CREATE POLICY "Enable all access for service role" ON ads_batch USING (true) WITH CHECK (true);
