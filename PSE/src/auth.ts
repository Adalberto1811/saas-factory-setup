
import NextAuth from "next-auth"
import { Pool } from "@neondatabase/serverless"
import NeonAdapter from "@auth/neon-adapter"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"

// Cleaned up legacy URL overrides; Auth.js v5 relies on basePath

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
