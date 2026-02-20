import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Bypass SSL certificate issues for local environment
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🎯 TIERED STABILITY MODELS - Paid Tier
const MODELS = [
    "google/gemini-2.5-flash",
    "google/gemini-2.0-flash-001",
    "google/gemini-2.5-pro",
    "openai/gpt-3.5-turbo"
];

const MASTER_PROMPT_TEMPLATE = `ACTUA COMO: Un Publicista Creativo de Alto Nivel combinando Hormozi, Riquelme y MrBeast.
OBJETIVO: Generar una estrategia de 7 dias para VIDEO.

FORMATO DE RESPUESTA JSON:
{
  "strategy": "Resumen...",
  "plan": [
    {
      "day": "Día 1",
      "type": "Gancho",
      "phase": "El Problema",
      "script": "Script...",
      "visualNotes": "Notas...",
      "thumbnailPrompt": "Prompt..."
    }
  ]
}`;

async function callOpenRouter(prompt: string, modelIndex = 0): Promise<any> {
    const currentModel = MODELS[modelIndex];
    if (!currentModel) throw new Error("Todos los motores de estrategia están saturados.");

    try {
        console.log(`📡 MarketSyn Chain: Trying model ${currentModel}`);
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: currentModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://synergos.solutions",
                "X-Title": "Synergos Market-Syn Engine",
            },
            timeout: 60000
        });

        const content = response.data.choices?.[0]?.message?.content;
        if (!content) throw new Error("Empty response from AI engine.");

        return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error: any) {
        console.warn(`🚨 MarketSyn model ${currentModel} failed: ${error.message}`);
        return callOpenRouter(prompt, modelIndex + 1);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productName, price, painPoint } = body;

        if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is missing.");

        const mainPrompt = `${MASTER_PROMPT_TEMPLATE}\n\nDATOS DEL CLIENTE:\nProducto: ${productName}\nPrecio: ${price}\nDolor: ${painPoint}`;

        // 🎯 PURE RESILIENT CONNECTION
        const directData = await callOpenRouter(mainPrompt);
        console.log("✅ MarketSyn: Connection Finalized Successfully");
        return NextResponse.json(directData);

    } catch (error: any) {
        console.error('MarketSyn API Fatal Error:', error.message);
        return NextResponse.json(
            { error: 'Error al generar la estrategia creativa', details: error.message },
            { status: 500 }
        );
    }
}
