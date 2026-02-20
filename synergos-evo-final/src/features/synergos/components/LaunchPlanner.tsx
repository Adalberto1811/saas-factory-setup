import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
    Sparkles, ChevronRight, Rocket, Send, BrainCircuit, Video, X, Image, Palette, Eye,
    Facebook, Instagram, Twitter, Music2, Youtube, MessageSquare, Monitor, CreditCard, BarChart3,
    type LucideIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import { SeedanceVideoGenerator } from '@/modules/seedance'; // TODO: Re-enable when module is created
import { AvatarMaestro, type AvatarData } from './AvatarMaestro';
import { ThumbnailFactory } from './ThumbnailFactory';

interface LaunchPlanItem {
    day: string;
    type: string;
    phase: string;
    script: string;
    visualNotes?: string;
    status: string;
    videoTaskId?: string;
    videoUrl?: string;
    isPublished?: boolean;
    neuroMetrics?: {
        gazeDirection?: 'camera' | 'product' | 'cta';
        editBPM?: number;
        dominantColor?: string;
        emotionalTone?: 'excitement' | 'trust' | 'urgency' | 'curiosity';
    };
    thumbnailPrompt?: string;
}

interface Theme {
    primary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
}

interface LaunchPlannerProps {
    theme: Theme;
    webhooks: {
        baseUrl: string;
        marketSyn: string;
        socialSyn?: string;
        pdfSyn?: string;
        metricsSyn?: string;
        competenciaSyn?: string;
    };
    companyInfo: {
        name: string;
        industry: string;
        role: string;
    };
    initialData?: {
        producto: string;
        precioNormal: string;
        precioOferta: string;
        dolor: string;
        publico: string;
    } | null;
}

// =====================================================
// SOCIAL PUBLISHING: Handled via N8N Webhook (SocialSyn)
// =====================================================

