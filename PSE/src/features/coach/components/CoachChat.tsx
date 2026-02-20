"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { Send, User, Bot, Sparkles, Activity, Image as ImageIcon, Video, X, Waves, Target, Lock, Zap, Apple, Dumbbell, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw"; // Removed to prevent HierarchyRequestError
import { psePaymentConfig } from '@/shared/config/pse-payment-config';
import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { useSession } from 'next-auth/react';

export function CoachChat() {
    const [userRole, setUserRole] = useState<string>("user");
    const [coachRole, setCoachRole] = useState<'principal'>('principal');
    const [selectedImage, setSelectedImage] = useState<{ base64: string; mime: string } | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<{ base64: string; mime: string } | null>(null);
    const [isTrimming, setIsTrimming] = useState(false);
    // Ahora empieza DESBLOQUEADO - el paywall se activa desde el backend si excedió límites
    const [isLocked, setIsLocked] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'none' | 'binance' | 'meru'>('none');
    const [localInput, setLocalInput] = useState('');
    const [failureCount, setFailureCount] = useState(0);
    const [isSupportRequested, setIsSupportRequested] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: authSession } = useSession();
    const chat = useChat({
        api: '/performance/api/coach',
        initialMessages: [
            {
                id: '1',
                role: 'assistant',
                content: "¡Hola! 🏊‍♂️ Bienvenido a Performance Swimming Evolution.\n\nAquí creemos que *porque tú eres único, tu plan también debe serlo*. Soy tu Coach y voy a diseñar un programa 100% individualizado para ti.\n\n¿Cómo te llamas?",
            },
        ],
    });

    const { messages, isLoading, append, reload, stop } = chat;

    // Efecto para inyectar el saludo personalizado si el usuario está autenticado
    useEffect(() => {
        if (authSession?.user?.name && messages.length === 1) {
            const currentContent = messages[0].content;
            if (currentContent.includes('¿Cómo te llamas?') || currentContent.includes('¡Hola!')) {
                const firstName = authSession.user.name.split(' ')[0];
                const personalizedGreeting = `¡Hola, ${firstName}! 🏊‍♂️ Bienvenido de nuevo a Performance Swimming Evolution.\n\nHe detectado tu perfil de élite. Estamos listos para continuar con tu evolución. ¿En qué microciclo nos enfocamos hoy?`;

                chat.setMessages([
                    {
                        id: '1',
                        role: 'assistant',
                        content: personalizedGreeting,
                    }
                ]);
            }
        }
    }, [authSession?.user?.name, messages.length]);

    useEffect(() => {
        // Recognition logic & Proactive Trial Check
        const checkStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('success')) {
                setIsLocked(false);
                window.history.replaceState({}, '', window.location.pathname);
                alert("¡Evolución Activada! Acceso Pro verificado.");
                return;
            }

            // Si está autenticado, verificar si debe estar bloqueado
            try {
                const res = await fetch('/performance/api/coach', {
                    method: 'POST',
                    body: JSON.stringify({ query: 'PING_STATUS_CHECK', history: [] })
                });
                const data = await res.json();
                if (data.response && data.response.includes(' microciclos gratuitos')) {
                    setIsLocked(true);
                }
            } catch (e) {
                console.warn("Status check failed, defaulting to open trial.");
            }
        };

        checkStatus();
    }, []);

    useEffect(() => {
        // 1. Check for Direct Admin Access Token
        const params = new URLSearchParams(window.location.search);
        const access = params.get('access');
        if (access === 'pse_admin_2026') {
            setUserRole('admin');
            return;
        }

        // 2. Standard Session Check (from hook)
        if (authSession?.user?.email) {
            const adminEmails = ['adalberto1811@gmail.com', 'damien87hg@gmail.com', 'adalberto@pse-atleta.com'];
            if (adminEmails.includes(authSession.user.email)) {
                setUserRole('admin');
            }
        }
    }, [authSession]);

    // Listen for global triggers from sidebar
    useEffect(() => {
        const handleUploadTrigger = () => fileInputRef.current?.click();
        const handleVideoTrigger = () => videoInputRef.current?.click();

        window.addEventListener('PSE_TRIGGER_UPLOAD', handleUploadTrigger);
        window.addEventListener('PSE_TRIGGER_VIDEO', handleVideoTrigger);

        return () => {
            window.removeEventListener('PSE_TRIGGER_UPLOAD', handleUploadTrigger);
            window.removeEventListener('PSE_TRIGGER_VIDEO', handleVideoTrigger);
        };
    }, []);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }

        // Detectar mensaje de paywall desde el backend
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage?.content) {
            const content = lastMessage.content.toLowerCase();
            // El backend envía este mensaje específico cuando el trial termina
            if (content.includes('2 microciclos gratuitos') &&
                content.includes('pago') &&
                content.includes('suscripción')) {
                setIsLocked(true);
            }
        }
    }, [messages]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage({
                base64: reader.result as string,
                mime: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const handleVideoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsTrimming(true);
        try {
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(file);
            videoElement.muted = true;
            videoElement.playsInline = true;

            await new Promise((resolve) => {
                videoElement.onloadedmetadata = resolve;
            });

            // Si dura menos de 10s, enviamos completo
            if (videoElement.duration <= 10) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedVideo({
                        base64: reader.result as string,
                        mime: file.type
                    });
                    setIsTrimming(false);
                };
                reader.readAsDataURL(file);
                return;
            }

            // Recorte a 10s usando MediaRecorder y captureStream
            const stream = (videoElement as any).captureStream ? (videoElement as any).captureStream() : (videoElement as any).mozCaptureStream();
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedVideo({
                        base64: reader.result as string,
                        mime: 'video/webm'
                    });
                    setIsTrimming(false);
                };
                reader.readAsDataURL(blob);
            };

            recorder.start();
            videoElement.play();

            setTimeout(() => {
                recorder.stop();
                videoElement.pause();
                URL.revokeObjectURL(videoElement.src);
            }, 10000);

        } catch (error) {
            console.error("Video trimming error:", error);
            setIsTrimming(false);
        }
    };

    const handleSendSupportRequest = async () => {
        if (isSupportRequested) return;

        try {
            const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
            const res = await fetch('/performance/api/pwa/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: lastAssistantMsg?.content || "El usuario solicita ayuda tras varios intentos del Coach.",
                    type: 'escalation'
                })
            });

            if (res.ok) {
                setIsSupportRequested(true);
                alert("¡Solicitud enviada al Coach Adalberto! Recibirás una notificación pronto. 🚀");
            }
        } catch (error) {
            console.error("Failed to send support request:", error);
        }
    };

    const handleApplyCode = async () => {
        if (!promoCode.trim() || promoLoading) return;

        setPromoLoading(true);
        try {
            const res = await fetch('/performance/api/subscription/apply-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode.trim() })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Código aplicado correctamente.");
                setPromoCode("");
                setIsLocked(false);
                // Forzar refresco de estado
                window.location.reload();
            } else {
                alert(data.error || "Error al aplicar el código.");
            }
        } catch (error) {
            console.error("Promo code error:", error);
            alert("Error de conexión al aplicar el código.");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleSend = async () => {
        if (!localInput.trim() && !selectedImage && !selectedVideo || isLoading || effectiveIsLocked) return;

        const currentInput = localInput;
        setLocalInput('');

        const bodyPayload = {
            access: new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('access'),
            isAdminBypass: userRole === 'admin',
            name: userRole === 'admin' ? 'Adalberto' : undefined,
            coachRole: coachRole
        };

        try {
            if (selectedImage || selectedVideo) {
                await append({
                    role: 'user',
                    content: currentInput || (selectedVideo ? "Analiza este video de técnica." : "Analiza esta imagen.")
                }, {
                    data: {
                        image: selectedImage?.base64 || null,
                        video: selectedVideo?.base64 || null,
                        mimeType: selectedImage?.mime || selectedVideo?.mime || null
                    } as any,
                    body: bodyPayload
                });
                setSelectedImage(null);
                setSelectedVideo(null);
            } else {
                await append({
                    role: 'user',
                    content: currentInput
                }, {
                    body: bodyPayload
                });
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setLocalInput(currentInput); // Restaurar en caso de fallo
        }
    };

    const videoInputRef = useRef<HTMLInputElement>(null);

    const effectiveIsLocked = isLocked && (userRole !== 'admin' || isPreviewMode);

    const coachConfig = {
        principal: { icon: Bot, name: 'Coach Alvin', color: 'text-synergos-electric-blue', bg: 'bg-synergos-electric-blue/10' },
        nutri: { icon: Apple, name: 'Nutricionista', color: 'text-synergos-neon-green', bg: 'bg-synergos-neon-green/10' },
        fisico: { icon: Dumbbell, name: 'Preparador Físico', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        psico: { icon: Brain, name: 'Psicólogo', color: 'text-synergos-red', bg: 'bg-synergos-red/10' }
    };

    return (
        <div className="flex flex-col h-full relative z-10">

            {/* Admin Toggle ... */}
            {/* Admin Toggle - Secret floating button */}
            {userRole === 'admin' && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                    <button
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-2 border ${isPreviewMode
                            ? "bg-synergos-neon-green text-black border-synergos-neon-green shadow-[0_0_30px_rgba(57,255,20,0.4)]"
                            : "bg-black/80 text-synergos-electric-blue border-synergos-electric-blue/30 hover:border-synergos-electric-blue"
                            }`}
                    >
                        <Zap className={`w-3 h-3 ${isPreviewMode ? "fill-black" : "fill-synergos-electric-blue"}`} />
                        {isPreviewMode ? "Vista: Atleta (Lock)" : "Vista: Admin (Unlock)"}
                    </button>
                    <button
                        onClick={() => {
                            setLocalInput("Coach, tengo un problema técnico y necesito ayuda de soporte.");
                            // handleSend() will be triggered by manual click or enter
                        }}
                        className="px-4 py-2 bg-synergos-red/20 text-synergos-red rounded-xl text-[9px] font-black border border-synergos-red/30 backdrop-blur-md flex items-center gap-2 hover:bg-synergos-red hover:text-white transition-all"
                    >
                        <Lock className="w-3 h-3" />
                        Solicitar Soporte Admin
                    </button>
                    {isPreviewMode && (
                        <button
                            onClick={() => setIsLocked(!isLocked)}
                            className="px-4 py-2 bg-white/10 text-white rounded-xl text-[9px] font-bold border border-white/10 backdrop-blur-md"
                        >
                            {isLocked ? "Forzar Desbloqueo" : "Forzar Bloqueo"}
                        </button>
                    )}
                </div>
            )}

            {/* Paywall Overlay - Liquid Glass Elite Experience */}
            {effectiveIsLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
                    {/* Background Cinematic Layer */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1518176259641-0f4a5811380a?q=80&w=2070&auto=format&fit=crop"
                            alt="Open Water Evolution"
                            className="w-full h-full object-cover opacity-50 blur-[2px] transition-transform duration-[20s] scale-110"
                        />
                        {/* Liquid Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-synergos-electric-blue/5 to-black/95 backdrop-blur-[15px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.1),transparent_70%)] animate-pulse" />
                    </div>

                    <div className="relative z-10 max-w-xl w-full max-h-[90vh] overflow-y-auto scrollbar-none rounded-[4rem] p-[2px] bg-gradient-to-br from-white/20 via-synergos-electric-blue/40 to-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-in zoom-in-95 fade-in duration-1000">
                        <div className="h-full w-full bg-[#05080a]/90 backdrop-blur-3xl rounded-[3.9rem] p-8 md:p-14 text-center relative overflow-hidden group">
                            {/* Fluid Light Effect */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-synergos-electric-blue/20 rounded-full blur-[80px] group-hover:translate-x-12 group-hover:translate-y-12 transition-transform duration-1000" />

                            {/* Premium Insignia (Liquid Glass Style) */}
                            <div className="mb-10 relative">
                                <div className="absolute inset-0 bg-synergos-electric-blue/30 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="w-24 h-24 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center mx-auto relative z-10 shadow-[0_0_40px_rgba(0,229,255,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <Lock className="w-10 h-10 text-synergos-electric-blue drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                                    Acceso <span className="text-synergos-electric-blue underline decoration-white/20 underline-offset-8">Restringido</span>
                                </h3>
                                <p className="text-sm md:text-base text-slate-300 font-bold leading-relaxed max-w-sm mx-auto opacity-70">
                                    Tu diagnóstico biomecánico está listo. Desbloquea el plan completo de <span className="text-white">Evolución Elite</span>.
                                </p>
                            </div>

                            {/* Direct Action Stack */}
                            <div className="space-y-6">
                                <a
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                            const res = await fetch('/performance/api/checkout/creem', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    userId: authSession?.user?.id,
                                                    email: authSession?.user?.email
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.checkout_url) window.location.href = data.checkout_url;
                                        } catch (err) {
                                            console.error('Error al iniciar pago:', err);
                                        }
                                    }}
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-6 rounded-3xl bg-synergos-electric-blue text-black font-black text-xl shadow-[0_15px_50px_rgba(0,229,255,0.4)] hover:shadow-[0_20px_70px_rgba(0,229,255,0.6)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Zap className="w-6 h-6 fill-black" />
                                    ACTIVAR ACCESO PRO (CREEM.IO)
                                </a>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('binance')}
                                        className={`py-5 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-2 ${paymentMethod === 'binance' ? 'bg-synergos-electric-blue/10 border-synergos-electric-blue text-white shadow-[0_0_30px_rgba(0,229,255,0.2)]' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-white'}`}
                                    >
                                        <span className="text-[#F3BA2F]">Binance Pay</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('meru')}
                                        className={`py-5 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-2 ${paymentMethod === 'meru' ? 'bg-white/10 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-white'}`}
                                    >
                                        <span className="text-[#363636] bg-white px-3 py-0.5 rounded-lg font-black text-[9px]">Meru Pay</span>
                                    </button>
                                </div>

                                {/* Dynamic Instruction Panels */}
                                {paymentMethod !== 'none' && (
                                    <div className="p-6 md:p-10 rounded-[3rem] bg-black/80 border border-white/10 animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-synergos-electric-blue italic">Escanear para Desbloqueo</h4>
                                            <button onClick={() => setPaymentMethod('none')} className="p-2 text-slate-600 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="text-xs text-slate-300 space-y-6 leading-relaxed">
                                            {paymentMethod === 'binance' ? (
                                                <>
                                                    <div className="flex justify-center">
                                                        <div className="w-48 h-48 md:w-64 md:h-64 bg-white p-4 rounded-[3.9rem] shadow-[0_0_80px_rgba(255,255,255,0.15)] relative group">
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-synergos-electric-blue/20 to-transparent rounded-[3.9rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                            <img src="/performance/binance_qr.png" alt="Binance QR" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=TUS6YHFALwprDDFZ65P2vXQB7MPrv49oEW")} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 pt-6">
                                                        <p className="text-center font-bold text-white uppercase tracking-tighter text-[10px]">Depósito USDT (TRC20):</p>
                                                        <code className="block p-5 bg-black/90 rounded-3xl border border-synergos-electric-blue/40 break-all text-synergos-electric-blue font-mono select-all text-center text-[11px] shadow-inner font-bold">TUS6YHFALwprDDFZ65P2vXQB7MPrv49oEW</code>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-center">
                                                        <div className="w-48 h-48 md:w-64 md:h-64 bg-white p-4 rounded-[3.9rem] shadow-[0_0_80px_rgba(255,255,255,0.15)]">
                                                            <img src="/performance/meru_qr.png" alt="Meru QR" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=adalberto1811@gmail.com")} />
                                                        </div>
                                                    </div>
                                                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl text-center backdrop-blur-xl">
                                                        <p className="text-red-400 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Fee de Procesamiento</p>
                                                        <p className="text-white font-black text-2xl tracking-tighter">+$3.00 USD</p>
                                                    </div>
                                                    <div className="pt-4 text-center">
                                                        <p className="font-bold text-white text-sm">Performance Swimming</p>
                                                        <p className="opacity-40 text-[10px]">adalberto1811@gmail.com</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* VIP Recovery (Minimalist Liquid Design) */}
                                <div className="pt-12 border-t border-white/5 space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700 block text-center">¿Ya eres Atleta VIP? Recuperar</label>
                                    <div className="flex gap-2 max-w-sm mx-auto p-1 bg-white/[0.03] rounded-2xl border border-white/5 focus-within:border-synergos-electric-blue/40 focus-within:bg-white/[0.05] transition-all">
                                        <input
                                            type="email"
                                            id="liquid-recovery-email"
                                            placeholder="atleta@registrado.com"
                                            className="flex-1 bg-transparent border-none px-4 py-2 text-xs text-white placeholder:text-slate-800 focus:ring-0 outline-none"
                                        />
                                        <button
                                            onClick={async () => {
                                                const email = (document.getElementById('liquid-recovery-email') as HTMLInputElement).value;
                                                if (!email) return;
                                                try {
                                                    const res = await fetch('/performance/api/auth/email-check', {
                                                        method: 'POST', body: JSON.stringify({ email })
                                                    });
                                                    const data = await res.json();
                                                    if (data.exists) {
                                                        setIsLocked(data.trial.isLocked);
                                                        document.cookie = `pse_remembered_userId=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
                                                        alert(`¡Acceso Restaurado, ${data.user.name.split(' ')[0]}!`);
                                                    } else {
                                                        alert("No encontramos tu suscripción VIP.");
                                                    }
                                                } catch (e) { console.error(e); }
                                            }}
                                            className="px-6 py-2 bg-white/5 hover:bg-white text-synergos-electric-blue hover:text-black text-[9px] font-black rounded-xl transition-all uppercase tracking-tighter"
                                        >
                                            ENTER
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700 block text-center">Código de Promoción o Referido</label>
                                    <div className="flex gap-2 max-w-sm mx-auto p-1 bg-white/[0.03] rounded-2xl border border-white/5 focus-within:border-synergos-neon-green/40 focus-within:bg-white/[0.05] transition-all">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Z4VIMCZ3"
                                            className="flex-1 bg-transparent border-none px-4 py-2 text-xs text-white placeholder:text-slate-800 focus:ring-0 outline-none"
                                        />
                                        <button
                                            onClick={handleApplyCode}
                                            disabled={promoLoading || !promoCode}
                                            className="px-6 py-2 bg-synergos-neon-green/10 hover:bg-synergos-neon-green text-synergos-neon-green hover:text-black text-[9px] font-black rounded-xl transition-all uppercase tracking-tighter disabled:opacity-30"
                                        >
                                            {promoLoading ? "..." : "APLICAR"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="mt-14 flex justify-center gap-10 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
                                <Target className="w-5 h-5 text-synergos-electric-blue" />
                                <Activity className="w-5 h-5 text-synergos-neon-green" />
                                <Waves className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Chat Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-12 space-y-4 md:space-y-6 scrollbar-none scroll-smooth"
            >
                {messages.map((msg: Message, i: number) => (
                    <div
                        key={msg.id || i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-4 md:gap-8 group/message animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    >
                        {msg.role === "assistant" && (
                            <div className="flex flex-col items-center gap-3 mt-2">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-synergos-electric-blue/10 border border-synergos-electric-blue/20 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,229,255,0.1)] group-hover/message:shadow-[0_0_50px_rgba(0,229,255,0.3)] transition-all duration-700 overflow-hidden relative`}>
                                    <div className="absolute inset-0 bg-radial-gradient from-synergos-electric-blue/20 to-transparent opacity-50" />
                                    <Bot className={`w-6 md:w-8 h-6 md:h-8 text-synergos-electric-blue relative z-10`} />
                                </div>
                                {userRole === 'admin' && (
                                    <span className="text-[10px] font-black text-synergos-neon-green uppercase tracking-widest opacity-80 bg-synergos-neon-green/10 px-2 py-0.5 rounded-full border border-synergos-neon-green/20">Admin</span>
                                )}
                            </div>
                        )}
                        <div
                            className={`flex-1 p-3 md:p-6 text-[15px] md:text-lg leading-relaxed transition-all duration-700 relative overflow-hidden group/content ${msg.role === "user"
                                ? "text-white text-right"
                                : "text-slate-100"
                                }`}
                        >
                            {/* Metallic Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover/content:translate-x-full transition-transform duration-1000 ease-in-out" />

                            <div className="prose prose-invert prose-xl max-w-none relative z-10 selection:bg-synergos-neon-green/30" suppressHydrationWarning>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    // rehypePlugins={[rehypeRaw]} // Removed to prevent HierarchyRequestError
                                    components={{
                                        p: ({ children }) => {
                                            const text = children?.toString() || "";
                                            if (text.includes("[BIOMECHANICAL_AUDIT]")) {
                                                return (
                                                    <div className="my-6 p-6 md:p-10 bg-synergos-electric-blue/[0.05] border border-synergos-electric-blue/20 rounded-[2rem] md:rounded-[3rem] font-sans relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <Activity className="w-12 h-12 text-synergos-electric-blue" />
                                                        </div>
                                                        <div className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-synergos-electric-blue mb-2 flex items-center gap-3">
                                                            <span className="w-8 h-[1px] bg-synergos-electric-blue/30" />
                                                            Audit Biomecánico
                                                        </div>
                                                        <div className="text-white/95 italic leading-relaxed text-lg md:text-xl font-light">{children}</div>
                                                    </div>
                                                );
                                            }
                                            if (text.includes("[TECHNICAL_REPROGRAMMING]")) {
                                                return (
                                                    <div className="my-6 p-6 md:p-10 bg-synergos-neon-green/[0.05] border border-synergos-neon-green/20 rounded-[2rem] md:rounded-[3rem] font-sans relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <Sparkles className="w-12 h-12 text-synergos-neon-green" />
                                                        </div>
                                                        <div className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-synergos-neon-green mb-2 flex items-center gap-3">
                                                            <span className="w-8 h-[1px] bg-synergos-neon-green/30" />
                                                            Reprogramación Técnica
                                                        </div>
                                                        <div className="text-white/95 leading-relaxed text-lg md:text-xl">{children}</div>
                                                    </div>
                                                );
                                            }
                                            return <p className="mb-4 last:mb-0 leading-[1.6] font-light tracking-wide">{children}</p>;
                                        },
                                        strong: ({ children }) => <strong className="text-synergos-electric-blue font-bold shadow-sm">{children}</strong>,
                                        em: ({ children }) => <em className="text-synergos-neon-green font-medium not-italic bg-synergos-neon-green/5 px-1 rounded-sm">{children}</em>
                                    }}
                                >
                                    {(msg.content || "")
                                        .replace(/<biomechanical_audit>/g, "[BIOMECHANICAL_AUDIT]\n")
                                        .replace(/<\/biomechanical_audit>/g, "")
                                        .replace(/<technical_reprogramming>/g, "[TECHNICAL_REPROGRAMMING]\n")
                                        .replace(/<\/technical_reprogramming>/g, "")
                                        .replace(/<performance_plan>/g, "\n")
                                        .replace(/<\/performance_plan>/g, "")
                                    }
                                </ReactMarkdown>
                            </div>

                            {/* Acciones de Feedback (Solo asistente y si no es el primero) */}
                            {msg.role === 'assistant' && i > 0 && !isSupportRequested && (
                                <div className="mt-4 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
                                    <button
                                        onClick={() => setFailureCount(0)}
                                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-synergos-neon-green/20 hover:text-synergos-neon-green transition-all uppercase tracking-widest"
                                    >
                                        👍 Me sirvió
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newCount = failureCount + 1;
                                            setFailureCount(newCount);
                                            if (newCount >= 3) {
                                                // Auto-trigger help or just show button
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all uppercase tracking-widest ${failureCount > 0
                                            ? "bg-synergos-red/20 border-synergos-red text-synergos-red"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-synergos-red/20 hover:text-synergos-red"
                                            }`}
                                    >
                                        👎 No me sirvió {failureCount > 0 && `(${failureCount})`}
                                    </button>

                                    {failureCount >= 3 && (
                                        <button
                                            onClick={handleSendSupportRequest}
                                            className="px-4 py-1.5 rounded-xl bg-synergos-electric-blue text-black text-[10px] font-black animate-pulse shadow-[0_0_20px_rgba(0,229,255,0.5)] uppercase tracking-tighter"
                                        >
                                            🚀 Solicitar Ayuda Directa (Admin)
                                        </button>
                                    )}
                                </div>
                            )}

                            {isSupportRequested && msg.role === 'assistant' && i === messages.length - 1 && (
                                <div className="mt-4 p-4 bg-synergos-electric-blue/10 border border-synergos-electric-blue/30 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-500">
                                    <Zap className="w-5 h-5 text-synergos-electric-blue animate-pulse" />
                                    <p className="text-[11px] font-black text-synergos-electric-blue uppercase tracking-widest">
                                        Soporte Humano Activado. Esperando respuesta de Adalberto...
                                    </p>
                                </div>
                            )}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-2xl mt-2 transition-all group-hover/message:border-synergos-electric-blue/30">
                                <User className="w-6 md:w-8 h-6 md:h-8 text-slate-400" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start items-center gap-5 animate-pulse ml-6">
                        <div className="w-12 h-12 rounded-2xl bg-synergos-electric-blue/5 border border-synergos-electric-blue/20 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-radial-gradient from-synergos-electric-blue/20 to-transparent" />
                            <Waves className="w-6 h-6 text-synergos-electric-blue animate-bounce" />
                        </div>
                        <div className="px-8 py-3 glass-premium rounded-[2rem] text-[11px] font-black font-mono text-synergos-electric-blue border border-synergos-electric-blue/20 uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(0,229,255,0.1)]">
                            {selectedImage ? "Analizando ADN..." : "Evolucionando..."}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area - Flattened */}
            <div className={`p-4 md:p-8 bg-transparent transition-all duration-1000 ${effectiveIsLocked ? "opacity-20 pointer-events-none grayscale blur-sm" : ""}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Preview Area */}
                    <div className="flex gap-4 mb-4">
                        {selectedImage && (
                            <div className="relative w-24 h-24 md:w-32 md:h-32 group animate-in zoom-in-50 duration-300">
                                <img src={selectedImage.base64} className="w-full h-full object-cover rounded-3xl border-2 border-synergos-electric-blue shadow-[0_0_50px_rgba(0,229,255,0.3)] transition-transform group-hover:scale-105" alt="Preview" />
                                <button
                                    title="Remover imagen"
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-synergos-red rounded-full text-white shadow-2xl transition-all border border-black/20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {selectedVideo && (
                            <div className="relative w-24 h-24 md:w-32 md:h-32 group animate-in zoom-in-50 duration-300">
                                <div className="w-full h-full bg-black/40 rounded-3xl border-2 border-synergos-neon-green flex items-center justify-center relative overflow-hidden">
                                    <Video className="w-8 h-8 text-synergos-neon-green" />
                                    <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded-lg text-[8px] text-white font-bold">10s CLIP</div>
                                </div>
                                <button
                                    title="Remover video"
                                    onClick={() => setSelectedVideo(null)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-synergos-red rounded-full text-white shadow-2xl transition-all border border-black/20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {isTrimming && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-synergos-neon-green/10 border border-synergos-neon-green/30 rounded-2xl animate-pulse">
                                <Zap className="w-4 h-4 text-synergos-neon-green" />
                                <span className="text-[10px] font-black text-synergos-neon-green uppercase tracking-widest">Recortando técnica (10s)...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end gap-3 md:gap-5 bg-transparent rounded-[2rem] md:rounded-[4rem] p-3 md:p-4 focus-within:bg-white/[0.03] transition-all duration-500 relative group/input">
                        {/* Glow effect on focus */}
                        <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] bg-synergos-electric-blue/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-xl -z-10" />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={videoInputRef}
                            onChange={handleVideoSelect}
                            accept="video/*"
                            className="hidden"
                        />


                        <textarea
                            rows={1}
                            value={localInput}
                            onChange={(e) => {
                                setLocalInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={selectedImage || selectedVideo ? "Describe esta entrada visual..." : "Escribe aquí para entrenar..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-base md:text-xl font-light py-4 md:py-7 px-2 md:px-6 text-white placeholder:text-slate-600 resize-none max-h-48 scrollbar-none"
                            style={{ height: 'auto' }}
                        />

                        <button
                            title="Enviar mensaje"
                            onClick={handleSend}
                            disabled={isLoading || isTrimming || (!localInput.trim() && !selectedImage && !selectedVideo)}
                            className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[3.2rem] bg-synergos-electric-blue text-black shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-[0_0_70px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-90 transition-all disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed shrink-0 flex items-center justify-center group/send overflow-hidden relative`}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/send:translate-y-0 transition-transform duration-500" />
                            <Send className="w-6 h-6 md:w-10 md:h-10 relative z-10 group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />
                        </button>
                    </div>

                    <div className="flex justify-center gap-8 md:gap-16 mt-6 md:mt-10 opacity-30 pointer-events-none">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-synergos-electric-blue animate-pulse" />
                            <span className="text-[8px] md:text-[11px] text-slate-500 font-black uppercase tracking-[0.6em]">Neural Engine v4.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-synergos-neon-green" />
                            <span className="text-[8px] md:text-[11px] text-slate-500 font-black uppercase tracking-[0.6em]">Liquid V2</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
