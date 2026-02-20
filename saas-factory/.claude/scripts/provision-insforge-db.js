
import { spawn } from 'child_process';
import fs from 'fs';

const API_KEY = "ik_f6c01cd3bd7cf495eac9df2e1e58b2ee"; // Use the one that worked
const API_BASE_URL = "https://ai69pd2n.us-west.insforge.app";

const SQL_FILES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
    'auth-schema.sql',
    'init_db.sql'
];

async function runSql(sql) {
    return new Promise((resolve, reject) => {
        const child = spawn('npx', ['-y', '@insforge/mcp', '--api_key', API_KEY, '--api_base_url', API_BASE_URL], {
            shell: true
        });

        let output = '';
        const call = {
            jsonrpc: '2.0',
            id: 'run-raw-sql',
            method: 'tools/call',
            params: {
                name: 'run-raw-sql',
                arguments: { query: sql }
            }
        };

        child.stdin.write(JSON.stringify(call) + '\n');
        child.stdout.on('data', (data) => output += data.toString());
        child.on('close', () => resolve(output));
        setTimeout(() => child.stdin.end(), 5000);
    });
}

async function provision() {
    for (const file of SQL_FILES) {
        console.log(`Running ${file}...`);
        const sql = fs.readFileSync(`c:/Keys/saas-factory-setup/saas-factory/${file}`, 'utf8');
        const result = await runSql(sql);
        console.log(`Result for ${file}:`, result);
    }

    // Also add the anthropometric_records table if not in init_db
    console.log("Creating anthropometric_records table...");
    const anthroSql = `
        CREATE TABLE IF NOT EXISTS anthropometric_records (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            athlete_name TEXT,
            id_number TEXT,
            modality TEXT,
            birth_date DATE,
            gender TEXT,
            age FLOAT,
            training_stage TEXT,
            wingspan_cm FLOAT,
            bicipital_mm FLOAT,
            peroneal_mm FLOAT,
            abdomen_cm FLOAT,
            thigh_upper_cm FLOAT,
            thigh_mid_cm FLOAT,
            forearm_cm FLOAT,
            bmi FLOAT,
            bmi_percentile TEXT,
            sitting_height_cm FLOAT
        );
    `;
    await runSql(anthroSql);
    console.log("Provisioning complete.");
}

provision();
