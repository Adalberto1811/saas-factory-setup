"use client";

import { useState, useEffect } from 'react';
import { pseLandingConfig } from '../config/pse-landing-config';

const images = [
    "/performance/competitions/swimming_pool_finish_fast_action_1769909530676.png",
    "/performance/competitions/open_water_swimming_transition_fast_1769909544099.png",
    "/performance/competitions/biomechanical_swimming_analysis_overlay_1769909556666.png"
];

export function ImpactReel() {
    const [currentImage, setCurrentImage] = useState(0);
    const [currentText, setCurrentText] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        // Fast image cycle
        const imageInterval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 1500);

        // Text cycle with tracker
        const textInterval = setInterval(() => {
            setCurrentText((prev) => {
                const next = (prev + 1) % pseLandingConfig.copy.impactReel.length;
                if (next === 0) {
                    setCycleCount((c) => c + 1);
                }
                return next;
            });
        }, 3000);

        return () => {
            clearInterval(imageInterval);
            clearInterval(textInterval);
        };
    }, []);

    // Logo appears after 2 full text cycles
    const showLogo = cycleCount >= 2;

    return (
        <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden border border-white/10 group bg-black">
            {/* Image Layer */}
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentImage ? 'opacity-40 scale-110' : 'opacity-0 scale-100'
                        }`}
                >
                    <img
                        src={img}
                        alt="High Performance Swimming"
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}

            {/* Overlay Layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent" />

            {/* Tranzlucent Logo revealed after 2 cycles */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-[2000ms] pointer-events-none ${showLogo ? 'opacity-30 scale-110 blur-none' : 'opacity-0 scale-150 blur-xl'
                }`}>
                <img
                    src={pseLandingConfig.branding.logo}
                    alt="PSE Logo Watermark"
                    className="w-80 h-80 object-contain drop-shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                />
            </div>

            {/* Text Layer (Fades slightly when logo appears to keep focus) */}
            <div className={`absolute inset-0 flex items-center justify-center p-12 text-center transition-opacity duration-1000 ${showLogo ? 'opacity-40' : 'opacity-100'
                }`}>
                <div className="relative w-full h-20">
                    {pseLandingConfig.copy.impactReel.map((text, idx) => (
                        <h2
                            key={idx}
                            className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight transition-all duration-500 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full px-8 ${idx === currentText
                                    ? 'opacity-100 translate-y-0 filter blur-0 scale-100'
                                    : 'opacity-0 translate-y-8 filter blur-lg scale-90'
                                }`}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                                {text}
                            </span>
                        </h2>
                    ))}
                </div>
            </div>

            {/* Fast Flash Effect */}
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
        </div>
    );
}
