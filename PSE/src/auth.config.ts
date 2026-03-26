import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    // Auth.js v5: basePath internal route relative to Next.js app root
    // (Next.js automatically handles the /performance prefix)
    basePath: "/api/auth",
    trustHost: true,
    session: { strategy: "jwt" },
    pages: {
        signIn: '/performance/login',
        error: '/performance/login',
    },

    callbacks: {
        authorized({ auth, request: req }) {
            const nextUrl = req.nextUrl;
            const path = nextUrl.pathname;
            const isLoggedIn = !!auth?.user;

            // EXEMPCIONES CRÍTICAS (No tocar ni redirigir estas rutas)
            if (path.includes('/api/auth')) return true;
            if (path.includes('/performance/api')) return true;
            if (path.startsWith('/performance/api/')) return true;
            if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|json|js|webmanifest|css|webp|avif)$/)) return true;

            // Resto de la lógica de protección...
            if (path.includes('/login') || path.includes('/signup')) return true;
            
            // Bypass Admin
            const token = nextUrl.searchParams.get('access');
            if (token === 'pse_admin_2026') return true;

            // Proteger /performance (menos rutas públicas)
            if (path.startsWith('/performance')) {
                if (isLoggedIn) return true;
                const loginUrl = new URL('/performance/login', nextUrl.origin);
                loginUrl.searchParams.set('callbackUrl', path);
                return Response.redirect(loginUrl);
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
            }
            return session
        }
    },
    providers: [], // Providers (e.g. Credentials) will be added in auth.ts
} satisfies NextAuthConfig
