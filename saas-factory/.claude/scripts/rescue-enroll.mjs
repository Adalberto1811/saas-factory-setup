import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookUrls = [
    "https://notebooklm.google.com/notebook/ae122318-b36b-4aaf-a8b2-c65d7df19c1b",
    "https://notebooklm.google.com/notebook/f71bf9f8-1118-4f81-a0bd-cd7f7354a347"
];

async function enrollNotebook(url, index) {
    return new Promise((resolve) => {
        const id = `enroll-rescue-${index}`;
        const addNotebookCall = {
            jsonrpc: "2.0",
            id: id,
            method: "tools/call",
            params: {
                name: "add_notebook",
                arguments: {
                    url: url,
                    name: index === 0 ? "Orion_Design" : "Web_MCP_Docs"
                }
            }
        };

        console.log(`🔗 Matatriculando [${index}]: ${url}`);

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(id)) {
                console.log(`✅ Success: ${url}`);
                server.kill();
                resolve(true);
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(addNotebookCall) + '\n');
        }, 10000); // 10s wait

        setTimeout(() => {
            console.log(`⚠️ Timeout para ${url}`);
            server.kill();
            resolve(false);
        }, 40000);
    });
}

async function main() {
    for (let i = 0; i < notebookUrls.length; i++) {
        await enrollNotebook(notebookUrls[i], i);
    }
}

main();
