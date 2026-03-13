
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Esta es una ruta de emergencia para rescatar los datos de Neon e insertarlos en InsForge.
// Una vez completado, DEBE ser eliminada o deshabilitada.

const NEON_SOURCE_URL = 'postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const INSFORGE_DEST_URL = process.env.DATABASE_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Simple protección por query param
    if (secret !== 'socio-boss-rescue-2026') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!INSFORGE_DEST_URL) {
        return NextResponse.json({ error: 'DATABASE_URL no configurada en el destino' }, { status: 500 });
    }

    const sqlSource = neon(NEON_SOURCE_URL);
    const sqlDest = neon(INSFORGE_DEST_URL);

    try {
        console.log("Iniciando rescate de datos...");
        
        // Test connections
        try {
            await sqlSource`SELECT 1`;
        } catch (e: any) {
            return NextResponse.json({ error: 'Fallo al conectar con NEON SOURCE', detail: e.message }, { status: 500 });
        }

        try {
            await sqlDest`SELECT 1`;
        } catch (e: any) {
            return NextResponse.json({ error: 'Fallo al conectar con INSFORGE DEST (DATABASE_URL)', detail: e.message }, { status: 500 });
        }

        // 1. Rescatar Usuarios
        const users = await sqlSource`SELECT * FROM users`;
        console.log(`Rescatando ${users.length} usuarios...`);

        for (const user of users) {
             await sqlDest`
                INSERT INTO users (id, name, email, email_verified, image, role, referral_code)
                VALUES (${user.id}, ${user.name}, ${user.email}, ${user.email_verified}, ${user.image}, ${user.role}, ${user.referral_code})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role;
            `;
        }

        // 2. Rescatar Antropometría
        let anthroRecords: any[] = [];
        try {
            anthroRecords = await sqlSource`SELECT * FROM anthropometric_records`;
        } catch (e) {
            console.log("Tabla anthropometric_records no encontrada en origen, saltando...");
        }

        console.log(`Rescatando ${anthroRecords.length} registros antropométricos...`);

        for (const record of anthroRecords) {
            await sqlDest`
                INSERT INTO anthropometric_records (
                    id, user_id, date, athlete_name, birth_date, modality, id_number, 
                    gender, age, training_stage, weight_kg, height_cm, sitting_height_cm, 
                    wingspan_cm, triceps_mm, subscapular_mm, biceps_mm, bicipital_mm, 
                    iliac_crest_mm, supraspinale_mm, abdominal_mm, front_thigh_mm, 
                    medial_calf_mm, peroneal_mm, arm_relaxed_cm, arm_flexed_cm, 
                    waist_cm, abdomen_cm, hip_cm, thigh_cm, thigh_upper_cm, 
                    thigh_mid_cm, calf_cm, forearm_cm, humerus_cm, femur_cm, 
                    fat_percentage, muscle_mass_kg, bmi, bmi_percentile, somatotype
                ) VALUES (
                    ${record.id}, ${record.user_id}, ${record.date}, ${record.athlete_name}, ${record.birth_date}, ${record.modality}, ${record.id_number},
                    ${record.gender}, ${record.age}, ${record.training_stage}, ${record.weight_kg}, ${record.height_cm}, ${record.sitting_height_cm},
                    ${record.wingspan_cm}, ${record.triceps_mm}, ${record.subscapular_mm}, ${record.biceps_mm}, ${record.bicipital_mm},
                    ${record.iliac_crest_mm}, ${record.supraspinale_mm}, ${record.abdominal_mm}, ${record.front_thigh_mm},
                    ${record.medial_calf_mm}, ${record.peroneal_mm}, ${record.arm_relaxed_cm}, ${record.arm_flexed_cm},
                    ${record.waist_cm}, ${record.abdomen_cm}, ${record.hip_cm}, ${record.thigh_cm}, ${record.thigh_upper_cm},
                    ${record.thigh_mid_cm}, ${record.calf_cm}, ${record.forearm_cm}, ${record.humerus_cm}, ${record.femur_cm},
                    ${record.fat_percentage}, ${record.muscle_mass_kg}, ${record.bmi}, ${record.bmi_percentile}, ${record.somatotype}
                ) ON CONFLICT (id) DO NOTHING;
            `;
        }

        return NextResponse.json({ 
            success: true, 
            message: "Rescate completado", 
            users_migrated: users.length, 
            anthro_migrated: anthroRecords.length 
        });

    } catch (error: any) {
        console.error("Fallo durante el rescate:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
