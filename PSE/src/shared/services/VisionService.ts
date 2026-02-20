import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * VisionService for PSE
 * Uses Gemini 1.5 Flash to extract technical metrics and training plans from images.
 */
export class VisionService {
    private static genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

    /**
     * Extracts text and structured data from a base64 image.
     */
    static async extractTrainingData(base64Image: string, mimeType: string = "image/jpeg") {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Analiza esta imagen de entrenamiento de natación. 
            Extrae de forma estructurada los siguientes datos si están presentes:
            - Series y repeticiones.
            - Distancias (m).
            - Tiempos de salida o ritmos (CSS).
            - Objetivos técnicos mencionados.
            - Pesos y volúmenes corporales.
            
            Responde en formato JSON puro, sin bloques de código markdown, con la siguiente estructura:
            {
                "detected_data": "Resumen textual de lo encontrado",
                "metrics": {
                    "volume": "total metros si se puede calcular",
                    "intensity": "descripción de la intensidad",
                    "focus": "foco técnico"
                }
            }
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image.split(",")[1] || base64Image,
                        mimeType
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            // Clean up potentially returned markdown blocks
            const cleanJson = text.replace(/```json|```/g, "").trim();

            return JSON.parse(cleanJson);
        } catch (error: any) {
            console.error("[VisionService] Error extracting data:", error.message);
            throw new Error(`Fallo en el motor de visión: ${error.message}`);
        }
    }
}
