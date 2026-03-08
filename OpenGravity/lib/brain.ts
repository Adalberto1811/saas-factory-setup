import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getHistory } from './database';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-001"; // Usando un modelo estable y rápido

if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR: OPENROUTER_API_KEY no encontrada en .env');
}

/**
 * Carga el núcleo de identidad de Socio Boss
 */
const loadSystemPrompt = (): string => {
    try {
        const filePath = path.resolve(__dirname, '../SOCIO_BOSS.md');
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        return "Eres Socio Boss, el AGENTE de IA personal y autónomo de este repositorio.";
    }
};

/**
 * Carga un resumen de la memoria técnica (memory_bank)
 */
const loadMemoryContext = (): string => {
    try {
        const filePath = path.resolve(__dirname, '../memory/memory_bank.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Extraemos solo lo vital para el contexto (ej: aprendizajes y arquitectura)
        return `CONTEXTO TÉCNICO:\n- Proyectos: SaaS Factory, PSE, Synergos.\n- Stack: Next.js 16, React 19, Neon DB, n8n.\n- Aprendizajes clave: ${JSON.stringify(data.infrastructure || {}).substring(0, 500)}...`;
    } catch (err) {
        return "Contexto: Desarrollo de Software SaaS.";
    }
};

/**
 * Procesa un mensaje usando OpenRouter e integra Memoria Inmortal
 */
export const think = async (userMessage: string, userId: number): Promise<string> => {
    const systemPrompt = loadSystemPrompt();
    const memoryContext = loadMemoryContext();

    // Recuperar memoria persistente de la base de datos
    const persistentHistory = await getHistory(userId, 15);

    const fullPrompt = `${systemPrompt}\n\n${memoryContext}\n\n
    INSTRUCCIÓN DE IDENTIDAD:
    - TÚ eres Socio Boss (La IA).
    - El USUARIO con el que hablas es el Socio (El Humano/Boss).
    - Si te preguntan "¿quién soy yo?", responde que él es el Socio (el humano que dirige la visión) y que tú eres su Socio Boss (la IA que ejecuta).
    
    REGLA: Responde siempre en ESPAÑOL. Sé directo y ejecutivo. No digas "Recibido fuerte y claro", responde como Socio Boss.`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: MODEL,
                messages: [
                    { role: "system", content: fullPrompt },
                    ...persistentHistory,
                    { role: "user", content: userMessage }
                ],
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "X-Title": "Socio Boss Open Gravity",
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content || "Lo siento Socio, mi procesador tuvo un hipo. Intenta de nuevo.";
    } catch (error: any) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        return "❌ Error de conexión con el cerebro central. Verifica la API KEY.";
    }
};
