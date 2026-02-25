import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { sessionLog, duration_seconds, volume_meters } = body;

        // Atomically insert the completed training session
        await sql`
            INSERT INTO pse_training_logs (
                user_id,
                duration_seconds,
                volume_meters,
                session_data,
                completed_at
            ) VALUES (
                ${session.user.id},
                ${duration_seconds || 0},
                ${volume_meters || 0},
                ${JSON.stringify(sessionLog)}::jsonb,
                NOW()
            )
        `;

        return NextResponse.json({ success: true, message: 'Training session saved successfully.' });
    } catch (error: any) {
        console.error('[TRAINING_LOG_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
