-- Insert the missing Synergos tenant for CRM integration
INSERT INTO tenants (name, slug) VALUES 
    ('Synergos Solutions', 'synergos')
ON CONFLICT (slug) DO NOTHING;

-- Verification
SELECT * FROM tenants WHERE slug = 'synergos';
