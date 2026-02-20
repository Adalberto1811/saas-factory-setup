// Ejecutar migración para crear tabla de soporte
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        // Crear tabla de solicitudes de soporte
        await sql`
            CREATE TABLE IF NOT EXISTS pse_support_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                message TEXT NOT NULL,
                session_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                resolved_at TIMESTAMP
            )
        `;
        console.log('✅ Tabla pse_support_requests creada/verificada');

        // Crear índices
        await sql`CREATE INDEX IF NOT EXISTS idx_support_status ON pse_support_requests(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_support_created ON pse_support_requests(created_at DESC)`;
        console.log('✅ Índices creados');

        console.log('🎉 Migración completada exitosamente');
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

main();
