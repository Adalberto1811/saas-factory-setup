"use client";

import { Trophy, ArrowRight, ShieldCheck, Activity, Brain, Wallet, MessageCircle } from "lucide-react";
import { useState } from "react";
import { pseLandingConfig } from "@/features/landing/config/pse-landing-config";
import { useSession } from "next-auth/react";

interface CreemPaywallModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function CreemPaywallModal({ isOpen, onClose }: CreemPaywallModalProps) {
    const { data: session } = useSession();

    if (!isOpen) return null;

    // TODO: REEMPLAZA ESTOS DATOS CON TUS CREDENCIALES REALES
    const BINANCE_PAY_ID = "214150552"; // Ejemplo
    const EMAIL_ZELLE = "pagos@performance.com"; // Ejemplo
    const WHATSAPP_NUMBER = "584121234567"; // Número sin el +

    const rawMessage = `Hola Coach, soy el atleta ${session?.user?.email || '[Mi Correo]'} y acabo de transferir mis $59 USD para activar mi suscripción Elite Pro Max. Aquí te envío el comprobante de pago.`;
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 p-4">
            <div className="relative w-full max-w-2xl bg-[#0a0f12] border border-synergos-neon-green/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(57,255,20,0.15)] animate-in zoom-in-95 duration-500">
                {/* Premium Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-synergos-neon-green/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-synergos-electric-blue/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent" />
                </div>

                <div className="relative z-10 p-8 md:p-10 text-center space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#39FF14] to-teal-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.3)] border border-[#39FF14]/50 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Trophy className="w-8 h-8 text-black relative z-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                                Evaluación <span className="text-[#39FF14]">Exitosa</span>
                            </h3>
                            <p className="mt-2 text-white/60 font-medium text-xs max-w-sm mx-auto leading-relaxed">
                                Tu periodo de iniciación ha concluido y el sistema ha bloqueado el acceso. Para mantener tu cuota de progresión actívate como <strong>Atleta Pro Max</strong> ($59 USD/Mes).
                            </p>
                        </div>
                    </div>

                    {/* Direct Payment Instructions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-5 backdrop-blur-sm">

                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                            <Wallet className="w-5 h-5 text-synergos-electric-blue" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-white/90">Instrucciones de Pago Directo</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Binance Option */}
                            <div className="space-y-1 p-3 bg-black/40 rounded-xl border border-synergos-electric-blue/20">
                                <span className="text-[10px] text-synergos-electric-blue font-bold uppercase tracking-wider block">1. Vía Binance Pay</span>
                                <p className="text-lg font-mono font-bold text-white select-all">{BINANCE_PAY_ID}</p>
                                <span className="text-[9px] text-white/40 font-mono">ID de Binance</span>
                            </div>

                            {/* Zelle Option */}
                            <div className="space-y-1 p-3 bg-black/40 rounded-xl border border-synergos-electric-blue/20">
                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">2. Vía Zelle</span>
                                <p className="text-sm font-mono font-bold text-white select-all overflow-hidden text-ellipsis">{EMAIL_ZELLE}</p>
                                <span className="text-[9px] text-white/40 font-mono">Correo Registrado</span>
                            </div>
                        </div>

                    </div>

                    {/* Action Step */}
                    <div className="space-y-4 pt-2">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#39FF14] hover:bg-[#32e012] text-black h-14 rounded-2xl text-base font-black uppercase tracking-[0.15em] transition-all shadow-[0_10px_30px_rgba(57,255,20,0.2)] hover:shadow-[0_15px_40px_rgba(57,255,20,0.4)] hover:scale-[1.02] active:scale-95 group"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>Notificar Pago y Activar Plaza</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">El acceso Premium se activará manualmente en minutos</span>
                        </div>
                    </div>

                    {/* Logotipo Footer */}
                    <div className="flex justify-center pt-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        <img src={pseLandingConfig.branding.logo} className="h-5 object-contain" alt="PSE Logo" />
                    </div>
                </div>
            </div>
        </div>
    );
}
