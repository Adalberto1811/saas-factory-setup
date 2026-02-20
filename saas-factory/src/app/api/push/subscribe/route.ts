import { NextRequest, NextResponse } from 'next/server';
import { createPushSubscription, getTenantBySlug, getTenantByApiKey } from '@/shared/lib/neon';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            tenantSlug,
            tenantApiKey,
            subscription,
            userAgent,
            tags
        } = body;

        // Authenticate tenant (by slug or API key)
        let tenant;
        if (tenantApiKey) {
            tenant = await getTenantByApiKey(tenantApiKey);
        } else if (tenantSlug) {
            tenant = await getTenantBySlug(tenantSlug);
        }

        if (!tenant) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 401 });
        }

        // Validate subscription object
        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json({
                error: 'Invalid subscription object. Required: endpoint, keys.p256dh, keys.auth'
            }, { status: 400 });
        }

        // Store subscription in Neon
        const result = await createPushSubscription(
            tenant.id,
            subscription.endpoint,
            subscription.keys.p256dh,
            subscription.keys.auth,
            userAgent,
            tags || []
        );

        console.log('📱 Push subscription registered:', {
            tenant: tenant.name,
            endpoint: subscription.endpoint.substring(0, 50) + '...'
        });

        return NextResponse.json({
            success: true,
            subscriptionId: result.id,
            tenant: tenant.name
        });

    } catch (error) {
        console.error('Push subscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to register subscription', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Return public VAPID key for client-side subscription
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        return NextResponse.json({
            error: 'VAPID keys not configured',
            instructions: 'Run: npx web-push generate-vapid-keys'
        }, { status: 503 });
    }

    return NextResponse.json({
        vapidPublicKey,
        usage: 'POST with { tenantSlug, subscription: PushSubscription, tags?: string[] }'
    });
}
