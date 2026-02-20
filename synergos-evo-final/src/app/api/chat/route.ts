import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// OpenRouter Provider
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

const SYSTEM_PROMPT = `
ERES: "Syn", el AGENTE DE VANGUARDIA (Scout) de la plataforma "Synergos Solutions". Tu misión es ser la cara visible de la factoría y calificar a los visitantes antes de dirigirlos al Orquestador Principal (AgentSyn).

TU IDENTIDAD Y SALUDO:
- Siempre inicia presentándote: "Hola, soy Syn, el Agente de Vanguardia de Synergos Solutions."
- Explica nuestra esencia: "En Synergos, somos orquestadores. Combinamos la IA para potenciar áreas clave de tu negocio."

MÓDULOS QUE PRESENTAS:
1. MARKETSYN: IA para Marketing (Estrategias de contenido, Video Ads con Runway, Generación masiva Whisk).
2. SYNCARDS: IA para tu Digital Branding (Tarjetas NFC, Red de Contactos Inteligente).
3. SUITE LEGAL: IA para aspectos legales (ABOGADOS - Contratos, Documentos y automatización legal).

TU OBJETIVO (SINERGIA):
- Tu labor es explorar al cliente (oferta, dolor, presupuesto) para que el Orquestador Principal, **AgentSyn**, pueda ejecutar la producción real dentro de la factoría.
- Nombrar que AgentSyn es el orquestador que "toma el relevo" para crear el resultado final.

FLUJO:
1. Si el usuario muestra interés en cualquier área, califícalo preguntando por su oferta y dolor.
2. Explica que, una vez calificado, AgentSyn lo recibirá en la factoría para ejecutar el MarketSyn o los SynCards.

PERSONALIDAD:
- Profesional, vanguardista, persuasiva y orientada a la sinergia.
`;

export async function POST(req: Request) {
    const fs = await import('fs');
    const path = await import('path');
    const logFile = path.join(process.cwd(), 'server-debug.log');

    const log = (msg: string) => {
        const timestamp = new Date().toISOString();
        try {
            fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
            console.log(msg);
        } catch (e) { console.error("Log failed", e); }
    };

    log("🟢 [API] POST /api/chat called request received");
    try {
        const { messages } = await req.json();
        log(`🟢 [API] Messages: ${messages.length}`);
        log(`🟢 [API] Key exists: ${!!process.env.OPENROUTER_API_KEY}`);

        // Polyfill for convertToCoreMessages
        const coreMessages = messages.map((m: any) => ({
            role: m.role,
            content: m.content
        }));

        const result = await streamText({
            model: openrouter('google/gemini-2.0-flash-exp:free'),
            system: SYSTEM_PROMPT,
            messages: coreMessages,
            temperature: 0.3,
            tools: {
                generateCampaign: {
                    description: 'Generate a 7-day viral marketing campaign (MarketSyn) based on product, offers and pain points.',
                    parameters: z.object({
                        product: z.string().describe('Product or service name'),
                        precioNormal: z.string().describe('Regular price'),
                        precioOferta: z.string().describe('Offer price'),
                        dolor: z.string().describe('Customer pain point'),
                        publico: z.string().describe('Target audience'),
                        competitorUrl: z.string().optional().describe('Competitor URL for business DNA analysis')
                    }),
                    execute: async ({ product, precioNormal, precioOferta, dolor, publico, competitorUrl }) => {
                        // Logic ported from MarketSyn N8N Workflow
                        const prompt = `ACTÚA COMO: Un Publicista Creativo de Alto Nivel combinando:
- **Alex Hormozi**: Copy de alto impacto, urgencia
- **Ricky Riquelme**: Embudos persuasivos
- **MrBeast**: Contenido visual ultra-dinámico

TU OBJETIVO: Generar una estrategia de 7 días optimizada para VIDEO (TikTok/Reels).

CONTEXTO:
- Producto: ${product}
- Oferta: ${precioOferta} (Antes ${precioNormal})
- Dolor: ${dolor}
- Público: ${publico}
${competitorUrl ? `- Competencia: ${competitorUrl} (Analiza su estilo)` : ''}

REGLAS MRBEAST:
1. KINETIC TYPOGRAPHY: Scripts para subtítulos grandes.
2. ESCENAS DE 2-3 SEGUNDOS.
3. MÚSICA IN CRESCENDO.

FORMATO JSON OBLIGATORIO:
{
  "strategy": "Resumen ejecutivo...",
  "plan": [
    {
      "day": "Día 1",
      "type": "Gancho",
      "script": "...",
      "visualNotes": "...",
      "neuroMetrics": { "gazeDirection": "camera", "editBPM": 90, "emotionalTone": "curiosity" }
    }
    // ... generate 7 days
  ]
}`;

                        // Call the LLM again to generate the JSON plan
                        // In a real agent, this would be a separate LLM call or a chain.
                        // For Agent Zero V1, we return the instruction to the UI to render the "Thinking..." state
                        // and let the client-side or a rigorous server-side call handle the generation.
                        // HOWEVER, for tool execution, we usually want to return the DATA.

                        const { generateObject } = await import('ai');
                        const { z } = await import('zod');

                        const planSchema = z.object({
                            strategy: z.string(),
                            plan: z.array(z.object({
                                day: z.string(),
                                type: z.string(),
                                script: z.string(),
                                visualNotes: z.string(),
                                neuroMetrics: z.object({
                                    gazeDirection: z.enum(['camera', 'product', 'cta']),
                                    editBPM: z.number(),
                                    emotionalTone: z.string()
                                })
                            }))
                        });

                        const generation = await generateObject({
                            model: openrouter('google/gemini-2.0-flash-exp:free'),
                            prompt: prompt,
                            schema: planSchema
                        });

                        return generation.object;
                    }
                }
            },
            maxSteps: 5,
        });

        console.log("🟢 [API] streamText result keys:", Object.keys(result));
        // console.log("🟢 [API] streamText result prototype:", Object.getPrototypeOf(result));

        // Fallback or correct usage check
        if (typeof result.toDataStreamResponse === 'function') {
            return result.toDataStreamResponse();
        } else {
            console.warn("⚠️ [API] toDataStreamResponse missing, using toTextStreamResponse");
            return result.toTextStreamResponse();
        }
    } catch (error: any) {
        console.error("🔴 [API] Error in route:", error);
        return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { status: 500 });
    }
}
