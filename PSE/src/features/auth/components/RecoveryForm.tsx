'use client';

import { useState } from 'react';
import { authService } from '../services/authService';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function RecoveryForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        const res = await authService.recoverPassword(email);

        setLoading(false);
        if (res.error) {
            setStatus('error');
            setMessage(res.error);
        } else {
            setStatus('success');
            setMessage('If an account exists, a recovery link has been sent to your email.');
        }
    };

    if (status === 'success') {
        return (
            <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-gray-400 mb-8">{message}</p>
                <Link
                    href="/login"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="mb-8">
                <Link href="/login" className="inline-flex items-center text-gray-500 hover:text-gray-300 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>
                <h2 className="text-2xl font-bold text-white">Recover Access</h2>
                <p className="text-gray-400 text-sm mt-2">We'll send you a secure link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                    <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {message}
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send Recovery Link'
                    )}
                </button>
            </form>
        </div>
    );
}
