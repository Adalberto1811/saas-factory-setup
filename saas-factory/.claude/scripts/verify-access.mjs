import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const listNotebooksCall = {
    jsonrpc: "2.0",
    id: "list-nb",
    method: "tools/call",
    params: {
        name: "list_notebooks",
        arguments: {}
    }
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    if (output.includes('result') || output.includes('notebooks')) {
        console.log('\n🌟 ¡VERIFICACIÓN EXITOSA! Puedo ver tus cuadernos.');
    }
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(listNotebooksCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 25000);
