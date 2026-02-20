const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function disableMustChangePassword() {
    try {
        const result = await sql`
            UPDATE users 
            SET must_change_password = false 
            WHERE email = 'admin@performanceswimming.online'
            RETURNING id, email, must_change_password
        `;

        console.log('✅ Flag must_change_password desactivado');
        console.log('Usuario:', result[0]);
        console.log('');
        console.log('Ahora puedes loguearte e ir directo a /performance sin cambiar contraseña.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

disableMustChangePassword();
