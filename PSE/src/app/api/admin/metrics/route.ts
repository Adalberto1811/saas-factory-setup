import { NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com').split(',').map(e => e.trim());
        adminEmails.push('damien87hg@gmail.com');

        if (!session?.user || !adminEmails.includes(session.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized Access Protocol Sigma Active - Nuclear Bunker Sealed' }, { status: 403 });
        }

        // 1. Salud del Sistema (Últimas 24h)
        const health = await sql`
            SELECT 
                model, 
                AVG(latency_ms)::int as avg_latency, 
                COUNT(*) as total_calls,
                COUNT(CASE WHEN status_code != 200 THEN 1 END) as errors
            FROM system_health
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY model
            ORDER BY avg_latency DESC
        `;

        // 2. Tráfico de Usuarios (Activos vs Trial) - EXCLUYENDO ADMINS
        const userStats = await sql`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE email NOT IN (${adminEmails[0]}, ${adminEmails[1]})) as total_users,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subs,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing') as trial_subs
        `;

        const totalUsers = parseInt(userStats[0].total_users as string || "0");
        const activeUsersCount = parseInt(userStats[0].active_subs as string || "0");
        const trialUsersCount = parseInt(userStats[0].trial_subs as string || "0");

        // 3. Conversión
        const conversionData = {
            total_trials: trialUsersCount || 1, // Avoid division by zero
            converted: activeUsersCount,
            marketing_funnel: (totalUsers - activeUsersCount - trialUsersCount) || 0
        };

        // 5. Sistema de Referidos (NUEVO)
        const referralTiers = await sql`
            SELECT referral_tier, COUNT(*) as count
            FROM atletas
            GROUP BY referral_tier
        `;

        const topReferrers = await sql`
            SELECT a.full_name, COUNT(r.id) as referrals
            FROM atletas a
            JOIN referidos_log r ON a.id = r.referrer_id
            GROUP BY a.id, a.full_name
            ORDER BY referrals DESC
            LIMIT 5
        `;

        // 4. Finanzas (Basado en suscripciones activas @ $19.99)
        const pricing = 19.99;
        const financialData = {
            monthly_revenue: Math.round(activeUsersCount * pricing),
            projected_revenue: Math.round((activeUsersCount + trialUsersCount * 0.2) * pricing), // 20% conversion estimate
            pending_subscriptions: trialUsersCount,
            active_subscriptions: activeUsersCount
        };

        return NextResponse.json({
            system_health: health,
            traffic: {
                active: activeUsersCount || (totalUsers > 0 ? totalUsers : 1),
                trial: trialUsersCount,
                growth: 15
            },
            conversion: conversionData,
            financial: financialData,
            referrals: {
                tiers: referralTiers,
                top: topReferrers
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[MetricsAPI] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
