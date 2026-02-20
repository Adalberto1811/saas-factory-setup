'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/authService';
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (!token) return;

        setLoading(true);
        setStatus('idle');

        const res = await authService.resetPassword(token, password);

        setLoading(false);
        if (res.error) {
            setStatus('error');
            setMessage(res.error);
        } else {
            setStatus('success');
            setMessage('Your password has been reset successfully.');
        }
    };

    if (status === 'success') {
        return (
            <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset</h2>
                <p className="text-gray-400 mb-8">{message}</p>
                <Link
                    href="/login"
                    className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
                >
                    Login with New Password
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Set New Password</h2>
                <p className="text-gray-400 text-sm mt-2">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                    <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {message}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            placeholder="New password"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-widest pl-1">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            placeholder="Confirm password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>
        </div>
    );
}

export function ResetForm() {
    return (
        <Suspense fallback={<div className="text-white">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
