const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixUserColumns() {
    try {
        console.log('🔄 Verificando columnas de la tabla users...');

        // Ver las columnas actuales
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `;
        const columnNames = columns.map(c => c.column_name);
        console.log('Columnas actuales:', columnNames.join(', '));

        if (!columnNames.includes('name')) {
            if (columnNames.includes('full_name')) {
                console.log('📝 Renombrando full_name a name...');
                // En lugar de renombrar, vamos a añadir 'name' por seguridad si no existe
                await sql`ALTER TABLE users ADD COLUMN name TEXT`;
                await sql`UPDATE users SET name = full_name`;
                console.log('✅ Columna name añadida y sincronizada');
            } else {
                console.log('📝 Añadiendo columna name...');
                await sql`ALTER TABLE users ADD COLUMN name TEXT`;
                console.log('✅ Columna name añadida');
            }
        }

        console.log('🚀 Esquema de users sincronizado con NextAuth');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

fixUserColumns();
