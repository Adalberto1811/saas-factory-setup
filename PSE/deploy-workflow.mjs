// Native fetch is used (Node 18+)
import fs from 'fs/promises';
import path from 'path';

// Load credentials from environment or hardcoded fallback (from CENTRAL VAULT)
const N8N_URL = process.env.N8N_API_URL || 'http://3.148.170.122:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

async function deployWorkflow(filename, existingId = null) {
    try {
        const filePath = path.resolve(process.cwd(), filename);
        const workflowData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        // Harmonize workflow structure
        // If wrapping in { "workflow": ... }, extract it
        const workflow = workflowData.workflow || workflowData;

        const WORKFLOW_NAME = workflow.name;
        console.log(`🚀 Deploying: ${WORKFLOW_NAME} from ${filename}...`);

        // 1. Check if workflow exists (by name or ID)
        let targetId = existingId || workflow.id;

        if (!targetId) {
            // Search by name
            const searchRes = await fetch(`${N8N_URL}/api/v1/workflows?limit=100`, {
                headers: { 'X-N8N-API-KEY': N8N_API_KEY }
            });
            const searchData = await searchRes.json();
            const existing = searchData.data.find(w => w.name === WORKFLOW_NAME);
            if (existing) {
                targetId = existing.id;
                console.log(`   Found existing workflow ID: ${targetId}`);
            }
        }

        // 2. Import (Create or Update)
        let url = `${N8N_URL}/api/v1/workflows`;
        let method = 'POST';

        if (targetId) {
            url = `${N8N_URL}/api/v1/workflows/${targetId}`;
            method = 'PUT';
        }

        // Clean up payload (remove ID from body to avoid conflicts if creating new)
        // REMOVED 'active' field as it triggers 400 read-only error on PUT
        const payload = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings || { executionOrder: 'v1' }, // Ensure settings exists
        };

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to deploy: ${res.status} ${res.statusText} - ${err}`);
        }

        const result = await res.json();
        console.log(`✅ Success! Workflow ID: ${result.id} is now ACTIVE.`);
        console.log(`   Webhook URL: ${N8N_URL}/webhook/${result.id} (or specific path)`);

        // 3. Activate Workflow
        const activateRes = await fetch(`${N8N_URL}/api/v1/workflows/${result.id}/activate`, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });

        if (activateRes.ok) {
            console.log(`⚡ Workflow activated successfully.`);
        } else {
            console.warn(`⚠️ Warning: Could not activate workflow automatically.`);
        }

        return result.id;

    } catch (error) {
        console.error(`❌ Error deploying ${filename}:`, error.message);
    }
}

// MAIN EXECUTION
(async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: node deploy-workflow.mjs <workflow-file.json> [existing-id]");
        process.exit(1);
    }

    await deployWorkflow(args[0], args[1]);
})();
