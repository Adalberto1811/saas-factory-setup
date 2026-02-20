import React, { useState } from 'react';
import { Image, Download, Sparkles, RotateCcw, Check, Palette, Zap, Clock, X } from 'lucide-react';

interface ThumbnailFactoryProps {
    theme: {
        primary: string;
        accent: string;
        background: string;
        text: string;
        card: string;
        border: string;
    };
    dayContent: {
        day: string;
        phase: string;
        script: string;
        type?: string;
        visualNotes?: string;
        thumbnailPrompt?: string;
        thumbnailPrompts?: string[];
        neuroMetrics?: {
            dominantColor?: string;
            emotionalTone?: string;
        };
    };
    onClose?: () => void;
    productName?: string;
}

interface ThumbnailVariant {
    id: 'A' | 'B' | 'C';
    name: string;
    style: string;
    prompt: string;
    imageUrl?: string;
    isGenerating: boolean;
    isSelected: boolean;
}

const VARIANT_STYLES = [
    { id: 'A', name: 'Alto Contraste', style: 'high-contrast', color: '#ef4444', emoji: '🔥' },
    { id: 'B', name: 'Profesional', style: 'professional', color: '#3b82f6', emoji: '💼' },
    { id: 'C', name: 'Urgencia', style: 'urgency', color: '#f59e0b', emoji: '⏰' }
] as const;

