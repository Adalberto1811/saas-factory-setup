"use client";

import { useRedBullStore, PlanTier } from "@/features/red-bull/store/useRedBullStore";
import { SquareCard } from "./ui/SquareCard";
import { SquareButton } from "./ui/SquareButton";
import { Check, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

const plans = [
    {
        id: "athlete" as PlanTier,
        name: "Athlete",
        price: 9,
        features: ["5 eventos/año", "Streaming HD", "Acceso a comunidad"],
    },
    {
        id: "pro" as PlanTier,
        name: "Pro",
        price: 29,
        highlight: "Más Popular",
        features: ["10 eventos/año", "Streaming 4K", "Registro anticipado", "Descuentos en merchandise"],
    },
    {
        id: "legend" as PlanTier,
        name: "Legend",
        price: 99,
        features: ["Eventos ilimitados", "Acceso VIP", "Meet & Greets", "2 sesiones coaching/año"],
    },
];

export function Plans() {
    const { selectedTier, setTier, addons, toggleAddon, calculateTotal } = useRedBullStore();
    const total = calculateTotal();
    const tax = total * 0.21;
    const finalTotal = total + tax;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Progress Indicator */}
            <div className="flex justify-between items-center mb-16 max-w-2xl mx-auto">
                {["REGISTRO", "PLANES", "PAGO"].map((step, i) => (
                    <div key={step} className="flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center font-black italic border-2",
                            i === 0 ? "bg-[#DB0A40] border-[#DB0A40] text-white" :
                                i === 1 ? "bg-white text-black border-white" : "border-white/20 text-white/20"
                        )}>
                            0{i + 1}
                        </div>
                        <span className={cn(
                            "text-xs font-black tracking-widest italic",
                            i <= 1 ? "text-white" : "text-white/20"
                        )}>{step}</span>
                        {i < 2 && <div className="hidden md:block w-24 border-t border-white/20" />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    {/* Plan Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <SquareCard
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col transition-all cursor-pointer group hover:scale-[1.02]",
                                    selectedTier === plan.id ? "border-[#FFCC00] ring-2 ring-[#FFCC00]" : "border-white/10"
                                )}
                                onClick={() => setTier(plan.id)}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFCC00] text-black text-[10px] font-black uppercase px-3 py-1 italic">
                                        {plan.highlight}
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black uppercase italic text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black italic text-[#DB0A40]">${plan.price}</span>
                                        <span className="text-white/40 text-xs font-bold uppercase">/mes</span>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-grow">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex gap-3 items-center text-sm text-white/70">
                                            <Check className="text-[#FFCC00]" size={16} />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <SquareButton
                                    variant={selectedTier === plan.id ? "primary" : "outline"}
                                    className="w-full mt-8"
                                    onClick={(e) => { e.stopPropagation(); setTier(plan.id); }}
                                >
                                    {selectedTier === plan.id ? "Seleccionado" : "Elegir"}
                                </SquareButton>
                            </SquareCard>
                        ))}
                    </div>

                    {/* Add-ons */}
                    {selectedTier && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h4 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                                <Info size={18} className="text-[#FFCC00]" />
                                Personaliza tu Desempeño
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={cn(
                                        "p-6 border-2 cursor-pointer transition-all flex justify-between items-center bg-[#001E36]",
                                        addons.includes("merch-box") ? "border-[#DB0A40]" : "border-white/10 hover:border-white/30"
                                    )}
                                    onClick={() => toggleAddon("merch-box")}
                                >
                                    <div>
                                        <h5 className="font-bold uppercase text-white">Caja de Merchandise</h5>
                                        <p className="text-xs text-white/50">EQUIPO EXCLUSIVO CADA MES</p>
                                    </div>
                                    <span className="text-lg font-black text-[#FFCC00]">+$25</span>
                                </div>
                                <div
                                    className={cn(
                                        "p-6 border-2 cursor-pointer transition-all flex justify-between items-center bg-[#001E36]",
                                        addons.includes("coaching-calls") ? "border-[#DB0A40]" : "border-white/10 hover:border-white/30"
                                    )}
                                    onClick={() => toggleAddon("coaching-calls")}
                                >
                                    <div>
                                        <h5 className="font-bold uppercase text-white">Llamadas de Coaching</h5>
                                        <p className="text-xs text-white/50">1-ON-1 CON INSTRUCTORES PRO</p>
                                    </div>
                                    <span className="text-lg font-black text-[#FFCC00]">+$50</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Real-time Order Summary (Sticky Sidebar) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-12 space-y-6">
                        <SquareCard className="border-l-4 border-l-[#FFCC00]">
                            <h3 className="text-lg font-black uppercase italic text-white mb-6 underline decoration-[#DB0A40] decoration-4 underline-offset-8">Resumen de Pedido</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm uppercase font-bold text-white/60">
                                    <span>Plan Seleccionado</span>
                                    <span className="text-white italic">{selectedTier || "---"}</span>
                                </div>
                                <div className="flex justify-between text-sm uppercase font-bold text-white/60">
                                    <span>Precio Base</span>
                                    <span className="text-white">${total - (addons.length > 0 ? (addons.includes("merch-box") ? 25 : 0) + (addons.includes("coaching-calls") ? 50 : 0) : 0)}</span>
                                </div>
                                {addons.map(addon => (
                                    <div key={addon} className="flex justify-between text-sm uppercase font-bold text-[#FFCC00]">
                                        <span>+ {addon === "merch-box" ? "Merch Box" : "Coaching"}</span>
                                        <span>${addon === "merch-box" ? 25 : 50}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-2 mb-8 text-white">
                                <div className="flex justify-between text-xs uppercase font-bold text-white/40">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs uppercase font-bold text-white/40">
                                    <span>Impuestos (21%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black italic pt-2">
                                    <span className="uppercase">Total</span>
                                    <span className="text-[#FFCC00]">${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <SquareButton
                                className="w-full"
                                variant="primary"
                                disabled={!selectedTier}
                                onClick={() => window.location.href = "/red-bull/checkout"}
                            >
                                Siguiente Paso
                            </SquareButton>
                        </SquareCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
