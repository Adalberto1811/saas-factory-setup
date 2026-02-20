import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';

// Polar Webhook Handler - SaaS Factory v3.5
// Procesa pagos y activa suscripciones automáticamente

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const signature = request.headers.get('webhook-signature');

        console.log('[POLAR_WEBHOOK] Evento recibido:', body.type);

        // 1. Verificación básica de evento (Simplificada para v1)
        // En producción, se debe validar con POLAR_WEBHOOK_SECRET
        if (!body || !body.type || !body.data) {
            console.warn('[POLAR_WEBHOOK] Payload incompleto recibido:', JSON.stringify(body));
            return NextResponse.json({ error: 'Payload inválido o incompleto' }, { status: 400 });
        }

        // 2. Procesar Eventos de Pago Exitoso
        // Polar envía 'checkout.created' o 'order.created' dependiendo del flujo
        if (body.type === 'checkout.created' || body.type === 'order.created') {
            const data = body.data;
            console.log(`[POLAR_WEBHOOK] Procesando data para evento ${body.type}`);

            // Intentar extraer el userId de los metadatos (inyectado en el frontend)
            // Polar pasa metadata en checkout_metadata para checkouts
            const userId = data?.checkout_metadata?.userId || data?.metadata?.userId;
            const customerEmail = data.customer_email || data.user?.email;

            if (userId && userId !== 'guest') {
                console.log(`[POLAR_WEBHOOK] Activando suscripción para Usuario ID: ${userId}`);

                await sql`
                    INSERT INTO pse_subscriptions (
                        user_id, 
                        status, 
                        plan_type, 
                        expires_at, 
                        checkout_session_id
                    ) VALUES (
                        ${Number(userId)}, 
                        'active', 
                        'pro', 
                        NOW() + INTERVAL '30 days', 
                        ${data.id || 'polar_automated'}
                    )
                    ON CONFLICT (user_id) DO UPDATE 
                    SET 
                        status = 'active', 
                        expires_at = NOW() + INTERVAL '30 days', 
                        updated_at = NOW(),
                        checkout_session_id = EXCLUDED.checkout_session_id;
                `;

                // Registrar actividad
                await sql`
                    INSERT INTO pse_activity_log (event_type, user_id, details)
                    VALUES ('subscription_activated', ${Number(userId)}, ${JSON.stringify({
                    source: 'polar_webhook',
                    event: body.type,
                    email: customerEmail,
                    timestamp: new Date().toISOString()
                })})
                `;

            } else if (customerEmail) {
                // Fallback: Intentar encontrar al usuario por email si no hay ID
                console.log(`[POLAR_WEBHOOK] Buscando usuario por email: ${customerEmail}`);
                const user = await sql`SELECT id FROM users WHERE email = ${customerEmail.toLowerCase().trim()}`;

                if (user.length > 0) {
                    const foundUserId = (user[0] as any).id;
                    await sql`
                        INSERT INTO pse_subscriptions (user_id, status, plan_type, expires_at)
                        VALUES (${foundUserId}, 'active', 'pro', NOW() + INTERVAL '30 days')
                        ON CONFLICT (user_id) DO UPDATE 
                        SET status = 'active', expires_at = NOW() + INTERVAL '30 days', updated_at = NOW();
                    `;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook procesado correctamente'
        });

    } catch (error: any) {
        console.error('[POLAR_WEBHOOK_ERROR]', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
