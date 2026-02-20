import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

async function tryTool(name, params) {
    return new Promise((resolve) => {
        const call = {
            jsonrpc: "2.0",
            id: `try-${name}`,
            method: "tools/call",
            params: {
                name: name,
                arguments: params
            }
        };

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        let captured = false;
        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(`try-${name}`)) {
                console.log(`\nTool ${name}:`, output);
                captured = true;
                server.kill();
                resolve(output);
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(call) + '\n');
        }, 3000);

        setTimeout(() => {
            if (!captured) {
                console.log(`\nTool ${name}: Timed out`);
                server.kill();
                resolve(null);
            }
        }, 10000);
    });
}

async function main() {
    const notebook_id = "bec8d84b-59be-47bf-aeb0-ac2933e8bad1";
    await tryTool("query_notebook", { notebook_id, query: "hola" });
    await tryTool("ask_notebook", { notebook_id, question: "hola" });
    await tryTool("get_notebook", { notebook_id });
}

main();
