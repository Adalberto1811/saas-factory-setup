'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoachRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir suavemente a la raíz del Coach (/performance/)
        router.replace('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Sincronizando Evolución...</p>
            </div>
        </div>
    );
}