export const ThumbnailFactory: React.FC<ThumbnailFactoryProps> = ({
    theme,
    dayContent,
    onClose,
    productName = 'Producto'
}) => {
    const [variants, setVariants] = useState<ThumbnailVariant[]>(
        VARIANT_STYLES.map(s => ({
            id: s.id,
            name: s.name,
            style: s.style,
            prompt: generatePrompt(s.style, dayContent, productName),
            isGenerating: false,
            isSelected: s.id === 'A'
        }))
    );
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<'A' | 'B' | 'C'>('A');

    function generatePrompt(style: string, content: typeof dayContent, product: string): string {
        const baseHook = content.script?.slice(0, 50) || content.phase;
        const color = content.neuroMetrics?.dominantColor || '#00ff00';

        const stylePrompts: Record<string, string> = {
            'high-contrast': `Vibrant YouTube thumbnail, ${baseHook}, bold text overlay "${product}", neon ${color} accents, dark background, shocked expression, high contrast, professional lighting, 4K`,
            'professional': `Professional corporate thumbnail, ${baseHook}, clean design, "${product}" text, blue and white color scheme, minimalist, executive style, modern sans-serif font, 4K`,
            'urgency': `Urgent promotional thumbnail, ${baseHook}, countdown timer overlay, "${product}" in big red letters, yellow warning stripes, limited time offer badge, explosive graphics, 4K`
        };

        return stylePrompts[style] || stylePrompts['high-contrast'];
    }

    const generateThumbnail = async (variantId: 'A' | 'B' | 'C') => {
        setVariants(prev => prev.map(v =>
            v.id === variantId ? { ...v, isGenerating: true } : v
        ));

        // Simulate thumbnail generation
        // In production, this would call an image generation API (DALL-E, Stable Diffusion, etc.)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Generate a placeholder colored image based on the style
        const colors: Record<string, string> = { A: 'ef4444', B: '3b82f6', C: 'f59e0b' };
        const placeholderUrl = `https://placehold.co/1280x720/${colors[variantId]}/ffffff?text=Thumbnail+${variantId}`;

        setVariants(prev => prev.map(v =>
            v.id === variantId ? { ...v, isGenerating: false, imageUrl: placeholderUrl } : v
        ));
    };

    const generateAllThumbnails = async () => {
        setIsGeneratingAll(true);
        for (const variant of variants) {
            await generateThumbnail(variant.id);
        }
        setIsGeneratingAll(false);
    };

    const selectVariant = (id: 'A' | 'B' | 'C') => {
        setSelectedVariant(id);
        setVariants(prev => prev.map(v => ({ ...v, isSelected: v.id === id })));
    };

    const downloadThumbnail = (variant: ThumbnailVariant) => {
        if (variant.imageUrl) {
            const link = document.createElement('a');
            link.href = variant.imageUrl;
            link.download = `thumbnail_${dayContent.day}_${variant.id}.png`;
            link.click();
        }
    };

    const containerStyle = {
        backgroundColor: theme.card,
        borderColor: theme.border,
        color: theme.text
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden"
                style={containerStyle}
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: theme.accent + '20' }}>
                            <Image size={24} style={{ color: theme.accent }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                                🖼️ Thumbnail Factory
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                                    NEUROMARKETING
                                </span>
                            </h2>
                            <p className="text-sm opacity-60">
                                {dayContent.day} • {dayContent.phase}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X size={20} style={{ color: theme.text }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Context Info */}
                    <div className="mb-6 p-4 rounded-xl bg-black/20 border" style={{ borderColor: theme.border }}>
                        <p className="text-sm opacity-80 italic">"{dayContent.script?.slice(0, 100)}..."</p>
                        {dayContent.neuroMetrics && (
                            <div className="flex gap-2 mt-2">
                                {dayContent.neuroMetrics.dominantColor && (
                                    <span
                                        className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                        style={{
                                            backgroundColor: dayContent.neuroMetrics.dominantColor + '20',
                                            color: dayContent.neuroMetrics.dominantColor
                                        }}
                                    >
                                        <Palette size={12} /> {dayContent.neuroMetrics.dominantColor}
                                    </span>
                                )}
                                {dayContent.neuroMetrics.emotionalTone && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                        <Zap size={12} /> {dayContent.neuroMetrics.emotionalTone}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Generate All Button */}
                    <button
                        onClick={generateAllThumbnails}
                        disabled={isGeneratingAll}
                        className="w-full mb-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: '#39FF14',
                            color: 'black',
                            boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)'
                        }}
                    >
                        {isGeneratingAll ? (
                            <>
                                <RotateCcw className="animate-spin" size={20} />
                                Generando 3 Variantes...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generar Thumbnails A/B/C
                            </>
                        )}
                    </button>

                    {/* Variants Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {variants.map((variant, idx) => {
                            const styleInfo = VARIANT_STYLES[idx];
                            return (
                                <div
                                    key={variant.id}
                                    onClick={() => selectVariant(variant.id)}
                                    className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${variant.isSelected ? 'ring-4 ring-offset-2' : ''
                                        }`}
                                    style={{
                                        borderColor: variant.isSelected ? styleInfo.color : theme.border
                                    }}
                                >
                                    {/* Variant Header */}
                                    <div
                                        className="p-3 flex items-center justify-between"
                                        style={{ backgroundColor: styleInfo.color + '20' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{styleInfo.emoji}</span>
                                            <span className="font-bold text-sm" style={{ color: styleInfo.color }}>
                                                Variante {variant.id}
                                            </span>
                                        </div>
                                        {variant.isSelected && (
                                            <Check size={16} style={{ color: styleInfo.color }} />
                                        )}
                                    </div>

                                    {/* Thumbnail Preview */}
                                    <div className="aspect-video bg-black/30 relative">
                                        {variant.isGenerating ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <RotateCcw className="animate-spin mx-auto mb-2" size={24} style={{ color: styleInfo.color }} />
                                                    <p className="text-xs opacity-60">Generando...</p>
                                                </div>
                                            </div>
                                        ) : variant.imageUrl ? (
                                            <img
                                                src={variant.imageUrl}
                                                alt={`Thumbnail ${variant.id}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); generateThumbnail(variant.id); }}
                                                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                                                    style={{ backgroundColor: styleInfo.color, color: 'white' }}
                                                >
                                                    Generar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Variant Info */}
                                    <div className="p-3" style={{ backgroundColor: theme.background }}>
                                        <p className="text-xs font-bold mb-1" style={{ color: theme.text }}>
                                            {variant.name}
                                        </p>
                                        <p className="text-[10px] opacity-60 line-clamp-2">
                                            {variant.prompt.slice(0, 80)}...
                                        </p>

                                        {variant.imageUrl && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); downloadThumbnail(variant); }}
                                                className="mt-2 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all hover:scale-105"
                                                style={{ backgroundColor: theme.accent, color: 'white' }}
                                            >
                                                <Download size={12} />
                                                Descargar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Psychology Tips */}
                    <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <span className="font-bold text-red-400">🔥 Alto Contraste</span>
                            <p className="opacity-60 mt-1">Colores vibrantes que destacan en el scroll. Ideal para captar atención instantánea.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <span className="font-bold text-blue-400">💼 Profesional</span>
                            <p className="opacity-60 mt-1">Diseño limpio y corporativo. Transmite confianza para audiencias B2B.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <span className="font-bold text-amber-400">⏰ Urgencia</span>
                            <p className="opacity-60 mt-1">Elementos de escasez y tiempo limitado. Maximiza la tasa de clics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThumbnailFactory;
