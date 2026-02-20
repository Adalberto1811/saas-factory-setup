import { MessageCircle, Mail, Lock } from 'lucide-react';

interface ModuleNotActivatedProps {
    moduleName: string;
    theme: {
        primary: string;
        accent: string;
        background: string;
        text: string;
        card: string;
        border: string;
    };
}

export default function ModuleNotActivated({ moduleName, theme }: ModuleNotActivatedProps) {
    const isLightMode = theme.background.includes('F1F5F9') ||
        theme.background.includes('F3F4F6') ||
        theme.background.includes('f0fdf4') ||
        theme.background.includes('fffff0');

    return (
        <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: theme.background }}
        >
            <div
                className="max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border"
                style={{
                    background: isLightMode
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.9) 100%)'
                        : 'linear-gradient(135deg, #0a1628 0%, #1e293b 100%)',
                    borderColor: theme.border
                }}
            >
                {/* Header with Logo */}
                <div
                    className="p-8 flex flex-col items-center text-center"
                    style={{
                        background: 'linear-gradient(135deg, #0a1628 0%, #1a365d 100%)'
                    }}
                >
                    {/* Synergos Logo */}
                    <div className="w-32 h-32 mb-6 rounded-2xl overflow-hidden shadow-lg bg-[#0a1628] p-2">
                        <img
                            src="/synergos-logo.jpg"
                            alt="Synergos Solutions"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Lock Icon */}
                    <div className="p-3 rounded-full bg-amber-500/20 mb-4">
                        <Lock className="text-amber-400" size={28} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Modulo No Activado
                    </h2>
                    <p className="text-blue-200 text-lg font-medium">
                        {moduleName}
                    </p>
                </div>

                {/* Message Body */}
                <div className="p-8 text-center">
                    <p className="text-lg mb-6" style={{ color: theme.text }}>
                        En este momento no tienes activada esta funcion.
                    </p>

                    <p className="text-base opacity-70 mb-8" style={{ color: theme.text }}>
                        Para mas informacion comunicate con <strong>Synergos Solutions</strong>:
                    </p>

                    {/* Contact Options */}
                    <div className="space-y-4">
                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/584262735288?text=Hola,%20me%20interesa%20activar%20el%20modulo%20de%20mi%20SaaS"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                boxShadow: '0 8px 30px rgba(37, 211, 102, 0.3)'
                            }}
                        >
                            <MessageCircle size={22} />
                            WhatsApp: +58 426 273 5288
                        </a>

                        {/* Email */}
                        <a
                            href="mailto:synergossolutions@gmail.com?subject=Consulta%20Activacion%20de%20Modulo%20SaaS"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border"
                            style={{
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                color: theme.text
                            }}
                        >
                            <Mail size={22} style={{ color: theme.accent }} />
                            synergossolutions@gmail.com
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="p-4 text-center border-t"
                    style={{ borderColor: theme.border }}
                >
                    <p className="text-xs opacity-50" style={{ color: theme.text }}>
                        Synergos Solutions - Automatizacion Inteligente para tu Negocio
                    </p>
                </div>
            </div>
        </div>
    );
}
