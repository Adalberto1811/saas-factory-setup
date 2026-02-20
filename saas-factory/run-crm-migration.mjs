import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL not found in .env.local");
    process.exit(1);
}

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Neon usually requires SSL
    });

    try {
        console.log("🚀 Connecting to Neon DB (via pg)...");
        await client.connect();

        // Read SQL file
        const sqlPath = path.join(__dirname, 'crm-integration.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log(`📜 Executing migration from: crm-integration.sql`);

        await client.query(sqlContent);

        console.log("✅ Migration executed successfully!");

    } catch (e) {
        console.error("❌ Migration Failed:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
