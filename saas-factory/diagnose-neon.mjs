import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function diagnose() {
    console.log("🔍 DIAGNÓSTICO NEON DATABASE - PSE Coach\n");
    console.log("=" .repeat(50));

    // 1. Conexión básica
    try {
        const result = await sql`SELECT NOW() as server_time, current_database() as db_name`;
        console.log("✅ CONEXIÓN: OK");
        console.log(`   Hora servidor: ${result[0].server_time}`);
        console.log(`   Base de datos: ${result[0].db_name}`);
    } catch (e) {
        console.log(`❌ CONEXIÓN FALLIDA: ${e.message}`);
        process.exit(1);
    }

    // 2. Tablas existentes
    console.log("\n📋 TABLAS EN LA BASE DE DATOS:");
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `;
        tables.forEach(t => console.log(`   📄 ${t.table_name}`));
        console.log(`   Total: ${tables.length} tablas`);
    } catch (e) {
        console.log(`❌ ERROR listando tablas: ${e.message}`);
    }

    // 3. Tabla users
    console.log("\n👥 TABLA USERS:");
    try {
        const users = await sql`SELECT id, full_name, email, role, created_at FROM users ORDER BY id LIMIT 20`;
        if (users.length === 0) {
            console.log("   ⚠️ TABLA VACÍA - No hay usuarios");
        } else {
            users.forEach(u => console.log(`   [${u.id}] ${u.full_name || '(sin nombre)'} | ${u.email} | rol: ${u.role || 'user'}`));
        }
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
        // Try alternative column names
        try {
            const cols = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'public'
                ORDER BY ordinal_position
            `;
            console.log("   Columnas de users:");
            cols.forEach(c => console.log(`      ${c.column_name} (${c.data_type})`));
        } catch (e2) {
            console.log(`   ❌ Tabla 'users' NO EXISTE: ${e2.message}`);
        }
    }

    // 4. Tabla pse_training_plans
    console.log("\n🏋️ TABLA PSE_TRAINING_PLANS:");
    try {
        const plans = await sql`SELECT id, user_id, is_active, created_at FROM pse_training_plans ORDER BY created_at DESC LIMIT 10`;
        if (plans.length === 0) {
            console.log("   ⚠️ TABLA VACÍA");
        } else {
            plans.forEach(p => console.log(`   [${p.id}] user:${p.user_id} activo:${p.is_active} creado:${p.created_at}`));
        }
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
    }

    // 5. Tabla pse_microcycles
    console.log("\n📅 TABLA PSE_MICROCYCLES:");
    try {
        const mc = await sql`SELECT id, plan_id, numero_semana, created_at FROM pse_microcycles ORDER BY created_at DESC LIMIT 10`;
        if (mc.length === 0) {
            console.log("   ⚠️ TABLA VACÍA");
        } else {
            mc.forEach(m => console.log(`   [${m.id}] plan:${m.plan_id} semana:${m.numero_semana} creado:${m.created_at}`));
        }
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
    }

    // 6. Tabla anthropometric_records
    console.log("\n📏 TABLA ANTHROPOMETRIC_RECORDS:");
    try {
        const records = await sql`SELECT id, user_id, athlete_name, created_at FROM anthropometric_records ORDER BY created_at DESC LIMIT 5`;
        if (records.length === 0) {
            console.log("   ⚠️ TABLA VACÍA");
        } else {
            records.forEach(r => console.log(`   [${r.id}] user:${r.user_id} atleta:${r.athlete_name} creado:${r.created_at}`));
        }
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
    }

    // 7. Tabla pse_support_requests
    console.log("\n🆘 TABLA PSE_SUPPORT_REQUESTS:");
    try {
        const sr = await sql`SELECT COUNT(*) as total FROM pse_support_requests`;
        console.log(`   Total solicitudes: ${sr[0].total}`);
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
    }

    // 8. Tabla pse_activity_log
    console.log("\n📊 TABLA PSE_ACTIVITY_LOG:");
    try {
        const al = await sql`SELECT event_type, COUNT(*) as total FROM pse_activity_log GROUP BY event_type ORDER BY total DESC`;
        if (al.length === 0) {
            console.log("   ⚠️ TABLA VACÍA");
        } else {
            al.forEach(a => console.log(`   ${a.event_type}: ${a.total}`));
        }
    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
    }

    // 9. Tabla subscriptions
    console.log("\n💳 TABLA SUBSCRIPTIONS:");
    try {
        const subs = await sql`SELECT COUNT(*) as total FROM subscriptions`;
        console.log(`   Total suscripciones: ${subs[0].total}`);
    } catch (e) {
        console.log(`   ❌ ERROR/NO EXISTE: ${e.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🏁 DIAGNÓSTICO COMPLETO");
}

diagnose().catch(e => {
    console.error("💀 ERROR FATAL:", e.message);
    process.exit(1);
});
