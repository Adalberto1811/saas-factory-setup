import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Fetch user from public.users (Neon)
        const users = await sql`
            SELECT id, email, password_hash, full_name, tenant_id, must_change_password
            FROM public.users 
            WHERE email = ${email}
            LIMIT 1
        `;

        const user = users[0];

        if (!user || !user.password_hash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({
            sub: user.id.toString(),
            email: user.email,
            tenant_id: user.tenant_id
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Set Cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                tenant_id: user.tenant_id,
                must_change_password: user.must_change_password
            }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
