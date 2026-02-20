import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const listToolsCall = {
    jsonrpc: "2.0",
    id: "list-tools-ultimate",
    method: "tools/list",
    params: {}
};

console.log(`🛠️ Listando herramientas de ${serverCmd} (Cortesía Socio)...`);

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
    server.stdin.write(JSON.stringify(listToolsCall) + '\n');
}, 10000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 25000);
