import React, { useState, useEffect } from 'react';
import { User, Camera, RotateCcw, Check, Sparkles, Upload, X } from 'lucide-react';

interface AvatarMaestroProps {
    theme: {
        primary: string;
        accent: string;
        background: string;
        text: string;
        card: string;
        border: string;
    };
    onAvatarChange?: (avatarData: AvatarData) => void;
}

export interface AvatarData {
    baseImageUrl: string;
    style: 'corporate' | 'casual' | 'energetic' | 'minimal';
    name: string;
    sideBySideGenerated: boolean;
    frontView?: string;
    sideView?: string;
    threeQuarterView?: string;
}

const STORAGE_KEY = 'marketsyn_avatar_maestro';

const STYLE_PRESETS = [
    { id: 'corporate', label: 'Corporativo', emoji: '👔', colors: ['#1e40af', '#0f172a', '#f1f5f9'] },
    { id: 'casual', label: 'Casual', emoji: '😎', colors: ['#16a34a', '#fbbf24', '#f0fdf4'] },
    { id: 'energetic', label: 'Energético', emoji: '⚡', colors: ['#dc2626', '#f97316', '#fef2f2'] },
    { id: 'minimal', label: 'Minimalista', emoji: '◻️', colors: ['#18181b', '#71717a', '#ffffff'] }
];

