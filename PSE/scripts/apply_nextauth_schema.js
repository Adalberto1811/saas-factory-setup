const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        console.log('🔄 Creando tablas NextAuth...');

        // Ejecutar comandos uno por uno para mayor seguridad
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP WITH TIME ZONE`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "image" TEXT`;

        await sql`CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(255) NOT NULL,
          provider VARCHAR(255) NOT NULL,
          "providerAccountId" VARCHAR(255) NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at BIGINT,
          id_token TEXT,
          scope TEXT,
          session_state TEXT,
          token_type VARCHAR(255),
          PRIMARY KEY (id)
        )`;

        await sql`CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          "sessionToken" VARCHAR(255) NOT NULL,
          PRIMARY KEY (id)
        )`;

        await sql`CREATE TABLE IF NOT EXISTS verification_token (
          identifier VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY (identifier, token)
        )`;

        await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId")`;
        await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId")`;

        console.log('✅ Tablas NextAuth creadas con éxito');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

run();
