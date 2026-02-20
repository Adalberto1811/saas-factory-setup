import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';
import { NotificationService } from '@/shared/services/NotificationService';

export async function POST(req: Request) {
    try {
        const session = await auth();

        // Solo adalberto1811@gmail.com puede responder
        if (session?.user?.email !== 'adalberto1811@gmail.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId, responseText } = await req.json();

        if (!requestId || !responseText) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        // 1. Guardar la respuesta y marcar como resuelta
        const userId = await PSEService.respondToSupportRequest(requestId, responseText);

        if (userId) {
            // 2. Notificar al usuario vía Push
            await NotificationService.sendToUser(userId, {
                title: '🏊‍♂️ Tu Coach ha respondido',
                body: responseText.length > 100 ? responseText.substring(0, 97) + '...' : responseText,
                url: '/performance/coach'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[SupportResponse] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
