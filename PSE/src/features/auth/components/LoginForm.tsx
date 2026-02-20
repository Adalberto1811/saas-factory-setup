'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('[LOGIN] Starting NextAuth login...');
        console.log('[LOGIN] Email:', email);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // Manejar redirección manualmente
            });

            console.log('[LOGIN] SignIn result:', result);

            if (result?.error) {
                console.log('[LOGIN] Error:', result.error);
                setError('Credenciales inválidas');
                setLoading(false);
            } else if (result?.ok) {
                console.log('[LOGIN] Success! Redirecting to /performance...');
                // Redirigir después del login exitoso
                window.location.href = '/performance';
            }
        } catch (err: any) {
            console.error('[LOGIN] Catch error:', err);
            setError(err.message || 'Error desconocido');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-synergos-electric-blue/20 shadow-[0_0_50px_rgba(0,229,255,0.1)]">
            <div className="mb-8 text-center">
                <div className="mx-auto w-16 h-16 bg-synergos-electric-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-synergos-electric-blue/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                    <Lock className="w-8 h-8 text-synergos-electric-blue" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Acceso Atleta</h2>
                <p className="text-slate-400 text-sm mt-3 font-medium">Ingresa a tu ecosistema de alto rendimiento</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Correo Electrónico</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-synergos-electric-blue transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-synergos-electric-blue/50 focus:ring-1 focus:ring-synergos-electric-blue/50 transition-all font-light"
                            placeholder="atleta@evolucion.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-synergos-electric-blue transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-synergos-electric-blue/50 focus:ring-1 focus:ring-synergos-electric-blue/50 transition-all font-light"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-synergos-electric-blue transition-colors" />
                        <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Recordarme</span>
                    </label>
                    <Link href="/login/recover" className="text-xs text-synergos-electric-blue hover:text-synergos-electric-blue/80 transition-colors font-bold uppercase tracking-wider">
                        ¿Olvidaste tu clave?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-synergos-electric-blue hover:scale-[1.02] active:scale-[0.98] text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sincronizando...
                        </>
                    ) : (
                        'Iniciar Evolución'
                    )}
                </button>

                <div className="relative my-8 px-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                        <span className="bg-[#020408] px-4 text-slate-600 font-bold">O continúa con</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        const callbackUrl = params.get('callbackUrl') || '/performance';
                        signIn('google', { callbackUrl });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-4 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google Sync
                </button>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 text-sm">
                        ¿Nuevo en la evolución?{' '}
                        <Link href="/signup" className="text-synergos-neon-green hover:underline decoration-synergos-neon-green/30 underline-offset-4 transition-all font-bold">
                            Crea tu cuenta aquí
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
