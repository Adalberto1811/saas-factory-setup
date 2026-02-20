"use client";
// Synergos Perfection v3.3

import { AnthropometricRecord } from "@/shared/services/AnthropometryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Brain, Target, TrendingUp, TrendingDown, ClipboardCheck, IdCard, Info, Scale, Pizza, Trophy, Search } from "lucide-react";
import {
    calculateNutrition,
    calculateDetailedComposition,
    calculatePonderalIndex
} from "../utils/calculations";

export function AnthroAnalysis({ record }: { record?: AnthropometricRecord }) {
    if (!record) return null;

    const {
        somatotype, fat_percentage = 0, muscle_mass_kg = 0, weight_kg = 0, height_cm = 0, bmi = 0, bmi_percentile = "N/A",
        athlete_name = "Atleta", id_number = "N/A", modality = "General", date = new Date().toISOString(),
        gender = 'male'
    } = record;

    if (!date) return null;

    const normalized_weight = Number(weight_kg);
    const normalized_height = Number(height_cm);
    const normalized_bmi = Number(bmi);
    const normalized_fat = Number(fat_percentage);

    const nutrition = calculateNutrition(normalized_weight, modality || "General", normalized_bmi || 0);
    const composition = calculateDetailedComposition(normalized_weight, normalized_fat || 0, normalized_height, gender as 'male' | 'female');
    const ponderalIndex = calculatePonderalIndex(normalized_height, normalized_weight);

    const getAnalysis = () => {
        if (!somatotype) return {
            profile: "Esperando datos...",
            fatAnalysis: "N/A",
            muscleKPI: "N/A"
        };

        let profile = "";
        const max = Math.max(somatotype.endo, somatotype.meso, somatotype.ecto);
        if (somatotype.meso === max) profile = "Predominancia Mesomórfica (Atlético)";
        else if (somatotype.endo === max) profile = "Predominancia Endomórfica (Reserva)";
        else profile = "Predominancia Ectomórfica (Resistencia)";

        return {
            profile,
            fatAnalysis: normalized_fat && normalized_fat > 15 ? "Optimización Metabólica" : "Condición Atlética",
            muscleKPI: muscle_mass_kg && Number(muscle_mass_kg) > normalized_weight * 0.4 ? "Excelente desarrollo" : "Potencial hipertrofia"
        };
    };

    const analysis = getAnalysis();

    return (
        <div className="space-y-6">
            {/* Header / Branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-amber-500/20 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <img src="/logo.png" alt="Synergos" className="h-8 w-auto invert brightness-150 grayscale sepia hue-rotate-[30deg] saturate-[3000%]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50">High Performance</span>
                    </div>
                    <h2 className="text-4xl font-black text-amber-400 leading-tight uppercase tracking-tighter">
                        {athlete_name || "Atleta Sin Nombre"}
                    </h2>
                    <p className="text-sm font-bold text-amber-200/60 uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        {modality || "Modalidad General"} • ID: {id_number || "N/A"}
                    </p>
                </div>
                <div className="text-right glass-premium p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/20">
                    <p className="text-[10px] uppercase opacity-80 font-black mb-1 text-amber-400 tracking-widest">Fecha de Elaboración</p>
                    <p className="text-lg font-bold text-white leading-none">
                        {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Nutrition & Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPIBox title="Somatotipo" value={somatotype ? `${somatotype.endo}/${somatotype.meso}/${somatotype.ecto}` : "N/A"} subtitle={analysis.profile} icon={<Target className="text-amber-400" />} />
                <KPIBox title="Grasa Corporal" value={`${normalized_fat.toFixed(1)}%`} subtitle={analysis.fatAnalysis} icon={<TrendingDown className="text-amber-500" />} />
                <KPIBox title="Proteína Diaria" value={`${nutrition.protein_gr}g`} subtitle="1.5g por kg de peso" icon={<Scale className="text-amber-600" />} />
                <KPIBox title="Carbohidratos" value={nutrition.carbs_max_gr ? `${nutrition.carbs_min_gr}-${nutrition.carbs_max_gr}g` : `${nutrition.carbs_gr}g`} subtitle={nutrition.context} icon={<Pizza className="text-amber-300" />} />
            </div>

            {/* Detailed Composition Table - Synergos Perfection Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="glass-premium border-amber-500/20 overflow-hidden">
                    <CardHeader className="bg-amber-500/10 border-b border-white/5">
                        <CardTitle className="text-xs uppercase font-black tracking-widest flex items-center gap-2 text-amber-400">
                            <Info className="w-4 h-4" /> Composición Corporal Detallada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-white/5">
                                <CompRow label="IMC / BMI" value={normalized_bmi.toFixed(1)} unit="" highlight={bmi_percentile} />
                                <CompRow label="Índice Ponderal" value={Number(ponderalIndex).toFixed(2)} unit="" />
                                <CompRow label="Peso Ideal (Lorenz)" value={composition.pesoIdeal} unit="Kg" />
                                <CompRow label="Peso Corregido" value={composition.pesoCorregido} unit="Kg" bold />
                                <CompRow label="Muslo Superior" value={record.thigh_upper_cm} unit="cm" />
                                <CompRow label="Muslo Medio" value={record.thigh_mid_cm} unit="cm" />
                                <tr className="bg-white/5 text-amber-500/80">
                                    <td colSpan={3} className="px-4 py-2 text-[10px] uppercase font-black">Diferenciales de Rendimiento</td>
                                </tr>
                                <CompRow label="Diferencia de Peso" value={composition.diferenciaPesoKg} unit="Kg" />
                                <CompRow label="Ajuste de Grasa" value={composition.diferenciaGrasaKg} unit="Kg" color={composition.diferenciaGrasaKg > 0 ? "text-red-400" : "text-amber-400"} />
                                <CompRow label="Ajuste Masa Magra" value={composition.diferenciaMasaMagraKg} unit="Kg" color={composition.diferenciaMasaMagraKg > 0 ? "text-amber-400" : "text-red-400"} />
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="glass-premium border-white/5">
                        <CardHeader><CardTitle className="text-xs uppercase opacity-70">Distribución Health-Carter</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <ScoreBar label="Endomorfia" value={somatotype?.endo || 0} color="bg-amber-600" max={10} />
                            <ScoreBar label="Mesomorfia" value={somatotype?.meso || 0} color="bg-amber-400" max={10} />
                            <ScoreBar label="Ectomorfia" value={somatotype?.ecto || 0} color="bg-amber-200" max={10} />
                        </CardContent>
                    </Card>

                    <Card className="glass-premium border-amber-500/20 bg-amber-500/5 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Trophy className="w-20 h-20 text-amber-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] uppercase font-black text-amber-500 mb-2 tracking-widest">Recomendación Táctica Synergos</div>
                            <p className="text-lg font-medium leading-relaxed italic text-white/90">
                                "{analysis.fatAnalysis.toUpperCase()}. {analysis.muscleKPI.toUpperCase()}. El protocolo nutricional de {nutrition.carbs_gr}g de carbohidratos está afinado para {modality ? modality.toLowerCase() : "la exigencia metabólica detectada"}."
                            </p>
                            <div className="mt-4 pt-4 border-t border-amber-500/20 flex justify-between items-center text-[10px] font-mono opacity-50">
                                <span>SYNERGOS PERFECTION ENGINE v3.3</span>
                                <span>ISAK II ALIGNED</span>
                                <span>Synergos Hub</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function CompRow({ label, value, unit, highlight, bold, color }: any) {
    return (
        <tr className={`hover:bg-white/5 transition-colors ${bold ? 'font-black bg-amber-500/5' : ''}`}>
            <td className="px-2 sm:px-4 py-2 sm:py-3 opacity-70 leading-none">{label}</td>
            <td className={`px-2 sm:px-4 py-2 sm:py-3 text-right font-mono ${color || ''}`}>{value} <span className="text-[10px] opacity-40">{unit}</span></td>
            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                {highlight && <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black px-2 py-1 rounded-full uppercase">{highlight}</span>}
            </td>
        </tr>
    );
}

function KPIBox({ title, value, subtitle, icon }: any) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold opacity-50">{title}</span>
                {icon}
            </div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-[9px] opacity-40 leading-tight">{subtitle}</div>
        </div>
    );
}

function ScoreBar({ label, value, color, max = 12 }: any) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
                <span>{label}</span>
                <span>{value.toFixed(1)}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, percentage)}%` }} />
            </div>
        </div>
    );
}
