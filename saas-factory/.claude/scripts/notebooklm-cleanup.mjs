import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const cleanupCall = {
    jsonrpc: "2.0",
    id: "cleanup-deep",
    method: "tools/call",
    params: {
        name: "cleanup_data",
        arguments: {
            confirm: true,
            preserve_library: true
        }
    }
};

console.log(`🧹 Ejecutando limpieza profunda (Deep Cleanup)...`);

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
    server.stdin.write(JSON.stringify(cleanupCall) + '\n');
}, 5000);

setTimeout(() => {
    console.log("⏹️ Limpieza completada.");
    server.kill();
    process.exit();
}, 20000);
