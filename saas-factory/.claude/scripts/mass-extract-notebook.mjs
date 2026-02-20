import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookId = "cuaderno-alineacion-socio-5";

async function runCommand(method, params, id) {
    return new Promise((resolve) => {
        const server = spawn(serverCmd, ['server'], { stdio: ['pipe', 'pipe', 'pipe'], shell: true });
        let stdout = '';

        server.stdout.on('data', (d) => stdout += d.toString());

        setTimeout(() => {
            server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params }) + '\n');
        }, 5000);

        setTimeout(() => {
            server.kill();
            resolve(stdout);
        }, 20000);
    });
}

async function main() {
    console.log("📂 Intentando lectura de fuentes crudas...");

    // El servidor puede no tener 'list_sources', pero 'get_notebook' a veces devuelve el conteo de fuentes
    // Intentaremos leer fuentes por índice (0, 1, 2) para ver qué hay
    for (let i = 0; i < 3; i++) {
        console.log(`--- Intentando Fuente ${i} ---`);
        const result = await runCommand("tools/call", {
            name: "read_notebook_source",
            arguments: { notebook_id: notebookId, source_index: i }
        }, `read-source-${i}`);
        console.log(result);
    }
}

main();
