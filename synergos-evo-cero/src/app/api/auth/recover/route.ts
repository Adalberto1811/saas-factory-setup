import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists
        const users = await sql`SELECT id FROM public.users WHERE email = ${email} LIMIT 1`;
        if (users.length === 0) {
            // Return success even if user not found (security best practice)
            return NextResponse.json({ message: 'If account exists, email sent' });
        }

        // Generate token (simple random string)
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Update DB
        await sql`
            UPDATE public.users 
            SET reset_token = ${token}, reset_token_expires_at = ${expiresAt.toISOString()}
            WHERE email = ${email}
        `;

        // Trigger N8N Webhook to send email
        // We call our internal proxy to hide N8N keys
        const n8nWebhookId = process.env.N8N_RECOVERY_WEBHOOK_ID; // We need to add this to env or use a static one

        if (n8nWebhookId) {
            // Construct full URL for link in email
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login/reset?token=${token}`;

            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/n8n-proxy?webhook=${n8nWebhookId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    resetLink,
                    type: 'password_recovery'
                })
            });
        } else {
            console.warn('N8N_RECOVERY_WEBHOOK_ID not set. Email not sent.', { token });
        }

        return NextResponse.json({ message: 'Recovery initiated' });

    } catch (error) {
        console.error('Recovery error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
