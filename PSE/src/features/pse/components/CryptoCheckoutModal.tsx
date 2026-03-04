"use client";

import { Trophy, ArrowRight, ShieldCheck, Wallet, QrCode, Mail, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useSession } from "next-auth/react";
import { pseLandingConfig } from "@/features/landing/config/pse-landing-config";

type PaymentMethod = "payid" | "trc20" | "meru" | null;

interface CryptoCheckoutModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function CryptoCheckoutModal({ isOpen, onClose }: CryptoCheckoutModalProps) {
    const { data: session } = useSession();
    const [method, setMethod] = useState<PaymentMethod>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [txHash, setTxHash] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Bóveda de Configuración
    const CONFIG = {
        BINANCE_PAY_ID: "519329292",
        TRC20_WALLET: "TUS6YHFALwprDDFZ65P2vXQB7MPrv49oEW",
        MERU_USER: "@meruuser", // Placeholder si se requiere
        MERU_FEE: 3, // $3 recargo por puente Merú
        ORIGINAL_PRICE: 59,
        MONTHLY_PRICE: 30,
        WHATSAPP_NUMBER: "584121234567" // Para fallback
    };

    if (!isOpen) return null;

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txHash) return;

        setIsSubmitting(true);
        // Simulamos envío al backend
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Aquí iría el llamado real a la API para registrar en Neon
        // await PaymentService.registerManualPayment(session?.user?.id, 4, method, txHash);

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 p-4">
                <div className="relative w-full max-w-md bg-[#0a0f12] border border-[#39FF14]/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(57,255,20,0.15)] text-center p-8 space-y-6">
                    <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase text-white">Payment in Verification</h3>
                        <p className="mt-2 text-white/60 text-sm">Your transaction has been sent to our financial team. We will activate your Pro Max slot momentarily.</p>
                    </div>
                    <button
                        onClick={() => { setIsSuccess(false); onClose?.(); }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-12 rounded-xl transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 p-4">
            <div className="relative w-full max-w-2xl bg-[#0a0f12] border border-synergos-neon-green/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(57,255,20,0.15)] animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-synergos-neon-green/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-synergos-electric-blue/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent" />
                </div>

                <div className="relative z-10 p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-4">
                        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#39FF14] to-teal-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.3)] border border-[#39FF14]/50">
                            <Trophy className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                                Activate <span className="text-[#39FF14]">Pro Max</span>
                            </h3>
                            <p className="mt-2 text-white/80 font-medium text-sm max-w-md mx-auto flex items-center justify-center gap-2">
                                Subscribe to Elite Performance for <span className="text-white/40 line-through">${CONFIG.ORIGINAL_PRICE}</span> <span className="text-[#39FF14] font-bold">${CONFIG.MONTHLY_PRICE} USDT</span> / month.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-synergos-neon-green/10 border border-synergos-neon-green/30 text-synergos-neon-green text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                                Limited Time Launch Discount
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-synergos-electric-blue text-sm font-bold uppercase tracking-wider mb-2">
                            <span className="w-5 h-5 rounded-full bg-synergos-electric-blue/20 flex items-center justify-center text-xs">1</span>
                            Select Transfer Method
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => setMethod("payid")}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${method === "payid" ? 'bg-synergos-electric-blue/10 border-synergos-electric-blue' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === "payid" ? 'bg-synergos-electric-blue/20 text-synergos-electric-blue' : 'bg-black/50 text-white/60'}`}>
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Binance PayID</h4>
                                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">Instant • 0 Fees</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setMethod("trc20")}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${method === "trc20" ? 'bg-synergos-neon-green/10 border-synergos-neon-green' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === "trc20" ? 'bg-synergos-neon-green/20 text-synergos-neon-green' : 'bg-black/50 text-white/60'}`}>
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">USDT (TRC20)</h4>
                                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">External Wallets</p>
                                </div>
                            </button>
                        </div>

                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setMethod("meru")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${method === "meru" ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'}`}
                            >
                                <Wallet className="w-3 h-3" />
                                Alternate: Merú App
                            </button>
                        </div>
                    </div>

                    {method && (
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-wider">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">2</span>
                                Send <span className="text-[#39FF14]">${method === 'meru' ? CONFIG.MONTHLY_PRICE + CONFIG.MERU_FEE : CONFIG.MONTHLY_PRICE} USDT</span> to this account
                            </div>

                            {method === "payid" && (
                                <div className="space-y-4">
                                    <div className="bg-synergos-electric-blue/10 border border-synergos-electric-blue/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs text-synergos-electric-blue font-bold tracking-widest uppercase mb-1">Binance Pay ID</span>
                                        <span className="text-3xl font-mono font-black text-white select-all tracking-wider">{CONFIG.BINANCE_PAY_ID}</span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(CONFIG.BINANCE_PAY_ID, 'payid')}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white h-12 rounded-xl text-sm font-bold transition-all"
                                    >
                                        {copied === 'payid' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        {copied === 'payid' ? 'COPIED!' : 'COPY PAY ID'}
                                    </button>
                                    <p className="text-[11px] text-white/40 text-center">Do not send funds via email. Use "Pay ID" in your Binance App.</p>
                                </div>
                            )}

                            {method === "trc20" && (
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="bg-white p-3 rounded-xl">
                                            <QRCode value={CONFIG.TRC20_WALLET} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                        </div>
                                        <div className="flex-1 w-full space-y-2">
                                            <div className="bg-[#1a1f24] border border-white/5 rounded-xl p-3">
                                                <span className="text-[10px] text-synergos-neon-green font-bold tracking-widest uppercase block mb-1">Network</span>
                                                <span className="text-sm font-bold text-white">Tron (TRC20)</span>
                                            </div>
                                            <div className="bg-[#1a1f24] border border-white/5 rounded-xl p-3 relative overflow-hidden group">
                                                <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase block mb-1">Deposit Address</span>
                                                <span className="text-sm font-mono text-white/90 break-all select-all block leading-tight">{CONFIG.TRC20_WALLET}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(CONFIG.TRC20_WALLET, 'wallet')}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white h-12 rounded-xl text-sm font-bold transition-all"
                                    >
                                        {copied === 'wallet' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        {copied === 'wallet' ? 'COPIED TO CLIPBOARD' : 'COPY DEPOSIT ADDRESS'}
                                    </button>
                                </div>
                            )}

                            {method === "meru" && (
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="bg-white p-3 rounded-xl">
                                            <QRCode value={`https://meru.app/${CONFIG.MERU_USER}`} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                        </div>
                                        <div className="flex-1 w-full space-y-2">
                                            <div className="bg-[#1a1f24] border border-white/5 rounded-xl p-3">
                                                <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase block mb-1">Merú Username</span>
                                                <span className="text-sm font-bold text-white">{CONFIG.MERU_USER}</span>
                                            </div>
                                            <div className="bg-[#1a1f24] border border-white/5 rounded-xl p-3 relative overflow-hidden group">
                                                <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase block mb-1">Total to Send (incl. $3 fee)</span>
                                                <span className="text-xl font-black text-[#39FF14] break-all select-all block leading-tight">${CONFIG.MONTHLY_PRICE + CONFIG.MERU_FEE} USDT</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(CONFIG.MERU_USER, 'meru')}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white h-12 rounded-xl text-sm font-bold transition-all"
                                    >
                                        {copied === 'meru' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        {copied === 'meru' ? 'COPIED TO CLIPBOARD' : 'COPY MERÚ USERNAME'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {method && (method === "payid" || method === "trc20" || method === "meru") && (
                        <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in delay-150 duration-500">
                            <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-wider mb-2">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">3</span>
                                Verify Transfer
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    placeholder="Paste the Binance Transaction Hash or ID here..."
                                    className="w-full h-14 bg-black/60 border border-white/20 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] rounded-xl pl-4 pr-32 text-white text-sm outline-none transition-all placeholder:text-white/20"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={!txHash || isSubmitting}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#39FF14] hover:bg-[#32e012] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Submit'}
                                    {!isSubmitting && <ArrowRight className="w-3 h-3" />}
                                </button>
                            </div>
                        </form>
                    )}

                    {!method && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Secure Encrypted Verification via Performance Gateway</span>
                        </div>
                    )}

                    {method && (
                        <div className="flex justify-center pt-2 opacity-30 grayscale transition-all duration-300">
                            <img src={pseLandingConfig.branding.logo} className="h-4 object-contain" alt="PSE Logo" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
