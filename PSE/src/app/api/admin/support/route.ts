import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PSEService } from '@/shared/services/PSEService';

export async function GET() {
    try {
        const session = await auth();
        const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com').split(',').map(e => e.trim());
        adminEmails.push('damien87hg@gmail.com');

        if (!session?.user || !adminEmails.includes(session.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const requests = await PSEService.getSupportRequests();

        return NextResponse.json({
            requests,
            total: requests.length,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[SupportAPI] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
