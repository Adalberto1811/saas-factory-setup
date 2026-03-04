"use client";

import { useState, useEffect } from 'react';

export function ThreeBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="absolute inset-0 bg-[#020408]" />;

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            {/* Superposición suave para integrar el 3D con el tema oscuro */}
            <div className="absolute inset-0 bg-[#020408]/40 z-[1] backdrop-blur-[2px]" />

            {/* Spline Iframe was here, but removed due to 403 Access Denied on user request */}
            <div className="w-full h-full scale-110 opacity-60">
            </div>

            {/* Viñeta para centrar la atención en el chat */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#020408] z-[2]" />
        </div>
    );
}
