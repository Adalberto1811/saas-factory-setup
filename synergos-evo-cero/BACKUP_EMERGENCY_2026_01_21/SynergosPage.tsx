import LaunchPlanner from './components/LaunchPlanner';
import SynCards from './components/SynCards';
import ModuleNotActivated from './components/ModuleNotActivated';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Settings, MessageSquare, User, Upload, FileText, Check, AlertCircle, Database,
    Mic, BarChart3, Lock, LogOut, Sun, Moon, Video, Youtube, Monitor, Play, X, CreditCard, Nfc, Menu, Mail, MessageCircle
} from 'lucide-react';


import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AudioRecorder from './components/AudioRecorder';
import ScreenRecorder from './components/ScreenRecorder';
import axios from 'axios';
import { clientConfig } from './config/synergos-config';
import { AuthGuard } from './components/AuthGuard';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun } from 'docx';
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
    accent: '#38BDF8',  // Sky 400 (Neon Blue)
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
    onTranscripSynTrigger
}: {
    sessionId: string,
    theme: Theme,
    isDarkMode: boolean,
    pendingInput?: string,
    onClearPendingInput?: () => void,
    onMarketSynTrigger?: (data: { producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string }) => void,
    onTranscripSynTrigger?: (url?: string) => void
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
                // Handle silent video as a system notification, not user input
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "⚠️ **Aviso del Sistema:** He detectado que compartiste tu pantalla sin audio. Estoy listo para analizar el contenido visual si me das instrucciones.",
                    timestamp: new Date()
                }]);
            } else {
                setInputMessage(pendingInput);
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
                    projectName: 'etna-moros'
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

    const handleSendMessage = async () => {
        // 1. Validación básica
        if (!inputMessage.trim() && !selectedFile) return;

        // 2. Crear mensaje visual para el usuario
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
            // file: selectedFile ? { name: selectedFile.name, size: selectedFile.size } : undefined
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setSelectedFile(null);
        setIsTyping(true);

        try {
            // AGENTE SYNERGOS: Usa Gemini Flash con body.chatInput
            const formData = new FormData();
            formData.append('chatInput', newMessage.content);
            formData.append('sessionId', sessionId);

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            // Envío via proxy
            const response = await axios.post(
                `/api/n8n-proxy?webhook=${clientConfig.webhooks.agentSyn}`,
                formData
            );

            // 6. Procesar respuesta del Agente
            console.log("N8N Response Raw:", response.data); // Debug log

            let botContent = "";

            // Helper function to extract text from an object
            const extractText = (obj: any): string | null => {
                if (obj.output) return obj.output;
                if (obj.text) return obj.text;
                if (obj.message) return obj.message;
                // Fallback: find first string value
                const values = Object.values(obj);
                const stringValue = values.find(v => typeof v === 'string');
                return (stringValue as string) || null;
            };

            // Handle Array response (N8N often returns arrays)
            if (Array.isArray(response.data) && response.data.length > 0) {
                botContent = extractText(response.data[0]) || "";
            } else if (typeof response.data === 'object') {
                botContent = extractText(response.data) || "";
            } else if (typeof response.data === 'string') {
                botContent = response.data;
            }

            // Fallback if still empty: Dump the raw JSON so the user can see what happened
            if (!botContent || botContent.trim() === "") {
                console.warn("Empty content extracted. Raw data:", response.data);
                botContent = JSON.stringify(response.data, null, 2); // Show raw JSON to debug
                if (botContent === "{}") botContent = "⚠️ Error: N8N devolvió un objeto vacío.";
            }

            // CLEANING: Remove "User: ... Assistant:" echoes if the LLM is hallucinating chat history
            // This is a heuristic to fix "sale todo lo que pregunta"
            if (botContent.includes("User:") && botContent.includes("Assistant:")) {
                const split = botContent.split("Assistant:");
                if (split.length > 1) {
                    botContent = split[split.length - 1].trim(); // Take the last part after "Assistant:"
                }
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: botContent,
                role: 'assistant',
                timestamp: new Date(),
                downloadLink: response.data?.downloadLink || (Array.isArray(response.data) ? response.data[0]?.downloadLink : undefined),
                fileName: response.data?.fileName || (Array.isArray(response.data) ? response.data[0]?.fileName : undefined)
            };

            setMessages(prev => [...prev, botResponse]);

            // ISOLATE DOCUMENT based on Key Phrase
            const keyPhrase = "El documento estratégico ha sido finalizado. Puede guardarlo para su revisión.";
            if (botContent.includes(keyPhrase)) {
                setFinalDocumentText(botContent);
            }

            // ORCHESTRATOR: Detect [[MARKETSYN]] tag and trigger module switch
            if (botContent.includes('[[MARKETSYN]]') && onMarketSynTrigger) {
                try {
                    // Extract JSON from response
                    const jsonMatch = botContent.match(/\{[\s\S]*?\}/)
                    if (jsonMatch) {
                        const marketData = JSON.parse(jsonMatch[0]);
                        console.log('🎯 MarketSyn detected! Data:', marketData);

                        // Add system message about switching modules
                        const switchMsg: Message = {
                            id: (Date.now() + 2).toString(),
                            content: `🚀 **Detectado: Solicitud de Estrategia de Marketing**\n\nPreparando MarketSyn con:\n- **Producto:** ${marketData.producto}\n- **Precio:** ${marketData.precioNormal} → ${marketData.precioOferta}\n- **Dolor:** ${marketData.dolor}\n\n*Cambiando a MarketSyn...*`,
                            role: 'assistant',
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, switchMsg]);

                        // Trigger module switch after a short delay
                        setTimeout(() => {
                            onMarketSynTrigger(marketData);
                        }, 2000);
                    }
                } catch (parseError) {
                    console.warn('Could not parse MarketSyn JSON:', parseError);
                }
            }

            // ORCHESTRATOR: Detect [[TRANSCRIPSYN]] tag to record meetings
            if (botContent.includes('[[TRANSCRIPSYN]]') && onTranscripSynTrigger) {
                const urlMatch = botContent.match(/https?:\/\/[^\s\]]+/);
                const meetingUrl = urlMatch ? urlMatch[0] : undefined;

                const switchMsg: Message = {
                    id: (Date.now() + 3).toString(),
                    content: `🎙️ **Preparando Grabación de Reunión**\n\nPasando el control a TranscripSyn...`,
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, switchMsg]);

                setTimeout(() => {
                    onTranscripSynTrigger(meetingUrl);
                }, 1500);
            }

        } catch (error) {
            console.error('Error N8N:', error);
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
            <div className={`flex-1 overflow-y-auto space-y-6 p-6 rounded-2xl mb-6 shadow-sm border ${!isDarkMode ? 'bg-slate-50' : ''}`}
                style={isDarkMode ? { backgroundColor: theme.card, borderColor: theme.border } : { borderColor: theme.border }}>

                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border overflow-hidden p-1 shadow-xl"
                            style={{ backgroundColor: theme.background, borderColor: theme.accent }}>
                            <img
                                src="/fabrica-ene26/logo-synergos.jpg"
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
                        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm max-w-sm">
                            ✨ **¿Listo para escalar?** Pregúntame cómo podemos multiplicar tus resultados hoy mismo o agenda tu **Consulta Estratégica Gratuita**.
                        </div>
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
                                border: `1px solid ${theme.border}`,
                                color: theme.text
                            } : {
                                backgroundColor: '#EEF2FF', // bg-indigo-50/60 (approx)
                                borderColor: '#E0E7FF', // border-indigo-100
                                borderWidth: '1px',
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
                className={`p-4 rounded-2xl shadow-lg border flex items-center gap-4 transition-all ${!isDarkMode
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
                    onClick={handleSendMessage}
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
        </div>
    );
};

const TranscripSyn = ({ theme, meetingUrl, setPendingInput, onNavigateToAgent }: { theme: Theme, meetingUrl?: string, setPendingInput: (text: string) => void, onNavigateToAgent: () => void }) => {
    const [youtubeUrl, setYoutubeUrl] = useState(meetingUrl || '');
    const [stats, setStats] = useState<{ files: number | string, minutes: number | string }>({ files: 0, minutes: 0 });
    const [isLoading, setIsLoading] = useState(false);

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

    const handleTranscriptionComplete = async (text: string, durationSeconds: number = 60) => {
        // Registrar la transcripción en estadísticas
        try {
            await axios.post('/api/stats', {
                serviceType: 'transcription',
                durationSeconds: durationSeconds,
                projectName: 'etna-moros'
            });
            // Actualizar contadores locales
            setStats(prev => ({
                files: typeof prev.files === 'number' ? prev.files + 1 : 1,
                minutes: typeof prev.minutes === 'number' ? prev.minutes + Math.round(durationSeconds / 60) : Math.round(durationSeconds / 60)
            }));
        } catch (error) {
            console.warn('No se pudo registrar la transcripción:', error);
        }

        setPendingInput(text);
        onNavigateToAgent();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        // Explicitly append filename to ensure N8N detects it correctly
        formData.append('file', file, file.name);

        setIsLoading(true);

        try {
            // Usar proxy API para evitar CORS
            const response = await axios.post(`/api/n8n-proxy?webhook=${clientConfig.webhooks.transcripSyn}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Robust response parsing (copied from AudioRecorder)
            let rawText = "";
            if (response.data.text) {
                rawText = response.data.text;
            } else if (response.data.output) {
                rawText = response.data.output;
            } else if (typeof response.data === 'string') {
                rawText = response.data;
            } else {
                rawText = JSON.stringify(response.data);
            }

            if (rawText && rawText !== "{}") {
                handleTranscriptionComplete(rawText);
            } else {
                alert("El archivo se subió, pero la transcripción llegó vacía. Verifique que el audio sea claro.");
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
            // Usar proxy API para evitar CORS
            const response = await axios.post(`/api/n8n-proxy?webhook=${clientConfig.webhooks.transcripSyn}`, {
                youtube_url: youtubeUrl
            });

            if (response.data.text) {
                handleTranscriptionComplete(response.data.text);
            } else if (response.data.output) {
                handleTranscriptionComplete(response.data.output);
            } else {
                handleTranscriptionComplete(JSON.stringify(response.data));
            }
        } catch (error) {
            console.error("Error processing YouTube URL:", error);
            alert("Error al procesar el video de YouTube.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl border shadow-md" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>Minutos Transcritos</h3>
                    <p className="text-4xl font-bold" style={{ color: theme.accent }}>{stats.minutes}</p>
                    <p className="text-sm opacity-60" style={{ color: theme.text }}>+0% este mes</p>
                </div>
                <div className="p-6 rounded-2xl border shadow-md" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>Archivos Procesados</h3>
                    <p className="text-4xl font-bold" style={{ color: theme.accent }}>{stats.files}</p>
                    <p className="text-sm opacity-60" style={{ color: theme.text }}>Audiencias y Dictados</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Card 1: Voice Recorder */}
                <AudioRecorder theme={theme} onTranscriptionComplete={handleTranscriptionComplete} />

                {/* Card 2: Screen Share */}
                <ScreenRecorder theme={theme} onDataExtracted={handleTranscriptionComplete} />

                {/* Card 3: File Upload */}
                <div
                    className="p-6 rounded-3xl shadow-md border flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    onClick={() => document.getElementById('audio-upload')?.click()}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: '#16A34A' }}> {/* Green-600 */}
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: theme.text }}>
                        {isLoading ? "Analizando..." : "Subir Archivos"}
                    </h3>
                    <p className="text-sm opacity-60" style={{ color: theme.text }}>.mp3, .wav, .mp4</p>
                    <input
                        id="audio-upload"
                        type="file"
                        className="hidden"
                        accept=".mp3,.wav,.mp4"
                        onChange={handleFileUpload}
                    />
                </div>

                {/* Card 4: YouTube Import */}
                <div
                    className="p-6 rounded-3xl shadow-md border flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: '#DC2626' }}> {/* Red-600 */}
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>

                    <div className="w-full">
                        <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>YouTube Import</h3>
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                placeholder="URL..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="flex-1 p-2 rounded-lg border bg-transparent text-sm focus:outline-none"
                                style={{ borderColor: theme.border, color: theme.text }}
                            />
                            <button
                                onClick={handleYoutubeProcess}
                                disabled={isLoading}
                                className="p-2 rounded-lg font-bold text-sm transition-colors hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: theme.primary, color: '#fff' }}>
                                {isLoading ? "..." : "Procesar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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

const SynCardsModule = ({ theme }: { theme: Theme }) => (
    <SynCards
        theme={theme}
        webhooks={clientConfig.webhooks}
    />
);

const AdminDashboard = ({ theme, isDarkMode, toggleTheme, setLogo, setInitials }: { theme: Theme, isDarkMode: boolean, toggleTheme: () => void, setLogo: (l: string) => void, setInitials?: (i: string) => void }) => {
    // Estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('admin_auth') === 'true';
    });
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Estados de configuración
    const [localInitials, setLocalInitials] = useState(() => {
        if (typeof window === 'undefined') return 'EJ';
        return localStorage.getItem('app_initials') || 'EJ';
    });
    const [logoPreview, setLogoPreview] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('app_logo') || '';
    });
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const ADMIN_PASSWORD = 'admin123syn';

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Contraseña incorrecta');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
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
        localStorage.setItem('app_initials', localInitials);
        if (setInitials) setInitials(localInitials);

        // Guardar logo
        if (logoPreview) {
            localStorage.setItem('app_logo', logoPreview);
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

const MisDocumentos = ({ theme }: { theme: Theme }) => {
    const [documents, setDocuments] = useState<SavedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
    const [viewContent, setViewContent] = useState<string>('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('/api/documents?projectName=etna-moros');
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

function Page() {
    const [activeModule, setActiveModule] = useState<Module>('agent');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingInput, setPendingInput] = useState<string>('');
    const [marketSynData, setMarketSynData] = useState<{ producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string } | null>(null);
    const [meetingUrl, setMeetingUrl] = useState<string>('');

    // Handler for MarketSyn trigger from AgentSyn orchestrator
    const handleMarketSynTrigger = (data: { producto: string; precioNormal: string; precioOferta: string; dolor: string; publico: string }) => {
        console.log('🚀 Switching to MarketSyn with data:', data);
        setMarketSynData(data);
        setActiveModule('marketing');
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('app_theme');
        return saved === 'dark';
    });
    const [logo, setLogo] = useState(() => {
        if (typeof window === 'undefined') return clientConfig.logoPath;
        return localStorage.getItem('app_logo') || clientConfig.logoPath;
    });
    const [initials, setInitials] = useState(() => {
        if (typeof window === 'undefined') return 'SY';
        return localStorage.getItem('app_initials') || 'SY';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_theme', isDarkMode ? 'dark' : 'light');
        }
    }, [isDarkMode]);

    // Generar SessionID único al cargar la página para evitar mezcla de contextos
    const [sessionId] = useState(() => `session-${Math.random().toString(36).substr(2, 9)}`);

    const theme = isDarkMode ? darkTheme : lightTheme;

    // Check if module is enabled in config
    const isModuleEnabled = (moduleName: string): boolean => {
        const modules = (clientConfig as any).modules;
        if (!modules) return true; // If no modules config, assume all enabled
        return modules[moduleName] !== false;
    };

    const renderContent = () => {
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
                return <SynCards theme={theme} webhooks={clientConfig.webhooks} />;
            case 'documents':
                return <MisDocumentos theme={theme} />;
            default:
                return <AgentSyn
                    sessionId={sessionId}
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

    return (
        <AuthGuard theme={theme} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)}>
            <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300"
                style={{ backgroundColor: theme.background, color: theme.text }}>
                {/* Sidebar */}
                <Sidebar
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                    isOpen={isMobileMenuOpen}
                    closeSidebar={() => setIsMobileMenuOpen(false)}
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
            </div>
        </AuthGuard>
    );
}

export default Page;






// Force rebuild 01/08/2026 10:30:51
