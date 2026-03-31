export const dynamic = 'force-dynamic';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/shared/lib/neon';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PromptLoader } from '@/shared/services/PromptLoader';
import { VisionService } from '@/shared/services/VisionService';
import { logSystemHealth } from '@/shared/lib/neon';
import { PSEService } from '@/shared/services/PSEService';
import { NotificationService } from '@/shared/services/NotificationService';
import { auth } from '@/auth';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Helper: Crea una respuesta de stream compatible con useChat para respuestas cacheadas/directas
function createStreamCompatibleResponse(text: string): Response {
    // Formato del protocolo de stream de Vercel AI SDK
    // Cada línea es: prefijo:contenido\n
    // 0: = text chunk, d: = done signal
    const encoder = new TextEncoder();
    const chunks = text.match(/.{1,100}/gs) || [text];
    
    const stream = new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                const escaped = JSON.stringify(chunk);
                controller.enqueue(encoder.encode(`0:${escaped}\n`));
            }
            // Señal de finalización
            controller.enqueue(encoder.encode('d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n'));
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Vercel-AI-Data-Stream': 'v1',
        },
    });
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export const maxDuration = 60; // OpenRouter might take time

// Helper for debugging - uses console.log for Vercel serverless compatibility
function debugLog(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[CoachAPI ${timestamp}] ${message}`);
}

// Función para obtener userId y rol de la sesión autenticada
async function getAuthenticatedUser(): Promise<{ id: number, role: string } | null> {
    try {
        // 1. Intentar con NextAuth
        const session = await auth();
        debugLog(`Auth Session Check: ${session ? 'OK' : 'NULL'}`);
        if (session?.user?.id) {
            const userId = parseInt(session.user.id, 10);
            debugLog(`UserID from session: ${userId}`);
            const user = await PSEService.getUserRole(userId);
            return { id: userId, role: user?.role || 'user' };
        }

        // 2. Fallback: auth_token
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (token) {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const userId = payload.sub ? parseInt(payload.sub as string, 10) : null;
            if (userId) {
                const user = await PSEService.getUserRole(userId);
                return { id: userId, role: user?.role || 'user' };
            }
        }

        return null;
    } catch (error) {
        debugLog(`Error verificando Sesión/JWT: ${error}`);
        return null;
    }
}

export async function POST(req: Request) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
        const body = await req.json().catch(() => ({}));
        let { query, history = [], messages, ocrContext = "", image = null, mimeType = "image/jpeg" } = body;

        // Soporte para AI SDK (useChat) que envía 'messages'
        if (!query && messages && Array.isArray(messages) && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user') {
                // El contenido puede ser string o array de partes (multipart)
                if (typeof lastMessage.content === 'string') {
                    query = lastMessage.content;
                } else if (Array.isArray(lastMessage.content)) {
                    // Extraer texto de partes multipart
                    query = lastMessage.content
                        .filter((p: any) => p.type === 'text')
                        .map((p: any) => p.text)
                        .join(' ') || '';
                }
                history = messages.slice(0, -1).map((m: any) => ({
                    role: m.role,
                    content: typeof m.content === 'string' ? m.content : 
                        (Array.isArray(m.content) ? m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ') : '')
                }));
            }
        }

        if (!query && !image) {
            debugLog('Error: Consulta o imagen vacía.');
            return NextResponse.json({ error: 'Consulta o imagen requerida' }, { status: 400 });
        }

        // Si hay una imagen, procesarla con Visión Nativa
        if (image) {
            debugLog('Procesando imagen con Visión Nativa...');
            try {
                const visionData = await VisionService.extractTrainingData(image, mimeType);
                const extraInfo = `[DATA_MAESTRA_VISION]: ${visionData.detected_data}. Métricas: ${JSON.stringify(visionData.metrics)}`;
                ocrContext = ocrContext ? `${ocrContext}\n${extraInfo}` : extraInfo;
                debugLog('Visión exitosa. Contexto actualizado.');
            } catch (err: any) {
                debugLog(`ERROR Visión: ${err.message}`);
                // Continuamos aunque falle la visión, pero informamos
            }
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        debugLog(`Nueva petición: ${query.substring(0, 30)}...`);

        if (!apiKey) {
            debugLog('ERROR: API Key no configurada');
            throw new Error('OPENROUTER_API_KEY no detectada.');
        }

        // DETECCIÓN DE SOLICITUD DE SOPORTE
        const isSupportRequest = query && PSEService.detectSupportRequest(query);

        // 1. Cargar Prompts y Persistencia PSE
        let contenidoTecnico = '';
        let contenidoEstrategico = '';
        let contextoPersistencia = '';
        let activePlanId = '';
        let proximaSemana = 1;
        let userId: number | undefined;
        let isAdminBypass = false;
        let userRole = 'user';
        let contenidoMacrociclo = '';

        try {
            const master = await PromptLoader.getMasterPrompt();
            contenidoTecnico = master.content;

            // Using embedded strategy prompt (Vercel serverless compatible)
            contenidoEstrategico = await PromptLoader.getStrategyPrompt();

            // Macrociclo is optional and embedded in master prompt
            // No longer loading from fs for Vercel compatibility
            debugLog('Prompts cargados desde módulo embebido.');


            // --- LÓGICA DE PERSISTENCIA Y NEGOCIO PSE ---
            const user = await getAuthenticatedUser();
            userId = user?.id;
            userRole = user?.role || 'user';
            let athleteName = 'Atleta Anónimo';

            isAdminBypass = (body.isAdminBypass === true && userRole === 'admin') || body.access === "pse_admin_2026";

            if (userId) {
                athleteName = await PSEService.getUserName(userId) || 'Atleta Autenticado';
            } else {
                const commonGreetings = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'hi', 'hello'];
                const queryLower = query.toLowerCase().trim();

                athleteName = body.name ||
                    query.match(/soy ([\w\s]+)/i)?.[1] ||
                    query.match(/me llamo ([\w\s]+)/i)?.[1] ||
                    (query.length < 30 && query.split(' ').length <= 3 && !commonGreetings.includes(queryLower) ? query : null) ||
                    "Atleta Anónimo";

                userId = await PSEService.getOrCreateUserByName(athleteName);
            }

            // GUARDAR SOLICITUD DE SOPORTE - Asíncrono para no bloquear al atleta
            if (isSupportRequest && userId) {
                (async () => {
                    try {
                        await PSEService.saveSupportRequest(userId as number, query);
                        debugLog(`📩 Solicitud de soporte guardada para usuario ${userId}`);

                        await NotificationService.sendToAdmins({
                            title: '⚠️ Solicitud de Soporte',
                            body: `${athleteName}: "${query.substring(0, 50)}..."`,
                            url: '/performance/admin'
                        });
                    } catch (supportErr: any) {
                        debugLog(`ERROR en hilo de soporte: ${supportErr.message}`);
                    }
                })();
            }

            const userSettings = await PSEService.getUserSettings(userId as number);
            const totalMicrocycles = await PSEService.getTotalMicrocyclesCount(userId as number);
            const hasSubscription = await PSEService.checkSubscription(userId as number);

            // 2. Verificar periodo de gracia (15 días)
            const registrationDate = userSettings?.created_at || new Date();
            const daysSinceRegistration = Math.floor((new Date().getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

            // PAYWALL
            const isUserAdmin = userRole === 'admin';
            const ADMIN_TOKEN = "pse_admin_2026";
            const hasAdminAccess = body.access === ADMIN_TOKEN || isUserAdmin;

            // BLOQUEO ESTRICTO: 2 Microciclos o 15 días
            if (!hasAdminAccess && !hasSubscription && (totalMicrocycles >= 2 || daysSinceRegistration > 15)) {
                // Notificar al admin una sola vez cuando llega al límite
                if (totalMicrocycles === 2 && !isSupportRequest) {
                    (async () => {
                        try {
                            await NotificationService.sendToAdmins({
                                title: '🎯 Trial PSE Finalizado',
                                body: `El atleta ${athleteName} (${userId}) ha completado sus 2 microciclos gratuitos.`,
                                url: '/performance/admin'
                            });
                        } catch (err) {
                            debugLog(`Error notifying admin: ${err}`);
                        }
                    })();
                }

                return createStreamCompatibleResponse(
                    "¡Excelente progreso! 🏊‍♂️ Has completado tus 2 microciclos gratuitos de evaluación inicial. Para continuar con tu evolución y recibir nuevos entrenamientos personalizados cada semana, es necesario realizar el pago de tu suscripción profesional. ¿Te gustaría ver las opciones de pago (Polar, Binance, Meru)?"
                );
            }

            const plan = await PSEService.getOrCreateActivePlan(userId as number);
            activePlanId = plan.id;

            // 3. LÓGICA DE BLOQUEO SEMANAL (Lunes a Lunes)
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMonday);
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 7);
            sunday.setHours(23, 59, 59, 999);

            const currentWeekMicrocycle = await PSEService.getMicrocycleInDateRange(activePlanId, monday, sunday);
            const isStartOfConversation = !history || history.length === 0;

            if (!isAdminBypass && currentWeekMicrocycle && isStartOfConversation && !query.toLowerCase().includes('feedback')) {
                debugLog('Devolviendo microciclo cacheado como stream compatible con useChat');
                const cachedText = currentWeekMicrocycle.data.raw_response || currentWeekMicrocycle.data;
                const textContent = typeof cachedText === 'string' ? cachedText : JSON.stringify(cachedText);
                return createStreamCompatibleResponse(
                    `📋 **Entrenamiento de la semana actual:**\n\n${textContent}\n\n---\n_Este es tu plan vigente. ¡A darle con todo! 🏊‍♂️_`
                );
            }

            const lastMicrocycle = await PSEService.getLastMicrocycle(activePlanId);

            if (lastMicrocycle) {
                proximaSemana = lastMicrocycle.numero_semana + 1;
                const semAnterior = lastMicrocycle.numero_semana;

                if (proximaSemana > 12) {
                    contextoPersistencia = `
[CONTEXTO_MEMORIA_PSE]:
- Atleta: ${athleteName}
- Estado: PLAN COMPLETADO (12 semanas).
- INSTRUCCIÓN: Felicita y pregunta cómo le fue en su competencia fundamental. Solicita nueva FECHA DE COMPETENCIA.
`;
                } else {
                    contextoPersistencia = `
[CONTEXTO_MEMORIA_PSE]:
- Atleta: ${athleteName}
- Estado: Retornante para la SEMANA ${proximaSemana}.
- Feedback previo: ${lastMicrocycle.feedback_usuario || 'Pendiente'}.
- INSTRUCCIÓN: Saluda por nombre, pregunta cómo se sintió en la SEMANA ${semAnterior}. Procede a entregar la SEMANA ${proximaSemana}.
`;
                }
            } else {
                const isKnown = athleteName && athleteName !== "Atleta Anónimo";
                const hasHistory = history && history.length > 0;

                contextoPersistencia = `
[CONTEXTO_MEMORIA_PSE]:
- Atleta: ${athleteName}
- ¿Nombre conocido?: ${isKnown ? 'SÍ' : 'NO'}
- ¿Ya tiene historial de conversación?: ${hasHistory ? 'SÍ (NO REPETIR SALUDO)' : 'NO'}
- Objetivo: Iniciar SEMANA 1.
${hasHistory
                        ? '- INSTRUCCIÓN CRÍTICA: El usuario YA está en conversación. NO te presentes ni preguntes el nombre.'
                        : isKnown
                            ? '- INSTRUCCIÓN: Saluda por nombre y pregunta días, tiempo de referencia y kilometraje.'
                            : '- INSTRUCCIÓN: Preséntate como Coach Alvin y pregunta su nombre.'}
`;
            }
        } catch (e: any) {
            debugLog(`ERROR en infraestructura: ${e.message}`);
            throw new Error(`Fallo en infraestructura: ${e.message}`);
        }

        const systemInstruction = `
${contenidoTecnico}
 ESTRATEGIA AVANZADA: ${contenidoEstrategico}
${contextoPersistencia}
${ocrContext ? `- DATOS EXTRAÍDOS (OCR): ${ocrContext}` : ''}
${contenidoMacrociclo ? `
REFERENCIA MACROCICLO ELITE:
${contenidoMacrociclo}
` : ''}
REGLA: Indica claramente el número de semana (1 a 12).
`;

        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
        });

        // CADENA DE ESTABILIDAD (Stability Chain 2026 - V4 Updated)
        const models = [
            'google/gemini-2.5-flash',
            'google/gemini-2.0-flash-001',
            'google/gemini-flash-1.5',
            'openai/gpt-4o-mini'
        ];

        let result;
        let lastError;

        for (const modelId of models) {
            try {
                debugLog(`Intentando con modelo: ${modelId}`);
                result = await (streamText as any)({
                    model: openrouter(modelId),
                    system: systemInstruction,
                    messages: history.map((msg: any) => ({
                        role: msg.role === 'assistant' ? 'assistant' : 'user',
                        content: msg.content || ''
                    })).concat([{ role: 'user', content: query }]),
                    onFinish: async ({ text }: any) => {
                        debugLog(`Stream finalizado con ${modelId}. Guardando persistencia...`);
                        try {
                            await PSEService.saveMicrocycle(activePlanId, proximaSemana, {
                                raw_response: text,
                                timestamp: new Date().toISOString()
                            });

                            await sql`
                                INSERT INTO pse_activity_log (event_type, user_id, details)
                                VALUES ('microcycle_gen', ${userId as number}, ${JSON.stringify({
                                semana: proximaSemana,
                                is_admin: isAdminBypass,
                                model: modelId
                            })})
                            `;
                        } catch (pErr: any) {
                            debugLog(`ERROR persistencia: ${pErr.message}`);
                        }
                    },
                    abortSignal: controller.signal
                });
                // Si llegamos aquí y tenemos un result, rompemos el bucle
                if (result) break;
            } catch (err: any) {
                lastError = err;
                debugLog(`FALLÓ modelo ${modelId}: ${err.message}`);
                // Si el error es abort o algo crítico, no seguimos
                if (err.name === 'AbortError') throw err;
            }
        }

        if (!result) {
            throw lastError || new Error('No se pudo obtener respuesta de ningún modelo.');
        }

        const response = result;

        clearTimeout(timeoutId);

        // Use reliable response streaming with fallback
        try {
            return (response as any).toDataStreamResponse();
        } catch (streamError: any) {
            debugLog(`Streaming Error (data): ${streamError.message}. Trying Text fallback...`);
            try {
                return (response as any).toTextStreamResponse();
            } catch (textErr: any) {
                debugLog(`FINAL Streaming Error: ${textErr.message}`);
                const fullText = await response.text;
                return new Response(fullText, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        }

    } catch (error: any) {
        clearTimeout(timeoutId);
        const errorMsg = `ERROR FINAL API [${new Date().toISOString()}]: ${error.message}\nStack: ${error.stack}`;
        debugLog(errorMsg);
        return NextResponse.json({
            error: error.message || 'Error interno desconocido',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
