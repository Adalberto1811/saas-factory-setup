import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localProfile = path.join(process.cwd(), '.claude', 'notebooklm_temp_profile');

// FIX PARA WINDOWS EXTREMO
if (!process.env.HOME && process.env.USERPROFILE) {
    process.env.HOME = process.env.USERPROFILE;
}

console.log('---------------------------------------------------------');
console.log('☢️  NOTEBOOKLM NUCLEAR AUTH (V3) - INGENIERO JEFE');
console.log('---------------------------------------------------------');
console.log(`🏠 Entorno: ${process.env.HOME}`);
console.log(`📁 Perfil Local: ${localProfile}`);
console.log('---------------------------------------------------------');

const server = spawn('notebooklm-mcp', ['server'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
    env: {
        ...process.env,
        // Forzar a NotebookLM a usar una ruta local limpia si fuera posible, 
        // aunque el MCP suele usar su propia ruta hardcodeada. 
        // Intentaremos inyectar el comando de auth con persistencia off si falla.
    }
});

const setupAuthCall = {
    jsonrpc: "2.0",
    id: "nuclear-auth-init",
    method: "tools/call",
    params: {
        name: "setup_auth",
        arguments: {
            show_browser: true
        }
    }
};

setTimeout(() => {
    console.log('\n🚀 Lanzando secuencia de autenticación...');
    server.stdin.write(JSON.stringify(setupAuthCall) + '\n');
}, 4000);

server.on('exit', (code) => {
    console.log(`\n🏁 Proceso cerrado (Código: ${code}).`);
    process.exit();
});

// Capturar errores de spawn
server.on('error', (err) => {
    console.error(`\n❌ Error al lanzar el servidor: ${err.message}`);
});
