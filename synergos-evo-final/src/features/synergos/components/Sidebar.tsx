import React from 'react';
import { X, Home, Mic, FileText, BarChart2, CreditCard, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
    activeModule: string;
    onModuleChange: (module: any) => void;
}

export default function Sidebar({ isOpen, closeSidebar, activeModule, onModuleChange }: SidebarProps) {
    const handleLogout = () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('session_token');
            window.location.reload();
        }
    };

    return (
        <>
            {/* 1. EL FONDO OSCURO (BACKDROP) - Permite cerrar dando clic afuera */}
            {isOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
                />
            )}

            {/* 2. EL PANEL LATERAL (MENU) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* CABECERA DEL MENU CON LA "X" */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <span className="text-lg font-bold text-blue-400">Menú</span>
                    <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* CONTENIDO DE NAVEGACIÓN */}
                <nav className="p-4 space-y-2">
                    <NavItem
                        icon={<Home />}
                        label="Suite Legal"
                        active={activeModule === 'agent'}
                        onClick={() => { onModuleChange('agent'); closeSidebar(); }}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="AgentSyn"
                        active={activeModule === 'agent_chat'} // Differentiating to avoid double highlight if possible, or just map to agent
                        // Actually, let's map AgentSyn to 'agent' as well for now, or maybe 'agent' is the suite?
                        // If I map both to 'agent', both highlight. 
                        // I'll map AgentSyn to 'agent' and Suite Legal to 'agent' but maybe I should check if I can split them?
                        // For now, I'll map AgentSyn to 'agent' and Suite Legal to 'agent'.
                        // To avoid visual confusion, I'll just let them both be active if 'agent' is active.
                        onClick={() => { onModuleChange('agent'); closeSidebar(); }}
                    />
                    <NavItem
                        icon={<Mic />}
                        label="TranscripSyn"
                        active={activeModule === 'transcription'}
                        onClick={() => { onModuleChange('transcription'); closeSidebar(); }}
                    />
                    <NavItem
                        icon={<BarChart2 />}
                        label="MarketSyn"
                        active={activeModule === 'marketing'}
                        onClick={() => { onModuleChange('marketing'); closeSidebar(); }}
                    />
                    <NavItem
                        icon={<CreditCard />}
                        label="SynCards"
                        active={activeModule === 'syncards'}
                        onClick={() => { onModuleChange('syncards'); closeSidebar(); }}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Mis Documentos"
                        active={activeModule === 'documents'}
                        onClick={() => { onModuleChange('documents'); closeSidebar(); }}
                    />

                    <div className="pt-8 mt-8 border-t border-gray-700">
                        <NavItem
                            icon={<Settings />}
                            label="Administración"
                            active={activeModule === 'admin'}
                            onClick={() => { onModuleChange('admin'); closeSidebar(); }}
                        />
                        <NavItem
                            icon={<LogOut />}
                            label="Cerrar Sesión"
                            color="text-red-400"
                            onClick={handleLogout}
                        />
                    </div>
                </nav>
            </div>
        </>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: string;
    color?: string;
    onClick?: () => void;
}

function NavItem({ icon, label, active, badge, color, onClick }: NavItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-yellow-900/40 text-yellow-400 border-l-4 border-yellow-400 shadow-lg shadow-blue-900/50' : 'hover:bg-gray-800 text-gray-300'}`}
        >
            <div className="flex items-center gap-3">
                <span className={color || ""}>{icon}</span>
                <span className={`font-medium ${color || ""}`}>{label}</span>
            </div>
            {badge && <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full border border-blue-700">{badge}</span>}
        </div>
    );
}

