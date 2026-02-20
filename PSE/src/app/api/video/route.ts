import { NextRequest, NextResponse } from 'next/server';
import { KlingService } from '@/shared/services/kling-service';
import { ReplicateService } from '@/shared/services/replicate-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, ratio = "16:9", logoUrl, engine = 'kling' } = body;

        console.log(`🎬 API Video: Starting ${engine} Task for prompt:`, prompt.substring(0, 50) + "...");

        try {
            let taskId: string;
            let usedEngine = engine;

            if (engine === 'runway' || engine === 'replicate') {
                taskId = await ReplicateService.createVideo(prompt, ratio === "9:16" ? "9:16" : "16:9");
                usedEngine = 'replicate';
            } else {
                taskId = await KlingService.createVideo(
                    prompt,
                    ratio === "9:16" ? "9:16" : "16:9",
                    logoUrl
                );
            }

            return NextResponse.json({
                taskId,
                status: 'queued',
                engine: usedEngine
            });
        } catch (sdkError: any) {
            console.error(`❌ ${engine} SDK Error:`, sdkError.message);

            // Handle specific balance error for automatic fallback if possible or just report it
            if (sdkError.message.toLowerCase().includes("balance") || sdkError.message.includes("1102")) {
                return NextResponse.json({
                    error: `Saldo insuficiente en ${engine}.`,
                    fallback: true,
                    message: `Tu cuenta de ${engine} no tiene créditos. Por favor recarga o cambia de motor.`
                }, { status: 200 });
            }

            if (sdkError.message.includes("missing") || sdkError.message.includes("placeholder")) {
                return NextResponse.json({
                    error: `Motor ${engine} no configurado.`,
                    fallback: true,
                    message: `Configura las llaves de ${engine} en el archivo .env.local para activar este motor.`
                }, { status: 200 });
            }
            throw sdkError;
        }

    } catch (error) {
        console.error('Video API error:', error);
        return NextResponse.json(
            { error: 'Failed to trigger video generation', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const engine = searchParams.get('engine') || 'kling';

    if (!taskId) {
        return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    try {
        let task;
        if (engine === 'runway' || engine === 'replicate') {
            const replicateTask = await ReplicateService.getTaskStatus(taskId);
            // Normalize replicate status to our frontend expectations
            let normalizedStatus = 'queued';
            if (replicateTask.status === 'succeeded') normalizedStatus = 'succeeded';
            else if (replicateTask.status === 'failed' || replicateTask.status === 'canceled') normalizedStatus = 'failed';
            else if (replicateTask.status === 'processing' || replicateTask.status === 'starting') normalizedStatus = 'processing';

            task = {
                status: normalizedStatus,
                videoUrl: replicateTask.videoUrl,
                error: replicateTask.error
            };
        } else {
            task = await KlingService.getTaskStatus(taskId);
        }

        return NextResponse.json({
            status: task.status,
            videoUrl: task.videoUrl || null,
            error: task.error || null,
            rawStatus: task.status
        });

    } catch (error) {
        console.error(`${engine} Status API error:`, error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
