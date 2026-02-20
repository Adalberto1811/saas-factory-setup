import { NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { NotificationService } from '@/shared/services/NotificationService';

export async function POST(req: Request) {
    try {
        const { event, sessionId, details } = await req.json();
        const userId = details?.userId || null;

        if (!event) return NextResponse.json({ error: 'Event required' }, { status: 400 });

        await sql`
            INSERT INTO pse_activity_log (event_type, session_id, user_id, details)
            VALUES (${event}, ${sessionId || 'unknown'}, ${userId}, ${JSON.stringify(details || {})})
        `;

        // Si es un registro, notificar a los admins
        if (event === 'registration') {
            await NotificationService.sendToAdmins({
                title: '🏊 ¡Nuevo Atleta Registrado!',
                body: `${details.name} (${details.email}) acaba de unirse a PSE.`
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
