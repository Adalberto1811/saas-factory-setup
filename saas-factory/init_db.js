const { Client } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function init() {
    const client = new Client({
        connectionString: DATABASE_URL
    });

    try {
        console.log('🔄 Conectando a Neon DB...');
        await client.connect();

        console.log('🔄 Leyendo init_db.sql...');
        const sql = fs.readFileSync('init_db.sql', 'utf8');

        console.log('🔄 Ejecutando migraciones...');
        await client.query(sql);

        console.log('✅ Base de datos de Memoria Agéntica inicializada correctamente.');
    } catch (err) {
        console.error('❌ Error inicializando DB:', err);
    } finally {
        await client.end();
    }
}

init();
