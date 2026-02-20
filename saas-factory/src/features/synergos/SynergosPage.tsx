import LaunchPlanner from './components/LaunchPlanner';
import SynCards from './components/SynCards';
import ModuleNotActivated from './components/ModuleNotActivated';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Settings, MessageSquare, User, Upload, FileText, Check, AlertCircle, Database,
    Mic, BarChart3, Lock, LogOut, Sun, Moon, Video, Youtube, Monitor, Play, X, CreditCard, Nfc, Menu, Mail, MessageCircle,
    Grid, Users, CheckCircle2, Sparkles, Copy, TrendingUp
} from 'lucide-react';


import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AudioRecorder from './components/AudioRecorder';
import ScreenRecorder from './components/ScreenRecorder';
import axios from 'axios';
import { clientConfig } from './config/synergos-config';
import { AuthGuard } from './components/AuthGuard';
import ReactMarkdown from 'react-markdown';
import Mermaid from '../../shared/components/Mermaid';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Login } from './components/Login';
// import { saveAs } from 'file-saver'; // Removed to use native download

// --- Types ---
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    attachment?: {
        name: string;
        url: string;
        type: 'pdf' | 'image' | 'other';
    };
    downloadLink?: string;
    fileName?: string;
}

type Module = 'agent' | 'transcription' | 'marketing' | 'admin' | 'syncards' | 'documents';

interface Theme {
    primary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
}

// --- Theme Config ---
const lightTheme: Theme = {
    primary: clientConfig.theme.primaryColor, // #001F3F
    accent: clientConfig.theme.accentColor,   // #D4AF37
    background: '#F1F5F9', // Slate 100 (Improved Contrast)
    text: '#111827',
    card: '#FFFFFF',
    border: '#E2E8F0'
};

const darkTheme: Theme = {
    primary: '#0F172A', // Slate 900
    accent: '#B8860B',  // Rich Gold
    background: '#020617', // Slate 950
    text: '#F8FAFC',    // Slate 50
    card: '#1E293B',    // Slate 800
    border: '#334155'   // Slate 700
};

// --- Components ---

