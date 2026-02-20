import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookUrl = 'https://notebooklm.google.com/notebook/e21b62dd-291e-4c1a-b396-37b0b6e8f2d5';

const addNotebookCall = {
    jsonrpc: "2.0",
    id: "add-moltbot",
    method: "tools/call",
    params: {
        name: "add_notebook",
        arguments: {
            url: notebookUrl,
            name: "Moltbot"
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
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(addNotebookCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 60000); // 1 minute to index
