import { NextResponse } from 'next/server';
import '@/auth';

export async function GET() {
    const authUrl = (process.env.AUTH_URL || '').trim();
    const nextauthUrl = (process.env.NEXTAUTH_URL || '').trim();
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const authSecret = process.env.AUTH_SECRET || '';
    const databaseUrl = process.env.DATABASE_URL || '';

    // Check which variables are present
    const diagnostics = {
        AUTH_URL: authUrl ? 'SET' : 'MISSING',
        AUTH_URL_VALUE: authUrl,
        NEXTAUTH_URL: nextauthUrl ? 'SET' : 'MISSING',
        GOOGLE_CLIENT_ID: googleClientId ? 'SET (' + googleClientId.substring(0, 15) + '...)' : 'MISSING',
        GOOGLE_CLIENT_SECRET: googleClientSecret ? 'SET (length: ' + googleClientSecret.length + ')' : 'MISSING',
        AUTH_SECRET: authSecret ? 'SET (length: ' + authSecret.length + ')' : 'MISSING',
        DATABASE_URL: databaseUrl ? 'SET (starts with: ' + databaseUrl.substring(0, 20) + '...)' : 'MISSING',

        // Calculate callback URL
        CALCULATED_CALLBACK: authUrl + '/performance/api/auth/callback/google',

        // Check for common issues
        ISSUES: [] as string[]
    };

    // Check for issues
    if (!googleClientId) diagnostics.ISSUES.push('GOOGLE_CLIENT_ID is missing');
    if (!googleClientSecret) diagnostics.ISSUES.push('GOOGLE_CLIENT_SECRET is missing');
    if (!authSecret) diagnostics.ISSUES.push('AUTH_SECRET is missing');
    if (!databaseUrl) diagnostics.ISSUES.push('DATABASE_URL is missing');
    if (authUrl.includes('\n') || authUrl.includes('\r')) diagnostics.ISSUES.push('AUTH_URL contains newlines');

    if (diagnostics.ISSUES.length === 0) {
        diagnostics.ISSUES.push('No issues detected - all required variables are set');
    }

    return NextResponse.json(diagnostics);
}
