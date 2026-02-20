"use client";

import { AnthroDashboard } from "@/features/anthropometry/components/AnthroDashboard";
import { AnthroForm } from "@/features/anthropometry/components/AnthroForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { AnthropometricRecord } from "@/shared/services/AnthropometryService";
import { useEffect, useState } from "react";

// Mock data to avoid DB dependency for the demo
const MOCK_RECORDS: AnthropometricRecord[] = [
    {
        user_id: 1,
        date: "2026-02-10",
        weight_kg: 78.5,
        height_cm: 182.0,
        triceps_mm: 8.5,
        subscapular_mm: 10.2,
        biceps_mm: 4.0,
        iliac_crest_mm: 12.5,
        supraspinale_mm: 9.0,
        abdominal_mm: 15.0,
        front_thigh_mm: 11.2,
        medial_calf_mm: 6.5,
        arm_relaxed_cm: 32.5,
        arm_flexed_cm: 35.8,
        waist_cm: 82.0,
        hip_cm: 98.5,
        thigh_cm: 58.0,
        calf_cm: 37.5,
        humerus_cm: 7.2,
        femur_cm: 9.8,
        fat_percentage: 10.8,
        muscle_mass_kg: 38.4,
        somatotype: { endo: 2.5, meso: 4.8, ecto: 3.2 }
    },
    {
        user_id: 1,
        date: "2026-01-15",
        weight_kg: 80.2,
        height_cm: 182.0,
        triceps_mm: 9.5,
        subscapular_mm: 11.0,
        biceps_mm: 4.5,
        iliac_crest_mm: 13.5,
        supraspinale_mm: 10.0,
        abdominal_mm: 17.5,
        front_thigh_mm: 12.5,
        medial_calf_mm: 7.2,
        arm_relaxed_cm: 33.0,
        arm_flexed_cm: 36.2,
        waist_cm: 84.5,
        hip_cm: 99.0,
        thigh_cm: 59.0,
        calf_cm: 38.0,
        humerus_cm: 7.2,
        femur_cm: 9.8,
        fat_percentage: 11.5,
        muscle_mass_kg: 38.0,
        somatotype: { endo: 2.8, meso: 4.6, ecto: 3.0 }
    }
];

export default function TestAnthroPage() {
    const [records, setRecords] = useState(MOCK_RECORDS);

    return (
        <div className="min-h-screen bg-[#020617] text-white p-10 space-y-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                        CEREBRO ANTROPOMÉTRICO v3.6
                    </h1>
                    <p className="text-amber-400/60 text-xl font-medium">
                        Protocolo Profesional ISAK & Somatotipo Heath-Carter
                    </p>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black px-8 font-bold">
                            Dashboard de Rendimiento
                        </TabsTrigger>
                        <TabsTrigger value="new" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black px-8 font-bold">
                            Interfaz de Medición
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-10">
                        {/* We override the child's internal state mechanism for demo purposes if possible, 
                    but AnthroDashboard fetches internally. Since we can't easily mock the service 
                    without more complex setup, we will just show the layout or I'll patch 
                    AnthroDashboard briefly for this demo. */}
                        <AnthroDashboard userId={1} />
                    </TabsContent>

                    <TabsContent value="new">
                        <div className="max-w-4xl mx-auto">
                            <AnthroForm userId={1} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
