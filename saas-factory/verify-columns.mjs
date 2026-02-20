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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'anthropometric_records';
        `);
        console.log("Columns in anthropometric_records:");
        res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
