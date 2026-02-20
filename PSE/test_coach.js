const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const OPENROUTER_API_KEY = "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";

async function cargarCerebro() {
    const rutaTecnica = path.join(__dirname, 'src/core/prompts/COACH_MASTER_PROMPT.txt');
    const rutaEstrategia = path.join(__dirname, 'src/core/prompts/CoachSwin.txt');

    let contenidoTecnico = fs.readFileSync(rutaTecnica, 'utf8');
    let contenidoEstrategico = fs.readFileSync(rutaEstrategia, 'utf8');

    return { contenidoTecnico, contenidoEstrategico };
}

async function stressTest() {
    const { contenidoTecnico, contenidoEstrategico } = await cargarCerebro();
    const query = "Coach, soy un triatleta, mis piernas se hunden mucho y siento que peleo contra el agua. ¿Qué estoy haciendo mal?";

    console.log("=== INICIANDO STRESS TEST: EvoSwim Brain ===");

    const systemInstruction = `
Eres la entidad digital autónoma "Performance Swimming Evolution" (EvoSwim).
Tu cerebro se compone de:
1. ESTRATEGIA DEPORTIVA (18KB): ${contenidoEstrategico}
2. TÉCNICA MAESTRA (Terry Laughlin / Rafa Soriano): ${contenidoTecnico}

REGLAS OBLIGATORIAS:
- Usa el "Ojo Clínico de Rafa Soriano" para análisis de Causa y Efecto. 
- Analiza por qué las piernas se hunden (CAUSA) y su impacto (EFECTO).
- Usa la estructura pedagógica de EvoSwim.
- Finaliza con 3 ejercicios obligatorios (Prioridad Rafa Soriano).
`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'PSE Stress Test',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: query }
                ]
            })
        });

        const data = await response.json();
        if (response.ok && data.choices && data.choices[0]) {
            console.log("\n🏊 RESPUESTA DEL AGENTE:");
            console.log("-----------------------------------------");
            console.log(data.choices[0].message.content);
            console.log("-----------------------------------------");
        } else {
            console.error("❌ Error en la respuesta:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Fallo en el Stress Test:", error);
    }
}

stressTest();
