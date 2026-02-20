import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

async function askNotebook(notebookId, question, queryId) {
    return new Promise((resolve) => {
        const askCall = {
            jsonrpc: "2.0",
            id: queryId,
            method: "tools/call",
            params: {
                name: "ask_question",
                arguments: {
                    notebook_id: notebookId,
                    question: question
                }
            }
        };

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(queryId)) {
                console.log(`\n--- Respuesta de ${notebookId} ---\n`, output);
                server.kill();
                resolve();
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(askCall) + '\n');
        }, 5000);

        setTimeout(() => {
            console.log(`⚠️ Timeout para ${notebookId}`);
            server.kill();
            resolve();
        }, 60000);
    });
}

async function main() {
    const notebooks = ['notebook-new-0', 'notebook-new-1'];
    const question = "¿Qué es Orion Design, cómo nos ayuda en este proyecto y qué información hay sobre Web MCP?";

    for (const id of notebooks) {
        console.log(`🧐 Consultando cuaderno: ${id}...`);
        await askNotebook(id, question, `query-${id}`);
    }
}

main();
