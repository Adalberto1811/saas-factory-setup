import { NextRequest, NextResponse } from 'next/server';

// N8N Server Configuration
const N8N_BASE_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';
// We are not using API Key for now as the workflows seem to be public or keyless, 
// but we keep it ready if needed.
// const N8N_API_KEY = process.env.N8N_API_KEY; 

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const webhook = searchParams.get('webhook');

        if (!webhook) {
            return NextResponse.json({ error: 'Missing webhook parameter' }, { status: 400 });
        }

        const baseUrl = N8N_BASE_URL.endsWith('/') ? N8N_BASE_URL.slice(0, -1) : N8N_BASE_URL;
        const n8nUrl = `${baseUrl}/${webhook}`;

        console.log(`[Proxy] Forwarding to: ${n8nUrl}`);

        // Read body as JSON
        let body;
        try {
            body = await request.json();
            console.log(`[Proxy] Sending payload (trunc):`, JSON.stringify(body).slice(0, 500));
        } catch (e) {
            console.error('[Proxy] Error parsing request JSON:', e);
            body = {};
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`[Proxy] Upstream Response: ${n8nResponse.status} ${n8nResponse.statusText}`);

        const responseData = await n8nResponse.text();

        if (!n8nResponse.ok) {
            console.error(`[Proxy] Upstream Error Content:`, responseData);
            return NextResponse.json(
                {
                    error: `Error de Servidor N8N (${n8nResponse.status})`,
                    details: responseData,
                    url: n8nUrl
                },
                { status: n8nResponse.status }
            );
        }

        try {
            return NextResponse.json(JSON.parse(responseData), { status: 200 });
        } catch {
            return NextResponse.json({ status: 'success', data: responseData }, { status: 200 });
        }

    } catch (error) {
        console.error('[Proxy] Internal Error:', error);
        return NextResponse.json(
            { error: 'Error Interno del Servidor (Proxy)', details: String(error) },
            { status: 500 }
        );
    }
}

// Also handle GET requests for testing
export async function GET() {
    return NextResponse.json({
        status: 'N8N Proxy Active V3 (JSON Mode)',
        server: N8N_BASE_URL,
        usage: 'POST /api/n8n-proxy?webhook=webhook/UUID'
    });
}
