import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const workout = await PSEService.getCurrentWorkout(userId);

        return NextResponse.json({ data: workout });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
