'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Activity,
    Users,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Zap,
    ChevronRight,
    Edit3,
    X,
    MessageSquare,
    Ghost,
    Clock,
    Bell,
    BellOff,
    Send
} from 'lucide-react';

interface Metrics {
    system_health: {
        model: string;
        avg_latency: number;
        total_calls: number;
        errors: number;
    }[];
    traffic: {
        active: number;
        trial: number;
        growth: number;
    };
    conversion: {
        total_trials: number;
        converted: number;
        marketing_funnel: number;
    };
    financial: {
        monthly_revenue: number;
        projected_revenue: number;
        pending_subscriptions: number;
        active_subscriptions: number;
    };
    referrals: {
        tiers: { referral_tier: string; count: string }[];
        top: { full_name: string; referrals: string }[];
    };
    ghostVisits?: number;
}

interface ActivityEvent {
    type: 'activity' | 'registration';
    title: string;
    user_name: string;
    metadata: any;
    created_at: string;
}

// PSE Admin v3.1 - Enhanced Nuclear Debugger
export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [promptContent, setPromptContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [showPanicModal, setShowPanicModal] = useState(false);
    const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [debugQuery, setDebugQuery] = useState('');
    const [debugLoading, setDebugLoading] = useState(false);
    const [debugHistory, setDebugHistory] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
    const [showDebugger, setShowDebugger] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);
    const [supportRequests, setSupportRequests] = useState<{ id: number; user_name: string; message: string; response_text?: string; status: string; created_at: string }[]>([]);
    const [trialUsers, setTrialUsers] = useState<{ id: number; full_name: string; days_since_registration: number; microcycles_used: number }[]>([]);
    const [respondingTo, setRespondingTo] = useState<number | null>(null);
    const [adminResponseText, setAdminResponseText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showDebugger) scrollToBottom();
    }, [debugHistory, showDebugger]);

    // Helper to convert VAPID key
    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        setPushLoading(true);
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('[Push] Iniciando suscripción.');
        console.log('[Push] VAPID Key status:', vapidKey ? 'Presente (Inyectada)' : 'AUSENTE (Undefined)');

        if (!vapidKey) {
            console.error('[Push] ERROR: NEXT_PUBLIC_VAPID_PUBLIC_KEY no está definida en el bundle del cliente.');
            alert('Error crítico: Clave pública VAPID no detectada. \n\nEsto suele significar que no estaba presente en Vercel durante el último build.\n\nAcción: Ejecuta sync-envs y redeploy.');
            setPushLoading(false);
            return;
        }

        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker no soportado por este navegador.');
            }

            const registration = await navigator.serviceWorker.ready;
            console.log('[Push] Service Worker listo:', registration.active?.state);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            console.log('[Push] Suscripción obtenida, enviando al servidor...');

            const res = await fetch('/performance/api/pwa/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            if (!res.ok) throw new Error('Fallo al guardar suscripción en el servidor.');

            setPushSubscribed(true);
            alert('¡Canal de Alertas Activado con Éxito! 🚀');
        } catch (error: any) {
            console.error('Push subscription failed:', error);
            alert(`Error al activar notificaciones: ${error.message || 'Asegúrate de dar permisos o instalar la PWA.'}`);
        } finally {
            setPushLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        setPushLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setPushSubscribed(false);
                alert('Notificaciones Desactivadas');
            }
        } catch (error) {
            console.error('Push unsubscription failed:', error);
            alert('Error al desactivar notificaciones.');
        } finally {
            setPushLoading(false);
        }
    };

    useEffect(() => {
        // Check if already subscribed
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    setPushSubscribed(!!sub);
                });
            });
        }
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/performance/api/admin/metrics');
            const data = await res.json();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to fetch metrics');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const res = await fetch('/performance/api/admin/activity');
            const data = await res.json();
            setActivities(data.recent);
            setMetrics(prev => prev ? { ...prev, ghostVisits: data.ghostVisits } : null);
        } catch (error) {
            console.error('Failed to fetch activity');
        }
    };

    const fetchSupport = async () => {
        try {
            const res = await fetch('/performance/api/admin/support');
            const data = await res.json();
            setSupportRequests(data.requests || []);
        } catch (error) {
            console.error('Failed to fetch support requests');
        }
    };

    const fetchTrialUsers = async () => {
        try {
            const res = await fetch('/performance/api/admin/trial-users');
            const data = await res.json();
            setTrialUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch trial users');
        }
    };

    const handleRespondToSupport = async (requestId: number) => {
        if (!adminResponseText.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch('/performance/api/admin/support/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, responseText: adminResponseText })
            });

            if (res.ok) {
                setRespondingTo(null);
                setAdminResponseText('');
                fetchSupport();
                alert('¡Respuesta enviada y atleta notificado! 🚀');
            }
        } catch (error) {
            console.error('Failed to respond to support request');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        // LAYER 4: Client-side protection (Atomic check)
        const checkAuth = async () => {
            try {
                const res = await fetch('/performance/api/auth/session');
                const session = await res.json();

                // La seguridad real está en Middleware, esto es solo para UX
                if (!session?.user?.email) {
                    window.location.href = '/performance/login';
                }
            } catch (e) {
                window.location.href = '/performance/login';
            }
        };
        checkAuth();

        fetchMetrics();
        fetchActivity();
        fetchSupport();
        fetchTrialUsers();
        const interval = setInterval(() => {
            fetchMetrics();
            fetchActivity();
            fetchSupport();
        }, 15000); // Polling cada 15s para real-time feel
        return () => clearInterval(interval);
    }, []);

    const openPromptEditor = async () => {
        try {
            const res = await fetch('/performance/api/admin/prompt');
            const data = await res.json();
            setPromptContent(data.content);
            setShowEditor(true);
        } catch (error) {
            alert('Error al cargar el prompt');
        }
    };

    const savePrompt = async () => {
        setSaving(true);
        try {
            const res = await fetch('/performance/api/admin/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: promptContent })
            });
            if (res.ok) {
                setShowEditor(false);
                alert('¡Cerebro Maestro Actualizado con Éxito!');
            }
        } catch (error) {
            alert('Error al guardar el prompt');
        } finally {
            setSaving(false);
        }
    };

    const runDebugAgent = async () => {
        if (!debugQuery || debugLoading) return;
        const querySnapshot = debugQuery;
        setDebugQuery('');
        setDebugHistory(prev => [...prev, { role: 'user', text: querySnapshot }]);
        setDebugLoading(true);

        try {
            const res = await fetch('/performance/api/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: querySnapshot,
                    history: debugHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
                    isAdminBypass: true,
                    access: "pse_admin_2026"
                })
            });

            // Handle potential JSON error response (e.g. 400 or 500 before stream starts)
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.error) {
                    setDebugHistory(prev => [...prev, { role: 'agent', text: `❌ ERROR: ${data.error}` }]);
                    return;
                }
                if (data.is_cached) {
                    setDebugHistory(prev => [...prev, { role: 'agent', text: `📦 CACHE SEMANAL:\n\n${data.response || data.info || 'Sin contenido'}\n\n⚠️ El bypass no funcionó. Verifica que tu cuenta tenga rol 'admin' en la DB.` }]);
                    return;
                }
                if (data.response) {
                    setDebugHistory(prev => [...prev, { role: 'agent', text: data.response }]);
                    return;
                }
            }

            // Otherwise handle stream
            if (!res.body) throw new Error('Cuerpo de respuesta vacío');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            setDebugHistory(prev => [...prev, { role: 'agent', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // Process lines to extract only text content (0:) and ignore metadata (e:, f:, d:)
                const lines = chunk.split('\n');
                let filteredText = '';

                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        try {
                            // Extract content between quotes
                            const contentMatch = line.match(/^0:"(.*)"$/);
                            if (contentMatch) {
                                filteredText += contentMatch[1]
                                    .replace(/\\n/g, '\n')
                                    .replace(/\\r/g, '\r')
                                    .replace(/\\"/g, '"')
                                    .replace(/\\\\/g, '\\');
                            } else {
                                // Fallback for unquoted content
                                filteredText += line.substring(2);
                            }
                        } catch (e) {
                            filteredText += line.substring(2);
                        }
                    }
                }

                accumulatedText += filteredText;

                setDebugHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'agent', text: accumulatedText };
                    return newHistory;
                });
            }
        } catch (error) {
            setDebugHistory(prev => [...prev, { role: 'agent', text: "ERROR CRÍTICO: El núcleo de la IA no responde o el stream se cortó." }]);
        } finally {
            setDebugLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-[#39FF14] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header / Command Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white outline-text">
                        SynCards <span className="text-[#39FF14]">v3.0</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Neural Command Center // Elite Performance</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* NUEVO: Alertas de Soporte */}
                    <button
                        onClick={() => setActiveOverlay('support')}
                        className={`px-6 py-3 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${supportRequests.length > 0
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                    >
                        <MessageSquare className="w-3 h-3" /> Soporte
                        {supportRequests.length > 0 && <span className="px-2 py-0.5 bg-rose-500 text-black rounded-full">{supportRequests.length}</span>}
                    </button>
                    {/* NUEVO: Usuarios en Trial */}
                    <button
                        onClick={() => setActiveOverlay('trial')}
                        className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2"
                    >
                        <Users className="w-3 h-3" /> Trial
                        <span className="px-2 py-0.5 bg-amber-500/20 rounded-full">{trialUsers.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveOverlay('activity')}
                        className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Activity className="w-3 h-3" /> Radar Actividad
                    </button>
                    <button
                        onClick={() => setShowDebugger(true)}
                        className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2"
                    >
                        <Zap className="w-3 h-3" /> Agente Debug
                    </button>
                    <button
                        onClick={openPromptEditor}
                        className="px-6 py-3 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#39FF14]/20 transition-all flex items-center gap-2"
                    >
                        <Edit3 className="w-3 h-3" /> Bio-Cerebro
                    </button>
                    <button
                        onClick={pushSubscribed ? unsubscribeFromPush : subscribeToPush}
                        disabled={pushLoading}
                        className={`px-6 py-3 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${pushSubscribed
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-rose-500 hover:text-black hover:border-rose-500 shadow-[0_0_20px_rgba(129,140,248,0.1)]'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-black shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                            }`}
                    >
                        {pushLoading ? <Zap className="w-3 h-3 animate-spin" /> : pushSubscribed ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                        {pushLoading ? 'Procesando' : pushSubscribed ? 'Alertas On' : 'Activar Alertas'}
                    </button>
                    <button
                        onClick={() => setShowPanicModal(true)}
                        className="p-3 bg-rose-500 text-black rounded-xl hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
                    >
                        <AlertTriangle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Traffic - GREEN GLOW */}
                <Card
                    title="Tráfico Biomecánico"
                    icon={<Users className="w-6 h-6 text-[#39FF14]" />}
                    glowColor="rgba(57, 255, 20, 0.4)"
                >
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-6xl font-black tracking-tighter italic text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">{metrics?.traffic.active}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white/90">Atletas Registrados</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-rose-500 tracking-tighter animate-pulse">{metrics?.ghostVisits || 0}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Ghost (Opens)</div>
                        </div>
                    </div>
                </Card>

                {/* Conversion - BLUE GLOW */}
                <Card
                    title="Embudo de Poder"
                    icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
                    glowColor="rgba(96, 165, 250, 0.4)"
                >
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="text-4xl font-black text-blue-400 italic italic">{Math.round((metrics?.conversion.converted || 0) / (metrics?.conversion.total_trials || 1) * 100)}%</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ratio de Cierre</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                                style={{ width: `${Math.round((metrics?.conversion.converted || 0) / (metrics?.conversion.total_trials || 1) * 100)}%` }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Financial - AMBER GLOW */}
                <Card
                    title="Tesorería Polar"
                    icon={<DollarSign className="w-6 h-6 text-amber-400" />}
                    glowColor="rgba(251, 191, 36, 0.4)"
                >
                    <div className="space-y-2">
                        <div className="text-4xl font-black tracking-tighter italic text-amber-400">${metrics?.financial.monthly_revenue}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Revenue Mensual</div>
                        <div className="pt-4 flex items-center justify-between text-[10px] font-black">
                            <span className="text-white/40 uppercase">Proyectado:</span>
                            <span className="text-white">${metrics?.financial.projected_revenue}</span>
                        </div>
                    </div>
                </Card>

                {/* Referrals - EMERALD GLOW */}
                <Card
                    title="Referidos Oro"
                    icon={<Zap className="w-6 h-6 text-emerald-400" />}
                    glowColor="rgba(52, 211, 153, 0.4)"
                >
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {metrics?.referrals?.tiers.slice(0, 3).map((t) => (
                                <div key={t.referral_tier} className="flex-1 p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                                    <div className="text-lg font-black text-white">{t.count}</div>
                                    <div className="text-[7px] font-black uppercase tracking-tighter text-white/30">{t.referral_tier}</div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setActiveOverlay('referrals')}
                            className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            Ver Embajadores
                        </button>
                    </div>
                </Card>
            </div>

            {/* Overlays / Superpositions */}
            {
                activeOverlay && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)] relative">
                            <button
                                onClick={() => setActiveOverlay(null)}
                                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-rose-500/20 rounded-full text-white/40 hover:text-rose-500 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-12">
                                {activeOverlay === 'activity' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                                <Activity className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Radar de Actividad Real</h2>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Monitorización de Eventos en Vivo</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {activities.map((act, idx) => (
                                                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start justify-between group hover:bg-white/[0.04] transition-all">
                                                    <div className="flex gap-4">
                                                        <div className={`p-2 rounded-lg ${act.type === 'registration' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                            {act.type === 'registration' ? <Users className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{act.user_name}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/70">{act.title}</div>
                                                            {act.metadata?.email && <div className="text-[9px] text-white/50">{act.metadata.email}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="text-[9px] font-black text-white/50 uppercase flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(act.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeOverlay === 'debugger' && (
                                    <div className="space-y-8 flex flex-col items-center justify-center py-12">
                                        <Zap className="w-16 h-16 text-emerald-500 animate-pulse opacity-20" />
                                        <div className="text-center space-y-4">
                                            <p className="text-white/40 text-xs font-black uppercase tracking-widest">Este módulo ha sido movido al Depurador de Pantalla Completa.</p>
                                            <button
                                                onClick={() => {
                                                    setShowDebugger(true);
                                                    setActiveOverlay(null);
                                                }}
                                                className="px-8 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                                            >
                                                Abrir Consola de Bypass
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* NUEVO: Overlay de Soporte */}
                                {activeOverlay === 'support' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="w-5 h-5 text-rose-400" />
                                                <span className="text-rose-400 font-black uppercase tracking-widest text-sm">Solicitudes de Soporte</span>
                                            </div>
                                            <span className="text-[10px] text-white/40">{supportRequests.length} pendientes</span>
                                        </div>
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {supportRequests.length === 0 ? (
                                                <div className="text-center py-8 text-white/30 text-sm">
                                                    ✨ Sin solicitudes de soporte pendientes
                                                </div>
                                            ) : (
                                                supportRequests.map((req) => (
                                                    <div key={req.id} className={`p-4 rounded-2xl border transition-all ${req.status === 'resolved' ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'}`}>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-sm font-bold text-white/90">{req.user_name || 'Usuario Anónimo'}</div>
                                                                    {req.status === 'resolved' && <span className="text-[8px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase">Resuelto</span>}
                                                                </div>
                                                                <div className="text-xs text-white/60 mt-1">{req.message}</div>
                                                                {req.response_text && (
                                                                    <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/5 text-[10px] text-white/40 italic">
                                                                        Tu respuesta: {req.response_text}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] font-black text-white/20 uppercase flex items-center gap-2">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(req.created_at).toLocaleString()}
                                                            </div>
                                                        </div>

                                                        {req.status !== 'resolved' && (
                                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                                {respondingTo === req.id ? (
                                                                    <div className="space-y-3">
                                                                        <textarea
                                                                            value={adminResponseText}
                                                                            onChange={(e) => setAdminResponseText(e.target.value)}
                                                                            placeholder="Escribe tu respuesta personalizada..."
                                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all resize-none"
                                                                            rows={3}
                                                                        />
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => setRespondingTo(null)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Cancelar</button>
                                                                            <button
                                                                                disabled={saving || !adminResponseText.trim()}
                                                                                onClick={() => handleRespondToSupport(req.id)}
                                                                                className="px-6 py-2 bg-rose-500 text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_15px_#f43f5e] transition-all disabled:opacity-30"
                                                                            >
                                                                                {saving ? 'Enviando...' : 'Enviar Respuesta'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setRespondingTo(req.id)}
                                                                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-all"
                                                                    >
                                                                        <Send className="w-3 h-3" /> Responder Personalmente
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* NUEVO: Overlay de Trial Users */}
                                {activeOverlay === 'trial' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-amber-400" />
                                                <span className="text-amber-400 font-black uppercase tracking-widest text-sm">Usuarios en Trial</span>
                                            </div>
                                            <span className="text-[10px] text-white/40">{trialUsers.length} activos</span>
                                        </div>
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {trialUsers.length === 0 ? (
                                                <div className="text-center py-8 text-white/30 text-sm">
                                                    No hay usuarios en periodo de prueba actualmente
                                                </div>
                                            ) : (
                                                trialUsers.map((user) => (
                                                    <div key={user.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl group hover:bg-amber-500/10 transition-all">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-bold text-white/90">{user.full_name || 'Sin nombre'}</div>
                                                                <div className="text-[10px] text-white/40 mt-1">
                                                                    {user.microcycles_used}/2 microciclos • {15 - user.days_since_registration} días restantes
                                                                </div>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.days_since_registration > 12 || user.microcycles_used >= 2
                                                                ? 'bg-rose-500/20 text-rose-400'
                                                                : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                {user.days_since_registration > 12 || user.microcycles_used >= 2 ? 'Por expirar' : 'Activo'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeOverlay === 'health' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                                <Activity className="w-8 h-8 text-rose-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Estado Crítico del Motor</h2>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Latencia y Salud Global</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {metrics?.system_health.map((h) => (
                                                <div key={h.model} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-white">{h.model}</div>
                                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{h.total_calls} Procesos</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-xl font-black ${h.avg_latency > 5000 ? 'text-rose-500' : 'text-[#39FF14]'}`}>
                                                            {Math.round(h.avg_latency)}ms
                                                        </div>
                                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Respuesta Promedio</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeOverlay === 'referrals' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                <Zap className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Embajadores de Élite</h2>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Programa de Referidos Oro</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {metrics?.referrals?.top.map((top, idx) => (
                                                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">#{idx + 1}</div>
                                                        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{top.full_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-black text-emerald-400">{top.referrals}</span>
                                                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Referidos</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Prompt Editor Modal */}
            {
                showEditor && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <Edit3 className="w-6 h-6 text-[#39FF14]" />
                                    <h3 className="text-lg font-black uppercase tracking-[0.2em] italic">Editor del Cerebro Maestro</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setShowEditor(false)}
                                        className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={savePrompt}
                                        disabled={saving}
                                        className="px-8 py-3 bg-[#39FF14] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_#39FF14] disabled:opacity-50 transition-all"
                                    >
                                        {saving ? 'Guardando...' : 'Desplegar Cambios'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-8">
                                <textarea
                                    value={promptContent}
                                    onChange={(e) => setPromptContent(e.target.value)}
                                    className="w-full h-[65vh] bg-black/60 border border-white/10 rounded-xl p-8 text-base font-mono text-[#39FF14]/90 focus:outline-none focus:border-[#39FF14]/50 transition-colors leading-relaxed selection:bg-[#39FF14]/20"
                                    spellCheck={false}
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Panic Modal */}
            {
                showPanicModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-rose-500/20 backdrop-blur-xl animate-in zoom-in duration-300">
                        <div className="w-full max-w-md bg-[#0a0a0a] border border-rose-500/50 rounded-[3rem] p-12 text-center space-y-8 shadow-[0_0_100px_rgba(244,63,94,0.3)] border-b-[12px] border-b-rose-500">
                            <AlertTriangle className="w-24 h-24 text-rose-500 mx-auto animate-bounce" />
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-rose-500">PROTOCOLO SIGMA</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Anulación de Restricciones Nucleares</p>
                                <p className="text-xs font-bold text-white/90 leading-relaxed px-4">
                                    Esta acción revertirá todos los procesos activos y restaurará los parámetros base de la IA. No hay retorno tras la confirmación de reinicio global.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <button className="w-full py-5 bg-rose-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_#f43f5e] transition-all transform hover:scale-[1.03]">
                                    Ejecutar Purga Global
                                </button>
                                <button
                                    onClick={() => setShowPanicModal(false)}
                                    className="w-full py-5 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Abortar Operación
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Full Screen Debugger */}
            {
                showDebugger && (
                    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500">
                        {/* Header */}
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/40">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                    <Zap className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Consola de Bypass Maestro</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Interacción Directa con el Núcleo // Root Access</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDebugger(false)}
                                className="p-4 bg-white/5 rounded-full hover:bg-rose-500/20 hover:text-rose-500 transition-all group"
                            >
                                <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-8 scroll-smooth">
                            {debugHistory.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                                    <Zap className="w-20 h-20 text-emerald-500 animate-pulse" />
                                    <p className="text-xs font-black uppercase tracking-[0.5em]">Esperando Directriz del Administrador</p>
                                </div>
                            )}
                            {debugHistory.map((item, idx) => (
                                <div key={idx} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
                                    <div className={`max-w-3xl p-8 rounded-3xl ${item.role === 'user'
                                        ? 'bg-emerald-500 text-black font-bold'
                                        : 'bg-white/[0.03] border border-white/10 text-white/90 font-medium'
                                        } shadow-2xl`}>
                                        <div className={`text-[8px] font-black uppercase tracking-widest mb-3 ${item.role === 'user' ? 'text-black/60' : 'text-emerald-500/60'
                                            }`}>
                                            {item.role === 'user' ? 'Administrador' : 'Agente PSE'}
                                        </div>
                                        <div className="text-base leading-relaxed whitespace-pre-wrap">
                                            {item.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                            {debugLoading && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl space-y-4 w-96 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/60 ml-2">Agente Procesando...</span>
                                        </div>
                                        <div className="space-y-2 opacity-20">
                                            <div className="h-2 w-full bg-white/5 rounded-full" />
                                            <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-12 bg-black/60 border-t border-white/10 backdrop-blur-xl">
                            <div className="max-w-5xl mx-auto relative group">
                                <textarea
                                    value={debugQuery}
                                    onChange={(e) => setDebugQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            runDebugAgent();
                                        }
                                    }}
                                    placeholder="Escribe tu comando o consulta biomecánica..."
                                    className="w-full h-32 bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 pr-40 text-lg text-emerald-400 placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all resize-none shadow-2xl font-mono"
                                />
                                <div className="absolute right-4 bottom-4 flex items-center gap-4">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mr-4 hidden md:block">Enter para enviar</span>
                                    <button
                                        onClick={runDebugAgent}
                                        disabled={debugLoading || !debugQuery.trim()}
                                        className="p-6 bg-emerald-500 text-black rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:opacity-20 transition-all group-hover:scale-105 active:scale-95"
                                    >
                                        <Send className={`w-6 h-6 ${debugLoading ? 'animate-pulse' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Footer Intel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <div className="p-10 bg-gradient-to-br from-[#39FF14]/5 to-transparent border border-white/10 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#39FF14] rounded-full animate-ping" />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Live System Feed</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-1.5 h-10 bg-[#39FF14]/40 rounded-full shrink-0" />
                            <p className="text-[11px] font-bold text-white/60">Última auditoría biomecánica completada con éxito. Latencia estable.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-1.5 h-10 bg-blue-400/40 rounded-full shrink-0" />
                            <p className="text-[11px] font-bold text-white/60">Nuevas métricas de conversión procesadas. +12% ROI proyectado.</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-end items-end space-y-2 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white text-right">PSE Command & Control v3.0 // 2026</p>
                    <p className="text-[6px] font-black uppercase tracking-[0.3em] text-white/50 text-right">Built for Elite Swimming Dominance</p>
                </div>
            </div>
        </div >
    );
}

function Card({ title, icon, children, glowColor }: { title: string, icon: React.ReactNode, children: React.ReactNode, glowColor?: string }) {
    return (
        <div className="group relative p-10 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all duration-500 shadow-2xl overflow-hidden hover:-translate-y-2">
            {/* Dynamic Glow shadow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ boxShadow: `inset 0 0 80px ${glowColor || 'rgba(57, 255, 20, 0.1)'}` }}
            />

            <div className="relative space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white/70 transition-colors">{title}</h3>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
