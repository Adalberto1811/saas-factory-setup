import { NextRequest, NextResponse } from 'next/server';
import { getBrandingBySlug, getTenantBySlug } from '@/shared/lib/neon';

interface ManifestParams {
    params: Promise<{ tenantSlug: string }>;
}

export async function GET(request: NextRequest, { params }: ManifestParams) {
    try {
        const { tenantSlug } = await params;

        // Get tenant and branding from Neon
        const tenant = await getTenantBySlug(tenantSlug);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const branding = await getBrandingBySlug(tenantSlug);
        if (!branding) {
            return NextResponse.json({ error: 'Branding config not found' }, { status: 404 });
        }

        // Generate dynamic manifest
        const manifest = {
            name: branding.pwa_name,
            short_name: branding.pwa_short_name || branding.pwa_name.substring(0, 12),
            description: branding.pwa_description || `${tenant.name} - Powered by SynergosIA`,
            start_url: `/?tenant=${tenantSlug}`,
            scope: '/',
            display: 'standalone',
            orientation: 'portrait',
            background_color: branding.background_color,
            theme_color: branding.theme_color || branding.primary_color,
            icons: [
                {
                    src: branding.app_icon_url || '/icons/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'
                },
                {
                    src: branding.app_icon_url || '/icons/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ],
            categories: ['business', 'productivity'],
            lang: 'es',
            dir: 'ltr',
            // Custom Synergos metadata
            synergos: {
                tenant_id: tenant.id,
                primary_color: branding.primary_color,
                secondary_color: branding.secondary_color,
                text_color: branding.text_color
            }
        };

        return new NextResponse(JSON.stringify(manifest, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=3600', // 1 hour cache
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Manifest generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate manifest', details: String(error) },
            { status: 500 }
        );
    }
}
