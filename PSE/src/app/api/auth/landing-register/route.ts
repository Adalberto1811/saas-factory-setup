// API de registro simplificado para Landing Page
// Crea usuario solo con nombre y email (genera password temporal)

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export async function POST(request: NextRequest) {
    try {
        const { name, email, whatsapp } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Nombre y email son obligatorios.' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Verificar si ya existe
        const existingUser = await sql`
            SELECT id, full_name FROM users WHERE email = ${normalizedEmail}
        `;

        let userId: number;

        if (existingUser.length > 0) {
            // Usuario ya existe, actualizar WhatsApp y retornar su info
            userId = (existingUser[0] as any).id;
            if (whatsapp) {
                await sql`UPDATE users SET whatsapp = ${whatsapp} WHERE id = ${userId}`;
            }
        } else {
            // Crear nuevo usuario con password temporal
            const tempPassword = Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(tempPassword, 10);

            const result = await sql`
                INSERT INTO users (full_name, email, password_hash, whatsapp)
                VALUES (${name}, ${normalizedEmail}, ${passwordHash}, ${whatsapp || null})
                RETURNING id
            `;
            userId = (result[0] as any).id;

            // Registrar actividad de nuevo usuario
            await sql`
                INSERT INTO pse_activity_log (event_type, user_id, details)
                VALUES ('registration', ${userId}, ${JSON.stringify({
                name,
                email: normalizedEmail,
                whatsapp: whatsapp || 'not_provided',
                source: 'landing_page',
                timestamp: new Date().toISOString()
            })})
            `;
        }

        // Generar JWT token para autenticación automática
        const token = await new SignJWT({ sub: userId.toString(), email: normalizedEmail })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        // Crear respuesta con cookie de sesión
        const response = NextResponse.json({
            success: true,
            userId,
            message: existingUser.length > 0
                ? 'Bienvenido de vuelta, atleta!'
                : 'Usuario registrado exitosamente. ¡Bienvenido a PSE!'
        });

        // Establecer cookie de autenticación
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 días
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('[LANDING_REGISTER_ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Error al registrar usuario.' },
            { status: 500 }
        );
    }
}
