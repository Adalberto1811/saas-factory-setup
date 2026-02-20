
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function audit() {
    try {
        console.log('--- TABLAS DISPONIBLES ---');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(tables.rows.map(r => r.table_name).join(', '));

        console.log('\n--- ESQUEMA push_subscriptions ---');
        try {
            const pushColumns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'push_subscriptions'");
            console.log(pushColumns.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        } catch (e) {
            console.log('Error o tabla push_subscriptions inexistente.');
        }

        console.log('\n--- USUARIOS ADALBERTO ---');
        const adalbertoUsers = await pool.query("SELECT id, email, full_name, role FROM users WHERE email ILIKE '%adalberto%'");
        console.table(adalbertoUsers.rows);

        process.exit(0);
    } catch (error) {
        console.error('Error durante la auditoría:', error);
        process.exit(1);
    }
}

audit();
