import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateIcon() {
    console.log('Actualizando icono del PWA...');

    await sql`
        UPDATE branding_config SET 
            app_icon_url = '/icons/icon-512.png'
        WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'synergos-demo')
    `;

    const result = await sql`
        SELECT t.name, t.slug, b.pwa_name, b.app_icon_url, b.primary_color 
        FROM tenants t 
        JOIN branding_config b ON t.id = b.tenant_id
    `;
    console.table(result);
    console.log('✅ Icono actualizado!');
}

updateIcon();
