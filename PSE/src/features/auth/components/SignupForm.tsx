'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export function SignupForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/performance/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fallo en el registro');
            }

            setSuccess(true);

            // Auto login after 2 seconds
            setTimeout(async () => {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });
                if (result?.ok) {
                    window.location.href = '/performance';
                } else {
                    router.push('/login');
                }
            }, 1500);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md p-10 rounded-3xl bg-black/60 backdrop-blur-xl border border-synergos-neon-green/30 shadow-[0_0_50px_rgba(57,255,20,0.1)] text-center animate-in zoom-in-95 duration-500">
                <div className="mx-auto w-20 h-20 bg-synergos-neon-green/10 rounded-full flex items-center justify-center mb-8 border border-synergos-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-synergos-neon-green" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">¡ADN Registrado!</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                    Tu perfil de atleta ha sido creado exitosamente. Inicializando ecosistema de entrenamiento...
                </p>
                <div className="mt-8 flex justify-center">
                    <Loader2 className="w-6 h-6 text-synergos-neon-green animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-synergos-electric-blue/20 shadow-[0_0_50px_rgba(0,229,255,0.1)]">
            <div className="mb-8 text-center">
                <div className="mx-auto w-16 h-16 bg-synergos-electric-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-synergos-electric-blue/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                    <User className="w-8 h-8 text-synergos-electric-blue" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Nueva Evolución</h2>
                <p className="text-slate-400 text-sm mt-3 font-medium">Crea tu cuenta de atleta profesional</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Nombre Completo</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-synergos-electric-blue transition-colors" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-synergos-electric-blue/50 focus:ring-1 focus:ring-synergos-electric-blue/50 transition-all font-light"
                            placeholder="Ej. Adalberto Hernandez"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-synergos-electric-blue transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-synergos-electric-blue/50 focus:ring-1 focus:ring-synergos-electric-blue/50 transition-all font-light"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-synergos-electric-blue hover:scale-[1.02] active:scale-[0.98] text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Registrando...
                        </>
                    ) : (
                        'Crear Cuenta'
                    )}
                </button>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="text-synergos-electric-blue hover:underline decoration-synergos-electric-blue/30 underline-offset-4 transition-all font-bold">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
