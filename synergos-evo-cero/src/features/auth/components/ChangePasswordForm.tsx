'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { authService } from '../services/authService';

export default function ChangePasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setStatus('idle');

        const res = await authService.changePassword(password);

        setLoading(false);
        if (res.error) {
            setStatus('error');
            setMessage(res.error);
        } else {
            setStatus('success');
            setMessage('Password updated successfully. Redirecting...');
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
                    <Lock className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                    Security Update
                </h1>
                <p className="text-sm text-yellow-500/90 mt-2 font-medium">
                    Initial login detected. Please set your permanent password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {status !== 'idle' && (
                    <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${status === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder:text-white/20 transition-all outline-none"
                            placeholder="New Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder:text-white/20 transition-all outline-none"
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Set Permanent Password
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
