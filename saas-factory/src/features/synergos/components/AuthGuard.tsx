import React, { useEffect, useState } from 'react';
import { Login } from './Login';

interface Theme {
    primary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
}

interface AuthGuardProps {
    children: React.ReactNode;
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const AuthGuard = ({ children, theme, isDarkMode, toggleTheme }: AuthGuardProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('session_token');
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.accent }}></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} theme={theme} isDarkMode={isDarkMode} toggleTheme={toggleTheme} tenantId="agent-syn" />;
    }

    return <>{children}</>;
};
