import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';
import { NotificationService } from '@/shared/services/NotificationService';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, sessionId } = await req.json();
        const userId = parseInt(session.user.id, 10);

        // 1. Guardar la solicitud en la base de datos
        await PSEService.saveSupportRequest(userId, message, sessionId);

        // 2. Notificar a los administradores vía Push
        await NotificationService.sendToAdmins({
            title: '⚠️ Nueva Solicitud de Soporte (PSE)',
            body: `Atleta ${session.user.name || 'Anónimo'} solicita ayuda humana urgente.`,
            url: '/performance/admin'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[SupportRequest] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
