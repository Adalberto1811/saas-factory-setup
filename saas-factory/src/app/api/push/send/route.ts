import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getTenantByApiKey, getActiveSubscriptionsByTenant, getSubscriptionsByTag } from '@/shared/lib/neon';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@synergos.solutions';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    url?: string;
    data?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
    try {
        // Check VAPID configuration
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            return NextResponse.json({
                error: 'Push notifications not configured',
                instructions: 'Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local'
            }, { status: 503 });
        }

        const body = await request.json();
        const {
            tenantApiKey,
            tag,  // Optional: send to specific tag group
            notification
        } = body;

        // Authenticate via API key (MarketSyn/AgentSyn trigger)
        if (!tenantApiKey) {
            return NextResponse.json({ error: 'tenantApiKey required' }, { status: 401 });
        }

        const tenant = await getTenantByApiKey(tenantApiKey);
        if (!tenant) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        // Validate notification payload
        if (!notification?.title || !notification?.body) {
            return NextResponse.json({
                error: 'Invalid notification. Required: title, body'
            }, { status: 400 });
        }

        // Get subscriptions (all or by tag)
        let subscriptions;
        if (tag) {
            subscriptions = await getSubscriptionsByTag(tenant.id, tag);
        } else {
            subscriptions = await getActiveSubscriptionsByTenant(tenant.id);
        }

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No active subscriptions found',
                sent: 0
            });
        }

        // Prepare push payload
        const payload: PushPayload = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icons/icon-192.png',
            badge: notification.badge || '/icons/badge-72.png',
            image: notification.image,
            url: notification.url || '/',
            data: {
                tenant: tenant.slug,
                timestamp: Date.now(),
                ...notification.data
            }
        };

        // Send pushes in parallel
        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh_key,
                            auth: sub.auth_key
                        }
                    },
                    JSON.stringify(payload),
                    { TTL: 86400 } // 24 hours
                )
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`📤 Push sent to ${tenant.name}: ${successful} success, ${failed} failed`);

        return NextResponse.json({
            success: true,
            tenant: tenant.name,
            sent: successful,
            failed,
            total: subscriptions.length
        });

    } catch (error) {
        console.error('Push send error:', error);
        return NextResponse.json(
            { error: 'Failed to send push notifications', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    const configured = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

    return NextResponse.json({
        status: 'Push Send API',
        configured,
        usage: configured
            ? 'POST with { tenantApiKey, notification: { title, body, icon?, url? }, tag?: string }'
            : 'Configure VAPID keys first: npx web-push generate-vapid-keys'
    });
}
