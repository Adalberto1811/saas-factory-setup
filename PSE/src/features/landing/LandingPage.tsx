"use client";

import { useState, useEffect } from 'react';
import { Waves, Zap, Target, ChevronRight, Activity, Shield, Trophy } from 'lucide-react';
import { pseLandingConfig } from './config/pse-landing-config';
import { ImpactReel } from './components/ImpactReel';

export default function LandingPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");

    useEffect(() => {
        // ... (sid management)
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Registrar usuario en la base de datos y obtener sesión JWT
            const registerRes = await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: 'registration',
                    sessionId: sessionId,
                    details: { name, email, whatsapp }
                })
            });

            // Registrar también vía auth landing-register para crear el usuario/cookie
            const authRes = await fetch("/api/auth/landing-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, whatsapp })
            });

            const registerData = await authRes.json();

            if (!authRes.ok) {
                throw new Error(registerData.error || 'Error al registrar');
            }

            // 2. Enviar lead a N8N
            fetch("http://3.148.170.122:5678/webhook/ef270b01-9c77-45d3-9e6b-67183746f597", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatInput: `NUEVO LEAD PSE: ${name} (${email}) - WA: ${whatsapp}. Registrado exitosamente.`,
                    source: "pse_landing_v3",
                    priority: "high",
                    lead_data: { name, email, whatsapp, sessionId, userId: registerData.userId }
                })
            }).catch(err => console.warn("N8N webhook failed:", err));

            setSubmitted(true);

            // 4. Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (err: any) {
            console.error("Error submitting lead:", err);
            alert(err.message || "Error al registrar. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#020408] text-white selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 w-full max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
                <div className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 rounded-full border border-white/10 p-0.5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                        <img
                            src={pseLandingConfig.branding.logo}
                            alt="PSE Logo"
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div>
                        <span className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                            PSE ELITE
                        </span>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Biomechanical Mastery</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => document.getElementById('impact-reel')?.scrollIntoView({ behavior: 'smooth' })}
                        className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                        Visión Elite
                    </button>
                    <button
                        onClick={() => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Acceso Atletas
                    </button>
                </div>
            </nav>

            {/* Impact Reel Section (TOP IMPACT) */}
            <div id="impact-reel" className="relative z-10 w-full pt-10 px-8">
                <div className="max-w-7xl mx-auto">
                    <ImpactReel />
                </div>
            </div>

            {/* Hero Section */}
            <main className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-10 pb-20">
                <div className="max-w-4xl">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Evolución en Tiempo Real</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase">
                                {pseLandingConfig.copy.hero.hook.split(',')[0]}
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-white to-teal-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                                    {pseLandingConfig.copy.hero.hook.split(',')[1]}
                                </span>
                            </h1>
                            <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
                                {pseLandingConfig.copy.hero.subHook} Diseñamos cada brazada basándonos en tu anatomía, no en plantillas genéricas. <strong>Reclama tus dos microciclos gratuitos hoy mismo.</strong>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <button
                                onClick={() => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3"
                            >
                                {pseLandingConfig.copy.hero.cta}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5 max-w-2xl">
                            <div>
                                <div className="text-3xl font-black italic text-emerald-400">+1200</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Atletas Pro</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black italic text-teal-400">98%</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Efectividad</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black italic text-white/80">24/7</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Soporte IA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 border-t border-white/5">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-6 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase">Visión Biomecánica</h4>
                        <p className="text-sm text-white/40 leading-relaxed font-bold">Nuestro motor neuronal analiza tus videos para detectar fallos imperceptibles al ojo humano.</p>
                    </div>
                    <div className="space-y-6 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-teal-400/30 transition-all group">
                        <div className="p-4 bg-teal-400/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-teal-400" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase">Reprogramación Técnica</h4>
                        <p className="text-sm text-white/40 leading-relaxed font-bold">Protocolos específicos para corregir codo caído, entrada cruzada o falta de anclado de forma auditada.</p>
                    </div>
                    <div className="space-y-6 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                        <div className="p-4 bg-blue-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Waves className="w-6 h-6 text-blue-400" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase">Ecosistema Elite</h4>
                        <p className="text-sm text-white/40 leading-relaxed font-bold">Acceso a preparadores físicos, nutricionistas y psicólogos deportivos en una sola plataforma IA.</p>
                    </div>
                </div>
            </section>

            {/* Final Offer Section (FORM AT BOTTOM) */}
            <section id="offer" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32">
                <div className="relative overflow-hidden rounded-[4rem] border border-white/10 shadow-2xl">
                    {/* High-Impact Background Image with Overlay */}
                    <div className="absolute inset-0 z-0 bg-[#020408] overflow-hidden">
                        {/* Digital Wave Pattern (Guaranteed) */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 2 50 10 T 100 10' fill='none' stroke='%2339FF14' stroke-width='0.5' stroke-opacity='0.5'/%3E%3C/svg%3E")`,
                                backgroundSize: '300px 40px'
                            }}
                        />

                        {/* Tech Grid Focus */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, #00E5FF 1px, transparent 0)`,
                                backgroundSize: '40px 40px'
                            }}
                        />

                        {/* Premium Glows */}
                        <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-synergos-electric-blue/10 to-transparent -translate-y-1/2 blur-[100px]" />
                        <div className="absolute top-1/4 right-0 w-96 h-96 bg-synergos-neon-green/10 rounded-full blur-[120px] animate-pulse" />

                        <div className="absolute inset-0 bg-gradient-to-r from-[#020408] via-[#020408]/20 to-transparent z-10" />

                        <img
                            src="https://images.unsplash.com/photo-1544924497-56bb4af7b142?q=60&w=1200"
                            alt="Natación"
                            className="w-full h-full object-cover opacity-50 mix-blend-screen"
                            onError={(e) => (e.target as HTMLImageElement).classList.add('hidden')}
                        />

                        {/* Version tag for verification */}
                        <div className="absolute bottom-4 left-4 z-20 text-[8px] font-black uppercase tracking-widest text-white/10">
                            PSE Engineering // Final Blindaje v4.5
                        </div>
                    </div>

                    <div className="relative z-20 grid md:grid-cols-2 items-center">
                        {/* Left Side: Impact Copy & Logo */}
                        <div className="p-12 md:p-20 space-y-10 text-left">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl border border-white/20 p-2 bg-black/60 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                                    <img src={pseLandingConfig.branding.logo} className="w-full h-full object-contain" alt="PSE Logo" />
                                </div>
                                <div>
                                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white leading-tight">
                                        Empieza tu <br />
                                        <span className="text-[#39FF14]">Evolución</span>
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-xl text-white/80 font-medium max-w-sm leading-relaxed">
                                    Únete a la élite de la natación. Domina tu biomecánica con planes quirúrgicos.
                                </p>
                                <div className="flex items-center gap-4 text-[#00E5FF] font-black uppercase tracking-[0.2em] text-xs">
                                    <Trophy className="w-5 h-5" />
                                    <span>Dos microciclos de regalo ($97)</span>
                                </div>
                                <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020408] bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=pse${i}`} alt="User" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-[#020408] bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">
                                            +2K
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Comunidad Elite Activa</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: High-End Form */}
                        <div className="p-12 md:p-20 bg-white/[0.03] backdrop-blur-3xl border-l border-white/5">
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 px-2 bg-[#020408] text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Atleta</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Nombre Completo"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-20 bg-white/10 border-2 border-white/20 rounded-2xl px-6 text-xl focus:outline-none focus:border-[#39FF14] focus:bg-white/20 transition-all placeholder:text-white/40 text-white font-bold"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 px-2 bg-[#020408] text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">Contacto</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="atleta@elite.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-20 bg-white/10 border-2 border-white/20 rounded-2xl px-6 text-xl focus:outline-none focus:border-[#00E5FF] focus:bg-white/20 transition-all placeholder:text-white/40 text-white font-bold"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 px-2 bg-[#020408] text-[10px] font-black uppercase tracking-widest text-[#39FF14]">WhatsApp</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="+58 412 000 0000"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                className="w-full h-20 bg-white/10 border-2 border-white/20 rounded-2xl px-6 text-xl focus:outline-none focus:border-[#39FF14] focus:bg-white/20 transition-all placeholder:text-white/40 text-white font-bold"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-24 bg-[#39FF14] hover:bg-[#32e012] text-black text-xl font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-[0_20px_50px_rgba(57,255,20,0.3)] hover:shadow-[0_25px_60px_rgba(57,255,20,0.5)] active:scale-95 group flex items-center justify-center gap-4"
                                    >
                                        {loading ? "Preparando Plan..." : (
                                            <>
                                                <span>Reclamar Ahora</span>
                                                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-4 opacity-40">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Encriptación de Grado Militar</span>
                                    </div>

                                    {/* Recovery Section for Returning Athletes */}
                                    <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">¿Ya eres Atleta PSE?</p>
                                        <div className="flex gap-4">
                                            <input
                                                type="email"
                                                id="landing-recovery-email"
                                                placeholder="Tu email registrado"
                                                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm focus:outline-none focus:border-[#39FF14]/50 transition-all placeholder:text-white/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const recoveryEmail = (document.getElementById('landing-recovery-email') as HTMLInputElement).value;
                                                    if (!recoveryEmail) return;
                                                    try {
                                                        const res = await fetch('/api/auth/email-check', {
                                                            method: 'POST',
                                                            body: JSON.stringify({ email: recoveryEmail })
                                                        });
                                                        const data = await res.json();
                                                        if (data.exists) {
                                                            document.cookie = `pse_remembered_userId=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
                                                            window.location.href = '/';
                                                        } else {
                                                            alert("Email no encontrado.");
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }}
                                                className="px-8 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[#39FF14]"
                                            >
                                                Entrar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="py-20 text-center space-y-10 animate-in zoom-in duration-500">
                                    <div className="w-32 h-32 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(57,255,20,0.5)]">
                                        <Trophy className="w-16 h-16 text-black animate-bounce" />
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-4xl font-black italic uppercase text-white leading-tight">¡Bienvenido a la<br /><span className="text-[#39FF14]">Evolución</span>!</h4>
                                        <p className="text-lg text-white/60 font-medium">Redirigiendo a tu panel de alto rendimiento...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 border-t border-white/5 opacity-30">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src={pseLandingConfig.branding.logo} className="w-8 h-8 object-contain" />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">{pseLandingConfig.branding.name}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center md:text-right">
                        © 2026 PSE GLOBAL // BUILT FOR DOMINANCE // POWERED BY SYNERGOS v3
                    </p>
                </div>
            </footer>
        </div>
    );
}
