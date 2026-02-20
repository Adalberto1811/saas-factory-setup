import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { Client } = pkg;

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();

        const columns = [
            'athlete_name TEXT',
            'birth_date DATE',
            'modality TEXT',
            'id_number TEXT'
        ];

        for (const col of columns) {
            const [name] = col.split(' ');
            try {
                await client.query(`ALTER TABLE anthropometric_records ADD COLUMN IF NOT EXISTS ${col}`);
                console.log(`Column ${name} checked/added.`);
            } catch (e) {
                console.error(`Error adding column ${name}:`, e.message);
            }
        }

        console.log("Athlete metadata migration completed.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}
migrate();
