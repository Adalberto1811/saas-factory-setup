export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export async function POST(request: NextRequest) {
    try {
        const { newPassword } = await request.json();

        // 1. Verify User is Logged In via Cookie
        const tokenCookie = request.cookies.get('auth_token');
        if (!tokenCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
        const userId = payload.sub;

        if (!userId) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // 2. Hash New Password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // 3. Update User: Set new password AND must_change_password = false
        await sql`
            UPDATE public.users 
            SET password_hash = ${passwordHash}, 
                must_change_password = false
            WHERE id = ${userId}
        `;

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
