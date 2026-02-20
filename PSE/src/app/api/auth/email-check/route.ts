export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PSEService } from '@/shared/services/PSEService';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
        }

        const user = await PSEService.getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ exists: false });
        }

        // Obtener estado del trial
        const totalMicrocycles = await PSEService.getTotalMicrocyclesCount(user.id);
        const userSettings = await PSEService.getUserSettings(user.id);
        const hasSubscription = await PSEService.checkSubscription(user.id);

        const registrationDate = userSettings?.created_at || new Date();
        const daysSinceRegistration = Math.floor((new Date().getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

        const isLocked = !hasSubscription && (totalMicrocycles >= 2 || daysSinceRegistration > 15);

        return NextResponse.json({
            exists: true,
            user: {
                id: user.id,
                name: user.full_name,
                role: user.role
            },
            trial: {
                microcycles: totalMicrocycles,
                daysSinceRegistration,
                isLocked
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
