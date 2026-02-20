const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('TABLES:', tables.map(t => t.table_name));

        for (const t of ['users', 'pse_plans', 'pse_activity_log']) {
            const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${t}`;
            console.log(`COLS ${t}:`, cols.map(c => c.column_name));
        }
    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e.message);
    }
}
run();
