"use client";

import { useSession } from "next-auth/react";
import { AnthroForm } from "@/features/anthropometry/components/AnthroForm";
import { AnthroDashboard } from "@/features/anthropometry/components/AnthroDashboard";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default function AnthropometryPage() {
    const sessionRes = useSession();
    const session = sessionRes?.data;
    const [refreshKey, setRefreshKey] = useState(0);

    if (!session?.user) return <div className="p-10 text-center opacity-50">Cargando sesión o no autenticado...</div>;

    const userId = session?.user?.id ? Number(session.user.id) : null;

    if (userId === null || isNaN(userId)) {
        return <div className="p-10 text-center opacity-50">Cargando perfil del atleta...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-10">
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
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-8">
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="new" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-8">
                        Nueva Medición
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                    <AnthroDashboard userId={userId} key={refreshKey} />
                </TabsContent>

                <TabsContent value="new">
                    <div className="max-w-4xl mx-auto">
                        <AnthroForm
                            userId={userId}
                            onSuccess={() => {
                                setRefreshKey(prev => prev + 1);
                                // Switch tab back to dashboard would be nice but let's keep it simple
                            }}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
