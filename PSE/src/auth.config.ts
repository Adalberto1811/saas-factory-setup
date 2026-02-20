import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    // Auth.js v5: basePath is RELATIVE to Next.js basePath (/performance)
    // Next.js already mounts /api/auth under /performance/api/auth
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
            const isLoggedIn = !!auth?.user;
            const path = nextUrl.pathname;
            const userEmail = auth?.user?.email || '';

            // console.log(`[AUTH_AUTH] Path: ${path}, User: ${userEmail}, LoggedIn: ${isLoggedIn}`);

            // 1. Static and Public Routes
            if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|json|js|webmanifest|css|webp|avif)$/)) return true;
            if (path.includes('/performance/api/')) return true; // EXEMPCIÓN TOTAL DE API PARA EVITAR REDIRECTS EN FETCH
            if (path.includes('/login')) return true;
            if (path.includes('/signup')) return true;

            // 1.5 DIRECT ADMIN ACCESS BYPASS
            const token = nextUrl.searchParams.get('access');
            if (token === 'pse_admin_2026') return true;

            // Allow ONLY landing pages to bypass
            if (path.includes('/landing')) return true;

            // FORCED BLOCK: For testing, if it contains admin, we MUST be logged in
            if (path.toLowerCase().includes('admin')) {
                if (!isLoggedIn) {
                    const loginUrl = new URL('/performance/login', nextUrl.origin);
                    loginUrl.searchParams.set('callbackUrl', path);
                    return Response.redirect(loginUrl);
                }
            }

            // 2. Admin Protection (Atomic Level)
            if (path.includes('/admin')) {
                // EXCLUSIVIDAD TOTAL: Solo adalberto1811@gmail.com o lo definido explícitamente en env
                const adminEmails = (process.env.ADMIN_EMAIL || 'adalberto1811@gmail.com,damien87hg@gmail.com,adalberto@pse-atleta.com').split(',').map(e => e.trim());

                const isAuthorizedAdmin = isLoggedIn && adminEmails.includes(userEmail);

                if (isAuthorizedAdmin) return true;

                // Explicitly DENY and redirect to login
                const loginUrl = new URL('/performance/login', nextUrl.origin);
                loginUrl.searchParams.set('callbackUrl', path);
                return Response.redirect(loginUrl);
            }

            // 3. Performance Coach (Protected)
            const isAdminToken = token === 'pse_admin_2026';

            if (path.startsWith('/performance')) {
                // Allow static assets, login, signup, api, and landing to pass
                if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|json|js|webmanifest|css|webp|avif)$/)) return true;
                if (path.includes('/performance/api/')) return true;
                if (path.includes('/login')) return true;
                if (path.includes('/signup')) return true;
                if (path.includes('/landing')) return true;

                // Mandatory Auth for everything else under /performance
                if (isLoggedIn || isAdminToken) return true;

                // If unauthenticated, forced redirect to login
                const loginUrl = new URL('/performance/login', nextUrl.origin);
                loginUrl.searchParams.set('callbackUrl', path);
                return Response.redirect(loginUrl);
            }

            // FALLBACK
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
