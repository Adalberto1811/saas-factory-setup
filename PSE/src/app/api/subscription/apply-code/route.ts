import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
        }

        const cleanCode = code.trim().toUpperCase();

        // 1. CONTROL CODES (Manual Bypass - 100% Discount)
        const CONTROL_CODES = ['Z4VIMCZ3', 'CONTROL']; // From user information
        if (CONTROL_CODES.includes(cleanCode)) {
            // Grant 1 month access
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await sql`
                INSERT INTO pse_subscriptions (user_id, status, plan_type, expires_at)
                VALUES (${userId}, 'active', 'pro', ${expiresAt})
                ON CONFLICT (user_id) DO UPDATE SET
                    status = 'active',
                    plan_type = 'pro',
                    expires_at = ${expiresAt},
                    updated_at = NOW()
            `;

            return NextResponse.json({
                success: true,
                message: '¡Código de Control aceptado! Acceso Pro activado por 30 días.'
            });
        }

        // 2. REFERRAL CODES
        const referrer = await sql`
            SELECT id, full_name, referral_code 
            FROM atletas 
            WHERE referral_code = ${cleanCode}
        `;

        if (referrer.length === 0) {
            // AUTO-CLAIM LOGIC: If the code doesn't exist, the first one to use it claims it.
            const currentUserAtleta = await sql`SELECT id, referral_code FROM atletas WHERE email = ${session.user.email}`;

            if (currentUserAtleta.length > 0) {
                if ((currentUserAtleta[0] as any).referral_code) {
                    return NextResponse.json({ error: 'Este código no existe y tú ya tienes un código personal asignado.' }, { status: 400 });
                }

                // Claim the code for this user
                await sql`
                    UPDATE atletas 
                    SET referral_code = ${cleanCode} 
                    WHERE email = ${session.user.email}
                `;

                return NextResponse.json({
                    success: true,
                    message: `¡Código "${cleanCode}" reclamado con éxito! Ahora es tu código oficial para invitar amigos. Cuando 10 personas lo usen, ganarás un mes gratis.`
                });
            }
            return NextResponse.json({ error: 'Código inválido y no se pudo vincular a tu perfil.' }, { status: 400 });
        }

        // 3. EXISTING REFERRAL LINKAGE
        const referrerId = (referrer[0] as any).id;
        const referrerName = (referrer[0] as any).full_name;

        // Check if user is trying to refer themselves
        if (referrerId === (await sql`SELECT id FROM atletas WHERE email = ${session.user.email}`)[0]?.id) {
            return NextResponse.json({ error: 'No puedes usar tu propio código como referido.' }, { status: 400 });
        }

        // Check if user already used a referral code
        const userAtleta = await sql`SELECT id, referred_by_code FROM atletas WHERE email = ${session.user.email}`;
        if (userAtleta.length > 0 && (userAtleta[0] as any).referred_by_code) {
            return NextResponse.json({ error: 'Ya has utilizado un código de referido.' }, { status: 400 });
        }

        // Link referral
        await sql`
            UPDATE atletas 
            SET referred_by_code = ${cleanCode} 
            WHERE email = ${session.user.email}
        `;

        // Log referral
        await sql`
            INSERT INTO referidos_log (referrer_id, referred_id)
            VALUES (${referrerId}, (SELECT id FROM atletas WHERE email = ${session.user.email}))
        `;

        // Check if referrer reached 10 referrals
        const referralCountResult = await sql`
            SELECT COUNT(*) as total 
            FROM referidos_log 
            WHERE referrer_id = ${referrerId}
        `;
        const count = parseInt((referralCountResult[0] as any).total, 10);

        let referrerReward = '';
        if (count % 10 === 0 && count > 0) {
            // Grant reward to referrer
            const rewardExpires = new Date();
            rewardExpires.setMonth(rewardExpires.getMonth() + 1);

            const referrerUser = await sql`SELECT id FROM users WHERE email = (SELECT email FROM atletas WHERE id = ${referrerId})`;
            if (referrerUser.length > 0) {
                const refUserId = (referrerUser[0] as any).id;
                await sql`
                    INSERT INTO pse_subscriptions (user_id, status, plan_type, expires_at)
                    VALUES (${refUserId}, 'active', 'pro', ${rewardExpires})
                    ON CONFLICT (user_id) DO UPDATE SET
                        status = 'active',
                        plan_type = 'pro',
                        expires_at = ${rewardExpires},
                        updated_at = NOW()
                `;
                referrerReward = `¡Felicidades a ${referrerName}! Ha ganado un mes gratis.`;
            }
        }

        return NextResponse.json({
            success: true,
            message: `¡Código de referido de ${referrerName} aceptado! ${referrerReward}`
        });

        return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });

    } catch (error: any) {
        console.error('[ApplyCode] Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
