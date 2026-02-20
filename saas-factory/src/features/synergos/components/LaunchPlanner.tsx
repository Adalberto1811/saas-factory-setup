import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
    Sparkles, ChevronRight, Rocket, Send, BrainCircuit, Video, X, Image, Palette, Eye,
    Facebook, Instagram, Twitter, Music2, Youtube, MessageSquare, Monitor, CreditCard, BarChart3, Clock, RotateCcw,
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
            linkedin: false,
            twitter: false,
            instagram: true,
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
    const [isGeneratingAllAssets, setIsGeneratingAllAssets] = useState(false);
    const [videoStatus, setVideoStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [lastTaskId, setLastTaskId] = useState<string | null>(null);
    const [videoEngine, setVideoEngine] = useState<'kling' | 'replicate'>('kling');

    const [launchPlan, setLaunchPlan] = useState<LaunchPlanItem[] | null>(null);

    // --- 🆕 WHISK AUTOMATOR STATE ---
    const [characterReference, setCharacterReference] = useState('');
    const [batchPrompts, setBatchPrompts] = useState<string[]>([]);
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
    const [batchId, setBatchId] = useState<string | null>(null);

    const generateWhiskBatch = async () => {
        if (!formData.productName) {
            alert("⚠️ Se requiere el nombre del producto.");
            return;
        }

        setIsGeneratingBatch(true);
        try {
            console.log("🚀 Generating Whisk Batch for:", formData.productName);
            const response = await axios.post('/api/ads/generate-prompts', {
                businessIdea: formData.productName + (formData.painPoint ? ` - ${formData.painPoint}` : ''),
                characterReference
            });

            if (response.data.prompts) {
                setBatchPrompts(response.data.prompts);
                alert(`✅ Se han generado ${response.data.prompts.length} prompts para Whisk Automator.`);
            }
        } catch (error: any) {
            console.error("❌ Error generating Whisk batch:", error);
            alert("⚠️ Error al generar el lote de prompts.");
        } finally {
            setIsGeneratingBatch(false);
        }
    };

    const copyBatchToClipboard = () => {
        if (batchPrompts.length === 0) return;

        const textToCopy = batchPrompts.join('\n\n');
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("📋 Lote de 20 prompts copiado al portapapeles."))
            .catch(err => console.error("Error al copiar:", err));
    };

    const handleBulkImageUpload = async (files: FileList) => {
        if (files.length === 0) return;

        console.log(`📤 Simulando carga masiva de ${files.length} imágenes...`);

        // In a real scenario, we would upload these files to S3/Supabase and get URLs
        // For now, we'll simulate URLs based on filenames
        const simulatedUrls = Array.from(files).map(file => `https://synergos.cdn/uploads/${file.name}`);

        try {
            const response = await axios.post('/api/ads/bulk-link', {
                batchId,
                imageUrls: simulatedUrls,
                businessIdea: formData.productName,
                characterReference,
                tenantId: searchParams.get('tenant') || null // Assuming tenant passed in URL
            });

            if (response.data.success) {
                setBatchId(response.data.batch.id);
                alert(`✅ ${simulatedUrls.length} imágenes vinculadas al anuncio en Neon.`);
            }
        } catch (error) {
            console.error("Error linking images:", error);
            alert("⚠️ Error al vincular las imágenes en la base de datos.");
        }
    };

    // =====================================================
    // 🆕 ANTIGRAVITY: Bulk Generate Assets (Images for 7 Days)
    // =====================================================
    const generateAllAssets = async () => {
        if (!launchPlan || launchPlan.length === 0) return;

        setIsGeneratingAllAssets(true);
        console.log("🎨 Kicking off BULK asset generation...");

        const updatedPlan = [...launchPlan];

        try {
            // Generate in sequence or parallel (using sequential for safety/rate limits)
            for (let i = 0; i < updatedPlan.length; i++) {
                const day = updatedPlan[i];
                if (day.videoUrl || day.videoTaskId) continue; // Skip if already handled

                console.log(`📸 Generating asset for ${day.day}...`);
                try {
                    const response = await axios.post('/api/generate-image', {
                        prompt: day.thumbnailPrompt || day.script,
                        productName: formData.productName,
                        primaryColor: day.neuroMetrics?.dominantColor
                    });

                    if (response.data.imageUrl) {
                        updatedPlan[i] = {
                            ...updatedPlan[i],
                            videoUrl: response.data.imageUrl,
                            status: 'Ready'
                        };
                        setLaunchPlan([...updatedPlan]); // Update UI progressively
                    }
                } catch (err) {
                    console.error(`❌ Failed to generate asset for Day ${i + 1}:`, err);
                }

                // --- 🆕 ANTIGRAVITY: Staggered Generation (3s Delay) ---
                if (i < updatedPlan.length - 1) {
                    console.log(`⏳ Waiting for staggered generation (3s)...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        } finally {
            setIsGeneratingAllAssets(false);
            console.log("✅ Bulk asset generation complete!");
        }
    };

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

        // 🆕 ANTIGRAVITY: Production Readiness Check
        const missingAssets = itemsToPublish.filter(day => !day.videoUrl && !formData.mediaUrl);
        if (missingAssets.length > 0 && singleDayIndex === null) {
            const confirmMsg = `⚠️ AVISO DE PRODUCCIÓN:\n\n${missingAssets.length} días de tu campaña aún usan Placeholders (no tienen Video/Imagen de IA real).\n\n¿Deseas publicar así o prefieres cancelar y generar los activos faltantes?`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }

        setIsPublishing(true);
        setPublishStatus('idle');

        try {
            // Correctly construct the endpoint URL
            const endpoint = webhooks.baseUrl
                ? `${webhooks.baseUrl}/${publishWebhook}`
                : (publishWebhook.startsWith('http') ? publishWebhook : `/${publishWebhook}`);

            // 2. Select Enabled Platforms
            const selectedPlatforms = Object.entries(formData.platforms)
                .filter(([_, enabled]) => enabled)
                .map(([platform]) => platform);

            // 3. Calculate Scheduling Times (Start Date + 24h increments)
            let startDate = new Date();
            if (formData.scheduledDate) {
                const parsedDate = new Date(formData.scheduledDate);
                if (!isNaN(parsedDate.getTime())) {
                    startDate = parsedDate;
                }
            }

            // 1. Construct the Days Array payload (UNIVERSAL STRUCTURE)
            const daysArray = itemsToPublish.map((day, index) => {
                const dayScheduledDate = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000));
                // Fallback media: prioritize videoUrl, then global mediaUrl, then placeholder
                const finalMediaUrl = day.videoUrl || formData.mediaUrl || 'https://placehold.co/1080x1080/png?text=Synergos+Content';

                return {
                    day: day.day,
                    phase: day.phase,
                    script: day.script || 'Contenido generado por Synergos Solutions.',
                    visualNotes: day.visualNotes || '',
                    videoTaskId: day.videoTaskId || null,
                    videoUrl: finalMediaUrl,
                    mediaUrl: finalMediaUrl,
                    status: day.status || 'To Do',
                    platforms: selectedPlatforms, // Sent as array of strings
                    scheduledTime: dayScheduledDate.toISOString()
                };
            });

            // 3. Prepare Payload - HYPER-COMPATIBLE
            // We send the data in multiple possible formats so ANY N8N node configuration (body.days, days, etc.) finds it.
            const campaignData = {
                title: singleDayIndex !== null
                    ? `${formData.productName} - ${itemsToPublish[0].day}`
                    : (formData.productName || "Campaña Completa"),
                copy: singleDayIndex !== null
                    ? (itemsToPublish[0].script || generateIntroCopy(formData.painPoint))
                    : generateIntroCopy(formData.painPoint),
                isSingleDay: singleDayIndex !== null,
                targetDay: singleDayIndex !== null ? itemsToPublish[0].day : 'All',
                days: daysArray,
                plan: daysArray, // Alias
                platforms: selectedPlatforms,
                productName: formData.productName,
                painPoint: formData.painPoint,
                mediaUrl: formData.mediaUrl || (daysArray.length > 0 ? daysArray[0].mediaUrl : null)
            };

            const publishPayload = {
                ...campaignData,
                payload: campaignData, // Extra wrap for redundancy
                body: campaignData // Full redundancy: fields both at root and within 'body'
            };

            const proxyEndpoint = `/api/n8n-proxy?webhook=${publishWebhook}`;

            console.log("🚀 SYNERGOS PUBLISH PAYLOAD:", publishPayload);
            console.log("🔗 Proxy Endpoint:", proxyEndpoint);

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

                if (singleDayIndex !== null) {
                    alert("✅ Publicación de 1 día programada exitosamente.");
                } else {
                    const aiCount = daysArray.filter(d => !d.videoUrl.includes('placehold.co')).length;
                    const placeholderCount = daysArray.length - aiCount;
                    alert(`✅ Campaña de 7 días programada:\n\n🚀 Activos IA Reales: ${aiCount}\n⚠️ Placeholders (Pendientes): ${placeholderCount}\n\nLos cambios ya están en el servidor de n8n.`);
                }
            } else {
                console.warn("⚠️ Publish Status not 200:", response.status);
                setPublishStatus('error');
            }
        } catch (error: any) {
            console.error('Error publishing:', error);
            setPublishStatus('error');
            const errorMsg = error.response?.data?.error || error.message || "Error desconocido";
            const details = error.response?.data?.details;
            const fullError = details ? `${errorMsg}\n\nDetalles del Servidor:\n${details}` : errorMsg;
            alert(`❌ Error al publicar:\n${fullError}`);
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

        try {
            // NEW: Use direct /api/market-syn
            console.log("🚀 Generating Plan via Local API...");

            const response = await axios.post(
                '/api/market-syn',
                {
                    productName: formData.productName,
                    price: formData.price,
                    painPoint: formData.painPoint,
                    competitorUrl: formData.competitorUrl,
                    competitorAnalysis: formData.competitorAnalysis,
                    companyInfo
                }
            );

            const jsonResult = response.data;
            console.log("✅ Marketing Strategy Received:", jsonResult);

            const daysArray = jsonResult.days || jsonResult.plan;

            if (jsonResult && daysArray && Array.isArray(daysArray)) {
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
                console.warn("⚠️ Valid structure NOT found in AI response");
                setAiResponse("Error: La IA no devolvió un formato válido. Por favor intenta de nuevo.");
            }

        } catch (error: any) {
            console.error('Error calling MarketSyn API:', error);
            const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
            setAiResponse(`⚠️ Error al generar la estrategia: ${errorMsg}. Por favor intenta de nuevo.`);
        } finally {
            setIsLoading(false);
        }
    };

    const generateVideo = async (day: LaunchPlanItem, index: number) => {
        if (!day.script) {
            alert("⚠️ No hay un guion generado para este día. Por favor, genera la estrategia primero.");
            return;
        }

        setIsVideoGenerating(true);
        setVideoStatus('processing');
        setSelectedDayForVideo(day);

        try {
            console.log(`🎬 Generating AI Video for Day ${day.day}...`);
            const response = await axios.post('/api/video', {
                prompt: day.script,
                ratio: "9:16", // Vertical for TikTok/Reels
                logoUrl: videoLogoUrl, // 🆕 ANTIGRAVITY: Pass the branding logo
                engine: videoEngine // 🆕 ANTIGRAVITY: Support engine switch
            });

            if (response.data.taskId) {
                const taskId = response.data.taskId;
                setLastTaskId(taskId);

                // Start polling
                pollVideoStatus(taskId, index);
            } else if (response.data.fallback) {
                // Handle demo video
                const demoVideo = "https://cdn.pixabay.com/vimeo/327310189/marketing-22108.mp4?width=1280&hash=d3f2d9f7e5f1f7d7e5f1f7d7e5f1f7d7e5f1f7d7"; // Sample
                updateDayVideo(index, demoVideo);
                setVideoStatus('done');
                setIsVideoGenerating(false);
            } else if (response.data.error) {
                // Handle API reported error gracefully
                alert(`❌ Error de la IA:\n${response.data.error}\n\n${response.data.message || ''}`);
                setVideoStatus('error');
                setIsVideoGenerating(false);
            }
        } catch (error: any) {
            console.error('Error generating video:', error);
            setVideoStatus('error');
            setIsVideoGenerating(false);
            const errorMsg = error.response?.data?.details || error.message || "Error desconocido en el servidor.";
            alert(`❌ Error al conectar con el motor de Video:\n${errorMsg}`);
        }
    };

    const pollVideoStatus = async (taskId: string, index: number) => {
        let attempts = 0;
        const maxAttempts = 30; // 5 mins max

        const checkStatus = async () => {
            try {
                const response = await axios.get(`/api/video?taskId=${taskId}&engine=${videoEngine}`);
                const { status, videoUrl } = response.data;

                console.log(`📹 Video status (${taskId}):`, status);

                if (status === 'succeeded' && videoUrl) {
                    updateDayVideo(index, videoUrl);
                    setVideoStatus('done');
                    setIsVideoGenerating(false);
                    return;
                }

                if (status === 'failed') {
                    setVideoStatus('error');
                    setIsVideoGenerating(false);
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000); // Check every 10s
                } else {
                    setVideoStatus('error');
                    setIsVideoGenerating(false);
                }
            } catch (error) {
                console.error('Error polling video status:', error);
                setVideoStatus('error');
                setIsVideoGenerating(false);
            }
        };

        checkStatus();
    };

    const updateDayVideo = (index: number, url: string) => {
        if (launchPlan) {
            const newPlan = [...launchPlan];
            newPlan[index].videoUrl = url;
            newPlan[index].status = 'Ready to Publish';
            setLaunchPlan(newPlan);

            // 🔥 ANTIGRAVITY: Update the selected day state to reflect changes in modal
            if (selectedDayForVideo && selectedDayForVideo.day === newPlan[index].day) {
                setSelectedDayForVideo(newPlan[index]);
            }
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
        backdrop-blur-md rounded-3xl border-[3px] transition-all duration-300
        ${isLightMode
            ? 'bg-white/70 border-white/50 shadow-xl shadow-slate-200/50'
            : 'bg-slate-900/50 border-slate-700/50 shadow-2xl shadow-black/20'
        }
    `;

    const inputBase = `
        w-full rounded-xl px-4 py-3 outline-none transition-all border-[3px]
        ${isLightMode
            ? 'bg-slate-50/50 border-slate-200 focus:border-[#B8860B] focus:ring-4 focus:ring-amber-500/10 text-[#064e3b]'
            : 'bg-slate-950/50 border-slate-800 focus:border-[#B8860B] focus:ring-4 focus:ring-amber-500/20 text-white'
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
                            <Clock size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Programación de Campaña</span>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold mb-2 opacity-70">Fecha y Hora de Inicio (Día 1)</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledDate}
                                className={inputBase}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            />
                            <p className="text-[10px] mt-2 opacity-50 italic">Los días 2 al 7 se programarán automáticamente cada 24h.</p>
                        </div>

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

                {/* Card 5: Action Buttons - REDESIGNED TO BE HIGH IMPACT */}
                <div className={`${cardBase} p-10 md:col-span-12 flex flex-col justify-center items-center gap-6 relative overflow-hidden group`}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-50" />

                    <div className="max-w-3xl w-full text-center">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2" style={{ color: theme.text }}>
                            Estrategia Lista para Despegue
                        </h3>
                        <p className="text-sm opacity-60 mb-6">
                            Haz clic para que el motor de Neuromarketing genere tu plan de 7 días y activos visuales.
                        </p>

                        <button
                            onClick={generatePlan}
                            disabled={isLoading}
                            className={`
                                w-full py-6 px-10 rounded-2xl font-black text-2xl uppercase tracking-widest
                                transition-all duration-500 flex items-center justify-center gap-4
                                active:scale-95 disabled:opacity-50 relative z-10
                                border-[4px] shadow-[0_0_50px_rgba(184,134,11,0.2)]
                                hover:shadow-[0_0_70px_rgba(184,134,11,0.4)]
                                hover:scale-[1.02]
                            `}
                            style={{
                                backgroundColor: theme.accent, // Metallic Gold
                                color: '#000',
                                borderColor: '#00000020'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-8 h-8 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Generando...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={32} className="animate-pulse" />
                                    <span>{launchPlan ? 'Regenerar Estrategia Maestra' : 'Generar Estrategia Maestra'}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Subtle status badges below button */}
                    {(launchPlan || aiResponse) && (
                        <div className="flex flex-wrap justify-center gap-4 w-full border-t border-slate-700/30 pt-8 mt-4">
                            {/* 🆕 ANTIGRAVITY: Bulk Asset Generation Button */}
                            {launchPlan && !publishStatus.includes('success') && (
                                <button
                                    className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-[3px]"
                                    onClick={generateAllAssets}
                                    disabled={isGeneratingAllAssets}
                                    style={{
                                        backgroundColor: '#10B98120',
                                        borderColor: '#10B981',
                                        color: '#10B981',
                                        boxShadow: isGeneratingAllAssets ? 'none' : '0 0 20px rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    {isGeneratingAllAssets ? (
                                        <>
                                            <RotateCcw className="animate-spin" size={20} />
                                            <span>Generando Activos (IA)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            <span>Generar Todos los Activos (IA)</span>
                                        </>
                                    )}
                                </button>
                            )}

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
                                        <span>{isPublishing ? 'Programando...' : 'Programar Campaña (1 post cada 24h)'}</span>
                                    </>
                                )}
                            </button>
                            <p className="w-full text-center text-[10px] opacity-40 italic mt-2">
                                📅 Los posts se programarán en intervalos de 24 horas a partir de la fecha seleccionada.
                            </p>

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

                {/* 🆕 WHISK AUTOMATOR SECTION */}
                <div className={`${cardBase} p-10 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl tracking-widest uppercase">
                        Whisk Automator Integration
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4" style={{ color: theme.text }}>
                                ⚡ Generación Masiva (Lote de 20)
                            </h3>
                            <p className="text-sm opacity-60 mb-6">
                                Genera 20 prompts visuales optimizados para Whisk Automator con consistencia de personaje.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-2 opacity-70 uppercase tracking-widest">
                                    🎭 Personaje de Referencia (Modo Consistencia)
                                </label>
                                <input
                                    type="text"
                                    value={characterReference}
                                    onChange={(e) => setCharacterReference(e.target.value)}
                                    placeholder="Ej: Hombre de 40 años, barba corta, traje azul..."
                                    className={inputBase}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={generateWhiskBatch}
                                    disabled={isGeneratingBatch || !formData.productName}
                                    className="flex-1 py-4 px-6 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGeneratingBatch ? 'Generando Lote...' : 'Generar 20 Prompts'}
                                </button>

                                {batchPrompts.length > 0 && (
                                    <button
                                        onClick={copyBatchToClipboard}
                                        className="flex-1 py-4 px-6 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                                    >
                                        📋 Copiar Lote para Whisk
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-700/50 p-8 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all relative">
                        <div className="mb-4 p-4 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Image size={40} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Carga Masiva de Imágenes</h4>
                        <p className="text-xs opacity-50 mb-6 max-w-xs">
                            Arrastra las 20 imágenes generadas por Whisk aquí para vincularlas automáticamente al anuncio en Neon.
                        </p>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => e.target.files && handleBulkImageUpload(e.target.files)}
                        />

                        <div className="py-2 px-6 rounded-full bg-slate-800 text-xs font-bold border border-slate-700">
                            Haga clic o arrastre archivos
                        </div>
                    </div>
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
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${card.status === 'To Do' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <span className="text-[10px] opacity-60 font-medium">{card.status}</span>
                                    </div>
                                    {/* 🆕 Producción Badge */}
                                    <div className="flex items-center gap-1">
                                        {card.videoUrl ? (
                                            <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-1 rounded">
                                                ✅ AI READY
                                            </span>
                                        ) : (
                                            <span className="text-[8px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-1 rounded">
                                                ⚠️ PLACEHOLDER
                                            </span>
                                        )}
                                    </div>
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

                            {/* Engine Selection Toggle */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Motor de Generación:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setVideoEngine('kling')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${videoEngine === 'kling'
                                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                                            }`}
                                    >
                                        <span className="text-xl">🎬</span>
                                        <div className="text-center">
                                            <div className="text-xs font-black">KLING AI</div>
                                            <div className="text-[9px] opacity-70">Alta Fidelidad</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setVideoEngine('replicate')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${videoEngine === 'replicate'
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                                            }`}
                                    >
                                        <span className="text-xl">⚡</span>
                                        <div className="text-center">
                                            <div className="text-xs font-black">REPLICATE</div>
                                            <div className="text-[9px] opacity-70">Luma Dream Machine</div>
                                        </div>
                                    </button>
                                </div>
                                {videoEngine === 'replicate' && (
                                    <p className="mt-2 text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                                        ⚠️ Usando MarketSyn SDK (r8_...).
                                    </p>
                                )}
                            </div>

                            {isVideoGenerating || (selectedDayForVideo.status === 'Generating Video...') ? (
                                <div className="p-8 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-purple-500/20">
                                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                                    <p className="text-white font-bold animate-pulse">Generando Video con Kling AI...</p>
                                    <p className="text-slate-400 text-xs mt-2 text-center px-4">
                                        Nuestra IA está fabricando tu escena cinemática. Este proceso suele tardar de 1 a 2 minutos.
                                    </p>
                                </div>
                            ) : selectedDayForVideo.videoUrl ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] group">
                                        <video
                                            src={selectedDayForVideo.videoUrl}
                                            controls
                                            autoPlay
                                            className="w-full aspect-[9/16] object-cover bg-black"
                                        />
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
                                            ✅ LISTO PARA REDES
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const idx = launchPlan?.findIndex(d => d.day === selectedDayForVideo.day);
                                            if (idx !== undefined && idx >= 0) {
                                                generateVideo(selectedDayForVideo, idx);
                                            }
                                        }}
                                        className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold border border-slate-700 flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={14} /> Regenerar (Gastar Créditos)
                                    </button>
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
                                        onClick={() => {
                                            const idx = launchPlan?.findIndex(d => d.day === selectedDayForVideo.day);
                                            if (idx !== undefined && idx >= 0) {
                                                generateVideo(selectedDayForVideo, idx);
                                            }
                                        }}
                                        disabled={isVideoGenerating}
                                        className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 ${videoEngine === 'kling'
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
                                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                                            }`}
                                    >
                                        {isVideoGenerating ? 'Iniciando generación...' : `Generar con ${videoEngine === 'kling' ? 'Kling AI' : 'Replicate'}`}
                                    </button>
                                </div>
                            )}

                            {/* Single Day Action Buttons */}
                            <div className="mt-8 border-t border-slate-700/50 pt-6 flex justify-between items-center bg-slate-900/40 -mx-6 -mb-6 p-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Estado</span>
                                    <span className={`text-xs font-bold ${selectedDayForVideo.videoUrl ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {selectedDayForVideo.videoUrl ? 'PREPARADO' : 'PENDIENTE DE IA'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        const idx = launchPlan?.findIndex(d => d.day === selectedDayForVideo.day);
                                        if (idx !== undefined && idx >= 0) {
                                            handleSocialPublish(idx);
                                        }
                                    }}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${selectedDayForVideo.videoUrl
                                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={14} /> Publicar AHORA
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
                    onSelectThumbnail={(url) => {
                        // Find index
                        const idx = launchPlan?.findIndex(d => d.day === selectedDayForThumbnail.day);
                        if (idx !== undefined && idx >= 0) {
                            updateDayVideo(idx, url); // Reusing updateDayVideo as it updates the general mediaUrl/videoUrl field
                        }
                        setSelectedDayForThumbnail(null);
                        alert("✅ Miniatura seleccionada para el plan.");
                    }}
                />
            )}
        </div>
    );
}
