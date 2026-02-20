import { useState, useRef, useEffect } from 'react';
import {
    User, Mail, Phone, Globe, Linkedin, Instagram, Twitter,
    Download, Share2, QrCode, MessageCircle, Youtube, Music,
    ExternalLink, Nfc, Smartphone, Copy, Check, Sparkles,
    Calendar, MapPin, Briefcase, ChevronDown, Wand2, Image as ImageIcon
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import axios from 'axios';

interface Theme {
    primary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
}

interface CardData {
    name: string;
    title: string;
    company: string;
    bio: string;
    email: string;
    phone: string;
    website: string;
    location: string;
    photo: string;
    coverImage: string;
    primaryColor?: string;
    accentColor?: string;
    slogan?: string;
    backgroundPrompt?: string; // User's description for background generation
    portfolio?: {
        prices: string;
        strategies: string;
    };
    links: LinkItem[];
}

interface LinkItem {
    id: string;
    title: string;
    url: string;
    icon: 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'whatsapp' | 'website' | 'email' | 'phone' | 'spotify' | 'calendar';
    color: string;
}

// Icon map for link types
const iconMap = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    whatsapp: MessageCircle,
    website: Globe,
    email: Mail,
    phone: Phone,
    spotify: Music,
    calendar: Calendar
};

// Color presets for link buttons
const linkColors = {
    linkedin: '#0A66C2',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    whatsapp: '#25D366',
    website: '#6366F1',
    email: '#EA4335',
    phone: '#10B981',
    spotify: '#1DB954',
    calendar: '#FF6B35'
};

