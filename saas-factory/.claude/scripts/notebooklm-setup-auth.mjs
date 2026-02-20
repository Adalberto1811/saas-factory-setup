import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const authCall = {
    jsonrpc: "2.0",
    id: "setup-auth-fresh",
    method: "tools/call",
    params: {
        name: "setup_auth",
        arguments: {
            show_browser: true
        }
    }
};

console.log(`🔄 Iniciando setup_auth fresco...`);
console.log(`⚠️  SOCIO: Se abrirá una VENTANA LIMPIA de Chrome. Por favor inicia sesión.`);

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
    server.stdin.write(JSON.stringify(authCall) + '\n');
}, 5000);

setTimeout(() => {
    console.log("⏹️ Finalizando sesión de autenticación.");
    server.kill();
    process.exit();
}, 60000); 