const AgentSyn = ({
    sessionId,
    theme,
    isDarkMode,
    pendingInput,
    onClearPendingInput,
    onMarketSynTrigger,
    onTranscripSynTrigger,
    onRequestDemo,
    tenantId
}: {
    sessionId: string,
    tenantId: string,
    theme: Theme,
    isDarkMode: boolean,
    pendingInput?: string,
    onClearPendingInput?: () => void,
    onMarketSynTrigger?: (data: { producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string }) => void,
    onTranscripSynTrigger?: (url?: string) => void,
    onRequestDemo?: () => void
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [finalDocumentText, setFinalDocumentText] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pendingInput) {
            if (pendingInput.includes("[Video sin audio")) {
                // Handle silent video as a system notification
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "⚠️ **Aviso del Sistema:** He detectado que compartiste tu pantalla sin audio. Estoy listo para analizar el contenido visual si me das instrucciones.",
                    timestamp: new Date()
                }]);
            } else {
                // Auto-send transcription or chat input
                handleSendMessage(pendingInput);
            }
            if (onClearPendingInput) onClearPendingInput();
        }
    }, [pendingInput, onClearPendingInput]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateDocx = async (content: string) => {
        if (!content || typeof content !== 'string') {
            alert("Error: No hay contenido de texto válido para generar el documento.");
            console.error("generateDocx received invalid content:", content);
            return;
        }

        const defaultName = `Documento_Legal_${new Date().toISOString().slice(0, 10)}`;
        const fileName = window.prompt("Nombre del archivo (sin extensión):", defaultName);

        if (!fileName) return; // Usuario canceló

        try {
            // 🆕 GUARDAR EN BASE DE DATOS primero
            try {
                await axios.post('/api/documents', {
                    title: fileName,
                    content: content,
                    documentType: 'legal_document',
                    sessionId: sessionId,
                    projectName: tenantId
                });
                console.log("✅ Documento guardado en base de datos");
            } catch (dbError) {
                console.warn("⚠️ No se pudo guardar en DB, pero se descargará:", dbError);
                // Continúa con la descarga aunque falle el guardado
            }

            // Generar DOCX
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: content.split('\n').map(line => new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 200 }
                    })),
                }],
            });

            const blob = await Packer.toBlob(doc);
            console.log("DOCX Blob generated, size:", blob.size);

            // Native Download Fallback to avoid "Network Error" with file-saver
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.docx`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error generating DOCX:", error);
            alert("Hubo un problema generando el DOCX. Se intentará descargar como Texto Plano (.txt) para asegurar que no pierda su información.");

            try {
                const txtBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const txtUrl = window.URL.createObjectURL(txtBlob);
                const txtLink = document.createElement('a');
                txtLink.href = txtUrl;
                txtLink.download = `${fileName}_backup.txt`;
                document.body.appendChild(txtLink);
                txtLink.click();
                document.body.removeChild(txtLink);
                window.URL.revokeObjectURL(txtUrl);
            } catch (txtError) {
                console.error("Error generating TXT fallback:", txtError);
                alert("CRÍTICO: No se pudo descargar ni DOCX ni TXT. Por favor copie el texto manualmente.");
            }
        }
    };

    const handleSendMessage = async (directText?: string) => {
        const textToSend = directText || inputMessage;
        // 1. Validación básica
        if (!textToSend.trim() && !selectedFile) return;

        // 2. Crear mensaje visual para el usuario
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInputMessage('');
        setSelectedFile(null);
        setIsTyping(true);

        try {
            // NEW: Use direct /api/chat instead of n8n-proxy
            const response = await axios.post('/api/chat', {
                sessionId: sessionId,
                messages: updatedMessages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            });

            // 6. Procesar respuesta del Agente
            console.log("N8N Response Raw:", response.data); // Debug log

            let botContent = "";

            // Helper function to extract text from an object with deep search
            const extractText = (obj: any): string | null => {
                if (!obj) return null;
                if (typeof obj === 'string') return obj;
                if (obj.output) return obj.output;
                if (obj.text) return obj.text;
                if (obj.message) return obj.message;
                if (obj.response) return obj.response;

                // Deep search for 'text' or 'output' in nested objects
                if (typeof obj === 'object') {
                    for (const key in obj) {
                        const val = obj[key];
                        if (key === 'text' || key === 'output' || key === 'message') {
                            if (typeof val === 'string') return val;
                        }
                        if (typeof val === 'object' && val !== null) {
                            const deepText = extractText(val);
                            if (deepText) return deepText;
                        }
                    }

                    // Fallback: find first string value > 3 chars
                    const values = Object.values(obj);
                    const stringValue = values.find(v => typeof v === 'string' && v.length > 3);
                    return (stringValue as string) || null;
                }
                return null;
            };

            // Handle Array response (N8N often returns arrays)
            if (Array.isArray(response.data) && response.data.length > 0) {
                botContent = extractText(response.data[0]) || "";
            } else if (typeof response.data === 'object' && response.data !== null) {
                botContent = extractText(response.data) || "";
            } else if (typeof response.data === 'string') {
                botContent = response.data;
            }

            // Fallback if still empty: Dump the raw JSON so the user can see what happened
            if (!botContent || botContent.trim() === "" || botContent === "...") {
                console.warn("Empty content extracted. Raw data:", response.data);
                const rawJson = JSON.stringify(response.data);
                if (rawJson === "[]" || rawJson === "{}" || !rawJson) {
                    botContent = "⚠️ **Fallo de Conexión:** El asistente de producción recibió la señal pero no devolvió contenido. Esto puede deberse a que el flujo en N8N está inactivo o el modelo de IA está saturado.";
                } else {
                    botContent = `⚠️ **Error de Formato:** El asistente devolvió datos pero no en el formato esperado. Datos recibidos: \`\`\`json\n${JSON.stringify(response.data, null, 2)}\n\`\`\``;
                }
            }

            // CLEANING: Remove "User: ... Assistant:" echoes if the LLM is hallucinating chat history
            if (botContent.includes("Assistant:")) {
                const split = botContent.split("Assistant:");
                botContent = split[split.length - 1].trim();
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: botContent,
                role: 'assistant',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botResponse]);

            // ORCHESTRATOR: Detect [[MARKETSYN]] tag and trigger module switch
            if (botContent.includes('[[MARKETSYN]]') && onMarketSynTrigger) {
                try {
                    const jsonMatch = botContent.match(/\{[\s\S]*?\}/)
                    if (jsonMatch) {
                        const marketData = JSON.parse(jsonMatch[0]);
                        console.log('🎯 MarketSyn detected! Data:', marketData);

                        const switchMsg: Message = {
                            id: (Date.now() + 2).toString(),
                            content: `🚀 **Detectado: Solicitud de Estrategia de Marketing**\n\nPreparando MarketSyn con:\n- **Producto:** ${marketData.producto}\n- **Precio:** ${marketData.precioNormal} → ${marketData.precioOferta}\n\n*Cambiando a MarketSyn...*`,
                            role: 'assistant',
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, switchMsg]);

                        setTimeout(() => {
                            onMarketSynTrigger(marketData);
                        }, 2000);
                    }
                } catch (parseError) {
                    console.warn('Could not parse MarketSyn JSON:', parseError);
                }
            }

            // ORCHESTRATOR: Detect [[SYNCARDS]]
            if (botContent.includes('[[SYNCARDS]]')) {
                const switchMsg: Message = {
                    id: (Date.now() + 3).toString(),
                    content: `📇 **Preparando Módulo de SynCards**\n\nCambiando interfaz...`,
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, switchMsg]);
            }

        } catch (error) {
            console.error('Error Chat API:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                content: "Error de conexión con el Asistente Synergos. Por favor intenta de nuevo.",
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-6">
            <div className={`flex-1 overflow-y-auto space-y-6 p-6 rounded-2xl mb-6 shadow-sm border-[3px] ${!isDarkMode ? 'bg-slate-50' : ''}`}
                style={isDarkMode ? { backgroundColor: theme.card, borderColor: theme.border } : { borderColor: theme.border }}>

                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border overflow-hidden p-1 shadow-xl"
                            style={{ backgroundColor: theme.background, borderColor: theme.accent }}>
                            <img
                                src="/logo.png"
                                alt="Synergos Logo"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-2xl">S</div>';
                                }}
                            />
                        </div>
                        <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>Transformamos tu Negocio con IA</h3>
                        <p className="max-w-md font-medium" style={{ color: theme.text, opacity: 0.8 }}>
                            Automatizamos tus procesos críticos con Lead Generation Agents y N8N Workflows que generan resultados 24/7.
                        </p>
                        <div className="mt-4 flex flex-col gap-2 text-sm">
                            <p className="flex items-center justify-center gap-2 font-semibold" style={{ color: theme.accent }}>
                                🚀 +300% ROI | Implementación en 7 días
                            </p>
                        </div>
                        {onRequestDemo && (
                            <button
                                onClick={onRequestDemo}
                                className="mt-8 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform animate-pulse"
                                style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                            >
                                🔥 Solicitar Demo Gratuita
                            </button>
                        )}
                        {!onRequestDemo && <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm max-w-sm">
                            ✨ **¿Listo para escalar?** Pregúntame cómo podemos multiplicar tus resultados hoy mismo o agenda tu **Consulta Estratégica Gratuita**.
                        </div>}
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] p-5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                                }`}
                            style={msg.role === 'user' ? {
                                backgroundColor: theme.primary,
                                color: '#FFFFFF'
                            } : isDarkMode ? {
                                backgroundColor: theme.background,
                                border: `3px solid ${theme.border}`,
                                color: theme.text
                            } : {
                                backgroundColor: '#EEF2FF', // bg-indigo-50/60 (approx)
                                borderColor: '#E0E7FF', // border-indigo-100
                                borderWidth: '3px',
                                color: '#0F172A' // text-slate-900
                            }}
                        >
                            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>

                            {msg.attachment && (
                                <a
                                    href={msg.attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 p-3 rounded-lg flex items-center justify-center gap-3 transition-colors hover:brightness-110 shadow-md"
                                    style={{ backgroundColor: '#10B981', color: 'white' }} // Green/Blue solid button
                                >
                                    <span className="font-bold">⬇️ Descargar Documento</span>
                                </a>
                            )}

                            {msg.downloadLink ? (
                                <a
                                    href={msg.downloadLink}
                                    download={msg.fileName || "Documento_Legal.txt"}
                                    className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all"
                                >
                                    ⬇️ DESCARGAR DOCUMENTO AHORA
                                </a>
                            ) : (
                                /* NEW LOGIC: Only show if it contains the Key Phrase */
                                msg.role === 'assistant' && msg.content.includes("El documento estratégico ha sido finalizado. Puede guardarlo para su revisión.") && (
                                    <button
                                        onClick={() => generateDocx(msg.content)}
                                        className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.5)] font-bold border-none hover:bg-[#2ecc11] text-white font-bold rounded-lg shadow-md transition-all"
                                    >
                                        ⬇️ GUARDAR COMO WORD (.DOCX)
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="p-4 rounded-2xl rounded-tl-none border flex gap-2 shadow-sm"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75" />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div
                className={`p-4 rounded-2xl shadow-lg border-[3px] flex items-center gap-4 transition-all ${!isDarkMode
                    ? 'bg-blue-50/50 border-blue-100 focus-within:ring-2 focus-within:ring-[#39FF14]'
                    : ''
                    }`}
                style={isDarkMode ? { backgroundColor: theme.card, borderColor: theme.border } : {}}
            >
                <button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="p-3 rounded-xl transition-colors opacity-60 hover:opacity-100"
                    style={{ color: theme.text }}
                    title="Adjuntar documento"
                >
                    <Paperclip className="w-6 h-6" />
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                </button>

                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={selectedFile ? `Archivo: ${selectedFile.name}` : "¿Cómo podemos multiplicar tu ROI? Escribe aquí..."}
                    className={`flex-1 bg-transparent border-none focus:outline-none text-lg ${!isDarkMode ? 'text-slate-800 placeholder:text-slate-500' : ''}`}
                    style={isDarkMode ? { color: theme.text } : {}}
                />

                <button
                    onClick={() => handleSendMessage()}
                    className="p-3 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-md"
                    style={{
                        backgroundColor: '#39FF14',
                        color: '#000000',
                        boxShadow: '0 0 15px rgba(57, 255, 20, 0.5)'
                    }}
                >
                    <Send className="w-6 h-6" />
                </button>
            </div>

            {onRequestDemo && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={onRequestDemo}
                        className="text-sm underline opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: theme.text }}
                    >
                        Acceso a Miembros / Login
                    </button>
                </div>
            )}
        </div>
    );
};

const TranscripSyn = ({ theme, meetingUrl, setPendingInput, onNavigateToAgent }: { theme: Theme, meetingUrl?: string, setPendingInput: (text: string) => void, onNavigateToAgent: () => void }) => {
    const [youtubeUrl, setYoutubeUrl] = useState(meetingUrl || '');
    const [stats, setStats] = useState<{ files: number | string, minutes: number | string }>({ files: 0, minutes: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState<{
        summary?: string;
        tasks?: string[];
        attendees?: string[];
        email?: string;
        mermaid?: string;
    } | null>(null);

    // Tenant Scoping
    const [tenantId] = useState(() => {
        if (typeof window === 'undefined') return 'default';
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || 'default';
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats({ files: '-', minutes: '-' });
            }
        };
        fetchStats();
    }, []);

    const analyzeTranscription = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const prompt = `ERES: El Analista Senior de Synergos Solutions. Tu misión es extraer la MÁXIMA inteligencia de negocio de la siguiente transcripción.

