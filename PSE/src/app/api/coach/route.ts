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
        let {
            query,
            history = [],
            messages,
            ocrContext = "",
            image = null,
            video = null,
            mimeType = "image/jpeg",
            coachRole = 'principal',
            data = {}
        } = body;

        // Normalizar datos de useChat (pueden venir en la raíz o en .data)
        if (!image && data?.image) image = data.image;
        if (!video && data?.video) video = data.video;
        if (!mimeType && data?.mimeType) mimeType = data.mimeType;
        if (coachRole === 'principal' && body.coachRole) coachRole = body.coachRole;

        // Soporte para AI SDK (useChat) que envía 'messages'
        if (!query && messages && Array.isArray(messages) && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user') {
                query = lastMessage.content;
                history = messages.slice(0, -1);
            }
        }

        if (query === 'PING_STATUS_CHECK') {
            const user = await getAuthenticatedUser();
            const ADMIN_TOKEN = "pse_admin_2026";
            const hasAdminAccess = body.access === ADMIN_TOKEN || user?.role === 'admin';

            let status = 'active_trial';
            if (user?.id) {
                status = await PSEService.getAthleteStatus(user.id);
            }
            if (!hasAdminAccess && status === 'trial_expired') {
                const trialMessage = "¡Excelente progreso! 🏊‍♂️ Has completado tu periodo de evaluación elite. Para continuar con tu evolución y recibir nuevos entrenamientos personalizados cada semana, es necesario asentar tu plaza profesional. Haz clic en el botón de abajo para activar tu suscripción con Creem.io u otros métodos.";
                return new Response(`0:${JSON.stringify(trialMessage)}\n`, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Vercel-AI-Data-Stream': 'v1' }
                });
            }
            return new Response(`0:${JSON.stringify("STATUS_OK")}\n`, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Vercel-AI-Data-Stream': 'v1' }
            });
        }

        if (!query && !image && !video) {
            debugLog('Error: Consulta, imagen o video vacíos.');
            return NextResponse.json({ error: 'Consulta, imagen o video requerido' }, { status: 400 });
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

        // Si hay un video, añadir contexto para el prompt (el procesamiento real se hará en el model call)
        if (video) {
            const videoContext = `[VIDEO_ANALYSIS_REQUESTED]: El atleta ha subido un video de 10 segundos para análisis de técnica. Analiza la fluidez, posición corporal y recobro.`;
            ocrContext = ocrContext ? `${ocrContext}\n${videoContext}` : videoContext;
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        debugLog(`Nueva petición (${coachRole}): ${query.substring(0, 30)}...`);

        if (!apiKey) {
            debugLog('ERROR: API Key no configurada');
            throw new Error('OPENROUTER_API_KEY no detectada.');
        }

        // DETECCIÓN DE SOLICITUD DE SOPORTE
        const isSupportRequest = query && PSEService.detectSupportRequest(query);

        // 1. Cargar Prompts y Persistencia PSE
        let contenidoTecnico = '';
        let contenidoEstrategico = '';
        let rolPrompt = '';
        let contextoPersistencia = '';
        let activePlanId = '';
        let proximaSemana = 1;
        let userId: number | undefined;
        let isAdminBypass = false;
        let userRole = 'user';
        let contenidoMacrociclo = '';
        let anthroContext = '';

        try {
            const master = await PromptLoader.getUniversalPrompt();
            contenidoTecnico = master;

            debugLog(`Prompt Universal cargado para modo automático.`);


            // --- LÓGICA DE PERSISTENCIA Y NEGOCIO PSE ---
            const user = await getAuthenticatedUser();
            userId = user?.id;
            userRole = user?.role || 'user';
            let athleteName = 'Atleta Anónimo';

            isAdminBypass = (body.isAdminBypass === true && userRole === 'admin') || body.access === "pse_admin_2026";
            debugLog(`Admin Bypass Status: ${isAdminBypass} (Requested: ${body.isAdminBypass}, UserRole: ${userRole})`);

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

            // PAYWALL Y VERIFICACIONES DE ESTADO (Nueva Lógica Centralizada V3)
            const isUserAdmin = userRole === 'admin';
            const ADMIN_TOKEN = "pse_admin_2026";
            const hasAdminAccess = body.access === ADMIN_TOKEN || isUserAdmin;

            let athleteStatus = 'active_trial';
            if (userId) {
                athleteStatus = await PSEService.getAthleteStatus(userId);
            }

            // BLOQUEO ESTRICTO DE TRIAL EXPIRADO
            if (!hasAdminAccess && athleteStatus === 'trial_expired') {
                if (!isSupportRequest) {
                    (async () => {
                        try {
                            await NotificationService.sendToAdmins({
                                title: '🎯 Trial PSE Finalizado',
                                body: `El atleta ${athleteName} (${userId}) ha completado su periodo de evaluación elite.`,
                                url: '/performance/admin'
                            });
                        } catch (err) {
                            debugLog(`Error notifying admin: ${err}`);
                        }
                    })();
                }

                const trialMessage = "¡Excelente progreso! 🏊‍♂️ Has completado tu periodo de evaluación elite. Para continuar con tu evolución y recibir nuevos entrenamientos personalizados cada semana, es necesario asentar tu plaza profesional. Haz clic en el botón de abajo para activar tu suscripción con Creem.io u otros métodos.";
                return new Response(`0:${JSON.stringify(trialMessage)}\n`, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Vercel-AI-Data-Stream': 'v1' }
                });
            }

            // 4. PUENTE DE IDENTIDAD Y ANTROPOMETRÍA
            const userEmail = (await auth())?.user?.email;

            if (userEmail) {
                let athleteIdNumber = await PSEService.getAthleteIdNumber(userEmail);

                // Si el usuario provee su cédula en el mensaje, guardarla
                const idMatch = query.match(/\b(\d{6,10})\b/);
                if (idMatch && (query.toLowerCase().includes("cédula") || query.toLowerCase().includes("mi id") || query.toLowerCase().includes("identificación"))) {
                    athleteIdNumber = idMatch[1];
                    await PSEService.updateAthleteIdNumber(userEmail as string, athleteIdNumber as string);
                    debugLog(`🆔 ID ${athleteIdNumber} vinculado a ${userEmail}`);
                }

                if (athleteIdNumber) {
                    const anthroData = await PSEService.getAnthroRecordsByIdNumber(athleteIdNumber);
                    if (anthroData) {
                        anthroContext = `
[DATOS_ANTROPOMETRICOS_ATLETA]:
- Perfil ISAK encontrado (ID: ${athleteIdNumber}).
- Fecha: ${anthroData.date}
- Somatotipo: ${JSON.stringify(anthroData.somatotype)}
- % Grasa: ${anthroData.fat_percentage}%
- Peso: ${anthroData.weight_kg}kg | Altura: ${anthroData.height_cm}cm
- IMC: ${anthroData.bmi} (${anthroData.bmi_percentile})
- NOTA: Usa estos datos para ajustar la intensidad y el volumen si el atleta menciona fatiga o cambios de peso.
`;
                    }
                } else if (query.toLowerCase().includes("antropometría") || query.toLowerCase().includes("mi grasa") || query.toLowerCase().includes("mi peso")) {
                    // Si pregunta por sus datos y no tenemos su ID, pedirlo
                    return NextResponse.json({
                        response: "Socio, para darte tus datos exactos de antropometría y biotipo, necesito vincular tu perfil. ¿Me podrías indicar tu número de cédula o identificación oficial?"
                    });
                }
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
                const cachedMessage = currentWeekMicrocycle.data.raw_response || "Este es tu entrenamiento de la semana actual. ¡A darle con todo!";
                return new Response(`0:${JSON.stringify(cachedMessage)}\n`, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Vercel-AI-Data-Stream': 'v1' }
                });
            }

            const lastMicrocycle = await PSEService.getLastMicrocycle(activePlanId);

            if (lastMicrocycle) {
                proximaSemana = lastMicrocycle.numero_semana + 1;
                const semAnterior = lastMicrocycle.numero_semana;

                if (proximaSemana > plan.total_microciclos) {
                    contextoPersistencia = `
[CONTEXTO_MEMORIA_PSE]:
- Atleta: ${athleteName}
- Estado: PLAN COMPLETADO (${plan.total_microciclos} semanas).
- INSTRUCCIÓN: Felicita y pregunta cómo le fue en su competencia fundamental. Solicita nueva FECHA DE COMPETENCIA.
`;
                } else {
                    contextoPersistencia = `
[CONTEXTO_MEMORIA_PSE]:
- Atleta: ${athleteName}
- Estado: Retornante para la SEMANA ${proximaSemana}.
- Feedback previo: ${lastMicrocycle.feedback_usuario || 'Pendiente'}.
- INSTRUCCIÓN: Saluda por nombre, pregunta cómo se sintió en la SEMANA ${semAnterior}. Procede a entregar la SEMANA ${proximaSemana} de un total de ${plan.total_microciclos}.
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
${contextoPersistencia}
${ocrContext ? `- DATOS EXTRAÍDOS (OCR/VISIÓN): ${ocrContext}` : ''}
${contenidoMacrociclo ? `
REFERENCIA MACROCICLO ELITE:
${contenidoMacrociclo}
` : ''}
${anthroContext}
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

        debugLog(`🔥 MODEL LOOP INICIO: Mapeando mensajes: ${JSON.stringify(history).substring(0, 100)}...`);

        const userMessages: any[] = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content || ''
        }));

        // Si hay video y el modelo lo soporta (Gemini), adjuntarlo al último mensaje
        const currentMessageContent: any[] = [{ type: 'text', text: query }];

        if (video) {
            debugLog('📹 Video detectado, adjuntando payload...');
            currentMessageContent.push({
                type: 'file',
                data: video.split(",")[1] || video,
                mimeType: mimeType
            });
        } else if (image) {
            debugLog('📸 Imagen detectada, adjuntando payload...');
            currentMessageContent.push({
                type: 'image',
                image: image.split(",")[1] || image,
            });
        }

        userMessages.push({ role: 'user', content: currentMessageContent });

        debugLog(`✅ Payload Final Listo. Iniciando llamada a modelos.`);

        for (const modelId of models) {
            try {
                debugLog(`🚀 STARTING streamText con: ${modelId}`);

                result = await streamText({
                    model: openrouter(modelId),
                    system: systemInstruction,
                    messages: userMessages,
                    onFinish: async ({ text }) => {
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

                // Inspección profunda de Error HTTP 403 de OpenRouter
                if (err?.response?.status) {
                    debugLog(`🚨 FALLÓ modelo ${modelId} [HTTP ${err.response.status}]: ${JSON.stringify(err.response.data || err.message)}`);
                } else if (err?.statusCode) {
                    debugLog(`🚨 FALLÓ SDK AI modelo ${modelId} [Status ${err.statusCode}]: ${err.message}`);
                } else {
                    debugLog(`🚨 FALLÓ modelo ${modelId}: ${err.message}`);
                }

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
