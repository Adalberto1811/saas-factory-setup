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

        // Add new columns if they don't exist
        const columns = [
            'gender TEXT',
            'age FLOAT',
            'training_stage TEXT',
            'wingspan_cm FLOAT',
            'bicipital_mm FLOAT',
            'peroneal_mm FLOAT',
            'abdomen_cm FLOAT',
            'thigh_upper_cm FLOAT',
            'thigh_mid_cm FLOAT',
            'forearm_cm FLOAT',
            'bmi FLOAT',
            'bmi_percentile TEXT',
            'sitting_height_cm FLOAT'
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

        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}
migrate();
