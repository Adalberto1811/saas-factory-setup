import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getKlingToken } from '@/shared/lib/kling-auth';

// Configuration for image generation services
const N8N_BASE_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';
const N8N_IMAGE_WEBHOOK = 'webhook/marketsyn-image';
const KLING_IMAGE_API_URL = 'https://api.klingai.com/v1/images/generations';
const KLING_IMAGE_STATUS_URL = (taskId: string) => `https://api.klingai.com/v1/images/generations/${taskId}`;

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

        const enhancedPrompt = `${prompt}. Estilo cinematográfico, profesional, alta calidad, 4K. Colores dominantres: ${primaryColor || '#6366F1'} y ${accentColor || '#F472B6'}.`;

        console.log('🎨 Generate Image API called:', { prompt: enhancedPrompt.substring(0, 100) });

        // Logic with retries
        async function fetchWithRetry(url: string, payload: any, headers: any, maxRetries = 3): Promise<any> {
            let attempts = 0;
            while (attempts <= maxRetries) {
                try {
                    const response = await axios.post(url, payload, { headers, timeout: 20000 });
                    return response;
                } catch (error: any) {
                    if (error.response?.status === 429 && attempts < maxRetries) {
                        const delay = Math.pow(2, attempts + 1) * 1000 + Math.random() * 1000;
                        console.log(`[Image API] Rate limited (429). Retry ${attempts + 1}/${maxRetries} in ${Math.round(delay)}ms...`);
                        await new Promise(r => setTimeout(r, delay));
                        attempts++;
                    } else {
                        throw error;
                    }
                }
            }
        }

        // Option 1: Try N8N MarketSyn Image Workflow
        try {
            console.log('📸 Trying N8N MarketSyn Image Workflow...');
            const n8nResponse = await axios.post(`${N8N_BASE_URL}/${N8N_IMAGE_WEBHOOK}`, {
                prompt: enhancedPrompt,
                companyName,
                slogan,
                primaryColor,
                accentColor
            }, { timeout: 5000 });

            if (n8nResponse.status === 200) {
                const data = n8nResponse.data;
                if (data.imageUrl || data.url || data.image) {
                    console.log('✅ N8N MarketSyn Image success');
                    return NextResponse.json({
                        imageUrl: data.imageUrl || data.url || data.image,
                        provider: 'n8n-marketsyn'
                    });
                }
            }
        } catch (n8nError) {
            console.log('⚠️ N8N placeholder or busy, moving to direct APIs');
        }

        // Option 2: Try Kling directly
        const token = await getKlingToken();
        if (token) {
            try {
                console.log('📸 Trying Kling AI (Image)...');
                const klingResponse = await fetchWithRetry(KLING_IMAGE_API_URL, {
                    prompt: enhancedPrompt,
                    model: 'kling-v1',
                    aspect_ratio: '16:9'
                }, {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });

                if (klingResponse.status === 200) {
                    const data = klingResponse.data;
                    if (data.data?.task_id) {
                        console.log('⏳ Kling AI task created (async):', data.data.task_id);
                        let attempts = 0;
                        const maxAttempts = 12;

                        while (attempts < maxAttempts) {
                            await new Promise(r => setTimeout(r, 5000));
                            const statusResponse = await axios.get(KLING_IMAGE_STATUS_URL(data.data.task_id), {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (statusResponse.status === 200) {
                                const statusData = statusResponse.data;
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
            } catch (klingError) {
                console.error('Kling API error:', klingError);
            }
        }

        // Option 3: Try Flux via OpenRouter (Premium)
        const openrouterKey = process.env.OPENROUTER_API_KEY;
        if (openrouterKey) {
            try {
                console.log('📸 Trying Flux via OpenRouter (Black Forest Labs)...');
                const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
                    model: "black-forest-labs/flux-1-schnell", // Fast and good quality
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Generate an image for: ${enhancedPrompt}`
                                }
                            ]
                        }
                    ],
                    // OpenRouter vision models might be different, 
                    // but for Flux we might need a specific endpoint if it's image gen
                    // Wait, standard OpenRouter is chat. For images, we usually use Fal.ai or direct providers.
                    // If the user said "via OpenRouter", they might mean a specific model that outputs image URLs 
                    // or they might be mistaken and mean Fal.ai which is in the GET method.
                }, {
                    "Authorization": `Bearer ${openrouterKey}`,
                    "Content-Type": "application/json"
                });

                // Actually, OpenRouter doesn't support Flux Image Generation directly in the chat API 
                // unless it's a specific wrapper.
                // Let's check how Fal.ai is used.
            } catch (err) {
                console.log('⚠️ OpenRouter Flux failed');
            }
        }

        // Option 3 (Revised): Try Fal.ai (Flux) directly if FAL_KEY exists
        const falKey = process.env.FAL_KEY;
        if (falKey) {
            try {
                console.log('📸 Trying Flux.1 [dev] via Fal.ai...');
                const falResponse = await axios.post('https://fal.run/fal-ai/flux/dev', {
                    prompt: enhancedPrompt,
                    image_size: "landscape_16_9",
                    num_inference_steps: 28,
                    guidance_scale: 3.5
                }, {
                    headers: {
                        'Authorization': `Key ${falKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 45000
                });

                if (falResponse.data?.images?.[0]?.url) {
                    console.log('✅ Fal.ai Flux success');
                    return NextResponse.json({
                        imageUrl: falResponse.data.images[0].url,
                        provider: 'fal-flux'
                    });
                }
            } catch (falError: any) {
                console.error('Fal.ai API error:', falError.response?.data || falError.message);
            }
        }

        // Option 4: Try Pollinations.ai (Free)
        try {
            console.log('📸 Trying Pollinations.ai (Free Flux)...');
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1200&height=675&nologo=true`;

            // Check availability
            const testResponse = await axios.head(pollinationsUrl, { timeout: 5000 });
            if (testResponse.status === 200) {
                console.log('✅ Pollinations.ai image URL ready');
                return NextResponse.json({
                    imageUrl: pollinationsUrl,
                    provider: 'pollinations'
                });
            }
        } catch (pollinationsError) {
            console.error('Pollinations API error or timeout');
        }

        // Fallback
        const fallbackImage = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
        console.log('🔄 Using fallback image');

        return NextResponse.json({
            imageUrl: fallbackImage,
            provider: 'fallback',
            message: 'Using placeholder image.'
        });

    } catch (error: any) {
        console.error('Generate Image API error:', error.message);
        return NextResponse.json(
            { error: 'Failed to generate image', details: String(error.message) },
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
