import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function listTenants() {
    if (!process.env.DATABASE_URL) {
        console.log(JSON.stringify([]));
        return;
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const tenants = await sql`
            SELECT name, slug FROM tenants 
            ORDER BY created_at DESC
        `;

        console.log(JSON.stringify(tenants));
    } catch (error) {
        // Fail silently or empty list so we don't break the PS script
        console.error("Error fetching tenants:", error.message);
        console.log(JSON.stringify([]));
    }
}

listTenants();