export const AvatarMaestro: React.FC<AvatarMaestroProps> = ({ theme, onAvatarChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [avatarData, setAvatarData] = useState<AvatarData>({
        baseImageUrl: '',
        style: 'corporate',
        name: 'Avatar Principal',
        sideBySideGenerated: false
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Load saved avatar on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAvatarData(parsed);
            } catch (e) {
                console.error('Error loading avatar:', e);
            }
        }
    }, []);

    // Save avatar when changed
    const saveAvatar = (data: AvatarData) => {
        setAvatarData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        onAvatarChange?.(data);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newData = { ...avatarData, baseImageUrl: reader.result as string, sideBySideGenerated: false };
                saveAvatar(newData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlInput = (url: string) => {
        saveAvatar({ ...avatarData, baseImageUrl: url, sideBySideGenerated: false });
    };

    const handleStyleChange = (style: AvatarData['style']) => {
        saveAvatar({ ...avatarData, style });
    };

    const generateSideBySide = async () => {
        if (!avatarData.baseImageUrl) return;

        setIsGenerating(true);

        // Simulate the Side-by-Side generation process
        // In production, this would call an image generation API
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For now, we'll mark it as generated and use the same image
        // The actual generation would create front, side, and 3/4 views
        saveAvatar({
            ...avatarData,
            sideBySideGenerated: true,
            frontView: avatarData.baseImageUrl,
            sideView: avatarData.baseImageUrl,
            threeQuarterView: avatarData.baseImageUrl
        });

        setIsGenerating(false);
    };

    const clearAvatar = () => {
        const emptyData: AvatarData = {
            baseImageUrl: '',
            style: 'corporate',
            name: 'Avatar Principal',
            sideBySideGenerated: false
        };
        saveAvatar(emptyData);
    };

    const containerStyle = {
        backgroundColor: theme.card,
        borderColor: theme.border,
        color: theme.text
    };

    const selectedStyle = STYLE_PRESETS.find(s => s.id === avatarData.style);

    return (
        <div className="mb-6">
            {/* Collapsed Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01] group"
                style={{
                    ...containerStyle,
                    background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.primary}15 100%)`
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                        style={{
                            backgroundColor: avatarData.baseImageUrl ? 'transparent' : theme.primary,
                            border: `2px solid ${theme.accent}`
                        }}
                    >
                        {avatarData.baseImageUrl ? (
                            <img src={avatarData.baseImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-white" size={24} />
                        )}
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
                            🎭 Avatar Maestro
                            {avatarData.sideBySideGenerated && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                                    ✅ Side-by-Side
                                </span>
                            )}
                        </h3>
                        <p className="text-sm opacity-60" style={{ color: theme.text }}>
                            {avatarData.baseImageUrl
                                ? `${avatarData.name} • ${selectedStyle?.label}`
                                : 'Configura tu avatar de marca consistente'
                            }
                        </p>
                    </div>
                </div>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform"
                    style={{
                        backgroundColor: theme.primary + '20',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                >
                    <span style={{ color: theme.accent }}>▼</span>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div
                    className="mt-2 p-5 rounded-2xl border animate-in slide-in-from-top-2 duration-300"
                    style={containerStyle}
                >
                    {/* Avatar Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 opacity-70">Nombre del Avatar</label>
                        <input
                            type="text"
                            value={avatarData.name}
                            onChange={(e) => saveAvatar({ ...avatarData, name: e.target.value })}
                            placeholder="Ej: Alex, Mascota de Marca, Presentador..."
                            className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-purple-500 outline-none"
                            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 opacity-70">Imagen de Referencia</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={avatarData.baseImageUrl.startsWith('data:') ? '' : avatarData.baseImageUrl}
                                onChange={(e) => handleUrlInput(e.target.value)}
                                placeholder="URL de imagen (https://...)"
                                className="flex-1 rounded-lg px-4 py-2 border text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                            />
                            <label className="cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all hover:scale-105"
                                style={{ backgroundColor: theme.accent, color: 'white' }}>
                                <Upload size={16} />
                                Subir
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {avatarData.baseImageUrl && (
                        <div className="mb-4 relative">
                            <div className="w-full h-40 rounded-xl overflow-hidden border-2" style={{ borderColor: theme.accent }}>
                                <img
                                    src={avatarData.baseImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain bg-black/20"
                                />
                            </div>
                            <button
                                onClick={clearAvatar}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Style Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 opacity-70">Estilo Visual</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {STYLE_PRESETS.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleChange(style.id as AvatarData['style'])}
                                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${avatarData.style === style.id ? 'ring-2 ring-offset-2' : ''
                                        }`}
                                    style={{
                                        borderColor: avatarData.style === style.id ? theme.accent : theme.border,
                                        backgroundColor: theme.background
                                    }}
                                >
                                    <div className="text-2xl mb-1">{style.emoji}</div>
                                    <div className="text-xs font-bold" style={{ color: theme.text }}>{style.label}</div>
                                    <div className="flex gap-1 mt-1 justify-center">
                                        {style.colors.map((color, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Side-by-Side Generation */}
                    <div className="p-4 rounded-xl border" style={{ borderColor: theme.accent + '40', backgroundColor: theme.primary + '10' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Camera size={18} style={{ color: theme.accent }} />
                                <span className="font-bold text-sm" style={{ color: theme.text }}>Consistencia Side-by-Side</span>
                            </div>
                            {avatarData.sideBySideGenerated && (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center gap-1">
                                    <Check size={12} /> Generado
                                </span>
                            )}
                        </div>

                        <p className="text-xs opacity-60 mb-3" style={{ color: theme.text }}>
                            Genera vistas consistentes (frontal, lateral, 3/4) para mantener identidad en todos los videos.
                        </p>

                        {avatarData.sideBySideGenerated ? (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {['Frontal', 'Lateral', '3/4'].map((view, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-full aspect-square rounded-lg overflow-hidden border mb-1" style={{ borderColor: theme.border }}>
                                            <img
                                                src={avatarData.baseImageUrl}
                                                alt={view}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-[10px] opacity-60">{view}</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        <button
                            onClick={generateSideBySide}
                            disabled={!avatarData.baseImageUrl || isGenerating}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                boxShadow: `0 0 20px ${theme.accent}40`
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <RotateCcw className="animate-spin" size={16} />
                                    Generando vistas...
                                </>
                            ) : avatarData.sideBySideGenerated ? (
                                <>
                                    <Sparkles size={16} />
                                    Regenerar Vistas
                                </>
                            ) : (
                                <>
                                    <Camera size={16} />
                                    Generar Side-by-Side
                                </>
                            )}
                        </button>
                    </div>

                    {/* Pro Tip */}
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs" style={{ color: theme.text }}>
                        <strong className="text-amber-500">💡 Tip Antigravity:</strong> El avatar consistente aparecerá automáticamente en tus videos generados con Kling AI, creando una identidad de marca reconocible.
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarMaestro;
