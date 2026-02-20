import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const getHealthCall = {
    jsonrpc: "2.0",
    id: "health-check",
    method: "tools/call",
    params: {
        name: "get_health",
        arguments: {}
    }
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(getHealthCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
