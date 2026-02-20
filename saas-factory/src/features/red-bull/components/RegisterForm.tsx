"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SquareButton } from "./ui/SquareButton";
import { SquareCard } from "./ui/SquareCard";
import { motion } from "framer-motion";

const registerSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: RegisterValues) => {
        console.log("Registration data:", data);
        // Simular redirección
        window.location.href = "/red-bull/plans";
    };

    return (
        <SquareCard className="mx-auto w-full max-w-md border-t-4 border-t-[#DB0A40]">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase text-white italic">Únete a la Élite</h2>
                <p className="text-sm text-white/60 uppercase tracking-widest mt-2">Crea tu cuenta de atleta</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#FFCC00]">Nombre Completo</label>
                    <input
                        {...register("fullName")}
                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:border-[#DB0A40] focus:ring-1 focus:ring-[#DB0A40] transition-colors outline-none rounded-none"
                        placeholder="PETER PARKER"
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#FFCC00]">Email</label>
                    <input
                        {...register("email")}
                        type="email"
                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:border-[#DB0A40] focus:ring-1 focus:ring-[#DB0A40] transition-colors outline-none rounded-none"
                        placeholder="ATLETA@REDBULL.COM"
                    />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#FFCC00]">Contraseña</label>
                    <input
                        {...register("password")}
                        type="password"
                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:border-[#DB0A40] focus:ring-1 focus:ring-[#DB0A40] transition-colors outline-none rounded-none"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.password.message}</p>}
                </div>

                <SquareButton
                    type="submit"
                    className="w-full"
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? "Procesando..." : "Crear Mi Cuenta v3"}
                </SquareButton>

                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-white/40">O continuar con</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="flex items-center justify-center gap-2 border border-white/20 py-2 hover:bg-white/5 transition-colors uppercase text-[10px] font-bold text-white">
                        Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 border border-white/20 py-2 hover:bg-white/5 transition-colors uppercase text-[10px] font-bold text-white">
                        Facebook
                    </button>
                </div>
            </form>
        </SquareCard>
    );
}
