const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function diagnose() {
    try {
        console.log('--- Diagnóstico de Usuarios ---');
        const users = await sql`SELECT * FROM users LIMIT 20`;
        console.table(users);

        console.log('\n--- Diagnóstico de Planes ---');
        const plans = await sql`SELECT * FROM pse_plans LIMIT 5`;
        console.table(plans);

        console.log('\n--- Diagnóstico de Liliana Hernandez ---');
        const liliana = await sql`SELECT * FROM users WHERE name = 'Liliana Hernandez'`;
        console.table(liliana);
    } catch (err) {
        console.error('Error en diagnóstico:', err);
    }
}

diagnose();
