"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnthropometricRecord, createAnthropometryRecord } from "@/shared/services/AnthropometryService";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Somatochart } from "./Somatochart";
import { AnthroAnalysis } from "./AnthroAnalysis";
import { calculateSomatotype, calculateBMI, calculateSlaughterLohman, BodyComposition } from "../utils/calculations";
import { Brain, Target, TrendingUp, TrendingDown, ClipboardCheck, IdCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../shared/components/ui/alert";
// Assuming these icons are available

const anthroSchema = z.object({
    athlete_name: z.string().min(2, "Mínimo 2 caracteres"),
    birth_date: z.string(),
    date: z.string().min(10, "Fecha de elaboración requerida"),
    modality: z.string().min(2, "Mínimo 2 caracteres"),
    id_number: z.string().min(5, "ID Inválido (Cédula/Documento)"),
    gender: z.enum(["male", "female"]),
    age: z.number().min(5).max(100),
    training_stage: z.string().optional(),
    weight_kg: z.number().min(30).max(200),
    height_cm: z.number().min(100).max(250),
    wingspan_cm: z.number().optional(),
    triceps_mm: z.number(),
    subscapular_mm: z.number(),
    biceps_mm: z.number(),
    bicipital_mm: z.number().optional(),
    iliac_crest_mm: z.number(),
    supraspinale_mm: z.number(),
    abdominal_mm: z.number(),
    front_thigh_mm: z.number(),
    medial_calf_mm: z.number(),
    // peroneal_mm: z.number().optional(), // Removed
    arm_relaxed_cm: z.number(),
    arm_flexed_cm: z.number(),
    waist_cm: z.number(),
    // abdomen_cm: z.number().optional(), // Removed
    hip_cm: z.number(),
    // thigh_cm: z.number(), // Removed for redundancy
    thigh_upper_cm: z.number().optional(),
    thigh_mid_cm: z.number().optional(),
    calf_cm: z.number(),
    // forearm_cm: z.number().optional(), // Removed
    humerus_cm: z.number(),
    femur_cm: z.number(),
});

type AnthroFormData = z.infer<typeof anthroSchema>;

export function AnthroForm({ userId, onSuccess }: { userId: number; onSuccess?: () => void }) {
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, watch, reset } = useForm<AnthroFormData>({
        resolver: zodResolver(anthroSchema),
        defaultValues: {
            gender: "male",
            training_stage: "General",
            date: new Date().toISOString().split('T')[0],
        }
    });

    // const [isScanning, setIsScanning] = useState(false); // Removed

    const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // setIsScanning(true); // Removed
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/performance/api/anthropometry/ocr", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            // Auto-fill form fields
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined && data[key] !== null) { // Ensure value exists
                    setValue(key as keyof AnthroFormData, data[key]);
                }
            });
        } catch (error) {
            console.error("OCR Error:", error);
        } finally {
            // setIsScanning(false); // Removed
        }
    };

    const onSubmit = async (formData: AnthroFormData) => {
        try {
            // 1. Perform Calculations
            const somatotype = calculateSomatotype({
                height_cm: formData.height_cm,
                weight_kg: formData.weight_kg,
                triceps_mm: formData.triceps_mm,
                subscapular_mm: formData.subscapular_mm,
                supraspinale_mm: formData.supraspinale_mm,
                humerus_cm: formData.humerus_cm,
                femur_cm: formData.femur_cm,
                arm_flexed_cm: formData.arm_flexed_cm,
                calf_cm: formData.calf_cm,
                triceps_skinfold_mm: formData.triceps_mm,
                calf_skinfold_mm: formData.medial_calf_mm,
            });

            const bmiData = calculateBMI(formData.weight_kg, formData.height_cm);
            const fat_percentage = calculateSlaughterLohman(formData.triceps_mm, formData.subscapular_mm, formData.gender);

            // 2. Save with calculated data
            await createAnthropometryRecord({
                user_id: userId,
                ...formData,
                somatotype,
                bmi: bmiData.value,
                bmi_percentile: bmiData.percentile,
                fat_percentage,
                // Muscle mass estimate (simplified Matiegka variant)
                muscle_mass_kg: Number((formData.weight_kg * 0.45).toFixed(2)),
            });
            setSubmitStatus('success');
            setTimeout(() => setSubmitStatus('idle'), 5000);
            reset();
            onSuccess?.();
        } catch (error) {
            console.error("Error saving records:", error);
            setSubmitStatus('error');
        }
    };

    return (
        <Card className="glass-premium border-amber-500/30 overflow-hidden">
            <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
                <CardTitle className="flex justify-between items-center text-amber-400">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Ingreso Antropométrico Pro v3.3
                    </div>
                    <label className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black px-4 py-2 rounded-full transition-all flex items-center gap-2">
                        <ClipboardCheck className="w-3 h-3" />
                        ESCANEAR HOJA ISAK
                        <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
                    </label>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Seccion 1: Identificacion del Atleta */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 border-b border-white/10 pb-2">
                            <IdCard className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Identificación del Atleta</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase opacity-50 font-bold">Nombre Completo</label>
                                <Input {...register("athlete_name")} className="bg-white/5" placeholder="Nombre completo" />
                                {errors.athlete_name && <p className="text-[10px] text-red-400">{errors.athlete_name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase opacity-50 font-bold">Cédula / Documento</label>
                                <Input {...register("id_number")} className="bg-white/5" placeholder="Documento de identidad" />
                                {errors.id_number && <p className="text-[10px] text-red-400">{errors.id_number.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase opacity-50 font-bold">Modalidad / Deporte</label>
                                <Input {...register("modality")} className="bg-white/5" placeholder="Ej: Natación" />
                                {errors.modality && <p className="text-[10px] text-red-400">{errors.modality.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase opacity-50 font-bold">Fecha de Nacimiento</label>
                                <Input type="date" {...register("birth_date")} className="bg-white/5" />
                                {errors.birth_date && <p className="text-[10px] text-red-400">{errors.birth_date.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-amber-400">Fecha de Elaboración</label>
                                <Input type="date" {...register("date")} className="bg-amber-500/10 border-amber-500/20 text-amber-200" />
                                {errors.date && <p className="text-[10px] text-red-400">{errors.date.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Seccion 2: Datos Generales */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Género</label>
                            <select {...register("gender")} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white text-sm">
                                <option value="male" className="bg-slate-900 text-white">Masculino</option>
                                <option value="female" className="bg-slate-900 text-white">Femenino</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Edad Actual</label>
                            <Input {...register("age", { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Etapa de Entrenamiento</label>
                            <Input {...register("training_stage")} placeholder="Ej. Competencia" className="bg-white/5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Peso Corporal (kg)</label>
                            <Input {...register("weight_kg", { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Estatura / Talla (cm)</label>
                            <Input {...register("height_cm", { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-400">Envergadura (cm)</label>
                            <Input {...register("wingspan_cm", { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                        </div>
                    </div>

                    {/* Seccion 3: Pliegues */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-amber-500 border-b border-white/10 pb-2">Pliegues Cutáneos (mm)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { id: "triceps_mm", label: "Tricipital" },
                                { id: "subscapular_mm", label: "Subescapular" },
                                { id: "biceps_mm", label: "Bicipital" },
                                { id: "iliac_crest_mm", label: "Cresta Iliaca" },
                                { id: "supraspinale_mm", label: "Supraespinal" },
                                { id: "abdominal_mm", label: "Abdominal" },
                                { id: "front_thigh_mm", label: "Muslo Frontal" },
                                { id: "medial_calf_mm", label: "Pantorrilla" },
                            ].map((f) => (
                                <div key={f.id} className="space-y-1">
                                    <label className="text-[10px] uppercase opacity-70 font-bold">{f.label}</label>
                                    <Input {...register(f.id as keyof AnthroFormData, { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seccion 4: Perímetros y Diámetros */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-amber-500 border-b border-white/10 pb-2">Perímetros (cm)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: "arm_relaxed_cm", label: "Brazo Relajado" },
                                    { id: "arm_flexed_cm", label: "Brazo Flex" },
                                    { id: "waist_cm", label: "Cintura" },
                                    { id: "hip_cm", label: "Cadera" },
                                    { id: "thigh_upper_cm", label: "Muslo Superior" },
                                    { id: "thigh_mid_cm", label: "Muslo Medio" },
                                    { id: "calf_cm", label: "Pantorrilla" },
                                ].map((f) => (
                                    <div key={f.id} className="space-y-1">
                                        <label className="text-[10px] uppercase opacity-70 font-bold">{f.label}</label>
                                        <Input {...register(f.id as keyof AnthroFormData, { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-amber-400 border-b border-white/10 pb-2">Diámetros Óseos (cm)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: "humerus_cm", label: "Biepi. Húmero" },
                                    { id: "femur_cm", label: "Biepi. Fémur" },
                                ].map((f) => (
                                    <div key={f.id} className="space-y-1">
                                        <label className="text-[10px] uppercase opacity-70 font-bold">{f.label}</label>
                                        <Input {...register(f.id as keyof AnthroFormData, { valueAsNumber: true })} type="number" step="any" className="bg-white/5" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feedback y Errores */}
                    <div className="space-y-4">
                        {submitStatus === 'success' && (
                            <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>¡Reporte Especializado Generado!</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Los datos han sido procesados y guardados en el historial del atleta.
                                </AlertDescription>
                            </Alert>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <Alert className="bg-red-500/10 border-red-500/30 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Faltan datos requeridos</AlertTitle>
                                <AlertDescription className="text-[10px] grid grid-cols-2 gap-x-2">
                                    {Object.keys(errors).map(key => (
                                        <span key={key}>• {key}</span>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest py-6 transition-all shadow-lg shadow-amber-500/20">
                        {isSubmitting ? "PROCESANDO..." : "GENERAR REPORTE ANTROPOMÉTRICO"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
