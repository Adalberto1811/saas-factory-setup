'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Sparkles, Command, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CommandCenter() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="min-h-screen w-full bg-black text-white overflow-hidden relative font-sans selection:bg-fuchsia-500/30">
            {/* Living Background (Aurora) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Glass Container */}
            <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto p-4 md:p-8">

                {/* Header (Floating Glass) */}
                <header className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                            <BrainCircuit className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Synergos <span className="text-fuchsia-400 font-light">Evo</span></h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Agent Zero Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-green-500/80 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-xs font-medium text-gray-400 opacity-80">v3.5.0</span>
                    </div>
                </header>

                {/* Chat Stream (The Only Screen) */}
                <main className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none pointer-events-none">
                            <Sparkles className="w-24 h-24 mb-4 text-white/10" />
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/10">¿Qué construimos hoy?</h2>
                            <p className="mt-2 text-sm text-gray-500">Marketing • Legal • Identidad • Estrategia</p>
                        </div>
                    )}

                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl backdrop-blur-md border shadow-xl transition-all ${m.role === 'user'
                                        ? 'bg-fuchsia-600/20 border-fuchsia-500/30 text-white rounded-tr-sm'
                                        : 'bg-white/5 border-white/10 text-gray-100 rounded-tl-sm'
                                    }`}
                            >
                                <div className="prose prose-invert prose-p:leading-relaxed prose-sm">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-75" />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* Input Bar (Floating Glass) */}
                <div className="mt-6 mb-2">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                        <div className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">

                            <button type="button" className="p-3 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                                <Paperclip className="w-5 h-5" />
                            </button>

                            <input
                                className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder:text-gray-600"
                                placeholder="Escribe tu comando o instrucción..."
                                value={input}
                                onChange={handleInputChange}
                                autoFocus
                            />

                            <div className="flex items-center gap-1">
                                <button type="button" className="p-3 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button type="submit" disabled={!input.trim()} className="p-3 bg-white text-black rounded-xl hover:bg-fuchsia-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 font-bold">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <p className="text-center text-[10px] text-gray-600 mt-3 font-medium">Synergos AI Zero • Powered by Vercel SDK</p>
                </div>

            </div>
        </div>
    );
}
