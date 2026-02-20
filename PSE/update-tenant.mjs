// Quick update script for tenant name
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function update() {
    console.log('Updating tenant...');

    await sql`UPDATE tenants SET name = 'Synergos Showcase', slug = 'synergos-demo' WHERE slug = 'performance-swimming'`;

    await sql`UPDATE branding_config SET 
        pwa_name = 'Synergos IA', 
        pwa_short_name = 'SynIA', 
        pwa_description = 'Tu asistente empresarial impulsado por IA',
        primary_color = '#6366f1'
    WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'synergos-demo')`;

    const result = await sql`SELECT t.name, t.slug, t.api_key, b.pwa_name, b.primary_color FROM tenants t JOIN branding_config b ON t.id = b.tenant_id`;
    console.table(result);
    console.log('✅ Done!');
}

update();
