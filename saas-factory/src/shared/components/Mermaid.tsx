'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && chart) {
            mermaid.render('mermaid-chart', chart).then((result: { svg: string }) => {
                if (ref.current) {
                    ref.current.innerHTML = result.svg;
                }
            }).catch((error: Error) => {
                console.error('Mermaid rendering error:', error);
            });
        }
    }, [chart]);

    return (
        <div
            key={chart}
            ref={ref}
            className="flex justify-center w-full p-4 bg-black/20 rounded-2xl overflow-x-auto shadow-inner border border-white/5"
        />
    );
};

export default Mermaid;
