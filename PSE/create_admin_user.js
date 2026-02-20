const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
    try {
        const email = 'admin@performanceswimming.online';
        const password = 'PSEAdmin2026!';
        const name = 'Admin PSE';

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if user exists
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;

        if (existing.length > 0) {
            console.log('✅ Usuario admin ya existe. ID:', existing[0].id);
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);
            return;
        }

        // Create user
        const result = await sql`
            INSERT INTO users (full_name, email, password_hash)
            VALUES (${name}, ${email}, ${passwordHash})
            RETURNING id, email, full_name
        `;

        console.log('✅ Usuario admin creado exitosamente!');
        console.log('---');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Nombre:', name);
        console.log('🆔 ID:', result[0].id);
        console.log('---');
        console.log('Usa estas credenciales para loguearte en /login');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

createAdminUser();
