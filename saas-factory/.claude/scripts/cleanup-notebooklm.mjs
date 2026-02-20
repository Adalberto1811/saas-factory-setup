import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const cleanupCall = {
    jsonrpc: "2.0",
    id: "cleanup-init",
    method: "tools/call",
    params: {
        name: "cleanup_data",
        arguments: {
            confirm: true,
            preserve_library: true
        }
    }
};

console.log('🧹 Iniciando limpieza profunda de datos de NotebookLM...');

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(cleanupCall) + '\n');
}, 3000);

server.on('exit', (code) => {
    console.log(`\n✅ Limpieza completada (Código: ${code}).`);
    process.exit();
});
