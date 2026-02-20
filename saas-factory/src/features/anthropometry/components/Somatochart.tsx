"use client";

import { Somatotype } from "../utils/calculations";

interface Props {
    somatotypes: Somatotype[];
    className?: string;
}

export function Somatochart({ somatotypes, className }: Props) {
    // Convert Heath-Carter to X,Y coordinates
    // X = Ecto - Endo
    // Y = 2 * Meso - (Endo + Ecto)
    const getCoords = (s: Somatotype) => {
        const x = s.ecto - s.endo;
        const y = 2 * s.meso - (s.endo + s.ecto);
        // Map to SVG coordinates (-10, 15 scale roughly)
        // SVG is 200x200, center at 100,100
        const scale = 10;
        return {
            x: 100 + x * scale,
            y: 100 - y * scale,
        };
    };

    return (
        <div className={`relative aspect-square w-full max-w-[400px] mx-auto bg-white/5 rounded-xl border border-white/10 p-4 ${className}`}>
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.1" strokeDasharray="4" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.1" strokeDasharray="4" />

                {/* Triangle / Reuleaux-like boundaries (simplified) */}
                <path
                    d="M 100 10 L 190 160 L 10 160 Z"
                    fill="none"
                    stroke="currentColor"
                    className="text-amber-500/30"
                    strokeWidth="1"
                />

                {/* Labels */}
                <text x="100" y="5" textAnchor="middle" className="text-[8px] fill-amber-400 font-bold">MESOMORFO</text>
                <text x="5" y="170" textAnchor="start" className="text-[8px] fill-amber-500 font-bold">ENDOMORFO</text>
                <text x="195" y="170" textAnchor="end" className="text-[8px] fill-amber-300 font-bold">ECTOMORFO</text>

                {/* Data points */}
                {somatotypes.map((s, i) => {
                    const { x, y } = getCoords(s);
                    const isLatest = i === 0;
                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r={isLatest ? 4 : 2}
                                className={isLatest ? "fill-white animate-pulse" : "fill-white/30"}
                            />
                            {isLatest && (
                                <text x={x} y={y - 8} textAnchor="middle" className="text-[6px] fill-white font-medium">
                                    Actual
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="absolute bottom-2 right-4 text-[10px] opacity-50 font-mono">
                Heath-Carter Somatochart
            </div>
        </div>
    );
}
