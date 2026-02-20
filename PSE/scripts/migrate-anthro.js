const { Client } = require('pg');

async function verifyAndMigrate() {
    const connectionString = 'postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("Conectado a Neon DB...");

        // Check if table exists
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'anthropometric_records'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log("Creando tabla anthropometric_records...");
            await client.query(`
        CREATE TABLE anthropometric_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          date DATE NOT NULL,
          athlete_name TEXT,
          birth_date DATE,
          modality TEXT,
          id_number TEXT,
          gender TEXT,
          age NUMERIC,
          training_stage TEXT,
          weight_kg NUMERIC NOT NULL,
          height_cm NUMERIC NOT NULL,
          sitting_height_cm NUMERIC,
          wingspan_cm NUMERIC,
          triceps_mm NUMERIC NOT NULL,
          subscapular_mm NUMERIC NOT NULL,
          biceps_mm NUMERIC NOT NULL,
          bicipital_mm NUMERIC,
          iliac_crest_mm NUMERIC NOT NULL,
          supraspinale_mm NUMERIC NOT NULL,
          abdominal_mm NUMERIC NOT NULL,
          front_thigh_mm NUMERIC NOT NULL,
          medial_calf_mm NUMERIC NOT NULL,
          peroneal_mm NUMERIC,
          arm_relaxed_cm NUMERIC NOT NULL,
          arm_flexed_cm NUMERIC NOT NULL,
          waist_cm NUMERIC NOT NULL,
          abdomen_cm NUMERIC,
          hip_cm NUMERIC NOT NULL,
          thigh_cm NUMERIC,
          thigh_upper_cm NUMERIC,
          thigh_mid_cm NUMERIC,
          calf_cm NUMERIC NOT NULL,
          forearm_cm NUMERIC,
          humerus_cm NUMERIC NOT NULL,
          femur_cm NUMERIC NOT NULL,
          fat_percentage NUMERIC,
          muscle_mass_kg NUMERIC,
          bmi NUMERIC,
          bmi_percentile TEXT,
          somatotype JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log("Tabla creada exitosamente.");
        } else {
            console.log("Verificando columnas adicionales...");
            const columnsToAdd = [
                { name: 'athlete_name', type: 'TEXT' },
                { name: 'birth_date', type: 'DATE' },
                { name: 'modality', type: 'TEXT' },
                { name: 'id_number', type: 'TEXT' }
            ];

            for (const col of columnsToAdd) {
                const colCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'anthropometric_records' AND column_name = $1
        `, [col.name]);

                if (colCheck.rowCount === 0) {
                    console.log(`Agregando columna ${col.name}...`);
                    await client.query(`ALTER TABLE anthropometric_records ADD COLUMN ${col.name} ${col.type}`);
                }
            }
            console.log("Columnas verificadas.");
        }

    } catch (err) {
        console.error("Error durante la migración:", err);
    } finally {
        await client.end();
    }
}

verifyAndMigrate();
