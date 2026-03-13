"use client";

import { Activity, Beaker, Brain, Target, Zap, Waves, Upload, Settings, Video, Timer } from 'lucide-react';
import Link from 'next/link';
import { ThreeBackground } from '@/shared/components/ThreeBackground';
import { CoachChat } from '@/features/coach/components/CoachChat';

export default function PerformancePage() {
    return (
        <main className="min-h-screen bg-[#020408] flex flex-col items-center relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-synergos-electric-blue/20 rounded-full blur-[180px] pointer-events-none animate-pulse" />
            <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-synergos-neon-green/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Premium 3D Background Layer */}
            <ThreeBackground />

            {/* Premium Branding Signature (Synergos) - Top Right (Mobile Optimized) */}
            <div className="absolute top-4 right-4 md:top-8 md:right-12 flex items-center gap-2 md:gap-4 z-50 group py-2 md:py-3 px-4 md:px-6 glass-premium rounded-full border border-synergos-electric-blue/20 opacity-80 hover:opacity-100 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] cursor-pointer">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] md:text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] group-hover:neon-text-blue transition-all">Synergos</span>
                    <span className="hidden md:block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Secure // v3.5</span>
                </div>
                <img src="/performance/logo.png" alt="Synergos Brand" className="w-5 h-5 md:w-8 md:h-8 object-contain" />
            </div>

            {/* Minimalist Glass Header */}
            <header className="w-full max-w-[100rem] px-4 md:px-16 pt-16 md:pt-20 pb-4 md:pb-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-4 md:gap-10 z-[40]">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-10">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-4 bg-gradient-to-r from-synergos-electric-blue/40 to-synergos-neon-green/40 rounded-full blur-2xl opacity-60 md:opacity-0 group-hover:opacity-60 transition duration-700" />
                        <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border border-white/20 p-3 md:p-5 glass-premium overflow-hidden flex items-center justify-center transition-all group-hover:scale-110 active:scale-95 duration-500 shadow-2xl">
                            <img
                                src="/performance/pse_metallic_logo_v2.png"
                                alt="PSE Metallic Logo v2"
                                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col text-center md:text-left">
                        <h1 className="text-2xl md:text-5xl font-black tracking-tighter flex flex-col italic leading-[0.9] mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-synergos-electric-blue">
                                PERFORMANCE
                            </span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-synergos-electric-blue via-synergos-neon-green to-synergos-electric-blue">
                                SWIMMING EVOLUTION
                            </span>
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="text-[10px] text-synergos-neon-green font-black uppercase tracking-[0.4em] neon-text-green px-2 py-0.5 bg-black/40 rounded">PRO_MAX_CORE</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-[100rem] flex-1 flex flex-col md:flex-row gap-4 md:gap-8 px-2 md:px-16 pb-4 md:pb-12 z-10">
                {/* Main Liquid Glass Chat Area - Flattened for visibility */}
                <section className="flex-1 flex flex-col h-[65vh] md:h-[calc(100vh-280px)] relative order-1 safe-area-bottom">
                    <CoachChat />
                </section>

                {/* Enhanced Vertical Actions */}
                <aside className="w-full md:w-24 flex md:flex-col items-center justify-center md:justify-start gap-4 order-2 md:order-2 pb-safe relative">
                    <div className="flex flex-row md:flex-col gap-6 p-4 rounded-3xl md:rounded-full border border-synergos-electric-blue/20 glass-premium shadow-[0_0_50px_rgba(0,229,255,0.1)] items-center bg-black/40 backdrop-blur-2xl">
                        <Link
                            href="/training"
                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-synergos-neon-green text-black flex flex-col items-center justify-center shadow-[0_10px_50px_rgba(57,255,20,0.5)] hover:shadow-[0_15px_70px_rgba(57,255,20,0.7)] hover:scale-110 active:scale-90 transition-all group relative overflow-hidden"
                            title="ENTRENAR YA (Operativo)"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                            <Timer className="w-8 md:w-10 h-8 md:h-10 fill-black group-hover:rotate-12 transition-transform relative z-10" />
                            <span className="hidden md:block text-[8px] font-black uppercase mt-1 relative z-10">GO</span>
                        </Link>

                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('PSE_TRIGGER_UPLOAD'))}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                            title="Media"
                        >
                            <Upload className="w-6 h-6" />
                        </button>

                        <button
                            title="Video Lab"
                            onClick={() => window.dispatchEvent(new CustomEvent('PSE_TRIGGER_VIDEO'))}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-full bg-synergos-electric-blue/5 flex items-center justify-center text-synergos-electric-blue hover:bg-synergos-electric-blue hover:text-black transition-all"
                        >
                            <Video className="w-6 h-6" />
                        </button>

                        <div className="hidden md:block w-8 h-[1px] bg-white/10 my-2" />

                        <button
                            title="Config"
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-transparent flex items-center justify-center text-slate-600 hover:text-white transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </aside>
            </div>

            {/* Native style tag removed if needed or kept if standard */}
        </main>
    );
}
