import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { Client } = pkg;

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("Existing Tables:", res.rows.map(r => r.table_name).sort());
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
