"use client";

import { useEffect, useState } from "react";
import { AnthropometricRecord, getAnthropometryRecords } from "@/shared/services/AnthropometryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { IdCard, Trophy } from "lucide-react";
import { Somatochart } from "./Somatochart";
import { AnthroAnalysis } from "./AnthroAnalysis";
import { BMIChart } from "./BMIChart";

export function AnthroDashboard({ userId }: { userId: number }) {
    const [records, setRecords] = useState<AnthropometricRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterId, setFilterId] = useState("");

    useEffect(() => {
        loadRecords();
    }, [userId]);

    const loadRecords = async () => {
        try {
            const data = await getAnthropometryRecords(userId);
            setRecords(data);
        } catch (error) {
            console.error("Error loading records:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Skeleton className="w-full h-[400px]" />;

    const filteredRecords = filterId
        ? records.filter(r => r.id_number?.toLowerCase().includes(filterId.toLowerCase()))
        : records;

    const lastRecord = filteredRecords[0];

    return (
        <div className="space-y-10">
            {lastRecord && <AnthroAnalysis record={lastRecord} />}
            {!lastRecord && !loading && (
                <div className="p-10 text-center glass-premium border-white/5 opacity-50 italic">
                    No se encontraron registros para este ID de atleta.
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between glass-premium border-white/10 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 blur-[100px]" />
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                        <img src="/logo.png" alt="Synergos" className="h-8 w-auto invert brightness-150 grayscale sepia hue-rotate-[30deg] saturate-[3000%]" />
                    </div>
                    <div className="flex items-center gap-4">
                        <IdCard className="w-6 h-6 text-amber-400" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Filtrado Profesional</span>
                            <div className="flex items-center gap-3">
                                <Input
                                    placeholder="CÉDULA / ID DEL ATLETA"
                                    className="max-w-xs bg-white/5 border-white/10 text-white font-mono h-12 uppercase"
                                    value={filterId}
                                    onChange={(e) => setFilterId(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase font-black opacity-40 text-amber-500">Desarrollado para</p>
                        <p className="text-sm font-black text-amber-400 italic">SYNERGOS SOLUTIONS v3.3</p>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-2 hidden md:block" />
                    <Trophy className="w-8 h-8 text-amber-500 opacity-50" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-premium border-white/10 overflow-hidden">
                    <CardHeader className="bg-amber-500/5 border-b border-white/10">
                        <CardTitle className="text-sm font-medium opacity-70 text-amber-400">Somatocarta</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredRecords.length > 0 ? (
                            <Somatochart somatotypes={filteredRecords.map(r => r.somatotype).filter((s): s is any => !!s)} />
                        ) : (
                            <div className="p-10 text-center text-xs opacity-50 italic">Sin datos suficientes</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-premium border-white/10 overflow-hidden">
                    <CardHeader className="bg-amber-500/5 border-b border-white/10">
                        <CardTitle className="text-sm font-medium opacity-70 text-amber-400">Crecimiento IMC</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {lastRecord?.bmi ? (
                            <BMIChart bmi={lastRecord.bmi} age={lastRecord.age || 10} />
                        ) : (
                            <div className="p-10 text-center text-xs opacity-50 italic">Faltan datos de Talla/Peso</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-premium border-white/10 h-full">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium opacity-70">Indicadores Clave</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Indicator label="Suma de Pliegues" value={`${(lastRecord?.triceps_mm || 0) + (lastRecord?.subscapular_mm || 0) + (lastRecord?.abdominal_mm || 0)} mm`} />
                        <Indicator label="Peso Corregido" value={`${(lastRecord?.weight_kg ? lastRecord.weight_kg * 0.95 : 0).toFixed(1)} kg`} />
                        <Indicator label="Relación Cintura/Cadera" value={`${((lastRecord?.waist_cm || 1) / (lastRecord?.hip_cm || 1)).toFixed(2)}`} />
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-premium border-white/10">
                <CardHeader>
                    <CardTitle>Historial de Mediciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredRecords.map((r) => (
                            <div key={r.id} className="flex justify-between items-center p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div>
                                    <div className="font-bold text-lg">{new Date(r.date).toLocaleDateString()}</div>
                                    <div className="text-xs opacity-60 uppercase">{r.modality || "General"} • {r.athlete_name}</div>
                                    <div className="text-[8px] opacity-40 font-mono tracking-tighter">ID: {r.id_number}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-amber-500">
                                        {r.somatotype ? `${r.somatotype.endo.toFixed(1)}/${r.somatotype.meso.toFixed(1)}/${r.somatotype.ecto.toFixed(1)}` : "--"}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-widest opacity-40">Endo / Meso / Ecto</div>
                                </div>
                            </div>
                        ))}
                        {filteredRecords.length === 0 && <div className="text-center py-10 opacity-50 italic">No hay registros que coincidan con el ID.</div>}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

function Indicator({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-xs opacity-60">{label}</span>
            <span className="font-bold text-amber-500">{value}</span>
        </div>
    );
}
