import fs from 'fs';

const N8N_API_URL = 'http://3.148.170.122:5678/api/v1/workflows';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

async function deploy() {
    console.log('🚀 Deploying V6 Production (Robust Hybrid Bridge)...');

    const workflowData = {
        name: "Synergos V6 - Production Robust",
        settings: {
            executionOrder: "v1"
        },
        nodes: [
            {
                parameters: {
                    httpMethod: "POST",
                    path: "synergos-v4-publish",
                    responseMode: "responseNode",
                    options: {}
                },
                id: "w1",
                name: "Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1.1,
                position: [0, 0],
                webhookId: "synergos-v4-publish"
            },
            {
                parameters: {
                    jsCode: "// Extract days and format\nconst body = $input.first().json.body || $input.first().json;\nconst days = body.days || [];\nif (days.length === 0) return [{ json: { error: 'No days found' } }];\n\nreturn days.map((day, index) => ({\n  json: {\n    message: day.script || day.copy || 'Sin texto',\n    mediaUrl: day.videoUrl || day.mediaUrl || 'https://placehold.co/1080x1080/png?text=Sin+Imagen',\n    platforms: ['facebook', 'instagram'],\n    day: day.day || `Day ${index + 1}`,\n    scheduledTime: day.scheduledDate || new Date().toISOString()\n  }\n}));"
                },
                id: "c1",
                name: "Format for Make",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [250, 0]
            },
            {
                parameters: {
                    batchSize: 1,
                    options: {}
                },
                id: "b1",
                name: "Split in Batches",
                type: "n8n-nodes-base.splitInBatches",
                typeVersion: 3,
                position: [450, 0]
            },
            {
                parameters: {
                    method: "POST",
                    url: "https://hook.us2.make.com/jw6us3fbxfmdt4ow6kqiq455w249tayb",
                    sendBody: true,
                    contentType: "json",
                    bodyParameters: {
                        parameters: [
                            { name: "message", value: "={{ $json.message }}" },
                            { name: "mediaUrl", value: "={{ $json.mediaUrl }}" },
                            { name: "platforms", value: "={{ JSON.stringify($json.platforms) }}" },
                            { name: "dayLabel", value: "={{ $json.day }}" },
                            { name: "scheduledTime", value: "={{ $json.scheduledTime }}" }
                        ]
                    },
                    options: {}
                },
                id: "h1",
                name: "Send to Make",
                type: "n8n-nodes-base.httpRequest",
                typeVersion: 4.2,
                position: [650, 0]
            },
            {
                parameters: {
                    amount: 2,
                    unit: "seconds"
                },
                id: "wa1",
                name: "Throttle",
                type: "n8n-nodes-base.wait",
                typeVersion: 1,
                position: [850, 0],
                webhookId: "throttle-wait"
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: "{\"status\":\"success\", \"message\": \"Campaign published to Hybrid Bridge\"}",
                    options: {}
                },
                id: "r1",
                name: "Response Success",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1.4,
                position: [1050, 200]
            }
        ],
        connections: {
            "Webhook": { main: [[{ node: "Format for Make", type: "main", index: 0 }]] },
            "Format for Make": { main: [[{ node: "Split in Batches", type: "main", index: 0 }]] },
            "Split in Batches": { main: [[{ node: "Send to Make", type: "main", index: 0 }]] },
            "Send to Make": { main: [[{ node: "Throttle", type: "main", index: 0 }]] },
            "Throttle": { main: [[{ node: "Split in Batches", type: "main", index: 0 }]] },
            "Split in Batches": { main: [[], [{ node: "Response Success", type: "main", index: 0 }]] }
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
            console.log('🚀 DEPLOYED AND ACTIVATED V6 PRODUCTION');
        } else { console.error('❌ Error:', result); }
    } catch (e) { console.error('❌ Error:', e); }
}
deploy();
