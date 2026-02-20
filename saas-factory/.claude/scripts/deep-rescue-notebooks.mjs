import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const serverCmd = 'notebooklm-mcp';

async function askQuestion(notebookId, question, logPath) {
    return new Promise((resolve) => {
        console.log(`📡 Consultando cuaderno: ${notebookId}...`);
        const server = spawn(serverCmd, ['server'], { stdio: ['pipe', 'pipe', 'pipe'], shell: true });
        let fullOutput = '';

        server.stdout.on('data', (d) => {
            const chunk = d.toString();
            fullOutput += chunk;
            // Escribir incrementalmente para no perder nada si hay crash
            writeFileSync(logPath, fullOutput);
        });

        setTimeout(() => {
            const call = {
                jsonrpc: "2.0",
                id: `final-${notebookId}`,
                method: "tools/call",
                params: {
                    name: "ask_question",
                    arguments: {
                        notebook_id: notebookId,
                        question: question
                    }
                }
            };
            server.stdin.write(JSON.stringify(call) + '\n');
            console.log(`📤 Enviado a ${notebookId}. Revisando buffer...`);
        }, 10000);

        setTimeout(() => {
            server.kill();
            resolve();
        }, 150000); // 2.5 minutos para ser ultra seguro
    });
}

async function main() {
    const logDir = 'c:\\Keys\\saas-factory-setup\\saas-factory\\.claude\\scripts';

    console.log("🦾 RESCATE FINAL: Captura de Buffer Directa...");

    // 1. Orion_Design
    await askQuestion("notebook-new-0", "Haz un resumen técnico de Orion Design y su integración con MCP. Sé literal.", join(logDir, 'orion_raw.json'));

    // 2. Web_MCP_Docs
    await askQuestion("notebook-new-1", "Haz un resumen técnico de Web MCP y sus protocolos de seguridad. Sé literal.", join(logDir, 'mcp_raw.json'));

    console.log("🏁 Proceso terminado. Revisa los archivos .json para ver el resultado.");
}

main();
