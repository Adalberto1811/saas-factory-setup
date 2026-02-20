import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await req.json();
        const userId = parseInt(session.user.id, 10);

        console.log(`[PushSubscription] Registrando para UserID: ${userId}`);
        console.log(`[PushSubscription] Endpoint: ${subscription.endpoint}`);

        await PSEService.savePushSubscription(userId, subscription);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[PushSubscription] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