// REMOVED MASTER_PROMPT CONSTANT to allow dynamic injection in function
// But keeping a template variable for clarity
const MASTER_PROMPT_TEMPLATE = `ACTÚA COMO: Un Publicista Creativo de Alto Nivel combinando:
- **Alex Hormozi**: Copy de alto impacto, urgencia, ofertas irresistibles
- **Ricky Riquelme**: Embudos persuasivos, storytelling emocional
- **MrBeast (Seedance)**: Contenido visual ultra-dinámico para videos cortos
- **Pomelli AI (Google)**: Análisis de "Business DNA" para contenido consistente con la marca

**TU OBJETIVO:** Generar una estrategia de 7 días COMPLETOS optimizada para VIDEO (TikTok/Reels/Shorts).

**CONTEXTO DEL CLIENTE:**
- Empresa: {{COMPANY_NAME}}
- Industria: {{INDUSTRY}}
- Rol del Agente: {{AGENT_ROLE}}

**REGLAS ESTILO MRBEAST (OBLIGATORIO EN TODO EL CONTENIDO):**
1. 🎬 KINETIC TYPOGRAPHY: Escribe el script pensado para subtítulos GRANDES y COLORIDOS que aparecen PALABRA por PALABRA
2. ⚡ ESCENAS DE 2-3 SEGUNDOS: Máximo. Indica transiciones visuales: logo → gráfica → celular → persona → producto
3. 🎵 MÚSICA IN CRESCENDO: El tono del copy debe subir de intensidad (empieza suave, termina explosivo)
4. 🔥 GANCHOS EXPLOSIVOS: Primera frase debe ser IMPACTANTE (pregunta provocadora o dato sorprendente)
5. NO más de 60 palabras por script (optimizado para videos de 15-30 segundos)

**ANÁLISIS POMELLI AI (Business DNA) - SI EL USUARIO DA URL DE COMPETENCIA:**
1. Extrae el TONO DE VOZ del competidor (formal, casual, técnico, amigable)
2. Identifica la PALETA DE COLORES dominante de su marca
3. Detecta el ESTILO VISUAL (minimalista, vibrante, corporativo, artesanal)
4. Analiza sus PUNTOS DÉBILES de comunicación
5. Genera contenido que se DIFERENCIA de la competencia siendo SUPERIOR en cada aspecto

**REGLAS DE ORO (PROHIBIDO):**
1. NO uses palabras corporativas vacías (innovador, solución, sinergias...)
2. NO suenes como un vendedor desesperado
3. NO hagas scripts largos - son para VIDEO, no lectura

**🧠 PRINCIPIOS DE NEUROMARKETING (ADICIONALES - PROYECTO ANTIGRAVITY):**
1. 🧠 CONTRASTE COGNITIVO: Cada script debe tener UN solo mensaje claro
2. 👁️ DIRECCIÓN DE MIRADA: Indica hacia dónde debe mirar el sujeto (camera, product, cta)
3. 💓 FRECUENCIA DE CORTE: Indica BPM recomendado (60=calma, 90=dinámico, 120=urgencia)
4. 🎨 PALETA SUGERIDA: Incluye color HEX dominante recomendado para thumbnails
5. 🎭 TONO EMOCIONAL: Identifica la emoción principal (excitement, trust, urgency, curiosity)

**FORMATO DE RESPUESTA OBLIGATORIO (JSON ENRIQUECIDO CON NEUROMARKETING):**
Responde ÚNICAMENTE con un objeto JSON válido. No incluyas texto antes ni después.
{
  "strategy": "Resumen ejecutivo de la estrategia completa con el enfoque Hormozi+Riquelme+MrBeast...",
  "competitorAnalysis": "Análisis estilo Pomelli AI del competidor (si se proporcionó URL): tono de voz, estilo visual, debilidades detectadas...",
  "plan": [
    {
      "day": "Día 1",
      "type": "Gancho",
      "phase": "El Problema",
      "script": "[GANCHO] ¿Sabías que...? [TRANSICIÓN: Logo animado → Gráfica impactante → Celular vibrando] [CRESCENDO] Y esto es solo el comienzo...",
      "visualNotes": "Logo 2s → Estadística 2s → Demo app 3s",
      "status": "To Do",
      "neuroMetrics": {
        "gazeDirection": "camera",
        "editBPM": 90,
        "dominantColor": "#22c55e",
        "emotionalTone": "curiosity"
      },
      "thumbnailPrompt": "Vibrant thumbnail showing surprised face, bold green text, dark background, high contrast"
    },
    {
      "day": "Día 2",
      "type": "Educativo IA",
      "phase": "Ventaja #1",
      "script": "Script educativo sobre beneficio de IA...",
      "visualNotes": "Descripción de escenas visuales rápidas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "product", "editBPM": 75, "dominantColor": "#3b82f6", "emotionalTone": "trust" },
      "thumbnailPrompt": "Professional thumbnail with AI graphics, blue accents"
    },
    {
      "day": "Día 3",
      "type": "Prueba Social",
      "phase": "Testimonios",
      "script": "Script con caso de éxito...",
      "visualNotes": "Descripción de escenas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "camera", "editBPM": 70, "dominantColor": "#a855f7", "emotionalTone": "trust" },
      "thumbnailPrompt": "Testimonial style thumbnail with happy customer"
    },
    {
      "day": "Día 4",
      "type": "Educativo IA",
      "phase": "Ventaja #2",
      "script": "Script educativo...",
      "visualNotes": "Descripción de escenas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "product", "editBPM": 80, "dominantColor": "#10b981", "emotionalTone": "excitement" },
      "thumbnailPrompt": "Educational thumbnail with infographic style"
    },
    {
      "day": "Día 5",
      "type": "Lógica",
      "phase": "Por Qué Funciona",
      "script": "Script con argumentos lógicos...",
      "visualNotes": "Descripción de escenas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "product", "editBPM": 65, "dominantColor": "#6366f1", "emotionalTone": "trust" },
      "thumbnailPrompt": "Clean analytical thumbnail with charts"
    },
    {
      "day": "Día 6",
      "type": "Educativo IA",
      "phase": "Ventaja #3",
      "script": "Script educativo...",
      "visualNotes": "Descripción de escenas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "camera", "editBPM": 85, "dominantColor": "#f59e0b", "emotionalTone": "excitement" },
      "thumbnailPrompt": "Energetic thumbnail with golden accents"
    },
    {
      "day": "Día 7",
      "type": "Oferta",
      "phase": "Llamado a Acción",
      "script": "[URGENCIA MÁXIMA] Script de cierre con oferta irresistible...",
      "visualNotes": "Descripción de escenas finales explosivas",
      "status": "To Do",
      "neuroMetrics": { "gazeDirection": "cta", "editBPM": 120, "dominantColor": "#ef4444", "emotionalTone": "urgency" },
      "thumbnailPrompt": "URGENT red thumbnail with countdown timer, limited time offer"
    }
  ]
}

**TEMA DEL USUARIO:** `;

