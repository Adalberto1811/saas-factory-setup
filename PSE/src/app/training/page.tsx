"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CronometroHiTech } from '@/features/training/components/CronometroHiTech';
import { Timer, Waves, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TrainingPage() {
    const { data: session } = useSession();
    const [workoutData, setWorkoutData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWorkout() {
            try {
                const res = await fetch('/api/training/current');
                const data = await res.json();

                // Mapeo correcto: data.data es el Microcycle, data.data.data es el JSON con el plan
                if (data && data.data && data.data.data && data.data.data.raw_response) {
                    setWorkoutData(data.data.data.raw_response);
                }
            } catch (err) {
                console.error("Error loading workout:", err);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            loadWorkout();
        }
    }, [session]);

    return (
        <div className="min-h-screen bg-[#05080a] text-white selection:bg-synergos-neon-green/30">

            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-synergos-electric-blue/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-synergos-neon-green/10 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 p-6 md:p-12">
                {/* Top Bar */}
                <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al Coach
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Waves className="w-5 h-5 text-synergos-electric-blue" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white italic">TRAINING MODE</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
                        <Timer className="w-20 h-20 text-synergos-electric-blue mb-6 animate-spin-slow" />
                        <p className="text-[12px] font-black uppercase tracking-[0.8em] text-synergos-electric-blue">Sincronizando Cerebro...</p>
                    </div>
                ) : workoutData ? (
                    <CronometroHiTech
                        trainingMarkdown={workoutData}
                        onFinish={async (sessionLog) => {
                            console.log("Workout Finished!", sessionLog);
                            try {
                                await fetch('/api/training/log', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        sessionLog,
                                        duration_seconds: sessionLog.durationSeconds,
                                        volume_meters: workoutData ? workoutData.length : 0 // Basic fallback, ideally parse totalVolume
                                    })
                                });
                                // Podríamos redirigir a un resumen o mostrar un modal de felicitación
                            } catch (error) {
                                console.error("Failed to save training log", error);
                            }
                        }}
                    />
                ) : (
                    <div className="max-w-2xl mx-auto text-center py-20 px-8 rounded-[4rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl">
                        <Timer className="w-24 h-24 mx-auto mb-8 text-slate-800" />
                        <h2 className="text-3xl font-black italic uppercase text-white mb-4">Sin Plan Activo</h2>
                        <p className="text-slate-400 font-medium mb-8">
                            Socio, aún no tienes un entrenamiento generado para esta semana.
                            Vuelve al Coach para que Alvin diseñe tu evolución.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-10 py-5 bg-synergos-electric-blue text-black font-black uppercase tracking-widest rounded-[2rem] shadow-[0_15px_40px_rgba(0,229,255,0.3)] hover:scale-105 transition-all text-sm"
                        >
                            Hablar con Alvin
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    );
}
