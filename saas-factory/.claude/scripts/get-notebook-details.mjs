import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

async function getNotebook(notebookId, queryId) {
    return new Promise((resolve) => {
        const getCall = {
            jsonrpc: "2.0",
            id: queryId,
            method: "tools/call",
            params: {
                name: "get_notebook",
                arguments: {
                    notebook_id: notebookId
                }
            }
        };

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        const outputData = [];
        server.stdout = spawn(serverCmd, ['server'], { shell: true }).stdout; // Redirect stdout specifically

        // Re-implementing with proper pipe management
    });
}

// Actually, let's use a simpler approach for a one-off script
import fs from 'fs';

async function main() {
    const notebooks = ['notebook-new-0', 'notebook-new-1'];

    for (const id of notebooks) {
        console.log(`📦 Obteniendo detalles de: ${id}...`);
        const call = {
            jsonrpc: "2.0",
            id: `get-${id}`,
            method: "tools/call",
            params: {
                name: "get_notebook",
                arguments: { id: id }
            }
        };

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        server.stdout.on('data', (data) => {
            const out = data.toString();
            if (out.includes(`get-${id}`)) {
                console.log(`\n--- Detalles de ${id} ---\n`, out);
                server.kill();
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(call) + '\n');
        }, 5000);

        await new Promise(r => setTimeout(r, 15000));
        server.kill();
    }
}

main();
