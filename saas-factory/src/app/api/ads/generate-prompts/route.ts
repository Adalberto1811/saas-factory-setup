import { NextRequest, NextResponse } from 'next/server';
import { AdsPromptService } from '@/features/ads-generator/services/prompt-service';

export async function POST(req: NextRequest) {
    try {
        const { businessIdea, characterReference } = await req.json();

        if (!businessIdea) {
            return NextResponse.json({ error: 'businessIdea is required' }, { status: 400 });
        }

        console.log(`🚀 API: Generating 20 prompts for: ${businessIdea.substring(0, 30)}...`);

        const prompts = await AdsPromptService.generateBatch(businessIdea, characterReference);

        return NextResponse.json({ prompts });

    } catch (error: any) {
        console.error('Ads Generation API Error:', error.message);
        return NextResponse.json(
            { error: 'Error generating prompt batch', details: error.message },
            { status: 500 }
        );
    }
}
