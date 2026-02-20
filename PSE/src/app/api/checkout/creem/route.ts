import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { psePaymentConfig } from '@/shared/config/pse-payment-config';

// Checkout Generator - Creem.io v1.0
// SaaS Factory V3 - Zero Lies Protocol

export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json();
        const apiKey = process.env.CREEM_API_KEY;

        if (!apiKey) {
            console.error('[CREEM_CHECKOUT] CREEM_API_KEY no configurada');
            return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
        }

        console.log(`[CREEM_CHECKOUT] Generando sesión para Usuario: ${userId}`);

        // Llamada a la API de Creem para generar el checkout dinámico
        const response = await axios.post(
            'https://api.creem.io/v1/checkouts',
            {
                product_id: psePaymentConfig.creem.productId,
                customer: {
                    email: email || undefined
                },
                metadata: {
                    userId: userId.toString()
                },
                // Redirecciones de éxito/cancelación
                return_url: `${process.env.NEXTAUTH_URL || 'https://performanceswimming.online'}/performance/dashboard?payment=success`,
                cancel_url: `${process.env.NEXTAUTH_URL || 'https://performanceswimming.online'}/performance/dashboard?payment=cancelled`
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            checkout_url: response.data.checkout_url
        });

    } catch (error: any) {
        console.error('[CREEM_CHECKOUT_ERROR]', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Error al generar el checkout',
            details: error.response?.data?.message || error.message
        }, { status: 500 });
    }
}
