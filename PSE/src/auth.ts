
import NextAuth from "next-auth"
import { Pool } from "@neondatabase/serverless"
import NeonAdapter from "@auth/neon-adapter"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"

// URLs are now managed via InsForge Environment Variables
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:4000/performance';
process.env.AUTH_URL = baseUrl;
process.env.NEXTAUTH_URL = baseUrl;

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    debug: true,
    adapter: NeonAdapter(pool),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
})
