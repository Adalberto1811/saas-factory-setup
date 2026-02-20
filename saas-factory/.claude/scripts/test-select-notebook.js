import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const selectNotebookCall = {
    jsonrpc: "2.0",
    id: "select-notebook",
    method: "tools/call",
    params: {
        name: "select_notebook",
        arguments: {
            notebook_id: "bec8d84b-59be-47bf-aeb0-ac2933e8bad1"
        }
    }
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    if (output.includes('select-notebook')) {
        console.log('\n🎯 INTENTO DE SELECCIÓN COMPLETADO.');
        server.kill();
        process.exit();
    }
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(selectNotebookCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
