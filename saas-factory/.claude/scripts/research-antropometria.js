import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

async function research() {
    // We'll use notebook-0 as the primary source, but we could loop if needed.
    const notebookId = "notebook-0";

    const queryCall = {
        jsonrpc: "2.0",
        id: "research-anthro-v2",
        method: "tools/call",
        params: {
            name: "ask_question",
            arguments: {
                notebook_id: notebookId,
                question: "Basado en este cuaderno, extrae los protocolos técnicos de antropometría (ISAK):\n1. Fórmulas de Grasa Corporal (Faulkner, etc).\n2. Fórmulas de Masa Muscular.\n3. Lista de las 21 medidas estándar.\n4. Cálculo del Somatotipo (Ecuaciones de Heath-Carter).\nResponde de forma estructurada para implementarlo en un dashboard de Next.js."
            }
        }
    };

    const server = spawn(serverCmd, ['server'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: true
    });

    server.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output);
        if (output.includes('research-anthro-v2')) {
            console.log('\n📊 DATOS EXTRAÍDOS CON ÉXITO.');
            server.kill();
            process.exit();
        }
    });

    setTimeout(() => {
        server.stdin.write(JSON.stringify(queryCall) + '\n');
    }, 5000);

    setTimeout(() => {
        server.kill();
        process.exit();
    }, 120000);
}

research();
