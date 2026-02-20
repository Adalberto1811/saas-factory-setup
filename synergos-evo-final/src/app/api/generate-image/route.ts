import { NextRequest, NextResponse } from 'next/server';
import { getKlingToken } from '@/shared/lib/kling-auth';

// Configuration for image generation services
const N8N_BASE_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';
const N8N_IMAGE_WEBHOOK = 'webhook/marketsyn-image'; // Create this workflow in N8N
const KLING_IMAGE_API_URL = 'https://api.kling.ai/v1/images/generations';
const KLING_IMAGE_STATUS_URL = (taskId: string) => `https://api.kling.ai/v1/images/generations/${taskId}`;

// Fallback images for when APIs are unavailable
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'
];

interface GenerateImageRequest {
    prompt: string;
    companyName?: string;
    slogan?: string;
    style?: string;
    primaryColor?: string;
    accentColor?: string;
}


export async function POST(request: NextRequest) {
    try {
        const body: GenerateImageRequest = await request.json();
        const { prompt, companyName, slogan, style, primaryColor, accentColor } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Construct enhanced prompt
        const enhancedPrompt = `${prompt}. Estilo cinematográfico, profesional, alta calidad, 4K. Colores dominantres: ${primaryColor || '#6366F1'} y ${accentColor || '#F472B6'}.`;

        console.log('🎨 Generate Image API called:', { prompt: enhancedPrompt.substring(0, 100) });

        // Option 1: Try N8N MarketSyn Image Workflow (Check if active)
        try {
            console.log('📸 Trying N8N MarketSyn Image Workflow...');
            const n8nResponse = await fetch(`${N8N_BASE_URL}/${N8N_IMAGE_WEBHOOK}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    companyName,
                    slogan,
                    primaryColor,
                    accentColor
                }),
                signal: AbortSignal.timeout(5000) // Fast timeout for N8N check
            });

            if (n8nResponse.ok) {
                const data = await n8nResponse.json();
                if (data.imageUrl || data.url || data.image) {
                    console.log('✅ N8N MarketSyn Image success');
                    return NextResponse.json({
                        imageUrl: data.imageUrl || data.url || data.image,
                        provider: 'n8n-marketsyn'
                    });
                }
            }
        } catch (n8nError) {
            console.log('⚠️ N8N not responding, moving to direct APIs');
        }

        // Option 2: Try Kling directly (Corrected domain)
        const token = await getKlingToken();
        if (token) {
            try {
                console.log('📸 Trying Kling AI (Image)...');
                const klingResponse = await fetch(KLING_IMAGE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: enhancedPrompt,
                        model: 'kling-v1',
                        aspect_ratio: '16:9'
                    })
                });

                if (klingResponse.ok) {
                    const data = await klingResponse.json();

                    if (data.data?.task_id) {
                        console.log('⏳ Kling AI task created (async):', data.data.task_id);
                        let attempts = 0;
                        const maxAttempts = 12; // Increase wait time for images

                        while (attempts < maxAttempts) {
                            await new Promise(r => setTimeout(r, 5000)); // Wait 5s between checks
                            const statusResponse = await fetch(KLING_IMAGE_STATUS_URL(data.data.task_id), {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (statusResponse.ok) {
                                const statusData = await statusResponse.json();
                                if (statusData.data?.status === 'succeeded' && statusData.data?.task_result?.images?.[0]?.url) {
                                    return NextResponse.json({
                                        imageUrl: statusData.data.task_result.images[0].url,
                                        provider: 'kling'
                                    });
                                }
                                if (statusData.data?.status === 'failed') {
                                    console.error('❌ Kling task failed:', statusData.data?.task_status_msg);
                                    break;
                                }
                            }
                            attempts++;
                        }
                    }
                }
                console.log('⚠️ Kling AI failed or busy, trying Flux...');
            } catch (klingError) {
                console.error('Kling API error:', klingError);
            }
        }

        // Option 3: Try Pollinations.ai (Free, Reliable AI Image Generation)
        try {
            console.log('📸 Trying Pollinations.ai (Free Flux)...');
            // Pollinations.ai provides free image generation via URL
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1200&height=675&nologo=true`;

            // Verify the URL works by making a HEAD request
            const testResponse = await fetch(pollinationsUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });

            if (testResponse.ok) {
                console.log('✅ Pollinations.ai image URL ready');
                return NextResponse.json({
                    imageUrl: pollinationsUrl,
                    provider: 'pollinations'
                });
            }
        } catch (pollinationsError) {
            console.error('Pollinations API error:', pollinationsError);
        }

        // Use fallback image if no API keys or all APIs failed
        const fallbackImage = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
        console.log('🔄 Using fallback image');

        return NextResponse.json({
            imageUrl: fallbackImage,
            provider: 'fallback',
            message: 'Using placeholder image. Configure KLING_ACCESS_KEY/SECRET_KEY or FAL_KEY in .env.local for AI generation.'
        });

    } catch (error) {
        console.error('Generate Image API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate image', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    const token = await getKlingToken();
    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.FAL_KEY || '';
    return NextResponse.json({
        status: 'Image Generation API Active',
        providers: {
            kling: token ? 'configured' : 'not configured',
            flux: openrouterKey ? 'configured (OpenRouter)' : 'not configured'
        },
        usage: 'POST with { prompt, companyName?, slogan?, style?, primaryColor?, accentColor? }'
    });
}
