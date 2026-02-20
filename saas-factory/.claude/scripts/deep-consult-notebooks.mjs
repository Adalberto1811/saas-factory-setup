import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

async function queryNotebook(notebookId, question) {
    return new Promise((resolve) => {
        const id = `query-${notebookId}`;
        const call = {
            jsonrpc: "2.0",
            id: id,
            method: "tools/call",
            params: {
                name: "ask_question",
                arguments: {
                    notebook_id: notebookId,
                    question: question
                }
            }
        };

        console.log(`\n🧐 Interrogando a ${notebookId}...`);

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        let fullOutput = '';
        server.stdout.on('data', (data) => {
            const chunk = data.toString();
            fullOutput += chunk;
            if (chunk.includes(id)) {
                console.log(`✅ Respuesta recibida para ${notebookId}`);
                server.kill();
                resolve(fullOutput);
            }
        });

        // Simular el envio del comando tras el inicio del servidor
        setTimeout(() => {
            server.stdin.write(JSON.stringify(call) + '\n');
        }, 8000); // 8s para asegurar carga de browser

        setTimeout(() => {
            console.log(`⚠️ Timeout para ${notebookId} (90s)`);
            server.kill();
            resolve(fullOutput);
        }, 90000);
    });
}

async function main() {
    const notebooks = ['notebook-new-0', 'notebook-new-1'];
    const question = "Dime si este cuaderno se llama 'Orion Design' o trata sobre ello. Explica cómo nos ayuda en el proyecto y qué información específica contiene sobre 'Web MCP'.";

    for (const id of notebooks) {
        const result = await queryNotebook(id, question);
        console.log(`\n--- RESULTADO ${id} ---\n`);
        console.log(result);
    }
}

main();
