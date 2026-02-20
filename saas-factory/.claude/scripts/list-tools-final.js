import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const listToolsCall = {
    jsonrpc: "2.0",
    id: "list-tools-final",
    method: "tools/list",
    params: {}
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('list-tools-final')) {
        console.log('\n--- JSON-RPC RESPONSE ---');
        console.log(output);
        const jsonMatch = output.match(/\{"result":.*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            console.log('\n📋 LISTA REAL DE HERRAMIENTAS:');
            result.result.tools.forEach(t => console.log(`- ${t.name}`));
        }
        server.kill();
        process.exit();
    }
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
