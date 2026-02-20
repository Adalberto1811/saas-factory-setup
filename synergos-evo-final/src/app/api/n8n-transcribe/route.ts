import { NextRequest, NextResponse } from 'next/server';

// N8N Server Configuration
const N8N_BASE_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';

export async function POST(request: NextRequest) {
    try {
        // Get content type
        const contentType = request.headers.get('content-type') || '';

        let body: FormData | string;
        let headers: Record<string, string> = {};

        if (contentType.includes('multipart/form-data')) {
            body = await request.formData();
        } else if (contentType.includes('application/json')) {
            body = await request.text();
            headers['Content-Type'] = 'application/json';
        } else {
            body = await request.text();
        }

        // Forward to TranscripSyn webhook
        const n8nUrl = `${N8N_BASE_URL}/webhook/68eaa1a6-e250-4f52-863c-338cd9dd9119`;

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            body,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
        });

        const responseData = await n8nResponse.text();

        // Try to parse as JSON
        try {
            const json = JSON.parse(responseData);
            return NextResponse.json(json);
        } catch {
            return NextResponse.json({ text: responseData });
        }

    } catch (error) {
        console.error('N8N Transcribe error:', error);
        return NextResponse.json(
            { error: 'Error al conectar con el servidor de transcripción' },
            { status: 500 }
        );
    }
}
