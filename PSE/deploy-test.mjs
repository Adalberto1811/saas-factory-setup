import fs from 'fs';

const N8N_API_URL = 'http://3.148.170.122:5678/api/v1/workflows';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

async function deploy() {
    console.log('🧪 Deploying Minimal Test Flow to N8N...');

    const workflowData = {
        name: "Synergos - Webhook Test (Minimal)",
        settings: {},
        nodes: [
            {
                parameters: {
                    httpMethod: "POST",
                    path: "synergos-test-link",
                    responseMode: "lastNode",
                    options: {}
                },
                id: "test-webhook",
                name: "Test Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [-400, 100],
                webhookId: "synergos-test-link"
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: "{\"status\":\"ok\",\"message\":\"Webhook is LIVE!\"}",
                    options: {}
                },
                id: "test-response",
                name: "Test Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [-100, 100]
            }
        ],
        connections: {
            "Test Webhook": { main: [[{ node: "Test Response", type: "main", index: 0 }]] }
        }
    };

    try {
        const response = await fetch(N8N_API_URL, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowData)
        });

        const result = await response.json();
        if (response.ok) {
            const workflowId = result.id;
            console.log('✅ Created ID:', workflowId);
            const act = await fetch(`${N8N_API_URL}/${workflowId}/activate`, { method: 'POST', headers: { 'X-N8N-API-KEY': N8N_API_KEY } });
            if (act.ok) console.log('🔥 ACTIVE!');
        } else {
            console.error('❌ Error:', result);
        }
    } catch (error) { console.error('❌ Error:', error); }
}
deploy();
