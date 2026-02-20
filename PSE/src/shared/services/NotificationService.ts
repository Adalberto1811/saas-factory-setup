import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@performanceswimming.online';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
} else {
    console.warn('[NotificationService] VAPID keys missing. Push notifications will not work.');
}

import { sql } from '@/shared/lib/neon';

export class NotificationService {
    static async sendToAdmins(payload: { title: string, body: string, url?: string }) {
        try {
            // Obtener todas las suscripciones activas
            const subscriptions = await sql`
                SELECT endpoint, p256dh_key, auth_key 
                FROM push_subscriptions 
                WHERE is_active = true
            `;

            console.log(`[NotificationService] Enviando a ${subscriptions.length} suscripciones`);

            const pushPromises = subscriptions.map(async (sub: any) => {
                const pushConfig = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh_key,
                        auth: sub.auth_key
                    }
                };

                try {
                    await webpush.sendNotification(
                        pushConfig,
                        JSON.stringify({
                            title: payload.title,
                            body: payload.body,
                            url: payload.url || '/performance/admin',
                            icon: '/performance/icons/icon-192.png',
                            badge: '/performance/icons/icon-192.png'
                        })
                    );
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Suscripción expirada o inválida - Desactivar
                        await sql`
                            UPDATE push_subscriptions 
                            SET is_active = false 
                            WHERE endpoint = ${sub.endpoint}
                        `;
                    }
                    console.error('[NotificationService] Error enviando a endpoint:', sub.endpoint, error.message);
                }
            });

            await Promise.all(pushPromises);
        } catch (error) {
            console.error('[NotificationService] Error general:', error);
        }
    }

    /**
     * Envía una notificación push a un usuario específico.
     */
    static async sendToUser(userId: number, payload: { title: string, body: string, url?: string }) {
        try {
            // Obtener suscripciones activas del usuario
            // Nota: El userId está guardado en el JSON 'tags'
            const subscriptions = await sql`
                SELECT endpoint, p256dh_key, auth_key 
                FROM push_subscriptions 
                WHERE is_active = true 
                AND (tags->>'userId')::int = ${userId}
            `;

            console.log(`[NotificationService] Enviando a User ${userId} (${subscriptions.length} suscripciones)`);

            const pushPromises = subscriptions.map(async (sub: any) => {
                const pushConfig = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh_key,
                        auth: sub.auth_key
                    }
                };

                try {
                    await webpush.sendNotification(
                        pushConfig,
                        JSON.stringify({
                            title: payload.title,
                            body: payload.body,
                            url: payload.url || '/performance/coach',
                            icon: '/performance/icons/icon-192.png',
                            badge: '/performance/icons/icon-192.png'
                        })
                    );
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await sql`
                            UPDATE push_subscriptions 
                            SET is_active = false 
                            WHERE endpoint = ${sub.endpoint}
                        `;
                    }
                    console.error('[NotificationService] Error enviando push a user:', userId, error.message);
                }
            });

            await Promise.all(pushPromises);
        } catch (error) {
            console.error('[NotificationService] Error en sendToUser:', error);
        }
    }
}
