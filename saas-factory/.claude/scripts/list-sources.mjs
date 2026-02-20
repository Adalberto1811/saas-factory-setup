import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookId = "cuaderno-alineacion-socio-5";

const listSourcesCall = {
    jsonrpc: "2.0",
    id: "list-sources-test",
    method: "tools/call",
    params: {
        name: "list_sources",
        arguments: {
            notebook_id: notebookId
        }
    }
};

console.log(`🔍 Listando fuentes del cuaderno: ${notebookId}`);

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
    server.stdin.write(JSON.stringify(listSourcesCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
