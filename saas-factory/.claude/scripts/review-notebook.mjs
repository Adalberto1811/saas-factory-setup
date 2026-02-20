import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookId = "cuaderno-alineacion-socio-5";

const call = {
    jsonrpc: "2.0",
    id: "get-final",
    method: "tools/call",
    params: {
        name: "get_notebook",
        arguments: { id: notebookId }
    }
};

console.log(`🔍 Obteniendo metadatos finales: ${notebookId}`);

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

server.stdout.on('data', (data) => {
    console.log(`[STDOUT]: ${data.toString()}`);
});

server.stderr.on('data', (data) => {
    console.error(`[STDERR]: ${data.toString()}`);
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(call) + '\n');
}, 5000);

setTimeout(() => {
    console.log("⏹️ Finalizando sesión de revisión.");
    server.kill();
    process.exit();
}, 25000);
