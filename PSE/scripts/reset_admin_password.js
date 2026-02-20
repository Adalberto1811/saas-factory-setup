const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetAdminPassword() {
    try {
        const newPassword = 'Admin123!';
        const passwordHash = await bcrypt.hash(newPassword, 10);

        const result = await sql`
            UPDATE users 
            SET password_hash = ${passwordHash},
                must_change_password = false
            WHERE email = 'admin@performanceswimming.online'
            RETURNING id, email, full_name
        `;

        console.log('✅ Contraseña del admin reseteada');
        console.log('---');
        console.log('📧 Email: admin@performanceswimming.online');
        console.log('🔑 Nueva contraseña: Admin123!');
        console.log('---');
        console.log('Ya puedes loguearte con estas credenciales.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

resetAdminPassword();
