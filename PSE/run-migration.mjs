// Synergos PWA Engine - Database Migration Script
// Run with: node run-migration.js

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runMigration() {
    console.log('🚀 Starting Synergos PWA Engine Migration...');
    console.log('📡 Connecting to Neon...');

    try {
        // 0. Enable required extensions
        console.log('🔧 Enabling extensions...');
        await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

        // 1. Create tenants table
        console.log('📦 Creating tenants table...');
        await sql`
            CREATE TABLE IF NOT EXISTS tenants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                api_key VARCHAR(64) UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                is_active BOOLEAN DEFAULT true
            )
        `;

        // 2. Create branding_config table
        console.log('🎨 Creating branding_config table...');
        await sql`
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
            )
        `;

        // 3. Create push_subscriptions table
        console.log('📱 Creating push_subscriptions table...');
        await sql`
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
            )
        `;

        // 4. Create indexes
        console.log('🔍 Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_branding_tenant ON branding_config(tenant_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_push_tenant ON push_subscriptions(tenant_id)`;

        // 5. Insert first tenant: Performance Swimming Evolutions
        console.log('🏊 Inserting Performance Swimming tenant...');
        await sql`
            INSERT INTO tenants (name, slug) VALUES 
                ('Performance Swimming Evolutions', 'performance-swimming')
            ON CONFLICT (slug) DO NOTHING
        `;

        // 6. Insert branding for Performance Swimming
        console.log('🎨 Inserting branding config...');
        await sql`
            INSERT INTO branding_config (tenant_id, primary_color, secondary_color, pwa_name, pwa_short_name, pwa_description)
            SELECT 
                id,
                '#22c55e',
                '#3b82f6',
                'PSE Coach',
                'PSE',
                'Tu asistente personal de natación impulsado por IA'
            FROM tenants WHERE slug = 'performance-swimming'
            ON CONFLICT (tenant_id) DO NOTHING
        `;

        // 7. Verify
        console.log('✅ Verifying...');
        const result = await sql`
            SELECT t.name, t.slug, t.api_key, b.primary_color, b.pwa_name 
            FROM tenants t 
            LEFT JOIN branding_config b ON t.id = b.tenant_id
        `;

        console.log('\n📊 Migration Results:');
        console.table(result);

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
