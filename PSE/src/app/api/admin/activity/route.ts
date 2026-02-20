import { NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';

export async function GET() {
    try {
        const session = await auth();
        const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com').split(',').map(e => e.trim());
        adminEmails.push('damien87hg@gmail.com');

        if (!session?.user || !adminEmails.includes(session.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized Access Protocol Sigma' }, { status: 403 });
        }

        // 1. Actividad Reciente (Mezclando Logs y Registros)
        const recentActivity = await sql`
            (
                SELECT 
                    'activity' as type,
                    event_type as title,
                    COALESCE(u.full_name, 'Anónimo (' || l.session_id::text || ')') as user_name,
                    details as metadata,
                    l.created_at
                FROM pse_activity_log l
                LEFT JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC
                LIMIT 20
            )
            UNION ALL
            (
                SELECT 
                    'registration' as type,
                    'Nuevo Usuario' as title,
                    full_name as user_name,
                    jsonb_build_object('email', email) as metadata,
                    created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 10
            )
            ORDER BY created_at DESC
            LIMIT 30
        `;

        // 2. Usuarios "Abren pero no registran" (Sessions en log que no tienen user_id)
        const ghostVisits = await sql`
            SELECT COUNT(DISTINCT session_id) as count
            FROM pse_activity_log
            WHERE user_id IS NULL AND created_at > NOW() - INTERVAL '24 hours'
        `;

        return NextResponse.json({
            recent: recentActivity,
            ghostVisits: ghostVisits[0].count,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[ActivityAPI] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
