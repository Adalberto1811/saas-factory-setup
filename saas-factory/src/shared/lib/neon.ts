import { neon } from '@neondatabase/serverless';

// Neon Database Connection (Server-only)
const sql = typeof window === 'undefined'
    ? neon(process.env.DATABASE_URL || '')
    : (() => {
        // En el cliente, devolvemos un proxy que falla descriptivamente si se intenta usar
        return new Proxy(() => { }, {
            get() { throw new Error("Neon DB (sql) cannot be used on the client-side."); },
            apply() { throw new Error("Neon DB (sql) cannot be used on the client-side."); }
        }) as any;
    })();

export { sql };

// Type Definitions
export interface Tenant {
    id: string;
    name: string;
    slug: string;
    api_key: string;
    created_at: Date;
    is_active: boolean;
}

export interface BrandingConfig {
    id: string;
    tenant_id: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    app_icon_url: string | null;
    pwa_name: string;
    pwa_short_name: string | null;
    pwa_description: string | null;
    theme_color: string;
}

export interface PushSubscription {
    id: string;
    tenant_id: string;
    endpoint: string;
    p256dh_key: string;
    auth_key: string;
    tags: string[];
    is_active: boolean;
}

// Query Functions
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
    const result = await sql`
        SELECT * FROM tenants WHERE slug = ${slug} AND is_active = true LIMIT 1
    `;
    return result[0] as Tenant || null;
}

export async function getTenantByApiKey(apiKey: string): Promise<Tenant | null> {
    const result = await sql`
        SELECT * FROM tenants WHERE api_key = ${apiKey} AND is_active = true LIMIT 1
    `;
    return result[0] as Tenant || null;
}

export async function getBrandingByTenantId(tenantId: string): Promise<BrandingConfig | null> {
    const result = await sql`
        SELECT * FROM branding_config WHERE tenant_id = ${tenantId} LIMIT 1
    `;
    return result[0] as BrandingConfig || null;
}

export async function getBrandingBySlug(slug: string): Promise<BrandingConfig | null> {
    const result = await sql`
        SELECT b.* FROM branding_config b
        JOIN tenants t ON b.tenant_id = t.id
        WHERE t.slug = ${slug} AND t.is_active = true
        LIMIT 1
    `;
    return result[0] as BrandingConfig || null;
}

export async function createPushSubscription(
    tenantId: string,
    endpoint: string,
    p256dhKey: string,
    authKey: string,
    userAgent?: string,
    tags?: string[]
): Promise<PushSubscription> {
    const result = await sql`
        INSERT INTO push_subscriptions (tenant_id, endpoint, p256dh_key, auth_key, user_agent, tags)
        VALUES (${tenantId}, ${endpoint}, ${p256dhKey}, ${authKey}, ${userAgent || null}, ${JSON.stringify(tags || [])})
        ON CONFLICT (tenant_id, endpoint) DO UPDATE SET
            p256dh_key = EXCLUDED.p256dh_key,
            auth_key = EXCLUDED.auth_key,
            is_active = true
        RETURNING *
    `;
    return result[0] as PushSubscription;
}

export async function getActiveSubscriptionsByTenant(tenantId: string): Promise<PushSubscription[]> {
    const result = await sql`
        SELECT * FROM push_subscriptions 
        WHERE tenant_id = ${tenantId} AND is_active = true
    `;
    return result as PushSubscription[];
}

export async function getSubscriptionsByTag(tenantId: string, tag: string): Promise<PushSubscription[]> {
    const result = await sql`
        SELECT * FROM push_subscriptions 
        WHERE tenant_id = ${tenantId} 
        AND is_active = true 
        AND tags @> ${JSON.stringify([tag])}::jsonb
    `;
    return result as PushSubscription[];
}
