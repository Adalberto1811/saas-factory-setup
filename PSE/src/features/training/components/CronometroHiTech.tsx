"use client";

import { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipForward, ChevronRight, ChevronLeft, CheckCircle2, Timer, Waves, Zap, Activity } from 'lucide-react';
import { useTimerEngine } from '../hooks/useTimerEngine';
import { parseWorkout, WorkoutStep, WorkoutSession } from '../lib/workoutParser';

interface Props {
    trainingMarkdown: string;
    onFinish?: (session: any) => void;
}

export function CronometroHiTech({ trainingMarkdown, onFinish }: Props) {
    const sessions = useMemo(() => {
        console.log("RAW MARKDOWN GENERATED:", trainingMarkdown);
        const parsed = parseWorkout(trainingMarkdown);
        console.log("PARSED SESSIONS:", parsed);
        return parsed;
    }, [trainingMarkdown]);
    const [activeSessionIndex, setActiveSessionIndex] = useState(0);

    const currentSession = sessions[activeSessionIndex];

    const {
        currentTime,
        currentRep,
        isResting,
        currentStepIndex,
        isActive,
        isPaused,
        start,
        pause,
        reset,
        nextStep,
        manualLap,
        currentStep
    } = useTimerEngine(currentSession?.steps || [], onFinish);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!currentSession) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-white/5 rounded-[3rem] bg-black/20 backdrop-blur-xl">
                <Timer className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Esperando Plan del Coach...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto p-4 md:p-8">
            {/* Dynamic Background Glow */}
            <div className={`absolute inset-0 blur-[120px] transition-all duration-1000 -z-10 opacity-30 ${isResting ? 'bg-synergos-electric-blue' : isActive ? 'bg-synergos-neon-green' : 'bg-white/5'}`} />

            {/* Main Glass Container */}
            <div className="bg-[#05080a]/60 backdrop-blur-[40px] border border-white/10 rounded-[4rem] p-8 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative group">

                {/* Header: Session Info */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-synergos-electric-blue">
                            <span className="w-8 h-[1px] bg-synergos-electric-blue/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Session Mode</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                            {currentSession.day} <span className="text-white/20">|</span> {currentSession.direction}
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl md:text-6xl font-black text-white/10 italic">{currentSession.totalVolume}KM</span>
                    </div>
                </div>

                {/* Big Display Area */}
                <div className="flex flex-col items-center justify-center py-10 md:py-20 relative">

                    {/* Circular Progress (Visual only for now) */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10">
                        <div className={`w-64 h-64 md:w-96 md:h-96 rounded-full border-[20px] border-white/5 transition-all duration-1000 ${isActive && !isPaused ? 'animate-pulse scale-110' : ''}`} />
                    </div>

                    <div className="text-center space-y-2">
                        <span className={`text-[12px] font-black uppercase tracking-[0.6em] transition-colors duration-500 ${isResting ? 'text-synergos-electric-blue' : 'text-synergos-neon-green'}`}>
                            {isResting ? 'Descanso Activo' : 'Serie en Progreso'}
                        </span>
                        <div className="flex items-center justify-center gap-4">
                            <h1 className="text-[100px] md:text-[180px] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                {formatTime(currentTime)}
                            </h1>
                        </div>
                    </div>

                    {/* Rep Counter */}
                    <div className="mt-8 flex items-center gap-4">
                        <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="text-xs font-bold text-slate-400 mr-2">REP</span>
                            <span className="text-xl font-black text-white">{currentRep}</span>
                            <span className="text-xl font-black text-white/20 mx-1">/</span>
                            <span className="text-xl font-black text-white/40">{currentStep?.repetitions}</span>
                        </div>
                        <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="text-xs font-bold text-slate-400 mr-2">BPM</span>
                            <Activity className="w-4 h-4 text-synergos-red inline mr-1 animate-pulse" />
                            <span className="text-xl font-black text-white">--</span>
                        </div>
                    </div>
                </div>

                {/* Series Explorer (Liquid List) */}
                <div className="mt-12 space-y-3">
                    {currentSession.steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`p-6 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between group/step ${idx === currentStepIndex
                                ? 'bg-white/10 border-white/20 scale-[1.02] shadow-2xl'
                                : idx < currentStepIndex
                                    ? 'opacity-40 grayscale blur-[1px]'
                                    : 'bg-transparent border-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${idx === currentStepIndex ? 'bg-synergos-electric-blue/20 border-synergos-electric-blue text-synergos-electric-blue' : 'bg-white/5 border-white/5 text-slate-600'
                                    }`}>
                                    {idx < currentStepIndex ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-black italic text-lg">{idx + 1}</span>}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-lg italic uppercase">{step.repetitions}x{step.distance}m</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {step.targetTime ? `Ritmo: ${step.targetTime}` : 'Ritmo: Progresivo'} <span className="mx-2 opacity-20">|</span> Descanso: {step.restSeconds}s
                                    </p>
                                </div>
                            </div>

                            {idx === currentStepIndex && (
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-synergos-neon-green animate-pulse" />
                                    <span className="text-xs font-black text-synergos-neon-green uppercase tracking-tighter">Running</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Liquid Action Bar */}
                <div className="mt-14 flex items-center justify-around gap-6">
                    <button
                        onClick={reset}
                        className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>

                    <button
                        onClick={isActive && !isPaused ? pause : start}
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-[3.5rem] flex items-center justify-center transition-all shadow-2xl group/play ${isActive && !isPaused
                            ? 'bg-synergos-red shadow-[0_15px_60px_rgba(220,38,38,0.4)]'
                            : 'bg-synergos-neon-green shadow-[0_15px_60px_rgba(57,255,20,0.4)]'
                            }`}
                    >
                        {isActive && !isPaused ? (
                            <Pause className="w-10 h-10 md:w-14 md:h-14 fill-black text-black" />
                        ) : (
                            <Play className="w-10 h-10 md:w-14 md:h-14 fill-black text-black ml-2" />
                        )}
                    </button>

                    <button
                        onClick={manualLap}
                        disabled={!isActive || isResting}
                        className="w-16 h-16 rounded-[1.5rem] bg-synergos-electric-blue text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl disabled:opacity-20 disabled:grayscale"
                    >
                        <SkipForward className="w-8 h-8 fill-black" />
                    </button>
                </div>

                {/* Progress Timeline */}
                <div className="mt-16 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-synergos-electric-blue transition-all duration-1000"
                        style={{ width: `${((currentStepIndex + 1) / currentSession.steps.length) * 100}%` }}
                    />
                </div>

            </div>

            {/* Footer Navigation */}
            <div className="mt-10 flex justify-center gap-4">
                {sessions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { reset(); setActiveSessionIndex(i); }}
                        className={`w-3 h-3 rounded-full transition-all ${i === activeSessionIndex ? 'bg-synergos-electric-blue w-8' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
}
