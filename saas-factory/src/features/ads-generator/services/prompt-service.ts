import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🎯 TIERED STABILITY MODELS - Same as MarketSyn
const MODELS = [
    "google/gemini-2.5-flash",
    "google/gemini-2.0-flash-001",
    "google/gemini-2.5-pro",
    "openai/gpt-3.5-turbo"
];

interface PromptBatchResponse {
    prompts: string[];
}

export class AdsPromptService {
    /**
     * Generates a batch of 20 highly descriptive visual prompts for Whisk Automator.
     * @param businessIdea The business idea or product description.
     * @param characterReference Optional description of a character to maintain consistency.
     */
    static async generateBatch(businessIdea: string, characterReference?: string): Promise<string[]> {
        if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is missing in .env.local");

        const characterContext = characterReference
            ? `OBLIGATORIO: El personaje principal de todas las imágenes debe ser exactamente: ${characterReference}. Mantén consistencia total en su apariencia.`
            : "";

        const prompt = `ACTUA COMO: Un Experto en Prompt Engineering para Generación de Imágenes (Midjourney/DALL-E 3).
OBJETIVO: Generar un LOTE DE 20 PROMPTS VISUALES independientes para una idea de negocio.

IDEA DE NEGOCIO: ${businessIdea}
${characterContext}

REGLAS DE LOS PROMPTS:
1. Cada prompt debe ser un PÁRRAFO INDEPENDIENTE de unas 30-50 palabras.
2. Formato Altamente Descriptivo: Incluye iluminación (cinematic, soft, neon), ángulo de cámara (low angle, close up, wide), estilo (photorealistic, 8k, highly detailed) y el "vibe" del negocio.
3. Variedad: Los 20 prompts deben mostrar 20 escenas diferentes relacionadas con el negocio (uso del producto, éxito del cliente, ambiente de trabajo, etc.).
4. Idioma: Escribe los prompts en INGLÉS (optimizado para generadores de imágenes).

FORMATO DE RESPUESTA JSON:
{
  "prompts": [
    "Prompt 1...",
    "Prompt 2...",
    ...
    "Prompt 20..."
  ]
}

Responde ÚNICAMENTE con el objeto JSON.`;

        return this.callOpenRouter(prompt);
    }

    private static async callOpenRouter(prompt: string, modelIndex = 0): Promise<string[]> {
        const currentModel = MODELS[modelIndex];
        if (!currentModel) throw new Error("Todos los motores de prompts están saturados.");

        try {
            console.log(`📡 AdsPromptService: Trying model ${currentModel}`);
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: currentModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" }
            }, {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://synergos.solutions",
                    "X-Title": "Synergos Ads-Generator Engine",
                },
                timeout: 90000 // Higher timeout for batch generation
            });

            const content = response.data.choices?.[0]?.message?.content;
            if (!content) throw new Error("Empty response from AI engine.");

            const jsonResponse: PromptBatchResponse = JSON.parse(
                content.replace(/```json/g, '').replace(/```/g, '').trim()
            );

            if (!jsonResponse.prompts || !Array.isArray(jsonResponse.prompts)) {
                throw new Error("Invalid response structure: 'prompts' array missing.");
            }

            return jsonResponse.prompts;
        } catch (error: any) {
            console.warn(`🚨 AdsPromptService model ${currentModel} failed: ${error.message}`);
            return this.callOpenRouter(prompt, modelIndex + 1);
        }
    }
}
