import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';

export async function POST(req: NextRequest) {
    try {
        const { batchId, imageUrls, businessIdea, characterReference, tenantId } = await req.json();

        if (!imageUrls || !Array.isArray(imageUrls)) {
            return NextResponse.json({ error: 'imageUrls and batchId are required' }, { status: 400 });
        }

        let result;

        if (batchId) {
            // Update existing batch
            result = await sql`
                UPDATE ads_batch 
                SET image_urls = ${JSON.stringify(imageUrls)}, 
                    updated_at = NOW()
                WHERE id = ${batchId}
                RETURNING *
            `;
        } else {
            // Create new batch if no batchId provided
            result = await sql`
                INSERT INTO ads_batch (tenant_id, business_idea, prompts, image_urls, character_reference)
                VALUES (
                    ${tenantId || null}, 
                    ${businessIdea || 'Manual Upload'}, 
                    '[]', 
                    ${JSON.stringify(imageUrls)}, 
                    ${characterReference || null}
                )
                RETURNING *
            `;
        }

        return NextResponse.json({ success: true, batch: result[0] });

    } catch (error: any) {
        console.error('Bulk Link API Error:', error.message);
        return NextResponse.json(
            { error: 'Error linking ad images', details: error.message },
            { status: 500 }
        );
    }
}
