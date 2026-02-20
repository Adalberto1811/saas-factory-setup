import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Sun, Moon } from 'lucide-react';

interface Theme {
    primary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
}

interface LoginProps {
    onLogin: () => void;
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Login = ({ onLogin, theme, isDarkMode, toggleTheme }: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulated authentication - replace with Supabase auth in production
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email && password) {
            localStorage.setItem('session_token', 'demo_token_' + Date.now());
            onLogin();
        } else {
            setError('Por favor ingresa email y contraseña');
        }

        setIsLoading(false);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: theme.background }}
        >
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-full transition-colors"
                style={{ backgroundColor: theme.card }}
            >
                {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                    <Moon className="w-5 h-5" style={{ color: theme.text }} />
                )}
            </button>

            <div
                className="w-full max-w-md rounded-2xl shadow-2xl p-8 border"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg"
                        style={{ backgroundColor: theme.primary }}
                    >
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                        Synergos Solutions
                    </h1>
                    <p className="text-sm opacity-60 mt-2" style={{ color: theme.text }}>
                        Accede a tu plataforma de IA
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" style={{ color: theme.text }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                    color: theme.text
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" style={{ color: theme.text }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                    color: theme.text
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" style={{ color: theme.text }} />
                                ) : (
                                    <Eye className="w-5 h-5" style={{ color: theme.text }} />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-lg font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                        style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 0 20px ${theme.accent}40`
                        }}
                    >
                        {isLoading ? 'Accediendo...' : 'Acceder'}
                    </button>
                </form>

                <p className="text-center text-xs mt-6 opacity-50" style={{ color: theme.text }}>
                    © 2026 Synergos Solutions. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
