import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
        }

        // Find user by token and check expiry
        const users = await sql`
            SELECT id FROM public.users 
            WHERE reset_token = ${token} 
            AND reset_token_expires_at > NOW()
            LIMIT 1
        `;

        if (users.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update user
        await sql`
            UPDATE public.users 
            SET password_hash = ${passwordHash}, 
                reset_token = NULL, 
                reset_token_expires_at = NULL
            WHERE id = ${users[0].id}
        `;

        return NextResponse.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
