import { NextRequest, NextResponse } from 'next/server';

// N8N Server Configuration
const N8N_BASE_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';
// We are not using API Key for now as the workflows seem to be public or keyless, 
// but we keep it ready if needed.
// const N8N_API_KEY = process.env.N8N_API_KEY; 

export async function POST(request: NextRequest) {
    try {
        // Get the webhook path from query params
        const { searchParams } = new URL(request.url);
        const webhook = searchParams.get('webhook');

        if (!webhook) {
            return NextResponse.json(
                { error: 'Missing webhook parameter' },
                { status: 400 }
            );
        }

        // Build N8N URL
        // Ensure no double slashes if N8N_BASE_URL has trailing slash
        const baseUrl = N8N_BASE_URL.endsWith('/') ? N8N_BASE_URL.slice(0, -1) : N8N_BASE_URL;
        const n8nUrl = `${baseUrl}/${webhook}`;

        console.log(`[Proxy] Forwarding to: ${n8nUrl}`);

        // Get content type
        const contentType = request.headers.get('content-type');

        // Prepare headers for upstream
        const headers: Record<string, string> = {};
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        // Transparent Proxy: Stream the body directly
        // @ts-ignore - 'duplex' is a valid option on standard fetch but TS types might lag
        const fetchOptions = {
            method: 'POST',
            body: request.body,
            headers: headers,
            duplex: 'half' // Required for streaming bodies in Node/Edge fetch
        };

        const n8nResponse = await fetch(n8nUrl, fetchOptions as RequestInit);

        // Get response data
        const responseData = await n8nResponse.text();

        if (!n8nResponse.ok) {
            console.error(`[Proxy] Upstream Error ${n8nResponse.status}:`, responseData);
            return NextResponse.json(
                { error: `Upstream N8N Error: ${n8nResponse.status}`, details: responseData },
                { status: n8nResponse.status }
            );
        }

        // Try to parse as JSON, otherwise return as text
        let jsonData;
        try {
            jsonData = JSON.parse(responseData);
        } catch {
            jsonData = { text: responseData };
        }

        return NextResponse.json(jsonData, { status: 200 });

    } catch (error) {
        console.error('[Proxy] Internal Error:', error);
        return NextResponse.json(
            { error: 'Internal Proxy Error', details: String(error) },
            { status: 500 }
        );
    }
}

// Also handle GET requests for testing
export async function GET() {
    return NextResponse.json({
        status: 'N8N Proxy Active V2 (Stream Mode)',
        server: N8N_BASE_URL,
        usage: 'POST /api/n8n-proxy?webhook=webhook/UUID'
    });
}
