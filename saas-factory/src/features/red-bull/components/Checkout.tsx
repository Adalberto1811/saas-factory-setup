"use client";

import { useRedBullStore } from "@/features/red-bull/store/useRedBullStore";
import { SquareCard } from "./ui/SquareCard";
import { SquareButton } from "./ui/SquareButton";
import { CreditCard, Lock, ShieldCheck, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const checkoutSchema = z.object({
    firstName: z.string().min(2, "Mínimo 2 letras"),
    lastName: z.string().min(2, "Mínimo 2 letras"),
    address: z.string().min(5, "Dirección requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    zipCode: z.string().min(5, "CP inválido"),
    terms: z.literal(true, { message: "Debes aceptar los términos" }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export function Checkout() {
    const { selectedTier, addons, calculateTotal } = useRedBullStore();
    const [isSuccess, setIsSuccess] = useState(false);
    const total = calculateTotal();
    const tax = total * 0.21;
    const finalTotal = total + tax;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = async (data: CheckoutValues) => {
        // Simular procesamiento de Stripe
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSuccess(true);
        // Borrar store después de éxito (opcional)
        setTimeout(() => {
            window.location.href = "/red-bull/dashboard-placeholder";
        }, 3000);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-24 w-24 bg-[#FFCC00] text-black flex items-center justify-center rounded-none"
                >
                    <Check size={48} className="font-black" />
                </motion.div>
                <h2 className="text-4xl font-black uppercase italic text-white">¡Misión Cumplida!</h2>
                <p className="text-white/60">Tu acceso a Red Bull Experiences ha sido activado. Redirigiendo...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Progress Indicator (Simplified) */}
            <div className="flex justify-between items-center mb-16 max-w-2xl mx-auto opacity-50">
                {["REGISTRO", "PLANES", "PAGO"].map((step, i) => (
                    <div key={step} className="flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center font-black italic border-2",
                            i === 2 ? "bg-white text-black border-white" : "bg-[#DB0A40] border-[#DB0A40] text-white"
                        )}>
                            0{i + 1}
                        </div>
                        <span className="text-xs font-black tracking-widest italic text-white">{step}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Forms */}
                <div className="space-y-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-xl font-black uppercase italic text-white border-l-4 border-[#DB0A40] pl-4">Información de Facturación</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-white/40">Nombre</label>
                                    <input {...register("firstName")} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-[#FFCC00]" />
                                    {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-white/40">Apellido</label>
                                    <input {...register("lastName")} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-[#FFCC00]" />
                                    {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-white/40">Dirección</label>
                                <input {...register("address")} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-[#FFCC00]" placeholder="Av. Velocidad 123" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-white/40">Ciudad</label>
                                    <input {...register("city")} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-[#FFCC00]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-white/40">Código Postal</label>
                                    <input {...register("zipCode")} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-[#FFCC00]" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-black uppercase italic text-white border-l-4 border-[#DB0A40] pl-4">Método de Pago</h3>
                            <SquareCard className="bg-black/40 border-dashed border-white/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex gap-2">
                                        <CreditCard size={20} className="text-[#FFCC00]" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white">Tarjeta Segura (Stripe)</span>
                                    </div>
                                    <Lock size={16} className="text-white/40" />
                                </div>
                                {/* Placeholder for Stripe Element */}
                                <div className="bg-white/5 border border-white/10 p-4 mb-4 text-white/40 font-mono text-sm tracking-wider">
                                    XXXX XXXX XXXX XXXX  MM / YY  CVC
                                </div>
                                <p className="text-[9px] text-white/40 uppercase text-center flex items-center justify-center gap-2">
                                    <ShieldCheck size={12} /> Cifrado de grado militar de 256 bits
                                </p>
                            </SquareCard>
                        </section>

                        <div className="space-y-4">
                            <label className="flex gap-3 items-center cursor-pointer group">
                                <input type="checkbox" {...register("terms")} className="h-5 w-5 rounded-none appearance-none border-2 border-white/20 checked:bg-[#DB0A40] checked:border-[#DB0A40] transition-all" />
                                <span className="text-[10px] font-bold uppercase text-white/60 group-hover:text-white transition-colors">Acepto los términos y política de privacidad</span>
                            </label>
                            {errors.terms && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.terms.message}</p>}
                        </div>

                        <SquareButton type="submit" className="w-full h-16 text-lg" disabled={isSubmitting}>
                            {isSubmitting ? "Autenticando..." : `Finalizar Compra - $${finalTotal.toFixed(2)}`}
                        </SquareButton>
                    </form>
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-12 space-y-6">
                        <SquareCard className="border-b-4 border-b-[#DB0A40]">
                            <h3 className="text-lg font-black uppercase italic text-white mb-6">Tu Configuración</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between">
                                    <span className="text-sm font-bold uppercase text-white/60">Suscripción {selectedTier}</span>
                                    <span className="text-white font-black italic">
                                        ${selectedTier === "athlete" ? 9 : selectedTier === "pro" ? 29 : 99}
                                    </span>
                                </div>
                                {addons.map(addon => (
                                    <div key={addon} className="flex justify-between">
                                        <span className="text-sm font-bold uppercase text-[#FFCC00]">Add-on: {addon === "merch-box" ? "Merch Box" : "Coaching"}</span>
                                        <span className="text-white font-bold italic">+${addon === "merch-box" ? 25 : 50}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-2 mb-8">
                                <div className="flex justify-between text-white/40 font-bold uppercase text-xs">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/40 font-bold uppercase text-xs">
                                    <span>TVA (21%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-2xl font-black italic text-[#FFCC00] pt-2">
                                    <span>CANTIDAD TOTAL</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center p-3 border border-white/5 bg-white/5 text-center">
                                    <Truck size={16} className="text-[#DB0A40] mb-2" />
                                    <span className="text-[8px] font-bold text-white uppercase">Soporte 24/7</span>
                                </div>
                                <div className="flex flex-col items-center p-3 border border-white/5 bg-white/5 text-center">
                                    <ShieldCheck size={16} className="text-[#FFCC00] mb-2" />
                                    <span className="text-[8px] font-bold text-white uppercase">Garantía Pro</span>
                                </div>
                            </div>
                        </SquareCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Check({ size, className }: { size?: number; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
