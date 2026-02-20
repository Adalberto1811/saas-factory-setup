const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const OPENROUTER_API_KEY = "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";

async function cargarCerebro() {
    const rutaTecnica = path.join(__dirname, 'src/core/prompts/COACH_MASTER_PROMPT.txt');
    const rutaEstrategia = path.join(__dirname, 'src/core/prompts/CoachSwin.txt');

    console.log("==========================================");
    console.log("🚀 PERFORMANCE SWIMMING EVOLUTION - CORE");

    let contenidoTecnico = "";
    let contenidoEstrategico = "";

    // Cargar Técnica (Soriano/Laughlin)
    if (fs.existsSync(rutaTecnica)) {
        contenidoTecnico = fs.readFileSync(rutaTecnica, 'utf8');
        console.log(`✅ TECNICA (MASTER): Cargada (${(contenidoTecnico.length / 1024).toFixed(2)} KB)`);
    } else {
        console.log("❌ ERROR: No encuentro el archivo de Técnica en src/core/prompts/");
    }

    // Cargar Estrategia (CoachSwin.txt)
    if (fs.existsSync(rutaEstrategia)) {
        contenidoEstrategico = fs.readFileSync(rutaEstrategia, 'utf8');
        console.log(`✅ ESTRATEGIA SWIN: Cargada (${(contenidoEstrategico.length / 1024).toFixed(2)} KB)`);
    } else {
        console.log("❌ ERROR: No encuentro src/core/prompts/CoachSwin.txt");
    }

    console.log("==========================================");

    return { contenidoTecnico, contenidoEstrategico };
}

async function runCoachAssistant(query) {
    const { contenidoTecnico, contenidoEstrategico } = await cargarCerebro();

    const systemInstruction = `
Eres la entidad digital autónoma "Performance Swimming Evolution" (EvoSwim).
Tu cerebro se compone de dos pilares fundamentales:

1. ESTRATEGIA DEPORTIVA (18KB): ${contenidoEstrategico}
2. TÉCNICA MAESTRA (Terry Laughlin / Rafa Soriano): ${contenidoTecnico}

REGLAS OBLIGATORIAS:
- Usa el "Ojo Clínico de Rafa Soriano" para análisis de Causa y Efecto. 
- Si detectas un error técnico (ej. Cabeza Alta), explica la CAUSA y el EFECTO hidrodinámico.
- Responde siempre con la metodología de entrenamiento de EvoSwim.
- Al final de cada análisis técnico, sugiere exactamente 3 ejercicios, priorizando los de la lista de Rafa Soriano en el MASTER PROMPT.
- Mantén un tono analítico-preciso, metódico y motivador.
`;

    // Intentar con OpenRouter directamente para asegurar éxito (ya que la key directa falló)
    console.log("\n🛰️ Conectando con el cerebro vía OpenRouter (Gemini 2.0 Flash)...");

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'PSE Coach Director',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001', // Usamos modelo de pago para estabilidad
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: query }
                ]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`\n🏊 EvoSwim: ${data.choices[0].message.content}`);
        } else {
            console.error("❌ Error en OpenRouter:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Fallo crítico en la conexión:", error);
    }
}

// Ejemplo de análisis técnico de video (Simulado por texto)
const testQuery = "Acabo de subir un video y veo que mi nadador tiene la cabeza muy alta al respirar. Analiza la técnica y dame el plan de acción.";

runCoachAssistant(testQuery);