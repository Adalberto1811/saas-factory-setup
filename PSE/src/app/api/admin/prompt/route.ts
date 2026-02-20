import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sql } from '@/shared/lib/neon';
import { auth } from "@/auth";

const PROMPT_PATH = path.join(process.cwd(), 'src/core/prompts/COACH_MASTER_PROMPT.txt');

export async function GET() {
    try {
        const session = await auth();
        const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com').split(',').map(e => e.trim());
        adminEmails.push('damien87hg@gmail.com');

        if (!session?.user || !adminEmails.includes(session.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const content = fs.readFileSync(PROMPT_PATH, 'utf8');
        return NextResponse.json({ content });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com').split(',').map(e => e.trim());
        adminEmails.push('damien87hg@gmail.com');

        if (!session?.user || !adminEmails.includes(session.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { content, adminId = 1 } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 1. Guardar backup o auditoría
        await sql`
            INSERT INTO admin_audit (admin_id, action, details)
            VALUES (${adminId}, 'update_prompt', ${JSON.stringify({
            char_count: content.length,
            timestamp: new Date().toISOString()
        })})
        `;

        // 2. Sobrescribir archivo
        fs.writeFileSync(PROMPT_PATH, content, 'utf8');

        return NextResponse.json({ success: true, charCount: content.length });

    } catch (error: any) {
        console.error('[PromptAPI] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
