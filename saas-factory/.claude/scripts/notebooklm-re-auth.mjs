import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const reAuthCall = {
    jsonrpc: "2.0",
    id: "re-auth-sync",
    method: "tools/call",
    params: {
        name: "re_auth",
        arguments: {
            show_browser: true
        }
    }
};

console.log(`🔄 Iniciando sincronización re_auth...`);
console.log(`⚠️  SOCIO: Se abrirá una ventana de Chrome brevemente para refrescar la sesión.`);

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
    server.stdin.write(JSON.stringify(reAuthCall) + '\n');
}, 5000);

// Extended timeout because re_auth involves manual interaction if necessary
// or at least chromium startup/auth check.
setTimeout(() => {
    console.log("⏹️ Finalizando sesión de sincronización.");
    server.kill();
    process.exit();
}, 60000); 
