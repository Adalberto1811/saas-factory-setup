import fs from 'fs';

const N8N_API_URL = 'http://3.148.170.122:5678/api/v1/workflows';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU';

async function deploy() {
    console.log('🚀 Deploying Fixed Synergos Flow to N8N...');

    const workflowData = {
        name: "Synergos V4 - Auto-Fixed (Robust)",
        settings: {},
        nodes: [
            {
                parameters: {
                    httpMethod: "POST",
                    path: "synergos-v4-publish",
                    responseMode: "lastNode",
                    options: {}
                },
                id: "webhook-trigger",
                name: "Webhook Trigger",
                type: "n8n-nodes-base.webhook",
                typeVersion: 2,
                position: [-400, 100],
                webhookId: "synergos-v4-publish"
            },
            {
                parameters: {
                    jsCode: "const body = $input.first().json.body || $input.first().json;\nconst days = body.days || body.plan || [];\nif (days.length === 0) throw new Error('No items found in days array');\nreturn days.map((day, index) => ({\n  json: {\n    message: day.script || 'Sin texto',\n    mediaUrl: day.videoUrl || day.mediaUrl || 'https://placehold.co/1080x1080/png?text=Synergos',\n    platforms: day.platforms || ['instagram'],\n    dayLabel: day.day || `Día ${index + 1}`,\n    scheduledTime: day.scheduledTime || new Date().toISOString()\n  }\n}));"
                },
                id: "format-data",
                name: "Format Data",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [-160, 100]
            },
            {
                parameters: {
                    batchSize: 1,
                    options: {}
                },
                id: "split-loop",
                name: "Split Loop",
                type: "n8n-nodes-base.splitInBatches",
                typeVersion: 3,
                position: [80, 100]
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
                            { name: "platforms", value: "={{ $json.platforms }}" },
                            { name: "dayLabel", value: "={{ $json.dayLabel }}" },
                            { name: "scheduledTime", value: "={{ $json.scheduledTime }}" }
                        ]
                    },
                    options: {}
                },
                id: "make-bridge",
                name: "Make Bridge",
                type: "n8n-nodes-base.httpRequest",
                typeVersion: 4.2,
                position: [300, 100]
            },
            {
                parameters: { amount: 1, unit: "seconds" },
                id: "wait",
                name: "Throttle",
                type: "n8n-nodes-base.wait",
                typeVersion: 1,
                position: [500, 100]
            },
            {
                parameters: {
                    jsCode: "return [{ json: { status: 'success', message: 'Campaign Pulled Successfully to Make Bridge (V4)' } }];"
                },
                id: "final-response",
                name: "Final Response",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [300, 300]
            }
        ],
        connections: {
            "Webhook Trigger": { main: [[{ node: "Format Data", type: "main", index: 0 }]] },
            "Format Data": { main: [[{ node: "Split Loop", type: "main", index: 0 }]] },
            "Split Loop": {
                main: [
                    [{ node: "Make Bridge", type: "main", index: 0 }], // Loop
                    [{ node: "Final Response", type: "main", index: 0 }] // Done
                ]
            },
            "Make Bridge": { main: [[{ node: "Wait", type: "main", index: 0 }]] },
            "Wait": { main: [[{ node: "Split Loop", type: "main", index: 0 }]] }
        }
    };

    try {
        const response = await fetch(N8N_API_URL, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflowData)
        });

        const result = await response.json();
        if (response.ok) {
            console.log('✅ Workflow Deployed Successfully!');
            const workflowId = result.id;
            console.log('ID:', workflowId);

            // Activate it!
            console.log('⚡ Activating workflow...');
            const activateResponse = await fetch(`${N8N_API_URL}/${workflowId}/activate`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': N8N_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (activateResponse.ok) {
                console.log('🔥 Workflow is now ACTIVE!');
            } else {
                console.error('⚠️ Failed to activate:', await activateResponse.json());
            }

            console.log('Path:', workflowData.nodes[0].parameters.path);
        } else {
            console.error('❌ Failed to deploy:', result);
        }
    } catch (error) {
        console.error('❌ Error during deployment:', error);
    }
}

deploy();