export default function LaunchPlanner({ theme, webhooks, companyInfo, initialData }: LaunchPlannerProps) {
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        productName: initialData?.producto || '',
        price: initialData?.precioOferta || initialData?.precioNormal || '',
        painPoint: initialData?.dolor || '',
        // Social Publishing Fields
        scheduledDate: '',
        platforms: {
            linkedin: true,
            twitter: false,
            instagram: false,
            facebook: false,
            tiktok: false
        },
        mediaUrl: '',
        // Pro Fields - Pomelli AI Style
        competitorUrl: '',
        competitorAnalysis: ''
    });

    // Update form when initialData changes (Antigravity: Orquestación AgentSyn -> MarketSyn)
    useEffect(() => {
        if (initialData) {
            console.log("📥 Populating MarketSyn form with data from AgentSyn:", initialData);
            setFormData(prev => ({
                ...prev,
                productName: initialData.producto,
                price: initialData.precioOferta || initialData.precioNormal,
                painPoint: initialData.dolor
            }));
        }
    }, [initialData]);

    const [newPlatform, setNewPlatform] = useState('');

    const handleAddPlatform = () => {
        if (newPlatform.trim()) {
            setFormData(prev => ({
                ...prev,
                platforms: {
                    ...prev.platforms,
                    [newPlatform.toLowerCase()]: true
                }
            }));
            setNewPlatform('');
        }
    };

    const [aiResponse, setAiResponse] = useState<string>('');
    const [competitorInsights, setCompetitorInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isAnalyzingMetrics, setIsAnalyzingMetrics] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [videoStatus, setVideoStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [lastTaskId, setLastTaskId] = useState<string | null>(null);

    const [launchPlan, setLaunchPlan] = useState<LaunchPlanItem[] | null>(null);

    // --- VIDEO GENERATION STATE (Seedance) ---
    const [selectedDayForVideo, setSelectedDayForVideo] = useState<LaunchPlanItem | null>(null);
    const [videoLogoUrl, setVideoLogoUrl] = useState('https://img.freepik.com/premium-vector/initial-letter-s-logo-with-depth-style_122059-39.jpg');

    // --- 🆕 ANTIGRAVITY: Thumbnail Factory State ---
    const [selectedDayForThumbnail, setSelectedDayForThumbnail] = useState<LaunchPlanItem | null>(null);

    // --- 🆕 ANTIGRAVITY: Avatar Maestro State ---
    const [avatarData, setAvatarData] = useState<AvatarData | null>(null);


    // =====================================================
    // OBJECTIVE 3: Read URL Query Params (AgentSyn -> MarketSyn)
    // Usage: /marketsyn?topic=VentaDeSeguros&autorun=true
    // =====================================================
    useEffect(() => {
        const topic = searchParams.get('topic');
        const autorun = searchParams.get('autorun');

        if (topic) {
            setFormData(prev => ({
                ...prev,
                productName: topic,
                painPoint: `Automatización de ${topic}`
            }));

            // Auto-trigger generation if autorun=true
            if (autorun === 'true') {
                setTimeout(() => {
                    generatePlan();
                }, 500);
            }
        }
    }, [searchParams]);

    // =====================================================
    // OBJECTIVE 1: Social Media Publishing - Schedule/Publish (N8N)
    // ==============================================================
    // =====================================================
    // OBJECTIVE 1: Social Media Publishing - Schedule/Publish (N8N)
    // =====================================================
    // Supports Publishing ALL (Global) or ONE specific day
    const handleSocialPublish = async (singleDayIndex: number | null = null) => {
        // Check if global or single
        const itemsToPublish = singleDayIndex !== null && launchPlan
            ? [launchPlan[singleDayIndex]]
            : launchPlan;

        if (!itemsToPublish || itemsToPublish.length === 0) return;

        // Check configured webhook
        const publishWebhook = webhooks.socialSyn || webhooks.marketSyn;
        if (!publishWebhook) {
            alert('⚠️ Webhook de publicación (socialSyn) no configurado.');
            return;
        }

        setIsPublishing(true);
        setPublishStatus('idle');

        try {
            // Correctly construct the endpoint URL
            const endpoint = webhooks.baseUrl
                ? `${webhooks.baseUrl}/${publishWebhook}`
                : (publishWebhook.startsWith('http') ? publishWebhook : `/${publishWebhook}`);

            // 1. Construct the Days Array payload (STRUCTURED for N8N Loop)
            const daysArray = itemsToPublish.map(day => ({
                day: day.day,
                phase: day.phase,
                script: day.script,
                visualNotes: day.visualNotes,
                videoTaskId: day.videoTaskId || null,
                videoUrl: day.videoUrl || null,
                status: day.status
            }));

            // 2. Select Enabled Platforms
            const selectedPlatforms = Object.entries(formData.platforms)
                .filter(([_, enabled]) => enabled)
                .map(([platform]) => platform);

            // 3. Prepare Payload
            const publishPayload = {
                title: singleDayIndex !== null
                    ? `${formData.productName} - ${itemsToPublish[0].day}`
                    : (formData.productName || "Campaña Completa"),
                copy: generateIntroCopy(formData.painPoint),
                days: daysArray,
                scheduledAt: formData.scheduledDate,
                platforms: selectedPlatforms,
                mediaUrl: (singleDayIndex !== null && itemsToPublish[0].videoUrl)
                    ? itemsToPublish[0].videoUrl
                    : formData.mediaUrl
            };

            const proxyEndpoint = `/api/n8n-proxy?webhook=${publishWebhook}`;

            console.log("🚀 Publishing via Proxy:", proxyEndpoint);
            console.log("📝 Payload:", JSON.stringify(publishPayload, null, 2));

            const response = await axios.post(
                proxyEndpoint,
                publishPayload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    responseType: 'json'
                }
            );

            console.log("📨 Publish Response Raw:", response.data);

            if (response.status === 200 || response.status === 201) {
                setPublishStatus('success');

                // Update local status
                if (launchPlan) {
                    const newPlan = [...launchPlan];
                    if (singleDayIndex !== null) {
                        newPlan[singleDayIndex].isPublished = true;
                        newPlan[singleDayIndex].status = 'Published';
                    } else {
                        // All published
                        newPlan.forEach(d => { d.isPublished = true; d.status = 'Published'; });
                    }
                    setLaunchPlan(newPlan);
                }

                if (singleDayIndex !== null) alert("✅ Publicación programada exitosamente.");
            } else {
                console.warn("⚠️ Publish Status not 200:", response.status);
                setPublishStatus('error');
            }
        } catch (error) {
            console.error('Error publishing:', error);
            setPublishStatus('error');
            alert("❌ Error al publicar.");
        } finally {
            setIsPublishing(false);
        }
    };

    const generateIntroCopy = (pain: string) => {
        return `Estrategia diseñada para resolver: ${pain}. A continuación el plan de 7 días.`;
    };

    // =====================================================
    // MAIN FUNCTION: Generate Plan with Gemini + Pomelli AI Style
    // =====================================================
    const generatePlan = async () => {
        if (!formData.productName) return;

        setIsLoading(true);
        setAiResponse('');
        setCompetitorInsights('');
        setLaunchPlan(null);
        setPublishStatus('idle');

        // Concatenar Master Prompt + Input del Usuario + Competencia (Pomelli AI Style)
        let contextPrompt = `Producto: ${formData.productName}, Precio: $${formData.price || '97'}, Dolor Principal: ${formData.painPoint || 'Falta de tiempo'}.`;

        if (formData.competitorUrl || formData.competitorAnalysis) {
            contextPrompt += `

🔎 INTELIGENCIA DE COMPETENCIA (ESTILO POMELLI AI - ANALIZA SU "BUSINESS DNA"):
- Competidor/URL: ${formData.competitorUrl}
- Observaciones del Usuario: ${formData.competitorAnalysis}

INSTRUCCIÓN POMELLI: 
1. Analiza el TONO DE VOZ que usa el competidor (formal, casual, técnico)
2. Identifica su ESTILO VISUAL predominante
3. Detecta DEBILIDADES en su comunicación
4. Genera contenido que sea SUPERIOR y claramente DIFERENTE
5. Asegura que nuestra oferta brille en comparación directa`;
        }



        // INJECT COMPANY INFO DYNAMICALLY
        const dynamicPrompt = MASTER_PROMPT_TEMPLATE
            .replace('{{COMPANY_NAME}}', companyInfo.name)
            .replace('{{INDUSTRY}}', companyInfo.industry)
            .replace('{{AGENT_ROLE}}', companyInfo.role);

        const combinedPrompt = dynamicPrompt + contextPrompt;

        try {
            // Usar Proxy para evitar CORS
            const proxyEndpoint = `/api/n8n-proxy?webhook=${webhooks.marketSyn}`;
            console.log("🤖 Generating Plan via Proxy:", proxyEndpoint);

            const response = await axios.post(
                proxyEndpoint,
                // AgentSyn expects 'chatInput' field, not 'prompt'
                { chatInput: combinedPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Extract response text
            let resultText = '';
            if (response.data.output) {
                resultText = response.data.output;
            } else if (response.data.text) {
                resultText = response.data.text;
            } else if (typeof response.data === 'string') {
                resultText = response.data;
            } else {
                resultText = JSON.stringify(response.data, null, 2);
            }

            // ---------------------------------------------------------
            // PARSEO INTELIGENTE MEJORADO V3 (Recursive & Robust)
            // ---------------------------------------------------------
            let jsonResult = null;
            let rawContent = '';

            // 1. Extract the "real" content string from various N8N wrappers
            if (response.data) {
                if (typeof response.data === 'string') {
                    rawContent = response.data;
                } else if (typeof response.data === 'object') {
                    // Check standard N8N output fields
                    rawContent = response.data.output || response.data.text || response.data.message || response.data.json || '';

                    // If those are empty, but the object itself looks like the result (e.g. valid fields exist)
                    if (!rawContent && (response.data.title || response.data.strategy || response.data.days)) {
                        jsonResult = response.data;
                    }
                }
            }

            console.log("🤖 Raw Content Extracted:", rawContent || "(Direct JSON Object)");

            // 2. Parse Content if not already an object
            if (!jsonResult && rawContent) {
                let cleanedText = rawContent.trim();

                // Remove Markdown Code Blocks (```json ... ```)
                const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
                const match = codeBlockRegex.exec(cleanedText);
                if (match) {
                    cleanedText = match[1].trim();
                } else {
                    // Heuristic: Find first '{' or '[' and last '}' or ']'
                    const firstBrace = cleanedText.indexOf('{');
                    const firstBracket = cleanedText.indexOf('[');

                    let start = -1;
                    if (firstBrace !== -1 && firstBracket !== -1) {
                        start = Math.min(firstBrace, firstBracket);
                    } else if (firstBrace !== -1) {
                        start = firstBrace;
                    } else {
                        start = firstBracket;
                    }

                    const lastBrace = cleanedText.lastIndexOf('}');
                    const lastBracket = cleanedText.lastIndexOf(']');
                    const end = Math.max(lastBrace, lastBracket);

                    if (start !== -1 && end !== -1) {
                        cleanedText = cleanedText.substring(start, end + 1);
                    }
                }

                try {
                    jsonResult = JSON.parse(cleanedText);
                } catch (e) {
                    console.warn("❌ JSON Parse Failed on first attempt:", e);
                    // Retry: Sometimes N8N double-stringifies strings
                    try {
                        const unescaped = JSON.parse(cleanedText);
                        if (typeof unescaped === 'string') {
                            jsonResult = JSON.parse(unescaped);
                        } else if (typeof unescaped === 'object') {
                            jsonResult = unescaped;
                        }
                    } catch (e2) {
                        console.warn("❌ Double-JSON Parse execution failed:", e2);
                    }
                }
            }

            // 3. Validation & State Update
            // Support direct array response
            if (Array.isArray(jsonResult)) {
                jsonResult = { days: jsonResult, strategy: "Estrategia Generada (Formato Directo)" };
            }

            // Normalize field name: AI can return 'plan' or 'days'
            const daysArray = jsonResult?.days || jsonResult?.plan;

            if (jsonResult && daysArray && Array.isArray(daysArray)) {
                console.log("✅ Valid Strategy JSON Found:", jsonResult);

                const strategyText = jsonResult.strategy || jsonResult.title || '';

                // Normalize Days
                const normalizedPlan = daysArray.map((item: any, index: number) => ({
                    day: item.day || `Día ${index + 1}`,
                    type: item.type || 'Contenido',
                    phase: item.phase || `Fase ${index + 1}`,
                    script: item.script || '',
                    visualNotes: item.visualNotes || '',
                    status: item.status || 'To Do',
                    neuroMetrics: item.neuroMetrics || {},
                    thumbnailPrompt: item.thumbnailPrompt || '',
                    videoTaskId: '',
                    videoUrl: ''
                }));

                setAiResponse(strategyText);
                setLaunchPlan(normalizedPlan);

                if (jsonResult.competitorAnalysis) {
                    setCompetitorInsights(jsonResult.competitorAnalysis);
                }

            } else {
                console.warn("⚠️ Valid JSON structure NOT found. Raw was:", rawContent);
                setAiResponse(rawContent || "Error: La IA no devolvió un formato válido. Por favor intenta de nuevo.");
                setLaunchPlan(null); // Clear plan to avoid showing broken UI
            }

            // AUTO-DETECT MEDIA: Check if AI returned a generated image/video URL
            const generatedMedia = response.data.mediaUrl || response.data.imageUrl || response.data.videoUrl || response.data.image || null;
            if (generatedMedia) {
                setFormData(prev => ({ ...prev, mediaUrl: generatedMedia }));
            }

        } catch (error) {
            console.error('Error calling Gemini webhook:', error);
            setAiResponse('⚠️ Error al conectar con el servidor de IA. Verifica la conexión e intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePdf = async () => {
        if (!launchPlan || !webhooks.pdfSyn) return;
        setIsGeneratingPdf(true);
        try {
            const proxyEndpoint = `/api/n8n-proxy?webhook=${webhooks.pdfSyn}`;
            const response = await axios.post(proxyEndpoint, {
                product: formData.productName,
                price: formData.price,
                plan: launchPlan,
                company: companyInfo
            });
            if (response.data.pdfUrl || response.data.downloadLink) {
                setPdfUrl(response.data.pdfUrl || response.data.downloadLink);
                alert("📄 Presupuesto PDF generado con éxito");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("⚠️ Error al generar el presupuesto PDF");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleFetchMetrics = async () => {
        if (!webhooks.metricsSyn) return;
        setIsAnalyzingMetrics(true);
        try {
            const proxyEndpoint = `/api/n8n-proxy?webhook=${webhooks.metricsSyn}`;
            const response = await axios.post(proxyEndpoint, { product: formData.productName });
            alert("📊 Métricas actualizadas con éxito");
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setIsAnalyzingMetrics(false);
        }
    };

    const isLightMode = theme.background.includes('F1F5F9') || theme.background.includes('F3F4F6') || theme.background.includes('f0fdf4');
    const isDarkMode = !isLightMode;

    // --- NUEVOS ESTILOS COMAND CENTER ---
    const cardBase = `
        backdrop-blur-md rounded-3xl border transition-all duration-300
        ${isLightMode
            ? 'bg-white/70 border-white/50 shadow-xl shadow-slate-200/50'
            : 'bg-slate-900/50 border-slate-700/50 shadow-2xl shadow-black/20'
        }
    `;

    const inputBase = `
        w-full rounded-xl px-4 py-3 outline-none transition-all border
        ${isLightMode
            ? 'bg-slate-50/50 border-slate-200 focus:border-[#f59e0b] focus:ring-4 focus:ring-amber-500/10 text-[#064e3b]'
            : 'bg-slate-950/50 border-slate-800 focus:border-[#f59e0b] focus:ring-4 focus:ring-amber-500/20 text-white'
        }
    `;

    return (
        <div className="w-full p-8 pb-32 relative max-w-7xl mx-auto">
            {/* Header del Centro de Mando */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-dashed border-slate-300/50 dark:border-slate-700/50">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl shadow-xl animate-pulse-slow" style={{ backgroundColor: theme.primary, boxShadow: `0 0 20px ${theme.primary}40` }}>
                        <Rocket className="text-white" size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight flex items-center gap-3" style={{ color: theme.text }}>
                            MarketSyn <span className="font-light opacity-50">v3</span>
                        </h2>
                        <p className="font-medium opacity-60 text-lg" style={{ color: theme.text }}>Digital Factory Command Center</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        AgentSyn Integrated
                    </span>
                    <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold animate-pulse">
                        LIVE NEUROMARKETING
                    </div>
                </div>
            </div>

            {/* Layout Bento de Entrada */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">

                {/* Lado Izquierdo: Configuración de Marca (6 cols) */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Producto (Top Left) */}
                    <div className={`${cardBase} p-8 hover:scale-[1.01] flex flex-col justify-between`}>
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-50">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Identidad</span>
                            </div>
                            <label className="block text-lg font-bold mb-4">¿Qué estamos fabricando hoy?</label>
                            <input
                                type="text"
                                value={formData.productName}
                                className={inputBase}
                                placeholder="Nombre del Producto o Servicio"
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Precio (Top Right) */}
                    <div className={`${cardBase} p-8 hover:scale-[1.01] flex flex-col justify-between`}>
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-50">
                                <CreditCard size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Monetización</span>
                            </div>
                            <label className="block text-lg font-bold mb-4">Valor de Mercado</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-30">$</span>
                                <input
                                    type="number"
                                    value={formData.price}
                                    className={`${inputBase} pl-8`}
                                    placeholder="97"
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pain Point (Bottom Full Width in left grid) */}
                    <div className={`${cardBase} p-8 md:col-span-2 hover:scale-[1.01]`}>
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                            <BrainCircuit size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Psicología de Cierre</span>
                        </div>
                        <label className="block text-lg font-bold mb-4">Punto de Dolor (Pain Point)</label>
                        <textarea
                            value={formData.painPoint}
                            className={`${inputBase} h-24 resize-none`}
                            placeholder="Describe el problema principal que resolvemos..."
                            onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                        />
                    </div>
                </div>

                {/* Lado Derecho: Inteligencia & Canales (4 cols) */}
                <div className="md:col-span-4 flex flex-col gap-6">

                    {/* Pomelli AI (Espionaje) */}
                    <div className={`${cardBase} p-6 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 relative overflow-hidden group flex-1`}>
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl tracking-tighter">
                            POMELLI AI PRO
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                            <Eye size={20} />
                            <span className="text-sm font-black uppercase">Business DNA Extraction</span>
                        </div>
                        <input
                            type="text"
                            value={formData.competitorUrl}
                            className={`${inputBase} text-sm mb-3`}
                            placeholder="URL Competencia..."
                            onChange={(e) => setFormData({ ...formData, competitorUrl: e.target.value })}
                        />
                        <textarea
                            value={formData.competitorAnalysis}
                            className={`${inputBase} text-xs h-32 resize-none`}
                            placeholder="Debilidades detectadas..."
                            onChange={(e) => setFormData({ ...formData, competitorAnalysis: e.target.value })}
                        />
                    </div>

                    {/* Plataformas */}
                    <div className={`${cardBase} p-6`}>
                        <div className="flex items-center gap-2 mb-6 opacity-50">
                            <Send size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Multi-Channel Outpost</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.keys(formData.platforms).map(platform => {
                                const isSelected = formData.platforms[platform as keyof typeof formData.platforms];
                                let Icon: LucideIcon = Monitor;
                                let color = theme.accent;

                                if (platform === 'linkedin') { Icon = MessageSquare; color = "#0077b5"; }
                                if (platform === 'facebook') { Icon = Facebook; color = "#1877f2"; }
                                if (platform === 'instagram') { Icon = Instagram; color = "#e4405f"; }
                                if (platform === 'twitter') { Icon = Twitter; color = "#000000"; }
                                if (platform === 'tiktok') { Icon = Music2; color = "#EE1D52"; }
                                if (platform === 'youtube') { Icon = Youtube; color = "#FF0000"; }

                                return (
                                    <button
                                        key={platform}
                                        onClick={() => setFormData({
                                            ...formData,
                                            platforms: { ...formData.platforms, [platform]: !isSelected }
                                        })}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 ${isSelected
                                            ? 'scale-105 shadow-md brightness-110'
                                            : 'opacity-30 grayscale hover:grayscale-0 hover:opacity-100'
                                            }`}
                                        style={{
                                            borderColor: isSelected ? color : 'transparent',
                                            backgroundColor: isSelected ? `${color}10` : 'rgba(0,0,0,0.05)',
                                            color: isSelected ? (theme.accent ? theme.accent : color) : '#94a3b8'
                                        }}
                                    >
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-black uppercase text-center truncate w-full">{platform}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Card 5: Action Buttons */}
                <div className={`${cardBase} p-6 flex flex-col justify-center items-center gap-3`}>
                    {/* Generate Button - NEON GREEN */}
                    <button
                        onClick={generatePlan}
                        disabled={isLoading}
                        className="w-full min-h-[60px] font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        style={{
                            backgroundColor: theme.accent,
                            color: isLightMode ? '#000' : '#fff',
                            boxShadow: `0 20px 40px ${theme.accent}40`
                        }}
                    >
                        <Sparkles size={24} />
                        <span className="text-lg">{isLoading ? 'Generando...' : (launchPlan ? 'Regenerar Estrategia' : 'Generar Estrategia')}</span>
                    </button>

                    {/* Main Action Buttons: Publish + PDF + Metrics */}
                    {(launchPlan || aiResponse) && (
                        <div className="flex flex-col gap-3 w-full border-t border-slate-700/30 pt-4">
                            <button
                                className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                onClick={() => handleSocialPublish()}
                                disabled={isPublishing || publishStatus === 'success'}
                                style={{
                                    backgroundColor: publishStatus === 'success' ? '#10B981' : '#6366F1',
                                    boxShadow: publishStatus === 'success' ? '0 0 15px rgba(16, 185, 129, 0.5)' : '0 0 15px rgba(99, 102, 241, 0.5)'
                                }}
                            >
                                {publishStatus === 'success' ? (
                                    <>✅ Publicado</>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>{isPublishing ? 'Publicando...' : 'Publicar Campaña Completa'}</span>
                                    </>
                                )}
                            </button>

                            <div className="flex gap-3">
                                {webhooks.metricsSyn && (
                                    <button
                                        onClick={handleFetchMetrics}
                                        disabled={isAnalyzingMetrics}
                                        className="w-full py-4 px-6 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center gap-3 hover:bg-slate-700 transition-all text-base font-bold"
                                    >
                                        <BrainCircuit className="w-6 h-6 text-cyan-500" />
                                        Ver Métricas IA (Analytics)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {publishStatus === 'error' && (
                        <p className="text-red-500 text-sm">⚠️ Error al publicar. Verifica la configuración del webhook.</p>
                    )}
                </div>
            </div>

            {/* Pomelli AI: Competitor Insights Section */}
            {competitorInsights && (
                <div className={`${cardBase} mb-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    style={{ borderColor: '#f59e0b', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)' }}>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                        <BrainCircuit size={20} />
                        🔬 Análisis Pomelli AI (Business DNA del Competidor)
                    </h3>
                    <div className="prose prose-sm max-w-none" style={{ color: theme.text }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {competitorInsights}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* AI Response Section */}
            {aiResponse && (
                <div className={`${cardBase} mb-12 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                        <Sparkles className="text-emerald-400" size={24} />
                        Estrategia Generada por IA
                    </h3>
                    <div className="prose prose-sm max-w-none overflow-x-hidden whitespace-pre-wrap break-words" style={{ color: theme.text }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiResponse}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Kanban Board Output */}
            {launchPlan && launchPlan.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                    {launchPlan.map((card, index) => (
                        <div key={index} className={`${cardBase} p-4 hover:-translate-y-1 group relative overflow-hidden flex flex-col`}>

                            {/* MrBeast/Seedance Badge */}
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                                🎬 SEEDANCE
                            </div>

                            <div className="flex justify-between items-start mb-3 mt-2">
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full font-bold border border-emerald-500/20">
                                    {card.day}
                                </span>
                                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${card.type === 'Educativo IA'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : card.type === 'Oferta'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-slate-500/20 text-slate-400'
                                    }`}>{card.type}</span>
                            </div>
                            <h3 className="text-sm font-bold mb-2 group-hover:text-emerald-500 transition-colors">
                                {card.phase}
                            </h3>
                            <div className="p-3 rounded-lg border mb-3 min-h-[70px] flex-grow"
                                style={{ backgroundColor: isLightMode ? '#F8FAFC' : '#0F172A', borderColor: theme.border }}>
                                <p className="text-xs italic leading-relaxed opacity-80">"{card.script}"</p>
                            </div>

                            {/* Visual Notes - MrBeast Scene Specs */}
                            {card.visualNotes && (
                                <div className="mb-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="text-[10px]">⚡</span>
                                        <span className="text-[10px] font-bold text-purple-400">ESCENAS:</span>
                                    </div>
                                    <p className="text-[10px] text-purple-300">{card.visualNotes}</p>
                                </div>
                            )}

                            {/* MrBeast Style Indicators */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">🎬 KINETIC</span>
                                <span className="text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded font-bold">🎵 CRESCENDO</span>
                            </div>

                            {/* 🆕 ANTIGRAVITY: Neuromarketing Indicators */}
                            {card.neuroMetrics && (
                                <div className="flex flex-wrap gap-1 mb-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                                    {card.neuroMetrics.dominantColor && (
                                        <span
                                            className="text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"
                                            style={{
                                                backgroundColor: card.neuroMetrics.dominantColor + '20',
                                                color: card.neuroMetrics.dominantColor
                                            }}
                                        >
                                            🎨 {card.neuroMetrics.dominantColor}
                                        </span>
                                    )}
                                    {card.neuroMetrics.editBPM && (
                                        <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                                            💓 {card.neuroMetrics.editBPM} BPM
                                        </span>
                                    )}
                                    {card.neuroMetrics.gazeDirection && (
                                        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                            👁️ {card.neuroMetrics.gazeDirection}
                                        </span>
                                    )}
                                    {card.neuroMetrics.emotionalTone && (
                                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                            🎭 {card.neuroMetrics.emotionalTone}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: theme.border }}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${card.status === 'To Do' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    <span className="text-[10px] opacity-60 font-medium">{card.status}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                    {/* 🆕 ANTIGRAVITY: Thumbnail Factory Button */}
                                    <button
                                        onClick={() => setSelectedDayForThumbnail(card)}
                                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                                        title="Generar Thumbnails A/B/C"
                                    >
                                        <Image size={14} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedDayForVideo(card)}
                                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                                        title="Generar Video con Kling AI"
                                    >
                                        <Video size={14} />
                                    </button>
                                    <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VIDEO GENERATION MODAL (Seedance/Kling AI) */}
            {selectedDayForVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-[#1a1a2e] rounded-xl border border-purple-500/30 shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setSelectedDayForVideo(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <span className="text-2xl">🎬</span>
                                Generador de Video Kling AI
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Creando contenido para: <span className="text-purple-400 font-bold">{selectedDayForVideo.phase}</span>
                            </p>

                            {/* Image Input for Logo */}
                            <div className="mb-6 bg-slate-900/50 p-3 rounded-lg border border-purple-500/20">
                                <label className="block text-xs font-bold text-slate-400 mb-2">LOGO / IMAGEN BASE (URL Pública):</label>
                                <input
                                    type="text"
                                    value={videoLogoUrl}
                                    onChange={(e) => setVideoLogoUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/logo.jpg"
                                    className="w-full rounded bg-[#0F172A] border border-purple-500/30 text-white px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none mb-2"
                                />
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span>⚠️</span>
                                    Kling necesita una URL pública (no localhost).
                                </p>
                            </div>

                            {isVideoGenerating || (selectedDayForVideo.status === 'Generating Video...') ? (
                                <div className="p-8 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-purple-500/20">
                                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                                    <p className="text-white font-bold animate-pulse">Generando Video IA...</p>
                                    <p className="text-slate-400 text-xs mt-2 text-center">
                                        Kling AI está procesando tu script. Esto puede tardar 2-3 minutos.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-6 rounded-lg border border-dashed border-purple-500/30 text-center bg-slate-900/20 group hover:border-purple-500/50 transition-all">
                                    <div className="mb-4 flex justify-center">
                                        <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                            <Video size={32} />
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold mb-2">¿Listo para dar vida a este día?</h4>
                                    <p className="text-xs text-slate-400 mb-6 px-4">
                                        Usaremos Kling AI para generar un video de alta calidad basado en el script y las notas visuales de neuromarketing.
                                    </p>
                                    <button
                                        onClick={async () => {
                                            setIsVideoGenerating(true);
                                            try {
                                                const res = await axios.post('/api/video', {
                                                    prompt: `${selectedDayForVideo.script}. Visuals: ${selectedDayForVideo.visualNotes}. Style: Cinematic, 4k, professional lighting.`
                                                });
                                                if (res.data.taskId) {
                                                    setLastTaskId(res.data.taskId);
                                                    if (launchPlan) {
                                                        const updated = launchPlan.map(d =>
                                                            d.day === selectedDayForVideo.day ? { ...d, status: 'Generating Video...', videoTaskId: res.data.taskId } : d
                                                        );
                                                        setLaunchPlan(updated);
                                                    }
                                                } else if (res.data.fallback) {
                                                    alert(res.data.message);
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert("Error al iniciar generación");
                                            } finally {
                                                setIsVideoGenerating(false);
                                            }
                                        }}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        Generar con Kling AI
                                    </button>
                                </div>
                            )}

                            {selectedDayForVideo.videoUrl && (
                                <div className="mt-4 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <video src={selectedDayForVideo.videoUrl} controls className="w-full rounded-md shadow-lg" />
                                    <p className="text-[10px] text-green-400 mt-2 text-center font-bold">✅ VIDEO GENERADO CON ÉXITO</p>
                                </div>
                            )}

                            {/* NEW: Single Day Action Buttons */}
                            <div className="mt-6 border-t border-purple-500/20 pt-4 flex justify-between items-center">
                                <p className="text-xs text-slate-500">
                                    Status: <span className="text-white">{selectedDayForVideo.status || "Draft"}</span>
                                </p>
                                <button
                                    onClick={() => {
                                        // Find index
                                        const idx = launchPlan?.findIndex(d => d.day === selectedDayForVideo.day);
                                        if (idx !== undefined && idx >= 0) {
                                            handleSocialPublish(idx);
                                        }
                                    }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                                >
                                    <Send size={14} /> Publicar Solo Este Día
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🆕 ANTIGRAVITY: Thumbnail Factory Modal */}
            {selectedDayForThumbnail && (
                <ThumbnailFactory
                    theme={theme}
                    dayContent={{
                        day: selectedDayForThumbnail.day,
                        phase: selectedDayForThumbnail.phase,
                        script: selectedDayForThumbnail.script,
                        visualNotes: selectedDayForThumbnail.visualNotes,
                        neuroMetrics: selectedDayForThumbnail.neuroMetrics,
                        thumbnailPrompt: selectedDayForThumbnail.thumbnailPrompt
                    }}
                    productName={formData.productName}
                    onClose={() => setSelectedDayForThumbnail(null)}
                />
            )}
        </div>
    );
}
