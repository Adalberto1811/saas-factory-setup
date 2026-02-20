import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/src/shared/lib/neon';
import crypto from 'crypto';

// Creem.io Webhook Handler - SaaS Factory v3.5
// Protocolo Zero Lies: Activación automática de atletas Pro

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('creem-signature');
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        console.log('[CREEM_WEBHOOK] Evento recibido');

        // 1. Verificación de Firma (Seguridad Industrial)
        if (webhookSecret && signature) {
            const hmac = crypto.createHmac('sha256', webhookSecret);
            const digest = hmac.update(payload).digest('hex');

            if (signature !== digest) {
                console.error('[CREEM_WEBHOOK] Firma inválida detectada');
                return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
            }
        } else if (webhookSecret) {
            console.warn('[CREEM_WEBHOOK] Falta firma pero el secreto está configurado');
        }

        const body = JSON.parse(payload);

        // 2. Procesar Eventos: checkout.completed o suscripción.prueba (con o sin tilde)
        const eventName = body.event?.toLowerCase();
        const isActivationEvent = eventName === 'checkout.completed' ||
            eventName === 'suscripción.prueba' ||
            eventName === 'suscripcion.prueba';

        if (isActivationEvent) {
            const data = body.data;
            const userId = data.metadata?.userId;
            const customerEmail = data.customer?.email || data.user_email;

            console.log(`[CREEM_WEBHOOK] Procesando ${body.event} para: ${customerEmail}`);

            if (userId && userId !== 'guest') {
                console.log(`[CREEM_WEBHOOK] Activación Pro (${body.event === 'suscripción.prueba' ? 'Prueba' : 'Pago'}) para Atleta ID: ${userId}`);

                // Días de gracia para prueba (ej: 7 días) o 30 para pago
                const days = body.event === 'suscripción.prueba' ? 7 : 30;

                // Operación Atómica en Neon
                await sql`
                    INSERT INTO pse_subscriptions (
                        user_id, 
                        status, 
                        plan_type, 
                        expires_at, 
                        checkout_session_id,
                        provider
                    ) VALUES (
                        ${Number(userId)}, 
                        'active', 
                        'pro', 
                        NOW() + ${days + ' days'}::interval, 
                        ${data.id || 'creem_ref_' + Date.now()},
                        'creem'
                    )
                    ON CONFLICT (user_id) DO UPDATE 
                    SET 
                        status = 'active', 
                        expires_at = NOW() + ${days + ' days'}::interval, 
                        updated_at = NOW(),
                        checkout_session_id = EXCLUDED.checkout_session_id,
                        provider = 'creem';
                `;

                // Log de Auditoría
                await sql`
                    INSERT INTO pse_activity_log (event_type, user_id, details)
                    VALUES ('subscription_activated', ${Number(userId)}, ${JSON.stringify({
                    source: 'creem_webhook',
                    event: body.event,
                    email: customerEmail,
                    checkout_id: data.id,
                    timestamp: new Date().toISOString()
                })})
                `;

                return NextResponse.json({ success: true, message: 'Atleta activado con éxito' });
            } else {
                console.warn('[CREEM_WEBHOOK] Webhook recibido sin userId válido:', customerEmail);
            }
        }

        return NextResponse.json({ success: true, message: 'Evento ignorado o procesado' });

    } catch (error: any) {
        console.error('[CREEM_WEBHOOK_ERROR]', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
