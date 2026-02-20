"use client";

interface Props {
    bmi: number;
    age: number;
    className?: string;
}

export function BMIChart({ bmi, age, className }: Props) {
    // Simplified CDC/WHO-like growth curve visualization
    // X: age (5-19), Y: BMI (12-34)
    const getCoords = (a: number, b: number) => {
        const x = ((a - 5) / (19 - 5)) * 100;
        const y = 100 - ((b - 12) / (34 - 12)) * 100;
        return { x, y };
    };

    const { x, y } = getCoords(age, bmi);

    return (
        <div className={`relative aspect-[16/9] w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden p-2 ${className}`}>
            <div className="absolute inset-0 flex flex-col">
                {/* Background Zones */}
                <div className="flex-1 bg-red-500/20" /> {/* Obesidad */}
                <div className="flex-1 bg-amber-500/20" /> {/* Sobrepeso */}
                <div className="flex-1 bg-amber-500/20" /> {/* Normal */}
                <div className="flex-1 bg-blue-500/20" /> {/* Bajo Peso */}
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                {/* Curved percentile lines (Simplified approximations) */}
                <path d="M 0 80 Q 50 70 100 60" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
                <path d="M 0 70 Q 50 60 100 50" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
                <path d="M 0 60 Q 50 50 100 40" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />

                {/* Current Data Point */}
                <circle cx={x} cy={y} r="2" className="fill-white shadow-lg shadow-white/50 animate-pulse" />
                <line x1={x} y1="0" x2={x} y2="100" stroke="white" strokeOpacity="0.1" strokeDasharray="2" />
                <line x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.1" strokeDasharray="2" />
            </svg>

            <div className="absolute top-2 left-2 text-[8px] font-bold opacity-70">CURVA DE CRECIMIENTO BMI</div>
            <div className="absolute bottom-2 right-2 text-[10px] font-bold text-white">
                {age} años / {bmi.toFixed(1)} IMC
            </div>
        </div>
    );
}
