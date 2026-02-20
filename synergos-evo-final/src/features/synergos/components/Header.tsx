import React from 'react';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { clientConfig } from '../config/synergos-config';

interface HeaderProps {
    toggleSidebar?: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    logo?: string;
    initials?: string;
}

export default function Header({ toggleSidebar, isDarkMode, toggleTheme, logo, initials }: HeaderProps) {
    const { theme, agentName, slogan, companyInfo } = clientConfig;

    // Usar initials del prop o fallback a las primeras 2 letras del agentName
    const displayInitials = initials || agentName.substring(0, 2).toUpperCase();

    return (
        <header
            className="text-white px-6 py-4 flex items-center justify-between shadow-lg z-50 relative"
            style={{
                backgroundColor: theme.primaryColor,
                borderBottom: `2px solid ${theme.accentColor}`
            }}
        >

            {/* SECCIÓN IZQUIERDA */}
            <div className="flex items-center gap-6">

                {/* BOTÓN HAMBURGUESA */}
                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-white/10 transition-all text-white active:scale-95"
                    >
                        <Menu className="w-8 h-8" />
                    </button>
                )}

                {/* BRANDING */}
                <div className="flex items-center gap-4">

                    {/* LOGO/INICIALES */}
                    <div
                        className="w-14 h-14 rounded-full border-2 flex items-center justify-center bg-gray-900 text-xl font-bold shadow-md shrink-0 overflow-hidden"
                        style={{
                            borderColor: theme.accentColor,
                            color: theme.accentColor
                        }}
                    >
                        {displayInitials}
                    </div>

                    {/* TEXTO */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-bold tracking-wide text-white leading-tight">
                            {agentName}
                        </h1>
                        <p
                            className="text-xs font-medium"
                            style={{ color: theme.accentColor }}
                        >
                            {slogan}
                        </p>
                    </div>

                </div>
            </div>

            {/* SECCIÓN DERECHA */}
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    {isDarkMode ? (
                        <Sun className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                    ) : (
                        <Moon className="w-6 h-6 text-gray-300" />
                    )}
                </button>

                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white">{companyInfo.owner}</p>
                    <p className="text-xs text-gray-400 opacity-80">{companyInfo.role}</p>
                </div>

                {/* LOGO/AVATAR */}
                <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 overflow-hidden">
                    {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-gray-300" />
                    )}
                </div>
            </div>
        </header>
    );
}
