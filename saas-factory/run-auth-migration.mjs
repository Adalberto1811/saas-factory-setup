import fs from 'fs';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pkg;

const sqlPath = path.join(process.cwd(), 'auth-schema.sql');

async function runMigration() {
    console.log("🚀 Starting Auth Migration to Neon...");
    console.log(`📂 Reading SQL file: ${sqlPath}`);

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing in .env.local");
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Neon typically requires SSL
    });

    try {
        console.log("🔌 Connecting to Database...");
        await client.connect();
        console.log("✅ Connected!");

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log("📝 Executing SQL...");

        await client.query(sqlContent);

        console.log("✅ Migration executed successfully!");

        // Optional: Verify tables exist
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'accounts', 'sessions', 'verification_token');
        `);
        console.log("📊 Verify Tables:", res.rows.map(r => r.table_name));

    } catch (e) {
        console.error("❌ Migration Failed:", e);
    } finally {
        await client.end();
        console.log("👋 Connection closed.");
    }
}

runMigration();
