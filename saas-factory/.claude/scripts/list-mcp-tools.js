import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const listToolsCall = {
    jsonrpc: "2.0",
    id: "list-tools",
    method: "tools/list",
    params: {}
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('list-tools')) {
        console.log('\n🛠️ HERRAMIENTAS DISPONIBLES:');
        console.log(output);
        server.kill();
        process.exit();
    }
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
