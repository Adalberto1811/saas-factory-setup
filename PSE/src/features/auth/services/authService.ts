import { User } from '../types';

interface AuthResponse {
    user?: User;
    error?: string;
    token?: string; // For reset flow
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch('/performance/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            return data;
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async recoverPassword(email: string): Promise<{ message?: string; error?: string }> {
        try {
            const response = await fetch('/performance/api/auth/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Recovery request failed');

            return data;
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async resetPassword(token: string, newPassword: string): Promise<{ message?: string; error?: string }> {
        try {
            const response = await fetch('/performance/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Reset failed');

            return data;
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async changePassword(newPassword: string): Promise<{ message?: string; error?: string }> {
        try {
            const response = await fetch('/performance/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Password change failed');

            return data;
        } catch (error: any) {
            return { error: error.message };
        }
    }
};
