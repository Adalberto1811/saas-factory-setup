import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const listCall = {
    jsonrpc: "2.0",
    id: "list-notebooks-final",
    method: "tools/call",
    params: {
        name: "list_notebooks",
        arguments: {}
    }
};

console.log(`🔍 Listando cuadernos registrados...`);

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
    server.stdin.write(JSON.stringify(listCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 15000);
