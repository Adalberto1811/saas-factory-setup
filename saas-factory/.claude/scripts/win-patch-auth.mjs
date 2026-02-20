import { spawn } from 'child_process';

// FIX PARA WINDOWS: Playwright (usado por NotebookLM) requiere HOME
if (!process.env.HOME && process.env.USERPROFILE) {
    process.env.HOME = process.env.USERPROFILE;
}

console.log('---------------------------------------------------------');
console.log('🛠️  WINDOWS AUTH PATCH (V3) - INGENIERO JEFE');
console.log('---------------------------------------------------------');
console.log(`🏠 HOME: ${process.env.HOME}`);
console.log('---------------------------------------------------------');

const server = spawn('notebooklm-mcp', ['server'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
    env: process.env // Inyectar las variables de entorno corregidas
});

const setupAuthCall = {
    jsonrpc: "2.0",
    id: "patch-auth-init",
    method: "tools/call",
    params: {
        name: "setup_auth",
        arguments: {
            show_browser: true
        }
    }
};

setTimeout(() => {
    console.log('\n🔧 Enviando señal de "setup_auth" con entorno parcheado...');
    server.stdin.write(JSON.stringify(setupAuthCall) + '\n');
}, 3000);

server.on('exit', (code) => {
    console.log(`\n🔒 Proceso terminado (Código: ${code}).`);
    process.exit();
});
