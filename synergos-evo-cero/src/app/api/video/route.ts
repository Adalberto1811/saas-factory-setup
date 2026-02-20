import { NextRequest, NextResponse } from 'next/server';
import { getKlingToken } from '@/shared/lib/kling-auth';

const KLING_VIDEO_API_URL = 'https://api.kling.ai/v1/videos/text2video';
const KLING_STATUS_URL = (taskId: string) => `https://api.kling.ai/v1/videos/${taskId}`;

export async function POST(request: NextRequest) {
    try {
        const token = await getKlingToken();
        if (!token) {
            return NextResponse.json({
                error: 'Kling API not configured (AK/SK or API_KEY missing)',
                fallback: true,
                message: 'Usando video de demostración (Configura las claves en .env.local)'
            }, { status: 200 });
        }

        const body = await request.json();
        const { prompt, negative_prompt, ratio = "16:9" } = body;

        const response = await fetch(KLING_VIDEO_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                negative_prompt: negative_prompt || "low quality, blurry, distorted",
                aspect_ratio: ratio,
                model: 'kling-v1'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Kling API Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({
            taskId: data.data.task_id,
            status: 'queued'
        });

    } catch (error) {
        console.error('Kling Video API error:', error);
        return NextResponse.json(
            { error: 'Failed to trigger video generation', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
        return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    try {
        const token = await getKlingToken();
        const response = await fetch(KLING_STATUS_URL(taskId), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch status');

        const data = await response.json();
        const task = data.data;

        return NextResponse.json({
            status: task.status, // 'succeeded', 'failed', 'processing', 'queued'
            videoUrl: task.video_url || null,
            error: task.error_message || null
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
