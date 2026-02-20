// Setup N8N Postgres Credential
import fetch from 'node-fetch';

const N8N_URL = 'http://3.148.170.122:5678';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

// Credentials from init_db.js
const DB_CONFIG = {
    user: 'neondb_owner',
    password: 'npg_yE0Ba8lFSdTb',
    host: 'ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech',
    database: 'neondb',
    port: 5432
};

async function createCredential() {
    console.log('🚀 Creating Postgres Credential in N8N...');

    // Final Attempt: Provide ALL fields to satisfy "allOf" schema validator.
    // The error says "request.body.data requires property sshAuthenticateWith" etc.
    // This happens when N8N schema uses 'oneOf' or 'allOf' and the validator gets confused or defaults to the complex branch.
    // We explicitly disable SSH to guide it.

    const payload = {
        name: 'Neon DB Fixed',
        type: 'postgres',
        data: {
            host: DB_CONFIG.host,
            database: DB_CONFIG.database,
            user: DB_CONFIG.user,
            password: DB_CONFIG.password,
            port: 5432,
            ssl: 'require',

            // Strict Schema Satisfaction
            sshAuthenticateWith: 'password', // 'none' was rejected
            sshHost: '',
            sshPort: 22,
            sshUser: '',
            sshPassword: '',
            privateKey: '',
            passphrase: ''
        }
    };

    try {
        const res = await fetch(`${N8N_URL}/api/v1/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error('Error creating credential:', txt);
            return null;
        }

        const json = await res.json();
        console.log('✅ Credential Created! ID:', json.id);
        return json.id;

    } catch (e) {
        console.error('Network error:', e);
    }
}

async function updateWorkflowFile(credId) {
    if (!credId) return;

    const fs = await import('fs/promises');
    const path = await import('path');

    const workflowPath = path.resolve(process.cwd(), 'agentsyn-workflow-crm.json');
    let workflow = await fs.readFile(workflowPath, 'utf8');

    // Replace valid-like placeholders or the previous ID
    const updated = workflow.replace(/"id": "[^"]*"/g, (match) => {
        if (match.includes("postgres") || match.includes("Neon")) return `"id": "${credId}"`;
        return match;
    });

    await fs.writeFile(workflowPath, updated);
    console.log('✅ Workflow JSON updated with real Credential ID.');
}

(async () => {
    const credId = await createCredential();
    if (credId) {
        await updateWorkflowFile(credId);
        console.log('👉 Now run deploy-workflow.mjs again!');
    }
})();
