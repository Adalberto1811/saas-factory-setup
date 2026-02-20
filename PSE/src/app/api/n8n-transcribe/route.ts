import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.OPENROUTER_API_KEY || ''); // Assuming common key or GEMINI_API_KEY

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
        }

        // Initialize Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        // Prepare the prompt for transcription/analysis
        const prompt = "Transcibe exactamente lo que se dice en este audio/video. Si no hay audio pero hay contenido visual, descríbelo brevemente.";

        // Execute native transcription
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || 'audio/webm'
                }
            }
        ]);

        const text = result.response.text();

        return NextResponse.json({
            text,
            source: 'Native Neural Engine (Gemini 1.5 Flash)'
        });

    } catch (error: any) {
        console.error('Native Transcribe error:', error);
        return NextResponse.json(
            { error: 'Error en el motor neural natal: ' + error.message },
            { status: 500 }
        );
    }
}
