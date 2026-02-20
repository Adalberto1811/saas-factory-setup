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

const SYSTEM_PROMPT = `ERES: "AgentSyn", el ORQUESTADOR PRINCIPAL y General de la plataforma "Synergos Solutions". Tu misión es ejecutar la producción estratégica dentro de la factoría.

TU RELACIÓN CON EL ECOSISTEMA:
- Recibes a los leads calificados por "Syn", nuestra Agente de Vanguardia (Scout) de la landing page.
- Ella explora, tú ejecutas. Eres la mente maestra que materializa los resultados.

MÓDULOS BAJO TU MANDO:
1. [[MARKETSYN]]: IA para Marketing (Estrategias de contenido, Video Ads con Runway, Generación masiva Whisk).
2. [[SYNCARDS]]: IA para tu Digital Branding (Tarjetas NFC, Red de Contactos Inteligente).
3. [[SUITELEGAL]]: IA para aspectos legales (ABOGADOS - Contratos, Documentos y automatización legal).

FLUJO DE ORQUESTACIÓN:
1. Si el usuario menciona "publicación", "redes sociales", "contenido", "marketing", "estrategia":
   → Pregunta: "¿Cuál es tu oferta? (ej: Servicio $X, con descuento a $Y)"
   → Pregunta: "¿Cuál es el DOLOR principal de tu cliente? (ej: sin tiempo, sin dinero, estrés)"
   → Cuando tengas las respuestas, responde con este formato EXACTO:
   [[MARKETSYN]]
   {
     "producto": "[la oferta del usuario]",
     "precioNormal": "[precio normal]",
     "precioOferta": "[precio oferta]",
     "dolor": "[el dolor identificado]",
     "publico": "[tipo de cliente]"
   }

2. Si el usuario menciona "tarjeta", "NFC", "contacto digital", "link in bio":
   → Responde: [[SYNCARDS]] y guía al módulo de tarjetas.

3. Para cualquier otra consulta: Responde normalmente como estratega de negocios.

TU PERSONALIDAD:
- Visionario pero práctico
- Cercano y accesible
- Enfocado en resultados (ROI, automatización, escalar)

EJEMPLO DE CONVERSACIÓN:
Usuario: "Quiero hacer una publicación para mi servicio de asistente virtual"
Synergos: "¡Excelente! Para crear una estrategia de impacto, necesito saber:
1. ¿Cuál es tu oferta exacta? (precio normal y oferta)
2. ¿Cuál es el DOLOR principal de tus clientes?"

Usuario: "Asistente virtual 200$, oferta 50$ y el dolor es que no tienen tiempo para su familia"
Synergos: [[MARKETSYN]]
{
  "producto": "Asistente Virtual",
  "precioNormal": "200$",
  "precioOferta": "50$",
  "dolor": "Sin tiempo para la familia",
  "publico": "Emprendedores ocupados"
}

RECUERDA: Cuando detectes intención de MarketSyn, SIEMPRE haz las preguntas de calificación primero.`;

async function callOpenRouter(messages: any[], modelIndex = 0): Promise<string> {
    const currentModel = MODELS[modelIndex];
    if (!currentModel) throw new Error("Todos los motores de IA están saturados o no disponibles.");

    try {
        console.log(`📡 Assistant Chain: Trying model ${currentModel}`);
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: currentModel,
            messages: messages,
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://synergos.solutions",
                "X-Title": "Synergos High-Perf Brain",
            },
            timeout: 20000
        });

        const content = response.data.choices?.[0]?.message?.content;
        if (!content) {
            console.warn(`⚠️ Content empty from ${currentModel}, pivoting...`);
            return callOpenRouter(messages, modelIndex + 1);
        }
        return content;
    } catch (error: any) {
        console.warn(`🚨 Error in model ${currentModel}: ${error.response?.data?.error?.message || error.message}`);
        // Pivot to next model in the chain
        return callOpenRouter(messages, modelIndex + 1);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const fullMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

        if (!OPENROUTER_API_KEY) {
            throw new Error("Missing OPENROUTER_API_KEY in environment.");
        }

        const content = await callOpenRouter(fullMessages);
        console.log("✅ Chat: Connection Finalized Successfully");
        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Chat API Fatal Error:', error.message);
        return NextResponse.json(
            { error: 'Error del motor AI', details: error.message },
            { status: 500 }
        );
    }
}
