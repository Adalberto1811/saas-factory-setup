import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const searchNotebooksCall = {
    jsonrpc: "2.0",
    id: "search-moltbot",
    method: "tools/call",
    params: {
        name: "search_notebooks",
        arguments: {
            query: "Moltbot"
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
    server.stdin.write(JSON.stringify(searchNotebooksCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 20000);
