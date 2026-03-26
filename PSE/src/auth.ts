
import NextAuth from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"

// Cleaned up legacy URL overrides; Auth.js v5 relies on basePath

// Connection pooling for Neon
const dbUrl = process.env.DATABASE_URL?.trim();

let adapter: any = undefined;
try {
    if (dbUrl) {
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        adapter = PostgresAdapter(pool);
    }
} catch (e) {
    console.warn("[AUTH] Failed to initialize NeonAdapter (Database might be unavailable):", e);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    debug: true, 
    adapter,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
})