OBJETIVO:
Generar un reporte agéntico de alto nivel que incluye:
1. Resumen Ejecutivo (Directo, valor, impacto).
2. Asistentes (Identifica nombres y roles si es posible).
3. Plan de Acción (Tareas claras con responsables).
4. Follow-up Email (Email profesional listo para enviar).
5. Mapa Mental Visual (Formato Mermaid.js graph TD, conectando ideas clave, dolores y soluciones).

REGLAS DE FORMATO:
Responde ÚNICAMENTE en JSON con estas llaves exactas:
{
  "summary": "markdown string",
  "attendees": ["string"],
  "tasks": ["string"],
  "email": "markdown string",
  "mermaid": "mermaid code string (start with graph TD)"
}

TRANSCRIPCIÓN:
${text}`;

            const response = await axios.post('/api/chat', {
                messages: [{ role: 'user', content: prompt }],
                sessionId: `analysis-${tenantId}-${Date.now()}`
            });

            const content = response.data.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                setAnalysis(data);
            } else {
                setAnalysis({
                    summary: content,
                    tasks: ["No se pudieron extraer tareas automáticamente."],
                    attendees: ["No detectados"]
                });
            }
        } catch (error) {
            console.error('Error analyzing transcription:', error);
            alert("Error al analizar la reunión.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTranscriptionComplete = async (text: string, durationSeconds: number = 60) => {
        setTranscript(text);

        try {
            await axios.post('/api/stats', {
                serviceType: 'transcription',
                durationSeconds: durationSeconds,
                projectName: tenantId
            });
            setStats(prev => ({
                files: typeof prev.files === 'number' ? prev.files + 1 : 1,
                minutes: typeof prev.minutes === 'number' ? prev.minutes + Math.round(durationSeconds / 60) : Math.round(durationSeconds / 60)
            }));
        } catch (error) {
            console.warn('No se pudo registrar la transcripción:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file, file.name);

        setIsLoading(true);

        try {
            const response = await axios.post(`/api/n8n-proxy?webhook=${clientConfig.webhooks.transcripSyn}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            let rawText = response.data.text || response.data.output || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

            if (rawText && rawText !== "{}") {
                handleTranscriptionComplete(rawText);
            } else {
                alert("Transcripción vacía.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error al subir el archivo.");
        } finally {
            setIsLoading(false);
            e.target.value = '';
        }
    };

    const handleYoutubeProcess = async () => {
        if (!youtubeUrl) return;
        setIsLoading(true);
        try {
            const response = await axios.post(`/api/n8n-proxy?webhook=${clientConfig.webhooks.transcripSyn}`, {
                youtube_url: youtubeUrl
            });
            const text = response.data.text || response.data.output || JSON.stringify(response.data);
            handleTranscriptionComplete(text);
        } catch (error) {
            console.error("Error processing YouTube URL:", error);
            alert("Error al procesar YouTube.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-8 overflow-y-auto custom-scrollbar">
            {!transcript ? (
                <div className="max-w-6xl mx-auto w-full">
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400">
                            TranscripSyn Superpowers
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Convierte tus reuniones en activos accionables. Transcripción en tiempo real, análisis agéntico y gestión de tareas en un solo lugar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/50 backdrop-blur-sm border-white/5" style={{ borderColor: theme.border }}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Minutos</h3>
                            <p className="text-3xl font-bold" style={{ color: theme.accent }}>{stats.minutes}</p>
                            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-bold">
                                <TrendingUp size={12} /> +12% vs mes anterior
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/50 backdrop-blur-sm border-white/5" style={{ borderColor: theme.border }}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Archivos</h3>
                            <p className="text-3xl font-bold" style={{ color: theme.accent }}>{stats.files}</p>
                            <p className="text-xs text-indigo-400 mt-2 font-bold">Audiencias y Consultas</p>
                        </div>
                        <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/50 backdrop-blur-sm border-white/5 lg:col-span-2" style={{ borderColor: theme.border }}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Estado del Sistema</h3>
                            <div className="flex items-center gap-4">
                                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm text-gray-300 font-medium">Neural Engine Online (Native)</span>
                                <span className="text-xs text-gray-500 ml-auto">Latencia: &lt; 100ms</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[98%]" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <AudioRecorder theme={theme} onTranscriptionComplete={handleTranscriptionComplete} />

                        <ScreenRecorder theme={theme} onDataExtracted={handleTranscriptionComplete} />

                        <div
                            className="p-8 rounded-3xl shadow-xl border flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-slate-900/40 border-white/5"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                            onClick={() => document.getElementById('audio-upload')?.click()}
                        >
                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 rotate-3 group-hover:rotate-0 transition-transform">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-xl mb-2" style={{ color: theme.text }}>
                                {isLoading ? "Analizando..." : "Subir Archivos"}
                            </h3>
                            <p className="text-sm text-gray-400">Procesa mp3, wav o llamadas grabadas en segundos.</p>
                            <input
                                id="audio-upload"
                                type="file"
                                className="hidden"
                                accept=".mp3,.wav,.mp4"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div
                            className="p-8 rounded-3xl shadow-xl border flex flex-col items-center justify-center text-center bg-slate-900/40 border-white/5"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br from-rose-500 to-red-600 -rotate-3 group-hover:rotate-0 transition-transform">
                                <Youtube className="w-8 h-8 text-white" />
                            </div>
                            <div className="w-full">
                                <h3 className="font-bold text-xl mb-3" style={{ color: theme.text }}>YouTube Link</h3>
                                <div className="flex w-full gap-2 p-1 rounded-xl bg-black/30 border border-white/5">
                                    <input
                                        type="text"
                                        placeholder="Pegar link aqui..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none"
                                        style={{ color: theme.text }}
                                    />
                                    <button
                                        onClick={handleYoutubeProcess}
                                        disabled={isLoading}
                                        className="px-4 py-2 rounded-lg font-bold text-xs transition-all hover:brightness-110 disabled:opacity-50 bg-indigo-600 text-white"
                                    >
                                        {isLoading ? "..." : "Importar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="font-bold text-lg">Inteligencia Agéntica</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">AgentSyn no solo transcribe, entiende el contexto de tu negocio, identifica a los participantes y extrae tareas automáticamente.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                                <CheckCircle2 size={20} />
                            </div>
                            <h4 className="font-bold text-lg">Gestión de Tareas</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">Olvídate de tomar notas. El sistema detecta compromisos y genera una lista de tareas lista para ser exportada a tu gestión de proyectos.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                <Users size={20} />
                            </div>
                            <h4 className="font-bold text-lg">Reportes Profesionales</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">Genera mapas mentales de la reunión y borradores de email de seguimiento en segundos, elevando tu profesionalismo ante clientes.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <FileText className="text-white" size={16} />
                            </div>
                            Resultados de TranscripSyn
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setTranscript(''); setAnalysis(null); }}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                            >
                                Nueva Grabación
                            </button>
                            <button
                                onClick={() => { setPendingInput(transcript); onNavigateToAgent(); }}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Chatear con Audio
                            </button>
                        </div>
                    </div>

                    {!analysis ? (
                        <div className="p-16 rounded-[2.5rem] border-2 border-dashed border-indigo-600/20 flex flex-col items-center justify-center text-center bg-indigo-600/5 backdrop-blur-sm">
                            <div className="w-24 h-24 rounded-full bg-indigo-600/10 flex items-center justify-center mb-6 relative">
                                <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Transcripción Completada</h3>
                            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">El texto está listo. Activa el análisis agéntico para extraer tesoros de esta conversación.</p>
                            <button
                                onClick={() => analyzeTranscription(transcript)}
                                disabled={isAnalyzing}
                                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-indigo-600 bg-[length:200%_auto] animate-gradient text-white font-bold text-xl hover:scale-105 transition-all disabled:opacity-50 shadow-2xl shadow-indigo-600/40"
                            >
                                {isAnalyzing ? "Iniciando Orquestador..." : "¡Darle Superpoderes!"}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 rounded-[2rem] border shadow-2xl bg-slate-900/40 backdrop-blur-md border-white/5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10">
                                            <FileText className="text-blue-400" size={20} />
                                        </div>
                                        Resumen Ejecutivo
                                    </h3>
                                    <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none text-lg">
                                        <ReactMarkdown>{analysis.summary || ''}</ReactMarkdown>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] border shadow-2xl bg-slate-900/40 backdrop-blur-md border-white/5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-rose-500/10">
                                            <Grid className="text-rose-400" size={20} />
                                        </div>
                                        Mapa Mental del Negocio
                                    </h3>
                                    {analysis.mermaid ? (
                                        <div className="bg-black/40 rounded-2xl p-2 border border-white/5 overflow-hidden">
                                            <Mermaid chart={analysis.mermaid} />
                                            <div className="flex items-center justify-center gap-4 mt-4 opacity-40">
                                                <div className="h-px w-12 bg-gray-600" />
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Visual Canvas Engine</p>
                                                <div className="h-px w-12 bg-gray-600" />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Mapa mental no disponible para esta sesión.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/60 backdrop-blur-md border-white/5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                                        <Users className="text-teal-400" size={20} />
                                        Participantes
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.attendees?.map((name, i) => (
                                            <span key={i} className="px-4 py-1.5 rounded-xl bg-teal-400/10 text-teal-400 text-sm font-medium border border-teal-400/20 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/60 backdrop-blur-md border-white/5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                                        <CheckCircle2 className="text-amber-400" size={20} />
                                        Action Items
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.tasks?.map((task, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-300 group">
                                                <div className="mt-1 flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-600 bg-transparent text-amber-500 focus:ring-amber-500"
                                                    />
                                                </div>
                                                <span className="group-hover:text-amber-200 transition-colors">{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 rounded-3xl border shadow-xl bg-slate-900/60 backdrop-blur-md border-white/5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <h3 className="text-lg font-bold mb-2 flex items-center gap-3">
                                        <Mail className="text-indigo-400" size={20} />
                                        Seguimiento
                                    </h3>
                                    <p className="text-[10px] text-gray-500 mb-4 uppercase font-bold tracking-tighter">Draft listo para enviar</p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(analysis.email || '');
                                            alert("Email copiado al portapapeles");
                                        }}
                                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Copy size={16} /> Copiar Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 rounded-[2rem] border bg-black/20" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fuentes / Raw Transcript</h3>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(transcript);
                                    alert("Transcripción copiada");
                                }}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                            >
                                Copiar Todo
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                            {transcript}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MarketSyn = ({ theme, initialData }: { theme: Theme, initialData?: { producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string } | null }) => (
    <LaunchPlanner
        theme={theme}
        webhooks={clientConfig.webhooks}
        companyInfo={clientConfig.companyInfo}
        initialData={initialData}
    />
);

// Note: SynCardsModule was redundant and removed.

const AdminDashboard = ({ theme, isDarkMode, toggleTheme, setLogo, setInitials }: { theme: Theme, isDarkMode: boolean, toggleTheme: () => void, setLogo: (l: string) => void, setInitials?: (i: string) => void }) => {
    // Tenant Scoping
    const [tenantId] = useState(() => {
        if (typeof window === 'undefined') return 'default';
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || 'default';
    });

    const getScopedKey = (key: string) => `${tenantId}_${key}`;

    // Estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem(getScopedKey('admin_auth')) === 'true';
    });
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Estados de configuración
    const [localInitials, setLocalInitials] = useState(() => {
        if (typeof window === 'undefined') return 'EJ';
        return localStorage.getItem(getScopedKey('app_initials')) || 'EJ';
    });
    const [logoPreview, setLogoPreview] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem(getScopedKey('app_logo')) || '';
    });
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const ADMIN_PASSWORD = 'admin123syn';

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem(getScopedKey('admin_auth'), 'true');
            setAuthError('');
        } else {
            setAuthError('Contraseña incorrecta');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem(getScopedKey('admin_auth'));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        // Guardar iniciales
        localStorage.setItem(getScopedKey('app_initials'), localInitials);
        if (setInitials) setInitials(localInitials);

        // Guardar logo
        if (logoPreview) {
            localStorage.setItem(getScopedKey('app_logo'), logoPreview);
            setLogo(logoPreview);
        }

        setSaveMessage('✅ Cambios guardados correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleIngest = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setUploadStatus('idle');

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        try {
            await axios.post('/api/n8n-ingest', formData);
            setUploadStatus('success');
            setFiles([]);
        } catch (e) {
            console.error(e);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    // Pantalla de contraseña
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto w-full p-8 mt-20">
                <div className="rounded-2xl shadow-lg p-8 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Acceso Restringido</h2>
                        <p className="text-sm opacity-60 mt-2" style={{ color: theme.text }}>
                            Panel solo para administración de Synergos
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="Ingrese contraseña de administrador"
                                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                    color: theme.text,
                                    '--tw-ring-color': theme.accent
                                } as any}
                            />
                        </div>

                        {authError && (
                            <p className="text-red-500 text-sm text-center">{authError}</p>
                        )}

                        <button
                            onClick={handleLogin}
                            className="w-full py-3 rounded-lg font-bold text-white transition-all hover:brightness-110"
                            style={{ backgroundColor: theme.primary }}
                        >
                            Acceder
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Panel de administración
    return (
        <div className="max-w-4xl mx-auto w-full p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold" style={{ color: theme.primary }}>
                        🔐 Panel de Administración
                    </h2>
                    <p className="mt-2 opacity-70" style={{ color: theme.text }}>Configuración avanzada del sistema</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full border shadow-sm transition-transform active:scale-95"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50"
                    >
                        Cerrar Sesión Admin
                    </button>
                </div>
            </div>

            {/* Configuración Visual */}
            <div className="rounded-2xl shadow-sm p-8 border mb-8" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: theme.text }}>
                    <Settings className="w-5 h-5" /> Configuración Visual
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo/Imagen */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                            Logo / Imagen (JPG, PNG, SVG)
                        </label>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <img src={logoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: theme.accent }} />
                            )}
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.svg,image/*"
                                onChange={handleLogoUpload}
                                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                style={{ color: theme.text }}
                            />
                        </div>
                        <p className="text-xs opacity-50 mt-2" style={{ color: theme.text }}>
                            Se mostrará en la esquina superior derecha
                        </p>
                    </div>

                    {/* Iniciales */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                            Iniciales (para el icono del menú)
                        </label>
                        <input
                            type="text"
                            value={localInitials}
                            onChange={(e) => setLocalInitials(e.target.value.toUpperCase().slice(0, 3))}
                            maxLength={3}
                            placeholder="EJ"
                            className="w-full p-3 rounded-lg border focus:outline-none text-2xl font-bold text-center"
                            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                        />
                        <p className="text-xs opacity-50 mt-2" style={{ color: theme.text }}>
                            Máximo 3 caracteres
                        </p>
                    </div>
                </div>

                {/* Botón Guardar Cambios */}
                <div className="mt-8 flex items-center gap-4">
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-3 rounded-lg font-bold text-white transition-all hover:brightness-110 shadow-md"
                        style={{ backgroundColor: '#22c55e' }}
                    >
                        💾 Guardar Cambios
                    </button>
                    {saveMessage && (
                        <span className="text-green-600 font-medium">{saveMessage}</span>
                    )}
                </div>
            </div>

            {/* Base de Conocimiento */}
            <div className="rounded-2xl shadow-sm p-8 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: theme.border }}>
                    <div className="p-4 rounded-xl bg-blue-50 text-blue-900">
                        <Database className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold" style={{ color: theme.text }}>Base de Conocimiento</h3>
                        <p className="opacity-70" style={{ color: theme.text }}>Suba documentos para entrenar la IA</p>
                    </div>
                </div>

                <div className="border-2 border-dashed rounded-xl p-12 text-center hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{ borderColor: theme.border }}>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.md,.txt,.rtf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                            if (e.target.files) setFiles(Array.from(e.target.files));
                            setUploadStatus('idle');
                        }}
                    />
                    <div className="group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: theme.text }} />
                    </div>
                    <p className="text-lg font-medium" style={{ color: theme.text }}>Arrastre documentos aquí o haga clic</p>
                    <p className="text-sm mt-2 opacity-50" style={{ color: theme.text }}>
                        PDF, Word (.doc, .docx), Markdown (.md), Texto (.txt)
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <div className="rounded-xl p-4 border" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                            <p className="font-bold text-sm mb-3 uppercase tracking-wider opacity-70" style={{ color: theme.text }}>Archivos listos:</p>
                            <div className="space-y-2">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg border"
                                        style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
                                        <FileText className="w-4 h-4 text-blue-500" /> {f.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleIngest}
                            disabled={uploading}
                            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:brightness-110 disabled:opacity-50 shadow-lg"
                            style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                </span>
                            ) : (
                                "Subir a Base de Conocimiento"
                            )}
                        </button>
                    </div>
                )}

                {uploadStatus === 'success' && (
                    <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 border border-green-100">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold">¡Ingesta Exitosa!</p>
                            <p className="text-sm">Los documentos han sido indexados correctamente.</p>
                        </div>
                    </div>
                )}

                {uploadStatus === 'error' && (
                    <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-center gap-3 border border-red-100">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold">Error de Ingesta</p>
                            <p className="text-sm">Verifique la conexión con el servidor N8N.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Mis Documentos Component ---
interface SavedDocument {
    id: number;
    title: string;
    document_type: string;
    created_at: string;
    content?: string;
}

const MisDocumentos = ({ theme, tenantId }: { theme: Theme, tenantId: string }) => {
    const [documents, setDocuments] = useState<SavedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
    const [viewContent, setViewContent] = useState<string>('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(`/api/documents?projectName=${tenantId}`);
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewDocument = async (doc: SavedDocument) => {
        try {
            const response = await axios.get(`/api/documents?id=${doc.id}`);
            setSelectedDoc(response.data.document);
            setViewContent(response.data.document.content || '');
        } catch (error) {
            console.error('Error fetching document:', error);
            alert('Error al cargar el documento');
        }
    };

    const downloadAsDocx = async (content: string, title: string) => {
        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: content.split('\n').map(line => new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 200 }
                    })),
                }],
            });
            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating DOCX:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (selectedDoc) {
        return (
            <div className="max-w-4xl mx-auto w-full p-8">
                <button
                    onClick={() => setSelectedDoc(null)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg border"
                    style={{ borderColor: theme.border, color: theme.text }}
                >
                    ← Volver a la lista
                </button>

                <div className="rounded-2xl shadow-sm p-8 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: theme.text }}>{selectedDoc.title}</h2>
                            <p className="text-sm opacity-60" style={{ color: theme.text }}>
                                Creado: {formatDate(selectedDoc.created_at)}
                            </p>
                        </div>
                        <button
                            onClick={() => downloadAsDocx(viewContent, selectedDoc.title)}
                            className="px-4 py-2 rounded-lg font-bold text-white"
                            style={{ backgroundColor: '#22c55e' }}
                        >
                            ⬇️ Descargar DOCX
                        </button>
                    </div>

                    <div className="p-4 rounded-lg border overflow-auto max-h-[60vh]" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                        <pre className="whitespace-pre-wrap text-sm" style={{ color: theme.text }}>
                            {viewContent}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: theme.primary }}>
                    <FileText className="w-8 h-8" />
                    Mis Documentos
                </h2>
                <p className="mt-2 opacity-70" style={{ color: theme.text }}>
                    Documentos legales generados y guardados
                </p>
            </div>

            <div className="rounded-2xl shadow-sm p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                {loading ? (
                    <div className="text-center py-12 opacity-60" style={{ color: theme.text }}>
                        Cargando documentos...
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 opacity-60" style={{ color: theme.text }}>
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No hay documentos guardados</p>
                        <p className="text-sm mt-2">Los documentos que genere se guardarán automáticamente aquí</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="p-4 rounded-xl border flex items-center justify-between hover:opacity-80 cursor-pointer transition-opacity"
                                style={{ backgroundColor: theme.background, borderColor: theme.border }}
                                onClick={() => viewDocument(doc)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: theme.primary + '20' }}>
                                        <FileText className="w-5 h-5" style={{ color: theme.primary }} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold" style={{ color: theme.text }}>{doc.title}</h4>
                                        <p className="text-sm opacity-60" style={{ color: theme.text }}>
                                            {formatDate(doc.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                                    Ver →
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Cloned ---

// --- Main App Cloned ---

function Page() {
    const [activeModule, setActiveModule] = useState<Module>('agent');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingInput, setPendingInput] = useState<string>('');
    const [marketSynData, setMarketSynData] = useState<{ producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string } | null>(null);
    const [meetingUrl, setMeetingUrl] = useState<string>('');

    // Tenant Scoping
    const [tenantId] = useState(() => {
        if (typeof window === 'undefined') return 'default';
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || 'default';
    });

    const getScopedKey = (key: string) => `${tenantId}_${key}`;

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const token = localStorage.getItem(getScopedKey('session_token'));
        if (token) {
            setIsAuthenticated(true);
        }
        setIsAuthLoading(false);
    }, [tenantId]);

    // Handler for MarketSyn trigger from AgentSyn orchestrator
    const handleMarketSynTrigger = (data: { producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string }) => {
        if (!isAuthenticated) {
            setShowLogin(true);
            return;
        }
        console.log('🚀 Switching to MarketSyn with data:', data);
        setMarketSynData(data);
        setActiveModule('marketing');
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem(getScopedKey('app_theme'));
        return saved === null ? true : saved === 'dark';
    });
    const [logo, setLogo] = useState(() => {
        if (typeof window === 'undefined') return clientConfig.logoPath;
        return localStorage.getItem(getScopedKey('app_logo')) || clientConfig.logoPath;
    });
    const [initials, setInitials] = useState(() => {
        if (typeof window === 'undefined') return 'SY';
        return localStorage.getItem(getScopedKey('app_initials')) || 'SY';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(getScopedKey('app_theme'), isDarkMode ? 'dark' : 'light');
        }
    }, [isDarkMode, tenantId]);

    // Generar SessionID único al cargar la página para evitar mezcla de contextos
    const [sessionId] = useState(() => `${tenantId}-session-${Math.random().toString(36).substr(2, 9)}`);

    const theme = isDarkMode ? darkTheme : lightTheme;

    // Check if module is enabled in config
    const isModuleEnabled = (moduleName: string): boolean => {
        const modules = (clientConfig as any).modules;
        if (!modules) return true; // If no modules config, assume all enabled
        return modules[moduleName] !== false;
    };

    const handleRequestDemo = () => {
        setShowLogin(true);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setShowLogin(false);
    };

    const renderContent = () => {
        if (!isAuthenticated) {
            // Guest Mode always shows AgentSyn
            return <AgentSyn
                sessionId={sessionId}
                tenantId={tenantId}
                theme={theme}
                isDarkMode={isDarkMode}
                pendingInput={pendingInput}
                onClearPendingInput={() => setPendingInput('')}
                onMarketSynTrigger={handleMarketSynTrigger}
                onTranscripSynTrigger={(url) => {
                    if (!isAuthenticated) {
                        setShowLogin(true);
                        return;
                    }
                    if (url) setMeetingUrl(url);
                    setActiveModule('transcription');
                }}
                onRequestDemo={handleRequestDemo}
            />;
        }

        if (activeModule === 'admin') {
            return <AdminDashboard theme={theme} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} setLogo={setLogo} setInitials={setInitials} />;
        }

        switch (activeModule) {
            case 'agent':
                if (!isModuleEnabled('agentSyn')) {
                    return <ModuleNotActivated moduleName="AgentSyn - Asistente IA" theme={theme} />;
                }
                return <AgentSyn
                    sessionId={sessionId}
                    tenantId={tenantId}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    pendingInput={pendingInput}
                    onClearPendingInput={() => setPendingInput('')}
                    onMarketSynTrigger={handleMarketSynTrigger}
                    onTranscripSynTrigger={(url) => {
                        if (url) setMeetingUrl(url);
                        setActiveModule('transcription');
                    }}
                />;
            case 'transcription':
                if (!isModuleEnabled('transcripSyn')) {
                    return <ModuleNotActivated moduleName="TranscripSyn - Transcripcion" theme={theme} />;
                }
                return <TranscripSyn
                    theme={theme}
                    meetingUrl={meetingUrl}
                    setPendingInput={setPendingInput}
                    onNavigateToAgent={() => setActiveModule('agent')}
                />;
            case 'marketing':
                if (!isModuleEnabled('marketSyn')) {
                    return <ModuleNotActivated moduleName="MarketSyn - Marketing IA" theme={theme} />;
                }
                return <MarketSyn theme={theme} initialData={marketSynData} />;
            case 'syncards':
                if (!isModuleEnabled('synCards')) {
                    return <ModuleNotActivated moduleName="SynCards - Tarjetas Digitales" theme={theme} />;
                }
                return <SynCards theme={theme} webhooks={clientConfig.webhooks} tenantId={tenantId} />;
            case 'documents':
                return <MisDocumentos theme={theme} tenantId={tenantId} />;
            default:
                return <AgentSyn
                    sessionId={sessionId}
                    tenantId={tenantId}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    pendingInput={pendingInput}
                    onClearPendingInput={() => setPendingInput('')}
                    onMarketSynTrigger={handleMarketSynTrigger}
                    onTranscripSynTrigger={(url) => {
                        if (url) setMeetingUrl(url);
                        setActiveModule('agent');
                    }}
                />;
        }
    };

    if (isAuthLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.accent }}></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 relative"
            style={{ backgroundColor: theme.background, color: theme.text }}>

            <Sidebar
                activeModule={activeModule}
                onModuleChange={setActiveModule}
                isOpen={isMobileMenuOpen}
                closeSidebar={() => setIsMobileMenuOpen(false)}
                isAuthenticated={isAuthenticated}
                tenantId={tenantId}
                onLoginClick={() => setShowLogin(true)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                <Header
                    toggleSidebar={() => setIsMobileMenuOpen(true)}
                    isDarkMode={isDarkMode}
                    toggleTheme={() => setIsDarkMode(!isDarkMode)}
                    logo={logo}
                    initials={initials}
                />

                <main className="flex-1 overflow-y-auto relative w-full">
                    {renderContent()}
                </main>
            </div>

            {/* Lead Gate / Login Overlay */}
            {showLogin && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="w-full max-w-md relative">
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <Login
                            onLogin={handleLoginSuccess}
                            theme={theme}
                            isDarkMode={isDarkMode}
                            toggleTheme={() => setIsDarkMode(!isDarkMode)}
                            tenantId={tenantId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;






// Force rebuild 01/08/2026 10:30:51
