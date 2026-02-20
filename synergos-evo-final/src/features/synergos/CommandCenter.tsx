'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Sparkles, Command, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MarketSynWidget from './MarketSynWidget';

export default function CommandCenter() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        onError: (error) => {
            console.error("Chat Error:", error);
            alert("Error conectando con Agent Zero: " + error.message);
        },
        onResponse: (response) => {
            console.log("🔵 [CLIENT] Received response headers:", response);
        },
        onFinish: (message) => {
            console.log("🔵 [CLIENT] Stream finished:", message);
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-red-500/30">
            {/* Background Glow (Subtle Fixed) */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-lime-900/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Glass Container */}
            <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto p-4 md:p-8 pt-12 md:pt-16"> {/* Added pt-12/pt-16 for spacing */}

                {/* Header (Floating Glass) */}
                <header className="flex items-center justify-between px-6 py-4 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl mb-8 group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                        {/* Real Logo from User */}
                        <div className="relative w-12 h-12 group">
                            <div className="absolute inset-0 bg-green-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <img src="/logo.png" alt="Synergos Logo" className="relative w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
                                Synergos<span className="text-lime-400 font-extrabold">IA</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Agent Zero Active
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_8px_#84cc16]"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                            <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6]"></div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">v3.5.3</span>
                    </div>
                </header>

                {/* Chat Stream (The Only Screen) */}
                <main className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center select-none pointer-events-none">
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-red-500 blur-[40px] opacity-20 rounded-full"></div>
                                <img src="/logo.png" alt="Synergos" className="w-24 h-24 relative z-10 drop-shadow-2xl animate-in zoom-in duration-500" />
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                                <span className="text-white">La Sinergia que</span><br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-yellow-400 to-red-500">Transforma tu Negocio</span>
                            </h2>

                            <p className="max-w-md text-gray-500 text-sm mb-8">
                                Automatizamos tus procesos más críticos con Agentes de Generación de Leads, Soporte al Cliente y Workflows Inteligentes.
                            </p>

                            <div className="flex gap-2 opacity-80">
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 border-green-500/20 text-green-400/80">MarketSyn (Marketing)</span>
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 border-red-500/20 text-red-400/80">SynCards (Branding)</span>
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 border-yellow-500/20 text-yellow-400/80">Suite Legal (ABOGADOS)</span>
                            </div>
                        </div>
                    )}

                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl backdrop-blur-2xl border shadow-xl transition-all ${m.role === 'user'
                                ? 'bg-gradient-to-br from-red-600/10 to-red-900/10 border-red-500/20 text-white rounded-tr-sm shadow-red-900/10'
                                : 'bg-white/5 border-white/10 text-gray-100 rounded-tl-sm shadow-black/20'
                                }`}
                            >
                                <div className="prose prose-invert prose-p:leading-relaxed prose-sm">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>

                                {/* Tool Invocations (Widgets) */}
                                {m.toolInvocations?.map((toolInvocation: any) => {
                                    if (toolInvocation.toolName === 'generateCampaign' && toolInvocation.result) {
                                        return (
                                            <div key={toolInvocation.toolCallId} className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <MarketSynWidget data={toolInvocation.result} />
                                            </div>
                                        );
                                    }
                                    return null; // Don't show generic loading state, keep UI clean
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Minimalist Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                                <span className="text-[10px] text-gray-400 font-mono tracking-widest">THINKING</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* Input Bar (Floating Glass) */}
                <div className="mt-6 mb-4 relative z-50">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!input.trim()) return;
                            handleSubmit(e);
                        }}
                        className="relative group z-50"
                    >
                        {/* Dynamic Border Gradient */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-2xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur-[1px]"></div>

                        <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl p-2 shadow-2xl z-50">

                            <button type="button" className="p-3 text-gray-400 hover:text-teal-400 transition-colors hover:bg-white/5 rounded-xl group/btn">
                                <Paperclip className="w-5 h-5 group-hover/btn:rotate-45 transition-transform" />
                            </button>

                            <input
                                className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder:text-gray-600 font-medium"
                                placeholder="Escribe tu comando o instrucción..."
                                value={input}
                                onChange={handleInputChange}
                                autoFocus
                            />

                            <div className="flex items-center gap-1">
                                <button type="button" className="p-3 text-gray-400 hover:text-yellow-400 transition-colors hover:bg-white/5 rounded-xl">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button type="submit" className="p-3 bg-white text-black rounded-xl hover:bg-gradient-to-r hover:from-teal-400 hover:to-green-400 hover:text-white hover:scale-105 active:scale-95 transition-all font-bold shadow-lg cursor-pointer z-50">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Manual Debug Controls - Hidden by default or styled minimally */}
                    <div className="flex justify-center mt-3 opacity-50 hover:opacity-100 transition-opacity">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/chat', {
                                        method: 'POST',
                                        body: JSON.stringify({ messages: [{ role: 'user', content: 'Ping' }] })
                                    });
                                    if (res.ok) alert("✅ Server Online");
                                    else alert("❌ Server Error: " + res.status);
                                } catch (e: any) { alert("❌ Network Error"); }
                            }}
                            className="text-[9px] text-gray-700 hover:text-red-500 cursor-pointer flex items-center gap-1"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
                            SYSTEM STATUS
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
