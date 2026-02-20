import React from 'react';
import Link from 'next/link';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com,damien87hg@gmail.com,adalberto@pse-atleta.com').split(',').map(e => e.trim());

    const isAuthorizedAdmin = session?.user && adminEmails.includes(session.user.email || '');

    if (!isAuthorizedAdmin) {
        // console.warn(`[SECURITY] Layout-level bypass attempt from: ${session?.user?.email || 'Guest'}`);
        return redirect('/performance/login');
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#39FF14]/30">
            {/* Admin Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-[#007FFF] flex items-center justify-center border border-white/20 shadow-[0_0_15px_#39FF14/30]">
                            <span className="text-xl font-black italic text-black">A</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-white to-blue-500 uppercase">
                                CONTROL MAESTRO PSE
                            </h1>
                            <p className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Neural Center // Administrador</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link href="/performance" className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
                            Ver App Usuario
                        </Link>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_10px_#39FF14]" />
                            <span className="text-xs font-black tracking-widest text-[#39FF14] uppercase">Motor en Vivo</span>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
