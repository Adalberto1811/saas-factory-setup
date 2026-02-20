import { spawn } from 'child_process';

console.log('---------------------------------------------------------');
console.log('🚀 MOTOR DE LOGIN ULTRA-AGRESIVO - INGENIERO JEFE');
console.log('---------------------------------------------------------');

const server = spawn('notebooklm-mcp', ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

// Solo enviar el comando UNA VEZ para evitar spam de pestañas
setTimeout(() => {
    console.log('📡 Enviando señal de apertura de navegador (Intento Único)...');
    const setupAuthCall = {
        jsonrpc: "2.0",
        id: "auth-init",
        method: "tools/call",
        params: {
            name: "setup_auth",
            arguments: {
                show_browser: true
            }
        }
    };
    server.stdin.write(JSON.stringify(setupAuthCall) + '\n');
}, 3000);

server.stdout.on('data', (data) => {
    const output = data.toString();
    // Solo imprimir mensajes importantes del servidor
    if (output.includes('authenticated": true')) {
        console.log('\n✅ ¡LLAVES CAPTURADAS! Sesión guardada.');
        server.kill();
        process.exit(0);
    }

    if (output.includes('Setup failed') || output.includes('Authentication failed')) {
        console.log('\n❌ Fallo en el intento. Mantén la terminal abierta, reintentando...');
    }
});

console.log('👉 Si no sale nada en 10 segundos, dale ENTER a la terminal.');
console.log('👉 Busca la ventana de Chrome y loguéate.');
console.log('---------------------------------------------------------');
