import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

console.log('---------------------------------------------------------');
console.log('🚀 INICIANDO BRIDGE DE AUTENTICACIÓN (V2) - INGENIERO JEFE');
console.log('---------------------------------------------------------');
console.log('1. Se abrirá una ventana de Chrome.');
console.log('2. Loguéate en tu cuenta de Google.');
console.log('3. ¡NO CIERRES EL NAVEGADOR! Deja que se cierre solo.');
console.log('4. ¡NO PRESIONES CTRL+C en esta terminal!');
console.log('---------------------------------------------------------');

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});

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

setTimeout(() => {
    console.log('\n🔧 Enviando señal de "setup_auth"...');
    server.stdin.write(JSON.stringify(setupAuthCall) + '\n');
}, 3000);

// Escuchar si el servidor termina
server.on('exit', (code) => {
    console.log(`\n✅ Proceso terminado (Código: ${code}).`);
    process.exit();
});
