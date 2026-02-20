import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookId = "cuaderno-alineacion-socio-5";

const call = {
    jsonrpc: "2.0",
    id: "literal-extract-final",
    method: "tools/call",
    params: {
        name: "ask_question",
        arguments: {
            notebook_id: notebookId,
            question: "Identifica el video de YouTube en este cuaderno y haz un resumen detallado de su contenido. Menciona: 1. Título del video. 2. Autor/Canal. 3. Los 5 puntos clave tratados."
        }
    }
};

console.log(`🔍 Extracción Literal (Intento Final): ${notebookId}`);

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

server.stdout.on('data', (data) => console.log(`[STDOUT]: ${data.toString()}`));
server.stderr.on('data', (data) => console.error(`[STDERR]: ${data.toString()}`));

setTimeout(() => {
    server.stdin.write(JSON.stringify(call) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 60000);
