// Actualizar rol de usuario a admin
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        const result = await sql`UPDATE users SET role = 'admin' WHERE id = 5 RETURNING id, full_name, role`;
        console.log('✅ Usuario actualizado:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

main();
