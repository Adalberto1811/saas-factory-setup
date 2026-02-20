'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await authService.login(email, password);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            if (res.user?.must_change_password) {
                router.push('/change-password');
            } else {
                router.push('/dashboard');
            }
            router.refresh();
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="mb-8 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                    <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Command Center Access</h2>
                <p className="text-gray-400 text-sm mt-2">Enter your credentials to initialize session</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-widest pl-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            placeholder="admin@synergos.solutions"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-widest pl-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 checked:bg-blue-500 transition-colors" />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                    </label>
                    <Link href="/login/recover" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Recover Password
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Authenticating...
                        </>
                    ) : (
                        'Initialize Session'
                    )}
                </button>
            </form>
        </div>
    );
}
