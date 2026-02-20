import fs from 'fs';

const N8N_API_URL = 'http://3.148.170.122:5678/api/v1/workflows';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

async function deploy() {
    console.log('🧪 Deploying V5 Ultra-Minimal...');

    const workflowData = {
        name: "Synergos V5 - Minimal Test",
        settings: {},
        nodes: [
            {
                parameters: {
                    httpMethod: "POST",
                    path: "synergos-v5",
                    responseMode: "responseNode",
                    options: {}
                },
                id: "w1",
                name: "Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1.1,
                position: [0, 0],
                webhookId: "synergos-v5"
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: "{\"msg\":\"V5 LIVE - ACTIVATED\"}",
                    options: {}
                },
                id: "r1",
                name: "Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1.4,
                position: [200, 0]
            }
        ],
        connections: {
            "Webhook": { main: [[{ node: "Response", type: "main", index: 0 }]] }
        }
    };

    try {
        const resp = await fetch(N8N_API_URL, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowData)
        });
        const result = await resp.json();
        if (resp.ok) {
            console.log('✅ ID:', result.id);
            await fetch(`${N8N_API_URL}/${result.id}/activate`, { method: 'POST', headers: { 'X-N8N-API-KEY': N8N_API_KEY } });
            console.log('🚀 DEPLOYED AND ACTIVATED V5');
        } else { console.error('❌ Error:', result); }
    } catch (e) { console.error('❌ Error:', e); }
}
deploy();