export default function SynCards({ theme, webhooks }: {
    theme: Theme,
    webhooks?: {
        baseUrl: string;
        marketSyn: string;
        synCards?: string;
    }
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [nfcStatus, setNfcStatus] = useState<'idle' | 'writing' | 'success' | 'error' | 'unsupported'>('idle');
    const [isEditing, setIsEditing] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Load saved data from localStorage
    const [cardData, setCardData] = useState<CardData>(() => {
        const saved = localStorage.getItem('syncard_data');
        if (saved) return JSON.parse(saved);
        return {
            name: 'Tu Nombre',
            title: 'CEO & Fundador',
            company: 'Tu Empresa',
            bio: 'Emprendedor apasionado por la innovación y la tecnología. Ayudo a empresas a crecer con soluciones digitales.',
            email: 'contacto@tuempresa.com',
            phone: '+58 412 123 4567',
            website: 'tuempresa.com',
            location: 'Caracas, Venezuela',
            photo: '',
            coverImage: '',
            primaryColor: '#6366F1',
            accentColor: '#F472B6',
            slogan: 'Transformando Ideas en Realidad Digital',
            backgroundPrompt: 'Fondo futurista con luces neón y tecnología',
            portfolio: {
                prices: 'Consultar planes personalizados',
                strategies: 'Estrategias de crecimiento basadas en IA'
            },
            links: [
                { id: '1', title: 'LinkedIn', url: 'https://linkedin.com/in/tunombre', icon: 'linkedin', color: linkColors.linkedin },
                { id: '2', title: 'Instagram', url: 'https://instagram.com/tunombre', icon: 'instagram', color: linkColors.instagram },
                { id: '3', title: 'WhatsApp', url: 'https://wa.me/584121234567', icon: 'whatsapp', color: linkColors.whatsapp },
                { id: '4', title: 'Agendar Cita', url: 'https://calendly.com/tunombre', icon: 'calendar', color: linkColors.calendar },
            ]
        };
    });

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('syncard_data', JSON.stringify(cardData));
    }, [cardData]);

    // Generate profile URL for NFC/QR
    const profileUrl = `${window.location.origin}/card/${encodeURIComponent(cardData.name.toLowerCase().replace(/\s+/g, '-'))}`;

    // NFC Write functionality
    const handleNFCWrite = async () => {
        if (!('NDEFReader' in window)) {
            setNfcStatus('unsupported');
            setTimeout(() => setNfcStatus('idle'), 3000);
            return;
        }

        setNfcStatus('writing');

        try {
            const ndef = new (window as any).NDEFReader();
            await ndef.write({
                records: [
                    { recordType: "url", data: profileUrl },
                    { recordType: "text", data: `${cardData.name} - ${cardData.title}` }
                ]
            });
            setNfcStatus('success');
            setTimeout(() => setNfcStatus('idle'), 3000);
        } catch (error) {
            console.error('NFC Error:', error);
            setNfcStatus('error');
            setTimeout(() => setNfcStatus('idle'), 3000);
        }
    };

    // Download vCard
    const handleDownloadVCard = () => {
        const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
N:${cardData.name.split(' ').slice(-1)[0]};${cardData.name.split(' ')[0]};;;
TITLE:${cardData.title}
ORG:${cardData.company}
TEL;TYPE=CELL:${cardData.phone}
EMAIL:${cardData.email}
URL:https://${cardData.website}
ADR;TYPE=WORK:;;;;${cardData.location};;
NOTE:${cardData.bio}
END:VCARD`;

        const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cardData.name.replace(/\s+/g, '_')}.vcf`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // Share functionality
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: cardData.name,
                    text: `${cardData.name} - ${cardData.title}`,
                    url: profileUrl
                });
            } catch (e) { console.log('Share cancelled'); }
        } else {
            navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Copy link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCardData({ ...cardData, photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Add new link
    const addLink = () => {
        const newLink: LinkItem = {
            id: Date.now().toString(),
            title: 'Nuevo Enlace',
            url: 'https://',
            icon: 'website',
            color: '#6366F1'
        };
        setCardData({ ...cardData, links: [...cardData.links, newLink] });
    };

    // Update link
    const updateLink = (id: string, field: keyof LinkItem, value: string) => {
        setCardData({
            ...cardData,
            links: cardData.links.map(link =>
                link.id === id ? { ...link, [field]: value } : link
            )
        });
    };

    // Delete link
    const deleteLink = (id: string) => {
        setCardData({
            ...cardData,
            links: cardData.links.filter(link => link.id !== id)
        });
    };

    // Generate Background with user's custom description
    const generateBackground = async () => {
        if (!cardData.backgroundPrompt) {
            alert('Por favor describe el fondo que deseas generar');
            return;
        }

        setIsTyping(true);
        try {
            // Use the dedicated image generation API
            const endpoint = '/api/generate-image';

            // Use the user's custom description for the background
            const userPrompt = cardData.backgroundPrompt;
            const prompt = `${userPrompt}. Estilo cinematográfico, profesional, alta calidad, 4K. Colores: ${cardData.primaryColor || '#6366F1'} y ${cardData.accentColor || '#F472B6'}.`;

            console.log("🎨 SynCards: Calling image generation with user prompt...", { prompt });

            const response = await axios.post(endpoint, {
                prompt,
                companyName: cardData.company,
                slogan: cardData.slogan,
                style: 'Cinematic, Professional, High-Tech',
                primaryColor: cardData.primaryColor,
                accentColor: cardData.accentColor
            }, {
                timeout: 90000 // 90 seconds timeout for image generation
            });

            console.log("✅ SynCards: Response received:", response.data);

            // Handle response from generate-image API
            const imageUrl = response.data?.imageUrl
                || response.data?.url
                || response.data?.image;

            if (imageUrl) {
                setCardData(prev => ({ ...prev, coverImage: imageUrl }));
                const provider = response.data?.provider || 'ai';
                console.log(`🖼️ SynCards: Background image set (${provider}):`, imageUrl);

                if (response.data?.provider === 'fallback') {
                    alert('⚠️ Se usó una imagen temporal. Kling y Qwen no estaban disponibles.');
                }
            } else {
                console.error("⚠️ SynCards: No image URL in response", response.data);
                alert("El servidor procesó la solicitud pero no devolvió una imagen.");
            }
        } catch (error: any) {
            console.error("❌ SynCards: Background Generation Failed:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                alert('La generación de imagen tardó demasiado. Kling AI puede estar ocupado. Intenta de nuevo.');
            } else if (error.response?.status === 502 || error.response?.status === 504) {
                alert('Error de conexión con el servidor. Verifica tu conexión a internet.');
            } else {
                alert(`Error al generar fondo: ${error.response?.data?.output || error.response?.data?.error || error.message}`);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const [isTyping, setIsTyping] = useState(false);

    const isLightMode = theme.background.includes('F1F5F9') || theme.background.includes('F3F4F6') || theme.background.includes('ffffff');

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row" style={{ backgroundColor: '#0f0f0f' }}>

            {/* ===== PREVIEW COLUMN (Mobile-First Link in Bio) ===== */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
                <div
                    ref={cardRef}
                    className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl relative"
                    style={{
                        background: '#0f0f1a',
                        minHeight: '600px'
                    }}
                >
                    {/* Background Image Layer (from logo midpoint down) */}
                    {cardData.coverImage && (
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: `url(${cardData.coverImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                top: '100px', // Start from below the header
                            }}
                        >
                            {/* Dark overlay for text legibility */}
                            <div className="absolute inset-0 bg-black/70" />
                        </div>
                    )}

                    {/* Cover / Header - Uses Primary & Accent Colors */}
                    <div
                        className="relative h-32 z-10"
                        style={{
                            background: `linear-gradient(135deg, ${cardData.primaryColor} 0%, ${cardData.accentColor} 100%)`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Profile Section */}
                    <div className="px-6 -mt-16 relative z-10">
                        {/* Avatar */}
                        <div className="w-28 h-28 mx-auto rounded-full border-4 border-[#0f0f1a] overflow-hidden bg-gray-800 shadow-xl relative">
                            {cardData.photo ? (
                                <img src={cardData.photo} alt={cardData.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                                    <User className="w-12 h-12 text-white/40" />
                                </div>
                            )}
                        </div>

                        {/* Name & Title - Uses Accent Color */}
                        <div className="text-center mt-4">
                            <h1 className="text-2xl font-bold text-white">{cardData.name}</h1>
                            <p className="font-medium" style={{ color: cardData.accentColor }}>{cardData.title}</p>
                            <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
                                <MapPin size={14} />
                                {cardData.location}
                            </p>
                        </div>

                        {/* Bio */}
                        <p className="text-center text-gray-300 text-sm mt-4 leading-relaxed">
                            {cardData.bio}
                        </p>

                        {/* Quick Actions - Uses Primary Color */}
                        <div className="flex justify-center gap-3 mt-6">
                            <button
                                onClick={handleDownloadVCard}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:scale-105 transition-transform"
                                style={{ background: `linear-gradient(135deg, ${cardData.primaryColor} 0%, ${cardData.accentColor} 100%)` }}
                            >
                                <Download size={16} />
                                Guardar Contacto
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <Share2 size={18} />
                            </button>
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <QrCode size={18} />
                            </button>
                        </div>

                        {/* QR Code Modal */}
                        {showQR && (
                            <div className="mt-4 p-4 rounded-2xl bg-white flex flex-col items-center">
                                <QRCode value={profileUrl} size={150} level="H" />
                                <p className="text-gray-600 text-xs mt-2">Escanea para ver perfil</p>
                            </div>
                        )}
                    </div>

                    {/* Links Section - Uses Platform Colors (LinkedIn blue, Instagram pink, etc.) */}
                    <div className="px-6 py-6 space-y-3 relative z-10">
                        {cardData.links.map((link) => {
                            const IconComponent = iconMap[link.icon] || Globe;
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] hover:border-white/20 transition-all group backdrop-blur-sm"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: link.color }}
                                    >
                                        <IconComponent size={20} className="text-white" />
                                    </div>
                                    <span className="flex-1 text-white font-medium">{link.title}</span>
                                    <ExternalLink size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            );
                        })}
                    </div>

                    {/* NFC Section */}
                    <div className="px-6 pb-6 relative z-10">
                        <button
                            onClick={handleNFCWrite}
                            disabled={nfcStatus === 'writing'}
                            className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all backdrop-blur-sm ${nfcStatus === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' :
                                nfcStatus === 'error' ? 'border-red-500 bg-red-500/10 text-red-400' :
                                    nfcStatus === 'unsupported' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' :
                                        'border-white/20 text-gray-400 hover:border-fuchsia-500 hover:text-fuchsia-400'
                                }`}
                            style={nfcStatus === 'idle' ? { '--hover-border-color': cardData.accentColor } as React.CSSProperties : {}}
                        >
                            <Nfc size={24} className={nfcStatus === 'writing' ? 'animate-pulse' : ''} />
                            <span className="font-medium">
                                {nfcStatus === 'writing' ? 'Acerca tu tag NFC...' :
                                    nfcStatus === 'success' ? 'Tag NFC Programado!' :
                                        nfcStatus === 'error' ? 'Error - Intenta de nuevo' :
                                            nfcStatus === 'unsupported' ? 'NFC no soportado en este dispositivo' :
                                                'Programar Tag NFC'}
                            </span>
                        </button>
                    </div>

                    {/* Footer Branding */}
                    <div className="px-6 pb-6 text-center relative z-10">
                        <p className="text-gray-500 text-xs">
                            Powered by <span style={{ color: cardData.accentColor }} className="font-medium">SynCards</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== EDITOR COLUMN ===== */}
            <div
                className="w-full lg:w-96 bg-gray-900 border-l border-white/10 overflow-y-auto"
                style={{ maxHeight: '100vh' }}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <Sparkles size={20} className="text-fuchsia-400" />
                        Editar Perfil
                    </h2>

                    {/* Photo Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Foto de Perfil</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
                                {cardData.photo ? (
                                    <img src={cardData.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                Cambiar Foto
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={cardData.name}
                                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Titulo / Cargo</label>
                            <input
                                type="text"
                                value={cardData.title}
                                onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Ubicacion</label>
                            <input
                                type="text"
                                value={cardData.location}
                                onChange={(e) => setCardData({ ...cardData, location: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Eslogan de Marca</label>
                            <input
                                type="text"
                                value={cardData.slogan}
                                onChange={(e) => setCardData({ ...cardData, slogan: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Color Primario</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={cardData.primaryColor}
                                        onChange={(e) => setCardData({ ...cardData, primaryColor: e.target.value })}
                                        className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={cardData.primaryColor}
                                        onChange={(e) => setCardData({ ...cardData, primaryColor: e.target.value })}
                                        className="flex-1 px-2 py-1 rounded bg-gray-800 text-white text-xs border border-gray-700 uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Color Acento</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={cardData.accentColor}
                                        onChange={(e) => setCardData({ ...cardData, accentColor: e.target.value })}
                                        className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={cardData.accentColor}
                                        onChange={(e) => setCardData({ ...cardData, accentColor: e.target.value })}
                                        className="flex-1 px-2 py-1 rounded bg-gray-800 text-white text-xs border border-gray-700 uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                            <textarea
                                value={cardData.bio}
                                onChange={(e) => setCardData({ ...cardData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* MarketSyn Design Tools */}
                    <div className="mb-6 p-4 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-600/20">
                        <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Wand2 size={14} /> MarketSyn Design Engine
                        </h3>
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Describe el fondo que deseas</label>
                            <textarea
                                value={cardData.backgroundPrompt || ''}
                                onChange={(e) => setCardData({ ...cardData, backgroundPrompt: e.target.value })}
                                placeholder="Ej: Fondo futurista con luces neón, Ciudad nocturna con rascacielos, Montañas con atardecer épico..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:border-fuchsia-500 focus:outline-none resize-none"
                            />
                        </div>
                        <button
                            onClick={generateBackground}
                            disabled={isTyping || !cardData.backgroundPrompt}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isTyping ? "Generando..." : "Generar Fondo Cinematográfico"}
                            {!isTyping && <ImageIcon size={18} />}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                            IA genera fondos exclusivos basados en tu descripción.
                        </p>
                    </div>

                    {/* Sales Portfolio */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Portafolio de Ventas (MarketSyn)</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Lista de Precios / Servicios</label>
                            <textarea
                                value={cardData.portfolio?.prices}
                                onChange={(e) => setCardData({
                                    ...cardData,
                                    portfolio: { ...cardData.portfolio!, prices: e.target.value }
                                })}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Estrategias y Resultados</label>
                            <textarea
                                value={cardData.portfolio?.strategies}
                                onChange={(e) => setCardData({
                                    ...cardData,
                                    portfolio: { ...cardData.portfolio!, strategies: e.target.value }
                                })}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Contacto</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={cardData.email}
                                onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Telefono</label>
                            <input
                                type="tel"
                                value={cardData.phone}
                                onChange={(e) => setCardData({ ...cardData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Sitio Web</label>
                            <input
                                type="text"
                                value={cardData.website}
                                onChange={(e) => setCardData({ ...cardData, website: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-fuchsia-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Links Editor */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Enlaces</h3>
                            <button
                                onClick={addLink}
                                className="px-3 py-1 rounded-lg bg-fuchsia-600 text-white text-xs font-medium hover:bg-fuchsia-700 transition-colors"
                            >
                                + Agregar
                            </button>
                        </div>
                        <div className="space-y-3">
                            {cardData.links.map((link) => (
                                <div key={link.id} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <select
                                            value={link.icon}
                                            onChange={(e) => {
                                                const icon = e.target.value as keyof typeof linkColors;
                                                updateLink(link.id, 'icon', icon);
                                                updateLink(link.id, 'color', linkColors[icon] || '#6366F1');
                                            }}
                                            className="px-2 py-1 rounded bg-gray-700 text-white text-sm border-none"
                                        >
                                            {Object.keys(iconMap).map(key => (
                                                <option key={key} value={key}>{key}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={link.title}
                                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                            className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm border-none"
                                            placeholder="Titulo"
                                        />
                                        <button
                                            onClick={() => deleteLink(link.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                        className="w-full px-2 py-1 rounded bg-gray-700 text-white text-sm border-none"
                                        placeholder="https://"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Copy Link */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        {copied ? 'Enlace Copiado!' : 'Copiar Enlace de Perfil'}
                    </button>
                </div>
            </div>
        </div>
    );
}
