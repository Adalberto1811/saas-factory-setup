const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setSimplePassword() {
    const newPassword = 'admin2026';  // Contraseña simple, sin caracteres especiales
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const result = await sql`
        UPDATE users 
        SET password_hash = ${passwordHash},
            must_change_password = false
        WHERE email = 'admin@performanceswimming.online'
        RETURNING id, email
    `;

    console.log('✅ Contraseña cambiada a: admin2026');
    console.log('Usuario:', result[0]);
}

setSimplePassword().catch(console.error);
